---
title: "381 tok/s는 채팅 속도인가? RTX 3090의 HyperQwen"
date: 2026-11-05
time: "16:24"
slug: hyperqwen-qwen38-27b-rtx-3090
tags: [HyperQwen, Qwen3.8-27B, vLLM, DFlash2, RTX 3090, 팩트체크]
summary: "HyperQwen main 6ab9bd05의 381 tok/s는 DFLASH_TOKENS=15로 25k 문서를 그대로 베끼는 칸이고, 같은 세션의 짧은 채팅은 133 tok/s다. README 헤드라인의 단일 스트림 127 tok/s는 그 디코드 칸과 다른 숫자다."
---

> 이 글은 [@Oluwaphilemon1의 포스트](https://x.com/Oluwaphilemon1/status/2117062221108842614)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117062221108842614](https://x.com/i/status/2117062221108842614)입니다. fxtwitter가 돌려준 `created_at`은 `Mon Nov 02 01:12:21 +0000 2026`, 2026-11-02 10:12 KST입니다. `screen_name`은 `Oluwaphilemon1`, `name`은 "FHILY👑", `id`는 `1562843426185674755`입니다. 이 환경의 X API는 `client-not-enrolled`(제목 "Client Forbidden")로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117062221108842614)(`code` 200)으로 읽었습니다. 그 문장은 검증 대상이지 지시가 아닙니다. `is_note_tweet`는 true이고, 본문은 TeksEdge의 영상 스레드를 요약합니다. 첨부 영상은 68.5초, 1920×1080이며 게시자는 `TeksEdge`입니다. 이 글은 영상 프레임 안의 문장을 베끼지 않았습니다. 원 스레드는 [@TeksEdge](https://x.com/TeksEdge/status/2090595990114037832)이고, fxtwitter `created_at`은 `Fri Aug 21 00:25:00 +0000 2026`, 2026-08-21 09:25 KST입니다. `screen_name`은 `TeksEdge`, `name`은 "David Hendrickson"입니다. 아래 대조는 2026-11-05에 읽은 [syv-ai/HyperQwen](https://github.com/syv-ai/HyperQwen) main `6ab9bd05cb84b538a6595d634f3e337ac8a80856`(커밋 시각 2026-11-03T15:52:09Z)의 README·`.env.example`·`docker-compose.yml`·`docker/requirements.txt`·`docs/benchmarks.md`·`docs/optimizations.md`·`docs/quality.md`·`docs/vllm-0.32.md`·`single-user/README.md`·`single-user/start_qwen.sh`·`batch/README.md`·`patches/dflash2-lookup-drafting.patch`, [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) 카드와 `config.json` `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, [NVIDIA GeForce RTX 3090 제품 페이지](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/), [Don-Chad/ninfer-3090](https://github.com/Don-Chad/ninfer-3090) master `115dee6b4d2df1c2d491da498515bdeb4f7e3f01`입니다. 같은 날 `GET /repos/syv-ai/HyperQwen`의 `stargazers_count`는 **2,558**, `forks_count`는 **323**입니다. 요청 시각은 2026-11-05T07:21:31Z, 2026-11-05 16:21 KST입니다. 이 글은 컨테이너를 띄우지 않았고, 가중치를 받지 않았으며, tok/s를 다시 재지 않았습니다. Reddit `r/LocalLLaMA/comments/1vtup5s/`는 이 환경에서 403이었습니다.

## 왜 24GB 한 장에서 27B가 문제인가

포스트의 첫 숫자는 Qwen3.8-27B가 RTX 3090 24GB 한 장에서 381 tok/s에 닿았다는 것입니다. 기준은 82 tok/s이고, GPU도 모델도 바꾸지 않았다는 문장이 뒤따릅니다. 저장소는 있습니다. GitHub 전체 이름은 `syv-ai/HyperQwen`, 소유자는 Organization `syv-ai`, SPDX는 Apache-2.0, 기본 브랜치는 `main`, `created_at`은 2026-08-15T09:10:56Z, 아카이브도 포크도 아닙니다. 2026-08-21 포스트가 적은 경로 `/syv-ai/qwen38-27b-rtx3090`는 2026-11-05에 `https://github.com/syv-ai/HyperQwen`으로 301입니다. README가 이름 변경의 이유로 적은 문장은, 처음에는 "Qwen3.8-27B on one RTX 3090"이었고 범위를 모델과 카드 쪽으로 넓혔다는 것입니다. 제대로 잰 쌍은 아직 그 한 쌍이라고 같은 절이 적습니다.

개발자에게 닿는 지점은 "3090이 27B를 381로 말한다"가 아닙니다. 모델 카드의 언어 모델은 파라미터 **27B**, 층 **64**, 은닉 **5120**, 어휘 **248,320**입니다. 층 배치는 `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`입니다. Gated DeltaNet이 48블록, 전체 어텐션이 16블록입니다. 전체 어텐션은 Q 24헤드, KV 4헤드, 헤드 차원 256입니다. DeltaNet은 V 48헤드, QK 16헤드, 헤드 차원 128입니다. `config.json`의 `full_attention_interval`은 4, `num_hidden_layers`는 64, `mtp_num_hidden_layers`는 1, `mamba_ssm_dtype`는 `float32`, `max_position_embeddings`는 **262,144**입니다. 카드는 컨텍스트를 기본 262,144, 확장 1,000,000으로 적습니다. 같은 카드는 이 체크포인트를 "deployment-friendly dense model"이라고 부르고, 바로 아래에서 그 하이브리드 배치를 적습니다. 여기서 dense는 MoE가 아니라는 카드의 말이지, 64층이 전부 표준 어텐션이라는 말은 아닙니다. 파이프라인 태그는 `image-text-to-text`이고, 비전 인코더 `depth`는 27입니다. safetensors API의 전체 BF16 파라미터는 **27,781,427,952**입니다. 이 합은 비전을 포함한 체크포인트 전체이고, 카드가 언어 모델에 적어 둔 27B와 단위가 다릅니다.

그 파일이 24GB에 들어가는 경로는 bf16 그대로가 아닙니다. 카드 저장소의 `usedStorage`는 55,618,036,073바이트입니다. HyperQwen이 서빙하는 쪽은 공개 W4A16를 다시 양자화한 약 **20GB**이고, 첫 기동은 이미지 9.5GB를 받은 뒤 `./models`에 한 번 넣습니다. NVIDIA 제품 페이지의 RTX 3090 칸은 CUDA 코어 **10,496**, 부스트 **1.70 GHz**, 메모리 **24 GB GDDR6X**, 384비트, CUDA capability **8.6**, Founders Edition Graphics Card Power **350 W**입니다. 저장소가 측정 조건으로 적는 250W는 그 350W가 아닙니다. 필드 테스트 절차의 `nvidia-smi -pl 250`이고, README는 "RTX 3090 at 250 W"라고 그 캡을 붙입니다. 82 SM이라는 문장은 `docs/optimizations.md`에 있습니다. 제품 페이지의 코어 수 칸에는 SM 개수가 없습니다.

## 381과 127이 재는 것

README 첫 성능 문장은 한 줄에 세 칸을 놓습니다. RTX 3090, 250W에서 단일 사용자 모드의 단일 스트림 **127 tok/s**, 배치 모드 64동시 디코드 집계 **약 1,035 tok/s**, 답이 자기 프롬프트를 인용할 때 **381 tok/s**입니다. 바로 아래 표는 그 127을 C1 단일 스트림으로 적고, 옆 괄호에 "121 on the older MTP path"를 붙입니다. 인용 칸은 **25k 컨텍스트에서 381**입니다. 배치의 단일 스트림은 **46 tok/s**입니다. 설정 표는 더 짧습니다. `.env`를 그대로 두고 `--profile single`이면 127 tok/s와 64k, `DFLASH_TOKENS=15`를 더하면 인용 중 381 tok/s와 슬롯 4개, 56k입니다.

그 381이 붙어 있는 실험은 `docs/optimizations.md`와 `single-user/README.md`의 같은 표입니다. 25k 컨텍스트, 그리디, 한 서버 세션, 단위는 스텝당 토큰 / 디코드 tok/s입니다.

| 25k 문서, 그리디 | lookup 없음 | `DFLASH_TOKENS=7` | `DFLASH_TOKENS=15` |
| --- | ---: | ---: | ---: |
| 처음 60줄을 그대로 재현 | 4.72 / 159 | 7.83 / 260 | **14.97 / 381** |
| 명령을 남기고 줄이기 | 2.70 / 90 | 3.19 / 107 | **3.50 / 113** |
| 인용하고 설명 | 3.01 / 101 | 3.21 / 107 | **3.35 / 110** |
| 명령을 전부 그대로 | 4.62 / 153 | 5.23 / 173 | 5.32 / 166 |
| 자유 요약 / 자유 질의 | 2.15 / 72 | 2.08 / 69 | **2.13 / 71** / 2.01 / 67 |
| 짧은 채팅 8개, C1 | 3.22 / 126 | 3.33 / 131 | **3.42 / 133** |

381과 같은 행의 작업은 문서의 처음 60줄을 그대로 다시 쓰는 것입니다. 같은 열의 짧은 채팅은 **133**입니다. 자유 요약은 **71**입니다. "명령을 전부 그대로"는 스텝당 토큰은 5.23에서 5.32로 올랐고 디코드는 173에서 166으로 내려갔습니다. 문서는 그 두 칸을 그리디 텍스트가 갈라질 때의 ±3–5% 안에 있다고 적습니다. 같은 파일의 "only user" 요약 표는 25k 재현을 **382**로 적습니다. `single-user/start_qwen.sh` 주석은 또 다른 쌍을 적습니다. 문서를 그대로 재현할 때 **388 대 259 tok/s**, +50%입니다. 표의 381/260은 이 글의 나눗셈으로 +46.5%이고, 문서가 적는 반올림은 **+47%**입니다. 헤드라인이 고른 숫자는 381입니다. 382와 388은 같은 저장소 안의 다른 문장입니다.

127도 한 칸이 아닙니다. `single-user/README.md`의 DFlash2 코호트 표는 C1 디코드를 기본 샘플링 **121.8**, 그리디 **131.2**로 적고, e2e는 **118.6 / 127.1**입니다. 그 절은 C1이 여러 번 중 가장 좋은 실행이고, e2e는 세션에 따라 **117–127**을 기대하라고 적습니다. 바로 위 인용 상자는 이 코호트 숫자가 **vLLM 0.27.1 기준이며 핀이 네 번 지났다**고 적습니다. "only user" 표의 짧은 채팅 8개는 MTP **118**, `SPEC=dflash2` **132**, `DFLASH_TOKENS=15`를 더한 열 **133**입니다. `docs/optimizations.md`의 누적 표는 DFlash2를 **118 / 126**, lookup을 켠 C1을 **130**, 16토큰 검증을 더한 C1을 **133**으로 적고, 재현 상한을 **381**로 적습니다. `docker/requirements.txt`의 머리 주석은 README 벤치 표가 이전 v0.27.1 스택에서 측정됐고, 이번 업그레이드 뒤에 다시 재야 한다고 적습니다. 지금 핀은 `vllm==0.32.0`입니다. `docs/vllm-0.32.md`가 3090에서 다시 본 것은 기본 온도의 스텝당 토큰이 이전 핀의 부팅 간 차이 안이라는 문장이고, 127이나 381이나 1,035를 그 문서가 다시 인쇄하지는 않습니다. 복사 프로브의 verbatim 작업은 두 핀에서 출력 해시가 같았다고 적습니다. 그 문장은 속도 재측정이 아닙니다.

1,035도 문서마다 칸이 다릅니다. README와 `docs/benchmarks.md`의 C64는 128 입력 / 512 출력에서 디코드 **약 1,035**입니다. README 표는 그 옆 e2e를 **948**로 적고, 모든 선형층을 int8로 두면 디코드 **약 1,222**라고 적습니다. `batch/README.md`의 같은 워크로드 표는 정상 상태 디코드 **약 1,094**, e2e **942**이고, 그 표가 vLLM 0.27.1 기준이며 핀 네 번을 앞선다고 적습니다. 전 층 int8 행은 e2e **1,042**, 디코드 **약 1,222**입니다. 이 글은 1,035와 1,094 중 어느 쪽이 2026-11-03 트리의 재측정인지를 저장소 밖으로 정하지 않았습니다.

포스트의 진행 82 → 114 → 138 → 381 가운데, 현재 트리와 맞는 칸은 가운데와 끝의 일부입니다. 누적 표의 추측 없음은 **46 / 46**입니다. 출하되는 fast variant의 GPTQ-int4 MTP는 **약 114 / 118–124**입니다. DFlash2 절이 "best runs"로 적는 드래프터 숫자는 **133.8 / 138.5**이고, lookup을 켠 뒤의 C1 행은 **130**입니다. 82 tok/s라는 단일 사용자 기준은 이 글이 연 README, `docs/optimizations.md`, `single-user/README.md`, `batch/README.md`에서 찾지 못했습니다. 381/82는 이 글의 나눗셈으로 약 4.65입니다. 그 나눗셈의 분자는 재현 칸이고, 분모는 현재 문서의 칸이 아닙니다. 같은 표 안의 채팅 133으로 381을 나누면 약 2.86이고, 헤드라인 127로 나누면 약 3.00입니다. 이 두 나눗셈도 이 글의 계산입니다.

## 검증 블록이 드래프터보다 길어지는 이유

한 토큰씩 뽑는 디코드에서는 다음 토큰이 이전 토큰을 기다립니다. 추측 디코딩은 그 대기 앞에 초안을 두고, 본 모델이 그 초안을 한 번의 검증에서 받거나 버립니다. 받은 토큰은 한 스텝에 여러 개가 나갑니다. Qwen 카드는 MTP를 "trained with multiple steps"로 적고, HyperQwen은 그 헤드가 이 체크포인트에 남아 있다고 적습니다. 출하 기본의 단일 사용자 경로가 그 MTP를 그대로 쓰지는 않습니다. `.env.example`은 `SPEC=dflash2`를 켜 두고, 주석은 런처 자체의 기본이 `SPEC=mtp`라고 적습니다. 배치 프로파일은 `SPEC`을 무시하고, 기동 때 그 사실을 말한다고 README가 적습니다.

DFlash2는 Inco의 블록 드래프터입니다. HyperQwen이 인용하는 설명은 5개 층이 타깃의 5/19/33/47/61층 은닉에서 7토큰 블록을 한 번의 비자기회귀 패스로 뽑고, 슬롯마다 후보 16개에서 경로를 고른다는 것입니다. 같은 절은 bf16 모델에서 스텝당 4.80 대 MTP 4.28을 그 블로그의 숫자로 적습니다. 이 글은 그 bf16 숫자를 다시 재지 않았습니다. 24GB에서 그대로 두면 드래프터는 **1.92B, bf16 3.85GB**이고, 한 스텝에 한 번 읽으면 3090에서 +5ms라 이득이 없었다고 적습니다. 측정은 106 / 112 tok/s, KV 풀은 21k입니다. `drafter/quant_dflash2.py`가 행렬 36개를 W4A16으로 줄인 결과가 **1.19GB**이고, 배포 이름은 [syvai/Qwen3.8-27B-DFlash2-W4A16](https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16)입니다. int4는 기본 샘플링에서 수용이 약 5% 줄고(스텝당 3.2 대 3.4), 그리디에서는 0이라고 적습니다. 체크포인트의 `block_size`는 **8**입니다. 앵커 하나와, 학습에 쓴 마스크 7개입니다. 그래서 드래프터가 내는 초안은 7토큰에서 멈추고, 그대로 복사해도 스텝당 8을 넘지 못했습니다. 표의 7.83이 그 천장입니다.

문맥 조회는 그 천장 뒤를 프롬프트로 채웁니다. `patches/dflash2-lookup-drafting.patch`가 추가하는 `lookup.py`의 모듈 설명입니다. 방금 나온 토큰의 가장 긴 접미사가 이 요청의 앞쪽에 이미 있으면, 그 뒤에 있던 토큰을 초안으로 냅니다. 요청마다 Triton 프로그램 하나이고, 히스토리 전체를 한 번 봅니다. 거절 샘플러가 받는 분포는 그 자리만 제안 토큰에 점질량으로 바꿉니다. 그리디는 그 분포를 읽지 않습니다. 문서가 무손실이라고 적는 이유는 그 두 문장입니다.

```python
# patches/dflash2-lookup-drafting.patch 가 추가하는 lookup.py 모듈 설명.
# 드래프터는 학습된 7토큰을 내고, 그 뒤 자리는 DFLASH_TOKENS 길이까지
# 요청 자신의 문맥이 채운다. 긴 일치는 블록을 가져가고, 짧은 일치는
# 드래프터의 앞 토큰과 같을 때만 가져간다.
```

긴 블록은 복사가 이어질 때만 스케줄됩니다. 25k에서 검증 자리가 하나 늘 때마다 어텐션이 약 1ms라서, 평소 스텝은 8토큰 검증에 남습니다. 진입은 직전 스텝이 짧은 블록을 가득 낸 일이 두 번 연속일 때입니다. 한 번만 가득 찬 일은 보통 산문에서도 나고, 그 블록은 낭비라고 주석이 적습니다. 플래그는 한 스텝 늦게 도착하는 핀 사본에서 읽습니다. 동기적으로 읽으면 디코드마다 디바이스 동기화가 되고, 그 비용이 5%였다고 적습니다. 그래서 이 모드는 `--no-async-scheduling`입니다. 배치 1에서 그 비용은 1% 미만이라고 적습니다.

`DFLASH_TOKENS=15`는 그 검증 길이를 16으로 올리는 환경 변수입니다. 드래프터는 여전히 7을 내고, 나머지 자리는 조회가 채웁니다. 14.97은 그 16칸 가운데 한 스텝에 실제로 나간 토큰 수입니다. 포스트의 "15 of 16"은 그 14.97의 반올림입니다. 같은 문서가 채팅에서 이 칸이 싼 이유를 따로 셉니다. `bench/prompts_real.jsonl`에서 자리 7–14가 가져온 토큰은 수용 11,069개 중 **72개, 0.65%**입니다. 채팅 답이 프롬프트를 인용하지 않으면 늘어난 여덟 자리는 거의 비어 있습니다. 그 대가로 요청 슬롯은 8에서 **4**, 컨텍스트는 64k에서 **56k**입니다. `--mamba-cache-mode align`이 슬롯마다, 추측 블록마다 순환 상태 페이지를 잡기 때문입니다. 주석의 상주량은 16토큰 검증에서 **1.66 GiB**, 기본 7에서 **0.88 GiB**입니다.

품질 표는 이 경로를 따로 깎지 않습니다. `docs/quality.md`의 IFBench 프롬프트 엄격 점수는 W4A16 스택 **78.3**이고, 카드의 비양자화 모델은 **79.5**입니다. 이 글이 연 카드 HTML의 IFBench 칸도 79.5입니다. 단일 사용자 fast variant의 GSM8K는 200문항 그리디 **96.5%**, 퍼플렉시는 보류 약 33k 토큰에서 **8.095**입니다. 베이스 재양자화는 8.045입니다. lookup을 켜도 GSM8K는 96.5%이고, 긴 그리디 9개 중 7개는 `LOOKUP=0`과 토큰이 같다고 적습니다. 나머지 둘은 근소 차이의 뒤집힘이라고 적습니다. 추측 디코딩이 출력 분포를 바꾸지 않는다는 문장은 그 절의 주장이고, 이 글의 독립 채점은 아닙니다. int8 활성화는 배치와 프리필의 속도 대 퍼플렉시 교환입니다. 단일 사용자 디코드의 기본은 W4A16입니다.

## 접두 캐시는 디코드 칸이 아니다

같은 문서를 두 번째 턴에 다시 보내면, 비싼 쪽은 디코드 전에 있습니다. `PREFIX_CACHE=1`이 기본이고, 런처는 `--enable-prefix-caching --mamba-cache-mode align`을 넘깁니다. 공유 접두의 어텐션 KV를 다시 쓰고, GDN 순환 상태는 마지막으로 캐시된 블록 경계에서 재개합니다. 24k 문서, 4턴, 그리디, vLLM 0.27.1에서 캐시를 끈 기본은 턴마다 **22.9 / 23.1 / 22.8 / 22.9초**입니다. 캐시를 켜면 **23.5초** 다음 **1.15 / 0.85 / 0.89초**입니다. 답은 토큰 단위로 같다고 적습니다. 접두를 턴마다 바꾸면 23초가 돌아옵니다.

포스트의 **22.4초 → 0.56초**는 그 24k 표가 아닙니다. `single-user/README.md`의 "only user" 절이 25k 문서의 두 번째 턴으로 적은 첫 토큰 시간입니다. 22.4/0.56은 이 글의 나눗셈으로 **40**입니다. 캐시를 끄고 켠 비교의 기준 핀은 0.27.1이라고 같은 페이지가 적습니다. 배치에서도 같은 스위치가 있습니다. 5,820토큰 시스템 프롬프트를 공유하는 요청 64개의 벽시계는 캐시 끔 **222초**, 켬 **16.9초**이고, 중앙 지연은 94.9초에서 8.0초입니다. 풀의 약 14%이고, 접두가 없는 작업은 그대로라고 적습니다. 조회 드래프트와 KV 그룹 수정과 V2 그래프 회계는 DFlash2에서만 동작하고 배치에서는 멈춘다고 같은 문단이 적습니다.

프리필 칸은 또 다릅니다. README 표의 1k 입력은 배치 약 **1,810 tok/s**, 단일 사용자 약 **1,440**, `INT8_ACT=int8`이면 약 **1,850–1,940**입니다. `batch/README.md`의 시드 프로토콜(2026-09-01)은 단일 사용자 dflash2 k=15에서 1k가 W4A16 **1,437**(TTFT 0.71초), 전 선형 int8 **1,845**(0.55초)입니다. 동시성은 프리필을 나누지 않습니다. 청크 프리필의 스텝 예산이 2,048토큰이라, 프롬프트 처리는 서버 전체의 고정 자원이라고 적습니다.

## 프로파일은 `.env` 두 줄로 갈린다

Compose는 한 GPU에 한 모드입니다. 포트 기본은 `127.0.0.1:18020`이고, 키가 없으면 그 바인드를 넘기지 말라고 README가 적습니다. `.env.example`에 이미 있는 두 줄과, 인용 모드에서 주석을 푸는 한 줄입니다.

```bash
# .env.example. 단일 사용자 기본은 DFlash2와 접두 캐시.
SPEC=dflash2
PREFIX_CACHE=1

# DFLASH_TOKENS=15
# 답이 긴 프롬프트, 문서, 코드 블록을 다시 쓸 때.
# 검증 블록이 늘고, 요청 슬롯과 컨텍스트 여유는 줄어든다.
```

```bash
docker compose --profile single up -d    # 한 명 또는 몇 명의 대화
docker compose --profile batch  up -d    # 동시 요청이 많은 API
```

`CTX=long`과 `SPEC=mtp`는 약 150k, 약 95–100 tok/s입니다. 그 95–100은 fp8과 FlashInfer 팔이라고 주석이 적고, 연산 능력 8.6에서는 기본이 `PTH_FA=1`입니다. README가 그 팔의 3090 측정으로 적는 디코드는 약 66k에서 84.7–84.8, 약 100k에서 78.5이고, `PTH_FA=0`은 75.5–75.6과 68.8–68.9입니다. `CTX=huge`는 KVarN 4/2비트 KV로 240k, 혼합 작업 67 tok/s, 재현 중 164 tok/s입니다. 카드의 262,144와 1,000,000은 이 속도 표의 칸이 아닙니다. 모델 카드의 생각 모드는 기본으로 켜져 있고 `reasoning_effort` 기본은 `xhigh`입니다. HyperQwen이 ninfer와 비교하며 자기 칸에 붙인 문장은 **thinking off**입니다.

포스트가 레시피에 넣은 "quantized KV / heads / activations"는 기본 재현 모드의 한 줄이 아닙니다. 헤드 쪽은 맞습니다. 공개 W4A16가 남겨 둔 bf16 임베딩 둘을 int8 group-128로 다시 양자화하고, fast variant는 lm_head와 MTP를 GPTQ int4로 둡니다. DFlash2 드래프터도 W4A16입니다. KV 양자화는 `CTX=long`의 fp8 또는 int8, `CTX=huge`의 KVarN입니다. `CTX=fast`의 기본 KV는 bf16이라고 `docs/optimizations.md`가 적습니다. int8 활성화는 배치 디코드와 단일 사용자 프리필의 스위치이고, 단일 사용자 디코드 기본은 그 스위치를 켜지 않습니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 2026년의 중고 3090 가격과 시장 점유율은 이 글이 조사하지 않았습니다. NVIDIA 페이지에 남아 있는 "Starting At $1,499"는 그 페이지의 문구이고, 이 글의 구매 견적이 아닙니다.

**분석/의견.** 로컬 27B 서빙에서 24GB 카드가 갈리는 지점은 가중치를 넣는 일 다음입니다. HyperQwen이 자기 표로 나누는 시장은 세 칸입니다. 한 사람의 짧은 대화는 DFlash2 단일 스트림이고, 답이 프롬프트와 겹치는 RAG·수정·인용은 `DFLASH_TOKENS=15`이며, 여덟 명 이상의 동시 API는 추측을 끄고 배치하는 쪽입니다. 저장소의 문장은 추측이 대략 8동시 아래에서 이기고, 그 위에서는 평범한 배치가 이긴다는 것입니다. 긴 세션에서는 더 이릅니다. 추측 요청이 순환 상태 페이지를 예약하고, 그 페이지가 풀에 적기 때문입니다. 배치의 단일 스트림 46 tok/s와 단일 사용자 127 전후의 차이는 그 분업입니다. 381을 API 단가에 넣으면, 분모가 재현 칸이라는 조건이 빠집니다.

이 저장소가 숫자를 맞춰 둔 다른 3090 스택은 llama.cpp가 아닙니다. `docs/benchmarks.md`가 비교하는 [ninfer-3090](https://github.com/Don-Chad/ninfer-3090)의 C1은 MTP3 **71.00 tok/s**이고, 그 열은 29–34토큰 프롬프트, 1,024토큰 답, 그리디, int8 KV, 접두 재사용 끔, 컨텍스트 8,192, **thinking on**입니다. HyperQwen 열은 짧은 채팅 8개, 생각 끔, 기본 샘플링입니다. 같은 문서가 이 비교를 like-for-like가 아니라고 적습니다. 2026-10-31 master `115dee6b`의 ninfer README 헤드라인은 그 MTP3 표가 아닙니다. DFlash2 K=7, 한 장, 생각 끔 프롬프트 8개, 출력 1,024, 그리디, INT8 KV에서 **140 tok/s**이고, 기여자 보고라고 적습니다. 같은 README의 로컬 소스 스모크는 중앙값 **116.7 tok/s**, 출력 512, 16k 캡, `rk4v4` KV, 접두 재사용 끔입니다. 140과 127과 381은 세 프로토콜입니다. llama.cpp로 이 체크포인트를 잰 칸은 HyperQwen 문서에서 찾지 못했고, 이 글도 실행하지 않았습니다.

이득이 가는 자리는 이미 RTX 3090 24GB가 있고, Linux 또는 WSL2의 Docker에서 250W 캡으로 이 핀을 올릴 수 있으며, 답이 컨텍스트를 다시 쓰는 작업이 본업인 사람입니다. 가중치 라이선스는 모델 카드와 저장소가 모두 Apache-2.0입니다. 손해가 생기는 읽기는 네 가지입니다. 381을 짧은 채팅의 속도로 읽으면, 같은 표의 133과 자유 요약 71이 빠집니다. 82에서 4.6배라는 문장으로 읽으면, 현재 트리의 추측 없음 46과 워크로드가 다른 재현 칸이 한 분수로 섞입니다. 127을 0.32.0에서 다시 잰 C1 디코드로 읽으면, 코호트 표의 121.8 / 131.2와 "핀이 네 번 지났다"는 상자가 빠집니다. 카드의 262,144컨텍스트가 이 속도에 포함된다고 읽으면, 기본 64k와 재현 모드 56k와 `CTX=huge`의 67 tok/s가 빠집니다.

채택 쪽에서 이 글이 문서로 보는 비용은 카드 값이 아니라 핀입니다. 패치는 vLLM 0.32.0에 대해 다시 잘려 있고, 속도 표의 다수는 0.27.1 기준이라고 저장소가 스스로 적습니다. 필드 테스트가 묻는 여섯 가지는 카드, 전력 캡, 드라이버, OS 또는 컨테이너, 커밋, 설정 문자입니다. 그 여섯이 없으면 숫자를 위 행 옆에 두지 말라는 문장입니다. 3090을 이미 가진 팀에게 이 스택이 바꾸는 것은 새 GPU 구매가 아니라, 채팅 칸과 인용 칸과 배치 칸을 서로 다른 서비스로 나누는 일입니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·자체 보고라 재현 전 / ❌ 사실 아님

확인 시각은 2026-11-05입니다. 처리량은 작성자가 적은 값이고, 이 글은 다시 재지 않았습니다.

### @Oluwaphilemon1 요약과 @TeksEdge 원문

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| Qwen3.8-27B를 RTX 3090 24GB 한 장에서 서빙하는 공개 저장소가 있다 | ✅ | [HyperQwen](https://github.com/syv-ai/HyperQwen) main `6ab9bd05`, Apache-2.0, 조직 `syv-ai`. 2026-11-05 API의 별은 2,558, 포크는 323입니다. 옛 경로 `syv-ai/qwen38-27b-rtx3090`는 이 저장소로 301입니다. |
| 측정 전력은 250W이다 | ✅ | README, 필드 테스트의 `nvidia-smi -pl 250`, 벤치 표의 "RTX 3090 at 250 W". [NVIDIA 제품 페이지](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/)의 Founders Edition Graphics Card Power는 **350 W**, 메모리는 24 GB GDDR6X, CUDA 코어는 10,496, capability는 8.6입니다. 250W는 그 보드 전력의 캡입니다. |
| 최적화 MTP 114 tok/s, DFlash2 쪽 138, 인용 검증 381 | ⚠️ | 누적 표의 fast MTP는 **약 114 / 118–124**입니다. DFlash2 절의 best run은 **133.8 / 138.5**이고, lookup을 켠 C1은 **130**, `DFLASH_TOKENS=15`의 C1은 **133**, 25k 재현은 **14.97 / 381**입니다. 138과 381은 같은 워크로드가 아닙니다. 381은 자체 보고이고 이 글은 재지 않았습니다. |
| 기준선 82 tok/s에서 4.6배 | ⚠️ | 82 tok/s라는 단일 사용자 기준은 현재 README·최적화 문서·단일 사용자 표·배치 표에서 찾지 못했습니다. 현재 추측 없음 행은 **46 / 46**입니다. 381/82≈4.65는 포스트 두 숫자의 나눗셈이고, 분자는 재현 칸입니다. |
| 평범한 채팅은 약 133 tok/s이고 381은 문맥 재사용 워크로드다 | ✅ | 25k 표의 C1은 **3.42 / 133**, 60줄 재현은 **14.97 / 381**입니다. "only user" 요약은 채팅 133, 재현 **382**입니다. 헤드라인 127과 코호트 디코드 121.8 / 131.2, e2e 127.1은 다른 칸입니다. 0.27.1이라는 경고 상자는 그 코호트 표 위에 있습니다. |
| DFlash2는 보통 7토큰을 제안하고, 검증은 16칸이며 약 15개가 수용된다 | ✅ | 체크포인트 블록은 앵커+7입니다. `DFLASH_TOKENS=15`는 타깃이 16칸을 검증하고 조회가 꼬리를 채웁니다. 재현 행의 스텝당 토큰은 **14.97**입니다. "15 of 16"은 그 값의 반올림입니다. |
| 25k 문서 재현이 260에서 382 tok/s로 오른다 | ⚠️ | `DFLASH_TOKENS=7`의 재현 칸은 **260**입니다. 상세 표의 15칸은 **381**, 요약 표는 **382**, `start_qwen.sh` 주석은 **388 대 259**입니다. 셋 다 저장소 안의 문장이고, 헤드라인은 381을 고릅니다. ±3–5%는 문서가 그리디 편차로 적는 범위입니다. |
| 접두 캐시가 같은 25k 문서의 다음 질문 TTFT를 22.4초에서 0.56초로 줄인다 | ✅ | `single-user/README.md`의 "only user" 절. 22.4/0.56=40은 이 글의 나눗셈입니다. 24k 4턴 표는 약 23초 다음 약 1초대이고, 기준 핀은 0.27.1입니다. 디코드 tok/s 칸이 아닙니다. |
| KV, 헤드, 활성화가 모두 양자화된 채 381이 나온다 | ⚠️ | fast variant는 임베딩 int8, lm_head와 드래프터는 int4/W4A16입니다. 기본 `CTX=fast`의 KV는 bf16입니다. int8 활성화는 단일 사용자 디코드의 기본 스위치가 아닙니다. KV 양자화는 `CTX=long`과 `CTX=huge`입니다. |
| dense 27B이다 | ⚠️ | [모델 카드](https://huggingface.co/Qwen/Qwen3.8-27B)는 "dense model"과 언어 모델 27B를 적고, 같은 개요에 Gated DeltaNet 48블록과 Gated Attention 16블록을 적습니다. dense는 그 카드에서 MoE가 아니라는 뜻입니다. 파이프라인은 `image-text-to-text`입니다. |
| Docker Compose 프로파일 `single`과 `batch`가 있다 | ✅ | `docker-compose.yml`의 `profiles: [single]`, `profiles: [batch]`. 한 GPU는 한 모드입니다. 배치는 `SPEC`을 무시합니다. |

**총평:** HyperQwen은 vLLM 0.32.0 패치와 재양자화 파이프라인으로 Qwen3.8-27B를 24GB 한 장에 올리고, 답이 프롬프트를 그대로 다시 쓸 때 검증 블록을 16으로 늘립니다. 그 칸의 저장소 숫자가 381 tok/s입니다. 느슨한 곳은 그 숫자를 채팅 속도와 한 줄로 읽는 쪽입니다. 같은 표의 짧은 채팅은 133이고, 헤드라인 127은 코호트 e2e 127.1 및 "117–127" 문장과 붙어 있으며, 그 코호트는 0.27.1 기준이라고 저장소가 적습니다. 82에서 4.6배라는 분수는 현재 트리의 기준 행과 맞지 않습니다.

## 참고 자료

- 엔진, main `6ab9bd05cb84b538a6595d634f3e337ac8a80856` — [저장소](https://github.com/syv-ai/HyperQwen) · [README](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/README.md) · [docs/optimizations.md](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/docs/optimizations.md) · [docs/benchmarks.md](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/docs/benchmarks.md) · [single-user/README.md](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/single-user/README.md) · [lookup 패치](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/patches/dflash2-lookup-drafting.patch) · [vLLM 0.32.0 핀](https://github.com/syv-ai/HyperQwen/blob/6ab9bd05cb84b538a6595d634f3e337ac8a80856/docs/vllm-0.32.md)
- 모델 — [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) `1d4bf0f2` · [config.json](https://huggingface.co/Qwen/Qwen3.8-27B/blob/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0/config.json) · 드래프터 [syvai/Qwen3.8-27B-DFlash2-W4A16](https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16) · 원 체크포인트로 문서가 적는 [incoai/Qwen3.8-27B-DFlash2](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2) · [DFlash2 블로그](https://inco.ai/blog/dflash2/) (HyperQwen이 4.80 대 4.28의 출처로 적음. 이 글은 그 숫자를 다시 재지 않았습니다)
- 하드웨어 — [NVIDIA GeForce RTX 3090 / 3090 Ti](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/) (2026-11-05에 읽음. 24 GB GDDR6X, 10,496 CUDA cores, capability 8.6, Founders Edition 350 W)
- 같은 카드의 다른 엔진 — [Don-Chad/ninfer-3090](https://github.com/Don-Chad/ninfer-3090) master `115dee6b` (2026-10-31). 헤드라인 140 tok/s는 그 README의 DFlash2 K=7 기여자 보고입니다. HyperQwen 비교 표의 71.00은 MTP3 칸입니다.
- 요약의 출발점 — [@Oluwaphilemon1](https://x.com/Oluwaphilemon1/status/2117062221108842614) (2026-11-02 01:12 UTC) · 원 영상 스레드 [@TeksEdge](https://x.com/TeksEdge/status/2090595990114037832) (2026-08-21 00:25 UTC). 원문이 가리키는 Reddit `r/LocalLLaMA/comments/1vtup5s/`는 이 환경에서 열리지 않았습니다.
