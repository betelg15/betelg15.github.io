---
title: "LoRA 몇 시간이면 디퓨전 언어모델이 되나? BYOD 논문 팩트 체크"
date: 2026-11-02
time: "20:14"
slug: byod-ar-to-diffusion-lm
tags: [디퓨전LM, LoRA, 논문리뷰, 팩트체크, LLM]
summary: "BYOD(arXiv:2610.41574)는 Gemma 2 9B, Llama 3.1 8B, Qwen2.5 7B, Ministral 8B를 랭크 1024 Q/V LoRA만으로 마스크드 디퓨전 생성기로 바꿉니다. 같은 하니스에서 BYOD-Gemma 평균 50.6%는 LLaDA 51.9% 옆이지만, 부모 AR보다 낮고 추론 가속은 재지 않았습니다."
---

> 이 글은 북마크해 둔 [@AIcia_Solid의 포스트](https://x.com/AIcia_Solid/status/2117127118312341596)(2026-11-02 14:30 KST)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117127118312341596](https://x.com/i/status/2117127118312341596)입니다. 이 환경의 X API는 계정 등록 오류로 본문을 주지 않아, 공개 상태 페이지의 글을 읽었습니다. 그 글의 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 [arXiv:2610.41574](https://arxiv.org/abs/2610.41574) v1(2026-10-30 제출)의 [HTML](https://arxiv.org/html/2610.41574), [공식 구현](https://github.com/RuurdKuiper/BYOD), 그리고 글에서 숫자를 가져온 DiffuLLaMA·Dream·LLaDA·Mercury·Gemini Diffusion 1차 자료를 직접 본 결과입니다. 동료 심사 전 프리프린트입니다.

## 왜 이 논문이 중요한가

포스트는 두 문장입니다.

> LoRA で AR な LLM を diffusion な DLM にする研究らしい。 なんじゃそら！（笑）

우리말로 옮기면 "LoRA로 자기회귀(AR) LLM을 디퓨전 언어모델(DLM)로 만드는 연구인 모양이네. 이게 뭐야!"입니다. 웃음은 주장이 아니고, 앞 문장이 검증할 내용입니다.

Ruurd J. A. Kuiper(위트레흐트 대학 메디컬 센터, Julius Center)와 Robert A. Bagheri(위트레흐트 대학교)가 2026년 10월 30일 arXiv에 올린 [*BYOD: Build Your Own DLM*](https://arxiv.org/abs/2610.41574)가 그 논문입니다. 이미 나와 있는 지시 튜닝 디코더를, 베이스 가중치는 얼린 채, 마스크드 디퓨전 생성기로 바꾸는 레시피입니다. 대상은 Gemma 2 9B IT, Llama 3.1 8B Instruct, Qwen2.5 7B Instruct, Ministral 8B Instruct 2410입니다.

개발자에게 닿는 지점은 "디퓨전이 더 빠르다"가 아닙니다. 논문 7절이 효율이라고 부른 것은 **변환 학습**입니다. 한 모델의 25,000 업데이트가 Colab의 RTX PRO 6000 한 장에서 3.1–4.0시간입니다. 추론을 벽시계로 재지는 않았고, 각 디노이징 스텝은 답 블록 전체를 봅니다.

## AR 디코딩과 디퓨전 디코딩

자기회귀 모델은 왼쪽에서 오른쪽으로 한 토큰씩 뽑습니다. 위치 i의 어텐션은 j ≤ i만 보고, 손실은 다음 토큰입니다. 출력 길이 L이면 네트워크 평가도 L번입니다.

마스크드 디퓨전 언어모델은 순서를 그렇게 고정하지 않습니다. 학습 때는 일부 토큰을 `[MASK]`로 지우고, 양방향 문맥으로 그 자리를 복원합니다. 생성 때는 답이 전부 마스크인 상태에서 시작해, 한 번의 평가로 여러 자리를 예측한 뒤 자신 있는 자리만 남기고 나머지를 다시 가립니다. 네트워크 평가 횟수(NFE)는 출력 길이와 따로 고를 수 있습니다. 대신 NFE가 짧다고 벽시계가 짧아진다는 보장은 없습니다. 스텝마다 보는 시퀀스가 답 전체이기 때문입니다.

이 계보에서 논문이 직접 비교하는 외부 기준은 LLaDA 8B Instruct입니다. Nie 등(2025)은 LLaDA 8B를 **처음부터** 2.3조 토큰, H800 13만 GPU-시간으로 사전학습했다고 적습니다. AR 체크포인트를 이어 받아 디퓨전으로 바꾼 선행 작업도 있습니다. Gong 등(ICLR 2025)의 DiffuLLaMA는 LLaMA2 7B를 풀 파라미터로 계속 학습하며, 본문에 혼합 코퍼스에서 **65B 토큰을 샘플**했다고 적고 같은 절에서 **60B 토큰** 학습 곡선도 보여 줍니다. Ye 등의 Dream 7B는 Qwen2.5-7B와 같은 설정·그 가중치로 초기화하고, 학습 코퍼스를 **5,800억 토큰**으로 적습니다. BYOD는 이 규모를 다시 하지 않고, 같은 개입을 네 가족에 그대로 얹어 봅니다.

## 마스킹 목적함수

학습은 지시문(프롬프트)을 깨끗한 상태로 두고, **답과 EOS 패딩만** 가립니다. 시간 t는 균등분포 U[0.001, 1]에서 뽑고, 답·패딩의 각 위치를 확률 t로 독립적으로 마스크합니다. 손실은 가려진 위치에서만, 그리고 **한 칸 민 다음 토큰이 아니라 그 자리의 원래 토큰**에 대해 계산합니다. 1/t는 마스크 비율에 대한 보정입니다.

논문 식 (1)(2)를 그대로 옮기면 이렇습니다. 저장소 코드의 복사가 아니라, 본문 목적함수의 의사코드입니다.

```python
# Kuiper & Bagheri, arXiv:2610.41574, 식 (1)(2).
# R은 답(A) 또는 EOS 패딩(P). |R|은 그 영역의 길이.

def region_loss(logp, clean, masked, region, t):
    idx = [i for i in masked if i in region]
    return -sum(logp[i][clean[i]] for i in idx) / (t * len(region))

def byod_loss(frozen, lora, prompt, answer, pad):
    t = uniform(1e-3, 1.0)
    masked = [i for i in answer + pad if random() < t]
    noisy = apply_mask(answer + pad, masked)          # 프롬프트는 그대로
    logp = bidirectional(frozen, lora, prompt, noisy) # 같은 위치를 예측
    return 0.9 * region_loss(logp, answer, masked, answer, t) \
         + 0.1 * region_loss(logp, pad, masked, pad, t)
```

첫 종료 EOS는 진짜 답 토큰이고, 그 뒤의 EOS는 패딩입니다. 프롬프트와 채팅 템플릿 토큰은 손실 밖에 있습니다. 학습 마스크는 매번 다시 뽑고, 검증 마스크는 예제 인덱스와 시드로 고정합니다.

## 변환: 어텐션 마스크와 LoRA

변환은 가중치를 갈아 끼우는 일이 두 군데입니다. 학습되는 쪽은 LoRA뿐이고, 마스크는 구조 변경입니다.

1. 모든 층의 **인과 마스크를 양방향 마스크로** 바꿉니다. 프롬프트, 답, EOS 패딩의 모든 위치가 모든 위치를 봅니다.
2. 셀프 어텐션의 **query와 value**에만 LoRA를 붙입니다. 랭크 r = 1024, 스케일 α = 1024, 드롭아웃 0. 임베딩, LM 헤드, 바이어스, 노름, 그 외 백본은 동결입니다.
3. AR이 쓰던 **라벨 시프트를 제거**합니다. 사전학습된 출력 헤드는 그대로 두고, 망가진 시퀀스에서 같은 위치의 깨끗한 토큰을 맞춥니다.
4. 어휘는 늘리지 않습니다. Gemma, Llama, Qwen은 토크나이저에 이미 있는 한 토큰짜리 `MASK` 문자열을 재사용합니다. Ministral도 새 토큰을 추가하지 않고 기존 한 토큰 문자열을 씁니다. HTML 본문에서 그 문자열 글리프는 빠져 있어, 여기서 글자를 단정하지 않습니다.

합친 뒤의 투영은 W_merged = W + (α/r)BA 입니다. α = r이라 스케일 계수는 1입니다. 어댑터를 접어 넣으면 파라미터 수가 부모 크기로 돌아가고, 양방향 어텐션은 남습니다. Appendix B에서 BYOD-Llama-25k를 접기 전후 9과제 비가중 평균은 48.7%와 48.3%입니다. 저자들은 이를 대수적 재매개변수화로 보고, 과제 단위 차이를 병합 탓으로 돌리기에는 정밀도가 부족하다고 적습니다.

같은 랭크를 네 가족에 고정했기 때문에 학습 파라미터 비율은 모델마다 다릅니다.

| 변환 모델 | 부모 | 전체 파라미터 | 학습 파라미터 | 비율 | 25,000 업데이트 |
|---|---|---:|---:|---:|---:|
| BYOD-Gemma | Gemma 2 9B IT | 10.732B | 572.5M | 5.33% | 4.0시간 |
| BYOD-Qwen | Qwen2.5 7B Instruct | 7.939B | 323.0M | 4.07% | 3.1시간 |
| BYOD-Ministral | Ministral 8B Instruct 2410 | 8.511B | 490.7M | 5.77% | 3.4시간 |
| BYOD-Llama | Llama 3.1 8B Instruct | 8.466B | 436.2M | 5.15% | 3.2시간 |

초록의 "최종 파라미터의 4.1–5.8%"는 이 표의 4.07–5.77%를 반올림한 값입니다. 하드웨어는 분산 없이 Google Colab의 NVIDIA RTX PRO 6000 한 장입니다. 공식 README는 paper 모드에 96GB급 메모리가 필요하다고 적습니다. 무료 티어의 작은 GPU로 읽히면 안 됩니다.

## 데이터와 학습 비용

1백만 예제 혼합을 만들고, 기본 변환은 그중 **앞에서 40만 예제**를 봅니다. 배치 16에 업데이트 25,000번이면 40만과 맞습니다. 최대 길이 256이므로 처리 토큰의 상한은 400,000 × 256 = **1억 240만(102.4M)** 입니다. 초록의 "at most 102.4M tokens"는 이 상한입니다. 동적 패딩이 있어 실제 토큰 수는 그보다 작을 수 있습니다.

혼합 비율은 일반 지시 45%, 객관식 추론 18%, 수학 18%, 코드 19%입니다. 세부 소스는 Clean-Instruct-3M, Tülu 3, Alpaca-GPT4, Alpaca, MMLU, HellaSwag, ARC-Easy, Orca-Math, GSM8K, OpenCoder, MBPP이고, 해당되면 학습 분할만 씁니다. 정규화한 프롬프트를 중복 제거하고, 보류한 벤치마크 프롬프트와 정확히 같은 예제는 빼며, 256토큰에 들어가는 예제만 남깁니다. 네 모델은 같은 셔플을 각자 토크나이저와 채팅 템플릿으로 다시 토큰화합니다. Llama 5만 업데이트 실험만 80만 예제입니다.

최적화는 AdamW, 최고 학습률 1e-5, 코사인, 웜업 100, weight decay 0.01, gradient clip 0.5입니다. 논문의 원 학습은 BF16 마스터 웨이트에 Transformer Engine HYBRID FP8입니다. 공개된 `configs/paper.yaml`의 `precision`은 `bf16`이고, README는 이 버전이 FP8 없이 FP16/BF16으로 학습한다고 적습니다. 논문 재현성 문장도 새 학습이 보고된 체크포인트나 점수와 비트 단위로 같다고 보장하지 않습니다.

Table 1의 돈과 CO₂e는 **저자 청구서도, 측정한 배출량도 아닙니다.** Appendix A의 표준 시나리오입니다. BYOD 행은 Llama 변환의 관측 3.2 GPU-시간을, 2026년 9월 AWS 미국 동부 온디맨드 g7e.2xlarge 시간당 3.36달러(논문이 인용한 Price List)에 대입해 **11달러**, GPU 정격 0.60kW × PUE 1.09 × IEA 2024 전력 원단위 0.445 kg/kWh로 **0.9kg CO₂e**를 적습니다. 본문 계산 예는 3.2 × 0.60 × 1.09 × 0.445 = 0.93kg입니다. 부모 모델의 사전학습, 탐색 실험, 평가, 스토리지는 빠집니다. 6절은 모델·설정·ablation·검증을 합치면 개발에 **수백 GPU-시간**이 들었다고 따로 밝힙니다. 같은 표에서 LLaDA 행은 보고된 H800 13만 GPU-시간에 H100 용량 블록 단가(가속기 시간당 5.191달러)를 곱해 674,830달러, 44.1톤으로 적습니다. 학습이 H100에서 돌았다는 뜻이 아니고, 이것도 같은 종류의 예시 환산입니다.

## 추론

생성은 고정 길이의 **전부 마스크인 답 블록**에서 시작합니다. 스텝마다 마스크 자리를 모두 예측하고, 신뢰도가 높은 예측을 남기며, 낮은 자리는 다시 가립니다. 한 번 채택된 토큰은 마스크로 되돌리지 않습니다. 9개 벤치마크는 탐욕 선택(temperature 0)과 low-confidence remasking이고, 열린 생성은 temperature 0.7에 EOS/EOT 수락을 늦춥니다. 과제별 길이와 NFE는 대체로 같습니다. MMLU는 64토큰·64 NFE, GSM8K와 MATH-500과 HumanEval은 256토큰·256 NFE입니다. 샘플러는 "LLaDA 스타일 fixed-transfer"라고만 적혀 있어, 여기서 전이 공식을 새로 만들지 않습니다.

```text
시작: 답 자리 전부가 [MASK]
각 스텝 (NFE 1회, 양방향 어텐션):
    아직 가려진 자리를 모두 예측
    신뢰도 상위만 토큰으로 확정
    나머지는 [MASK]로 유지
끝: 확정된 답 블록
```

## 벤치마크가 실제로 말하는 것

평가는 각 벤치마크의 **시드를 고정한 125개 부분집합**입니다. 전체 시험 집합이 아닙니다. 같은 125개로 AR 부모와 짝을 맞춥니다. 평균은 9과제의 비가중 평균입니다. 객관식은 선택지 라벨, GSM8K는 최종 숫자, MATH는 정규화한 boxed 식, 코드는 격리된 서브프로세스의 테스트 통과(pass@1)입니다.

| 모델 | 9과제 평균 | 부모 AR | 같은 하니스의 LLaDA |
|---|---:|---:|---:|
| BYOD-Gemma | 50.6% | 65.7% | 51.9% |
| BYOD-Qwen | 49.0% | 71.6% | 51.9% |
| BYOD-Ministral | 49.9% | 64.4% | 51.9% |
| BYOD-Llama-25k | 48.7% | 58.8% | 51.9% |
| BYOD-Llama-50k | 49.2% | 58.8% | 51.9% |

BYOD-Gemma가 변환 모델 중 가장 높고, 같은 하니스의 LLaDA 8B Instruct(51.9%)와 1.3점 차이입니다. LLaDA를 원 논문 프로토콜로 인용한 값은 54.5%라, 하니스만 바꿔도 2.6점이 움직입니다. 부모보다는 평균이 낮습니다. 가장 큰 구멍은 수학과 코드입니다. Gemma 기준 GSM8K 64.0% 대 부모 87.2%, MATH-500 29.6% 대 60.0%, HumanEval 25.6% 대 74.0%입니다. 반대로 Gemma의 GPQA(32.0% 대 28.0%), HellaSwag(75.2% 대 69.6%), MMLU(68.8% 대 64.8%)에서는 변환 모델이 부모보다 높습니다. "지식을 상당 부분 유지한다"는 평균이 아니라 과제별로 읽어야 합니다.

코드 구멍의 일부는 문법입니다. Appendix E에서 BYOD-Llama-50k의 HumanEval 출력 35/125(28.0%)와 MBPP 11/125(8.8%)가 `ast.parse`에 실패했고, 같은 예제의 Llama AR은 둘 다 0/125입니다. 논문이 옮긴 조각에는 `defdef make_palindrome`처럼 키워드가 두 번 나온 경우가 있습니다. 저자들은 병렬 예측의 국소 불일치와 맞닿아 있다고 보면서, 그 조각만으로 디코딩이 원인이라고 단정하지는 않습니다.

열린 생성은 100개 질문에 128토큰을 만들고, 디퓨전 모델 자신의 우도가 아니라 **얼린 Phi-4 14B**의 토큰 가중 perplexity로 유창성을 잽니다. 64 NFE에서 BYOD는 8.27(Gemma), 9.42(Ministral), 10.50(Llama-25k), 11.12(Qwen)입니다. Llama-50k는 9.53입니다. 초록의 8.3–11.1은 이 범위를 한 자리로 반올림한 값입니다. 같은 조건의 LLaDA는 4.07, AR 부모는 2.23–3.01입니다. NFE를 32에서 128로 늘리면 perplexity는 내려가지만, 변환 모델은 여전히 부모의 2.7–5.0배입니다. Distinct-n은 국소 반복을 보는 보조 지표이고, 사실성이나 문법의 대체재가 아니라고 6절이 적습니다.

양방향이 실제로 쓰이는지는 오른쪽 단서 복사로 확인합니다. 응답 앞쪽 `[MASK]`에, 나중에 적힌 단어를 그대로 베끼게 합니다. 인과 모델은 오른쪽 토큰이 왼쪽 로짓에 영향을 줄 수 없습니다. 단서를 넣자 변환 모델 네 개와 LLaDA 모두 **100%의 문항에서 탐욕 예측이 바뀌었습니다.** 정확히 베낀 비율은 Gemma, Ministral, LLaDA가 100%, Llama-25k 90%, Llama-50k 70%, Qwen 20%입니다. 단서를 지우면 모두 0%입니다. 정보가 흐른다는 뜻과, 그 정보를 지시대로 쓴다는 뜻은 다릅니다.

Llama를 25,000에서 50,000 업데이트로 늘리면 평균은 0.5점 오르고, 다섯 과제는 오르며 네 과제는 내려갑니다. 검증 손실은 거의 단조 감소하다 끝에서 평평해집니다. 저자들은 더 긴 학습만으로는 부족할 수 있다고 보고, 배치, 디노이징 타깃, key/출력/MLP/노름 어댑터를 다음 ablation으로 적습니다.

## 비즈니스 인사이트

2026년의 상용 디퓨전 언어모델이 파는 것은 적응 비용이 아니라 **처리량**입니다. 숫자를 논문 밖으로 가져올 때는 출처를 가릅니다.

- Inception Labs의 Mercury 기술 보고([arXiv:2506.17298](https://arxiv.org/abs/2506.17298))는 Artificial Analysis의 독립 평가를 인용해, NVIDIA H100에서 Mercury Coder Mini **1,109 tok/s**, Small **737 tok/s**를 적고, 속도 최적화 프런티어 모델 대비 평균 최대 10배라고 씁니다. 회사 소개 글도 H100에서 1,000 tok/s 초과와 코드 모델 플레이그라운드·API·온프레미스를 말합니다. 같은 블로그 목록에는 2026-10-19자 "Introducing Mercury 3" 글이 있습니다. 그 후속 제품의 속도·가격은 이 글에서 확인하지 않아 적지 않습니다.
- Google DeepMind는 [Gemini Diffusion](https://deepmind.google/models/gemini-diffusion/)을 실험용 텍스트 디퓨전 모델로 올려 두었습니다. 페이지의 샘플링 속도는 오버헤드를 뺀 **1,479 tok/s**, 오버헤드 0.84초이고, "보고된 평가들의 평균 샘플링 속도"입니다. 끝에서 끝까지의 체감 속도가 아닙니다. HumanEval은 89.6%로, 같은 표의 Gemini 2.0 Flash-Lite 90.2% 옆입니다. 2025-05-20 블로그도 실험 데모와 대기자 명단을 말합니다.

**분석/의견.** BYOD는 이 시장과 다른 선반에 있습니다. Mercury와 Gemini Diffusion이 "이미 만든 디퓨전 모델을 얼마나 빨리 서빙하나"라면, BYOD는 "가진 AR 지시 모델을 디퓨전 생성기로 바꾸는 학습이 오후에 끝나나"입니다. 이득을 보는 쪽은 13만 GPU-시간 사전학습이 없는 연구실, 그리고 양방향 문맥이나 인필을 기존 체크포인트 위에서 시험해 보려는 팀입니다. 손해를 보는 쪽은 이 레시피를 저지연 제품으로 읽은 팀입니다. 낮은 NFE의 Phi-4 perplexity는 LLaDA와 AR 부모보다 나쁘고, 수학·코드 점수는 부모에서 크게 빠지며, 논문은 추론 가속을 측정하지 않았다고 7절에 못 박습니다.

비용 이야기를 제품 단가로 쓰면 안 됩니다. 11달러는 Llama 한 번의 변환을 공공 클라우드 단가에 대입한 예시이고, 부모 사전학습과 저자들이 쓴 수백 GPU-시간의 탐색은 빠집니다. 어댑터를 접으면 서빙 파라미터는 부모 크기로 돌아가므로, "LoRA를 달고 추론해야 한다"는 영구 비용은 아닙니다. 품질 간격은 병합으로 사라지지 않습니다.

개발자가 바로 쓸 때 확인할 제한은 다섯 가지입니다. 부모 모델 라이선스와 Alpaca 계열 행의 비상업 조건이 남습니다. 공개 트레이너는 논문의 FP8이 아니라 BF16/FP16입니다. quick 모드는 더 작은 모델과 랭크 128이라 논문 점수를 재현하지 않습니다. 벤치마크 점수는 과제당 125개입니다. 같은 1저자의 선행 데모 [LAD](https://aclanthology.org/2025.emnlp-demos.8/)(EMNLP 2025)가 이미 LLaMA에 LoRA로 디퓨전 생성을 유도했습니다. LAD는 마스크에 토큰 교환·복제·스팬 이동을 섞었고, BYOD는 그 복합 손상을 단순한 IID absorbing mask로 바꿔 네 가족에 옮기는지를 봅니다. "LoRA로 디퓨전을 처음 만들었다"로 읽히면 그 선행 연구가 지워집니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름 / ❌ 사실 아님

### @AIcia_Solid 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| LoRA로 AR LLM을 디퓨전 DLM으로 바꾸는 연구다 | ⚠️ | 학습되는 파라미터는 Q/V LoRA가 맞고 베이스는 동결입니다. 변환에는 인과 마스크를 양방향으로 바꾸는 일, 다음 토큰 시프트 제거, 답·패딩만 가리는 absorbing-mask 손실이 함께 있습니다. LoRA 행렬만 얹고 인과 마스크를 두면 논문의 변환이 아닙니다. [3.2절](https://arxiv.org/html/2610.41574) |
| 연결된 arXiv가 그 논문이다 | ✅ | 2610.41574 v1, 2026-10-30 제출. 제목·저자가 포스트의 카드와 같습니다. [abs](https://arxiv.org/abs/2610.41574) |

"なんじゃそら"는 평가가 아니라 감탄이라 판정하지 않았습니다.

### 초록을 그대로 옮길 때 생기기 쉬운 주장

| 주장 | 판정 | 근거 |
|---|---|---|
| 네 가족을 아키텍처별 튜닝 없이 같은 레시피로 변환했다 | ✅ | 양방향 마스크, Q/V LoRA r=α=1024, 같은 마스크 목적함수. 랭크를 고정해 학습 파라미터 절대량은 323M–572.5M으로 달라지고, 저자들은 이를 교차 비교의 교란 요인으로 적습니다. [Table 2](https://arxiv.org/html/2610.41574) |
| 어댑터가 최종 파라미터의 4.1–5.8%이고 베이스는 전부 동결이다 | ✅ | Table 2의 4.07–5.77%. 임베딩·LM 헤드·바이어스·노름 포함 백본 동결. |
| 변환에 최대 102.4M 토큰, Colab GPU 한 장에서 3.1–4.0시간 | ✅ | 40만 예제 × 최대 256토큰 = 102.4M은 상한. 시간은 RTX PRO 6000 실측 3.1–4.0시간. 아무 Colab GPU나 해당한다는 뜻은 아닙니다. |
| Mistral 모델의 AR→DLM 변환으로는 처음이다 | ⚠️ | 초록은 "to our knowledge"이고, 2절은 더 좁게 **Ministral 8B Instruct 2410**의 선행 변환을 찾지 못했다고 합니다. 그 체크포인트의 완전 양방향 LoRA 변환 논문을 이 글에서 찾지 못한 것은 맞습니다. 다만 2026-06-07 NVIDIA Megatron-Bridge 커밋은 이미 **Ministral-3** 3B/8B/14B를 블록 디퓨전으로 바꾸는 공개 학습 예제를 고치고 있습니다. 체크포인트, 손실, 어텐션이 다르고, 그 예제는 벤치마크 논문을 대체하지 않습니다. "Mistral 계열 최초"로 단정할 근거는 약합니다. [Megatron-Bridge 커밋](https://github.com/NVIDIA-NeMo/Megatron-Bridge/commit/fad133fa660f78565ed174c288b48c438ba04a50) |
| BYOD-Gemma가 LLaDA 8B Instruct와 비슷하다 (50.6% 대 51.9%) | ⚠️ | 같은 하니스, 과제당 125개, 9과제 비가중 평균에서는 맞습니다. 전체 벤치마크가 아니고, 출판 프로토콜의 LLaDA는 54.5%입니다. 열린 생성 64 NFE perplexity는 8.27 대 4.07로 간격이 큽니다. [Table 3, Table 12, Appendix D](https://arxiv.org/html/2610.41574) |
| 부모 모델의 지식을 상당 부분 유지한다 | ⚠️ | 일부 객관식은 부모를 넘습니다. 9과제 평균은 부모보다 낮습니다(Gemma 50.6% 대 65.7%, Qwen 49.0% 대 71.6%). 수학·코드 하락이 평균을 끌어내립니다. |
| 낮은 NFE에서도 생성이 실용적이다 | ❌ | 저자들이 주된 한계로 적은 것이 이 구간입니다. 128토큰을 64스텝으로 만들 때 BYOD perplexity 8.3–11.1, LLaDA 4.1, AR 부모 2.2–3.0. 7절은 품질이 부모와 LLaDA에 미치지 못한다고 씁니다. |
| 변환이 추론을 빠르게 만든다 | ❌ | 7절: 추론 예산은 NFE로만 재고 벽시계 지연은 재지 않았습니다. 스텝 수가 적어도 각 스텝이 답 블록 전체를 처리합니다. 효율 주장은 변환 **학습**입니다. |
| 변환 비용이 약 11달러, CO₂e 0.9kg이다 | ⚠️ | Llama 3.1 8B 변환의 관측 3.2 GPU-시간 한 건을 Appendix A 시나리오로 환산한 예시입니다. 저자 청구서도 측정 배출량도 아니고, 부모 사전학습과 수백 GPU-시간의 개발은 빠집니다. Gemma는 4.0시간이라 이 행과 다릅니다. [Appendix A](https://arxiv.org/html/2610.41574) |
| 공개 코드로 논문 점수를 그대로 재현할 수 있다 | ⚠️ | 저장소·Colab·평가 하니스·데모는 있습니다. README와 `paper.yaml`은 FP8 없이 BF16/FP16이고, REPRODUCIBILITY.md는 전체 GPU 변환과 출판 점수의 정확한 재생성을 테스트로 검증하지 않았다고 적습니다. 논문도 비트 단위 재현을 보장하지 않습니다. [BYOD README](https://github.com/RuurdKuiper/BYOD) |

**총평:** 포스트의 한 문장은 방향이 맞습니다. 다만 "LoRA로 바꿨다"만 남기면 양방향 마스크와 같은 위치 복원 손실이 사라지고, 초록의 시간·정확도만 남기면 125개 부분집합, 부모 대비 하락, 추론 속도를 재지 않았다는 한계가 사라집니다. 명백한 ❌는 논문이 주장하지 않은 두 가지, 즉 낮은 NFE의 실용성과 추론 가속에 붙입니다.

## 참고 자료

- Kuiper & Bagheri, *BYOD: Build Your Own DLM*, arXiv:2610.41574 (2026-10-30, v1) — [abs](https://arxiv.org/abs/2610.41574) · [HTML](https://arxiv.org/html/2610.41574) · [코드](https://github.com/RuurdKuiper/BYOD)
- 공식 README가 가리키는 데모 — [Gemma](https://huggingface.co/spaces/Dovelove/byod-gemma-2-9b) · [Llama](https://huggingface.co/spaces/Dovelove/byod-llama-3.1-8b) · [Qwen](https://huggingface.co/spaces/Dovelove/byod-qwen2.5-7b) · [Ministral](https://huggingface.co/spaces/Dovelove/byod-ministral-8b). 네 주소 모두 이 글을 쓸 때 HTTP 200이었고, Gemma 페이지 본문은 비활성으로 잠들어 있다고 표시했습니다.
- Nie et al., *Large Language Diffusion Models* (LLaDA), arXiv:2502.09992 — 8B를 2.3조 토큰, H800 0.13M GPU-시간으로 처음부터 사전학습. [abs](https://arxiv.org/abs/2502.09992)
- Gong et al., *Scaling Diffusion Language Models via Adaptation from Autoregressive Models* (DiffuLLaMA), ICLR 2025, arXiv:2410.17891 — 65B 토큰 샘플과 60B 토큰 학습 곡선이 같은 절에 있습니다. [abs](https://arxiv.org/abs/2410.17891)
- Ye et al., *Dream 7B*, arXiv:2508.15487 — Qwen2.5-7B 초기화, 학습 코퍼스 5,800억 토큰. [abs](https://arxiv.org/abs/2508.15487)
- Kuiper et al., *LAD: LoRA-Adapted Diffusion*, EMNLP 2025 System Demonstrations — [ACL Anthology](https://aclanthology.org/2025.emnlp-demos.8/)
- Inception Labs, Mercury 소개 글 — [블로그](https://www.inceptionlabs.ai/blog/introducing-mercury) · 기술 보고 [arXiv:2506.17298](https://arxiv.org/abs/2506.17298)
- Google DeepMind, Gemini Diffusion — [모델 페이지](https://deepmind.google/models/gemini-diffusion/) · [2025-05-20 블로그](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-diffusion/)
- NVIDIA Megatron-Bridge, Ministral-3 블록 디퓨전 학습 예제 — [ar_to_dlm.py](https://github.com/NVIDIA-NeMo/Megatron-Bridge/blob/main/examples/models/nemotron_labs_diffusion/ar_to_dlm.py) · [2026-06-07 경로 수정 커밋](https://github.com/NVIDIA-NeMo/Megatron-Bridge/commit/fad133fa660f78565ed174c288b48c438ba04a50)
- 원본 X 포스트: [@AIcia_Solid](https://x.com/AIcia_Solid/status/2117127118312341596) · [상태 주소](https://x.com/i/status/2117127118312341596)
