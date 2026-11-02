---
title: "1억 파라미터가 720억을 이겼다? LeCun·Balestriero의 '플라토닉 표현 정리' 팩트 체크"
date: 2026-11-02
time: "08:47"
slug: platonic-representation-jepa
tags: [AI, 표현학습, JEPA, 논문리뷰, 팩트체크]
summary: "'모델 크기가 아니라 무엇을 같은 것으로 묶느냐가 중요하다' — X에서 화제가 된 LeCun·Balestriero 논문을 원문 기준으로 정리하고, 바이럴 포스트의 주장을 하나씩 검증했습니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@heyshrutimishra의 포스트](https://x.com/heyshrutimishra/status/2116931531000156348)와 [@Kresnik_00(박호성 님)의 포스트](https://x.com/Kresnik_00/status/2116873975989236113)를 계기로, 원 논문 [arXiv:2610.39302](https://arxiv.org/abs/2610.39302)를 직접 읽고 정리한 것입니다.

## 왜 이 논문이 화제인가

지난주 X 타임라인에 이런 문구가 돌았습니다.

> "Yann LeCun was right … 109 million parameters beat 72 billion. … 660 times smaller."

자극적인 요약이지만, 개발자 입장에서 진짜 궁금한 건 이겁니다.

- **무엇을** 이겼다는 건가? (벤치마크 점수? "세상에 대한 이해"?)
- "크기는 아무 일도 안 했다"는 게 정말 논문의 결론인가?
- 우리가 임베딩 모델이나 멀티모달 파이프라인을 만들 때 가져갈 교훈이 있나?

결론부터 말하면, **숫자들은 대부분 논문에 실제로 있는 값**입니다. 다만 그 숫자가 측정하는 것은 "이해"가 아니라 **이미지 모델과의 표현 정렬(alignment) 점수 한 가지**이고, 증명은 **이상화된 가정** 위에 서 있습니다. 바이럴 버전은 이 두 가지를 지웠습니다.

## 배경: 플라토닉 표현 가설(PRH)

