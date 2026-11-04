---
title: "게이밍 PC가 284B를 돌리나? FreeToken 논문 팩트 체크"
date: 2026-11-04
time: "21:22"
slug: freetoken-consumer-gpu-giant-models
tags: [FreeToken, MoE, 추론, 오프로드, 팩트체크]
summary: "FreeToken(arXiv:2608.16157 v1)은 MoE 전문가 풀을 호스트 RAM에 두고 GPU VRAM은 LRU 캐시로 씁니다. 8GB RTX 4060 노트북의 39.3 tok/s는 Qwen3.6 NVFP4이고, 284B의 22–25 tok/s는 임대 제온 서버의 RTX 5090에 적혀 있습니다."
---

> 이 글은 북마크해 둔 [@alex_verem의 포스트](https://x.com/alex_verem/status/2117299706284118047)(공개 페이지의 `article:published_time` 2026-11-02 16:56 UTC, 2026-11-03 01:56 KST)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117299706284118047](https://x.com/i/status/2117299706284118047)입니다. 이 환경의 X API는 계정 등록 오류로 본문을 주지 않아, 공개 상태 페이지의 글을 읽었습니다. 그 글의 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 [arXiv:2608.16157](https://arxiv.org/abs/2608.16157) v1(2026-08-17 제출)의 [HTML](https://arxiv.org/html/2608.16157v1), [PDF](https://arxiv.org/pdf/2608.16157v1), [소스](https://arxiv.org/src/2608.16157), 그리고 2026-11-04에 본 [FlashML-org/FreeToken](https://github.com/FlashML-org/FreeToken) main `628b88ff`(2026-11-04 08:09 UTC)의 README·LICENSE·`docs/`입니다. 처리량 숫자는 논문이 적은 값이고, 이 글은 다시 재지 않았습니다. 동료 심사 전 프리프린트입니다.

## 왜 이 논문이 로컬 서빙에 닿는가

포스트의 첫 문장은 "당신의 게이밍 PC가 이제 284B AI 모델을 돌릴 수 있다"입니다. 그 다음 문장은 버클리와 MIT 연구자가 FreeToken이라는 무료 엔진을 오픈소스로 공개했고, 그 엔진이 거대한 모델을 자기 그래픽 카드에서 돌린다는 것입니다. 논문에서 돌렸다고 적은 세 칸은 8GB 그래픽 카드가 있는 노트북의 35B, 게이밍 데스크톱의 284B, 워크스테이션 카드 한 장의 753B GLM-5.2입니다.

Yang, Fan, Pan, Xi, Wang, Sun, Keutzer, Han, Zaharia, Xu, Stoica의 [*FreeToken: Efficient Edge-Native MoE Serving with Bandwidth-Adaptive Execution*](https://arxiv.org/abs/2608.16157)가 그 논문입니다. v1 소스에서 Shuo Yang과 Xiaoze Fan은 공동 1저자이고, Chenfeng Xu와 Ion Stoica는 co-advise입니다. 개발자에게 닿는 지점은 "284B가 VRAM에 들어간다"가 아닙니다. 논문 3절이 만드는 기계는 **전문가 풀 전체는 호스트 메모리에 두고, 남은 GPU 메모리는 모든 MoE 층이 나눠 쓰는 탄성 캐시**입니다. 비전문가 가중치(어텐션 등)는 GPU에 남습니다.

## 한 토큰이 만지는 가중치와 풀 전체

DeepSeek-V4-Flash는 논문이 284B, 활성 13B로 적습니다. 43개 층이 모두 MoE이고, 층마다 라우팅 전문가 256개 중 토큰당 6개에 공유 전문가 1개가 더해집니다. 배포 정밀도에서 그 활성 발자국은 RTX 5090의 32GB 안에 들어간다고 1절이 적습니다. 풀 전체는 그렇지 않습니다. 모델 표의 라우팅 전문가 풀은 **147GB**, 전문가 하나 크기는 13.4MB, 전문가 정밀도는 MXFP4, 어텐션·밀집 정밀도는 FP8입니다. 2.1절은 FP4 배포가 옮기는 전문가 가중치를 **대략 140GB**라고 따로 적습니다. 두 숫자는 같은 절의 같은 표가 아닙니다.

Qwen3.6-35B-A3B는 35B 중 활성 3B, 40층, 층당 전문가 256개, 토큰당 8+1입니다. 정밀도 짝을 맞춘 실험의 전문가 가중치는 BF16이고 풀은 **64.4GB**, 전문가 하나는 6.3MB입니다. 8GB 노트북만 공식 NVFP4 릴리스를 씁니다. 표는 서빙 중에 실행되지 않는 멀티토큰 예측 전문가 블록(0.84B / 19B)을 파라미터 수에서 뺐다고 적습니다.

GLM-5.2는 교차 하드웨어 절의 추가 모델입니다. 753B, 활성 40B, 라우팅 전문가는 NVFP4, 체크포인트는 **433GB**입니다. 이것을 돌린 GPU는 RTX PRO 6000 Blackwell 한 장(96GB)이고, 그 기계의 DRAM 열은 DDR5 512GiB입니다.

Kimi-K3는 가중치가 공개돼도 소비자 메모리를 넘는다고 그림 1이 적습니다. 그 칸의 숫자는 594GB입니다.

## 프리필은 층을 미리 흘리고, 디코드는 미스만 나눈다

프리필은 토큰이 많아서 층마다 전문가 거의 전부를 건드립니다. 그래서 FreeToken은 미스를 하나씩 기다리지 않고, 슬롯 풀에서 층 버퍼 두 개를 잡습니다. GPU가 층 \(l\)을 계산하는 동안 전송 스트림이 층 \(l+1\) 전체를 PCIe로 넣습니다. 라우팅이 알려지기 전에 옮길 수 있습니다. 슬롯이 층 두 개분을 못 내면 온디맨드 로딩으로 돌아갑니다. 버퍼는 디코드 캐시와 같은 슬롯 풀이라, 프리필에서 남은 엔트리가 디코드의 시작 상태가 됩니다.

에이전트는 매 턴 문맥을 고칩니다. 하이브리드 어텐션의 순환 상태는 앞 문맥 전체가 상태 하나에 눌려 있어서, 수정 지점 뒤의 체크포인트는 무효가 됩니다. FreeToken은 전체 어텐션 KV를 기수(radix) 프리픽스 트리로 두고, 순환 상태 체크포인트는 생각 구간·도구 호출·대화 턴 같은 특수 토큰 경계에만 찍습니다. 편집이 그 블록 단위로 일어나면, 앵커 앞은 다시 계산하지 않고 새 접미만 프리필합니다. 체크포인트 슬롯은 KV 풀과 따로 LRU로 걷어 냅니다.

디코드는 반대입니다. 라우터와 캐시 조회는 GPU에서 하고, 이미 올라와 있는 전문가 \(\mathcal{H}\)는 GPU가 그대로 계산합니다. 남은 고유 미스 \(m\)개를 \(q^\star\)가 PCIe로 채워 캐시에 남길 집합과, CPU가 제자리에서 계산할 집합으로 나눕니다. 논문 식 (2)–(4)를 그대로 옮기면 이렇습니다. 저장소 코드의 복사가 아니라 본문 식의 의사코드입니다.

```python
# Yang et al., arXiv:2608.16157 v1, 식 (2)–(4).
# S: 전문가 하나. B_P: 핀된 전문가 전송 대역폭. B_H: CPU 전문가 커널의 실측 대역폭.

B_R = max(B_H - B_P, 0)          # PCIe가 포화한 뒤 남는 호스트 대역폭
# T_fill(q) ≈ q*S / B_P
# T_cpu(m-q) ≈ (m-q)*S / (B_H - B_P)    # B_H > B_P 일 때
# 두 갈래를 같게 두면
q_star = m * B_P / B_H
```

\(B_H\)가 \(B_P\)에 가까워지면 \(q^\star\)는 \(m\)에 가까워지고, 정책은 온디맨드 캐시 채우기로 돌아간다고 3.2절이 적습니다. 구현은 \(q^\star\)를 정수로 반올림하고, CPU가 미스 대부분을 맡아도 채우기를 최소 한 개는 남겨 캐시가 계속 더워지게 합니다. 어떤 전문가를 채울지는 교체 정책이 고릅니다. CPU와 GPU의 부분합은 합쳐지고, 논문은 이 합이 알고리즘 근사 없이 MoE 출력과 같다고 적습니다. \(B_P\)와 \(B_H\)는 스펙 시트가 아니라 그 기계에서 배포 텐서 모양으로 잽니다.

캐시가 따라가는 근거는 짧은 구간의 라우팅 지역성입니다. 적중은 최근 사용을 갱신하고, 채우기는 새 전문가를 들이며, 퇴거는 가장 오래 안 쓰인 슬롯입니다. 5.3절이 같은 라우팅 트레이스를 같은 캐시 용량으로 재생한 결과, RTX 5090 서빙 용량(Qwen 전문가 풀의 37%, DSV4 풀의 11%)에서 FreeToken LRU의 디코드 미스율은 16%와 39%입니다. 같은 용량에서 KTransformers의 프리필 때 고른 배치는 41%와 59%, llama.cpp의 라우팅을 안 보는 정적 분할은 62%와 89%입니다.

디스크는 이 루프의 세 번째 계층이 아닙니다. 2.3절은 FP4 DeepSeek-V4-Flash의 약 140GB 풀을 7GB/s NVMe에서 읽는 데만 약 20초가 걸린다고 적고, 그 비용은 **기동**입니다. 3.3절의 빠른 기동은 전문가 가중치를 최종 호스트 레이아웃으로 직접 읽은 뒤 핀하고, GPU 워밍업은 하지 않습니다. 첫 요청은 차가운 캐시로 3.2절의 디코드 경로를 탑니다. 풀 전체를 핀하거나 DMA에 등록하지 못하면 4.2절의 순수 CPU MoE 백엔드로 내려가고, 가중치는 페이지 가능한 호스트 저장에 남습니다. 비전문가 층은 GPU에 있습니다.

실행 중 VRAM이 줄거나 KV가 커지면, 스케줄러의 안전 지점에서 GPU 전문가 캐시만 다시 만듭니다. 엔진을 재시작하거나 호스트 풀을 다시 읽지 않습니다. 논문이 반복하는 불변식은, 호스트 풀이 기준 사본이므로 GPU 메모리는 성능만 바꾸고 정확도는 바꾸지 않는다는 것입니다.

## 논문이 실제로 잰 기계

표 1의 여섯 대입니다. \(B_P\)·\(B_H\)는 배포 텐서에서 잰 값입니다. 3090·4090·5090 행은 임대 듀얼 소켓 서버이고, CPU 스레드와 DRAM 열은 컨테이너 할당량입니다. 서빙과 대역폭 측정은 그 서버에서 6 CPU 스레드로 묶고 GPU의 NUMA 노드에 고정했다고 5.1절이 적습니다. 데스크톱과 노트북은 그 제한 없이 돌렸습니다.

| 시스템 | GPU | PCIe | \(B_P\) | CPU (표의 스레드) | DRAM | \(B_H\) |
|---|---|---|---:|---|---|---:|
| 5090 서버 | RTX 5090 32GB | 5.0 ×16 | 52.7 GB/s | 2× Xeon Gold 6459C (32) | DDR5 180 GiB | 77.3 GB/s |
| 4090 서버 | RTX 4090 24GB | 4.0 ×16 | 25.1 GB/s | 2× Xeon Platinum 8358P (32) | DDR4 240 GiB | 63.2 GB/s |
| 3090 서버 | RTX 3090 24GB | 4.0 ×16 | 25.3 GB/s | 2× Xeon Gold 6330 (28) | DDR4 180 GiB | 56.7 GB/s |
| 5090 데스크톱 | RTX 5090 32GB | 5.0 ×16 | 49.0 GB/s | Ryzen 9 9950X3D (32) | DDR5 192 GiB | 53.8 GB/s |
| 4060 노트북 | RTX 4060 Laptop 8GB | 4.0 ×8 | 11.8 GB/s | Core i9-13900H (20) | LPDDR5 32 GiB | 47.5 GB/s |
| PRO 6000 | RTX PRO 6000 96GB | 5.0 ×16 | 51.5 GB/s | Xeon Platinum 8559C (48) | DDR5 512 GiB | 178 GB/s |

5.1절은 이렇게 묶은 서버의 호스트 대역폭 56.7–77.3 GB/s가, 데스크톱 16코어의 53.8 GB/s, 노트북 14코어의 47.5 GB/s와 같은 규모라고 적습니다. 표의 CPU 칸은 같은 두 기계에 Ryzen 9 9950X3D (32), Core i9-13900H (20)이라고 적습니다.

워크로드는 네 개입니다. W1은 도구 없는 AIME 장문 추론입니다. W2는 OpenCode로 SWE-bench 이슈를 세 턴 푸는 코딩 에이전트입니다. W3는 같은 이슈를 Claude Code와 Anthropic 호환 엔드포인트로 돌리고, 세션이 56–65k 토큰까지 자랍니다. W4는 OpenClaw 메일·일정 13턴이고, 시스템 문맥 바닥이 약 24.5k 토큰입니다. 느린 엔진을 재려고 OpenClaw의 120초 유휴 워치독은 껐습니다. 코딩 실행은 기준 패치를 내야 하고, W4는 13턴을 끝내야 합니다. 궤적이 엔진마다 갈라지므로 벽시계 합계는 비교하지 않습니다.

그림 3의 22–25 tok/s와 77–83 tok/s는 **RTX 5090** 칸입니다. 괄호는 Qwen3.6가 6 CPU 스레드, DSV4-Flash가 8입니다. 5.1절의 "모든 서빙 실행을 6스레드로 제한"과 DSV4의 8은 본문에 둘 다 있습니다. 이 칸의 기계 이름은 표 1의 첫 행, 임대 서버입니다. 게이밍 데스크톱 행이 아닙니다.

| 결과 (논문이 본문에 찍은 것) | 값 | 조건 |
|---|---|---|
| Qwen3.6-35B-A3B 디코드 | 77–83 tok/s | RTX 5090, BF16, W1–W4. 최강 베이스라인의 1.8–2.3배 |
| DeepSeek-V4-Flash 디코드 | 22–25 tok/s | 같은 RTX 5090, 공식 MXFP4, W1–W4. 1.5–1.9배 |
| 에이전트 워크로드에서의 흔들림 | W1 대비 12% 안 | 같은 5090. KTransformers의 DSV4는 W2에서 W1 속도의 31%를 잃음 |
| 최악 TTFT | 44초 미만 | 모든 칸. llama.cpp 232초, Ollama 179초, KTransformers 946초가 각자 한 칸 이상 |
| 4060 노트북 | 39.3 tok/s | 그림 5, W2, Qwen NVFP4. 논문은 4090 속도의 92%라고 적음 |
| 5090 데스크톱 대 5090 서버 | FreeToken 4% 감소 | 그림 5의 두 5090 열. 그 그림의 Qwen 열은 BF16 |
| GLM-5.2 | 14.9 tok/s 대 llama.cpp 7.3 | PRO 6000, 수학 워크로드, 평균 TTFT 7.5초 대 7.8초 |

프리필 쪽 숫자도 5090과 Qwen BF16입니다. 두 번째 버퍼를 켜면 8,192토큰 청크가 1.19–1.22초입니다. 64.4GB 풀을 52.7 GB/s로 한 번 흘리는 시간이고, 논문은 이를 PCIe 5.0 ×16의 실용 상한으로 적습니다. 16k 토큰에서 프리필은 6.7k tok/s입니다. 버퍼를 끄면 4k에서 19%, 8k에서 25%, 16k에서 26%가 빠집니다.

비교 엔진은 llama.cpp, Ollama, KTransformers, MoE-Infinity입니다. Qwen은 모두 BF16, DSV4 전문가 블록은 네이티브 MXFP4를 비트 단위로 같이 읽습니다. Ollama와 MoE-Infinity는 DSV4를 못 돌리고, MoE-Infinity는 W1만 8.8 tok/s입니다. KTransformers는 이 PRO 6000 박스에서 GLM-5.2를 서빙할 경로가 없다고 논문이 적습니다. 그 이유 문장은 KTransformers의 GLM-5.2 방법이 호스트 상주 전문가 753GB–1.5TB를 요구하고, 박스에는 512GiB가 있으며, CPU 커널이 NVFP4 레이아웃을 읽지 않는다는 것입니다. 이 문장의 주어는 FreeToken 논문입니다.

vLLM과 SGLang은 4절과 6절에서 **기반**으로 나옵니다. 페이징 KV, 기수 프리픽스, FlashInfer가 그 자리입니다. 5절의 속도 표에 vLLM 열은 없습니다. 6절이 llama.cpp·Ollama에 대해 말하는 차이는 로드 때 층 전체를 장치에 고정한다는 점이고, KTransformers에 대해 말하는 차이는 핫 전문가를 GPU에 고정한 채 나머지를 CPU에 둔다는 점입니다. FreeToken이 자기 기여로 적는 것은 미스 예측을 더 잘하는 일이 아니라, 남은 미스를 실측 대역폭 비로 나누고 그 나눗셈을 CUDA 그래프 안에 두는 일입니다. 계산은 라우팅된 전문가를 그대로 두고, 모델을 미세조정하지 않는다고 6절이 적습니다.

## 저장소가 지금 알려 주는 실행

논문이 시스템을 풀어 둔 주소는 flashml.ai와 GitHub입니다. 아래 명령은 2026-08-17 논문 본문이 아니라, 2026-11-04 main `628b88ff`의 [docs/install.md](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/install.md), [docs/quickstart.md](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/quickstart.md), [docs/models.md](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/models.md)입니다. 그 문서의 요구는 Linux x86_64, NVIDIA GPU, 드라이버 r580 이상(CUDA 13), Python 3.10 이상입니다. AMD는 같은 install 문서가 ROCm 안내를 아직 WIP로 가리킵니다.

```bash
uv venv && source .venv/bin/activate
uv pip install "freetoken[accel]"
ft bench bw --model ~/models/DeepSeek-V4-Flash-0731
ft serve --model ~/models/DeepSeek-V4-Flash-0731 --moe-strategy hybrid
```

`ft bench bw`는 기계와 모델마다 한 번 재서 hybrid가 쓰는 분할을 맞춥니다. 서버 준비 로그의 주소는 `127.0.0.1:1919`입니다. OpenAI 호환(`/v1/chat/completions`)과 Anthropic 호환(`/v1/messages`)이 같은 프로세스에 있습니다. `ft launch claude`처럼 코딩 에이전트 CLI를 그 서버에 붙이는 명령도 quickstart에 있습니다.

전략 이름의 기본값은 논문 제목과 다릅니다. `docs/models.md`에서 MoE의 `auto`는 **`offload`**입니다. 전문가는 호스트 RAM, GPU에는 LRU 슬롯, 미스는 PCIe로 흐릅니다. `cpu`는 미스를 CPU에서 계산합니다. `hybrid`가 논문의 \(q^\star\)에 해당하는 "일부는 가져오고 일부는 CPU"입니다. 밀집 모델의 `auto`는 `fused`이고, GB10처럼 GPU와 CPU가 DRAM을 공유하는 기계에서는 MoE도 `fused`로 떨어집니다. DeepSeek-V4 전문가는 그 기계에서도 상주 경로가 없어 `offload`에 남습니다.

WSL은 CUDA 핀 메모리를 RAM의 절반 근처에서 자른다고 같은 문서가 적습니다. `--moe-cpu-layers auto`는 가운데 층부터 핀하다가 CUDA가 거절하면 머리와 꼬리 층을 OS 잠금으로 남깁니다. 잠긴 층은 hybrid에서 작은 핀 스테이징 버퍼를 거쳐 일부만 GPU로 올리고, 나머지는 CPU가 계산합니다.

데스크톱 앱은 README가 Windows와 Linux용으로 [flashml.ai](https://www.flashml.ai/)를 가리킵니다. 그 페이지의 소프트웨어 마크업은 `offers.price`를 `"0"`, `priceCurrency`를 `USD`로 두고, 운영체제를 Windows, Linux로 적습니다. 엔진 소스의 [LICENSE](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/LICENSE)는 Apache-2.0이고 저작권 줄은 "Copyright 2026 FreeToken Authors"입니다.

같은 `docs/models.md`의 체크포인트 표에는 논문 실험의 세 모델 밖에 DeepSeek-V4.1-Flash, Qwen3.8, GLM-5.3-Flash, Gemma-4, gpt-oss, MiniMax, Muse-Glimmer가 있습니다. 논문이 "20개가 넘는 MoE"라고 한 문장과, 이 표가 그 20개의 목록인지는 논문이 이름을 적지 않아 여기서 맞추지 않습니다. V4.1의 Engram 표 두 개(각 98GiB)는 체크포인트 샤드에서 필요할 때 읽고, 문서는 빠른 NVMe에 두라고 합니다. 이것은 2026-11-04 문서의 V4.1 경로이고, 8월 논문의 디코드 스케줄(호스트 RAM과 GPU 캐시)과 같은 문단이 아닙니다.

## 비즈니스 인사이트

2026년의 로컬 MoE 서빙은 "그래픽 카드 용량"과 "기계 전체의 메모리 계층"이 다른 상품으로 팔리고 있습니다. 숫자와 회사 사실은 아래 출처에 붙입니다.

논문이 직접 잰 경쟁 상대는 llama.cpp, Ollama, KTransformers, MoE-Infinity입니다. KTransformers는 논문 참고문헌이 SOSP 2025와 [저장소](https://github.com/kvcache-ai/ktransformers)로 적습니다. llama.cpp는 [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)입니다. vLLM([arXiv:2309.06180](https://arxiv.org/abs/2309.06180))은 이 논문의 처리량 베이스라인이 아니고, SGLang과 함께 서빙 기판으로 인용됩니다. "vLLM보다 몇 배"는 이 논문에 없는 문장입니다.

속도 비교를 Codex로 읽을 때는 정의가 갈립니다. FreeToken 서론은 4060 노트북의 39.3 tok/s가 Codex 중앙값 33 tok/s를 넘는다고 쓰고, Zhu 등의 TraceLab을 인용합니다. TraceLab [arXiv:2606.30560](https://arxiv.org/html/2606.30560) 5.4절의 식은 정규화 디코드 속도 \(s_{\mathrm{norm}}=O/(t_{\mathrm{last}}-t_{\mathrm{input}})\)이고, 출력 토큰을 첫 모델 출력 직전의 입력 시각부터 마지막 모델 출력까지로 나눕니다. TTFT와 추론 토큰과 트레이스 기록이 들어갑니다. 그 절이 적은 Codex 중앙값은 **정규화 33.9 tok/s**, 순수 디코드 중앙값은 **61.3 tok/s**(추정 TTFT 3.1초)입니다. 변동계수 50% 초과도 같은 문단에 있습니다. 39.3과 33의 비교는 FreeToken 디코드 tok/s와 TraceLab의 끝에서 끝까지 트레이스 속도를 나란히 둔 것이고, TraceLab의 순수 디코드 61.3과는 같은 열이 아닙니다. TraceLab의 트레이스는 저자들의 Claude Code·Codex 사용 약 4,300세션입니다.

**분석/의견.** 이득이 가는 자리는 "이미 NVIDIA 소비자 GPU가 있고, 전문가 풀만큼의 호스트 RAM을 댈 수 있으며, 코딩 에이전트를 자기 기계의 OpenAI·Anthropic 호환 포트에 붙이고 싶은 팀"입니다. 논문의 5090 데스크톱은 Ryzen 9 9950X3D에 DDR5 192GiB입니다. 284B 칸의 제약 자원은 32GB VRAM 스티커가 아니라 표의 147GB 라우팅 풀입니다. 32GiB DRAM 노트북이 35B를 39.3 tok/s로 돌린 조건은 NVFP4입니다. 같은 논문의 BF16 풀 64.4GB는 그 DRAM에 들어가지 않습니다.

손해가 생기는 읽기는 세 가지입니다. 제품 문장을 "8GB 카드 = 35B"로 쓰면 NVFP4와 32GiB LPDDR5가 빠집니다. "게이밍 PC = 284B"로 쓰면 192GiB 호스트와 MXFP4와, 본문의 22–25 tok/s가 찍힌 임대 서버가 빠집니다. 기본 설치가 논문의 hybrid라고 가정하면, 2026-11-04 문서의 MoE `auto`가 `offload`인 사실이 빠집니다. 품질로 API를 대체한다는 문장은 이 논문의 지표 밖에 있습니다. 5.1절의 지표는 디코드 tok/s와 TTFT이고, 코딩 실행은 기준 패치를 냈는지만 봅니다.

데스크톱 앱의 가격 0은 flashml.ai가 자기 페이지에 적은 값입니다. 모델 가중치의 라이선스와 다운로드 크기는 그 표시 밖에 있습니다. WSL에서 큰 풀을 핀하지 못하는 제한은 엔진 문서에 있으므로, Windows에서 GUI만 깔고 284B가 바로 선다고 읽히면 그 절이 빠집니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름 / ❌ 사실 아님

### @alex_verem 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| 버클리와 MIT 연구자가 만들었다 | ⚠️ | 저자 11명은 [v1](https://arxiv.org/abs/2608.16157)에 있습니다. 교신는 Shuo Yang `andy_yang@berkeley.edu`, Chenfeng Xu `xuchenfeng@utexas.edu`입니다. v1 소스 `paper.tex`의 소속 줄은 빈 `\affiliation[]{}`이고, PDF·HTML에 대학 이름이 찍히지 않습니다. 본문·소스에서 "MIT" 문자열은 찾지 못했습니다. 포스트가 적지 않은 도메인은 utexas.edu입니다. |
| 오픈소스이고 무료 엔진이다 | ✅ | main `628b88ff`의 [LICENSE](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/LICENSE)는 Apache-2.0입니다. 조항 2는 사용 허락을 no-charge, royalty-free로 적습니다. [flashml.ai](https://www.flashml.ai/) 소프트웨어 마크업의 가격은 0 USD입니다. 가중치 라이선스는 이 두 문서 밖입니다. |
| 거대한 모델을 자기 그래픽 카드에서 돌린다 | ⚠️ | 3절의 기준 사본은 CPU 상주 전문가 풀이고, GPU에 남는 것은 비전문가 가중치와 탄성 전문가 캐시입니다. 1절은 DSV4의 **활성** 발자국이 RTX 5090 32GB에 들어간다고 적습니다. 라우팅 풀 147GB는 그 카드 용량이 아닙니다. |
| 논문이 8GB 그래픽 카드 노트북에서 35B를 돌렸다 | ✅ | [5.3절](https://arxiv.org/html/2608.16157v1)과 표 1: RTX 4060 Laptop 8GB, PCIe 4.0 ×8, Core i9-13900H, LPDDR5 32GiB. 모델은 Qwen3.6-35B-A3B의 공식 NVFP4. W2 디코드 39.3 tok/s. 8GB는 VRAM 열입니다. |
| 논문이 게이밍 데스크톱에서 284B를 돌렸다 | ⚠️ | 초록과 서론은 "32GB 게이밍 데스크톱에서 284B를 대화형으로"라고 적습니다. 표 1의 5090 데스크톱은 RTX 5090 32GB, Ryzen 9 9950X3D, DDR5 192GiB입니다. 티저 그림 설명도 DSV4(284B, MXFP4)를 32GB 데스크톱에 둡니다. 본문에 찍힌 284B 디코드 **22–25 tok/s**는 그림 3의 RTX 5090(Qwen 6스레드, DSV4 8스레드)이고, 그 설정은 5.1절의 임대 듀얼 소켓 서버입니다. 그림 5가 데스크톱과 서버를 숫자로 비교하는 열은 Qwen3.6입니다. "대화형"의 tok/s 정의는 284B 문장에 없습니다. |
| 워크스테이션 카드 한 장에서 753B GLM-5.2를 돌렸다 | ⚠️ | 5.3절: GPU는 RTX PRO 6000 96GB **한 장**, 14.9 tok/s, 수학 워크로드(그림 5 설명). 체크포인트는 433GB이고 호스트 DRAM 열은 512GiB입니다. 카드 한 장이 433GB를 담는다는 문장은 논문에 없습니다. |
| Windows 또는 Linux 데스크톱 앱을 받아 DeepSeek, Qwen, GLM, Gemma, gpt-oss와 대화한다 | ⚠️ | README와 flashml.ai는 Windows·Linux 앱 다운로드를 적습니다. 2026-11-04 `docs/models.md`에 그 다섯 계열의 체크포인트가 있습니다. 논문 5절이 끝에서 끝까지 잰 모델은 Qwen3.6-35B-A3B, DeepSeek-V4-Flash, GLM-5.2 세 개입니다. 앱을 받아 바로 대화가 되는지는 이 글이 실행해 보지 않았습니다. |

"Altman은 컴퓨터의 RAM이 낭비라고 생각한다"는 포스트 작성자의 문장입니다. 이 글은 그 발언의 1차 인용을 확인하지 않아 판정하지 않습니다. 논문이 RAM으로 하는 일은 위에 적었습니다. 전문가 풀의 기준 사본을 호스트 메모리에 두는 것입니다.

**총평:** FreeToken이라는 엣지 MoE 엔진이 있고, Apache-2.0으로 공개돼 있으며, 8GB RTX 4060 노트북에서 Qwen3.6 NVFP4를 39.3 tok/s로 돌렸다는 뼈대는 논문과 맞습니다. 느슨한 곳은 소속(논문은 대학 이름을 비워 두었고 교신 메일은 berkeley.edu와 utexas.edu), "그래픽 카드"라는 말(풀은 호스트 RAM), 그리고 284B의 본문 처리량이 게이밍 데스크톱이 아니라 CPU를 묶은 임대 제온 서버의 RTX 5090에 적혀 있다는 점입니다.

## 참고 자료

- Yang 등, *FreeToken: Efficient Edge-Native MoE Serving with Bandwidth-Adaptive Execution*, arXiv:2608.16157 v1, 2026-08-17. [abs](https://arxiv.org/abs/2608.16157) · [HTML](https://arxiv.org/html/2608.16157v1) · [PDF](https://arxiv.org/pdf/2608.16157v1) · [소스](https://arxiv.org/src/2608.16157) (`paper.tex`의 빈 `\affiliation[]{}`)
- 코드와 문서, main `628b88ff`(2026-11-04 08:09 UTC) — [저장소](https://github.com/FlashML-org/FreeToken) · [README](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/README.md) · [LICENSE](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/LICENSE) · [install](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/install.md) · [quickstart](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/quickstart.md) · [models](https://github.com/FlashML-org/FreeToken/blob/628b88ff795b5ef2c7f9baff088f0e7720d8ebb4/docs/models.md)
- 데스크톱 앱 페이지 — [flashml.ai](https://www.flashml.ai/). 가격 0 USD는 그 페이지의 소프트웨어 마크업
- 논문이 베이스라인으로 인용한 엔진 — [llama.cpp](https://github.com/ggml-org/llama.cpp) · [KTransformers](https://github.com/kvcache-ai/ktransformers) · [Ollama](https://github.com/ollama/ollama) · MoE-Infinity [arXiv:2401.14361](https://arxiv.org/abs/2401.14361)
- 논문이 기판으로 인용하고 처리량 표에는 없는 서빙 — vLLM [arXiv:2309.06180](https://arxiv.org/abs/2309.06180) · SGLang [arXiv:2312.07104](https://arxiv.org/abs/2312.07104)
- Zhu 등, *TraceLab*, arXiv:2606.30560. Codex 정규화 33.9 tok/s와 순수 디코드 61.3 tok/s는 [HTML 5.4절](https://arxiv.org/html/2606.30560). FreeToken 서론의 "33 tok/s"는 이 논문을 인용한 반올림입니다.
- 논문이 체크포인트를 가리키는 주소 — [DeepSeek-V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) · [Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) · [Qwen3.6-35B-A3B-NVFP4](https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4) · [GLM-5.2-NVFP4](https://huggingface.co/nvidia/GLM-5.2-NVFP4)
- 원본 X 포스트: [@alex_verem](https://x.com/alex_verem/status/2117299706284118047) · [상태 주소](https://x.com/i/status/2117299706284118047)
