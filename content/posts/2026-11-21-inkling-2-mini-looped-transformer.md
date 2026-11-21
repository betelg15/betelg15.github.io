---
title: "가운데 12층을 세 번 도는 26.4B: Inkling 2 Mini 팩트 체크"
date: 2026-11-21
time: "21:28"
slug: inkling-2-mini-looped-transformer
tags: [AI, 로컬 LLM, 트랜스포머, 팩트체크, Inkling]
summary: "저장 파라미터는 26.4B이고 가운데 12층이 가중치를 공유한 채 3번 돈다. AA 페이지는 지수를 20으로, 회사 표는 20.1로 적는다. 체크포인트는 약 20GB이고 카드의 지원 메모리는 32GB 이상이다."
---

> 이 글은 [@thinkymachines의 포스트](https://x.com/thinkymachines/status/2123871643797995872)를 계기로, 발표 글과 모델 카드, Hugging Face 가중치, Artificial Analysis 페이지를 대조한 것입니다. 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2123871643797995872)(`code` 200)으로 읽었습니다. `created_at`은 `Fri Nov 20 20:10:34 +0000 2026`, **2026-11-21 05:10 KST**입니다. 계정은 thinkymachines, 표시 이름 Thinking Machines, 사용자 id는 `1891523745929732096`, 팔로워 197,111, `verification.type`은 `organization`입니다. 같은 응답의 스냅샷은 답글 469, 리포스트 1,268, 좋아요 13,441, 북마크 9,976, 인용 787, 조회 2,013,318이고 `is_note_tweet`은 false, 커뮤니티 노트는 `null`입니다. 본문은 Inkling 2 Small이 594B로 너무 컸고, Inkling 2 Mini는 26B 루프 트랜스포머라 노트북에서 돌며 AA Index 20.1이라는 문장입니다. 그 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-21 KST에 연 1차 자료입니다. [발표 글](https://thinkingmachines.ai/news/inkling-2-mini/)의 날짜는 Nov 20, 2026입니다. [모델 카드](https://thinkingmachines.ai/model-card/inkling-2-mini/)의 제공자는 Thinking Machines Lab, Inc.이고 라이선스 줄은 Apache 2.0입니다. 가중치 저장소 [thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)의 API `sha`는 `ed40e7da625f594fc9c4990f5f66be24873c22d7`, `createdAt`은 `2026-11-17T00:26:57.000Z`, `lastModified`는 `2026-11-20T22:55:20.000Z`, `private`는 false, `gated`는 false입니다. 같은 응답의 `downloads`는 7,944, `likes`는 1,210입니다. 이 글은 가중치를 받지 않았고, 서버를 띄우지 않았고, tok/s를 재지 않았습니다.

## 왜 중요한가

작은 오픈 웨이트 모델의 품질은 보통 파라미터를 키우거나, 생성 토큰을 늘려 추론 시간을 사는 쪽에서 나옵니다. Inkling 2 Mini가 내세우는 축은 그 둘과 다릅니다. 저장된 층은 24개인데, 가운데 12층을 토큰마다 세 번 다시 실행합니다. 가중치 파일은 한 번만 있고, 토큰 한 개의 순차 계산은 48번 층을 방문합니다.

개발자 입장에서 확인할 질문은 다음입니다.

- 26B가 저장 파라미터인가, 루프를 펼친 계산량인가.
- 노트북에서 돈다는 말이 어느 메모리와 어느 수치 형식인가.
- AA Index 20.1이 Artificial Analysis가 자기 페이지에 적은 수인가, 회사 표의 수인가.
- 594B인 Inkling 2 Small과 무엇이 같고 무엇이 잘렸는가.
- 가중치가 공개인지, 라이선스가 그 공개를 어디까지 여는지.

결론부터 말하면, 루프와 오픈 웨이트와 594B는 1차 자료와 맞습니다. 저장 파라미터의 정밀한 수는 26.4B이고, 노트북은 카드가 적은 32GB 이상이며, 20.1은 회사 표의 소수이고 Artificial Analysis 화면의 정수는 20입니다.

## 무엇이 공개되어 있나

발표 글은 2026-11-20에 Inkling 2 Mini를 열었습니다. 모델 카드의 모델 유형은 multimodal autoregressive looped transformer입니다. 텍스트와 이미지를 받고 텍스트를 내며, 문맥은 최대 1M 토큰입니다. 이미지는 변의 길이가 40px에서 4096px일 때 최적이라고 카드가 적습니다.

Hugging Face `config.json`의 `text_config.model_max_length`는 1,048,576입니다. `architectures`는 `Inkling2LoopForConditionalGeneration`, `model_type`은 `inkling2_loop`입니다. 같은 파일의 텍스트 디코더는 `hidden_size` 2304, `num_hidden_layers` 24, 쿼리 헤드 24, KV 헤드 8, `head_dim` 128입니다. 라우팅은 expert 128개 중 8개이고 `n_shared_experts`는 0, expert 중간 폭 `intermediate_size`는 1152입니다. `loop_config`는 `core_start` 6, `core_end` 18, `num_passes` 3, `gate_rank` 64, `is_varloop` false입니다. 0부터 세면 6번 층부터 17번 층까지가 루프이고, 그 개수는 12입니다.

비전 타워는 `num_hidden_layers` 23, `hidden_size` 1024, `native_patch_size` 20입니다. `quantization_config`의 `quant_algo`는 NVFP4입니다. `mtp_config`는 층 3개의 드래프트를 적고, `target_layer_ids`는 5, 23, 41, 48입니다. 48은 루프를 펼친 방문 수와 같은 정수입니다.

safetensors 메타데이터의 `parameters.total`은 **26,388,646,440**입니다. 회사 카드의 26.4B와 같은 반올림입니다. dtype별 원소 수는 F32 247,848, BF16 1,927,217,664, F8_E4M3 4,076,863,488, U8 20,384,317,440입니다. 이 글은 U8 원소를 논리 파라미터로 다시 풀지 않았습니다. 합이 카드의 26.4B와 맞으므로, 그 합을 저장 파라미터로 적습니다.

트리 API의 바이트는 이렇습니다.

| 파일 | 바이트 |
|---|---:|
| `model-00001-of-00001.safetensors` | 19,526,019,168 |
| `mtp.safetensors` | 635,801,416 |
| 두 파일의 합 | 20,161,820,584 |

저장소 `usedStorage`는 20,191,385,756바이트입니다. 10^9로 나누면 디코더 파일은 19.526GB, 두 가중치 파일의 합은 20.162GB입니다. 2^30으로 나누면 각각 18.185 GiB, 18.777 GiB입니다. 카드의 “about 20GB인 단일 체크포인트”는 이 자릿수와 같습니다. 드래프트 `mtp.safetensors`는 그 디코더 파일 밖에 따로 있습니다.

같은 날 연구용 가변 루프 체크포인트 `TML-d24-varloop-research`도 Hugging Face에 올라왔다고 발표 글이 적습니다. Inkling 2 Mini의 루프 횟수는 고정입니다. 가변 모델은 1회에서 5회 사이를 학습했고, 중심은 3회이며 1, 2, 4, 5회는 노출이 적다고 발표 글이 적습니다. 10회까지 성능이 크게 무너지지 않았다는 문장도 그 가변 모델에 대한 것입니다.

## 루프는 파라미터를 늘리지 않고 깊이만 늘린다

트랜스포머의 층이 모두 다른 가중치를 가지면, 순차 계산을 한 단계 늘릴 때마다 저장 파라미터도 늘어납니다. 루프 트랜스포머는 그 단계에 같은 가중치를 다시 씁니다. 디스크와 가중치 메모리는 저장된 층의 크기이고, 토큰 하나의 순차 연산 횟수는 그 층을 몇 번 방문했는지입니다.

Universal Transformer는 이 구조를 2018년 프리프린트로 제안했습니다. Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser의 [arXiv:1807.03819](https://arxiv.org/abs/1807.03819)는 위치마다 같은 self-attention과 전이 함수를 깊이 방향으로 반복합니다. 반복은 시퀀스의 다음 칸이 아니라, 같은 칸의 표현을 고치는 쪽입니다. 동적 정지는 자리마다 반복 횟수를 달리할 수 있고, 초록은 특정 가정 아래에서 Universal Transformer가 튜링 완전할 수 있다고 적습니다. Inkling 2 Mini의 발표 글이 인용하는 “Universal Transformers, Dehghani et al., 2018”은 이 논문입니다. Mini는 자리마다 멈추는 구조가 아니고, 가운데 블록만 고정된 3회를 돕니다.

2025년의 recurrent-depth 쪽은 그 반복을 언어 모델 규모로 다시 키운 선입니다. Geiping 등의 [arXiv:2502.05171](https://arxiv.org/abs/2502.05171) 초록은 3.5B 파라미터, 800B 토큰의 모델이 순환 블록을 반복해 테스트 때 깊이를 펼친다고 적습니다. 본문 3절의 큰 모델은 prelude, recurrent block, coda가 (2, 4, 2)층이고, 순환을 32번 하면 유효 깊이가 2+4×32+2=132입니다. 저장된 층은 8개입니다. 지식 회상보다 추론에서 반복의 이득이 크다는 관찰도 그 논문에 있습니다. Mini의 prelude, 가운데 루프, coda는 이 세 덩어리와 같은 자리입니다. 층 수와 반복 횟수와 규모는 다릅니다. Mini는 가운데를 3회로 고정하고, 반복 사이에 게이트된 메시지를 넣습니다.

### 이 모델의 블록

발표 글의 설계는 24층을 6층짜리 블록 네 개로 나눕니다. 첫 블록과 마지막 블록은 한 번, 가운데 두 블록은 세 번입니다. 방문 수는 6 + 12×3 + 6 = **48**이고, 저장된 층은 **24**입니다. Hugging Face 블로그도 같은 식을 6 + 3×12 + 6으로 적습니다.

`local_layer_ids`에는 20개 층이 있고, 빠져 있는 인덱스는 5, 11, 17, 23입니다. 여섯 층마다 마지막 층이 전역 어텐션이고 앞의 다섯 층이 지역 어텐션이라는 Hugging Face 블로그의 설명과 맞습니다. 지역 창 `sliding_window_size`는 1024입니다.

루프가 가운데인 이유는 발표 글이 실험으로 적습니다. 학습 스텝 2,000에서, 루프가 없는 기준 모델이 가운데 루프의 손실을 따라가려면 1.51–1.91배의 계산이 필요하고, 마지막 12층을 루프한 경우는 1.24–1.36배였습니다. 가운데 12층을 루프한 쪽이 마지막 12층을 루프한 쪽보다 28개 평가 중 27개에서 정확도 이득이 컸다고 적습니다. 발표 글은 첫 층과 마지막 층이 임베딩과 내부 표현을 번역하는 데 더 많은 자리를 쓰고, 가운데가 더 추상적인 계산을 가진다는 직관을 그 실험의 동기로 적습니다.

가중치를 공유하는 것과, 이전 패스의 출력을 그대로 다음 패스의 입력으로 넣는 것은 다릅니다. 발표 글은 매 패스가 prelude의 출력에서 시작하고, 두 번째와 세 번째 패스만 이전 패스의 메시지에 접근한다고 적습니다. 게이트는 학습 초기에 메시지를 전부 막고, 그래서 루프를 넣기 전의 비루프 모델과 같은 출발을 만든 뒤, 학습 중에 메시지 이득을 올립니다. 어텐션 잔차는 Kimi 팀 Guangyu Chen 등의 2026년 논문으로 발표 글이 인용합니다. 이 글은 그 논문의 번호를 열지 못했습니다.

vLLM의 2026-11-20 통합 글은 그 게이트를 이렇게 적습니다. 뒤 패스의 각 코어 서브층은 쿼리, 키, 값, MLP 입력마다 메시지를 읽고, 랭크 64 컨트롤러가 채널별로 섞습니다.

```text
h   = W_down · [rms(input), rms(message)]
out = (1 − tanh(W_forget · h)) · input + tanh(W_gain · h) · message
```

같은 글은 코어 12층과 입력 4종이라 이후 패스마다 토큰당 메시지 48개를 읽는다고 적습니다. KV 캐시와 conv state는 패스마다 따로라, 저장된 층은 24개여도 캐시는 48개라고 적습니다. 가중치를 공유해도 캐시 메모리는 방문 수를 따라갑니다. `config.json`의 `gate_rank` 64는 그 컨트롤러의 랭크와 같은 수입니다.

활성 파라미터는 출처마다 단위가 다릅니다.

| 출처 | 저장 | 한 토큰에 쓰는 가중치 | 루프를 포함한 활성 |
|---|---:|---:|---:|
| 모델 카드 본문 | 26.4B | 3.4B active. 추가 패스마다 약 1.0B | 3패스에서 5.4B effective |
| 발표 글 | 26.4B | 3.4B active | 5.4B weight activations per token |
| Hugging Face README 본문 | 26.4B | 3.4B | 5.4B |
| 같은 README의 비교표 | 26 | 표의 칸이 5/26으로 반올림 | 5로 표시 |
| Artificial Analysis 기사 | 26B | 텍스트 토큰당 고유 가중치 3.1B | 5.4B. 세 패스를 포함한다고 적음 |
| Artificial Analysis 모델 페이지 | 26B | 페이지는 고유 가중치를 다시 나누지 않음 | 5.4B active |
| vLLM 블로그 | 26B | 3.5B active | 세 패스라고 적고 5.4B는 적지 않음 |
| Hugging Face 블로그 첫 문단 | ~26B physical | 3B active per token | 세 번 반복 |

카드의 산수는 3.4에 추가 패스 두 번의 약 1.0을 더해 5.4입니다. Artificial Analysis의 3.1B와 카드의 3.4B를 잇는 식은 두 문서 모두에 없습니다. 이 글은 그 0.3B를 메우지 않습니다. 5.4B는 같은 가운데 가중치를 다시 읽은 계산량입니다.

가지치기는 저장량을 줄인 단계입니다. 발표 글은 학습 초기의 sparsity가 48, 즉 expert 384개 중 8개를 고르던 모델에서, 미드트레이닝의 한 시점에 가장 많이 쓰인 128개만 남겼다고 적습니다. 384의 3분의 1이 128이고, 지운 수는 256입니다. 그 뒤 더 큰 내부 Inkling에서 증류한 1T 토큰으로 남은 expert를 회복했고, Inkling 2 Small과 비슷한 데이터 믹스의 SFT 다음 RL이 2,000스텝, 2.2T 토큰이었다고 적습니다. 정렬은 Small과 같이 on-policy distillation입니다.

[2026-11-05 발표](https://thinkingmachines.ai/news/inkling-2-small/)와 [Small 모델 카드](https://thinkingmachines.ai/model-card/inkling-2-small/)는 Inkling 2 Small을 48층 디코더, expert 384개 중 8개, **594B total, 17B active**인 비루프 MoE로 적습니다. 가중치는 2026-11-12에 열렸고 라이선스 줄은 Apache 2.0입니다. NVFP4 체크포인트는 합산 VRAM 500GB 이상이 필요하고, 예시는 B300 두 장 또는 H200 네 장입니다. MXFP8 대안은 800GB 이상입니다. Mini는 그 레시피에서 expert를 줄이고 루프를 넣은 24층 모델이라고 발표 글이 적습니다. Hugging Face 블로그는 Small의 은닉 차원이 4,608이고 Mini가 2,304라고 적습니다.

루프가 늘리는 것은 추론이지 사실이 아니라고 발표 글이 적습니다. 가변 루프에서 GraphWalks BFS와 MRCR v2는 패스가 늘면 오르고, AA-Omniscience, SimpleQA Verified, SimpleVQA, WorldVQA는 패스에 거의 변하지 않았다고 합니다. 지식은 총 파라미터의 함수에 가깝다는 문장입니다. Mini의 AA-Omniscience v1.1 점수는 발표 표에서 **−8.6**입니다. 같은 표에서 Qwen3.8-27B는 −6.4, Nemotron 3.5 Super VL은 −2.9이고, 그 행은 −2.9를 최고로 표시합니다.

### 가중치 공유만 떼어 본 스케치

아래는 공식 모델이 아닙니다. 블록 네 개 중 가운데 둘이 가중치를 유지한 채 반복되고, 게이트가 0이면 메시지가 막혀 패스 수가 출력을 바꾸지 못하는지만 보는 축소 모형입니다. 실제 모델의 랭크 64 컨트롤러, MoE, 어텐션, 패스별 KV는 들어 있지 않습니다. 차원 16은 이 스케치의 폭입니다. `config.json`의 2304가 아닙니다.

```python
import torch
import torch.nn as nn

class Layer(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.lin = nn.Linear(d, d, bias=False)

    def forward(self, x):
        y = torch.nn.functional.rms_norm(x, (x.shape[-1],))
        return x + self.lin(y)

class MiniLoop(nn.Module):
    def __init__(self, d=16):
        super().__init__()
        self.blocks = nn.ModuleList([Layer(d) for _ in range(4)])
        self.gain = nn.Parameter(torch.zeros(()))

    def forward(self, x, passes=3):
        prelude = self.blocks[0](x)
        message = torch.zeros_like(prelude)
        h = prelude
        visits = 1
        for _ in range(passes):
            h = prelude + torch.tanh(self.gain) * message
            h = self.blocks[1](h)
            h = self.blocks[2](h)
            visits += 2
            message = h
        h = self.blocks[3](h)
        return h, visits + 1

torch.manual_seed(0)
m = MiniLoop()
x = torch.randn(1, 4, 16)
y1, v1 = m(x, passes=1)
y3, v3 = m(x, passes=3)
n = sum(p.numel() for p in m.parameters())
print("params", n)
print("unique_linears", sum(1 for mod in m.modules() if isinstance(mod, nn.Linear)))
print("visits_1", v1, "visits_3", v3)
print("gain0_max_abs_diff", (y3 - y1).abs().max().item())
with torch.no_grad():
    m.gain.fill_(1.5)
y1b, _ = m(x, passes=1)
y3b, _ = m(x, passes=3)
print("gain1.5_max_abs_diff", (y3b - y1b).abs().max().item())
```

이 환경에서 실행한 출력입니다. 가중치는 26B 체크포인트가 아닙니다.

```text
params 1025
unique_linears 4
visits_1 4 visits_3 8
gain0_max_abs_diff 0.0
gain1.5_max_abs_diff 6.426529884338379
```

`Linear`는 4개라 파라미터는 패스를 3으로 바꿔도 1,025개입니다. 4×16×16에 스칼라 게이트 하나가 더해진 수입니다. 방문은 1패스에서 4, 3패스에서 8입니다. 실제 모델이 블록마다 층을 6개 두면 저장된 24층과 방문 48층의 비가 이와 같습니다. 게이트가 0이면 3패스와 1패스의 출력 차이가 0입니다. 발표 글이 적은, 학습 초기에 메시지를 막아 비루프와 같은 출발을 만드는 장치와 같은 방향입니다. 게이트를 1.5로 열면 같은 가중치에서도 최대 절대차가 6.43까지 납니다. 추가 계산은 새 행렬이 아니라 이전 패스의 메시지를 읽을 때 생깁니다.

### 메모리는 가중치와 캐시가 따로다

발표 글은 대부분의 가중치를 NVFP4로 학습하고 배포하며, 마지막 네 층의 순방향은 MXFP8이라고 적습니다. 20층 NVFP4, 4층 MXFP8이라 학습 정밀도와 배포 정밀도가 같고 변환 손실이 없다고 적습니다. 그 수치의 총 메모리 풋프린트를 ~20GB로 적습니다. 카드는 같은 체크포인트를 로컬에서 돌릴 수 있는 기계로 NVIDIA DGX Spark 한 대, 통합 메모리 32GB 이상의 Apple silicon, VRAM 32GB 이상을 권하는 그 밖의 GPU를 적습니다.

캐시는 그 20GB 안에 자동으로 들어가지 않습니다. vLLM은 GB200 한 장, 텐서 병렬 1, 문맥 4K, 포워드만의 측정에서 가변 루프 체크포인트의 KV 용량을 1패스 352K 토큰, 3패스 175K 토큰으로 적습니다. 3패스에서 캐시를 공유하면 194K 토큰이고, conv state가 패스마다 남아 공유의 절약이 패스를 줄이는 것보다 작다고 적습니다. 이 칸은 Inkling 2 Mini의 고정 루프를 끈 측정이 아닙니다. vLLM은 `loop_num_passes`와 `loop_share_cache`를 고정 루프 체크포인트에서 거부한다고 적습니다. 카드의 1M 문맥과 32GB 지원선이 한 기계에서 동시에 성립하는지는 카드가 적지 않습니다.

양자화 경로는 기계마다 다릅니다. Hugging Face 블로그는 원 체크포인트를 MLX에서 nvfp4와 mxfp8 그대로 돌릴 수 있다고 적고, llama.cpp 쪽에는 GGUF `IQ4_NL`과 `Q8_0`을 `ggml-org` 저장소로 안내합니다. 카드는 Unsloth와 llama.cpp의 양자화 GGUF를 로컬 추론 경로로 적습니다. 모델 카드의 한계 절은 루프 모델의 로컬 런타임 지원이 새것이고 속도가 런타임과 하드웨어에 따라 달라진다고 적습니다. 추론 강도를 최소로 둬도 사고가 꺼지지 않으며, 가운데 층이 세 번 돌아 토큰당 계산이 활성 파라미터만으로 보는 것보다 크다고도 적습니다.

## 로컬에서 띄우는 명령

아래 명령은 각 문서에 있는 것만 옮겼습니다. 이 글은 실행하지 않았습니다. 가중치를 받으려면 디스크에 디코더 파일 19,526,019,168바이트와, 드래프트를 쓰면 `mtp.safetensors` 635,801,416바이트가 더 필요합니다.

Hugging Face 블로그의 transformers 예입니다. 고정 루프 체크포인트는 패스 수를 인자로 받지 않습니다.

```python
from transformers import AutoModelForMultimodalLM, AutoProcessor

model_id = "thinkingmachines/Inkling-2-Mini"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForMultimodalLM.from_pretrained(model_id)

messages = [{"role": "user", "content": [{"type": "text", "text": "Why is the sky blue?"}]}]
inputs = processor.apply_chat_template(
    messages, tokenize=True, add_generation_prompt=True,
    return_dict=True, return_tensors="pt",
).to(model.device)
input_len = inputs["input_ids"].shape[-1]
outputs = model.generate(**inputs, max_new_tokens=1024)
print(processor.decode(outputs[0][input_len:], skip_special_tokens=False))
```

같은 글은 `reasoning_effort`의 기본을 `high`(0.9)로 적고, `none` 0.0, `minimal` 0.1, `low` 0.2, `medium` 0.7, `xhigh`와 `max` 0.99를 적습니다. 채팅 템플릿은 그 값을 시스템 메시지로 넣습니다. 카드는 이 값을 0으로 둬도 루프 3회가 남아, 사고가 완전히 꺼지지 않는다고 적습니다.

Apple silicon에서 원 수치를 쓰는 MLX 예는 같은 블로그의 명령입니다. 프롬프트 안의 특수 토큰도 그 문서에 있는 그대로입니다.

```bash
mlx_lm generate --model thinkingmachines/Inkling-2-Mini --image image.jpg --prompt "Describe this image.<|end_message|><|message_user|><|content_image|><|unused_200054|>" -m 1000
```

llama.cpp 계열의 4비트 서빙 예도 그 블로그에 있습니다. 8비트는 접미사를 `:Q8_0`으로 바꿉니다.

```bash
llama serve -hf ggml-org/Inkling-2-Mini-GGUF:IQ4_NL
```

vLLM 블로그의 이미지는 `vllm/vllm-openai:inkling-2-mini`이고, 대상 GPU는 Blackwell, Hopper, DGX Spark입니다.

```bash
docker run --gpus all --ipc=host -p 8000:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:inkling-2-mini thinkingmachines/Inkling-2-Mini \
  --reasoning-parser inkling --tool-call-parser inkling --enable-auto-tool-choice \
  --speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"probabilistic"}'
```

SGLang 명령은 Hugging Face 블로그가 `SM103`에서 돌리라고 적은 예입니다.

```bash
export MODEL="thinkingmachines/Inkling-2-Mini"
python -m sglang.launch_server \
  --model-path $MODEL \
  --served-model-name inkling \
  --attention-backend fa4 --bf16-gemm-backend torch --dtype bfloat16 \
  --tp 1 --page-size 128 --grammar-backend xgrammar \
  --host 0.0.0.0 --port 30000
```

모델 카드는 Apple silicon의 런타임으로 Ollama와 Exo Labs를 적습니다. 그 카드에는 `ollama run` 문자열이 없고, 이 글도 저장소 이름을 추측해 적지 않습니다. Tinker 추론과 파인튜닝, Tinker Playground는 발표 글이 안내하는 호스팅 경로입니다.

## 회사가 잰 점수와 그 조건

발표 표의 점수는 Thinking Machines가 적은 값입니다. 하네스가 칸마다 다릅니다. 비교 열은 Gemma 4 31B, Muse Glimmer, Qwen3.8-27B, Nemotron 3.5 Super VL입니다. 모델 카드는 여기에 Dory 1.0 4B, SenseNova-Loop-9B, Beam 1.0을 더합니다. 아래는 발표 표의 일부입니다.

| | Inkling 2 Mini | Gemma 4 31B | Muse Glimmer | Qwen3.8-27B | Nemotron 3.5 Super VL |
|---|---:|---:|---:|---:|---:|
| 활성/총 파라미터 (B) | 5.4/26.4 | 30.7/30.7 | 30.0/30.0 | 27.0/27.0 | 12.0/124.5 |
| AA Index (v5.0) | 20.1 | 4.4 | 6.3 | 20.1 | 13.6 |
| Vals Index (v2.2) | 46.5% | – | – | – | 29.8% |
| DeepSWE v1.1, mini-swe-agent v2.4.6 | 48.2% | 0.3% | 4.4% | 42.2% | 24.7% |
| Terminal Bench v2.1, pi v0.83.0 | 71.6% | 43.4% | 51.7% | 73.0% | 60.7% |
| SWE-bench Pro v2 Hard, mini-swe-agent v2.4.6 | 77.9% | 14.2% | 44.3% | 73.8% | 44.1% |
| HLE-Diamond | 15.2% | 7.2% | 9.1% | 15.3% | 8.8% |
| AA-Omniscience v1.1 | −8.6 | −48.5 | −32.2 | −6.4 | −2.9 |

100B 미만 오픈 웨이트를 이끈다는 발표 문장은 DeepSWE v1.1 48.2%와 Vals Index v2.2 46.5%에 붙어 있습니다. 같은 표에서 Terminal Bench v2.1은 Qwen3.8-27B가 73.0%로 더 높고, HLE-Diamond도 Qwen이 15.3%로 0.1포인트 높습니다. 모델 카드에서 Beam 1.0의 AA Index는 17.7, Terminal Bench v2.1은 80.1%입니다. Beam의 파라미터 칸은 23.0/501.0이라 100B 미만이 아닙니다.

한계 절은 MultiChallenge 50.0%, ComplexConstraints v1.1 33.4%로 Qwen3.8-27B보다 낮다고 적습니다. 그런데 같은 발표 표의 ComplexConstraints는 Mini 33.4%, Qwen 30.1%, Muse Glimmer 35.6%입니다. 33.4는 30.1보다 큽니다. MultiChallenge의 Qwen 점수는 그 표에 없습니다. 한계 문장과 표가 ComplexConstraints에서 어긋납니다. CritPt v2와 HLE-Diamond에서 더 큰 모델에 뒤진다는 문장은 한계 절에 그대로 있습니다.

모니터 가능성은 발표 글의 별도 실험입니다. 가변 루프의 CoT 없는 시간 지평은 Think Fast 부분집합에서 1패스 16초, 3패스 37초입니다. 다섯 패스 모두 맞힌 GPQA Diamond 문항에서 추론 토큰 평균은 1패스 3,703, 3패스 1,731, 5패스 1,661이고, 영어 사전 단어 비율은 94.6%, 94.5%, 94.4%로 적혀 있습니다. 750–1,250토큰 구간에서 CoT 지시를 따른 비율은 Mini와 3패스 가변 모델이 최대 0.1%라고 적습니다. 루프가 늘어도 이 평가로는 통제력이 올라갔다고 말할 수 없게 숫자가 바닥에 있습니다. 이 실험은 가변 모델의 RL이 3패스에서만 이뤄졌다고 발표 글이 한계로 적습니다.

## 비즈니스 인사이트

숫자와 회사 사실은 인용한 페이지의 것이고, 그 사실을 제품 선택으로 읽는 문장은 **분석/의견**입니다.

Artificial Analysis의 [2026-11-20 기사](https://artificialanalysis.ai/articles/inkling-2-mini)는 Mini를 Intelligence Index **20**의 오픈 웨이트 루프 트랜스포머로 적습니다. 총 26B, 활성 5.4B이고 그 5.4B는 루프 세 패스를 포함하며, 텍스트 토큰당 고유 가중치는 3.1B라고 적습니다. Apache 2.0, 텍스트와 이미지 입력, 1M 문맥, MacBook 또는 DGX Spark에서 돌릴 수 있다는 문장도 그 기사에 있습니다. 같은 기사는 Qwen3.8 27B (xhigh), Nanbeige4.3-33B와 Intelligence Index가 같고 활성 파라미터는 약 5배, 약 6배 적다고 적습니다. 출력 토큰은 과제당 약 152K로, Qwen3.8 27B의 약 110K보다 약 38% 많고 Nanbeige4.3-33B의 약 158K와 가깝습니다. 활성 파라미터 곱하기 토큰이라는 자기들의 계산 대리 지표에서는 Qwen보다 약 2.8배, Nanbeige보다 약 5배 계산이 적다고 적습니다. 과제당 비용과 시간은 **$0.59, 9.0분**이고 Qwen3.8 27B는 **$3.53, 38.2분**입니다. 단가는 Thinking Machines의 1차 가격, 입력 $0.15, 출력 $0.50, 캐시 히트 $0.015를 100만 토큰당 적용했다고 적습니다. GPT-6 Luna (max)는 지수 28에 과제당 $0.15로 같은 기사에 있습니다.

[모델 페이지](https://artificialanalysis.ai/models/inkling-2-mini)는 지수를 20, 속도를 280 tok/s, 첫 답 토큰까지 9.72초, 과제당 9.0분, 과제당 $0.59, 출력 단가 $0.50, 입력 단가 $0.15로 적습니다. 블렌디드 가격 $0.0905는 캐시 히트:입력:출력을 7:2:1로 섞은 값이라고 FAQ가 설명합니다. Intelligence Index 평가의 출력 토큰은 161M이고, 같은 크기 오픈 웨이트의 중앙값은 85.7M이라고 적습니다. 280 tok/s와 9.72초는 그 페이지가 Thinking Machines API 기준으로 적은 수입니다. 지수 방법론 문장은 v5.0.1이 AA-Briefcase v1.1, AutomationBench-AA, Terminal-Bench 4.0, FrontierCode-AA 2.0, AA-Omniscience v1.1, GDP.pdf, HLE-Diamond, CritPt v2 Hard, Terminal-Bench-Science 0.1의 아홉 개이고, 지식 작업, 코딩, 과학, 일반의 네 갈래가 각 25%라고 적습니다.

Small의 AA 점수는 [제공자 페이지](https://artificialanalysis.ai/providers/thinking-machines)에서 31이고 Mini는 20입니다. 회사의 2026-11-05 발표도 Small의 AA 점수를 31로 적습니다. 회사 표의 Mini 20.1과 AA 화면의 20을 나란히 두면, Small과의 차이는 10.9 또는 11입니다. 하드웨어 차이는 카드끼리 비교하면 NVFP4 기준 합산 500GB와, Mini의 약 20GB 파일에 32GB 메모리 지원선입니다.

**(분석/의견)** 이 릴리스가 표에서 사는 것은 Qwen3.8-27B보다 높은 지수가 아닙니다. 회사 표에서 둘 다 20.1이고, AA 기사는 지수가 같다고 적습니다. 사는 것은 그 지수에 활성 파라미터가 훨씬 작고, Apache 2.0 가중치가 약 20GB라는 점입니다. 대가는 AA가 적은 출력 토큰 약 38%와, 회사 표에서 Mini의 사실성 점수 −8.6이 Qwen의 −6.4보다 낮다는 점입니다. 닫힌 모델과의 비교로 AA 기사가 적어 둔 GPT-6 Luna (max)는 지수 28에 과제당 $0.15라, 호스팅 가격만 보면 Mini의 $0.59보다 싸고 점수는 높습니다. 그 비교는 가중치를 자기 기계에 두는 조건이 없습니다.

**(분석/의견)** 바로 닿는 쪽은 통합 메모리 32GB 이상의 Apple silicon, 또는 VRAM 32GB 이상의 GPU가 있고, 에이전트에게 파일 쓰기를 맡길 때 샌드박스를 감수하는 개발자입니다. 카드는 도구를 쓸 때 확인 없이 파일을 지우거나 덮어쓸 수 있다고 적습니다. 16GB 노트북은 카드의 지원 목록에 없습니다. 발표 글의 비행기 모드 데모는 MacBook Pro, M5 Pro, 48GB로 라벨이 붙어 있습니다. 이 글은 그 영상을 다시 재지 않았습니다. Inkling 2 Small의 지수 31과 사실 회상이 필요한 작업은 Mini의 설계 목표에서 빠져 있습니다. 발표 글이 루프로 오르지 않는다고 적은 것이 그 회상입니다.

**(분석/의견)** 채택 비용은 토큰 단가 옆에 수치 형식과 런타임이 붙습니다. 원 체크포인트는 NVFP4와 MXFP8이라, Hugging Face 블로그는 MLX에서 그 형식을 그대로 돌린다고 하고 SGLang 예는 SM103을 전제로 적습니다. 그 형식이 없는 기계는 같은 블로그가 안내하는 GGUF `IQ4_NL`과 `Q8_0`이 문서에 있는 다른 경로입니다. 카드는 로컬 속도가 런타임마다 다르다고 미리 적습니다. AA의 $0.59는 Thinking Machines API로 지수 과제를 돌린 비용이지, 노트북의 전기요금이 아닙니다. 이 글은 전기요금과 기기 가격을 열지 않았습니다.

**(분석/의견)** 라이선스 필드는 Apache 2.0이고 AA도 상업적 사용이 가능하다고 적습니다. 그 옆에 [Model Acceptable Use Policy](https://thinkingmachines.ai/model-acceptable-use-policy/)가 있고, 최종 수정일은 2026-07-15입니다. AUP는 모델 자료를 받는 사람에게 그 정책을 적용한다고 적고, 불법 행위, 아동 안전, 무기와 악성 코드, 권리와 의무에 영향을 주는 자동화 결정, 허가 없는 전문직 조언의 자동화를 금지 목록에 넣습니다. 최종 사용자에게 제품을 내면 중대한 한계를 알리고, 법이 요구하거나 상호작용의 이해에 중요하면 AI라는 사실을 알리라고 적습니다. Apache 2.0 파일 하나와 AUP 준수 의무는 카드가 둘 다 걸어 둔 조건입니다.

발표 글은 Stanford Hazy Research Lab과 Scaling Intelligence Lab이 사전 접근으로 DGX Spark 128GB에서 intelligence per joule 0.703을 얻었고, Qwen3.6-35B-A3B 0.430, Gemma-4-26B-A4B 0.159, Qwen3.5-27B 0.036보다 높았다고 적습니다. Mini는 MXFP8에 low effort, 비교 모델은 NVFP4 또는 INT4라는 조건이 같은 문단에 있습니다. 인용된 논문 이름은 Saad-Falcon and Narayan et al., 2025입니다. 이 글은 그 논문 PDF에서 0.703을 확인하지 못했습니다. 0.703은 회사 블로그가 전하는 사전 실험의 수입니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 수는 있으나 반올림이거나, 출처끼리 다르거나, 조건이 빠짐 / ❌ 1차 자료와 어긋남

원본은 [@thinkymachines, 2026-11-21 05:10 KST](https://x.com/thinkymachines/status/2123871643797995872)입니다. 벤치마크는 각 문서가 적은 값이고, 이 글은 다시 재지 않았습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 26B 파라미터다 | ⚠️ | 모델 카드와 발표 글은 **26.4B** total, 3.4B active, 루프를 넣은 유효 활성 5.4B다. Hugging Face safetensors `parameters.total`은 26,388,646,440이다. 트윗의 26B와 AA 페이지의 26B는 그 수의 반올림이다. 활성은 카드 3.4B, AA 기사 3.1B 고유, vLLM 블로그 3.5B로 갈린다. |
| 루프 트랜스포머다 | ✅ | 가운데 12층이 공유 가중치로 3회 실행되고, 층 방문은 48, 저장 층은 24다. `config.json`의 `loop_config`는 `core_start` 6, `core_end` 18, `num_passes` 3이다. `model_type`은 `inkling2_loop`다. |
| 노트북에서 돌 만큼 작다 | ⚠️ | 발표 글은 노트북에서 돈다고 하고, 풋프린트 ~20GB와 MacBook Pro (M5 Pro, 48GB) 오프라인 데모를 적는다. 카드의 지원선은 Apple silicon 32GB 이상, 그 외 GPU는 VRAM 32GB 이상 권장, DGX Spark 한 대다. 디코더 파일은 19,526,019,168바이트다. 16GB 기계는 지원 목록에 없다. |
| AA Index 20.1이다 | ⚠️ | 회사 표는 AA Index (v5.0) **20.1**이고, 같은 칸의 Qwen3.8-27B도 20.1이다. Artificial Analysis 모델 페이지와 2026-11-20 기사는 Intelligence Index v5.0.1에서 **20**으로 표시한다. 트윗의 20.1은 회사 표와 같고, AA가 화면에 적은 정수와는 다르다. |
| Inkling 2 Small은 594B다 | ✅ | 2026-11-05 발표와 Small 모델 카드가 594B total, 17B active라고 적는다. 48층, expert 384개 중 8개인 비루프 MoE다. NVFP4는 합산 VRAM 500GB 이상이다. AA 제공자 페이지의 지수는 31이다. |
| 오픈 웨이트이고 라이선스가 있다 | ✅ | 저장소는 `private: false`, `gated: false`이고 카드 라이선스와 Hugging Face `license`는 apache-2.0이다. 라이선스 링크는 Apache License 2.0이다. 카드가 함께 거는 Model AUP는 2026-07-15 개정이고, 사용 제한을 따로 둔다. |

**총평:** Inkling 2 Mini는 2026-11-20에 열린 루프 MoE이고, 저장 파라미터 26,388,646,440개 가운데 층 6–17을 세 번 돌린다. 가중치는 공개이고 라이선스 필드는 Apache 2.0이며, 디코더 파일은 19.5GB대라 카드가 32GB 이상 메모리를 지원선으로 적는다. 트윗의 26B와 20.1은 각각 26.4B의 반올림과 회사 표의 소수이고, Artificial Analysis가 자기 페이지에 적어 둔 지수는 20이다. Inkling 2 Small의 594B는 Small 발표와 카드에 있는 수이고, 그 모델은 루프가 아니다.

## 참고 자료

- 발표 — [Introducing Inkling 2 Mini](https://thinkingmachines.ai/news/inkling-2-mini/), Nov 20, 2026. 26.4B / 3.4B / 5.4B, 가운데 12층 3회, ~20GB, DeepSWE 48.2%, Vals 46.5%, AA Index (v5.0) 20.1
- 모델 카드 — [Inkling 2 Mini](https://thinkingmachines.ai/model-card/inkling-2-mini/). Apache 2.0, 1M 문맥, Apple silicon 32GB 이상, VRAM 32GB 이상 권장
- 가중치 — [thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) `ed40e7da625f594fc9c4990f5f66be24873c22d7`. API의 `parameters.total` 26,388,646,440, 디코더 파일 19,526,019,168바이트, `mtp.safetensors` 635,801,416바이트. [config.json](https://huggingface.co/thinkingmachines/Inkling-2-Mini/blob/ed40e7da625f594fc9c4990f5f66be24873c22d7/config.json)
- 가변 루프 — 발표 글이 공개했다고 적은 [TML-d24-varloop-research](https://huggingface.co/thinkingmachines/TML-d24-varloop-research)
- Artificial Analysis — [모델 페이지](https://artificialanalysis.ai/models/inkling-2-mini) (지수 20, 5.4B active, 280 tok/s, 과제당 $0.59) · [2026-11-20 기사](https://artificialanalysis.ai/articles/inkling-2-mini) · [Thinking Machines 제공자 페이지](https://artificialanalysis.ai/providers/thinking-machines) (Small 31, Mini 20)
- Inkling 2 Small — [발표, Nov 5, 2026](https://thinkingmachines.ai/news/inkling-2-small/) · [모델 카드](https://thinkingmachines.ai/model-card/inkling-2-small/). 594B / 17B, NVFP4 합산 VRAM 500GB 이상. 가중치 공개는 발표 글의 Nov 12, 2026 갱신
- 실행 문서 — [Hugging Face 블로그](https://huggingface.co/blog/inkling2mini) (transformers, `llama serve`, MLX, SGLang과 SM103) · [vLLM, 2026-11-20](https://vllm.ai/blog/2026-11-20-inkling2-mini)
- 앞선 루프 구조 — Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, *Universal Transformers*, [arXiv:1807.03819](https://arxiv.org/abs/1807.03819) · Geiping et al., *Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach*, [arXiv:2502.05171](https://arxiv.org/abs/2502.05171). 초록의 3.5B와 800B 토큰, 본문의 (2, 4, 2)와 32회에서 유효 깊이 132
- 사용 정책 — [Model Acceptable Use Policy](https://thinkingmachines.ai/model-acceptable-use-policy/), Last updated July 15, 2026. 라이선스 본문 링크는 [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- 원본 X 포스트 — [@thinkymachines, 2123871643797995872](https://x.com/thinkymachines/status/2123871643797995872)
