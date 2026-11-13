---
title: "29GB 노트북인가? Edge0-145B·120B 팩트 체크"
date: 2026-11-13
time: "16:25"
slug: edge0-145b-device-native-100b-moe-open-weights
tags: [Edge0, MoE, 로컬 LLM, 팩트체크]
summary: "Edge0-145B Q3_K의 experts.bin은 40,076,574,720바이트이고, 카드가 적은 상주는 RTX 5090 D에서 VRAM 23.14 GiB와 호스트 RAM 31.28 GiB다. Terminal-Bench 2.1 공식 비교표의 Opus 4.6은 Claude Code 70.1%다."
---

> 이 글은 제가 X에서 북마크해 둔 [@SamuelZengML의 포스트](https://x.com/SamuelZengML/status/2120939739431972922)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2120939739431972922](https://x.com/i/status/2120939739431972922)입니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`(`developer.billing.write` 없음)으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2120939739431972922)(`code` 200)으로 읽었습니다. `created_at`은 `Thu Nov 12 18:00:13 +0000 2026`, **2026-11-13 03:00 KST**입니다. `screen_name`은 `SamuelZengML`, 표시 이름은 Samuel Zeng, 사용자 id는 `886311068`, 팔로워 4,800, `verification.type`은 `individual`, 위치는 San Francisco Bay Area, bio는 Edge0 창업자와 on-device foundation models를 적습니다. 같은 응답의 스냅샷은 답글 117, 리포스트 130, 좋아요 1,007, 북마크 908, 인용 90, 조회 413,287입니다. 커뮤니티 노트는 `null`입니다. 첨부 영상은 44.671초이고, 프레임은 받아 적지 않았습니다. 본문은 Edge0-145B와 Edge0-120B를 장치의 오픈 웨이트 100B급 모델로 소개하고, 노트북에서 클라우드급이며 무료·오프라인이라고 적습니다. 네 줄은 Terminal-Bench 2.1에서 Claude Opus 4.6을 86.5% 대 78.2%로 이긴다는 말, 메모리가 29G로 표준 100G+의 3분의 1이라는 말, RTX Spark와 Mac에서 디코드 75+ tok/s와 프리필 1050+ tok/s라는 말, 128K–256K 문맥에서도 느려지지 않는다는 말입니다. 그 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-13 16:20 KST 전후에 연 1차 자료입니다. [Edge0 블로그](https://edge0.ai/blog/introducing-edge0-145b-frontier-ai-capabilities-on-your-own-computer)의 `<time>`은 `2026-11-12T18:00:00.000Z`이고 화면 날짜는 November 12, 2026입니다. [GitHub Edge0-AI/Edge0](https://github.com/Edge0-AI/Edge0) `main`은 [`b7900cbb`](https://github.com/Edge0-AI/Edge0/commit/b7900cbb322926ccebdcd0c0c5a1280497ecff22)(2026-11-12T15:29:04Z)입니다. 가중치 카드는 [145B NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4) `6aab5f4337`, [145B Q3_K](https://huggingface.co/Edge0/Edge0-145B-q3k) `d7de835c`, [120B NVFP4](https://huggingface.co/Edge0/Edge0-120B-NVFP4) `291b1ee0`, [120B Q3_K](https://huggingface.co/Edge0/Edge0-120B-q3k) `51a60a20`입니다. 네 저장소는 `private: false`, `gated: false`입니다. 파일 바이트는 같은 시각 Hugging Face tree API가 루트에서 돌려준 `size`입니다. 하위 디렉터리 `mtp/`는 그 응답에 없습니다. 앞서 나온 35B 보고서는 [arXiv:2609.18063](https://arxiv.org/abs/2609.18063) v2(제출 2026-09-16, 개정 2026-09-17)입니다. Terminal-Bench 2.1 비교는 [공식 소식](https://www.tbench.ai/news/terminal-bench-2-1)의 표이고, Opus 4.6의 회사 점수는 [시스템 카드](https://www.anthropic.com/claude-opus-4-6-system-card) 2.5절입니다. 가중치는 받지 않았고, 서버를 띄우지 않았고, tok/s를 재지 않았습니다.

## 왜 중요한가

100B급 모델을 자기 기계에서 돌리려면, 벤치마크 한 칸보다 먼저 가중치가 실제로 올라와 있는지, 그 파일이 어느 메모리에 남는지, 그 기계가 노트북인지가 필요합니다.

Edge0는 2026-11-12 UTC에 블로그와 X로 Edge0-145B, Edge0-120B를 열었고, Hugging Face에 빌드 네 개를 올려 두었습니다. 카드는 둘 다 Qwen3.8-Flash-Next에서 나온 latent sparse MoE이고, expert 512개 중 토큰당 10개와 공유 1개를 쓴다고 적습니다. 활성 파라미터가 전체보다 작아도 파일 전체는 어딘가에 있어야 합니다. 이 릴리스가 그 자리를 GPU가 아니라 호스트 RAM과, PLE 표에 대해서는 디스크 읽기로 나눈다고 적습니다.

확인할 질문은 다음입니다.

- 오픈 웨이트 파일이 공개 저장소에 있는지.
- 29G와 노트북, RTX Spark, Mac이 카드의 기계와 같은지.
- 86.5% 대 78.2%가 공식 Terminal-Bench 2.1 행인지, Edge0가 적은 자체 점수인지.
- macOS가 145B·120B의 릴리스 플랫폼인지.

## 기술 설명

### 네 폴더가 공개돼 있다

Hugging Face API의 `createdAt`은 네 저장소 모두 2026-11-11이고, `lastModified`는 2026-11-12입니다. 같은 응답의 `downloads`는 0, `likes`는 NVFP4 145B가 79, Q3_K 145B가 25, NVFP4 120B가 13, Q3_K 120B가 10입니다. `downloads` 0은 그 필드의 값입니다. 파일은 비어 있지 않습니다.

| 저장소 | 리비전 | 루트의 큰 파일 |
|---|---|---|
| [Edge0-145B-NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4) | `6aab5f4337` | `ple-fp8.gguf` 51,200,246,112 · `experts.bin` 47,563,800,576 · `model-skeleton.gguf` 5,991,569,248 · `latent_dense_q8.bin` 3,743,416,320 |
| [Edge0-145B-q3k](https://huggingface.co/Edge0/Edge0-145B-q3k) | `d7de835c` | `ple-fp8.gguf` 51,200,246,112 · `experts.bin` 40,076,574,720 · `model-skeleton.gguf` 5,991,569,248 · `latent_dense_q8.bin` 3,743,416,320 |
| [Edge0-120B-NVFP4](https://huggingface.co/Edge0/Edge0-120B-NVFP4) | `291b1ee0` | `ple-fp8.gguf` 51,200,246,112 · `experts.bin` 33,974,255,616 · `model-skeleton.gguf` 5,991,569,248 · `latent_dense_q4.bin` 1,415,577,600 |
| [Edge0-120B-q3k](https://huggingface.co/Edge0/Edge0-120B-q3k) | `51a60a20` | `ple-fp8.gguf` 51,200,246,112 · `experts.bin` 28,626,124,800 · `model-skeleton.gguf` 5,991,569,248 · `latent_dense_q4.bin` 1,415,577,600 |

`ple-fp8.gguf` 51,200,246,112바이트는 51.200×10^9바이트보다 246,112바이트 큽니다. 카드의 PLE **51.2B**, fp8, memory-mapped와 같은 자릿수입니다. 1 GiB = 2^30바이트로 나누면 47.68 GiB입니다.

카드의 weights GiB가 어느 파일의 합인지는 카드가 적지 않습니다. 아래는 이 글이 `experts.bin`과 기본 D/U 파일을 더해 2^30으로 나눈 값입니다. 145B의 기본 D/U는 Q8, 120B는 Q4라고 모델 페이지가 적고, `model.json`의 `STRATA_LATENT_DENSE`도 그 파일입니다.

- 145B Q3_K: 40,076,574,720 + 3,743,416,320 = 43,819,991,040바이트 = 40.8105 GiB. 카드는 **40.81 GiB**.
- 145B NVFP4: 47,563,800,576 + 3,743,416,320 = 51,307,216,896바이트 = 47.7836 GiB. 카드는 **47.79 GiB**. 차이는 약 6.9×10^6바이트입니다.
- 120B Q3_K: 28,626,124,800 + 1,415,577,600 = 30,041,702,400바이트 = 27.9785 GiB. 카드는 **27.98 GiB**.
- 120B NVFP4: 33,974,255,616 + 1,415,577,600 = 35,389,833,216바이트 = 32.9594 GiB. 카드는 **32.96 GiB**.

이 합에 `ple-fp8.gguf`와 `model-skeleton.gguf`는 들어 있지 않습니다. 받는 폴더의 큰 파일은 카드의 weights 줄보다 깁니다.

`model.json`의 `base_model`은 `Qwen3.8-Flash-Next`이고, `architecture`는 `latent sparse MoE`입니다. Hugging Face 태그의 `base_model`도 `Qwen/Qwen3.8-Flash-Next`입니다. [release-scope.json](https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/6aab5f4337b4c7146dd69130dad4c719f83fca03/release-scope.json)은 업스트림 라이선스 참조 리비전을 `812d96e10a`로 고정하고, `actual_training_base_revision_verified`는 `false`, `actual_training_or_conversion_base_revision`은 `null`입니다. 베이스 이름과 학습에 쓴 커밋은 그 파일에서 다른 문장입니다. Qwen3.8-Flash-Next의 공식 파일과 활성 6B는 [앞 글](https://betelg15.github.io/posts/qwen3-8-flash-next-qwen4-architecture-local-inference/)이 다룹니다.

### 어텐션은 2560, expert만 ℓ로 줄인다

[모델 페이지](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/docs/models/edge0-145b.md)의 아키텍처 표는 이렇습니다.

| | Edge0-145B | Edge0-120B |
|---|---|---|
| 총 파라미터 · 토큰당 활성 | **145B** · **10.12B** | **120B** · **8.64B** |
| 층 | 48. 선형 어텐션 36, 4층마다 indexed attention 1 | 같은 패턴 |
| Expert | 층당 512, 토큰당 routed 10 + shared 1, SwiGLU 폭 640 | 같음 |
| Expert pool | 84.6B, ℓ = **1792** | 60.4B, ℓ = **1280** |
| PLE | **51.2B** n-gram 표, fp8, memory-mapped | 같음 |
| MTP | 1.26B 드래프트, expert 512, speculative decode | 같음 |
| 문맥 | 256K, KV int8, resident 32K | 같음 |
| 빌드 | Q3_K 40.81 GiB · NVFP4 47.79 GiB | Q3_K 27.98 GiB · NVFP4 32.96 GiB |

같은 페이지는 한 층을 이렇게 적습니다. 어텐션은 너비 2560을 읽고 씁니다. **D**가 라우팅 그룹마다 토큰을 ℓ로 내리고, 라우터가 512개 중 10개를 고르고, expert는 ℓ → 640 → ℓ를 계산하고, 공유 expert가 옆에 있으며, **U**가 2560으로 되돌립니다. D와 U는 층당 한 벌입니다. ℓ에서 일하는 것은 expert 512개입니다. 프로필 표는 층마다 D/U 그룹이 8개라고 적습니다. 512 / 8 = 64입니다. 블로그의 “64 expert가 큰 행렬 두 장을 공유한다”는 그 나눗셈과 같습니다.

카드는 145B expert 한 개의 레코드를 **1,630,720바이트**, 120B를 **1,164,800바이트**라고 적습니다. 48 × 512 × 1,630,720 = 40,076,574,720이고, 이 값은 Q3_K `experts.bin`과 같습니다. 48 × 512 × 1,164,800 = 28,626,124,800이고, 120B Q3_K `experts.bin`과 같습니다. NVFP4 145B `experts.bin` 47,563,800,576을 같은 48 × 512로 나누면 1,935,376바이트입니다. “고정 1,630,720바이트”는 Q3_K 파일과 맞고, NVFP4 파일은 그보다 큽니다.

`model.json`의 `active_params`는 145B가 `6.6 B`, 120B가 `6.1 B`입니다. 아키텍처 표의 10.12B, 8.64B와 다릅니다. [edge0-infer 문서](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/edge0-infer/docs/edge0-145b.md)는 `model.json`에서 `model_name`만 읽고 `architecture`, `args`, `env`와 그 나머지 필드는 무시한다고 적습니다. 블로그는 145B 총량 중 스텝마다 약 10B가 계산에 들어간다고 적습니다. 10.12B 쪽은 카드와 블로그가 같이 적는 수이고, 6.6B는 로더가 무시하는 필드입니다.

### 상주는 GPU와 호스트 RAM이고, PLE는 디스크에서 읽을 수 있다

모델 페이지는 expert 일부를 GPU에 두고 나머지를 호스트 메모리에서 스트리밍한다고 적습니다. 비용은 모델 전체가 아니라 상주한 expert 수에 붙는다고 적습니다. `profile.bin`은 GPU에 남길 expert를 고르는 순위입니다. `edge0-infer`의 기본값은 자동 expert 캐시, 자동 프리필, speculative decoding, int8 KV입니다.

PLE는 별도입니다. `--model-option ple-io=`의 기본은 `direct`이고, 문장은 임베딩 표를 필요할 때 디스크에서 읽는 것입니다. `ram`은 메모리에 올립니다. 블로그의 로딩 문단은 자주 쓰는 expert를 GPU에 두고, 약 40GB expert 라이브러리를 시스템 메모리에 두며, 약 48GB 어휘 데이터를 SSD에서 읽는다고 적습니다. 40.81 GiB weights와 47.68 GiB PLE 파일은 그 두 자리와 같은 자릿수입니다. 블로그는 그 문단의 출처를 internal testing이라고 적습니다.

같은 카드가 RTX 5090 D 24GB에서 residency를 켠 상주를 이렇게 적습니다. expert 집합은 서로 겹치지 않고 두 번 세지 않는다고 적습니다.

| 빌드 | 카드의 weights | VRAM | 호스트 RAM | 이 글이 더한 합 |
|---|---:|---:|---:|---:|
| 145B Q3_K | 40.81 GiB | 23.14 GiB | 31.28 GiB | 54.42 GiB |
| 145B NVFP4 | 47.79 GiB | 23.25 GiB | 38.27 GiB | 61.52 GiB |
| 120B Q3_K | 27.98 GiB | 22.93 GiB | 18.40 GiB | 41.33 GiB |
| 120B NVFP4 | 32.96 GiB | 23.02 GiB | 23.40 GiB | 46.42 GiB |

`16 GiB VRAM + 20 GiB RAM` 행은 다른 카드가 아닙니다. 같은 RTX 5090 D를 cgroup으로 그 예산에 가둔 측정이라고 적습니다. 145B NVFP4에는 그 행이 없습니다. [edge0-infer 요구사항](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/edge0-infer/docs/edge0-145b.md)은 GPU 메모리 16 GiB 이상, 시스템 메모리 20 GiB 이상입니다. 모델 페이지는 그 16+20을 일반 최소 사양이 아닌 측정 예산이라고 적습니다. 145B의 상주 호스트 RAM 31.28 GiB와 38.27 GiB는 20 GiB보다 큽니다.

속도 표의 단위는 tok/s이고, 4K·16K는 프리필 길이입니다. 표 안의 수는 저장소가 적은 값입니다.

| 기계 | 빌드 | 4K 프리필 | 16K 프리필 | 채팅 디코드 | 에이전트 디코드 |
|---|---|---:|---:|---:|---:|
| RTX 5090 D 24 GB | 145B Q3_K | 2169.9 | 3554.9 | 99.7 | 121.2 |
| RTX 5090 D 24 GB | 145B NVFP4 | 1839.6 | 3165.7 | 79.6 | 98.3 |
| RTX Spark N1X 60 GiB | 145B Q3_K | 674.0 | 770.3 | 37.7 | 36.7 |
| RTX Spark N1X 60 GiB | 145B NVFP4 | 821.2 | 922.4 | 40.1 | 46.0 |
| Apple M2 Ultra (Metal) | 145B Q3_K | 755.6 | 800.3 | 60.9 | 57.0 |
| RTX Spark N1X 60 GiB | 120B Q3_K | 987.0 | 1081.7 | 47.2 | 68.4 |
| RTX Spark N1X 60 GiB | 120B NVFP4 | 996.4 | 1066.9 | 45.1 | 68.9 |
| Apple M2 Ultra (Metal) | 120B Q3_K | 867.6 | 908.7 | 60.4 | 63.0 |

RTX 4090과 cgroup 행은 모델 페이지에 더 있습니다. 이 표에서 디코드 75를 넘는 Spark·M2 Ultra 칸은 없습니다. 프리필 1050을 넘는 칸은 120B Spark의 16K 두 칸(1081.7, 1066.9)입니다. 145B의 Spark와 M2 Ultra 프리필은 그 아래에 있습니다. M2 Ultra 행에 대해 README는 Metal 측정이며 macOS 릴리스 가용성을 알리는 문장이 아니라고 적습니다.

문맥 필드는 `model.json`의 `context`가 262144입니다. 같은 파일의 인자에는 `--max-context 131072`와 `--kv-resident 32768`이 있습니다. `edge0-infer`의 `--context` 기본값도 131072입니다. 속도 표의 프리필 길이는 4K와 16K입니다. 128K와 256K에서 속도가 같다는 칸은 그 표에 없습니다.

### 35B 논문의 prerouter와 145B의 MTP는 다른 경로다

[arXiv:2609.18063](https://arxiv.org/abs/2609.18063)의 제목은 “The Other Half of the Memory Wall: Serving 35B MoEs from SSD with Trained Routing Prediction”입니다. 저자 소속은 AutoArk이고, 초록은 35B급이 4비트에서 19.5GB이며, prerouter가 다음 층의 라우팅을 토큰 하나 먼저 예측하고 그 예측을 라우팅 자체로 쓰며, 24GB 기계 한 대에서 피크 활성 메모리 3 GiB 안에 약 20 tok/s로 35B MoE를 서빙한다고 적습니다. 저장소의 [prerouter.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/docs/prerouter.md)가 설명하는 대상은 edge0-35b와 edge0-8b입니다. 145B 모델 페이지는 그 헤드를 적지 않습니다. 145B가 적는 앞당기기는 MTP입니다. 드래프트 층이 후보를 내고, `model.json` 인자의 `--spec`은 `4`, `--spec-min-p`는 `0.5`, `--mtp`는 `./mtp`입니다. README의 Q4 로드맵에는 “latent thinking + batched expert pre-prediction”이 아직 할 일로 남아 있습니다.

“4비트로 네이티브 학습”은 README, 카드, 블로그의 문장입니다. 블로그는 클라우드 모델을 학습한 뒤 압축하는 단계로 로컬을 다루지 않는다고 적습니다. 35B 논문의 4비트는 int4 베이스 위의 recovery LoRA입니다. 그 문단의 모델은 35B입니다. 145B의 학습 레시피를 적은 기술 보고서는, 블로그가 “평가 설정과 재현 절차를 기술 보고서와 함께 공개하는 중”이라고 적은 상태입니다. 그 보고서는 이 글이 연 저장소에 없습니다.

### 문서에 있는 실행 명령

플랫폼 표에서 `edge0-145b`와 `edge0-120b`의 Linux는 NVIDIA GPU(CUDA 13), Windows도 NVIDIA GPU(CUDA 13)입니다. macOS, iOS, Android 칸은 대시입니다. 같은 열의 `edge0-35b`는 macOS Metal·CPU, iOS Metal, Android CPU를 적습니다. [edge0-strata/EDGE0.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/edge0-strata/EDGE0.md)는 이 포크에서 `metal/`을 뺐다고 적습니다. 엔진은 [Strata](https://github.com/Niko1221/Strata) 포크이고 MIT이며, 프레임워크 코드는 Apache-2.0입니다.

README는 실행 명령을 `edge0-infer/`에서 돌리라고 적습니다. 빌드는 그 파일의 edge0-strata 절과 edge0-infer 절을 따른 뒤의 명령입니다. 플래그는 그 파일에 있는 것만 적습니다.

```bash
git clone https://github.com/Edge0-AI/Edge0.git edge0
```

```bash
build/cpu/bin/edge0-infer serve --model /path/to/Edge0-145B-q3k
```

준비되면 `Listening: http://127.0.0.1:8000 model=edge0_145b`를 찍는다고 적습니다. 이어서 적은 호출은 이렇습니다.

```bash
curl localhost:8000/v1/chat/completions -H 'content-type: application/json' -d '{"model":"edge0_145b","messages":[{"role":"user","content":"hi"}],"max_tokens":64}'
```

Windows 바이너리 경로는 `build\windows\bin\edge0-infer.exe`입니다. `chat`은 같은 `--model`로 대화 세션을 엽니다. `run`은 네이티브 엔진 쪽이고, 145B·120B는 `serve`, `chat`, `inspect`만 받는다고 한계 절이 적습니다. 이 글은 명령을 실행하지 않았습니다.

## 비즈니스 인사이트

숫자 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다.

**품질 표는 Edge0의 표입니다.** [모델 페이지](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/docs/models/edge0-145b.md)는 점수를 모델 단위로 적고, Q3_K와 NVFP4를 나눠 재지 않았다고 적습니다.

| 모델 | DeepSWE 1.1 | Terminal-Bench 2.1 | AA-LCR | IFBench | GPQA-Diamond | HLE |
|---|---:|---:|---:|---:|---:|---:|
| Edge0-145B | 64.6 | 86.5 | 79.3 | 80.6 | 90.4 | 35.4 |
| Edge0-120B | 51.3 | 75.3 | 81.0 | 79.3 | 87.4 | 31.0 |
| Qwen3.8-Flash-Next | 58.7 | 83.3 | 79.1 | 81.3 | 91.7 | 35.9 |
| Claude-Opus-4.6 (Max) | / | 78.2 | 78.0 | 62.5 | 91.3 | 40.0 |

블로그 표의 145B Terminal-Bench는 **86.52**이고, 120B는 DeepSWE **53.6**, Terminal-Bench **81.3**입니다. 나머지 120B 칸은 모델 페이지와 같습니다. 블로그는 “Edge0, Qwen, DeepSeek, Claude 결과는 Edge0의 내부 평가”라고 적고, 재현 절차는 기술 보고서와 함께 나오는 중이라고 적습니다. Qwen3.8-Flash-Next의 DeepSWE 58.7은 그 모델 카드에도 있는 수이고, 각주가 두 하네스 중 높은 점수라고 구분한 내용은 [앞 글](https://betelg15.github.io/posts/qwen3-8-flash-next-qwen4-architecture-local-inference/)에 있습니다.

공식 [Terminal-Bench 2.1 소식](https://www.tbench.ai/news/terminal-bench-2-1)의 2.0 대 2.1 비교에서 Opus 4.6 (Claude Code)는 58.0%에서 70.1%로, Opus 4.6 (Terminus 2)는 62.9%에서 63.8%로 적혀 있습니다. 그 페이지에서 78.2와 Edge0는 검색되지 않습니다. [시스템 카드](https://www.anthropic.com/claude-opus-4-6-system-card) 표 2.3.A의 Terminal-Bench는 **2.0**이고 Opus 4.6은 **65.4%**입니다. 2.5절은 Harbor의 Terminus-2, 기본 파서, adaptive thinking, max effort, 89과제 × 15회(1,335 trials)라고 적습니다. 낮은 effort는 55.1%, 중간 effort는 61.1%입니다. 같은 표의 GPQA Diamond 91.3%는 Edge0 표의 Claude 칸과 같습니다. Terminal-Bench 칸은 버전과 점수가 다릅니다. [발표 글](https://www.anthropic.com/news/claude-opus-4-6)은 Terminal-Bench 2.0에서 가장 높은 점수라고 적고, 2.1이라는 단어는 그 HTML에 없습니다.

**(분석)** 클라우드 프런티어 API가 아직 갖고 있는 것은 제3자가 표를 관리하는 점수와, 그 점수의 하네스 이름입니다. Edge0가 연 것은 가중치와, 그 가중치로 자기 기계에서 에이전트를 돌리겠다는 엔진입니다. 86.5가 70.1보다 큰 것은 Edge0 내부 표와 공식 비교표를 한 실험으로 둔 뒤에야 말할 수 있는 문장입니다. 블로그는 그 실험을 아직 보고서로 열지 않았다고 적습니다.

**라이선스는 두 겹입니다.** 프레임워크는 Apache-2.0, edge0-strata는 MIT입니다. 모델의 Edge0 기여분은 [Edge0 Community Model License 1.0](https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/6aab5f4337b4c7146dd69130dad4c719f83fca03/LICENSE)(2026-11-12)입니다. 3절은 개인 사용, 연구, 비상업 공유, 내부 사용, 출력의 상업 사용에 Edge0의 별도 허락이 없다고 적습니다. 4절은 그 앞에서 멈춥니다. 가중치·어댑터를 팔거나, 제3자에게 추론·파인튜닝을 유료 API로 제공하거나, 코딩·사무 생산성이 주 목적인 독립 제품을 유료로 제공하면 Edge0의 서면 라이선스가 필요합니다. 마지막 항은 추론이 서버든 사용자 기기든 같다고 적습니다. 연락처는 info@edge0.ai입니다.

[Qwen Community License 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/812d96e10a0dd82b69d749e68693698cf6c36daa/LICENSE)은 그 옆에 그대로 있습니다. 월간 활성 사용자 1억 또는 월 매출 2,000만 달러를 넘는 상업 제품은 모델 이름을 사용자 인터페이스에 표시해야 합니다. Model as a Service이거나, 코딩·사무 생산성이 주 목적인 독립 AI 제품이면 상업적 사용 전에 Qwen의 별도 라이선스가 필요합니다. 제3자에게 모델과 출력과 능력을 열지 않는 내부 사용은 그 요건에서 빠집니다. NOTICE는 Edge0의 허락이 Qwen의 허락을 대신하지 않는다고 적습니다.

**(분석)** 이득이 문장으로 닫히는 쪽은, Linux 또는 Windows에 CUDA 13 NVIDIA GPU가 있고 호스트 RAM이 카드의 상주 줄(145B Q3_K면 31.28 GiB)을 담으며, 코드를 밖으로 보내지 않는 내부 에이전트를 감수할 수 있는 팀입니다. 제약이 큰 쪽은 트윗의 Mac·노트북 문장으로 설치를 시작한 사람과, 코딩 어시스턴트를 제품으로 파는 조직입니다. 후자는 Edge0 4절 (c)와 Qwen의 AI Work Assistant 조항을 둘 다 만납니다. API로 충분한 쪽은 공식 리더보드의 하네스와 지원 계약을 사는 쪽입니다. 이 글은 Claude의 토큰 단가를 다시 열지 않았습니다.

**(분석)** 로컬의 비용은 트윗의 “토큰 청구서가 없다”는 문장 옆에, 카드의 상주와 빌드 시간이 붙습니다. RTX 5090 D 24GB는 속도 표의 기준 기계이고, 그 행의 145B는 VRAM 23 GiB대에 호스트 RAM 31–38 GiB를 더합니다. 블로그가 적은 약 120W는 그 글의 보고 전력입니다. 전기요금과 카드 가격은 이 글이 열지 않았습니다. 29GB 피크와 MacBook Pro는 블로그에 있고, 엔진 README의 플랫폼 표에는 macOS 칸이 비어 있습니다. 채택을 가리는 것은 파라미터 이름보다, 마케팅 페이지와 빌드 문서가 서로 다른 기계를 가리키는지입니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 수는 있으나 범위가 다르거나, 출처끼리 다르거나, 재현 절차가 없음 / ❌ 1차 자료와 어긋남

원본은 [@SamuelZengML, 2026-11-13 03:00 KST](https://x.com/i/status/2120939739431972922)입니다. 처리량과 벤치마크는 각 문서가 적은 값이고, 이 글은 다시 재지 않았습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| Edge0-145B와 Edge0-120B 오픈 웨이트가 Hugging Face에 있다 | ✅ | 네 저장소 모두 공개, 비가팅. Q3_K `experts.bin`은 145B 40,076,574,720바이트, 120B 28,626,124,800바이트. `createdAt`은 2026-11-11. |
| Qwen3.8-Flash-Next에서 나온 latent sparse MoE다 | ✅ | `model.json`의 `base_model`, HF 태그, NOTICE. 학습 커밋은 release-scope가 검증하지 않았다고 적습니다. |
| 48층, expert 512, K=10, 공유 1, ℓ 1792 또는 1280 | ✅ | 모델 페이지와 네 `model.json`. |
| PLE 51.2B, MTP, 문맥 256K | ✅ | 아키텍처 표. `ple-fp8.gguf`는 51,200,246,112바이트. MTP는 `mtp/`와 `--spec 4`. `context`는 262144. |
| Q3_K와 NVFP4 빌드가 있다 | ✅ | 폴더 네 개. `experts.bin`과 기본 D/U를 더한 값은 145B Q3_K 40.8105 GiB, 120B Q3_K 27.9785 GiB, 120B NVFP4 32.9594 GiB라 카드의 두 자리와 같고, 145B NVFP4는 47.7836 GiB라 카드의 47.79 GiB보다 약 6.9×10^6바이트 작다. |
| `edge0-infer`가 `edge0-strata`를 띄운다 | ✅ | README와 `edge0-145b.md`의 `serve` 명령. 이 글은 실행하지 않았습니다. |
| Linux·Windows의 NVIDIA GPU, CUDA 13에서 돌린다고 문서가 적는다 | ✅ | README 플랫폼 표. 데스크톱 앱 절은 Windows Edge0 Chat입니다. |
| macOS에서 145B·120B를 릴리스로 지원한다 | ❌ | README 플랫폼 표의 macOS 칸은 대시입니다. M2 Ultra 행은 “macOS 릴리스 가용성이 아니다”라고 적습니다. EDGE0.md는 `metal/`을 제거했다고 적습니다. 블로그는 day-one에 macOS, Windows, Linux와 Apple M 시리즈를 적습니다. |
| 단일 RTX 5090 D 24GB와 호스트 RAM에 상주 구성이 적혀 있다 | ⚠️ | 카드가 그 기계의 VRAM·RAM 상주를 적습니다. 145B Q3_K는 23.14 + 31.28 GiB입니다. 측정값은 자체 보고이고 이 글은 재지 않았습니다. |
| 145B가 메모리 29G면 되고, 그것은 100G+의 3분의 1이다 | ⚠️ | 트윗의 29G와 100G+. 블로그는 피크 29GB, 본문 다른 줄은 28GB, 로딩 문단은 expert 라이브러리 약 40GB라고 적습니다. 비교 표는 145B와 120B 모두 29GB입니다. 카드의 145B 상주 합은 54.42 GiB(Q3_K)와 61.52 GiB(NVFP4)입니다. 100G+는 이름 붙은 모델의 측정이 아닙니다. 블로그가 Qwen3.8-Flash-Next의 표준 4비트로 적은 약 70GB는 추정치이고, 아직 측정 전이라고 적습니다. |
| 노트북, 예를 들어 MacBook Pro에서 145B가 돈다 | ⚠️ | 블로그의 문장입니다. 속도 표의 기준 기계는 RTX 5090 D 24GB이고, Apple 행은 M2 Ultra이며 릴리스 가용성이 아니라고 적습니다. |
| RTX Spark와 Mac에서 디코드 75+ tok/s, 프리필 1050+ tok/s | ❌ | 속도 표에서 Spark·M2 Ultra의 디코드는 145B 최대 60.9, 120B 최대 68.9입니다. 프리필 1050을 넘는 것은 120B Spark의 16K뿐입니다. 145B Spark 16K는 770.3과 922.4입니다. |
| 128K–256K에서도 속도가 유지된다 | ⚠️ | 모델 문맥은 256K, KV resident는 32K, `edge0-infer` 기본 `--context`는 131072입니다. 속도 표는 4K와 16K 프리필입니다. |
| Terminal-Bench 2.1에서 Opus 4.6을 86.5% 대 78.2%로 이긴다 | ❌ | 86.5와 78.2는 Edge0 표에 있습니다. 블로그는 Claude 칸을 내부 평가라고 적고, 145B는 86.52로 적습니다. 공식 2.1 비교의 Opus 4.6은 Claude Code 70.1%, Terminus 2 63.8%입니다. 시스템 카드의 Opus 4.6은 Terminal-Bench **2.0**, Terminus-2, max effort **65.4%**입니다. |
| 4비트로 처음부터 학습했다 | ⚠️ | README·카드·블로그의 주장입니다. release-scope는 학습 리비전을 검증하지 않았다고 적습니다. 재현 보고서는 블로그가 “공개하는 중”이라고 합니다. |
| 토큰 요금 없이 무료로 쓸 수 있다 | ⚠️ | Edge0 라이선스 3절은 개인·내부 사용에 Edge0 요금이 없다고 적습니다. 4절 (c)는 유료 독립 코딩 어시스턴트에 서면 라이선스를 요구합니다. Qwen 라이선스의 AI Work Assistant 조항은 별도입니다. |
| 120B의 Terminal-Bench가 한 수로 적혀 있다 | ⚠️ | 모델 페이지는 75.3, 블로그는 81.3입니다. DeepSWE도 51.3과 53.6으로 갈립니다. |

**총평:** Edge0-145B와 Edge0-120B의 Q3_K·NVFP4 가중치는 2026-11-11에 만들어진 공개 Hugging Face 저장소에 있고, Q3_K expert 파일 크기는 카드의 레코드 크기 × 48 × 512와 같습니다. 엔진 문서가 적는 145B·120B 플랫폼은 Linux·Windows의 NVIDIA GPU와 CUDA 13입니다. 카드가 RTX 5090 D에 적은 145B 상주는 VRAM 23 GiB대와 호스트 RAM 31–38 GiB입니다. 트윗의 29G, 노트북, Spark·Mac의 75+ / 1050+는 그 표와 다릅니다. Terminal-Bench 2.1의 86.5 대 78.2는 Edge0 내부 표의 칸이고, 공식 비교표의 Opus 4.6은 Claude Code 70.1%와 Terminus 2 63.8%이며, 앤트로픽이 출판한 Opus 4.6 점수는 Terminal-Bench 2.0의 65.4%입니다.

## 참고 자료

- 가중치 — [Edge0-145B-NVFP4](https://huggingface.co/Edge0/Edge0-145B-NVFP4) `6aab5f4337` · [Edge0-145B-q3k](https://huggingface.co/Edge0/Edge0-145B-q3k) `d7de835c` · [Edge0-120B-NVFP4](https://huggingface.co/Edge0/Edge0-120B-NVFP4) `291b1ee0` · [Edge0-120B-q3k](https://huggingface.co/Edge0/Edge0-120B-q3k) `51a60a20`. API 2026-11-13: 네 저장소 `downloads` 0, likes 79 / 25 / 13 / 10
- 모델 문서 — [docs/models/edge0-145b.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/docs/models/edge0-145b.md) · [edge0-infer/docs/edge0-145b.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/edge0-infer/docs/edge0-145b.md) · [edge0-strata/EDGE0.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/edge0-strata/EDGE0.md) · [README `b7900cbb`](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/README.md). API의 스타 10,568, 포크 1,613, `pushed_at` `2026-11-12T15:29:26Z`
- 블로그 — [Introducing Edge0-145B](https://edge0.ai/blog/introducing-edge0-145b-frontier-ai-capabilities-on-your-own-computer), `<time>` `2026-11-12T18:00:00.000Z`
- 35B 보고서 — [arXiv:2609.18063](https://arxiv.org/abs/2609.18063) v2, 2026-09-17. 초록의 19.5GB, 약 20 tok/s, 3 GiB는 35B 문장이다. [prerouter.md](https://github.com/Edge0-AI/Edge0/blob/b7900cbb322926ccebdcd0c0c5a1280497ecff22/docs/prerouter.md)
- 벤치마크 — [Terminal-Bench 2.1 소식](https://www.tbench.ai/news/terminal-bench-2-1) (Opus 4.6 Claude Code 58.0% → 70.1%, Terminus 2 62.9% → 63.8%). [Claude Opus 4.6 시스템 카드](https://www.anthropic.com/claude-opus-4-6-system-card) 2.5절, Terminal-Bench 2.0, Terminus-2, 65.4%. [발표 글](https://www.anthropic.com/news/claude-opus-4-6)
- 라이선스 — [Edge0 Community Model License 1.0](https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/6aab5f4337b4c7146dd69130dad4c719f83fca03/LICENSE) · [NOTICE](https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/6aab5f4337b4c7146dd69130dad4c719f83fca03/NOTICE) · [release-scope.json](https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/6aab5f4337b4c7146dd69130dad4c719f83fca03/release-scope.json) · [Qwen Community License 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/812d96e10a0dd82b69d749e68693698cf6c36daa/LICENSE) `812d96e10a`
- 베이스 모델의 다른 글 — [Qwen3.8-Flash-Next 팩트 체크](https://betelg15.github.io/posts/qwen3-8-flash-next-qwen4-architecture-local-inference/)
- X — [SamuelZengML 2120939739431972922](https://x.com/i/status/2120939739431972922). fxtwitter로 읽음. X API는 `billing-scope-missing`