2024년 MIT의 Huh, Cheung, Wang, Isola는 ICML 포지션 페이퍼 [*The Platonic Representation Hypothesis*](https://arxiv.org/abs/2405.07987)에서 이런 관찰을 내놓았습니다.

- 비전 모델과 언어 모델이 **커질수록**, 데이터 포인트 간 거리를 재는 방식이 점점 비슷해진다.
- 그렇다면 서로 다른 모달리티로 학습한 모델들이 결국 **같은 "현실의 통계적 모델"** 로 수렴하는 게 아닐까?

플라톤의 동굴 비유처럼, 이미지와 텍스트는 같은 세계가 벽에 비친 서로 다른 그림자라는 거죠. 측정에는 두 모델의 임베딩 공간에서 **이웃(k-NN)이 얼마나 겹치는가**(mutual k-NN)를 썼습니다. 다만 이건 어디까지나 *관찰과 가설*이었고, "언제 성립하는지"에 대한 증명은 없었습니다.

## 이번 논문의 핵심 주장

Randall Balestriero(Brown University, AMI Labs)와 Yann LeCun(NYU, AMI Labs)은 2026년 10월 29일 arXiv에 [*Proving and Improving the Platonic Representation Hypothesis with JEPAs*](https://arxiv.org/abs/2610.39302)를 올렸습니다. (아직 동료 심사 전 프리프린트입니다.)

### 1) JEPA는 "양성 쌍 그래프의 스펙트럴 임베딩"을 배운다

JEPA(Joint-Embedding Predictive Architecture)는 "같은 것의 두 관측(view)"을 임베딩 공간에서 서로 예측하도록 학습하고, 모든 걸 한 점으로 뭉개는 붕괴(collapse)를 막는 항을 더한 구조입니다. 저자들의 이전 작업인 [LeJEPA](https://arxiv.org/abs/2511.08544)는 이 붕괴 방지 항으로 임베딩 분포를 등방성 가우시안으로 끌어당기는 **SIGReg**를 씁니다.

논문은 기존 결과를 이용해, 화이트닝(2차 모멘트 기반 anti-collapse)을 쓰는 JEPA의 최적해가 **"어떤 입력끼리 양성 쌍으로 묶었는가"가 만드는 그래프(커널)의 상위 고유벡터**, 즉 스펙트럴 임베딩이라는 점에서 출발합니다.

### 2) 플라토닉 표현 정리 (Platonic Representation Theorem)

여기서 아이디어는 아주 짧습니다.

- 여러 모달리티가 **같은 세계**를 (정보 손실 없이) 렌더링하고,
- 각 모달리티의 양성 쌍이 **같은 세계 상태들끼리** 묶여 있다면,
- 각 모달리티의 학습 문제는 사실 **좌표계만 다른 같은 문제**이므로, 해는 **직교 회전 하나 차이**로 일치한다.

즉 이미지 모델과 텍스트 모델을 서로 전혀 모르게 따로 학습해도, **회전 행렬 하나**면 두 임베딩 공간이 겹친다는 겁니다. 양성 쌍이 서로 어긋나는 경우에는 그 어긋남(커널 차이)을 스펙트럴 갭으로 나눈 만큼으로 **오정렬의 상한**을 줍니다(Theorem 2).

### 3) Good view vs Bad view

정리가 말하는 핵심 변수는 모델 크기가 아니라 **양성 쌍을 어떻게 정의하느냐**입니다.

| 구분 | 양성 쌍 예시 | 무엇을 배우나 |
|---|---|---|
| **Good view** | 한 이미지에 달린 *서로 다른 두 캡션*, 같은 장면의 두 사진 | 세계 상태 자체 (모달리티 고유 잡음은 버림) |
| **Bad view** | *한 캡션*을 두 번 마스킹, *한 사진*의 두 크롭 | 세계 + 그 관측 고유의 "말투/시점" 같은 nuisance |
| **다음 토큰 예측** | 한 문서 안의 *prefix와 그 continuation* | 논문은 이것도 bad view의 일종으로 봄 |

```text
good view : "a dog runs on the beach"  <->  "a puppy plays by the sea"   (같은 장면, 다른 문장)
bad view  : "a dog [M] on the beach"   <->  "a dog runs [M] the beach"   (같은 문장, 다른 마스킹)
NTP       : "a dog digs in the"        ->   "sand"                      (같은 문서의 앞/뒤)
```

Bad view는 두 관측이 **같은 문장의 단어 선택** 같은 모달리티 고유 정보(nuisance)를 공유하기 때문에, 인코더가 임베딩 차원의 일부를 그 nuisance에 씁니다. 그리고 그 차원은 다른 모달리티와 **어떤 회전으로도 맞출 수 없습니다**(Theorem 3, Proposition 3).

### 4) 다음 토큰 예측은 "bad-view JEPA"

Proposition 4에서 저자들은 softmax 다음 토큰 손실을 이렇게 쪼갭니다.

```text
-log softmax(<h(c), w_y>) = -<h(c), w_y>            # prediction 항
                          + log Σ_v exp(<h(c), w_v>) # anti-collapse 항 (log-partition)
```

컨텍스트 인코더 `h`, 타깃 인코더 `y ↦ w_y`, 양성 쌍은 "한 시퀀스 안의 (컨텍스트, 다음 토큰)". 형태상 JEPA이고, 양성 쌍이 같은 문서 안에서 나오니 bad view라는 해석입니다. 여기서 중요한 단서: 저자들도 "NTP가 good-view JEPA보다 비전과 덜 정렬될 것"은 **증명된 따름정리가 아니라 검증할 예측**이라고 적었습니다. 또 NTP의 최적해는 회전이 아니라 **임의의 가역 선형변환**까지만 식별된다는 점도 함께 보입니다.

## 손으로 확인해 보기: 회전 하나로 겹치는 두 모델

정리의 직관을 작은 NumPy 장난감으로 확인해 볼 수 있습니다. (논문 코드가 아니라, 정리의 "스펙트럴 임베딩 + 직교 Procrustes" 구조만 흉내 낸 예제입니다. 전체 파일: [prh_toy.py](../../static/prh_toy.py))

```python
import numpy as np

rng = np.random.default_rng(0)
N, k = 30, 4                       # 유한한 세계: 상태 30개, 임베딩 차원 4

def random_kernel(n):
    """대칭·비음수 '양성 쌍' 커널 (어떤 상태끼리 같은 것으로 묶이는가)"""
    A = rng.random((n, n)) ** 4
    A = (A + A.T) / 2
    return A / A.sum(axis=1, keepdims=True).mean()

def spectral_embedding(K, k):
    """화이트닝된 JEPA의 해 = 양성 쌍 커널의 상위 k개 고유벡터"""
    w, V = np.linalg.eigh((K + K.T) / 2)
    V = V[:, np.argsort(w)[::-1][:k]] * np.sqrt(len(K))   # 화이트닝
    Q, _ = np.linalg.qr(rng.normal(size=(k, k)))           # 모델마다 임의의 좌표계
    return V @ Q

def procrustes_error(A, B):
    """A ≈ B R 이 되는 최적 직교행렬 R을 찾고 남는 RMS 오차"""
    U, _, Vt = np.linalg.svd(B.T @ A)
    return np.sqrt(np.mean(np.sum((A - B @ (U @ Vt)) ** 2, axis=1)))

world = random_kernel(N)
img = spectral_embedding(world, k)                       # '이미지 모델'
for eps in [0.0, 0.1, 0.3, 0.6]:
    mixed = (1 - eps) * world + eps * random_kernel(N)   # 양성 쌍이 어긋난 '텍스트 모델'
    print(f"eps={eps:.1f} -> 회전 후 RMS 오차 = "
          f"{procrustes_error(img, spectral_embedding(mixed, k)):.3f}")
```

제 환경에서 실행한 결과입니다.

```text
kernel mismatch eps=0.0 -> rotation 후 RMS 오차 = 0.000
kernel mismatch eps=0.1 -> rotation 후 RMS 오차 = 0.344
kernel mismatch eps=0.3 -> rotation 후 RMS 오차 = 0.847
kernel mismatch eps=0.6 -> rotation 후 RMS 오차 = 1.746
```

양성 쌍 커널이 같으면(eps=0) 각자 임의의 좌표계를 골랐어도 **회전 하나로 완벽히 겹치고**, 양성 쌍이 어긋날수록 어떤 회전으로도 메울 수 없는 오차가 커집니다. 논문의 Theorem 1·2가 말하는 그림이 정확히 이것입니다. 참고로 Proposition 2에 따르면 그 회전을 찾는 데는 일반 위치의 쌍 `k`개면 충분합니다.

## 실험 결과 요약

논문 Table 3과 4.2절 기준입니다. 정렬 지표는 PRH 원 논문의 벤치마크(WIT-1024, DINOv2 ViT-B와의 mutual 10-NN)입니다.

| 텍스트 인코더 | 파라미터 | WIT 10-NN (DINOv2-B) |
|---|---|---|
| **Good-view JEPA** (BERT-B, 900M 샘플) | 109M | **.184** |
| Qwen2.5-72B | 72B | .154 |
| Llama-3-70B | 70B | .151 |
| CLIP B/32 텍스트 인코더 | – | .124 |
| 다음 토큰 예측 (같은 BERT-B, 같은 텍스트) | 109M | .111 |
| Bad-view JEPA (같은 BERT-B, 같은 텍스트) | 109M | .088 |

- **42배**: good-view JEPA는 **21.6M 샘플**에서 .109에 도달했고, 같은 코퍼스의 다음 토큰 예측은 **900M 샘플**에서 .111이었습니다. 900/21.6 ≈ 41.7 → "42배". 텍스트 토큰 기준으로는 **14배**입니다(good-view 샘플 하나가 텍스트 3개를 읽기 때문).
- 회전 하나로 따로 학습한 인코더를 이어 붙여 **이미지 캡셔너**(COCO CIDEr .838)를 만들었고, 쌍 없이 정렬하는 벤치마크에서는 ImageNet-100 top-5 64%(8B까지의 LM 최고 56%)를 보고했습니다.

### 저자들이 직접 밝힌 한계 (중요!)

논문 "Known limitations" 문단을 그대로 요약하면:

1. 정리는 **유한한 세계, 단사(injective) 렌더링, 모집단 최적해** 가정 위의 진술이고, "실제 모달리티는 손실이 있다".
2. 실험은 LeJEPA(SIGReg)를 쓰는데, 유일성은 **2차 anti-collapse에 대해서만** 증명됐다. **어떤 실험도 정리의 가정을 정확히 만족하지 않는다.**
3. **가장 큰 단서: good view를 어디서 구하나.** 웹 규모 실험(Recap-DataComp)에서 이미지당 텍스트 3개 중 2개는 **LLaVA(비전 인코더가 CLIP)가 생성한 캡션**이라, 이미지–텍스트 학습에서 증류된 정보를 담고 있다. 캡셔너 없이 alt-text와 그 패러프레이즈만 쓰면 WIT 점수는 .060으로 떨어진다.
4. 하이퍼파라미터는 **good-view JEPA에 대해서만** 튜닝됐다.
5. 42배 비교에서 NTP는 **더 이른 체크포인트를 채점하지 않았다.**

즉 "109M이 72B를 이겼다"는 결과는 사실이지만, **같은 조건의 공정한 체급전이라기보다** "정렬이라는 한 지표에서, 캡셔너가 만든 '같은 장면의 다른 설명'이라는 데이터 설계가 얼마나 강력한가"를 보여주는 결과로 읽는 게 정확합니다.

## 팩트 체크

북마크한 두 포스트의 주장을 원문과 대조했습니다. ✅ 사실 / ⚠️ 부분적으로 사실·과장 / ❌ 사실 아님

### @heyshrutimishra 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| "109M 파라미터가 72B를 이겼다" | ⚠️ | 수치는 사실(.184 vs Qwen2.5-72B .154). 단, **이미지 모델과의 정렬 지표 하나**에서의 비교이며 일반적인 성능·이해력 비교가 아님. [arXiv Table 3](https://arxiv.org/html/2610.39302v1) |
| "660배 작다" | ✅ | 72B / 109M ≈ 660. 산술은 맞음. |
| LeCun이 11월에 Meta를 떠나 파리에 자기 연구소를 차렸다 | ✅ | 2025년 11월 19일 퇴사 계획 발표, 연말 퇴사. AMI Labs는 파리 본사(LeCun은 Executive Chairman, CEO는 Alex LeBrun). [Reuters](https://www.reuters.com/technology/yann-lecun-leave-meta-launch-ai-startup-focused-advanced-machine-intelligence-2025-11-19/), [TechCrunch](https://techcrunch.com/2025/12/19/yann-lecun-confirms-his-new-world-model-startup-reportedly-seeks-5b-valuation/), [MIT Tech Review](https://www.technologyreview.com/2026/01/22/1131661/yann-lecuns-new-venture-ami-labs/) |
| "지난 목요일에 증명을 발표했다" | ✅ | arXiv v1 2026-10-29(목). [arXiv](https://arxiv.org/abs/2610.39302) |
| 2024년 이후 "크면 모든 모달리티가 같은 현실 그림을 갖게 된다"는 이론이 있었고, 증명된 적은 없었다 | ✅ | Huh et al., ICML 2024 PRH. 이번 논문도 "PRH remains an observation"이라고 서술. [PMLR](https://proceedings.mlr.press/v235/huh24a) |
| "증명은 크기가 애초에 일을 한 게 아니라고 말한다" | ⚠️ | 과장. 논문 결론은 "**not scale alone**"(크기*만*이 아니다). 증명은 이상화된 JEPA 설정에 한정되며, 오히려 LM이 "scale을 통해" 정렬된다는 설명을 제공함. |
| 사진–캡션 같은 "한 대상의 두 관측"으로 학습하면 빠르게 도달 | ⚠️ | 방향은 맞지만 논문의 good view는 **사진–캡션 쌍이 아니라** "같은 이미지의 서로 다른 캡션끼리"(텍스트–텍스트) 쌍. 크로스모달 손실은 쓰지 않음. |
| 다음 단어 예측은 "같은 문서의 두 조각" 쪽이다 | ✅ | Proposition 4: NTP = prefix와 continuation을 양성으로 쓰는 bad-view JEPA 형태. 단, "더 나쁘게 정렬된다"는 건 저자 표현으로 "a prediction to test rather than a corollary". |
| 21.6M 예시 vs 900M 예시로 "같은 이해"에 도달 | ⚠️ | 숫자는 정확(4.2절). 다만 "이해"가 아니라 **WIT 정렬 점수 .109 vs .111**이며, NTP의 더 이른 체크포인트는 채점하지 않음. |
| Meta는 반대(스케일)에 베팅했다 | ⚠️ | 논문이 다루는 내용이 아닌 해석/의견. 검증 대상 아님. |

### @Kresnik_00 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| PRH는 지금까지 "키우면 그렇게 되더라"는 관찰이었다 | ✅ | [PRH 원 논문](https://arxiv.org/abs/2405.07987) |
| 조건을 단 정리로 바꿨다; 같은 장면의 다른 관측을 묶으면 서로 본 적 없는 모델이 **회전 한 번**으로 맞는다 | ✅ | Platonic Representation Theorem (2.1절) |
| 가리거나 잘라서 만든 쌍은 문장의 말투까지 외운다; NTP도 이쪽 | ✅ | Proposition 3(nuisance), Proposition 4(NTP) |
| 같은 데이터에서 NTP보다 42배 적은 샘플 | ✅ | 4.2절 (토큰 기준으론 14배라는 점은 생략됨) |
| 1억 남짓 글 모델이 720억 LM보다 이미지 모델과 정렬이 높다 | ✅ | Table 3 |
| 증명은 유한 세계·무손실 관측 같은 이상적 가정 위 | ✅ | Known limitations |
| 비교 지표가 "이미지 모델과 얼마나 맞느냐" 하나 | ⚠️ | 대체로 맞음. 주 지표는 정렬이지만 linear CKA, COCO 벤치마크, Flickr 검색, 캡셔닝, 쌍 없는 분류도 보고함(모두 정렬 계열). 또 **캡셔너 생성 텍스트 의존성**이라는 가장 큰 단서는 언급되지 않음. |

**총평:** 한국어 포스트는 상당히 정확하고 절제된 요약이고, 영어 바이럴 포스트는 숫자는 맞지만 *무엇을 측정했는지*와 *가정*을 지워서 "크기는 의미 없다"는 과장으로 흘렀습니다. ❌(명백한 거짓)으로 판정할 주장은 없었습니다.

## 개발자로서 가져갈 점

1. **임베딩 모델을 만들거나 파인튜닝할 때, 양성 쌍 설계가 1순위 하이퍼파라미터다.** 같은 문장을 증강한 쌍보다 "같은 대상을 다르게 설명한 쌍"(같은 상품의 다른 리뷰, 같은 이슈의 다른 리포트 등)이 모달리티 고유 잡음을 덜 배운다.
2. **크로스모달 정렬은 "회전 하나" 문제로 볼 수 있다.** 이미 따로 학습된 두 인코더라도, 소량의 쌍으로 직교 Procrustes를 풀어 붙여볼 가치가 있다(논문은 이걸로 캡셔너까지 만들었다).
3. **바이럴 숫자를 볼 때는 "어떤 지표에서?"를 먼저 묻자.** 이번 "109M > 72B"도 사실이지만, 그 지표 하나에서의 이야기다.

## 참고 자료

- Balestriero & LeCun, *Proving and Improving the Platonic Representation Hypothesis with JEPAs*, arXiv:2610.39302 (2026-10-29) — [abs](https://arxiv.org/abs/2610.39302) · [HTML](https://arxiv.org/html/2610.39302v1) · [Hugging Face Papers](https://huggingface.co/papers/2610.39302) · [코드](https://github.com/galilai-group/prh-proof) · [데모](https://huggingface.co/spaces/galilai-group/prh_demo)
- Huh, Cheung, Wang, Isola, *Position: The Platonic Representation Hypothesis*, ICML 2024 — [PMLR](https://proceedings.mlr.press/v235/huh24a) · [arXiv:2405.07987](https://arxiv.org/abs/2405.07987)
- Balestriero & LeCun, *LeJEPA: Provable and Scalable Self-Supervised Learning Without the Heuristics*, arXiv:2511.08544 — [arXiv](https://arxiv.org/abs/2511.08544) · [GitHub](https://github.com/galilai-group/lejepa)
- Reuters, "Yann LeCun to leave Meta, launch AI startup…" (2025-11-19) — [링크](https://www.reuters.com/technology/yann-lecun-leave-meta-launch-ai-startup-focused-advanced-machine-intelligence-2025-11-19/)
- TechCrunch, "Yann LeCun confirms his new 'world model' startup" (2025-12-19) — [링크](https://techcrunch.com/2025/12/19/yann-lecun-confirms-his-new-world-model-startup-reportedly-seeks-5b-valuation/)
- MIT Technology Review, "Yann LeCun's new venture is a contrarian bet against large language models" (2026-01-22) — [링크](https://www.technologyreview.com/2026/01/22/1131661/yann-lecuns-new-venture-ami-labs/)
- 원본 X 포스트: [@heyshrutimishra](https://x.com/heyshrutimishra/status/2116931531000156348) · [@Kresnik_00](https://x.com/Kresnik_00/status/2116873975989236113)
