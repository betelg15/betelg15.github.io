---
title: "수 초 스캔으로 최적 LLM? llmfit 팩트 체크"
date: 2026-11-10
time: "19:24"
slug: llmfit-local-llm-hardware-fit
tags: [llmfit, 로컬 LLM, llama.cpp, Ollama, 팩트체크]
summary: "v1.1.20은 이 호스트에서 system 0.009초, fit 5건 0.440초였다. CPU뿐인 MoE는 카탈로그 min RAM을 쓰고, 문서의 Mixtral 활성 VRAM ~6.6GB와 info가 찍은 7.7GB는 다르다."
---

> 이 글은 제가 X에서 북마크해 둔 [@EngMoElgaraihy의 포스트](https://x.com/EngMoElgaraihy/status/2119789009601708049)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2119789009601708049](https://x.com/i/status/2119789009601708049)입니다. 표시 이름은 Mo Elgaraihy, `screen_name`은 `EngMoElgaraihy`, 사용자 id는 `1759922300671975424`입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2119789009601708049)(`code` 200)으로 읽었습니다. `created_at`은 `Mon Nov 09 13:47:38 +0000 2026`, **2026-11-09 22:47 KST**입니다. `lang`은 `ar`, `is_note_tweet`은 true입니다. 같은 응답의 스냅샷은 답글 2, 리포스트 16, 좋아요 153, 북마크 169, 인용 0, 조회 7,311입니다. `verification.type`은 `individual`, 팔로워는 60,159입니다. 첨부 영상은 856×704, 길이 46.39초이고, 퍼블리셔는 `@alextalksai`의 [상태 2119444759823446379](https://x.com/alextalksai/status/2119444759823446379)입니다. 그 글의 fxtwitter 본문은 도구 이름을 llmfit이라고 적습니다. 아랍어 본문에는 저장소 이름이 없고, “GitHub 링크는 첫 댓글”이라고만 적습니다. 답글 본문은 이 환경에서 읽지 못했습니다. 영상 프레임은 받아 적지 않았습니다. 읽은 시각은 2026-11-10 19:16 KST 무렵입니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 아랍어 본문이 말하는 것은 이렇습니다. 무료 오픈소스 도구가 CPU, GPU, RAM을 수 초 안에 검사하고, 받기 전에 기기 능력과 모델 요구를 비교하고, 기기가 가장 효율적으로 돌릴 수 있는 모델의 정렬된 목록을 준다. 무작위로 받아 메모리를 잡아먹고 시스템을 멈추게 하는 일을 끝내 주며, 버튼 한 번으로 로컬 실행을 바로 시작한다는 문장도 있습니다.
>
> 아래 대조는 2026-11-10(KST)에 연 1차 자료입니다. 소스 인용은 `main` `7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9`(커밋 시각 `2026-11-09T21:31:22Z`)입니다. 실행은 릴리스 [v1.1.20](https://github.com/AlexsJones/llmfit/releases/tag/v1.1.20)(`2026-11-03T17:39:35Z`)의 `x86_64-unknown-linux-gnu` 바이너리입니다. 가중치는 받지 않았고, llama.cpp도 이 호스트에 없어 `llmfit run`은 호출하지 않았습니다.

## 왜 중요한가

로컬 LLM을 고를 때 먼저 막히는 숫자는 벤치마크 점수가 아니라 메모리입니다. 가중치 파일, 양자화에 따른 바이트, 문맥이 늘릴 KV 캐시, GPU에 다 안 들어갈 때의 CPU 오프로드가 한 번에 움직여서, 디스크에 다 받은 뒤에야 “안 올라간다”를 알게 되는 경우가 있습니다.

[llmfit](https://github.com/AlexsJones/llmfit)은 그 순서를 바꾸겠다는 도구입니다. README의 한 줄은 “Hundreds of models & providers. One command to find what runs on your hardware.”입니다. GitHub API가 2026-11-10에 돌려준 스타는 **38,870**, 포크는 **2,511**, 라이선스 SPDX는 **MIT**, 기본 언어는 Rust, `created_at`은 `2026-02-15T16:11:31Z`입니다. 사용자 [AlexsJones](https://github.com/AlexsJones)의 `name`은 Alex Jones입니다. `LICENSE` 첫 줄은 MIT License, 저작권은 “Copyright (c) 2026 Alex Jones”입니다.

확인할 질문은 “로컬 모델을 추천해 주는 프로그램이 있는가”보다 다음입니다.

- 하드웨어를 실제로 읽는지, 그 읽기가 수 초 안에 끝나는지.
- 비교가 가중치 다운로드 전에 끝나는지.
- 정렬이 “가장 효율적인 모델”인지, 다른 가중합인지.
- 메모리 숫자가 측정인지, 파라미터 수에 계수를 곱한 추정인지.
- 버튼 한 번이 추론 프로세스를 띄우는지.

## 기술 설명

### 저장소가 품고 있는 목록

모델 목록은 `llmfit-core/data/hf_models.json`에 있고, 빌드할 때 바이너리에 들어갑니다. 위 커밋의 그 파일 git blob은 `c91df9db4d2dddb08c8c432999c1da85947dc04a`, 크기는 17,293,734바이트입니다. JSON 배열 길이는 **19,192**이고, `name`도 19,192개로 겹치지 않습니다. `provider` 문자열은 **6,119**종입니다. 이 필드는 Hugging Face 조직·게시자 이름입니다. 추론 런타임 개수가 아닙니다. `is_moe`가 true인 행은 **3,564**개입니다.

`format` 개수: `gguf` 15,606, `safetensors` 1,391, `mlx` 1,339, `awq` 441, `gptq` 282, `autoround` 123, 필드가 없는 행 10. README의 “Hundreds”는 이 파일의 행 수보다 작습니다. 최종 사용자 카탈로그는 릴리스에 구워집니다. v1.1.20에서 `llmfit list --json`의 배열 길이는 **18,044**였습니다. `main`의 19,192와 같은 파일이 아닙니다.

[docs/how-it-works.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/how-it-works.md)는 목록을 Hugging Face API에서 `scripts/scrape_hf_models.py`로 만든다고 적습니다. 같은 문서가 이름으로 드는 계열은 Meta Llama, Mistral, Qwen, Gemma, Phi, DeepSeek, Granite, OLMo, Grok, Cohere, BigCode, 01.ai, Upstage, Falcon, Hugging Face, GLM, Kimi, ERNIE입니다. 19,192행이 그 이름들만으로 이루어져 있다는 뜻은 아닙니다. 상위 `provider`에는 `facebook` 1,089, `mlx-community` 621, `unsloth` 440, `Alibaba` 352, `nvidia` 248도 있습니다.

### 하드웨어를 읽는 곳

[docs/how-it-works.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/how-it-works.md)와 `llmfit-core/src/hardware.rs`의 `detect()`는 같은 방향입니다.

- RAM과 CPU 코어는 `sysinfo`입니다. 바이트를 `1024³`으로 나눠 GiB로 둡니다. `available_memory`가 0이면 폴백이 있습니다.
- NVIDIA는 `nvidia-smi`이고, 비면 Linux sysfs입니다. 여러 장의 VRAM을 더합니다. 문서에는 보고가 실패하면 GPU 이름에서 VRAM을 추정하는 폴백이 있다고 적혀 있습니다.
- AMD는 `rocm-smi` 또는 sysfs입니다. [플랫폼 문서](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/platform-support.md)는 AMD와 Ascend에서 “VRAM may be unknown”이라고 적습니다.
- Intel Arc 독립 GPU는 sysfs `mem_info_vram_total`, 내장은 `lspci`입니다.
- Apple Silicon은 `system_profiler`이고, 문서의 문장은 “VRAM = system RAM”입니다.
- Ascend는 `npu-smi`입니다.
- 독립 GPU의 핏 풀은, 여유 VRAM을 알면 그 값과 총량 중 작은 쪽입니다. 통합 메모리는 총량을 씁니다. `gpu_fit_pool_gb` 주석이 그렇게 적습니다.

이 글의 호스트에서 v1.1.20 `llmfit system --json`은 GPU 0, 백엔드 `CPU (x86)`, CPU `Intel(R) Xeon(R) Processor` 4코어, 총 RAM 15.63GB, 가용 RAM 4.88GB를 출력했습니다. 직후의 `recommend --json`은 가용 RAM을 4.8GB로 적었습니다. 가용 RAM은 그 순간의 여유 메모리입니다. llama.cpp 제공자는 `available: false`, 힌트는 `not in PATH, set LLAMA_CPP_PATH`였습니다.

같은 바이너리를 bash `TIMEFORMAT='%R'`로 재었습니다. `llmfit system --json`은 **0.009초**, `llmfit fit -n 5`는 **0.440초**였습니다. 한 대의 4코어 VM, 한 번씩입니다. 저장소는 이 시간을 스펙으로 적지 않습니다.

### 메모리를 만드는 식

기본 추정 문맥은 `DEFAULT_ESTIMATION_CTX` = **8,192**입니다. `fit.rs`는 모델이 광고하는 최대 문맥(예: 262,144)으로 KV를 잡으면 과대 추정이라고 주석합니다. 지정하지 않으면 `min(모델 문맥, 8192)`입니다. `--max-context`가 있으면 그 값으로 다시 제한합니다. CLI 문서는 이 플래그가 없으면 `OLLAMA_CONTEXT_LENGTH`를 쓴다고 적습니다.

가중치 크기는 `params_b() * quant_bpp(quant)`입니다. `params_b`는 `parameters_raw / 1_000_000_000`입니다. 10진 GB로 취급하는 곱입니다. `quant_bpp`의 일부는 이렇습니다.

| 양자화 | `quant_bpp` (메모리) | `quant_bytes_per_param` (대역폭 추정) |
|---|---|---|
| Q8_0 | 1.05 | 1.0 |
| Q6_K | 0.80 | 0.75 |
| Q5_K_M | 0.68 | 0.625 |
| Q4_K_M, Q4_0 | 0.58 | 0.5 |
| Q3_K_M | 0.48 | 0.375 |
| Q2_K | 0.37 | 0.25 |
| mlx-4bit | 0.55 | 0.5 |
| mlx-8bit | 1.0 | 1.0 |
| AWQ-4bit, GPTQ-Int4, AutoRound-4bit | 0.5 | 0.5 |

모르는 라벨은 메모리 쪽에서 0.58, 대역폭 쪽에서 0.5입니다. 같은 이름의 양자화가 두 표를 탑니다.

`estimate_memory_gb_with_kv`는 주석 그대로 **가중치 + KV 캐시 + 런타임 오버헤드**입니다. 오버헤드는 상수 **0.5**입니다. 기본 KV dtype은 fp16입니다.

KV는 층 수, KV 헤드 수, `head_dim`이 있으면 이 식입니다.

```text
kv_bytes = 2 * n_layers * n_kv_heads * head_dim * ctx * dtype_bytes
```

바이트를 `2^30`으로 나눕니다. 전체 어텐션 층만 문맥에 비례하고, linear/SSM 층의 순환 상태는 이 KV에 넣지 않는다고 주석합니다. MLA(`deepseek_v2`, `deepseek_v3`, `kimi_k2` 등)는 K·V를 헤드마다 두지 않고, 폭 576의 압축 잠재 벡터로 계산합니다. 메타데이터가 없으면 `0.000008 * params_b * ctx`에 dtype 비율을 곱하는 폴백입니다.

양자화 사다리는 품질이 높은 쪽부터 `Q8_0`, `Q6_K`, `Q5_K_M`, `Q4_K_M`, `Q3_K_M`, `Q2_K`입니다. MLX는 `mlx-8bit`, `mlx-4bit`입니다. 예산 안에 들어오는 가장 높은 품질을 고르고, 하나도 없으면 문맥을 한 번 반으로 줄여 1024 이상일 때 다시 봅니다. 예산은 풀의 **98%**입니다. `quant_budget`이 `pool * 0.98`입니다.

핏 등급은 `memory_required / memory_available` 하나입니다.

| 사용률 | 등급 |
|---|---|
| 60% 이하 | Perfect |
| 85% 이하 | Good |
| 98% 이하 | Marginal |
| 98% 초과 | Too Tight |

GPU와 텐서 병렬만 Perfect에 닿습니다. MoE 오프로드, CPU+GPU, CPU는 Perfect여도 Good으로 내립니다. `fit.rs` 주석은 Perfect를 “여유 있게 들어가고, GPU에서 돈다”로 정의합니다. `recommended_ram_gb`는 판정에 쓰지 않습니다. 주석은 그 필드를 카탈로그 전역의 `model_size × 2.0` 휴리스틱이라고 부릅니다.

속도의 기본 식은, GPU 대역폭을 알 때 `(bandwidth_GB_s / model_size_GB) × 0.55`입니다. 0.55는 TUI `A`로 바꾸는 기본 효율입니다. 대역폭을 모르면 백엔드 상수입니다. CUDA 220, Metal 160, ROCm 180, SYCL 100, CPU ARM 90, CPU x86 70, Ascend 390. 폴백은 `K / params_b × quant_speed_multiplier`입니다. 프리필은 fp16 TFLOPS를 알 때만 `prefill_tps`와 `ttft_ms`를 채우고, 모르면 `null`입니다.

신뢰도는 `measured_local`, `measured_community`, `calibrated`, `estimated`, `unsupported` 중 먼저 맞는 것입니다. 커뮤니티 측정은 `llmfit bench`가 저장하고, `--share`가 장치 흐름으로 이 저장소에 PR을 연다고 README가 적습니다.

### MoE와 오프로드

카탈로그의 `mistralai/Mixtral-8x7B-Instruct-v0.1`은 `parameters_raw` 46,702,792,704, `active_parameters` 12,900,000,000, 전문가 8 중 활성 2, 문맥 32,768, 양자화 필드 `Q4_K_M`, `min_vram_gb` 23.9, `min_ram_gb` 26.1, `recommended_ram_gb` 43.5입니다. 층 32, KV 헤드 8, `head_dim` 128, `format`은 `gguf`, 라이선스 필드는 `apache-2.0`입니다.

`moe_active_vram_gb_at`은 활성 파라미터에 `quant_bpp`를 곱해 `2^30`으로 나누고 **1.1**을 곱합니다. 하한은 0.5입니다.

```python
active = 12_900_000_000
bpp = 0.58  # quant_bpp("Q4_K_M")
gib = (active * bpp) / (1024 ** 3) * 1.1
# gib == 7.665
```

v1.1.20 `llmfit info "mistralai/Mixtral-8x7B-Instruct-v0.1"`은 “Active VRAM: **7.7 GB** (vs 23.9 GB full model)”를 출력했습니다. 같은 화면의 디스크 추정은 Q4_K_M **27.1 GB**입니다. `46,702,792,704 / 1e9 * 0.58`은 27.088이고, 화면의 Q8_0 49.0, Q6_K 37.4, Q5_K_M 31.8, Q3_K_M 22.4, Q2_K 17.3도 같은 `quant_bpp` 표와 소수 한 자리에서 맞습니다.

[how-it-works.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/how-it-works.md)의 문장은 다릅니다. Mixtral 8x7B가 총 46.7B, 토큰당 약 12.9B이고, 전문가 오프로드가 VRAM을 23.9GB에서 **약 6.6GB**로 줄인다고 적습니다. 6.6은 활성 파라미터에 대역폭 표의 0.5바이트를 넣어 1.1을 곱한 값과 같습니다. `(12_900_000_000 * 0.5) / 2^30 * 1.1`은 6.608입니다. 문서의 예와, 소스의 `quant_bpp` 경로와, v1.1.20이 찍은 7.7은 한 숫자가 아닙니다.

오프로드가 성립하려면 활성 쪽 VRAM이 GPU 풀 안이고, 비활성 전문가 RAM이 가용 RAM 안이어야 합니다. 비활성 RAM은 `(총 파라미터 − 활성 파라미터) * quant_bpp / 2^30`입니다. 이 행에 Q4_K_M을 넣으면 약 **18.3 GiB**입니다. 이 계산은 함수를 카탈로그 숫자에 적용한 것이고, 아래 실행은 그 분기를 타지 않았습니다.

GPU가 없으면 `cpu_path`가 MoE에 대해 다른 숫자를 씁니다. 주석과 함께 `min_ram_gb`를 요구 메모리로 반환합니다. 노트 문장은 “MoE architecture, but expert offloading requires a GPU”입니다. v1.1.20 info가 이 호스트에서 출력한 문장도 그것이고, 사용률은 **537.8% (26.1 / 4.9 GB)** 였습니다. 26.1은 카탈로그 `min_ram_gb`입니다. 상태 🔴 Too Tight, 런 모드는 CPU, 추정 속도 1.9 tok/s, 전체 점수 43.2, 분해는 Quality 79, Speed 5, Fit 0, Context 100, 신뢰도는 `estimated`였습니다. 노트는 추정 문맥을 8192로 잘랐고 모델 문맥은 32768이라고 적었습니다. 같은 화면은 “Baseline error band is roughly +/-30%”라고 적습니다. 그 문장은 이 바이너리의 출력이고, 제가 별도 오차 실험을 한 값은 아닙니다.

조밀 모델이 풀에 들어가면 경로는 다릅니다. 먼저 돌린 `fit -n 5` 표의 1위는 `AlignmentResearch/Llama-3.3-Tiny-Instruct-boolq`, 75M, 점수 77, Q8_0, CPU, 상태 Good, 메모리 12.8%였습니다. 사용률 12.8%에서 상태가 Good인 것은, CPU 경로가 Perfect를 Good으로 내리는 규칙과 같습니다. 그다음 `recommend --json --limit 1`도 같은 이름이 1위였습니다. 점수 **77.2**, `best_quant` Q8_0, `run_mode` CPU, `fit_level` Good, `memory_required_gb` **0.63**, `disk_size_gb` **0.08**, `memory_available_gb` 4.8, `effective_context_length` 8192, 모델 문맥 131072, `estimate_confidence` `estimated`, `estimate_basis.method` `cpu_constant`, `efficiency` 0.55였습니다. 성분은 quality 42.9, speed 100, fit 100, context 100입니다. 채팅 기본 가중 0.40, 0.35, 0.15, 0.10을 곱하면 77.16이고, JSON의 77.2와 소수 한 자리에서 맞습니다. 두 호출 사이의 가용 RAM은 달랐으므로 12.8%와 0.63/4.8을 한 스냅샷으로 묶지는 않습니다.

0.63과 디스크 0.08의 차이는, 75M에서는 상수 오버헤드 0.5GB가 가중치보다 크다는 뜻에 가깝습니다. 0.075 × 1.05는 0.079입니다. 이 모델의 층 메타데이터로 KV를 다시 풀지는 않았습니다.

실행 모드는 문서 기준으로 GPU(VRAM에 상주), MoE(활성은 VRAM, 비활성은 RAM), CPU+GPU(일부 오프로드), CPU(RAM 전체)입니다. 속도 가중에 쓰이는 런 모드 계수의 기본값은 텐서 병렬 0.9, MoE 오프로드 0.8, CPU 오프로드 0.5, CPU만 0.3입니다.

### 순위가 최대화하는 것

각 축은 0–100이고, 가중합을 소수 한 자리로 반올림합니다. `ScoringWeights` 기본값입니다. 순서는 품질, 속도, 핏, 문맥입니다.

| 용도 | 품질 | 속도 | 핏 | 문맥 |
|---|---|---|---|---|
| General | 0.45 | 0.30 | 0.15 | 0.10 |
| Coding | 0.50 | 0.20 | 0.15 | 0.15 |
| Reasoning | 0.55 | 0.15 | 0.15 | 0.15 |
| Chat | 0.40 | 0.35 | 0.15 | 0.10 |
| Multimodal | 0.50 | 0.20 | 0.15 | 0.15 |
| Embedding | 0.30 | 0.40 | 0.20 | 0.10 |

속도 점수는 용도별 목표 tok/s로 나눕니다. General·Coding·Multimodal·Chat은 40, Reasoning은 25, Embedding은 200입니다. 핏 점수는 요구량이 가용량을 넘으면 0이고, 사용률 70%까지는 100을 유지한 뒤 시그마 0.20의 한쪽 가우시안으로 내려갑니다. 주석은 예전 80% 절벽(79%는 100, 81%는 70)을 없앤 변경이라고 적습니다. 문맥 점수는 목표(일반·채팅 4096, 코딩·추론 8192, 임베딩 512)를 넘으면 100, 절반 이상이면 70, 아니면 30입니다. 정렬에서 Too Tight는 칼럼과 상관없이 맨 뒤입니다.

품질 축에는 양자화 감점이 있습니다. Q8_0은 0, Q4_K_M은 −5, Q2_K는 −12입니다. 용도 정렬은 `use_case_benchmarks.json`을 보고, 없는 계열은 이름 휴리스틱이라고 문서가 적습니다. 이 글은 그 표의 리더보드 출처를 다시 열지 않았습니다.

추론 런타임 enum은 llama.cpp, MLX, vLLM, bitnet.cpp, unsupported입니다. vLLM은 AWQ·GPTQ·AutoRound 쪽 주석이 붙어 있습니다. 이것과 별도로, 받아 둔 모델을 알아보는 런타임 연동은 [docs/providers.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/providers.md)에 Ollama(`http://localhost:11434`), llama.cpp, MLX(`mlx-community`), Docker Model Runner(`http://localhost:12434`), LM Studio(`http://127.0.0.1:1234`)가 적혀 있습니다. TUI에서 `d`는 그 제공자로 받는 키입니다. 제공자가 여러 개면 고르는 창이 열립니다.

### README에 있는 명령

설치와 사용은 README와 [docs/cli.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/cli.md)의 예입니다. 이 글이 이 호스트에서 실제로 실행한 것은 그중 `system`, `fit -n 5`, `recommend --json --limit 1`, `info`, `list --json`, `run --help`입니다.

```sh
# README의 설치 예
winget install --exact --id AlexsJones.llmfit
scoop install llmfit
brew install AlexsJones/llmfit/llmfit
brew install llmfit
port install llmfit
curl -fsSL https://llmfit.axjns.dev/install.sh | sh
uv tool install -U llmfit
uvx llmfit

# README / CLI 문서의 사용 예
llmfit
llmfit recommend
llmfit recommend --json
llmfit fit
llmfit fit --perfect -n 5
llmfit fit --show-incompatible
llmfit info "Mistral-7B"
llmfit system
llmfit doctor
llmfit serve --host 0.0.0.0 --port 8787
llmfit --memory=24G --ram=64G --cpu-cores=8 fit
llmfit --max-context 8192 fit --perfect -n 5
llmfit plan "Qwen/Qwen3-4B-MLX-4bit" --context 8192 --target-tps 25 --json
```

`v1.1.20 --help`는 바이너리 하나로 추천, 비교, 하드웨어 계획, GGUF 다운로드, 추론 실행을 할 수 있다고 적습니다. `llmfit run`의 전제 조건은 따로 있습니다. `llama-cli`(서버 모드면 `llama-server`)가 PATH에 있어야 하고, GGUF가 로컬에 있어야 합니다. 도움말은 그 전에 `llmfit download`를 쓰라고 합니다. 대화 모드의 기본 `--ctx-size`는 4096입니다. `download`는 `--quant`를 생략하면 하드웨어에 맞는 양자화를 고르고, `--list`는 파일을 받기 전에 나열합니다.

클러스터 모드는 README가 **Preview**라고 적고, 지금까지 mock Ray Dashboard에 대해서만 시험했다고 적습니다. `llmfit cluster init`은 Ray 대시보드를 한 번 읽어 `cluster.toml`을 쓰고, 스케줄은 하지 않는다고 같은 절이 적습니다.

### 한계

- 기본 점수의 신뢰도 라벨은 `estimated`일 수 있습니다. 측정으로 바꾸려면 그 모델을 올린 뒤 `llmfit bench`가 필요합니다. info가 안내하는 `llama-bench` 행도 받은 파일의 경로가 있어야 합니다.
- 기본 비교 문맥은 8192입니다. 모델 카드의 최대 문맥에서 돌아간다는 판정이 아닙니다.
- KV 기본은 fp16입니다. q8, q4, TurboQuant는 다른 경로이고, TurboQuant 주석은 연구 연동이며 업스트림 vLLM에는 아직 없다고 적습니다.
- 오버헤드 0.5GB는 모델 크기와 무관한 상수입니다. 75M 예에서는 디스크 0.08GB와 요구 0.63GB가 같이 나왔습니다.
- GPU가 없는 MoE는 가중치+KV 식 대신 카탈로그 `min_ram_gb`로 판정합니다.
- 메모리용 바이트와 속도용 바이트가 다릅니다. 문서의 Mixtral 6.6GB와 바이너리의 7.7GB가 그 차이로 설명됩니다.
- AMD·Ascend는 VRAM을 모를 수 있습니다. Android, Termux, PRoot에서는 GPU 자동 탐지가 없다고 플랫폼 문서가 적습니다. `--memory=8G`는 점수 우회이지 탐지가 아닙니다.
- 백엔드가 안 맞는 행은 기본 표에서 숨깁니다. 이 호스트의 `fit -n 5`는 “4540 models hidden — incompatible backend”를 출력했습니다.
- 카탈로그는 컴파일 타임입니다. README는 최종 사용자가 `brew upgrade`나 새 릴리스로 갱신한다고 적습니다. v1.1.20의 18,044와 `main`의 19,192는 그 간극의 한 예입니다.
- Too Tight는 맨 아래로 갈 뿐, 다운로드 자체를 막지는 않습니다.

## 비즈니스 인사이트

숫자와 제품 문장에는 출처를 붙입니다. 그 밖의 판단은 **분석/의견**입니다. 전기요금과 GPU 시세는 이 글에서 측정하지 않아 만들지 않습니다.

**어느 시장인가.** 로컬로 모델을 띄우는 런타임과, 띄우기 전에 맞는 파일을 고르는 도구는 이웃입니다. GitHub API 2026-11-10 기준 [ollama/ollama](https://github.com/ollama/ollama)는 스타 **186,506**, SPDX **MIT**, 설명은 “Get up and running with Kimi, GLM, MiniMax, DeepSeek, gpt-oss, Qwen, Gemma and other models.”입니다. [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)는 스타 **133,891**, SPDX **MIT**, 설명은 “LLM inference in C/C++”입니다. llmfit은 스타 38,870, MIT, Rust이고, 최신 릴리스는 v1.1.20입니다. [crates.io의 llmfit](https://crates.io/crates/llmfit) `max_version`은 1.1.20, `downloads`는 18,447, `updated_at`은 `2026-11-03T17:52:08Z`였습니다.

[LM Studio 가격 페이지](https://lmstudio.ai/pricing)를 2026-11-10에 읽었습니다. 회사 표기는 Element Labs, Inc. © 2026입니다. Free는 **$0**이고 문장은 “Run local LLMs on your machine”입니다. 포함 항목에 “Run local LLMs using llama.cpp and MLX”가 있습니다. FAQ “Can I use Bionic for free?”의 답은 “Yes. The Free plan includes Bionic Agent and local model support.”입니다. Bionic+는 **$20 USD / month**, Pro는 **$100 USD / month**입니다. 유료 칸의 문장은 US-hosted 오픈 모델과 사용량입니다. 로컬 런타임 칸과 클라우드 추론 칸이 한 페이지에 있습니다.

API 단가는 [Anthropic 가격 페이지](https://www.anthropic.com/pricing)를 같은 날 읽은 값입니다. 입력/출력은 백만 토큰당입니다. Fable 5.2는 입력 $8, 출력 $40. Opus 5.5는 입력 $4, 출력 $20. Sonnet 5.5는 입력 $2, 출력 $10. Haiku 5.5는 프롬프트 10만 토큰 이하에서 입력 $0.10, 출력 $0.50이고, 10만 토큰을 넘으면 입력 $0.50, 출력 $2.50입니다. [플랫폼 문서의 가격 페이지](https://platform.claude.com/docs/en/about-claude/pricing)도 Opus 5.5 입력 $4, 출력 $20을 반복하고, 예시로 입력 50,000토큰은 $0.20, 출력 15,000토큰은 $0.30이라고 적습니다. OpenAI 가격 URL은 이 환경에서 JavaScript 확인 페이지를 돌려주어 숫자를 가져오지 않았습니다.

**누가 이득을 보나.** (1) GGUF나 MLX를 받기 전에 양자화와 8,192 문맥 기준의 추정을 보고 싶은 사람. `download --list`와 `fit`은 그 순서입니다. (2) `recommend --json`과 `llmfit serve`의 `/api/v1/models`로 고르는 스크립트. (3) `--memory`, `--ram`으로 지금 기계가 아닌 목표 사양을 표로 보고 싶은 사람. **분석/의견.** 측정 tok/s가 필요한 팀에게 기본 표의 `est`는 대기열의 첫 줄입니다. info가 적는 확인 절차는 bench이거나, 받은 파일에 대한 llama-bench입니다.

**로컬과 API의 비용.** 위에 적은 Claude 단가는 토큰에 비례합니다. LM Studio Free의 로컬 항목은 소프트웨어 가격 $0입니다. llmfit 바이너리도 MIT이고 README에 사용료가 없습니다. **분석/의견.** 로컬로 바꿔 사라지는 청구서는 토큰 단가이고, 남는 비용은 이미 가진 메모리와 전기와, 잘못 받은 수십 GB입니다. Mixtral 행의 Q4_K_M 디스크 추정 27.1GB는 그 “받기 전에 거절할 파일”의 크기입니다. 이 호스트의 판정은 Too Tight였고, 파일을 받지 않았습니다. 전기요금을 27.1GB나 1.9 tok/s에서 환산하지는 않습니다. 와트를 재지 않았습니다.

**개발자에게 남는 것.** 런타임을 새로 만들지 않습니다. Ollama, llama.cpp, MLX, LM Studio, Docker Model Runner가 이미 받는 쪽이고, llmfit은 그 앞에 추정과 정렬을 둡니다. README가 대안으로 적은 [llm-checker](https://github.com/Pavelevich/llm-checker)는 2026-11-10에 `https://github.com/signerless/llm-checker`로 301이었습니다. 그 저장소의 GitHub API 스타는 3,056, 라이선스 필드는 `NOASSERTION`이고, README 배지는 NPDL-1.0이라고 적습니다. 그 README는 Node.js, Ollama 연동, 품질·속도·핏·문맥, “55k+ exact artifacts”, “in seconds”를 자사 설명으로 적습니다. 55,000은 그 README의 문장이고 이 글이 파일을 세어 확인한 수가 아닙니다. llmfit README는 llm-checker가 MoE를 조밀 모델로 취급한다고 적습니다. llm-checker 현재 README는 그 한계를 반복하지 않고, 코드 검색 API는 인증을 요구해 이 글은 소스에서 MoE 처리를 확인하지 못했습니다. **분석/의견.** 둘을 벤치마크 순위로 나열할 근거는, 서로 다른 카탈로그와 서로가 쓴 설명뿐입니다.

## 팩트 체크

✅ 1차 자료 또는 이 글의 실행과 맞음 / ⚠️ 범위가 다르거나, 저자 문장 외에 확인할 자료가 없음 / ❌ 1차 자료와 어긋남

| 주장 | 판정 | 근거 |
|---|---|---|
| 무료다 | ✅ | `LICENSE`는 MIT, “free of charge”. README 설치 경로에 가격이 없다. https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/LICENSE |
| 오픈소스다 | ✅ | 같은 MIT 파일. GitHub `AlexsJones/llmfit`, 라이선스 SPDX MIT. API 2026-11-10 |
| CPU, GPU, RAM을 검사한다 | ✅ | `hardware.rs` `detect()`, README, 플랫폼 문서. v1.1.20 `system --json`이 이 호스트의 CPU 4코어, RAM 15.63/4.88GB, GPU 없음을 출력 |
| 수 초 안에 검사한다 | ✅ | 이 호스트에서 `system --json` 0.009초, `fit -n 5` 0.440초. 저장소가 적은 SLA는 아니다. 기계는 4코어, GPU 없음, 한 번씩 |
| 받기 전에 모델 요구와 비교한다 | ✅ | 카탈로그는 바이너리에 들어 있다. `fit`과 `info`는 가중치를 받지 않았다. `download --list`는 받기 전 나열이라고 `download --help`가 적는다 |
| 기기가 돌릴 수 있는 모델의 정렬된 목록을 준다 | ✅ | 기본 정렬은 복합 점수. Too Tight는 맨 뒤. `fit -n 5`가 표를 출력했다. 이 호스트에서는 백엔드 불일치 4,540행을 숨겼다 |
| 그 정렬이 최고 효율이다 | ⚠️ | 최대화하는 것은 용도별 가중합이다. 채팅 기본은 품질 0.40, 속도 0.35, 핏 0.15, 문맥 0.10. 핏 점수는 70% 사용률까지 100이다. “효율” 한 축이 아니다 |
| 비교가 정확하다 | ⚠️ | 기본 신뢰도는 `estimated`일 수 있다. info는 대략 ±30% 오차 밴드라고 출력했다. 메모리 표와 대역폭 표의 Q4_K_M은 0.58과 0.5이다. 문서의 활성 VRAM은 약 6.6GB, v1.1.20 info는 7.7GB |
| 무작정 받아 시스템이 멈추는 일을 끝낸다 | ⚠️ | Too Tight를 보여주고 순서를 맨 뒤로 보낸다. 다운로드를 거절하지는 않는다. GPU 없는 MoE는 `min_ram_gb`라는 카탈로그 필드로 판정한다. AMD VRAM은 모를 수 있다 |
| 버튼 한 번으로 로컬 실행을 바로 시작한다 | ⚠️ | `llmfit run`은 있다. 전제는 PATH의 llama.cpp와 이미 받은 GGUF다. TUI `d`는 다운로드다. 이 호스트는 llama.cpp가 없어 실행하지 못했다. `--help`의 “launch inference”와 전제 조건은 같은 바이너리에 같이 있다 |
| 아랍어 본문이 이름 없이 가리키는 도구가 이 저장소다 | ⚠️ | 본문에 저장소 이름이 없다. 첫 댓글은 읽지 못했다. 첨부 영상의 원 글이 llmfit이라고 적는다. https://x.com/alextalksai/status/2119444759823446379 |
| README의 “Hundreds of models & providers” | ⚠️ | 슬로건은 README에 있다. `main`의 `hf_models.json`은 19,192행, `provider` 문자열 6,119종이다. 그 문자열은 게시자이다. v1.1.20 `list --json`은 18,044행이다 |

**총평:** 무료 MIT 도구가 CPU·RAM·GPU를 읽고, 가중치를 받기 전에 카탈로그로 순위를 매기는 것은 소스와 v1.1.20 실행으로 닫힙니다. 이 호스트에서 그 읽기와 5줄 표는 1초 안이었습니다. “최고 효율”과 “정확한 요구량”과 “버튼 한 번의 즉시 실행”은 가중합, 추정, llama.cpp와 로컬 파일이라는 전제가 빠져 있습니다. Mixtral을 GPU 없이 재면 활성 7.7GB가 아니라 카탈로그의 26.1GB로 Too Tight가 됩니다.

## 참고 자료

- 저장소 — [AlexsJones/llmfit](https://github.com/AlexsJones/llmfit) (`main` `7d929f2`, 스타 38,870, 포크 2,511, SPDX MIT, API 2026-11-10)
- 라이선스 — [LICENSE](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/LICENSE) (Copyright 2026 Alex Jones)
- 동작 설명 — [docs/how-it-works.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/how-it-works.md), [docs/cli.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/cli.md), [docs/providers.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/providers.md), [docs/platform-support.md](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/docs/platform-support.md)
- 카탈로그 — [`llmfit-core/data/hf_models.json`](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/llmfit-core/data/hf_models.json) (19,192행, blob `c91df9db`)
- 식 — [`models.rs`](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/llmfit-core/src/models.rs)의 `quant_bpp`, `estimate_memory_gb_with_kv`, `kv_cache_gb`, `moe_active_vram_gb_at`. [`fit.rs`](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/llmfit-core/src/fit.rs)의 `DEFAULT_ESTIMATION_CTX`, `cpu_path`, `ScoringWeights`. [`hardware.rs`](https://github.com/AlexsJones/llmfit/blob/7d929f2b0c2d9e28b4a0726a29a1b247652ac9e9/llmfit-core/src/hardware.rs)의 `detect`
- 릴리스 — [v1.1.20](https://github.com/AlexsJones/llmfit/releases/tag/v1.1.20) (2026-11-03). 이 글의 실행은 그 태그의 `x86_64-unknown-linux-gnu` 바이너리. `llmfit list --json` 18,044행
- 크레이트 — [crates.io/crates/llmfit](https://crates.io/crates/llmfit) (1.1.20, 다운로드 18,447, API 2026-11-10)
- 런타임 — [ollama/ollama](https://github.com/ollama/ollama) (스타 186,506, MIT), [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) (스타 133,891, MIT). API 2026-11-10
- LM Studio — [lmstudio.ai/pricing](https://lmstudio.ai/pricing) (2026-11-10: Free $0, Bionic+ $20/월, Pro $100/월, Element Labs, Inc.)
- API 단가 — [anthropic.com/pricing](https://www.anthropic.com/pricing), [platform.claude.com 가격 문서](https://platform.claude.com/docs/en/about-claude/pricing) (2026-11-10)
- README가 적은 대안 — [signerless/llm-checker](https://github.com/signerless/llm-checker) (`Pavelevich/llm-checker`가 301. 스타 3,056, 라이선스 필드 `NOASSERTION`, API 2026-11-10)

## 원문 X 링크

- 북마크 — [@EngMoElgaraihy](https://x.com/EngMoElgaraihy/status/2119789009601708049) (id `2119789009601708049`, [x.com/i/status/2119789009601708049](https://x.com/i/status/2119789009601708049))
- 첨부 영상의 원 글 — [@alextalksai](https://x.com/alextalksai/status/2119444759823446379) (본문에 llmfit이라는 이름이 있음)
