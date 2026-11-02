---
title: "Ternary Bonsai 2가 ik_llama.cpp에서 완전히 도나? QK·Hadamard·-ngl 팩트 체크"
date: 2026-11-02
slug: ik-llama-cpp-ternary-bonsai-2
tags: [llama.cpp, ik_llama.cpp, 양자화, Ternary, Bonsai, 팩트체크]
summary: "ik_llama.cpp main의 PQ2_0·Q2_0 CUDA와 트릿 유지 리팩 스크립트는 저장소에 있습니다. -rtr 1은 파서가 받는 문법이 아니고, 더 작은 PTQ1_0의 CUDA 행렬곱 커널과 '수 초' 측정은 1차 자료에서 확인되지 않습니다."
---

> 이 글은 북마크해 둔 [@ai_hakase_의 포스트(일본어, 2026-11-01 04:14 UTC)](https://x.com/ai_hakase_/status/2116745550980624704)를 계기로 썼습니다. 포스트 문장은 검증할 주장으로만 다뤘습니다. 근거는 [ikawrakow/ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp)의 PR·이슈·README·소스(2026-11-02에 본 main `e6d43ccd`), [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp), PrismML의 [Ternary Bonsai 2 27B GGUF 모델 카드](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)와 [백서](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf)입니다.

## 왜 로컬 LLM을 돌리는 사람에게 닿는 이야기인가

27B급 가중치를 FP16으로 두면 모델 카드 기준 약 54GB입니다. 같은 카드가 적는 Ternary Bonsai 2의 언어 모델 파일은 **PTQ1_0 5.95GB, PQ2_0 7.21GB, 업스트림용 Q2_0 7.63GB**입니다. 노트북이나 12GB급 GPU에 27B를 올리려면 이 크기 차이가 전제입니다.

그 파일이 아무 llama.cpp에서나 같은 문장을 내는 것은 아닙니다. 가중치가 `{−1, 0, +1}`로 접혀 있고, 접기 전에 **하다마드 회전**이 들어가 있습니다. 런타임이 활성화에 같은 변환을 적용하지 않으면 파일은 열리는데 토큰이 깨집니다. 업스트림 [PR #29600](https://github.com/ggml-org/llama.cpp/pull/29600)은 변환이 빠진 빌드에서 이 27B Q2_0 파일의 위키텍스트 퍼플렉서티가 **1,258,506**까지 올라갔다고 적습니다. 변환을 넣은 뒤 같은 파일은 **10.23**입니다.

[@ai_hakase_](https://x.com/ai_hakase_/status/2116745550980624704)의 글은 이 호환 문제가 ik_llama.cpp에서 풀렸고, `-ngl 99`로 GPU에 전부 올리며, `repack_ternary_to_prism.py`로 트릿을 유지한 채 수 초 만에 바꾸고, `-rtr 1`로 CPU 프롬프트 처리가 빨라진다고 말합니다. 아래는 그 문장을 저장소와 모델 카드에 한 줄씩 대어 본 결과입니다.

## 삼진 가중치와 1.58비트

BitNet b1.58 논문([arXiv:2402.17764](https://arxiv.org/abs/2402.17764), Shuming Ma 외)은 가중치를 `{−1, 0, +1}` 세 값으로 두는 모델을 제안합니다. 세 값은 이진수로 `log2(3) ≈ 1.585`비트라서 저자들은 1.58비트라고 부릅니다. 행렬곱의 가중치 쪽이 정수 덧셈에 가깝고, DRAM에서 읽어 오는 바이트가 줄어든다는 것이 논문의 요지입니다.

Ternary Bonsai 2는 그 논문의 학습 레시피를 그대로 가져온 모델이라고 백서가 말하지는 않습니다. PrismML 백서(2026년 9월)와 GGUF 모델 카드가 공통으로 적는 정의는 이것입니다.

- 기반은 **Qwen3.8-27B**. 언어 백본 24.35B(64블록) + 임베딩/LM 헤드 2.54B + 비전 타워. 카드는 비전을 0.46B, 백서 표는 0.47B로 적고, 둘 다 합계 **27.36B**입니다.
- 언어 가중치는 회전된 기저에서 `{−1, 0, +1}`이고, **128개마다 FP16 스케일 하나**입니다. 백서의 식은 `w_i = s_g · t_i`입니다.
- 트릿 하나의 정보량은 약 1.585비트이고, 스케일을 128개에 나눠 얹으면 저장 비용은 약 1.71비트/가중치입니다. 카드는 고정밀로 남은 소수를 포함해 모델 전체를 **1.72비트/가중치**라고 하고, 백서 요약은 출하 기준 **1.76비트, 5.93GB**라고 합니다. 파일 크기를 볼 때는 카드의 GGUF 표(5.95 / 7.21 / 7.63GB)를 쓰는 편이 맞습니다.

같은 트릿을 담는 통이 세 개입니다. 카드의 표입니다.

| 파일 | 담는 법 | 카드가 적는 비트/가중치 | 크기 |
|---|---|---:|---:|
| PTQ1_0 | 트릿을 조밀하게 (5트릿/바이트 계열) | 1.75 | 5.95GB |
| PQ2_0 | 트릿 하나를 2비트 슬롯에 | 2.13 | 7.21GB |
| Q2_0 | llama.cpp의 표준 2비트 타입 | 2.25 | 7.63GB |

`2.25 = 2 + 16/64`입니다. ik_llama.cpp와 업스트림 `ggml-common.h`의 `QK2_0`은 **64**라서, Q2_0의 스케일 하나는 64개 값을 덮습니다. PQ2_0/PTQ1_0의 블록은 **128**입니다. 이름이 비슷해도 블록 길이가 다릅니다.

## 블록 크기 QK가 갈리는 지점

ggml 주석에서 QK는 역양자화 뒤의 값 개수, 즉 스케일 하나가 담당하는 블록 길이입니다. 업스트림 `ggml-common.h`는 `QK_K`를 **256**으로 두고, 삼진 타입 `TQ1_0`(타입 id 34)과 `TQ2_0`(id 35)의 블록을 그 256에 맞춥니다. 이 두 타입은 2024년 [PR #8151](https://github.com/ggml-org/llama.cpp/pull/8151)에서 TriLM과 BitNet b1.58용으로 들어왔습니다. `TQ1_0` 블록은 54바이트(1.6875 bpw), `TQ2_0` 블록은 66바이트(2.0625 bpw)라고 그 PR이 설명합니다.

Prism 쪽 `PQ2_0`(id 142)과 `PTQ1_0`(id 143)은 블록 **128**입니다. ik_llama.cpp `ggml-common.h`의 `QK_PQ2_0` / `QK_PTQ1_0`이 128이고, 블록 크기는 각각 34바이트, 28바이트입니다. id 142·143은 업스트림 ggml이 쓰는 번호가 아닙니다. 업스트림 이슈 [#29058](https://github.com/ggml-org/llama.cpp/issues/29058)은 2026-11-02에도 열려 있고, 스톡 `llama-cli`가 이 타입을 모르는 타입으로 거부한다고 적습니다.

그래서 "업스트림 QK=256, Prism QK=128"은 **TQ1_0/TQ2_0 대 PQ2_0/PTQ1_0**에 대해서는 맞습니다. Bonsai 2 카드가 올리는 세 번째 파일 Q2_0은 그 대조에 들어가지 않습니다. Q2_0의 QK는 64입니다. 카드는 이 파일만 스톡 llama.cpp **b11556**(2026-10-11, [PR #29600](https://github.com/ggml-org/llama.cpp/pull/29600))부터 돌릴 수 있다고 합니다. 더 오래된 스톡 빌드는 경고 없이 불러서 쓰레기를 낸다고 같은 카드가 경고합니다.

ik_llama.cpp가 256블록을 128블록으로 옮기는 도구가 [PR #2694](https://github.com/ikawrakow/ik_llama.cpp/pull/2694)의 `scripts/repack_ternary_to_prism.py`입니다. 대상은 Bonsai 2 GGUF가 아니라, 업스트림 형식으로 배포된 Maple(20B-A1B 삼진 MoE) 같은 `TQ1_0`/`TQ2_0` 파일입니다. 스크립트 머리주석은 256블록의 FP16 스케일을 128블록 두 개에 그대로 복사하고, 트릿은 다시 양자화하지 않으며, 디코드 결과가 비트 단위로 같다고 적습니다. `--selftest`는 무작위 블록 200개에 대해 `TQ1_0 → PTQ1_0`, `TQ2_0 → PQ2_0`의 트릿·스케일·실수값이 같은지 검사합니다. **몇 초가 걸리는지에 대한 측정은 스크립트에도 PR 본문에도 없습니다.**

```bash
# ik_llama.cpp, PR #2694에 적힌 명령
python3 scripts/repack_ternary_to_prism.py maple-TQ1_0.gguf maple-PTQ1_0.gguf
python3 scripts/repack_ternary_to_prism.py --selftest

llama-cli -m maple-PTQ1_0.gguf -rtr
```

PR은 Maple에서 `-rtr`이 필수라고 적습니다. R8이 아닌 Prism 경로는 이 MoE에 쓸 수 없다는 이유입니다. 같은 PR의 검증은 CPU이고, "CUDA was not exercised"라고 적혀 있습니다.

## 하다마드 회전과 부호 텐서

백서 표와 모델 카드의 가중치 기저는 **블록 1024의 하다마드 회전과 고정된 ±1 부호**입니다. 회전은 가중치에 미리 접혀 있어서 파일 크기를 늘리지 않습니다. 맞는 변환을 활성화에 적용하지 않으면, 접힌 가중치와 안 접힌 활성화를 곱하게 됩니다. 카드의 표현은 "런타임이 변환을 적용하거나, 아니면 파일을 거부해야 한다"입니다. 실제로는 오래된 스톡 빌드가 거부하지 않고 쓰레기를 냅니다.

ik_llama.cpp `src/llama-build-context.cpp`의 주석은 방향을 이렇게 적습니다. 정방향은 `H(Dx)`, 임베딩을 되돌릴 때는 `D(Hz)`. 함수 `llm_build_hadamard_rotate`는 정방향에서 부호 곱을 먼저 하고 하다마드를 적용합니다. 역방향은 하다마드 다음에 부호입니다. GDN의 `ssm_out`처럼 `perm_rep > 1`이면 정방향에서 그 순열을 부호보다 앞에 둡니다. 블록 길이는 코드에 박혀 있지 않고 GGUF 키 `prism.hadamard.block_size`로 읽습니다. 부호는 `prism.hadamard.sign_widths`와 `sign_values`이고, ±1이 아니면 회전을 무시합니다.

CUDA 커널 `ggml/src/ggml-cuda/hadamard.cu`는 블록 64, 128, 256, 512, 1024, 2048, 4096을 받습니다. 주석은 4096을 "prism.hadamard로 접힌 모델이 쓰는 예"라고 부릅니다. [PR #2691](https://github.com/ikawrakow/ik_llama.cpp/pull/2691)도 "Ternary 팩은 4096 블록으로 접혀 있어서, 그 커널이 없으면 회전이 CPU에 남는다"고 적습니다. 공식 카드·백서의 1024와 이 문장은 숫자가 다릅니다. 로더는 메타데이터를 따르므로, 1024 파일은 1024 커널로 가고 4096 파일은 4096 커널이 필요합니다. 어느 쪽 숫자가 27B 공개 파일의 모든 텐서에 해당하는지는 카드(1024)와 PR 문장(4096)이 서로 다르게 말합니다.

부호 텐서를 **어디에 할당하느냐**가 오프로드 비용이 됩니다. 메인테이너가 연 [이슈 #2570](https://github.com/ikawrakow/ik_llama.cpp/issues/2570)은, PR #2550 직후의 구현이 부호 텐서를 CPU 버퍼에 고정해서 GPU 추론이 사실상 쓸모없어진다고 적습니다. 층마다 그래프가 갈라지고 활성화가 장치와 호스트를 오가기 때문입니다. 이슈 본문은 크래시라고 부르지 않습니다. 이 이슈를 닫으려던 [PR #2573](https://github.com/ikawrakow/ik_llama.cpp/pull/2573)은 머지되지 않았습니다. 같은 배치(가중치와 같은 버퍼 타입에, `(폭, 장치)`마다 하나씩)는 [PR #2691](https://github.com/ikawrakow/ik_llama.cpp/pull/2691)에 포함되어 2026-10-19에 main으로 들어갔고, 2026-11-02의 `llama-model-loader.cpp`에 그 맵이 있습니다. 이슈 페이지 자체는 확인 시점에도 **open**이었습니다.

토큰이 깨진 별도의 경로가 [이슈 #2690](https://github.com/ikawrakow/ik_llama.cpp/issues/2690)입니다. Ternary-Bonsai-2-9B의 Q2_0이 `!!!!!!!!!!`처럼 토큰 0을 반복했습니다. fused up+gate가 활성화를 그대로 먹어서 하다마드 변환을 건너뛰었기 때문입니다. 작성자는 `-ngl 0`과 `-ngl 99` 둘 다에서 깨졌다고 적습니다. #2691은 접힌 가중치를 그 fused 경로에서 빼거나, 변환을 먼저 적용하도록 고쳤다고 설명합니다. 현재 `llm_build_ffn`은 `PQ2_0`/`PTQ1_0`과 그 R8을 fused 진입 조건에서 타입으로 제외하고, Q2_0은 하다마드 메타데이터가 같을 때 회전을 적용한 뒤에 fused op로 들어갑니다.

## `-ngl`과 `-rtr`이 실제로 받는 것

ik_llama.cpp `common/common.cpp`(main `e6d43ccd`)의 도움말 문자열은 두 줄입니다.

- `-ngl, --gpu-layers N` — "number of layers to store in VRAM". 다음 토큰을 정수로 읽습니다.
- `-rtr, --run-time-repack` — "repack tensors if interleaved variant is available". 값을 읽지 않습니다. `repack_tensors = true`로 두고 `mmap`을 끕니다.

`-rtr 1`의 `1`은 이 파서의 인자가 아닙니다. 플래그는 `-rtr` 또는 `--run-time-repack`입니다. [PR #147](https://github.com/ikawrakow/ik_llama.cpp/pull/147)(2024-12-17)이 이 옵션을 넣으면서 "CPU에서 돌릴 때 쓰고, mmap은 꺼진다"고 적었습니다.

하는 일은 행을 인터리브한 커널용 타입으로 다시 담는 것입니다. Prism 삼진에서는 `PQ2_0 → PQ2_0_R8`(타입 160), `PTQ1_0 → PTQ1_0_R8`(타입 161)입니다. [PR #2550](https://github.com/ikawrakow/ik_llama.cpp/pull/2550)이 2026-09-29에 이 경로를 넣었고, 측정은 **Ternary-Bonsai-2-27B**, i5-13420H, AVX2, P코어 4개(`taskset 0x55`), `--no-mmap`입니다.

| 형식 | 테스트 | R8 없음 (t/s) | R8 (t/s) | 배율 |
|---|---:|---:|---:|---:|
| PQ2_0 | pp256 | 1.93 | 11.45 | 5.93 |
| PQ2_0 | tg32 | 3.30 | 5.04 | 1.53 |
| PTQ1_0 | pp256 | 1.80 | 8.43 | 4.68 |
| PTQ1_0 | tg32 | 0.77 | 2.61 | 3.39 |

프롬프트 처리(pp256)가 생성(tg32)보다 크게 오릅니다. 같은 PR은 greedy(`--temp 0`) 출력이 R8 전후 비트 동일하고, 퍼플렉서티 차이도 1% 미만이라고 적습니다. 당시 주석은 **CPU 전용, `-ngl > 0`이면 경고**였습니다. 그 경고는 #2691에서 빠졌습니다. 이어진 [PR #2561](https://github.com/ikawrakow/ik_llama.cpp/pull/2561)은 PQ2_0_R8 프롬프트 처리가 #2550 대비 50% 가까이 나아졌고 ARM NEON이 추가됐다고 적습니다. 절대 tok/s는 다시 제시하지 않습니다.

README의 주의도 그대로입니다. MoE를 CPU와 GPU에 나눠 올릴 때 `-rtr`을 켜면, CUDA 커널이 없는 인터리브 타입은 **VRAM에 올릴 수 있던 곱셈까지 CPU에 고정**될 수 있습니다. k-quant가 그 예로 적혀 있습니다.

## GPU에 전부 올리는 경로가 어디까지 왔나

#2691(2026-10-19 머지, "Ternary Bonsai Q2_0/PQ2_0: output fixes + complete CUDA support")의 측정은 RTX 3060, `-ngl 99`, greedy입니다.

| | pp512 | pp2048 | tg64 |
|---|---:|---:|---:|
| Q2_0 | 1583 | 1737 | 86.1 |
| PQ2_0 | 1594 | 1756 | 89.1 |

본문은 CPU와 CUDA의 greedy 출력이 바이트 단위로 같고, 퍼플렉서티 34.0148도 비트 단위로 같다고 적습니다. **표에 파라미터 수(27B인지 9B인지)는 없습니다.** #2690이 재현에 쓴 파일은 9B Q2_0입니다. 이 숫자를 27B의 속도로 읽으면 안 됩니다.

CUDA 쪽 소스에서 `GGML_TYPE_PQ2_0`과 `GGML_TYPE_Q2_0`은 `mmq.cuh`와 `mmvq.cu`에 있습니다. `mmq.cuh` 주석은 PQ2_0을 "128개짜리 블록, Q2_0과 같은 2비트 코덱"이라고 부릅니다. **`PTQ1_0`이라는 문자열은 `mmq.cuh`와 `mmvq.cu`에 없습니다.** 카드가 메모리가 가장 빡빡할 때 고르라고 한 5.95GB 파일은, ik_llama.cpp의 이 CUDA 행렬곱 경로의 대상이 아닙니다. #2550의 PTQ1_0 경로는 CPU의 R8 커널입니다.

그 밖의 한계도 PR에 적혀 있습니다.

- [PR #2704](https://github.com/ikawrakow/ik_llama.cpp/pull/2704)는 `prism.hadamard.version`이 있는 모델에서 split mode `graph`(와 같은 블록에서 `attn`)를 `layer`로 바꿉니다. 경고 문구는 "Split mode 'graph' is not supported for Prism models"입니다. 다중 GPU에서 그래프를 쪼개는 구성은 이 모델의 지원 경로가 아닙니다.
- [PR #2747](https://github.com/ikawrakow/ik_llama.cpp/pull/2747)은 Q2_0/PQ2_0 expert를 GPU에 올렸을 때 `mmq_id.cu`가 abort하던 것을 고칩니다. 재현 모델은 ISTA-DASLab의 Qwen3.8-Flash-Next GSQ-RCO이지 Bonsai 2가 아닙니다. 크래시의 원인으로 적힌 것은 부호 텐서가 아니라, MMQ_ID에 타일 로더가 없던 것입니다.
- README는 제대로 빠르다고 보는 백엔드를 CPU(AVX2 이상 또는 ARM NEON 이상)와 CUDA(Turing 이상)로 한정합니다. ROCm, Vulkan, Metal, 구형 NVIDIA에 대한 이슈는 받지 않겠다고 적습니다.

Prism 카드의 실행 예는 **PrismML 포크 또는 b11556 이후 스톡**을 위한 것이고, ik_llama.cpp 측정이 아닙니다. 카드는 `-ngl 99`를 "모든 층을 올린다"고 설명합니다. Bonsai 2 언어 모델은 64블록입니다.

```bash
# 모델 카드의 명령. PQ2_0/PTQ1_0는 PrismML-Eng/llama.cpp,
# Q2_0는 스톡 llama.cpp b11556 이상.
llama-cli -m Ternary-Bonsai-2-27B-Q2_0.gguf \
    -ngl 99 -fa on -c 32768 \
    --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.05 \
    -p "Explain quantum computing in simple terms." -n 16384
```

카드가 같은 플래그로 제시하는 처리량(그들 커널, `llama-bench`, 배치 1)은 예를 들어 RTX 4090에서 PQ2_0 생성 81.2 tok/s, 프롬프트 3124 tok/s, Apple M5 Pro에서 PQ2_0 생성 28.1 tok/s입니다. 이 표는 ik_llama.cpp가 아닙니다.

## 팩트 체크

포스트 문장을 위 자료와 대조했습니다. ✅ 1차 자료와 맞음 / ⚠️ 방향은 맞거나 일부만 맞음 / ❌ 1차 자료와 어긋나거나, 그 내용이 1차 자료에 없음

확인 시점은 2026-11-02, ik_llama.cpp main `e6d43ccd`입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| Ternary Bonsai 2를 비롯한 삼진 모델이 ik_llama.cpp에서 완전히 동작한다 | ⚠️ | README는 `PQ2_0`/`PTQ1_0`를 [PR #2550](https://github.com/ikawrakow/ik_llama.cpp/pull/2550)·[#2691](https://github.com/ikawrakow/ik_llama.cpp/pull/2691)로, Maple을 [#2694](https://github.com/ikawrakow/ik_llama.cpp/pull/2694)로 적는다. Q2_0·PQ2_0 CUDA 행렬곱은 `mmq.cuh`/`mmvq.cu`에 있다. PTQ1_0는 그 두 파일에 없고, Prism 모델의 split mode `graph`는 [#2704](https://github.com/ikawrakow/ik_llama.cpp/pull/2704)가 `layer`로 내린다. Maple PR은 CUDA를 실행하지 않았다고 적는다. README가 빠른 백엔드로 보는 것은 AVX2+/NEON CPU와 Turing+ CUDA이다. |
| 업스트림 llama.cpp와 PrismML의 오랜 비호환이 해소되었다 | ⚠️ | 타입 분리는 남아 있다. 스톡 빌드는 PQ2_0(142)·PTQ1_0(143)을 거부하고, 이슈 [#29058](https://github.com/ggml-org/llama.cpp/issues/29058)은 열려 있다. 스톡이 받은 것은 Q2_0 + 하다마드이고, 릴리스 [b11556](https://github.com/ggml-org/llama.cpp/releases/tag/b11556)(2026-10-11)이다. ik의 Prism 삼진 CPU는 2026-09-29, CUDA는 2026-10-19에 들어왔다. |
| 블록 크기가 QK=256 대 QK=128로 달랐다 | ✅ | 업스트림 `TQ1_0`/`TQ2_0`는 `QK_K` 256([PR #8151](https://github.com/ggml-org/llama.cpp/pull/8151), `ggml-common.h`). Prism `PQ2_0`/`PTQ1_0`는 128(`QK_PQ2_0`, `QK_PTQ1_0`). 리팩 스크립트 머리주석이 이 대응을 그대로 적는다. Bonsai 2의 Q2_0 파일은 이쪽이 아니라 `QK2_0` 64이다. |
| 그 블록 차이와 하다마드 부호 텐서 처리 때문에 오프로드가 병목이 되거나 크래시가 났다 | ⚠️ | 부호 텐서를 CPU에 두어 층마다 복사·그래프 분할이 난다는 서술은 [이슈 #2570](https://github.com/ikawrakow/ik_llama.cpp/issues/2570)에 있다. 이슈는 크래시라고 하지 않는다. 블록 256/128은 타입 불일치라 로더가 거부하거나 리팩이 필요한 문제이고, #2570의 장치 간 복사와는 다른 현상이다. abort로 닫힌 사례는 [#2747](https://github.com/ikawrakow/ik_llama.cpp/pull/2747)의 MMQ_ID 타일 로더 부재이고, 재현은 Qwen MoE의 Q2_0 expert이다. |
| 최신 ik_llama.cpp가 네이티브로 지원한다 | ✅ | main의 `ggml.h`에 `GGML_TYPE_PQ2_0 = 142`, `GGML_TYPE_PTQ1_0 = 143`, R8은 160·161. README Quantization 절이 같은 PR을 가리킨다. `prism.hadamard.*`가 없으면 로더는 회전 없이 반환한다. |
| `-ngl 99`로 토큰 손상 없이 GPU 풀 오프로드가 된다 | ⚠️ | `-ngl N`은 VRAM에 올릴 층 수이다. #2691은 RTX 3060, `-ngl 99`에서 Q2_0/PQ2_0의 greedy 출력이 CPU와 바이트 동일하고 PPL 34.0148이 비트 동일하다고 적는다. 모델 크기는 표에 없다. 수정 전의 #2690은 9B Q2_0이 `-ngl 99`에서도 `!!!!!!!!!!`를 냈다. PTQ1_0 CUDA 행렬곱은 위 파일에 없다. 다중 GPU `graph` 분할은 #2704가 막는다. Prism 카드의 `-ngl 99` 예제는 Prism 포크와 스톡 b11556용이다. |
| `repack_ternary_to_prism.py`가 트릿을 유지한 무손실 리팩이다 | ✅ | 스크립트와 [#2694](https://github.com/ikawrakow/ik_llama.cpp/pull/2694): `TQ1_0→PTQ1_0`, `TQ2_0→PQ2_0`, 스케일을 두 블록에 복사, 재양자화 없음, `--selftest`가 트릿·스케일·실수를 검사. Bonsai 2 공식 GGUF를 이 스크립트의 입력으로 적지는 않는다. 입력은 업스트림 TQ 파일이다. |
| 그 리팩이 수 초 안에 끝난다 | ⚠️ | 시간 측정이 스크립트, selftest 출력, PR 본문에 없다. selftest가 말하는 것은 "lossless"이다. |
| `-rtr 1`(Runtime Repack)이 CPU 프롬프트 처리 병목을 줄인다 | ⚠️ | 동작 자체는 #2550의 27B CPU 표와 맞다. PQ2_0 pp256이 1.93에서 11.45 t/s로 올랐다. 문법 `-rtr 1`은 아니다. 파서는 `-rtr`/`--run-time-repack`를 값 없는 플래그로 읽고 mmap을 끈다([`common.cpp`](https://github.com/ikawrakow/ik_llama.cpp/blob/e6d43ccdc097f50e91be9e88773df493321d44b3/common/common.cpp), [PR #147](https://github.com/ikawrakow/ik_llama.cpp/pull/147)). README는 MoE를 CPU/GPU로 나눌 때 이 플래그가 곱셈을 CPU에 고정할 수 있다고 경고한다. |
| 27B를 로컬에서 효율적으로 돌릴 표준 환경이 갖춰졌다 | ⚠️ | 27.36B와 5.95–7.63GB는 카드·백서에 있다. ik가 27B로 공개한 속도는 #2550의 CPU 표(PQ2_0 R8, tg32 5.04 t/s, P코어 4개)이다. #2691의 GPU 표는 파라미터 수를 적지 않는다. 카드의 수십 tok/s 표는 Prism 커널이다. "최적·표준"은 작성자의 평가이고, 카드는 실행의 기준으로 Bonsai-demo를 지정한다. |

**총평:** 삼진 블록이 256과 128으로 갈리고, ik_llama.cpp가 PQ2_0/PTQ1_0를 타입으로 갖고, Q2_0/PQ2_0를 CUDA에서 돌려 토큰이 CPU와 같았다는 측정이 있으며, 트릿을 유지하는 리팩 스크립트가 있다는 뼈대는 저장소와 맞습니다. 문장이 한 덩어리로 묶은 인과(블록 차이가 곧 오프로드 크래시), `-rtr 1`이라는 문법, PTQ1_0까지 포함한 풀 GPU 오프로드, 수 초, 그리고 27B GPU 속도는 그 자료에 없습니다. 부호 텐서가 CPU에 머물면 오프로드가 느려진다는 #2570은 맞고, 그 배치는 #2691로 main에 들어가 있으며 이슈는 아직 열려 있습니다.

## 로컬에서 고를 때

1. **파일을 먼저 고른다.** PQ2_0/PTQ1_0는 스톡 llama.cpp가 거부한다([#29058](https://github.com/ggml-org/llama.cpp/issues/29058)). 스톡 b11556 이후에는 카드의 Q2_0 파일을 쓴다. 더 오래된 빌드는 같은 파일을 경고 없이 열고 쓰레기를 낸다.
2. **ik_llama.cpp에서 GPU로 확인된 패킹은 Q2_0과 PQ2_0이다.** PTQ1_0의 공개 속도는 CPU R8(#2550)이다. `mmq.cuh`에 PTQ1_0 커널이 생긴 뒤에 GPU 숫자를 말하는 편이 맞다.
3. **런타임 리팩은 `-rtr`이다.** 뒤에 숫자를 붙이는 문법은 `common.cpp`에 없다. MoE 일부를 CPU에 남길 계획이면 README의 `-rtr` 경고를 먼저 읽는다. Maple은 PR이 `-rtr`을 필수라고 적는다.
4. **업스트림 TQ 파일을 ik의 Prism 커널에 태울 때만 리팩 스크립트를 쓴다.** `TQ1_0`은 `PTQ1_0`, `TQ2_0`은 `PQ2_0`이다. 이미 PQ2_0/PTQ1_0/Q2_0인 Bonsai 2 파일을 이 스크립트의 입력으로 적은 자료는 없다.
5. **다중 GPU에서는 `graph` 분할을 기대하지 않는다.** Prism 메타데이터가 있으면 ik는 `layer`로 내린다(#2704).
6. **하다마드 블록은 메타데이터 값이다.** 카드·백서는 1024, CUDA 주석과 #2691은 4096 파일을 말한다. `llama-cli --version`과 GGUF의 `prism.hadamard.block_size`를 보는 쪽이 광고 문장보다 앞이다.

## 참고 자료

- PrismML, Ternary Bonsai 2 27B GGUF 모델 카드 — [Hugging Face](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- PrismML, *Ternary Bonsai 2 27B* 백서 (2026년 9월, 블록 1024·`w_i = s_g · t_i`) — [PDF](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf)
- Shuming Ma, Hongyu Wang 외, *The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits* — [arXiv:2402.17764](https://arxiv.org/abs/2402.17764)
- ikawrakow/ik_llama.cpp main `e6d43ccd` (2026-11-02 확인) — [저장소](https://github.com/ikawrakow/ik_llama.cpp) · [README의 PQ2_0/PTQ1_0 절](https://github.com/ikawrakow/ik_llama.cpp/blob/e6d43ccdc097f50e91be9e88773df493321d44b3/README.md) · [`common/common.cpp`의 `-ngl`/`-rtr`](https://github.com/ikawrakow/ik_llama.cpp/blob/e6d43ccdc097f50e91be9e88773df493321d44b3/common/common.cpp) · [`scripts/repack_ternary_to_prism.py`](https://github.com/ikawrakow/ik_llama.cpp/blob/e6d43ccdc097f50e91be9e88773df493321d44b3/scripts/repack_ternary_to_prism.py) · [`hadamard.cu`](https://github.com/ikawrakow/ik_llama.cpp/blob/e6d43ccdc097f50e91be9e88773df493321d44b3/ggml/src/ggml-cuda/hadamard.cu)
- Bl4ckyou, Prism ternary PQ2_0/PTQ1_0와 R8, ik PR #2550, 2026-09-29 머지 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2550)
- ikawrakow, PQ2_0_R8 리팩 개선, PR #2561, 2026-09-29 머지 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2561)
- ikawrakow, 부호 텐서가 CPU에 고정되어 GPU 오프로드가 병목이 된다는 이슈 #2570 (확인 시점 open) — [이슈](https://github.com/ikawrakow/ik_llama.cpp/issues/2570)
- TitanMamo, Q2_0/PQ2_0 CUDA와 fused up+gate 수정, PR #2691, 2026-10-19 머지, 커밋 [3d7b18cf](https://github.com/ikawrakow/ik_llama.cpp/commit/3d7b18cf01a32d8e468b75e937689bd2bc9d0ec7) — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2691) · 수정 전 쓰레기 출력 [이슈 #2690](https://github.com/ikawrakow/ik_llama.cpp/issues/2690)
- Bl4ckyou, Maple 20B-A1B와 리팩 스크립트, PR #2694, 2026-10-19 머지 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2694)
- TitanMamo, Prism 모델의 split mode를 layer로, PR #2704 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2704)
- dmaivel, Q2_0/PQ2_0 MMQ_ID, PR #2747 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/2747)
- ikawrakow, 런타임 리팩 `-rtr`, PR #147 — [PR](https://github.com/ikawrakow/ik_llama.cpp/pull/147)
- ggml-org/llama.cpp, `TQ1_0`/`TQ2_0`, PR #8151 — [PR](https://github.com/ggml-org/llama.cpp/pull/8151)
- bri-prism, 업스트림의 Prism Bonsai 2 27B Q2_0 런타임, PR #29600, 릴리스 b11556 — [PR](https://github.com/ggml-org/llama.cpp/pull/29600) · [릴리스](https://github.com/ggml-org/llama.cpp/releases/tag/b11556)
- 업스트림 기능 요청: PQ2_0/PTQ1_0 (open) — [이슈 #29058](https://github.com/ggml-org/llama.cpp/issues/29058)
- 원본 X 포스트: [@ai_hakase_, 2026-11-01](https://x.com/ai_hakase_/status/2116745550980624704)
