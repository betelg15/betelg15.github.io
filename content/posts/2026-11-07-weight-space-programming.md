---
title: "가중치만 읽고 고친다? Weight-Space Programming 팩트 체크"
date: 2026-11-07
time: "09:16"
slug: weight-space-programming
tags: [Weight-Space Programming, LLM, Mechanistic Interpretability, MIT CSAIL, Qwen, Claude, 모델 편집]
summary: "MIT CSAIL Sparks 블로그(2026-11-02): GPT-6 Astra가 Qwen3.5-0.8B의 0.016% 가중치를 직접 고쳐 MATH-500 7.9%→48.1%. 임상 감사 논문·weightspace 하네스까지 1차 자료로 검증. PLaMo お嬢様言葉 주장은 ⚠️."
---

> 이 글은 제가 X에서 북마크해 둔 [@63556poiuytrewq의 포스트](https://x.com/63556poiuytrewq/status/2118633227191832588)(bookmark id `2118633227191832588`)를 계기로 썼습니다. 해당 글은 [@rizumita](https://x.com/rizumita/status/2118356330037817773)의 “LLM이 가중치를 다시 쓰는 방법으로 PLaMo 3 Translate를 お嬢様言葉로 말하게 한 것 같다”(저자 본인은 외출 중이라 **직접 확인 못 함**, 「っぽい」)는 일화를 보고 「重み空間プログラミング」이 가능해 보인다며 놀란 반응입니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-07(KST)에 읽은 1차 자료입니다.
>
> - [Sparks of Weight-Space Programming](https://rikiyat.github.io/blog/weight-space-programming/) (Takehi, Teoh, Zhang, Khattab; MIT CSAIL; **2026-11-02**)
> - 실험 로그 [RikiyaT/lm_understand-logs](https://github.com/RikiyaT/lm_understand-logs), 편집 체크포인트 [RikiyaT/Qwen3.5-0.8B-weight-space-programming](https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming)
> - 임상 감사 논문 [arXiv:2611.05341](https://arxiv.org/abs/2611.05341) (Nusrat & Nusrat; **2026-11-03**), 코드 [hnusrat1/weightspace-rt](https://github.com/hnusrat1/weightspace-rt)
> - 하네스 [weightspace (PyPI)](https://pypi.org/project/weightspace/) · [leofmarciano/weightspace](https://github.com/leofmarciano/weightspace)
> - PLaMo 대비: [PFN 테크블로그](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release), [Conao3 노트](https://s.conao3.com/blog/2026/33d2c2), HF `pfnet/plamo-3-translate-*`

이 글은 기존 포스트 [qwenfs-filesystem-in-llm-weights](/posts/qwenfs-filesystem-in-llm-weights/)(가중치에 파일시스템을 **심는** 쪽)나 [heretic-2-llm-abliteration](/posts/heretic-2-llm-abliteration/)(거부 방향을 **제거**하는 쪽)와는 다른 축입니다. 여기서 다루는 WSP는 **프론티어 LLM이 경사하강 없이 신경망 가중치를 직접 읽고·쓰고·고치는** 패러다임입니다.

## 왜 중요한가

딥러닝에서 가중치는 오랫동안 “사람이 손으로 만질 수 없는 영역”이었습니다. Adam·Muon 같은 기호적 옵티마이저, 데이터셋, 학습 루프가 그 자리를 대신했습니다. LLM은 프롬프트·하네스·학습 **코드**를 고치는 데까지는 이미 쓰였지만, **가중치 숫자 자체**를 자연어 목표에 맞춰 직접 편집하는 것은 별개의 이야기였습니다.

2026-11-02 MIT CSAIL 블로그 *Sparks of Weight-Space Programming*은 그 경계를 실험으로 넘깁니다. 핵심 질문은 세 가지입니다.

1. **읽기** — 원시 가중치만 보고 “이 네트워크가 무엇을 하는지” 알 수 있는가?
2. **고치기** — 실패 원인을 가중치에서 찾아, 학습 없이 소량만 바꿀 수 있는가?
3. **쓰기** — 규칙·소스만 주고 제로샷으로 동작하는 네트워크를 짤 수 있는가?

개발자·ML 엔지니어 입장에서 확인할 포인트는 마케팅 슬로건보다 다음입니다.

- Qwen3.5-0.8B MATH-500 **7.9%→48.1%** 같은 숫자는 블로그 표와 HF 카드에 그대로 있는가?
- 편집량은 정말 **0.016%**(131,072개)인가?
- Gemma 3 270M처럼 “능력 추가”는 실패했는가?
- 임상 네트워크 감사에서 Opus 5.5가 **16/18** 결함을 맞췄는가, 건강한 네트워크 인증은?
- X의 PLaMo お嬢様言葉 일화는 재현·공식 문서와 맞는가?

## 기술 설명: Weight-Space Programming

### 정의

Sparks 블로그의 정의에 따르면, **Weight-Space Programming(WSP)** 은 범용 LLM이 옵티마이저(특히 경사하강)를 통하지 않고 네트워크 가중치를 **직접** 읽고·쓰며, 자연어 스펙을 중심으로 동작하는 방식입니다. 환경 피드백이 전혀 없는 제로샷 설정도 포함됩니다. 저자들은 이를 “인간이 코드에 대해 손으로 최적화하듯, LLM이 가중치에 대해 추론으로 최적화하는” 흐름으로 서술합니다.

### Sparks 실험 요약 (MIT CSAIL, 2026-11-02)

저자: Rikiya Takehi\*, Jayden Teoh\*, Alex Zhang, Omar Khattab (MIT CSAIL). 실험 LLM은 글에서 **GPT-6 Astra**로 표기됩니다. 전체 로그는 [RikiyaT/lm_understand-logs](https://github.com/RikiyaT/lm_understand-logs)에 공개되어 있습니다(이 환경 GitHub API 조회 2026-11-07 09:14 KST: ★**1066**, forks 142).

#### 읽기: 게임·확산·중간층 언어

- **어느 게임인가?** PPO로 학습한 MLP 정책(500→32→32→5, tanh, **17,253** 가중치) 네 개(Breakout / Pong / Pac-Man / Freeway 변형, 동일 입출력·차원)의 **원시 가중치만** 텍스트로 주고 게임 이름을 물었습니다. 선택지를 알려주지 않았는데도 Astra가 네 개 모두 맞췄습니다. 1층 가중치가 입력 채널별로 어디에 모이는지(예: Breakout에서 에이전트 가중치가 하단 패들 행에 모임)를 단서로 삼았다고 서술합니다.
- **확산 모델이 그리는 도형** — DDPM 세 개(원·삼각형·정사각형, 23,824 가중치). 포워드 패스·도구 없이 출력층 기하로 형태를 맞췄고, 흥미롭게도 **채워진** 도형인데 **윤곽**으로 그리는 실수를 했습니다(포워드를 돌리지 않았다는 간접 증거).
- **중간 트랜스포머만** — 7.2M 캐릭터 LM 세 개(Python / romaji / English)에서 입·출력층을 제거하고 네 블록만 줬습니다. 네트워크 실행은 금지. Astra가 언어를 맞추고, copying(induction) 헤드를 전부 정확히 지목했습니다(표: Python 2.1·3.1·3.5 등).

#### 쓰기·고치기: 차·MinAtar·Go

- **Kinetix 차 램프** — 로컬 최소에 빠져 램프를 못 넘는 PPO 정책(171,664 가중치). Astra가 **한 번에** 가중치의 **3.5%** 를 고쳐 1,024 에피소드 **100%** 성공(기존 0%).
- **MinAtar 제로샷** — Breakout / Seaquest / Asterix. 데이터·로스·그래디언트·환경 롤아웃 없이 규칙·소스만으로 가중치를 텍스트로 작성. PPO 100M 스텝을 세 게임 모두에서 이겼습니다.

| Game | PPO, 100M steps | PPO, 500M steps | Astra, one-shot |
| --- | ---: | ---: | ---: |
| Breakout | 15.8 | 25.3 | **517.4** |
| Seaquest | 5.6 | 88.9 | 53.1 |
| Asterix | 25.8 | 55.2 | 53.2 |

출처: [Sparks 블로그 MinAtar 표](https://rikiyat.github.io/blog/weight-space-programming/). Breakout에서는 PPO@500M(25.3) 대비 약 20배.

- **9×9 Go** (약 1.48M 파라미터) — 컨텍스트에 안 들어가므로 Python 샌드박스 + **예산형 포워드 패스**(0~50). 0 패스에도 작은 PPO를 절반 이상 이기고, 50 패스면 동일 크기 PPO(2천만 게임)를 이겼다고 보고합니다.

#### 스케일업: 아첨·수학 편집

**아첨(sycophancy).** Gemma 3 270M 두 복사본을 동일 절차로 파인튜닝하되 하나는 정답, 하나는 사용자 제안을 따르게 하고, 임베딩·출력층은 동결했습니다. **가중치만**으로는 네 번 모두 구분 실패. **어텐션 패턴**(자체 작성 텍스트에서 헤드가 어디를 보는지)을 허용하자 세 쌍 모두에서 아첨 모델을 골랐습니다. 예: 헤드 10.2가 정답 위치에서 질문 숫자 대신 사용자 답을 봄(honest 0.75% vs sycophant 85.7%).

**Qwen3.5-0.8B 수학 개선 (Experiment 8).** 사고(thinking) 모드, 포워드 패스 예산 10/25/50. Astra는 모델 카드가 경고한 **thinking loop**를 층 15·19 MLP가 쓰는 한 방향으로 추적하고, 각층 `down_proj` 출력 열 64개에서 그 방향을 빼 **131,072** 가중치(**0.016%**)만 바꿨습니다.

| Qwen3.5-0.8B | MATH-500 (%) | GSM8K (%) | IFEval (%) | Hit token limit (%) |
| --- | ---: | ---: | ---: | ---: |
| Base | 7.9 | 13.8 | 21.0 | 93.0 |
| Edited, 10 forward passes | 12.3 | 25.7 | 49.0 | 87.2 |
| Edited, 25 forward passes | 14.1 | 25.1 | 39.9 | 86.4 |
| Edited, 50 forward passes | **48.1** | **67.1** | **62.3** | **33.1** |

출처: Sparks 블로그 표 · HF 모델 카드(동일 수치). 편집 체크포인트: [RikiyaT/Qwen3.5-0.8B-weight-space-programming](https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming). HF 카드는 독립 재실행으로 MATH-500 **51.0%**(토큰 한도 31.6%)도 보고하지만, 본문의 1차 인용은 블로그 표(48.1 / 67.1 / 62.3 / 33.1)를 기준으로 합니다.

**한계 — Gemma 3 270M.** 루프가 거의 없는(한도 도달 8.5%) 모델에서는 산술·대수 오류만 보였고, 단일 성분을 끄듯 고칠 수 없었습니다. MATH-500은 대략 **6.8%** 대에 머물렀습니다.

| Gemma 3 270M | MATH-500 (%) |
| --- | ---: |
| Base | 6.8 |
| Edited, 5 / 10 / 25 / 50 forward passes | 7.0 / 7.6 / 7.7 / 7.0 |

블로그 문장 그대로: 편집은 **능력을 가로막던 장애물을 제거**할 수는 있어도, **없던 능력을 추가**하지는 못했습니다.

### 임상 감사: Weight-space programming for auditing clinical decision networks

[arXiv:2611.05341](https://arxiv.org/abs/2611.05341) (Humza Nusrat, Omar Nusrat; 2026-11-03). 두경부 방사선치료 계획 요청을 네 규칙(커버리지/핫스팟, 하악, 척수, 누락 구조)으로 스크리닝하는 **소형** 결정 네트워크(파라미터 **433–4,801**)에 심어 둔 결함(혼동, 척수 임계값 3 Gy 이동, 숨은 트리거)을 **Claude Opus 5.5**가 프로토콜·원시 가중치만으로 감사·수리합니다. 도구·데이터·코드 실행 없음. 코드·답변: [hnusrat1/weightspace-rt](https://github.com/hnusrat1/weightspace-rt) (API 2026-11-07: ★1, license MIT).

검증된 핵심 수치(초록·본문·Table 2):

- 결함 네트워크 **18**개 중 **16**개에서 깨진 규칙을 지목(95% CI 67%–97%). 혼동·임계값 이동 **15/15** 포함.
- 수리 시 변경 파라미터 **중앙값 3**(범위 1–53). 파인튜닝은 거의 모든 파라미터를 바꿈.
- 건강한 네트워크를 **안정적으로 인증(clear)** 하지는 못함 — 감사 도구로 쓰려면 이 한계가 더 중요하다고 저자들이 강조.
- **프로토콜 대비 테스트**·블랙박스 테스트가 같은 결함을 **더 빨리** 찾음. WSP의 가산점은 소량 수리와 메커니즘 서술.

결론 문장(논문 V): 작은 네트워크에서 입력을 무시하거나 임계값을 이동시키는 결함은 찾고 고칠 수 있지만, **아직 네트워크가 올바르다고 인증할 수는 없다**.

### 하네스: PyPI `weightspace`

Sparks 결과를 “재현용 하네스”로 묶은 패키지입니다. 논문 결과 자체가 아니라, 꽂는 LLM에 따라 성능이 달라진다고 README가 명시합니다.

| 항목 | 값 (2026-11-07 조회) |
| --- | --- |
| PyPI | [weightspace](https://pypi.org/project/weightspace/) **v0.3.0** (2026-11-03 업로드), License **Apache-2.0**, Python ≥3.10 |
| GitHub | [leofmarciano/weightspace](https://github.com/leofmarciano/weightspace) ★**12**, forks 4 |
| 태스크 | `read` / `fix` / `write` / `improve` |
| 도구 | 텐서 슬라이스 읽기·설명(SVD 등), 가중치 위 Python 샌드박스, 체크포인트·롤백, **예산형 probe(포워드)** |

API 스케치(패키지 README 그대로의 형태):

```python
import torch
import weightspace as wsp

model = ...  # any torch.nn.Module

@wsp.probe
def accuracy():
    """Per-class accuracy on a held-out batch."""
    with torch.no_grad():
        pred = model(x_val).argmax(-1)
    return {c: float((pred[y_val == c] == c).float().mean()) for c in range(4)}

res = wsp.fix(
    model,
    "The classifier never predicts class 3. Find out why and fix it.",
    llm="openai:gpt-5",
    context="Linear(2->16) -> ReLU -> Linear(16->4); ...",
    probes=[accuracy],
    forward_budget=3,
)
res.save("runs/fix")  # transcript.jsonl, result.json, patch.npz
```

같은 패턴으로 `wsp.read` / `wsp.write` / `wsp.improve`가 있고, HF 모델은 `WeightSpace.from_hf(...)`로 올립니다. README의 Exp.8 재현 표는 샘플링·thinking on/off에 따라 점수가 달라진다고 경고하며, “루프를 줄이는 편집 ≠ 수학 실력 추가”를 블로그와 같은 방향으로 정리합니다.

보조 저장소(별도 검증, 수치 인용 최소): [vukrosic/llm-weight-editing](https://github.com/vukrosic/llm-weight-editing) ★9, [csinva/weight-space-programming-autoresearch](https://github.com/csinva/weight-space-programming-autoresearch) ★35 (API 2026-11-07).

### PLaMo お嬢様言葉 일화 — 대비

북마크가 가리킨 바이럴 주장은 **WSP로 PLaMo 3 Translate가 お嬢様言葉를 말하게 됐다**는 쪽입니다. 대조 결과:

1. [@rizumita](https://x.com/rizumita/status/2118356330037817773) 본문이 「っぽい」「直接確認できてない」— **독립 검증이 아님**.
2. PFN 공식·HF 카드: 일본어 `form`은 **常体(`plain`) / 敬体(`polite`)** 만. [PFN 블로그](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release)도 “常体/敬体の指定”, HF README: “plain and polite style for Japanese output”.
3. [Conao3 노트(2026-11-05)](https://s.conao3.com/blog/2026/33d2c2): `form=ojousama` / `お嬢様言葉` / context·few-shot까지 시도해도 2B·8B에서 お嬢様言葉·関西弁 출력이 **나오지 않음**. `form=polite`로 상체→경체 재작성만 확인.

따라서 이 일화는 **검증된 WSP 성공 사례로 취급하지 않습니다**(팩트 체크 ⚠️).

## 비즈니스 인사이트

숫자·제품 서술은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다. 펀딩·매출·기업 가치·토큰 단가는 invent 하지 않습니다.

**해석 가능성과 파인튜닝 벤더의 경계.** 기존에 “모델 고치기” 시장은 (1) 데이터+SFT/DPO/RLHF 파이프라인, (2) 방향 제거·머지·양자화 같은 **가중치 연산 툴**, (3) 회로·피처를 사람이 읽는 mechanistic interpretability로 갈라져 있었습니다. WSP는 (2)+(3)을 **프론티어 LLM 에이전트**로 묶으려는 시도입니다(Sparks “What Comes Next?”, weightspace README). **분석/의견.** 단기적으로는 “전체 재학습을 대체”하기보다 **감사·루프 제거·소형 정책 수리**처럼 *장애물 제거* 니치에 먼저 붙을 가능성이 큽니다. Gemma 실험이 보여 주듯 **능력 추가**는 아직 약합니다.

**누가 이득을 보나 / 누가 덜 맞나.** (1) 소형·규칙 기반 임상·제어 네트워크를 커미셔닝하는 팀 — 논문이 보여 준 중앙값 3파라미터 수리는 재학습보다 감사 추적에 유리합니다(arXiv:2611.05341). (2) 루프·거부·특정 방향처럼 **국소 장애**가 있는 SLM을 고치는 연구·제품팀 — Exp.8·HF 데모. (3) “프롬프트 한 줄로 새 능력을 주입”을 기대하는 쪽 — **분석/의견.** Sparks·임상 논문 모두 한계를 크게 적어 두었고, 건강한 모델 인증·트리거 탐지·임상 스케일(수백만~수십억)은 미해결입니다. 풀 파인튜닝·합성 데이터 벤더는 당장 대체 대상이 아닙니다.

**비용 구조 (정성).** Sparks Exp.8은 **포워드 패스 예산**(예: 50회, 배치 최대 512) + 편집 LLM 추론 비용이지, MATH/GSM8K 전체 재학습이 아닙니다. 임상 논문은 같은 결함을 프로토콜 테스트가 **1초 미만**에 가르고, 블랙박스는 2–3분·≤150 요청이라고 적습니다. WSP 감사는 수분~수십 분·수십만 출력 토큰이 나오기도 했습니다. **분석/의견.** “재학습 vs WSP”를 달러로 단정할 수는 없지만, **탐지**는 테스트가 싸고 **설명·최소 수리**가 WSP의 상품 후보일 가능성이 큽니다. weightspace의 `forward_budget`·`cost_budget`은 그 예산을 제품 변수로 고정하려는 설계로 읽힙니다.

**도입·리스크.** 공개 로그·HF 체크포인트·Apache-2.0 하네스가 있어 **재현 실험 진입**은 낮습니다. 다만 (1) 큰 가중치를 쓰면 FP16에서 오버플로(임상 논문), (2) 샌드박스는 보안 경계가 아님(weightspace README), (3) 바이럴 일화(PLaMo 문체)를 성공 사례로 섞으면 신뢰가 무너집니다. **분석/의견.** 규제·의료 맥락에서는 “WSP가 통과했다”를 단독 커미셔닝 근거로 쓰기보다, 프로토콜 테스트·형식 검증과 **병행**하는 쪽이 논문 결론과 맞습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·수사·출처가 다름 / ❌ 1차 자료와 어긋남

북마크([@63556poiuytrewq](https://x.com/63556poiuytrewq/status/2118633227191832588) → [@rizumita](https://x.com/rizumita/status/2118356330037817773))와 Sparks·arXiv·PyPI/GitHub·PLaMo 공식 자료를 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 프론티어 LLM이 원시 가중치만으로 ~17k 정책의 게임을 맞춘다 | ✅ | Sparks Exp.1: 17,253 가중치, 4게임 모두 맞춤. https://rikiyat.github.io/blog/weight-space-programming/ |
| Astra가 MinAtar 네트워크를 제로샷으로 써 PPO@100M을 이긴다 (Breakout 517.4 vs 15.8 등) | ✅ | 블로그 표: Breakout 15.8/25.3/**517.4**, Seaquest 5.6/88.9/53.1, Asterix 25.8/55.2/53.2 |
| Qwen3.5-0.8B 편집: MATH-500 7.9→48.1, GSM8K 13.8→67.1, IFEval 21.0→62.3 | ✅ | 블로그·HF 카드 동일 표. https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming |
| 편집량은 131,072 가중치 = 0.016%, 토큰 한도 적중 93%→33%(50 포워드) | ✅ | 블로그: 93.0→33.1. 층 15·19 `down_proj` 64열 |
| Gemma 3 270M 수학 편집은 능력 추가에 실패(~6.8% 정체) | ✅ | 표 Base 6.8, 편집 후 7.0–7.7. “could not add an ability” |
| 아첨 탐지: 가중치만으로는 실패, 어텐션 패턴으로는 성공 | ✅ | Sparks “Which language model is sycophantic?” |
| 임상 네트워크 433–4801 파라미터, Opus 5.5가 18개 중 16개 결함 규칙 지목, 중앙값 3파라미터 수리 | ✅ | arXiv:2611.05341 초록·Table 2 |
| 건강한 네트워크를 아직 안정적으로 인증하지 못함; 프로토콜 테스트가 더 빠름 | ✅ | 논문 결론·Discussion |
| weightspace는 Apache-2.0, read/fix/write/improve, 예산형 probe | ✅ | PyPI v0.3.0 · GitHub LICENSE Apache-2.0 · README 태스크 4종. ★12 (API 2026-11-07) |
| (북마크) WSP로 PLaMo 3 Translate가 お嬢様言葉를 말한다 | ⚠️ | 원저자 미검증 일화. 공식 `form`은 plain/polite만. Conao3: ojousama 프롬프트 실패. **증명된 WSP 성공으로 보지 않음** |
| (확장) WSP가 임의 대규모 LM에 새 능력을 주입한다 | ❌ | Gemma 실패·Sparks 한계·임상 “cannot yet certify”와 배치. 장애물 제거 ≠ 능력 추가 |
| (확장) 임상 규모(수백만+ 파라미터 이미징/에이전트)에서 동일 절차가 검증됐다 | ❌ | 논문 Limitations: 433–4801, 합성 요청, 임상 스케일은 future work |

**총평:** “LLM이 가중치를 직접 읽고 소량 편집해 소형 정책·루프 장애를 고친다”는 Sparks·임상 논문·하네스의 핵심은 1차 자료와 맞습니다. 북마크의 PLaMo 문체 일화는 **⚠️ 미검증 가십**으로 분리하고, “무엇이든 프롬프트로 심는다”는 확장 주장은 ❌입니다.

## 참고 자료

- Sparks 블로그 — [Sparks of Weight-Space Programming](https://rikiyat.github.io/blog/weight-space-programming/) (Takehi, Teoh, Zhang, Khattab; MIT CSAIL; 2026-11-02)
- 실험 로그 — [RikiyaT/lm_understand-logs](https://github.com/RikiyaT/lm_understand-logs) (API ★1066 / forks 142, 2026-11-07 09:14 KST)
- 편집 Qwen — [RikiyaT/Qwen3.5-0.8B-weight-space-programming](https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming)
- 임상 논문 — [arXiv:2611.05341](https://arxiv.org/abs/2611.05341) · [hnusrat1/weightspace-rt](https://github.com/hnusrat1/weightspace-rt) (MIT, ★1)
- 하네스 — [PyPI weightspace v0.3.0](https://pypi.org/project/weightspace/) · [leofmarciano/weightspace](https://github.com/leofmarciano/weightspace) (Apache-2.0, ★12)
- 보조 — [vukrosic/llm-weight-editing](https://github.com/vukrosic/llm-weight-editing) ★9 · [csinva/weight-space-programming-autoresearch](https://github.com/csinva/weight-space-programming-autoresearch) ★35
- PLaMo 공식 — [PFN: PLaMo 3 Translate 重み公開](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release) · HF `pfnet/plamo-3-translate-*` (`form`: plain/polite)
- Conao3 — [plamo-tr-local / form=ojousama 실패 기록](https://s.conao3.com/blog/2026/33d2c2) (2026-11-05)
- 관련 블로그(본 사이트) — [QwenFS](/posts/qwenfs-filesystem-in-llm-weights/), [Heretic 2](/posts/heretic-2-llm-abliteration/)

## 원문 X 링크

- 북마크(훅) — [@63556poiuytrewq](https://x.com/63556poiuytrewq/status/2118633227191832588) (id `2118633227191832588`)
- 링크된 일화 — [@rizumita](https://x.com/rizumita/status/2118356330037817773)
