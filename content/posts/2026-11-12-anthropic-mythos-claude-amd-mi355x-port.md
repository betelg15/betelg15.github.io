---
title: "3일은 프롬프트 처리다: Mythos Preview와 MI355X"
date: 2026-11-12
time: "21:27"
slug: anthropic-mythos-claude-amd-mi355x-port
tags: [Anthropic, AMD, NVIDIA, 추론, 팩트체크]
summary: "로드쇼 자막은 Mythos가 AMD에서 사흘 만에 커널의 거의 100%를 옮겼다고 말한다. 같은 화면의 각주는 그 시간을, Claude Mythos Preview가 MI355X에서 모델 하나의 프롬프트 처리를 쓸 만한 성능으로 올린 시간으로 적는다."
---

> 이 글은 제가 X에서 북마크해 둔 [@USAnt_IDEA의 포스트](https://x.com/USAnt_IDEA/status/2120543974108922028)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2120543974108922028](https://x.com/i/status/2120543974108922028)입니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`(`developer.billing.write` 없음)으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2120543974108922028)(`code` 200)으로 읽었습니다. `created_at`은 `Wed Nov 11 15:47:35 +0000 2026`, **2026-11-12 00:47 KST**입니다. `screen_name`은 `USAnt_IDEA`, 표시 이름은 USAnt 미국개미, 사용자 id는 `400056034`, 팔로워 28,213, `verification.type`은 `individual`, `lang`은 `ko`입니다. 같은 응답의 스냅샷은 답글 4, 리포스트 6, 좋아요 31, 북마크 13, 인용 2, 조회 3,247입니다. 커뮤니티 노트는 `null`입니다. 본문은 한국어로, Mythos가 사람 손을 거의 거치지 않고 3일 만에 AMD GPU에 Claude를 포팅해 CUDA 해자가 무너졌다는 축제, MI355X 커널 거의 100%를 주말에 끝냈다는 말, ROCm 최적화, TDP·TCO·토큰 단가, 2027년 최대 2GW MI450 Helios와 50억 달러 지분, 2030년까지의 EPYC 예약을 적습니다. 카드는 [MikeLongTerm의 영상 포스트](https://x.com/MikeLongTerm/status/2120327641538416789)입니다. 그 포스트의 fxtwitter `created_at`은 `Wed Nov 11 01:27:58 +0000 2026`, **2026-11-11 10:27 KST**이고, 영문 본문은 “CUDA MOAT is gone”, AMD가 TDP·TCO·100만 토큰당 가격에서 NVIDIA의 거의 절반이라는 말, AMD CPU 위 에이전트와 2030년까지의 CPU 예약을 적습니다. 영상 길이는 204초입니다. 그 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-12 21:20 KST 전후에 연 1차 자료입니다. 로드쇼 영상은 [ipo.anthropic.com](https://ipo.anthropic.com/)의 Roadshow video이고, 페이지 스크립트는 미국 영상 주소를 `/video/us/roadshow/master.m3u8`, 자막을 `/video/us/roadshow/captions.vtt`, “Approach to compute” 장 시작을 1,125초로 적습니다. 이 글은 그 [자막 파일](https://ipo.anthropic.com/video/us/roadshow/captions.vtt)을 읽었습니다. 같은 HLS의 720p 구간에서 장 시작 카드는 “Tom Brown / Chief Compute Officer & Co-Founder”이고, 20:42 부근 프레임의 각주를 이 글이 OCR로 읽었습니다. 증권신고서는 [Amendment No. 2 to Form S-1](https://www.sec.gov/Archives/edgar/data/2130357/000162828026072484/anthropicpbc-sx1ax2.htm)(접수 2026-11-10, accession `0001628280-26-072484`)입니다. AMD 발표는 [2026-07-22 IR 보도자료](https://ir.amd.com/news-events/press-releases/detail/1292/amd-and-anthropic-announce-strategic-partnership-to-deploy-up-to-2-gigawatts-of-amd-instinct-mi450-series-gpus)입니다. [Simon Willison의 2026-11-11 글](https://simonwillison.net/2026/Nov/11/anthropic-ipo-roadshow/)은 MacWhisper로 받은 2차 전사입니다. 그의 AMD 문장은 공식 자막과 같습니다. 이 글은 커널 diff를 받지 못했고, 포팅을 재실행하지 않았습니다.

## 왜 중요한가

가속기를 바꾸는 비용의 큰 덩어리는 칩을 사는 돈이 아니라, 그 칩에서 모델의 행렬 곱과 어텐션이 맞게 돌아가게 만드는 소프트웨어입니다. 앤트로픽은 상장 로드쇼에서 그 시간을 투자자에게 숫자로 보여 줬습니다. 자막은 “사흘”과 “커널의 거의 100%”를 말하고, 같은 시점의 화면 각주는 그 사흘이 무엇을 재는지 적습니다.

그 각주가 적는 일은 모델 하나의 **프롬프트 처리**를 AMD Instinct MI355X 위에서 쓸 만한 성능으로 올리는 시간입니다. 프롬프트 처리는 추론에서 입력을 읽는 구간입니다. 엔지니어가 보통 prefill이라고 부르는 단계와 같은 자리이고, 화면의 단어는 prompt processing입니다. 디코드(답을 한 토큰씩 뽑는 구간), 학습, 전 모델의 상용 서빙은 그 문장에 없습니다.

S-1/A 2호 개정은 같은 주제를 더 넓은 말로 적습니다. 새 칩을 프로덕션에 들이는 일은 예전에는 여러 달에 걸친 엔지니어링이었고, 이제는 Claude를 써서 더 빨리 들일 수 있으며, 그 속도는 이미 만들어 둔 오케스트레이션 층에도 기대고 있다고 적습니다. 일수, MI355X, 커널 비율, Mythos라는 이름은 그 문단에 없습니다.

북마크가 붙인 “CUDA 해자가 무너졌다”는 로드쇼 자막에 없는 문장입니다. 자막 파일에서 `CUDA`와 `NVIDIA`는 검색되지 않습니다. `kernel`은 20:47의 “almost 100% of the kernels” 한 곳입니다. 19:40 전후 슬라이드에는 NVIDIA GPU가 네 가족 중 하나로 남아 있고, 신고서는 NVIDIA와의 설계 협력과 Class N 사모에 NVIDIA가 약 100억 달러를 넣는다고 적습니다.

## 기술 설명

### 프롬프트 처리와 디코드

트랜스포머 추론은 한 번의 요청 안에서도 두 구간으로 나뉩니다.

**프롬프트 처리(prefill).** 사용자가 넣은 토큰 전체를 한 포워드에 가깝게 읽습니다. 어텐션은 그 길이끼리 만나고, 키·값 캐시가 이 구간에서 채워집니다. 토큰이 길면 산술량이 크고, 행렬 곱과 어텐션 커널의 처리량이 시간을 가릅니다.

**디코드.** 캐시가 있는 상태에서 새 토큰을 하나씩 뽑습니다. 새 쿼리는 하나이고, 읽는 캐시는 이미 쌓인 전체입니다. 산술보다 메모리 대역과 캐시 읽기가 시간을 가리는 쪽이 됩니다. 서빙 스택은 보통 이 둘의 배치, 메모리, 커널을 따로 둡니다.

로드쇼 각주가 잰 것은 앞 구간입니다. “쓸 만한 성능(a useful level of performance)”의 처리량, 지연, 배치 크기, 비교 대상 칩은 화면에 없습니다.

아래는 그 두 구간의 **설명용 스케치**입니다. 앤트로픽 코드가 아니고, 측정값도 아닙니다.

```python
# 설명용 스케치. 가중치와 커널은 없다.
def prefill(forward, prompt_tokens):
    # 입력 길이를 한 번에 읽으며 KV 캐시를 채운다.
    logits, kv = forward(prompt_tokens, kv=None)
    return kv

def decode_one(forward, token, kv):
    # 새 토큰 하나만 기존 캐시와 만난다.
    logits, kv = forward(token, kv=kv)
    return logits, kv
```

각주가 말하는 bring-up은 위 `prefill`이 MI355X에서 한 모델에 대해 돌아가게 만든 쪽에 가깝습니다. `decode_one`이 같은 성능으로 올라갔는지는 각주가 말하지 않습니다.

### CUDA 스택을 ROCm/HIP으로 옮길 때 손이 가는 곳

칩이 바뀌면 모델 가중치를 복사하는 일로 끝이 아닙니다. NVIDIA에서 도는 추론은 보통 CUDA 커널, cuBLAS 같은 수학 라이브러리, 멀티 GPU면 NCCL, 그리고 그 결과를 기준 구현과 맞추는 수치 검증으로 묶여 있습니다. AMD의 대응 스택은 ROCm이고, 커널 언어의 인접 층은 HIP입니다. 호출 모양이 비슷해도 컴파일러, 라이브러리, 통신, 반올림이 따로입니다.

손이 가는 자리는 대략 네 겹입니다.

1. **커널.** RMSNorm, 로터리, 소프트맥스, GEMM, 어텐션은 칩의 스레드 묶음과 공유 메모리에 맞춰 다시 짭니다. CUDA의 warp는 32스레드이고, AMD GPU에서 흔히 쓰는 wavefront는 64스레드입니다. 타일 크기와 리덕션이 그 폭에 붙습니다.
2. **어텐션.** 프리필 어텐션은 긴 점수 행렬을 SRAM에 나눠 담는 구현이라, 블록 크기와 로드 폭이 칩마다 다릅니다. 디코드 어텐션은 캐시를 읽는 경로라 커널이 또 다릅니다.
3. **집단 통신.** 텐서 병렬과 파이프라인 병렬은 GPU 사이 합산·교환이 필요합니다. NVIDIA 쪽 라이브러리 이름은 NCCL, AMD 쪽은 RCCL입니다. 알고리즘이 같아도 토폴로지와 버퍼가 스택에 묶입니다.
4. **수치 검증.** bf16·fp8의 누적 순서와 원자적 덧셈이 달라지면 로짓이 기준과 벌어집니다. 포팅의 끝은 컴파일이 아니라, 허용 오차 안에서 맞는지 보는 일입니다.

아래 HIP 커널도 **설명용 스케치**입니다. 원소마다 상수를 곱할 뿐이고, 어텐션도 통신도 아닙니다. 보여 주려는 것은 런치 문법이 CUDA와 닮아 보인다는 점입니다. 닮은 문법과, 위 네 겹이 끝난 상태는 다른 일입니다.

```cpp
// 설명용 스케치. Anthropic이나 AMD가 공개한 커널이 아니다.
#include <hip/hip_runtime.h>

__global__ void scale(const float* x, float* y, int n, float a) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) y[i] = x[i] * a;
}

void launch(const float* x, float* y, int n) {
    int threads = 256;
    int blocks = (n + threads - 1) / threads;
    hipLaunchKernelGGL(scale, dim3(blocks), dim3(threads), 0, 0,
                       x, y, n, 1.0f);
}
```

로드쇼는 이 네 겹 중 어디까지가 “커널의 거의 100%”에 들어갔는지, 사람이 남긴 리뷰가 몇 시간이었는지 공개하지 않았습니다. 자막의 문장은 “basically no human intervention”과 “ported or wrote almost 100% of the kernels”입니다.

### 화면이 실제로 보여주는 차트

“Approach to compute” 장은 1,125초(18:45)에 시작합니다. 직후 화면에 Tom Brown, Chief Compute Officer & Co-Founder가 나옵니다. 20:30–20:50 자막은 이렇게 이어집니다.

> As an example, this year we started working with AMD GPUs for the first time. In the past, bringing on a new chip platform took dozens of engineers months of work. This time we had Mythos try it out. It got Claude running on AMD in just three days with basically no human intervention. Claude ported or wrote almost 100% of the kernels.

같은 시각의 차트 축은 “Time to onboard new silicon”입니다. 왼쪽 점은 “~3 days / with Mythos”, 오른쪽 점은 “~6-12 months / with traditional approach”이고, 세로축 위쪽에는 “~100%”가 있습니다. 세로축에 kernels라는 단어는 이 프레임의 글자에 없습니다. “거의 100%의 커널”은 자막의 발화입니다.

각주는 두 문장입니다. 공식 HLS 프레임에서 읽은 글자입니다.

> The ~3 day timeline reflects the approximate time for Claude Mythos Preview to bring up prompt processing for one Anthropic model on AMD MI355X GPUs at a useful level of performance. The ~6-12-month estimate is based on the Company's historical experience bringing up new accelerators using traditional engineering approaches.

6–12개월은 업계 평균으로 적혀 있지 않습니다. 회사의 과거 경험입니다. 사흘은 근사치이고, 대상은 Claude Mythos Preview, 모델 하나, MI355X, 프롬프트 처리, 쓸 만한 성능입니다.

## 주장된 것과 주장되지 않은 것

자막이 말하는 범위와 각주가 말하는 범위가 다릅니다. 신고서는 둘 다보다 넓고, 숫자는 뺍니다.

| 자료 | 적힌 것 |
|---|---|
| 자막 20:32–20:50 | 올해 AMD GPU를 처음 쓰기 시작했다. 예전에는 엔지니어 수십 명이 몇 달. Mythos가 시도. AMD에서 사흘, 사람 개입은 기본적으로 없음. Claude가 커널의 거의 100%를 포팅하거나 작성. |
| 차트 각주 | 사흘은 Claude Mythos Preview가 앤트로픽 모델 **하나**의 **프롬프트 처리**를 **MI355X**에서 쓸 만한 성능으로 올린 대략의 시간. 6–12개월은 회사의 과거 가속기 bring-up 경험. |
| S-1/A, Multi-Chip | 네 칩 패밀리(AWS Trainium, Google TPU, NVIDIA GPU, AMD GPU)에서 학습하고 서빙한다. 새 칩을 들이는 시간이 예전의 일부로 줄었다. |
| S-1/A, 인프라 절 | 예전에는 여러 달의 엔지니어링이 필요했다. Claude를 쓰면 엔지니어링 팀이 더 빨리 들인다. 속도는 이미 만든 오케스트레이션 층에도 의존한다. |

신고서의 문장은 “our engineering teams”입니다. 자막의 문장은 “basically no human intervention”입니다. 둘 다 회사의 말이고, 사람·시간을 외부에 공개한 작업 로그는 이 글이 찾지 못했습니다. 오케스트레이션 층이 이미 있었다는 신고서 문장도, 사흘이 빈 저장소에서 시작했다는 뜻으로 읽히지 않습니다.

차트는 디코드를 말하지 않습니다. 학습을 말하지 않습니다. 어느 모델인지도 “one Anthropic model”까지입니다. 처리량, 전력, 토큰당 비용, NVIDIA 대비 속도는 그 각주에 없습니다.

Mythos라는 이름도 자료마다 폭이 다릅니다. 자막의 AMD 문장은 “Mythos”입니다. 각주는 “Claude Mythos Preview”입니다. 같은 영상 24:41 자막은 Mozilla 사례에서 “Mythos Preview”를 쓰고, 271개의 보안 버그를 찾고 고쳤다고 말합니다. 신고서는 2026년 4월에 프론티어 모델 Mythos를 Project Glasswing의 제한된 리서치 프리뷰로 냈고, 사이버 보안 용도로 일부 조직에 열었으며, 출시 때 일반 공개하지 않았다고 적습니다. 이 글은 그 프리뷰와 각주의 Claude Mythos Preview가 같은 체크포인트라고 단정하지 않습니다. 신고서가 둘을 한 가중치로 묶는 문장은 이 글이 읽은 범위에 없습니다.

## 비즈니스 인사이트

숫자와 회사 사실은 방금 연 서류에 붙입니다. 그 다음의 해석에는 **(분석)**을 붙입니다.

### 네 칩과, 아직 NVIDIA 쪽에 있는 약정

신고서 “Our Approach to Compute”는 Claude를 AWS Trainium, Google TPU, NVIDIA GPU, AMD GPU에서 네이티브로 학습하고 서빙한다고 적습니다. 전용 오케스트레이션 층으로 가격과 성능에 맞춰 일을 옮기고, 한 공급자에 대한 의존을 줄인다고 적습니다. 자막 20:06–20:15는 공급이 부족한 시장에서 제공자와 무관하게 가격 대비 성능을 보고, 칩마다 학습에 나은 것과 추론에 나은 것이 있다고 말합니다.

같은 신고서의 인프라 약정은 칩 가족별로 규모가 다릅니다. 계약 모양이 같아서 아래 금액을 한 시장 점유율로 더할 수는 없습니다. 최소 지출, 상한, “전량을 사면 예상되는 지출”이 섞여 있습니다.

| 상대 | 신고서가 적은 규모 | 기간·조건의 요지 |
|---|---|---|
| Google (CSP 호스팅) | 최소 약 1,213억 달러 | 2026-04–2033-07. 미달 시 true-up |
| Google (추가 TPU) | 추정 1,250억–1,500억 달러 | 인도 예상 2028–2031. 약정 표 밖 |
| Amazon | 최소 1,100억 달러 | 2026-05–2036-04. 미달 시 true-up |
| SpaceXAI | 최대 1,205억 달러 | 2029년까지. NVIDIA GPU. 초기 해지 불가 기간 뒤 90일 통지 |
| Microsoft | 최소 472억, 최대 492억 달러 | 2026-11–2033-06. 사용량과 무관 |
| Nscale | 최대 약 446억 달러 | 2033년까지. NVIDIA GPU. 인도·검수 후 비용 발생 |
| Lambda | 약 413억 달러 | 2034년까지. NVIDIA GPU. 2026-08 분(약 349억 달러)은 시설 임대 미확보로 현재 어느 쪽이든 해지 가능. 신고서 날짜까지 해지 통지는 없고, 회사는 해지할 뜻이 현재 없다고 적음 |
| AMD Helios | 고정 달러 약정은 없음. 초기 용량을 전부 조달하면 지출이 200억 달러를 넘을 것으로 예상. 추가 용량은 그 초기 약정 규모까지 | 2027년 초기 트랜치. 회사가 AMD의 치유되지 않은 중대한 위반 외에는 취소 불가 |

AMD 줄의 2기가와트는 이 문단에 없습니다. 그 숫자는 AMD의 2026-07-22 보도자료에 있습니다. 최대 2기가와트의 Instinct MI450 시리즈를 Helios 랙에 두고, 첫 1기가와트는 2027년 상반기부터 배치하며, GPU는 MI455X이고, 이 배치는 앤트로픽이 이미 쓰는 MI355X 위에 쌓인다고 적습니다. 같은 글은 Claude로 Instinct 워크로드와 ROCm 개발을 가속하고, AMD가 엔지니어링과 제품 조직에 Claude를 넓게 쓰며, AMD가 최대 50억 달러를 출자하겠다고 적습니다. Tom Brown은 그 보도자료에서 “diversified range of hardware”에 워크로드를 맞춘다고 인용됩니다.

신고서의 AMD 출자 문장과 사모 문장은 그 50억을 이렇게 나눕니다. Hardware Supply Agreement의 Class N 매입 약속은 최대 50억 달러이고, 인도·배치 마일스톤 뒤에 나눠 인출합니다. 동시 사모에서 AMD가 내는 약 25억 달러는 그 약속의 일부를 달러 대 달러로 채웁니다. 사모 종료 뒤 남는 인출 한도는 최대 25억 달러이고, 첫 마일스톤은 2027년으로 예상한다고 적습니다. 가정 공모가는 범위 70–78달러의 중간인 74달러입니다. 그 가격에서 동시 사모 합계는 260억 달러이고, Google 약 100억, NVIDIA 약 100억, AMD 약 25억, Broadcom 약 10억, Micron 약 10억, Microsoft 약 10억, TSMC 약 5억입니다.

**(분석)** 사흘 차트는 AMD에 소프트웨어 이야기의 재료가 됩니다. MI355X를 이미 쓰고 있고, 2027년 Helios 물량이 신고서와 AMD 발표에 각각 적혀 있습니다. 같은 서류의 지출 표에서 NVIDIA GPU를 명시한 약정(SpaceXAI, Nscale, Lambda)과 Microsoft·Google·Amazon 약정은 AMD 초기 용량의 “200억 달러 초과” 예상보다 큽니다. 칩을 바꿀 수 있다는 말과, 약정 달러가 이미 어디에 가 있는지는 같이 읽어야 합니다. NVIDIA가 이 표에서 사라진 상태는 아닙니다. 사모에서 NVIDIA의 금액은 AMD의 네 배입니다.

가속기 **출하 대수**의 점유율은 이 두 회사의 분기 매출로 계산하지 않습니다. 분기가 한 달 어긋나고, 부문 정의가 다릅니다. NVIDIA의 2027 회계연도 2분기(2026-07-26 종료) Data Center 매출은 890억 달러이고, 전년 동기 대비 117%, 전 분기 대비 18%입니다. 같은 8-K의 시장 플랫폼 표는 그 890억을 Hyperscale, AI Clouds·Industrial·Enterprise, Edge Computing으로 나눕니다. GPU만의 매출이라는 문장은 그 표에 없습니다. 회사 GAAP 매출총이익률은 75.0%입니다. AMD의 2026년 2분기(2026-06-27 종료) Data Center 부문 순매출은 67억 1,800만 달러이고, 전년 대비 107%입니다. 10-Q는 이 부문에 AI 가속기, 서버 CPU, GPU, APU, DPU, AI NIC, FPGA가 들어간다고 적고, 보도자료는 EPYC과 Instinct 수요가 이끌었다고 적습니다. 회사 GAAP 매출총이익률은 54%입니다.

**(분석)** 이 간격이 북마크가 말한 “해자”의 배경입니다. 다만 75%와 54%는 회사 전체 매출총이익률이라, CUDA의 가격이나 가속기 점유율 그 자체는 아닙니다. PC용 애드인 보드 점유율도 이 데이터센터 숫자와 다른 시장입니다. 이 글은 그 점유율을 가져오지 않았습니다.

### 누가 이득을 보고, 개발자에게 무엇이 남는가

**(분석)** 이득이 문장으로 닫히는 쪽은 앤트로픽과 AMD입니다. 앤트로픽은 네 공급자 사이에서 가격과 성능을 고르겠다고 투자자에게 말했고, 그 근거의 하나로 칩을 들이는 시간이 줄었다고 말합니다. AMD는 MI355X의 기존 사용, Helios 물량, ROCm에 Claude를 쓰겠다는 다년 협업, 최대 50억 달러 출자를 2026년 7월에 이미 발표했습니다. 사흘 차트는 그 협업이 시작된 뒤의 투자자 설명입니다.

손해가 문장으로 닫히는 쪽은 “CUDA가 끝났으니 NVIDIA 매출이 빠진다”는 읽기입니다. 신고서는 Grace Blackwell과 Vera Rubin을 NVIDIA 용량의 예로 적고, NVIDIA가 사모에 참여한다고 적습니다. 자막은 CUDA를 공격하지 않습니다. 공격의 문장은 X 포스트에 있습니다.

개발자에게 공개된 산출물은 이 글이 찾은 범위에 없습니다. 커널 저장소, 벤치마크, ROCm 버전, 어느 모델인지는 각주 밖에 없습니다. PyTorch나 vLLM을 ROCm으로 돌리는 일과, 앤트로픽 내부에서 프롬프트 처리 커널을 사흘 동안 올렸다는 말은 다른 층입니다. AMD 보도자료가 공개한 소프트웨어 약속은 “다년에 걸쳐 Claude로 ROCm 개발을 가속한다”는 쪽입니다. 그 문장은 사흘 차트가 ROCm 전체를 끝냈다는 뜻이 아닙니다.

**(분석)** 연구소가 자기 오케스트레이션과 자기 워크로드로 커널을 옮기는 비용이 줄면, 그 연구소의 칩 협상력은 커집니다. 그 일이 곧 일반 개발자의 CUDA 코드가 하루아침에 HIP에서 같은 성능이 된다는 뜻은 아닙니다. 수치 검증과 통신 스택은 여전히 워크로드마다 남습니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름 / ❌ 사실 아님

### 북마크와 임베드된 영상의 주장

| 주장 | 판정 | 근거 |
|---|---|---|
| Mythos가 사람 손을 거의 거치지 않고 약 3일 만에 AMD에서 Claude를 돌리게 했다 | ⚠️ | [공식 자막](https://ipo.anthropic.com/video/us/roadshow/captions.vtt) 20:40–20:50이 그 문장입니다. 화자는 장 시작 카드의 Tom Brown입니다. 각주는 모델 하나의 프롬프트 처리, MI355X, 쓸 만한 성능으로 시간을 정의합니다. 사람·시간의 작업 로그는 없습니다. S-1은 “엔지니어링 팀”과 기존 오케스트레이션 층을 같이 적습니다. |
| 그 3일이 MI355X에서 모델 하나의 프롬프트 처리(prefill에 해당하는 구간)다 | ✅ | 공식 HLS 프레임 각주. “Claude Mythos Preview”, “prompt processing”, “one Anthropic model”, “AMD MI355X GPUs”, “a useful level of performance”. 화면의 단어는 prefill이 아니고 prompt processing입니다. |
| 예전에는 6–12개월, 또는 반년에서 1년이 걸렸다 | ⚠️ | 차트의 “~6-12 months with traditional approach”와 각주의 회사 과거 경험이 6–12개월입니다. 자막은 “dozens of engineers months of work”까지입니다. S-1은 “many months”이고 6–12라는 숫자는 없습니다. 외부 벤치마크가 아닙니다. |
| 커널의 거의 100%를 Mythos가 포팅하거나 작성했다 | ⚠️ | 자막 20:47–20:50의 발화입니다. 차트 세로축의 “~100%”에 kernels라는 라벨은 이 글이 읽은 프레임에 없습니다. 커널 목록과 diff는 공개되지 않았습니다. |
| 주말 동안 끝냈다 | ❌ | 자막과 각주는 “just three days”, “~3 day”입니다. 요일은 없습니다. |
| CUDA 해자가 무너졌다 | ❌ | 자막에서 `CUDA`와 `NVIDIA`는 검색되지 않습니다. 19:40 전후 공식 영상 프레임의 슬라이드는 AWS Trainium, Google TPU, NVIDIA GPU, AMD GPU를 한 풀로 보여 줍니다. S-1은 NVIDIA GPU 용량과 사모 약 100억 달러를 적습니다. “CUDA MOAT is gone”은 [MikeLongTerm 포스트](https://x.com/MikeLongTerm/status/2120327641538416789)의 문장입니다. |
| AI가 ROCm 최적화까지 사흘에 끝냈다 | ❌ | 각주는 프롬프트 처리의 bring-up입니다. ROCm을 끝냈다는 문장은 없습니다. [AMD 2026-07-22 발표](https://ir.amd.com/news-events/press-releases/detail/1292/amd-and-anthropic-announce-strategic-partnership-to-deploy-up-to-2-gigawatts-of-amd-instinct-mi450-series-gpus)는 Claude로 ROCm 개발을 가속하는 **다년** 협업을 시작한다고 적습니다. |
| TDP·TCO·토큰당 가격에서 AMD가 NVIDIA의 거의 절반이다 | ❌ | 그 비교는 X 포스트에 있습니다. 로드쇼 각주와 이 글이 읽은 S-1 문단에는 없습니다. 자막 21:08은 Anthropic Direct(칩을 임대하고 전용 데이터센터에서 돌리는 방식)가 컴퓨트 총소유비용을 낮추는 데 도움이 된다고 말합니다. 그 문장은 AMD와 NVIDIA의 토큰 단가 비율이 아닙니다. |
| 2027년부터 최대 2GW의 MI450 Helios를 계약했다 | ✅ | AMD 보도자료의 문장입니다. 첫 1기가와트는 2027년 상반기, GPU는 MI455X, 기존 MI355X 사용 위에 쌓인다고 적습니다. S-1은 같은 7월 계약에 대해 2027년 초기 트랜치, 고정 달러 약정은 없음, 초기 용량을 전부 사면 지출이 200억 달러를 넘을 것으로 예상, 추가 용량은 그 규모까지라고 적고, “2 gigawatts”라는 단어는 이 글이 읽은 AMD 약정 문단에 없습니다. |
| AMD의 지분 투자가 최대 50억 달러다 | ✅ | AMD 보도자료와 S-1이 같이 적습니다. S-1은 동시 사모의 약 25억 달러가 그 약속의 일부를 채우고, 이후 마일스톤에 남은 인출 한도가 최대 25억 달러라고 나눕니다. |
| 에이전트 때문에 EPYC을 2030년까지 예약했다 | ❌ | 이 글이 읽은 자막에 EPYC과 2030년 CPU 예약은 없습니다. EPYC은 AMD 보도자료에서 Helios에 함께 넣는 “Venice” CPU로 나옵니다. 그 보도자료에 2030년까지의 예약 문장은 없습니다. “booking CPUs into 2030”은 MikeLongTerm 포스트의 문장입니다. |
| S-1/A(2026-11-10)가 사흘과 MI355X를 적었다 | ❌ | [Amendment No. 2](https://www.sec.gov/Archives/edgar/data/2130357/000162828026072484/anthropicpbc-sx1ax2.htm)는 2026-11-10 접수입니다. 네 칩, “a fraction of the time this once required”, “many months”, “By leveraging Claude, our engineering teams”는 있습니다. 사흘, MI355X, 커널 비율, prompt processing은 이 글이 그 파일에서 찾지 못했습니다. MI355X의 기존 사용은 AMD 보도자료에 있습니다. |

**총평:** 사흘과 “커널 거의 100%”와 “사람 개입 거의 없음”은 앤트로픽 로드쇼 자막에 있습니다. 그 사흘의 정의는 같은 화면 각주에 있고, 모델 하나의 MI355X 프롬프트 처리입니다. CUDA 해자가 끝났다는 문장은 회사 자료가 아니라 X 포스트에 있습니다.

## 참고 자료

- 계기 포스트 — [@USAnt_IDEA, 2026-11-11 15:47 UTC](https://x.com/USAnt_IDEA/status/2120543974108922028) · [i/status](https://x.com/i/status/2120543974108922028) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2120543974108922028)
- 임베드된 영상 포스트 — [@MikeLongTerm, 2026-11-11 01:27 UTC](https://x.com/MikeLongTerm/status/2120327641538416789) · [fxtwitter](https://api.fxtwitter.com/status/2120327641538416789). 영상 204초. 이 글은 공식 HLS로 각주를 다시 읽었습니다.
- 로드쇼 — [ipo.anthropic.com](https://ipo.anthropic.com/) · 자막 [captions.vtt](https://ipo.anthropic.com/video/us/roadshow/captions.vtt) · 스트림 [master.m3u8](https://ipo.anthropic.com/video/us/roadshow/master.m3u8). “Approach to compute”는 페이지 스크립트 기준 1,125초. 자막 20:32–20:50이 AMD 문장입니다.
- 로드쇼 시작 공지, 2026-11-10 — [Anthropic launches roadshow](https://www.anthropic.com/news/roadshow-launch). Class A 8억 2,500만 주, 공모가 예상 70–78달러, Nasdaq 심볼 ANT.
- 신고서 — [S-1/A Amendment No. 2, 2026-11-10](https://www.sec.gov/Archives/edgar/data/2130357/000162828026072484/anthropicpbc-sx1ax2.htm) · [접수 목록](https://www.sec.gov/Archives/edgar/data/2130357/000162828026072484/0001628280-26-072484-index.html) (`0001628280-26-072484`, accepted 2026-11-10 06:29:24)
- AMD, 2026-07-22 — [최대 2GW MI450 파트너십](https://ir.amd.com/news-events/press-releases/detail/1292/amd-and-anthropic-announce-strategic-partnership-to-deploy-up-to-2-gigawatts-of-amd-instinct-mi450-series-gpus)
- Simon Willison, 2026-11-11 15:11 — [Anthropic's IPO roadshow video](https://simonwillison.net/2026/Nov/11/anthropic-ipo-roadshow/). MacWhisper 전사. AMD 문장은 공식 자막과 같습니다. 각주의 MI355X·프롬프트 처리 문장은 그의 인용에 없고, 이 글은 영상 프레임에서 읽었습니다.
- NVIDIA 실적 — [FY2027 Q2 보도자료, 8-K exhibit, 분기 종료 2026-07-26](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm). Data Center 매출 890억 달러, GAAP 매출총이익률 75.0%.
- AMD 실적 — [2026년 2분기 보도자료](https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results) · 분기 종료 2026-06-27 Data Center 순매출 67억 1,800만 달러는 [10-Q](https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000123/0000002488-26-000123.pdf)의 부문 표. 회사 GAAP 매출총이익률 54%는 보도자료.
