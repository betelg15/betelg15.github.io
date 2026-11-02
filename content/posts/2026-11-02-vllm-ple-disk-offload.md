---
title: "51B 룩업 표를 VRAM에 안 올려도 된다? vLLM의 Qwen PLE 디스크 오프로드 팩트 체크"
date: 2026-11-02
slug: vllm-ple-disk-offload
tags: [vLLM, Qwen, PLE, 추론, 팩트체크]
summary: "Qwen3.8-Flash-Next의 51B n-gram 표를 safetensors에 둔 채 필요한 행만 읽는 vLLM disk_offload를, 모델 카드·기술 보고서·머지된 PR과 한 줄씩 대조했습니다."
---

> 이 글은 북마크해 둔 [@Tono_Ken3의 포스트](https://x.com/Tono_Ken3/status/2116739686354108721)와, 그 글이 인용한 [@TeksEdge의 포스트](https://x.com/TeksEdge/status/2116704279754948720)를 계기로 쓴 것입니다. 포스트 문장은 검증할 주장으로만 다뤘고, 근거는 [Qwen 모델 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next), [기술 보고서](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf), [vLLM `engram.md`(main)](https://github.com/vllm-project/vllm/blob/main/docs/features/engram.md), 머지된 [PR #59958](https://github.com/vllm-project/vllm/pull/59958)입니다.

## 왜 이 변경이 서빙에 중요한가

Qwen3.8-Flash-Next는 토큰마다 켜지는 계산(백본 125B 중 약 6B) 옆에, **거의 계산하지 않고 꺼내 쓰기만 하는 51B 파라미터**를 하나 더 둡니다. 공식 모델 카드의 표현은 "51B n-gram embedding"입니다. 표가 이렇게 크면, 가중치와 KV 캐시와 표를 한 메모리 풀에 같이 올리기 어려운 장비가 생깁니다. DGX Spark(GB10)처럼 CPU와 GPU가 메모리를 나눠 쓰는 박스가 대표적입니다.

vLLM main에는 2026-10-30에 이런 선택지가 들어왔습니다. 표 전체를 GPU나 pinned RAM에 복사하지 않고, **원본 safetensors 안에 둔 채 이번 스텝의 행만 읽어** 작은 디바이스 버퍼에 담습니다. 플래그 이름은 `disk_offload`입니다.

다만 "지금 `pip install vllm` 하면 된다"까지는 아닙니다. 이 글을 쓰는 시점의 최신 태그 [v0.32.0](https://github.com/vllm-project/vllm/releases/tag/v0.32.0)(2026-10-18)의 `engram.md`에는 `disk_offload`가 없고, Qwen4Exp PLE는 `cpu_offload`만 받는다고 적혀 있습니다. 기능은 그 다음 커밋 [b44a48ce](https://github.com/vllm-project/vllm/commit/b44a48cef1c08cbdc30a0953c724f18cd434e612)로 main에 들어갔습니다.

## n-gram 표가 하는 일

Qwen 기술 보고서 2.3절의 이름은 **N-gram Embedding**입니다. 짧은 n-gram을 키로 정적 임베딩을 꺼내 그 토큰 표현에 더하고, 토큰당 FLOPs는 거의 늘지 않습니다. 주소가 토큰 id만으로 정해지므로 호스트 메모리로 빼거나 미리 가져오기 쉽다는 것이 보고서의 설계 이유입니다.

공개 `config.json`과 배치를 맞춰 보면 표는 레이어마다 있는 것이 아닙니다.

| 설정 | 값 | 출처 |
|---|---|---|
| 아키텍처 | `Qwen4ExpForConditionalGeneration` | 모델 `config.json` |
| 표를 붙인 층 | `ple_layer_ids: [2]` (1부터 세면 2번째 디코더 층 하나) | 같은 config. 보고서도 "Layer 2에 하나면 충분" |
| n-gram 차수 | `ngram_size: 3` (바이그램·트라이그램) | config. 모델 카드의 "bigrams/trigrams at layer 2" |
| 헤드 | `heads_per_ngram: 8` → 차수 2개 × 8 = **16헤드** | config와 vLLM `Qwen4ExpNGramEmbedding` |
| 헤드당 버킷의 기준 크기 | `ngram_vocab_size_base: 20000000` | config. 모델 카드의 "20,000,000" |
| 헤드 차원 | `ple_embed_dim` 2560 / 16 = **160** | config |

vLLM은 헤드마다 `20,000,000` 바로 위의 소수를 버킷 수로 잡고, 128의 배수로 패딩합니다. 그 규칙을 그대로 계산하면 행 수는 **320,001,536**, 파라미터는 320,001,536 × 160 = **51,200,245,760**입니다. 모델 카드의 "51B"와 맞고, FP8(요소당 1바이트)이면 **47.68 GiB**입니다. 아직 열려 있는 설계 PR [#58815](https://github.com/vllm-project/vllm/pull/58815)가 FP8 표를 "47.7 GiB"라고 부른 것과 같은 크기입니다.

행 번호는 "이 n-gram 전용 칸"이 아닙니다. vLLM 커널 주석의 식은 이렇습니다.

```text
id[h] = offset[h] + (xor_i(token[t-i] * multiplier[i])  mod  size[h])
```

현재 토큰과 바로 앞 토큰(최대 두 개, EOS를 넘지 않음)을 헤드별 배수로 섞어 소수 버킷에 넣습니다. 서로 다른 n-gram이 같은 행을 가리킬 수 있고, 그래서 꺼낸 벡터는 그대로 더해지지 않습니다. 질의(이미 앞 레이어를 지난 은닉 상태)와 키의 정규화 내적으로 게이트를 만들어, 맥락과 안 맞으면 기여를 줄입니다. 기술 보고서가 표를 Layer 2에 둔 이유도 여기 있습니다. 1층의 계산과 호스트에서 꺼내는 일을 겹치려는 배치입니다.

체크포인트와 vLLM 코드는 이 모듈을 `ple`(`ple_layer_ids`, `Qwen4ExpPLE…`)라고 부릅니다. Qwen 모델 카드와 기술 보고서에서 약자를 "per-layer embedding"으로 풀어 쓴 문장은 찾지 못했습니다. 보고서가 반복하는 결론은 오히려 **레이어는 하나**라는 쪽입니다.

## 세 가지 저장, 그리고 파일에서 행만 읽기

인덱스가 토큰 id만으로 정해지면, 포워드가 돌기 전에 어떤 행이 필요한지 압니다. vLLM main의 Qwen4Exp 경로는 그 표를 세 곳에 둘 수 있습니다. 기본값은 가운데입니다.

| 모드 | 플래그 | 표가 사는 곳 |
|---|---|---|
| GPU 상주 | `--engram-config.cpu_offload false` | 디바이스 메모리 전체 |
| pinned 호스트 (기본) | `cpu_offload: true` | pinned RAM. GPU가 UVA로 그 행을 읽음 |
| 디스크 | `--engram-config '{"disk_offload": true}'` | 원본 safetensors. 할당된 표는 없음 |

`disk_offload`가 켜지면 `cpu_offload`보다 우선합니다. 문서와 코드가 말하는 한 스텝은 다음과 같습니다.

1. 이번 스텝의 토큰 id로 16개 헤드의 행 번호를 만듭니다.
2. 그 id를 호스트로 복사하고, 이전 스텝이 GPU에서 끝나기를 한 번 기다립니다. 디코드에서는 직전 토큰이 GPU에서 샘플되므로, 파일을 읽기 전에 그 결과가 필요합니다.
3. 중복 id를 제거하고, 행이 걸친 페이지에 `POSIX_FADV_WILLNEED`를 건 다음 `preadv`로 읽습니다.
4. 읽은 바이트를 고정된 디바이스 스테이징 버퍼로 복사합니다. NVFP4면 그 버퍼 위에서 기존 PLE 커널이 행을 풉니다.
5. 포워드는 그 버퍼만 봅니다. CUDA 그래프가 재생하는 주소는 스텝마다 바뀌지 않습니다.

로더는 safetensors를 mmap으로 연 뷰를 넘기고, 구현은 `/proc/self/maps`에서 파일과 오프셋을 찾은 뒤 뷰를 놓습니다. 표 크기만큼의 두 번째 사본을 디스크에 쓰지 않습니다. `.bin`, `fastsafetensors`, runai, `instanttensor`, `--safetensors-load-strategy eager`처럼 파일 백드 뷰가 아닌 로딩은 거부합니다. 웨이트 리로드와 elastic expert parallelism도 거부합니다. 더미 로드는 0을 내보냅니다. 서빙 중에 체크포인트 파일이 잘리면 엔진이 파일 이름을 남기고 멈춥니다.

문서의 켜는 법은 이 한 줄입니다.

```bash
vllm serve <qwen4exp-checkpoint> --engram-config '{"disk_offload": true}'
```

적용 대상은 **Qwen4Exp(`ple_layer_ids`가 있는 모델)와 CUDA**입니다. `EngramConfig`는 그 외에서 `disk_offload requires a Qwen4Exp model on CUDA`로 실패합니다. DeepSeek V4.1의 Engram 표, ROCm, 일반적인 웨이트 SSD 오프로드로는 확장되지 않습니다. 같은 문서가 Engram 전반을 "CUDA-alike"라고 적어 둔 것과, 이 플래그만 `is_cuda()`로 좁혀 둔 것은 별개입니다.

## 페이지 캐시, 통합 메모리, TTFT

`preadv`로 읽은 페이지는 커널의 페이지 캐시에 남습니다. 깨끗하고 파일에 기대어 있으므로 RSS에 "표를 할당했다"고 잡히지 않고, 메모리가 필요하면 커널이 버릴 수 있습니다. 같은 파일을 연 다른 랭크와 캐시를 나눕니다.

이 구분이 Spark에서 중요합니다. PR과 문서 모두, GB10에서는 pinned 호스트 메모리도 웨이트·KV와 **같은 풀**에서 나온다고 적습니다. 표를 GPU에서 pinned RAM으로 옮겨도 그 풀은 줄지 않습니다. 파일에 두면 예약은 풀리고, 실제로 읽은 행만 회수 가능한 캐시로 남습니다.

공짜는 아닙니다. 해시 id라 지역성이 약해서, 압력이 없으면 캐시가 계속 찹니다. PR이 같은 GB10에서 적은 추가 측정은 "생성 1K 토큰당 표의 약 0.36%, 33K 토큰에 11.8%, 고원 없음"입니다. 캐시에 없는 행은 저장장치에서 오고, 그 비용은 주로 **TTFT**에 납니다. 디코드가 한 스텝에 건드리는 행은 적어서, 디스크를 조금 읽어도 토큰 속도는 거의 유지됐습니다.

PR 본문의 숫자입니다. 체크포인트는 `local-inference-lab/Qwen3.8-Flash-Next-NVFP4`(`@6c01ac3`), GB10 한 장, MTP 3토큰, FP8 KV 6 GiB, prefix caching 끔. 작성자 측정이고 CI의 GB10 레인은 없습니다. 디코드는 조건당 1회라, 본문도 노이즈가 몇 퍼센트라고 적습니다.

| | 표 상주 (`cpu_offload: false`) | `disk_offload` | 차이 |
|---|---:|---:|---:|
| 로드된 웨이트 | 99.09 GiB | 72.09 GiB | −27.0 GiB |
| 기동 후 `MemAvailable` | 4.6 GiB | 32.0 GiB | +27.4 GiB |
| 디코드 tok/s/user, c=1 | 33.63 | 32.45 | −3.5% |
| 디코드 tok/s, c=4 | 72.57 | 73.33 | +1.0% |
| 디코드 tok/s, c=8 | 94.04 | 91.99 | −2.2% |
| TTFT, 8K 프롬프트 (15회 중앙값) | 2540 ms | 2820 ms | +11.0% |
| GSM8K | 247/256 | 246/256 | −1 |

NVFP4 표의 절약은 27.0 GiB입니다. 위의 47.68 GiB는 FP8로 요소를 1바이트에 담았을 때의 크기라, 두 숫자를 같은 dtype의 표 크기로 읽으면 안 됩니다.

같은 PR의 콜드 캐시 표에서는 페이지 캐시를 매 요청 전에 비우면 8K TTFT가 3110 ms, 로컬 NVMe가 아닌 NFS에서는 6547 ms였습니다. 본문은 "네트워크 스토리지의 콜드 프리필은 2–4.5배 느리다"고 적습니다. 체크포인트는 로컬 NVMe에 두는 구성이 전제입니다.

## Strata와 무엇이 같고 무엇이 다른가

[Strata](https://github.com/Niko1221/Strata)는 Qwen3.8-Flash-Next용 로컬 추론 엔진입니다. [HOW_IT_WORKS.md](https://github.com/Niko1221/Strata/blob/main/docs/HOW_IT_WORKS.md)는 SSD가 **28.8 GB n-gram 표**를 들고, 토큰마다 몇 행만 읽는다고 설명합니다. 아이디어(표 전체를 올리지 않고 필요한 행만 읽기)는 같습니다.

다른 점도 문서에 그대로 있습니다.

- Strata의 28.8 GB는 양자화된 GGUF 쪽 표입니다. vLLM `disk_offload`는 Hugging Face safetensors 원본을 읽습니다.
- Strata `DETAILS.md`의 기본 `--ple-io direct`는 버퍼를 거치지 않는 SSD 읽기이고, `mmap`과 `ram`은 별도 모드입니다. HOW_IT_WORKS의 "OS cache" 한 줄과 이 기본 모드 설명은 서로 다르게 읽힙니다.
- vLLM PR #59958은 설계를 앞선 vLLM PR #58815(Trosfy, `host_file_gather`, 이 글을 쓰는 시점에는 아직 open)에서 가져왔다고 적고, 플래그를 `disk_offload`로 바꿔 NVFP4 표 위에 rebase했다고 적습니다. Strata를 인용하지 않습니다. #58815도 Strata를 인용하지 않습니다.

그래서 "Strata가 이미 행 단위로 읽는다"는 말은 Strata 문서로 확인할 수 있고, "vLLM이 Strata의 구현을 흡수했다"는 말은 지금 공개된 vLLM 쪽 1차 자료에는 없습니다.

## 팩트 체크

포스트 문장을 위 자료와 대조했습니다. ✅ 자료와 맞음 / ⚠️ 방향은 맞거나 일부만 맞음 / ❌ 자료와 어긋남

### @TeksEdge 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| vLLM이 Strata가 쓰는 트릭을 가져왔다 | ⚠️ | 행만 읽는다는 발상은 Strata 문서에 있다. 머지된 구현의 출처로 PR이 적는 것은 Strata가 아니라 #58815다. [PR #59958](https://github.com/vllm-project/vllm/pull/59958), [Strata HOW_IT_WORKS](https://github.com/Niko1221/Strata/blob/main/docs/HOW_IT_WORKS.md) |
| 51B 파라미터 일부를 VRAM이나 시스템 RAM에 통째로 올리지 않고 쓸 수 있다 | ⚠️ | VRAM·pinned RAM에 표를 할당하지 않는 것은 맞다. 읽은 행은 페이지 캐시(시스템 RAM)에 올라가고, 그 캐시는 커널이 회수한다. 같은 포스트 뒷문장이 이 단서를 다시 말한다. |
| Qwen3.8-Flash-Next에 51B PLE n-gram 룩업 표가 있다 | ✅ | 모델 카드 "plus 51B n-gram embedding". 이름 `ple`는 config·vLLM 쪽이다. [모델 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) |
| 로컬 토큰 맥락으로 인덱싱되는 읽기 전용 모델 메모리다 | ⚠️ | 정적인 표이고, 키는 로컬 접미사(현재와 직전 토큰)다. 구현은 그 접미사를 소수 버킷에 해시한다. 고유 슬롯이 아니라 충돌이 있고, 게이트가 기여를 줄일 수 있다. [기술 보고서 2.3](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf), vLLM `common/ops/ple.py` |
| 보통 vLLM은 그 표를 GPU 메모리나 pinned 시스템 RAM에 둔다 | ✅ | 기본 `cpu_offload: true`가 pinned 호스트, `false`가 GPU. [engram.md](https://github.com/vllm-project/vllm/blob/main/docs/features/engram.md) |
| 이제는 원본 safetensors에 두고, 토큰 id로 행을 고른 뒤 작은 GPU 버퍼에 복사해 쓴다 | ✅ | main의 `disk_offload`. id는 해시된 n-gram id이고, 읽기는 `preadv`, NVFP4는 GPU에서 디코드한다. 기본값은 여전히 pinned RAM이다. |
| Strata는 이미 Qwen PLE 표를 SSD에 두고 토큰마다 필요한 행만 읽는다 | ✅ | HOW_IT_WORKS: 28.8 GB n-gram 표, 토큰당 몇 행. 그 28.8 GB는 Strata가 읽는 양자화 표이지 51B safetensors 원본은 아니다. |
| 새 점은 그 능력이 vLLM에, 원본 safetensors를 읽는 형태로 들어왔다는 것 | ⚠️ | main에는 2026-10-30 머지됐고, 두 번째 사본을 만들지 않는다. 최신 릴리스 v0.32.0(2026-10-18)에는 이 절이 없다. |
| GB10, Qwen3.8-Flash-Next NVFP4에서 로드 메모리 99.09 → 72.09 GiB, c=1 디코드 약 3.5% 이내, GSM8K 247/256 → 246/256 | ✅ | PR 검증 표와 숫자가 같다. 항목 이름은 "Weights loaded"다. 1회 측정, CI 밖, 체크포인트는 `local-inference-lab` 스냅샷이다. c=4는 +1.0%, c=8은 −2.2%라 "3.5% 이내"는 c=1에 대한 문장으로 맞다. |
| Spark는 CPU·GPU가 메모리를 나눠 쓰므로 pinned RAM으로 옮겨도 풀이 늘지 않는다. 파일 백드는 그 ~27GB 예약을 피하고, 최근 행은 회수 가능한 페이지 캐시에 둔다 | ✅ | −27.0 GiB와 통합 메모리 설명이 PR 본문과 `engram.md`에 있다. |
| 콜드 행은 스토리지에서 오므로 TTFT가 약간 늘어난다 | ⚠️ | 방향은 맞다. 같은 표의 8K TTFT는 2540 → 2820 ms로 **+11%**다. 캐시를 비우면 약 3.1 s, NFS 콜드는 6547 ms(본문: 2–4.5배)다. "약간"은 웜 NVMe에만 겨우 해당하는 말이다. |
| 범용 vLLM SSD 오프로드가 아니고, 지금은 Qwen4Exp PLE + CUDA만이다 | ✅ | `disk_offload requires a Qwen4Exp model on CUDA`. elastic EP도 거부. |

### @Tono_Ken3 포스트

인용 포스트 위에 얹힌 해석입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| vLLM에 Strata의 노하우가 흡수됐다 | ⚠️ | 위와 같다. 공개된 vLLM PR·문서는 Strata를 출처로 적지 않는다. |
| Qwen-FN-NVFP4의 n-gram 부분을 RAM에서 처리할 수 있게 된다 | ❌ | 기본 경로가 이미 pinned RAM이다. 이번에 main에 들어온 `disk_offload`는 표를 RAM에 올리지 않고 파일에서 행을 읽는다. Spark에서 pinned RAM이 도움이 안 되는 이유가 이 PR의 동기이기도 하다. |
| 그래서 컨텍스트를 더 늘릴 수 있고, VRAM 128GB에서 8병렬로 돌릴 때 컨텍스트가 부족하던 문제가 풀릴 것이다 | ⚠️ | 작성자의 기대이지 측정이 아니다. PR 벤치는 KV를 6 GiB로 고정했다. 이산 GPU에서 VRAM을 비우는 쪽은 이미 기본인 `cpu_offload`다. `disk_offload`가 추가로 푸는 경우는 그 pinned 복사본을 두기 어려운 풀(통합 메모리, 호스트 RAM 부족)이다. |

**총평:** 영어 포스트의 메커니즘·숫자·적용 범위는 머지된 PR 및 main 문서와 상당히 정확하게 맞습니다. 느슨한 곳은 "시스템 RAM에는 전혀 안 오른다", "Strata에서 가져왔다", "TTFT가 약간", 그리고 "최신 릴리스에 이미 있다"로 읽히는 부분입니다. 인용 포스트의 "이제 RAM에서 처리된다"는 이 변경의 기본 동작과 반대입니다.

## 서빙할 때 가져갈 점

1. **릴리스 태그를 확인한다.** v0.32.0에는 없다. main의 `docs/features/engram.md`에 "Disk offload (Qwen4Exp)" 절이 있는 빌드를 쓴다.
2. **통합 메모리나 호스트 RAM이 표를 못 담을 때 `disk_offload`를 켠다.** H100처럼 호스트 RAM이 따로 있고 VRAM만 모자라면, 문서의 기본값인 pinned `cpu_offload`가 VRAM을 KV에 내주는 경로다.
3. **체크포인트는 로컬 NVMe의 safetensors로 둔다.** 네트워크 디스크의 콜드 프리필은 PR 측정에서 수 배 느렸다. eager 로더나 `.bin`은 이 모드로 기동하지 않는다.
4. **절약되는 바이트는 dtype을 따라간다.** 모델 카드의 51B는 파라미터 수다. PR이 GB10 NVFP4에서 줄인 로드 웨이트는 27.0 GiB다.

## 참고 자료

- Qwen 팀, Qwen3.8-Flash-Next 모델 카드 — [Hugging Face](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Qwen 팀, *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability* (2026-08-26, 저장소의 `tech_report.pdf`, 2.3 N-gram Embedding) — [PDF](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf)
- vLLM 문서, *Engram: conditional memory via n-gram lookups* (main, Disk offload 절) — [engram.md](https://github.com/vllm-project/vllm/blob/main/docs/features/engram.md)
- stecasta, *[Qwen4Exp] PLE disk offload*, vLLM PR #59958, 2026-10-30 머지, 커밋 [b44a48ce](https://github.com/vllm-project/vllm/commit/b44a48cef1c08cbdc30a0953c724f18cd434e612) — [PR](https://github.com/vllm-project/vllm/pull/59958)
- Trosfy, *[Qwen4Exp] Gather PLE rows on the host from the checkpoint files (`host_file_gather`)*, PR #58815 (open, #59958이 설계를 이어받았다고 명시한 앞선 PR) — [PR](https://github.com/vllm-project/vllm/pull/58815)
- peakcrosser7, *[Qwen4Exp] Support UVA PLE-offload and Engram tensor parallelism*, PR #54371, 2026-09-09 머지 (pinned 호스트 + UVA) — [PR](https://github.com/vllm-project/vllm/pull/54371)
- vLLM v0.32.0 릴리스 (2026-10-18, `disk_offload` 이전) — [릴리스](https://github.com/vllm-project/vllm/releases/tag/v0.32.0) · [당시 engram.md](https://github.com/vllm-project/vllm/blob/v0.32.0/docs/features/engram.md)
- Niko1221, Strata — [저장소](https://github.com/Niko1221/Strata) · [HOW_IT_WORKS.md](https://github.com/Niko1221/Strata/blob/main/docs/HOW_IT_WORKS.md) · [DETAILS.md](https://github.com/Niko1221/Strata/blob/main/docs/DETAILS.md)
- 원본 X 포스트: [@TeksEdge](https://x.com/TeksEdge/status/2116704279754948720) · 인용 [@Tono_Ken3](https://x.com/Tono_Ken3/status/2116739686354108721)
