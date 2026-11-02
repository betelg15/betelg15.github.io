---
title: "Infernix는 RTX 5090에서 활성화를 16비트로 지키나? Qwen3.8 TTFT 팩트 체크"
date: 2026-11-02
time: "21:21"
slug: infernix-cuda-llm-inference-engine
tags: [Infernix, CUDA, Qwen, RTX 5090, 추론, 팩트체크]
summary: "Infernix main은 Qwen3.8을 RTX 5090 한 장에서 돌리는 C++/CUDA 엔진이다. 벤치마크된 NVFP4 기본값은 expert 활성화가 4비트이고, Basalt 대비 4–8배 TTFT와 --a8-activations의 정확도 유지는 그 표와 맞지 않는다."
---

> 이 글은 북마크해 둔 [@ai_hakase_의 포스트(일본어, 2026-11-01 23:12 UTC)](https://x.com/ai_hakase_/status/2117031946643529762)를 계기로 썼습니다. 포스트 문장은 검증할 주장으로만 다뤘습니다. 근거는 [Wallawalla47/Infernix](https://github.com/Wallawalla47/Infernix) main `eda1eba6`(2026-11-02 11:13 UTC)의 README·CLI·런처 문서, [Qwen3.8-Flash-Next 모델 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next), [Basalt](https://github.com/jesdga95/basalt)와 [Strata](https://github.com/Niko1221/Strata)의 정밀도 문서, NVIDIA의 [RTX 5090 제품 페이지](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)와 [50 시리즈 비교표](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/)입니다. 속도 숫자는 Infernix가 자기 기계에서 적은 값이고, 이 글은 그 표를 다시 재지 않았습니다.

## 왜 로컬에서 큰 MoE를 돌리는 사람에게 닿는 이야기인가

Qwen 모델 카드의 Qwen3.8-Flash-Next는 언어 모델 **125B 중 토큰당 약 6B**가 켜지고, 그 옆에 **51B n-gram 임베딩**과 **4B MTP**가 있습니다. 컨텍스트는 기본 262,144토큰, YaRN으로 1,000,000까지입니다. expert는 층마다 **512개**이고, 토큰마다 **라우팅 10개와 공유 1개**가 켜집니다. 층은 48개라서, 디스크에 있는 routed expert 텐서를 층마다 곱하면 48 × 512 = **24,576**입니다. Infernix README가 "24,576 routed experts, NVFP4에서 63 GiB"라고 적은 수는 이 총량으로 읽는 편이 맞습니다. 토큰마다 24,576개를 계산한다는 뜻은 아닙니다.

NVIDIA 제품 페이지의 GeForce RTX 5090은 **32 GB GDDR7**, CUDA 코어 21,760, 부스트 2.41 GHz, TGP **575 W**, 권장 시스템 전원 1000 W, PCIe Gen 5입니다. 50 시리즈 비교표의 메모리 대역폭은 **1792 GB/s**입니다. 32 GB 안에 63 GiB expert와 카드가 말하는 51B 표를 같이 올리는 구성은 성립하지 않습니다. 그래서 이 급의 엔진은 expert를 호스트 RAM에 두고, 자주 쓰는 것만 VRAM에 캐시하며, n-gram 표는 NVMe에서 읽습니다. Infernix는 그 자리를 RTX 5090 한 장에 맞춘 C++/CUDA 엔진으로 자리 잡았다고 README가 말합니다. NInfer를 포크한 뒤 `.ninfer`와 자기 형식 `.infernix`를 둘 다 읽습니다. Windows 릴리스 태그 [windows-2026.11.01](https://github.com/Wallawalla47/Infernix/releases/tag/windows-2026.11.01)은 2026-11-01 01:59 UTC에 게시되어, 포스트와 같은 날입니다.

README 맨 위에는 작성 경위가 있습니다. NInfer에서 포크한 뒤 더한 글의 대부분, README 포함, 을 AI로 썼고 **완전하지도 정확하지도 않을 수 있다**는 문장입니다. 아래 숫자는 그 전제를 달고 읽습니다. 확인 시점은 2026-11-02, main `eda1eba6`입니다. 벤치마크 절은 기본 경로를 `fb491903`, IQ3_S·27B·`--a8-activations` 행을 `6b066a54`에서 재었고, 그 이후 빌드는 다시 재지 않았다고 적습니다.

## 체크포인트가 정한 비트와, 16비트가 아닌 기본값

포스트가 "활성화 함수를 16비트로 유지한다"고 한 자리부터 갈립니다. 일본어 원문의 活性化関数는 한국어의 **활성화 함수**(SiLU, sigmoid 같은 비선형)입니다. Infernix 문서가 비트 수로 말하는 대상은 그 함수가 아니라, 행렬곱에 들어가는 **활성화 텐서**입니다.

CLI의 기본 경로는 체크포인트가 적은 정밀도를 따릅니다.

| 가중치 | 기본 활성화 | 옵션 |
|---|---|---|
| NVIDIA NVFP4 Flash-Next (Dense8와 비트 일치 변환) | routed expert는 체크포인트가 정한 **4비트**(W4A4, NVIDIA 스케일). 그 밖은 16비트 | `--a8-activations`는 expert 8비트. `--a16-activations`는 저장된 4비트 가중치 위에 expert 16비트 |
| NVIDIA FP4-Local | 16비트. NVIDIA가 서빙하는 폭 | `--expert-a4-activations`, `--a8-activations` |
| Uncensored NVFP4 | 16비트 (가중치만 NVFP4인 expert) | `--a8-activations` |
| IQ3_S GGUF | 전부 16비트 | `--a8-activations`는 dense projection과 expert를 8비트로 |
| Qwen3.8-27B NVFP4 | NVFP4 층은 아티팩트가 정한 4비트. NInfer와 같다고 README가 적음 | 없음 |

헤드라인 벤치마크가 쓰는 추천 변환은 Dense8입니다. 모델 표는 NVIDIA NVFP4 expert와 FP8 n-gram 표는 비트 단위로 같고, dense projection은 8비트이며, 퍼플렉서티 4.654 대 비트 일치 변환 4.666이라고 합니다. 이 기본값에서 expert 활성화는 16비트가 아닙니다. 16비트 expert는 `--a16-activations`이고, CLI는 출력이 바뀌며 긴 프롬프트는 느려진다고 경고합니다. Dense8, RTX 5090, 2026-10-31 측정으로 128K 프롬프트가 12.2초에서 16.7초가 됩니다.

8비트 옵션도 공짜 정확도가 아닙니다. README는 `--a8-activations`와 `--a16-activations` 둘 다 **출력을 바꾸고, 품질은 아직 재지 않았다**고 합니다. CLI는 `--a8-activations`를 Approximate로 두고, `--reproducible`과 `--lossless`가 이 플래그를 거부한다고 적습니다. GGUF import에서는 로드할 때 BF16 하이퍼커넥션 행렬을 8비트 가중치로 다시 씁니다.

기본으로 켜지는 빠른 경로도 있습니다. `--reproducible` 설명은, 측정상 더 빠르고 품질 게이트를 통과한 커널이 기본으로 돌며 그 출력은 재현 경로와 비트가 같지 않다고 합니다. 재현 경로와 무손실 경로는 켜야 들어갑니다. "숏컷을 극력 배제하고 모델 본래의 품질을 지킨다"를 기본 서빙 모드의 설명으로 읽으면, 문서의 기본값과 어긋납니다.

## 라우팅된 expert를 빼는 일이 품질에 닿는 이유

MoE 블록은 라우터가 고른 expert의 출력을 가중해서 더합니다. 모델 카드의 Flash-Next는 토큰마다 10개를 고릅니다. 그 중 하나를 계산하지 않으면, 그 토큰의 합에서 그 항이 빠집니다. Infernix CLI의 `--expert-tail-skip R`은 이렇게 동작합니다. 디코드와 검증 라운드에서, VRAM에 없는 expert가 그 라운드의 모든 토큰에서 순위 `R` 이하이면 복사도 계산도 하지 않고 0을 더합니다. 나머지 expert의 라우터 가중은 다시 정규화하지 않습니다. 출력은 바뀌고, 어느 expert가 캐시에 있었는지에 따라 달라지며, 프리필은 그대로입니다. 기본값은 **off**입니다.

이 규칙이 기본인 쪽은 Strata 문서입니다. [DETAILS.md](https://github.com/Niko1221/Strata/blob/main/docs/DETAILS.md)의 "On by default" 표에 `STRATA_ROUTE_TAIL_SKIP` (7)이 있고, 끄는 스위치는 `STRATA_ROUTE_TAIL_SKIP=0`입니다. 검증 창의 모든 토큰이 순위 7 이하로만 보낸, VRAM에 없는 expert를 계산하지 않습니다. expert가 모두 VRAM에 있거나, 캐시된 expert가 90% 이상이면 적용하지 않습니다. 같은 문서의 0.1.42 기록은 RTX 3060과 RTX A4000에서 이전 동작 대비 KL 0.0030–0.0058을 적습니다. Infernix가 Basalt·Strata와 비교한 표에서는 이 기본값을 껐습니다. 어느 expert가 도는지가 바뀌기 때문입니다.

Basalt 정밀도 문서는 lossy 플래그 `--relaxed-drafting`, `--route-prior`, `--route-tail-skip`이 **기본 off**이고 출력을 바꾼다고 합니다. "다른 엔진은 expert를 건너뛴다"는 Strata의 조건부 기본값에는 닿고, Basalt의 기본 설정에는 닿지 않습니다.

Basalt가 비트를 줄이는 지점은 따로 있습니다. [precision/index.md](https://github.com/jesdga95/basalt/blob/main/docs/precision/index.md)는 NVIDIA NVFP4 팩의 dense projection을 BF16에서 **Q6_K로 한 번** 양자화하고, 양자화 행렬곱의 입력 활성화는 int8(`q8_1`)이며, 디코드는 하이퍼커넥션을 int8 사본에서 읽고, Q6_K 출력 헤드의 먼 로짓은 2비트 사본으로 거른다고 합니다. 잔차·노름·라우터·소프트맥스·로짓은 fp32입니다. [features.md](https://github.com/jesdga95/basalt/blob/main/docs/precision/features.md)의 Q6_K 대 Q8_0 dense 비교는 짝지은 KLD 차이 +0.0063이고, 저자들은 이를 KLD의 약 10%, top-1 0.4점이라고 부릅니다. Infernix README가 "Basalt 자체 측정으로 KL +10%"라고 적은 문장과 같은 방향을 가리킵니다. 비교 프로토콜이 같은 실험인지는 두 저장소가 서로를 인용하지 않아 이 글에서 확인하지 못했습니다.

## TTFT와 디코드가 갈리는 지점

첫 토큰 시간(TTFT)은 요청을 보낸 뒤 첫 스트리밍 토큰까지입니다. Infernix 측정 절차는 OpenAI API로 그 구간을 잽니다. 긴 프롬프트에서는 프리필이 거의 전부입니다. 디코드 tok/s는 그 다음, 토큰을 이어 쓰는 속도입니다.

RTX 5090의 FP4 텐서 코어를 프롬프트에서 쓰는 경로는, README가 말한 대로 **4비트 expert 활성화**뿐입니다. 그래서 Dense8 기본값이 에이전트 워크로드에서 가장 빠르다고 합니다. `--a8-activations`는 같은 기계에서 디코드 라운드를 1–7% 늘리지만, 128K·250K 첫 토큰은 28% 늦어집니다. 8비트로 디코드를 조금 사는 대신 긴 프롬프트의 TTFT를 내놓는 교환입니다.

호스트와 GPU 사이 대역도 TTFT 쪽에 기울어 있습니다. README의 PCIe Gen5 x8 대 x16 측정(Infernix `d8e52a85`, Dense8, INT8 KV)에서 호스트→디바이스 복사는 28.9 GB/s에서 57.8 GB/s로 2.00배이고, 프롬프트 `pp4096`는 1.76–1.99배입니다. 디코드는 1.02–1.07배입니다. expert와 n-gram 표가 GPU 밖에 있으면, 첫 토큰은 링크와 디스크를 기다리고 디코드는 라운드당 받아들여진 드래프트 수와 캐시 히트에 더 민감합니다.

공식 가중치를 받는 서버와 이 엔진은 같은 표를 공유하지 않습니다. 모델 카드는 Hugging Face 형식 가중치가 Transformers, vLLM, SGLang, TokenSpeed와 맞는다고 합니다. Infernix `AGENTS.md`는 생성 모델이 GPU 하나, 상주 모델 하나, 시작 때 고정하는 실행 레인 1–8개이고, 대규모 continuous batching은 제품 결정이 따로 있어야 한다고 합니다. README의 비교 상대는 Strata v0.2.8, strata-nvfp4, Basalt `c08284cb`, 그리고 27B에서의 NInfer `1882c6adb`입니다. llama.cpp, vLLM, TensorRT-LLM과의 속도 표는 그 절에 없습니다. llama.cpp가 문서에 나오는 자리는 CLI가 `--a8-activations`의 int8 코드(값 32개당 FP32 스케일 하나)를 llama.cpp의 Q8_1과 같은 꼴이라고 부르는 곳, 그리고 Basalt가 같은 GGUF의 KLD를 llama.cpp `llama-perplexity`와 맞춘 곳입니다.

Infernix가 공개한 NVFP4 Dense8 한 요청 표는 이렇습니다. 기계는 RTX 5090, PCIe Gen5 x8, Core i9-13900K, DDR5 96 GB 중 RAM 예산 84 GiB, Windows 11입니다.

| 컨텍스트 | TTFT Infernix | Strata | strata-nvfp4 | Basalt | 디코드 tok/s Infernix | Strata | strata-nvfp4 | Basalt |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ~8K | 1.88 s | 2.67 s | 2.48 s | 9.55 s | 183 | 159 | 177 | 202 |
| ~128K | 12.22 s | 18.83 s | 15.34 s | 92.94 s | 161 | 146 | 161 | 173 |
| ~250K | 23.90 s | 37.55 s | 31.78 s | 125.92 s | 175 | 183 | 172 | 216 |

Basalt TTFT를 Infernix로 나누면 약 **5.08배, 7.61배, 5.27배**입니다. README 헤드라인의 "5–8× sooner"는 이 세 칸입니다. 각주 1은 Basalt가 50.7 GiB n-gram 표를 SSD에서 읽었다고 합니다. RAM 예산 안에 expert와 표가 같이 들어가지 않았기 때문입니다. Strata와의 TTFT 비는 1.42배, 1.54배, 1.57배라 헤드라인의 1.4–1.6배와 맞습니다.

IQ3_S 표에서는 방향이 바뀝니다. ~8K TTFT는 Infernix 1.40초, Basalt 1.35초입니다. ~128K는 18.10초 대 13.47초, ~250K는 35.59초 대 27.98초입니다. 디코드는 Basalt 380 / 298 / 339 tok/s, Infernix 229 / 201 / 250입니다. 에이전트 리플레이 벽시계는 Basalt 4.4분, Infernix 5.5분입니다.

`--a8-activations`를 얹은 NVFP4 디코드는 199 / 185 / 268 tok/s로, Basalt 202 / 173 / 216과 8K에서 비슷하고 128K·250K에서 앞섭니다. 같은 옵션의 TTFT는 1.88 / 15.53 / 30.58초라, Basalt 대비 약 5.1배, 6.0배, 4.1배이고 README는 이 구간을 4–6배라고 부릅니다. IQ3_S에 같은 옵션을 켜도 디코드는 224 / 211 / 278이라 Basalt보다 1.2–1.7배 느리고, README는 그 문장을 그대로 적습니다.

27B는 Basalt가 아니라 같은 NVFP4 아티팩트의 NInfer와 비교합니다. TTFT는 8K에서 0.65초 대 0.71초(약 9%), 128K에서 18.61초 대 29.88초, 230K에서 47.04초 대 84.43초입니다. 4–8배가 아닙니다.

품질 열은 비어 있습니다. README는 "Measured quality for every engine follows in a later update"라고 합니다. 변환끼리의 퍼플렉서티와, 27B에서 NInfer 4.479 대 Infernix 4.468(1.04M 토큰, 16K 컨텍스트, INT8 KV)은 있습니다. Basalt·Strata와의 KL 표는 없습니다.

문서에 있는 실행 예는 이 한 줄입니다. Dense8, INT8 KV, DFlash2, 컨텍스트 262144, 동시 2입니다.

```bat
infernix-serve.exe Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix-00001-of-00003.infernix --ngram-volume Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram --kv-dtype int8 --max-context 262144 --spec dflash2 --draft-model Qwen3.8-Flash-Next-DFlash2-Infernix.infernix --draft-tokens auto --lm-head-draft --max-concurrency 2 --vram-past-budget
```

## `--lossless`가 재는 것

CLI는 `--lossless`를 이렇게 정의합니다. Hugging Face 포워드의 연산을 그 자료형의 값으로 한 번씩 올바르게 반올림하고, 가중치는 형식 그대로 디코드하며, 합은 정확합니다. 출력은 요청과 아티팩트만의 함수이고, 빌드·프리필 청크·프리필과 디코드의 차이·다른 요청·프리픽스 캐시·선점에 기대지 않습니다. 텍스트 요청은 `--kv-dtype bf16`(이 경로에서는 V도 BF16)이고 추측 디코딩은 꺼집니다. 빠른 경로는 돌지 않아 재현 경로보다 느립니다. 샘플링은 시드·위치·토큰으로 키된 Gumbel-max입니다. 기본값은 off입니다. `--a8-activations`와 `--a16-activations`는 이 플래그와 같이 쓰지 못합니다.

[설계 문서](https://github.com/Wallawalla47/Infernix/blob/main/docs/maintainer/lossless-route.md)는 그 반올림의 기준을 Transformers의 `modeling_qwen3_5.py`와 Flash-Next의 `modeling_qwen4_exp.py`로 적습니다. 같은 파일의 상태 줄은 2026-10-21 기준 **in development (branch `feat/lossless`)** 로 남아 있습니다. 구현 파일과 CLI 표는 확인한 main 트리에 있습니다. 상태 줄이 낡은 머리말인지, 경로가 아직 설계 문서의 그 문장 아래에 있는지는 문서만으로 닫히지 않습니다. 어느 쪽이든 "실무 검증용으로 완비된 모드"라는 문장은 이 두 페이지에 없습니다.

## 런처

README의 Infernix Launcher는 **Beta**이고, 아직 바뀐다고 적습니다. `infernix-launcher`는 추론을 하지 않습니다. `infernix-serve` 하나를 감독하고 HTTP를 중계합니다. Windows에서는 `infernix-serve.exe` 옆의 `infernix-launcher.exe`가 브라우저로 `http://127.0.0.1:1234`를 엽니다. 모델 찾기와 이어받기 다운로드, 이름 있는 설정, GPU·RAM에 들어가는지 확인, OpenAI `/v1`와 Anthropic `/v1/messages` 하나의 엔드포인트, 게이지와 채팅이 [launcher.md](https://github.com/Wallawalla47/Infernix/blob/main/docs/launcher.md)에 있습니다. Linux 바이너리 `build/apps/infernix-launcher`도 같은 문서에 있습니다. "Windows 전용"은 아닙니다. "설치가 매우 순조롭다"는 측정이 없습니다.

## 비즈니스 인사이트

2026년의 이 칸은 데이터센터 서빙 시장과 다른 선반입니다. 모델 카드가 공식 가중치의 상대로 적는 것은 Transformers, vLLM, SGLang, TokenSpeed이고, 관리형으로는 Qwen Cloud를 가리킵니다. Infernix·Strata·Basalt·NInfer가 다투는 자리는 **워크스테이션 한 대**에서 Flash-Next를 올리는 일입니다. Strata 저장소는 RTX 20/30/40/50, AMD, Intel, Apple Silicon, Strix Halo, DGX Spark를 안내합니다. Basalt README는 Linux와 Windows의 NVIDIA Blackwell(sm_120)입니다. Infernix `AGENTS.md`는 sm_120a, 튜닝 대상은 RTX 5090이고, 다른 PC에 실행 파일만 복사할 때의 조건도 RTX 50 시리즈와 드라이버 580 이상입니다.

제품 페이지가 적는 전원은 TGP 575 W, 권장 시스템 전원 1000 W입니다. 메모리 요구는 그 옆에서 더 직접적입니다. NVFP4 expert 63 GiB와 FP8 n-gram 볼륨 52,429,058,048바이트는 32 GB VRAM 밖에 있습니다. Infernix 벤치마크 기계는 RAM 96 GB 중 84 GiB를 예산으로 두고, n-gram은 Samsung 990 PRO에 두었습니다. IQ3_S로 내려도 expert는 RAM에 있고, 표를 RAM에 넣으면 expert가 밀린다고 README가 적습니다. 카드를 산 뒤에 RAM과 NVMe가 남습니다.

**분석/의견.** 이 표를 제품 포지션으로 읽으면, Infernix가 앞서는 칸은 "NVIDIA NVFP4에서, 상대의 n-gram 표가 SSD로 밀려난 조건의 첫 토큰과 에이전트 벽시계"입니다. 디코드 최댓값을 사는 칸은 같은 프로젝트의 표에서 Basalt 쪽이고, IQ3_S에서는 TTFT까지 Basalt가 앞섭니다. 이득을 보는 사람은 5090과 넉넉한 RAM으로 에이전트 루프의 첫 토큰을 줄이고, expert 활성화 폭을 체크포인트에 맞추고 싶은 사람입니다. 손해를 보는 읽기는 두 가지입니다. 4–8배를 엔진 전반의 속도로 옮기면 IQ3_S와 Strata 열이 사라지고, `--a8-activations`를 정확도가 공짜인 디코드 스위치로 읽으면 문서가 적은 "출력이 바뀌고 품질은 미측정"이 사라집니다. 품질 열을 아직 공개하지 않은 엔진을 "고정밀"로 도입하는 결정은, 속도 표를 품질 표로 오인하는 결정입니다.

개발자에게 바로 닫히는 선택은 가중치입니다. Dense8은 4비트 expert 활성화가 기본이고 FP4 텐서 코어로 프롬프트를 읽습니다. 비트 일치 NVFP4와 FP4-Local의 기본 활성화 폭은 표가 다릅니다. IQ3_S는 16비트 활성화가 기본이고 디코드는 Basalt가 빠릅니다. FP8 변환은 README가 가장 정확하고 가장 느리다고 하며, 112.6 GiB expert는 96 GB에서 SSD 계층이 필요합니다. 엔진을 고르기 전에 어느 파일을 올릴지 정하는 편이, 포스트의 한 문장으로 정하는 편보다 문서에 가깝습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 방향은 맞거나 일부만 맞음 / ❌ 1차 자료와 어긋나거나, 그 내용이 1차 자료에 없음

확인 시점은 2026-11-02, Infernix main `eda1eba6`입니다. 속도는 프로젝트 자체의 Windows 측정입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| RTX 5090에서 Qwen 3.8을 돌리는 C++/CUDA 추론 엔진 Infernix가 릴리스되었다 | ✅ | README: C++/CUDA, Qwen, RTX 5090 한 장, NInfer 포크. 태그 [windows-2026.11.01](https://github.com/Wallawalla47/Infernix/releases/tag/windows-2026.11.01)는 2026-11-01 01:59 UTC. 포스트는 같은 날 23:12 UTC. main은 그 뒤로 2026-11-02에 더 움직였다. |
| 빠르고 품질이 높다 | ⚠️ | NVFP4·IQ3_S·27B의 속도 표는 README에 있다. "고품질"을 상대 엔진과 비교한 열은 없고, "Measured quality for every engine follows in a later update"라고 적는다. README는 AI로 썼으며 완전하거나 정확하지 않을 수 있다고 경고한다. 이 글은 표를 재측정하지 않았다. |
| 속도를 위해 정확도를 깎는 숏컷을 극력 빼고, 모델 본래의 품질을 지킨다 | ⚠️ | 기본값은 체크포인트 정밀도이고 expert tail skip은 off다. 그러나 빠른 경로는 기본으로 켜지고 재현 경로와 비트가 다르다고 CLI가 적는다. Dense8 추천 변환은 dense를 8비트로 두고, NVFP4 expert 기본 활성화는 4비트다. 상대 엔진과의 품질 측정은 나중으로 미뤄져 있다. |
| 다른 엔진이 저비트화와 expert 스킵을 하는 동안, Infernix는 활성화 함수를 16비트로 유지한다 | ❌ | 活性化関数는 활성화 텐서가 아니다. 텐서로 읽어도 Dense8·비트 일치 NVFP4의 routed expert 기본값은 W4A4다. 16비트 expert는 `--a16-activations`이고 출력이 바뀐다. IQ3_S 기본값만 전부 16비트다. Basalt의 `--route-tail-skip`은 기본 off다. Strata의 tail skip은 조건부 기본값이다. |
| 라우팅된 expert를 모두 실행한다 | ✅ | CLI `--expert-tail-skip` 기본값 off. README: "runs every routed expert (no expert tail skipping)". 옵션을 켜면 VRAM 미스 중 순위가 낮은 expert를 0으로 두고, 재현 경로는 그 옵션을 거부한다. |
| 첫 토큰이 Basalt 등 경쟁 엔진보다 4–8배 빠르다 | ⚠️ | NVFP4 기본 표의 Basalt 대비 TTFT는 약 5.08 / 7.61 / 5.27배이고 헤드라인은 5–8배다. 4–6배는 `--a8-activations` 각주다. 두 경우 모두 Basalt의 50.7 GiB 표가 SSD에 있던 조건이다. Strata는 1.4–1.6배다. IQ3_S에서는 Basalt TTFT가 더 짧다. 27B 비교 상대는 NInfer이고 8K에서 약 9%, 긴 프롬프트에서 1.6–1.8배다. |
| `--a8-activations` 등으로 정확도를 유지한 채 디코드에서도 경쟁과 같거나 더 빠르다 | ❌ | CLI는 Approximate이고 출력이 바뀌며 `--lossless`가 거부한다. README는 품질을 아직 재지 않았다고 한다. NVFP4 디코드 199 / 185 / 268은 Basalt 202 / 173 / 216과 8K에서 비슷하고 그 위 컨텍스트에서 앞선다. IQ3_S에서는 같은 옵션으로도 Basalt가 1.2–1.7배 빠르다. |
| Windows용 WebUI 런처가 시험 도입되어 모델 관리와 API가 있고, 도입이 매우 순조롭다 | ⚠️ | 런처는 README가 Beta라고 부른다. 모델 검색·다운로드, 설정, `127.0.0.1:1234`의 웹 UI, OpenAI·Anthropic 엔드포인트는 [launcher.md](https://github.com/Wallawalla47/Infernix/blob/main/docs/launcher.md)에 있다. Linux 바이너리도 있다. "매우 순조롭다"는 측정이 없고, 문서는 아직 바뀐다고 적는다. |
| `--lossless` 모드가 개발과 실무의 추론 품질 검증에 맞게 완비되어 있다 | ⚠️ | [CLI](https://github.com/Wallawalla47/Infernix/blob/main/docs/cli.md)는 플래그를 HF 포워드의 올바른 반올림 경로로 정의하고 기본 off, 추측 없음, bf16 KV, 재현 경로보다 느리다고 한다. 설계 문서 상태 줄은 2026-10-21의 `feat/lossless` 개발 중으로 남아 있다. "실무에 최적·완비"는 두 문서에 없다. |

**총평:** 엔진과 2026-11-01 Windows 릴리스, RTX 5090에서 Qwen3.8을 단일 GPU로 서빙한다는 뼈대, 기본값에서 routed expert를 건너뛰지 않는다는 점, 베타 웹 런처, `--lossless`라는 정확한 산술 경로는 저장소와 맞습니다. 포스트가 그 위에 얹은 "활성화 함수 16비트"와 "정확도를 유지하는 `--a8-activations`"는 기본값·CLI와 어긋납니다. 4–8배 TTFT는 NVFP4 대 Basalt라는 한 칸의 5–8배, 그리고 표가 SSD에 있던 조건을 엔진 전반의 배수로 늘린 문장입니다.

## 참고 자료

- Infernix README, CLI, 런처, 무손실 경로, AGENTS.md — [저장소](https://github.com/Wallawalla47/Infernix) · main `eda1eba6`(2026-11-02) · [CLI `--lossless`](https://github.com/Wallawalla47/Infernix/blob/eda1eba6c81f474d7bf58ee434bb2cd64f142cab/docs/cli.md) · [lossless-route.md](https://github.com/Wallawalla47/Infernix/blob/main/docs/maintainer/lossless-route.md) · [launcher.md](https://github.com/Wallawalla47/Infernix/blob/main/docs/launcher.md) · [windows-2026.11.01](https://github.com/Wallawalla47/Infernix/releases/tag/windows-2026.11.01)
- Qwen3.8-Flash-Next 모델 카드 — [Hugging Face](https://huggingface.co/Qwen/Qwen3.8-Flash-Next). 125B / 활성 6B, 51B n-gram, 4B MTP, expert 512, 활성 10 routed + 1 shared, 층 48, 컨텍스트 262,144.
- Basalt — [README](https://github.com/jesdga95/basalt) · [precision/index.md](https://github.com/jesdga95/basalt/blob/main/docs/precision/index.md) · [features.md의 Q6_K dense](https://github.com/jesdga95/basalt/blob/main/docs/precision/features.md)
- Strata — [저장소](https://github.com/Niko1221/Strata) · [`STRATA_ROUTE_TAIL_SKIP`](https://github.com/Niko1221/Strata/blob/main/docs/DETAILS.md)
- NInfer — Infernix README가 포크 원본으로 적는 [Neroued/ninfer](https://github.com/Neroued/ninfer)
- NVIDIA GeForce RTX 5090 — [제품 페이지](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)(32 GB GDDR7, CUDA 21,760, TGP 575 W, PCIe Gen 5) · [50 시리즈 대역폭 1792 GB/s](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/) · [Blackwell 아키텍처 백서 PDF](https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf)(GB202, 512-bit, 28 Gbps, 1792 GB/s, FP4 텐서 처리량)
- 원본 X 포스트: [@ai_hakase_](https://x.com/ai_hakase_/status/2117031946643529762) · [상태 주소](https://x.com/i/status/2117031946643529762)
