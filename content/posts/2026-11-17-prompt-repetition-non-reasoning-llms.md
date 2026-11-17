---
title: "프롬프트를 두 번 붙이면 정말 정확해질까? Google Research 'Prompt Repetition' 논문 팩트 체크"
date: 2026-11-17
time: "09:27"
slug: prompt-repetition-non-reasoning-llms
tags: [LLM, 프롬프트엔지니어링, 어텐션, Google Research, 팩트체크]
summary: "추론을 끈 7개 모델·70개 조합에서 프롬프트 반복은 47승 0패였다. 다만 입력 토큰은 두 배이고, step-by-step 추론을 켜면 28개 중 5승 1패 22무로 거의 효과가 사라진다."
---

> 이 글은 제가 X에서 북마크해 둔 [@EngMoElgaraihy의 포스트](https://x.com/EngMoElgaraihy/status/2122182283847180329)를 계기로 썼습니다. 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2122182283847180329)(`code` 200)으로 읽었고, `created_at`은 `Mon Nov 16 04:17:39 +0000 2026`, 즉 **2026-11-16 13:17 KST**입니다. 본문은 아랍어이고, "구글이 모델이나 도구를 바꾸지 않고도 AI를 훨씬 정확하게 만드는 간단한 요령을 공개했다: 프롬프트 전체를 연달아 두 번 복사하라"는 내용입니다. 그 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 포스트는 출처 논문을 링크하지 않습니다. 내용(7개 벤치마크, 7개 모델, 21%→97%)이 일치하는 1차 자료는 Google Research의 Yaniv Leviathan, Matan Kalman, Yossi Matias가 쓴 [**Prompt Repetition Improves Non-Reasoning LLMs** (arXiv:2512.14982)](https://arxiv.org/abs/2512.14982)입니다. arXiv 기준 v1만 있고, 제출일은 **2025-12-17**입니다. 아래 숫자는 모두 이 논문 v1 본문과 부록에서 옮겼습니다. 저는 논문의 실험을 다시 돌리지 않았습니다.

## 왜 중요한가

프롬프트 엔지니어링 요령은 대부분 "출력을 늘려서" 성능을 삽니다. "Think step by step" 같은 기법은 정확도를 올리지만, 생성 토큰이 늘어 지연과 비용이 같이 늘어납니다. 논문도 관련 연구 절에서 이 점을 짚습니다.

이 논문이 주장하는 것은 방향이 반대입니다. **입력만** 두 배로 늘리고, 출력 길이와 형식은 그대로 두는데 정확도가 오른다는 겁니다. 입력 처리(prefill)는 병렬로 계산되기 때문에, 출력 토큰을 늘리는 기법보다 지연이 덜 늘어난다는 설명입니다.

개발자 입장에서 매력적인 이유는 세 가지입니다.

- **드롭인**: 출력 형식이 바뀌지 않으니, 파서나 후처리 코드를 건드리지 않고 기존 시스템에 끼울 수 있다고 논문은 적습니다.
- **모델 무관**: Gemini, GPT, Claude, DeepSeek 계열 7개 모델 모두에서 개선이 있었다고 합니다.
- **0패**: 통계적으로 유의한 차이를 기준으로, 추론을 끈 조건에서 진 조합이 하나도 없었습니다.

반대로 확인해야 할 질문도 분명합니다.

- "추론을 끈" 조건이 정확히 무엇이고, 요즘 기본이 된 추론 모델에도 통하는가.
- "추가 비용 0"이 맞는가. 입력 토큰이 두 배인데.
- 21%→97%는 어떤 과제의 숫자인가.

## 기술 설명

### 왜 반복이 도움이 되나: 인과 어텐션의 비대칭

대부분의 LLM은 인과(causal) 언어 모델로 학습됩니다. 각 토큰은 **자기보다 앞에 있는 토큰만** 볼 수 있고, 뒤의 토큰은 볼 수 없습니다. 논문 1절이 출발점으로 삼는 것이 이 비대칭입니다. 그래서 같은 내용이라도 토큰 순서에 따라 성능이 달라집니다.

논문의 예는 객관식 문제입니다.

- **question-first**: `질문 → 보기` 순서. 보기를 읽을 때 이미 질문을 알고 있습니다.
- **options-first**: `보기 → 질문` 순서. 보기 토큰을 처리하는 시점에는 질문이 아직 컨텍스트에 없습니다.

프롬프트를 `<QUERY>`에서 `<QUERY><QUERY>`로 바꾸면, 두 번째 사본의 모든 토큰은 첫 번째 사본 **전체**에 어텐션할 수 있습니다. 논문은 이것을 "각 프롬프트 토큰이 다른 모든 프롬프트 토큰에 어텐션할 수 있게 된다"고 표현합니다. 엄밀히 말하면 첫 사본의 토큰은 여전히 뒤를 못 보지만, 두 번째 사본은 "질문을 이미 본 상태에서 보기를 다시 읽는" 효과를 냅니다.

```
baseline:   [보기 A B C D][질문]              ← 보기 토큰은 질문을 못 봄
repetition: [보기 A B C D][질문][보기 A B C D][질문]
                                  └─ 이 보기 토큰들은 앞의 질문을 볼 수 있음
```

논문은 추가 동기로, RL로 학습된 추론 모델이 사용자 요청(의 일부)을 되풀이해 말하는 경향을 관찰했다고 적습니다. 프롬프트 반복은 그 되풀이를 **생성 단계가 아니라 병렬 prefill 단계로 옮기는** 셈이라는 해석입니다.

### 논문이 실제로 잰 것

| 항목 | 내용 (논문 2절, 부록) |
| --- | --- |
| 모델 (7) | Gemini 2.0 Flash, Gemini 2.0 Flash Lite, GPT-4o-mini, GPT-4o, Claude 3 Haiku, Claude 3.7 Sonnet, DeepSeek V3 |
| 실행 방식 | 각 사 공식 API, **2025년 2~3월** |
| 벤치마크 (7) | ARC(Challenge), OpenBookQA, GSM8K, MMLU-Pro, MATH, 그리고 자체 과제 NameIndex, MiddleMatch |
| 객관식 배치 | ARC·OpenBookQA·MMLU-Pro는 question-first와 options-first 둘 다 |
| 승패 기준 | McNemar 검정 p < 0.1이면 승 |

핵심 결과는 다음과 같습니다.

- **추론을 끈 조건(모델에게 추론하지 말라고 요청)**: 70개 벤치마크×모델 조합 중 **47승 0패**. 모든 모델에서 개선.
- question-first 객관식에서는 개선이 작고, options-first에서는 크다. 위의 인과 어텐션 설명과 맞는 방향입니다.
- 자체 과제 NameIndex·MiddleMatch에서는 모든 모델이 크게 개선. 예: **Gemini 2.0 Flash-Lite의 NameIndex 정확도 21.33% → 97.33%**.
- **step-by-step 추론을 요청한 조건**: 28개 조합 중 **5승 1패 22무**, "중립에서 약간 긍정". 추론 과정이 이미 프롬프트를 되풀이하는 경우가 많기 때문이라고 논문은 해석합니다.

NameIndex는 이름 50개 목록을 주고 25번째 이름을 묻는 과제이고, MiddleMatch는 반복이 섞인 40개 목록에서 두 항목 "사이"에 있는 항목을 묻는 과제입니다. 논문은 이 두 과제를 "프롬프트 반복의 유용성을 보여 주도록 특별히 설계했다"고 명시합니다.

### 변형과 대조군

부록 A.4의 템플릿은 다음과 같습니다.

| 방법 | 템플릿 |
| --- | --- |
| Baseline | `<QUERY>` |
| Prompt Repetition | `<QUERY><QUERY>` |
| Verbose | `<QUERY> Let me repeat that: <QUERY>` |
| ×3 | `<QUERY> Let me repeat that: <QUERY> Let me repeat that one more time: <QUERY>` |
| Padding | `<QUERY> Ignore these periods (they are irrelevant) and answer the above question: ....` (반복과 같은 길이까지 마침표) |

- Verbose와 ×3은 대부분 과제에서 기본 반복과 비슷했고, ×3은 NameIndex·MiddleMatch에서 기본 반복보다 크게 나은 경우가 많았다고 합니다.
- **Padding**은 입력 길이만 맞추고 내용은 반복하지 않는 대조군인데, 성능이 오르지 않았습니다. 이득이 "입력이 길어져서"가 아니라 "내용을 다시 봐서"라는 근거입니다.

### 지연과 출력 길이

논문은 모델·방법·데이터셋별로 출력 길이의 평균·중앙값과 엔드투엔드 지연을 쟀습니다.

- 반복과 그 변형은 **출력 길이와 측정 지연을 늘리지 않았습니다.**
- **예외**: Anthropic 모델(Claude Haiku, Sonnet)에서 아주 긴 요청(NameIndex, MiddleMatch, 또는 ×3 변형)일 때 지연이 늘었습니다. 논문은 prefill이 길어졌기 때문으로 추정합니다.
- 지연은 공식 API로 쟀기 때문에 네트워크나 부하의 영향을 받을 수 있어 "가감해서 보라"고 저자들이 직접 적습니다.
- 결론 절 각주: 긴 프롬프트에서는 지연에 영향이 있을 수 있고, **아주 긴 프롬프트에서는 불가능할 수도 있다**(컨텍스트 한도).

### 코드: 반복 래퍼와 A/B 테스트

아래는 OpenAI Python SDK 예시입니다. 다른 SDK도 메시지 문자열만 바꾸면 같습니다. 모델 이름은 자리표시자입니다.

```python
from openai import OpenAI

client = OpenAI()

def build_prompt(query: str, mode: str = "baseline") -> str:
    """논문 부록 A.4의 템플릿을 그대로 옮긴 것."""
    if mode == "baseline":
        return query
    if mode == "repeat":
        return f"{query}\n{query}"
    if mode == "verbose":
        return f"{query}\nLet me repeat that:\n{query}"
    if mode == "x3":
        return (f"{query}\nLet me repeat that:\n{query}\n"
                f"Let me repeat that one more time:\n{query}")
    raise ValueError(mode)

def ask(query: str, mode: str = "baseline", model: str = "YOUR_MODEL") -> tuple[str, dict]:
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": build_prompt(query, mode)}],
        temperature=0,
    )
    u = resp.usage
    return resp.choices[0].message.content, {
        "input_tokens": u.prompt_tokens,
        "output_tokens": u.completion_tokens,
    }
```

논문은 사본 사이에 구분자를 넣지 않은 `<QUERY><QUERY>`를 기본으로 씁니다. 위 코드는 가독성을 위해 줄바꿈 하나를 넣었는데, 이것이 결과에 영향을 주는지는 논문이 따로 다루지 않으니 여러분의 A/B에서 함께 확인하면 됩니다.

A/B는 **같은 문항**에 두 방식을 모두 돌리는 짝지은(paired) 설계가 맞습니다. 논문이 쓴 McNemar 검정은 "한쪽만 맞힌" 문항 수만 봅니다.

```python
from scipy.stats import binomtest

def ab_test(dataset, is_correct, model="YOUR_MODEL"):
    """dataset: [(query, gold), ...], is_correct(answer, gold) -> bool"""
    b = c = 0            # b: repeat만 정답, c: baseline만 정답
    tok = {"baseline": 0, "repeat": 0}
    for query, gold in dataset:
        ok = {}
        for mode in ("baseline", "repeat"):
            ans, usage = ask(query, mode, model)
            ok[mode] = is_correct(ans, gold)
            tok[mode] += usage["input_tokens"]
        if ok["repeat"] and not ok["baseline"]:
            b += 1
        elif ok["baseline"] and not ok["repeat"]:
            c += 1
    # exact McNemar = 불일치 쌍에 대한 이항 검정
    p = binomtest(b, b + c, 0.5).pvalue if b + c else 1.0
    print(f"repeat-only={b}, baseline-only={c}, p={p:.3f}")
    print(f"input tokens: baseline={tok['baseline']}, repeat={tok['repeat']}")
```

실전 팁(의견):

- 시스템 프롬프트, 퓨샷 예시, 문서, 질문 중 **무엇을** 반복할지도 변수입니다. 논문은 "프롬프트 전체"를 반복했고, 일부만 반복하는 것은 향후 과제로 남겼습니다. 관련 연구로 질문만 반복했을 때 이득이 없었다는 [Shaier (2024)](https://arxiv.org/abs/2412.07923)를 인용합니다.
- 추론 모드(혹은 thinking 예산)가 켜진 모델이라면 효과가 작을 가능성이 높으니, 먼저 꺼진 경로(분류, 추출, 라우팅 같은 짧은 응답)에서 시험해 보는 편이 낫습니다.
- 입력 토큰 사용량을 같이 기록하세요. 정확도 개선이 비용 증가를 정당화하는지가 결국 의사결정입니다.

### 한계와 주의점

- **모델이 낡았습니다.** 실험은 2025년 2~3월의 API로 Gemini 2.0, GPT-4o, Claude 3.x, DeepSeek V3에 대해 했습니다. 지금 쓰는 모델에서 같은 크기의 효과가 난다는 보장은 없습니다.
- **"추론 없음"은 프롬프트로 정한 조건입니다.** 그림 1은 "모델에게 추론하지 말라고 요청했을 때", 그림 4는 "step by step으로 생각하라고 요청했을 때"입니다. 내장 추론(o-시리즈, thinking 모드 등)을 켠 모델을 따로 시험한 것은 아닙니다.
- **극적인 숫자는 맞춤 과제에서 나왔습니다.** 21%→97%는 반복의 효과를 보이도록 설계한 NameIndex 과제입니다. 표준 객관식 question-first에서는 개선이 작다고 저자들이 직접 적습니다.
- **승은 p < 0.1 기준입니다.** 흔히 쓰는 0.05보다 느슨합니다.
- **긴 문서**: 논문의 과제는 대체로 짧습니다. 긴 문서 RAG 같은 설정은 직접 측정되지 않았고, 저자들은 긴 프롬프트에서 지연 영향과 컨텍스트 한도 문제를 언급합니다.
- **멀티턴, 멀티모달**은 향후 과제로 남겨져 있습니다.

## 비즈니스 인사이트

### 누가 이득을 보나 (분석)

- **추론을 끄고 쓰는 저지연·대량 경로**가 가장 직접적인 수혜자입니다. 분류, 태깅, 추출, 라우팅처럼 짧은 답을 많이 뽑는 파이프라인은 출력 토큰을 늘리는 CoT를 쓰기 어렵습니다. 출력 형식이 그대로라는 논문의 결과는 이런 경로에 "코드 한 줄로 시험해 볼 수 있는" 선택지를 줍니다.
- **작은 모델을 쓰는 팀**: 논문의 가장 큰 개선 예가 Gemini 2.0 Flash-Lite였습니다. 의견이지만, 큰 모델로 올리는 대신 작은 모델에 반복을 붙여 보는 실험은 비용 면에서 해 볼 만합니다. 단, 이것이 모델 업그레이드를 대체한다는 근거는 논문에 없습니다.
- **추론 모델 중심 제품**은 얻을 것이 적습니다. step-by-step 조건에서 28개 중 22개가 무승부였습니다.

### 비용: "$0"은 아니다

X 포스트는 "추가 비용 $0"이라고 하지만, API는 입력 토큰으로 과금합니다. 프롬프트를 두 번 보내면 **입력 토큰이 대략 두 배**가 되고, 그만큼 입력 비용이 늘어납니다(×3이면 세 배). 출력 토큰이 늘지 않는다는 것은 논문의 측정과 일치하지만, 그것이 총비용 불변을 뜻하지는 않습니다.

프롬프트 캐싱이 이 부담을 일부 덜 수 있는지는 구조에 달렸습니다.

- [OpenAI 문서](https://platform.openai.com/docs/guides/prompt-caching)는 캐싱이 **같은 접두사(prefix)**를 공유하는 요청 사이에서 작동하고, 캐시된 입력 요금이 최대 95%까지 할인된다고 적습니다. 최소 캐시 길이는 GPT-5.6 이후 모델 기준 1,024토큰입니다.
- [Anthropic 문서](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)는 캐시 읽기를 기본 입력 단가의 0.1배, 5분 TTL 캐시 쓰기를 1.25배, 1시간 TTL 쓰기를 2배로 적습니다.

분석: 캐싱은 "요청 사이에서 같은 앞부분"을 재사용하는 장치이지, 한 요청 안의 두 번째 사본을 공짜로 만들어 주지 않습니다. 고정된 시스템 프롬프트나 문서를 반복 대상으로 삼고 그 반복된 블록이 요청마다 동일하다면 캐시 적중을 기대할 수 있지만, 질문이 매번 바뀌는 `<QUERY><QUERY>` 구조에서는 바뀐 첫 토큰 이후가 캐시되지 않습니다. 논문의 향후 과제 (4) "두 번째 사본만 KV 캐시에 남기기"는 이 비용을 생성 단계에서 줄이는 방향이지만, 상용 API에서 쓸 수 있는 기능은 아닙니다.

또 하나: OpenAI 문서는 캐시된 입력 토큰도 분당 토큰(TPM) 한도에 포함된다고 적습니다. 반복은 처리량 한도를 두 배로 빨리 소진시킬 수 있습니다.

### 경쟁 구도 (의견)

이 요령은 특정 벤더의 기능이 아니라 인과 어텐션이라는 구조에서 나오므로, 모든 벤더 모델에 똑같이 적용할 수 있습니다. 그래서 경쟁 우위가 되기보다는, 벤더가 내부적으로 흡수할 가능성이 큰 종류의 기법이라고 봅니다. 논문의 향후 과제에도 "반복된 프롬프트로 파인튜닝", "반복 상태로 추론 모델 학습"이 있습니다. 모델이 이런 효과를 학습으로 흡수하면, 사용자 쪽 반복의 한계 효용은 줄어들 것입니다. 실제로 추론 모드에서는 이미 효과가 거의 없었습니다.

### 도입 체크리스트 (의견)

1. 추론이 꺼진 경로만 골라 A/B한다.
2. 짝지은 설계 + McNemar로 유의성을 본다.
3. 정확도 개선 1%p당 늘어나는 입력 비용, TPM 사용량, p95 지연을 같이 본다. 특히 긴 프롬프트와 Claude 계열에서 지연을 확인한다(논문의 예외).
4. 모델 버전이 바뀔 때마다 다시 잰다.

## 팩트 체크

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| "구글이 공개했다" | ⚠️ | 저자 3명 모두 Google Research 소속이지만, 회사 공식 발표가 아니라 arXiv 프리프린트(2025-12-17, v1)입니다. 동료 심사 여부는 arXiv 페이지에 적혀 있지 않습니다. [arXiv:2512.14982](https://arxiv.org/abs/2512.14982) |
| 프롬프트 전체를 연달아 두 번 넣는다 | ✅ | 부록 A.4 템플릿이 `<QUERY><QUERY>`입니다. [논문](https://arxiv.org/abs/2512.14982) |
| 모델·도구 변경 없이 정확도가 오른다 | ✅ (조건부) | 추론을 끈 조건에서 70개 중 47승 0패. 단, 추론 요청 조건에서는 28개 중 5승 1패 22무입니다. X 포스트는 이 조건을 적지 않습니다. [논문 그림 1·4, 부록 A.2](https://arxiv.org/abs/2512.14982) |
| "놀라울 정도로/엄청난 정확도 향상" | ⚠️ | 표준 객관식 question-first에서는 개선이 작다고 저자들이 직접 적습니다. 큰 개선은 options-first와 자체 과제에서 납니다. [논문 2절](https://arxiv.org/abs/2512.14982) |
| 7개 벤치마크, 7개 모델 | ✅ | ARC, OpenBookQA, GSM8K, MMLU-Pro, MATH, NameIndex, MiddleMatch / Gemini 2.0 Flash·Flash Lite, GPT-4o·4o-mini, Claude 3 Haiku·3.7 Sonnet, DeepSeek V3. [논문 2절](https://arxiv.org/abs/2512.14982) |
| "복잡한 정보 추출 과제"에서 21% → 97% | ⚠️ | 숫자는 맞습니다(Gemini 2.0 Flash-Lite, NameIndex 21.33% → 97.33%). 하지만 이 과제는 이름 50개 중 25번째를 묻는, 반복의 효과를 보이도록 **특별히 설계한** 자체 과제이고, 한 모델의 한 과제 결과입니다. [논문 2절, 부록 A.3](https://arxiv.org/abs/2512.14982) |
| 질문을 문서 끝에 두면 모델이 목표를 모른 채 문서를 읽는다 | ✅ (원리) / ⚠️ (적용) | 인과 어텐션 설명은 논문과 일치합니다. 다만 논문은 긴 문서 설정을 직접 재지 않았고, 긴 프롬프트에서는 지연 영향이나 컨텍스트 한도 문제가 있을 수 있다고 적습니다. [논문 1·4절](https://arxiv.org/abs/2512.14982) |
| 추가 비용 $0 | ❌ | 입력 토큰이 대략 두 배가 되어 입력 비용이 늘어납니다. 논문이 "늘지 않는다"고 한 것은 **출력** 토큰과 지연입니다. 입력 과금 구조는 [OpenAI](https://platform.openai.com/docs/guides/prompt-caching), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) 캐싱 문서 참고. |
| 눈에 띄는 응답 지연 증가 없음 | ⚠️ | 대부분 맞지만, Claude Haiku·Sonnet에서 아주 긴 요청일 때 지연이 늘었다는 예외가 논문에 있습니다. [논문 2절 Efficiency](https://arxiv.org/abs/2512.14982) |
| 출력 토큰 증가 없음 | ✅ | 모든 경우에서 출력 길이가 늘지 않았습니다. [논문 2절, 그림 2·3](https://arxiv.org/abs/2512.14982) |
| 재학습·파인튜닝 불필요 | ✅ | 공식 API에 프롬프트만 바꿔 보냈습니다. [논문 2절](https://arxiv.org/abs/2512.14982) |
| 단순히 입력이 길어져서 생기는 효과다 | ❌ (반박됨) | X 포스트의 주장은 아니지만 흔한 반론이라 확인했습니다. 같은 길이로 마침표를 채운 Padding은 성능을 올리지 않았습니다. [논문 2절](https://arxiv.org/abs/2512.14982) |

## 참고 자료

- Leviathan, Kalman, Matias. [Prompt Repetition Improves Non-Reasoning LLMs](https://arxiv.org/abs/2512.14982), arXiv:2512.14982, 2025-12-17. [PDF](https://arxiv.org/pdf/2512.14982v1)
- Shaier. [Asking Again and Again: Exploring LLM Robustness to Repeated Questions](https://arxiv.org/abs/2412.07923), 2024 (질문만 반복 → 이득 없음, 논문이 인용)
- Springer et al. [Repetition Improves Language Model Embeddings](https://arxiv.org/abs/2402.15449), 2024 (입력 반복 → 임베딩 개선, 논문이 인용)
- Xu et al. [Re-Reading Improves Reasoning in Large Language Models](https://arxiv.org/abs/2309.06275), 2024 (다시 읽기 요청 → 추론 개선, 논문이 인용)
- Kojima et al. [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916) ("Let's think step by step")
- [OpenAI Prompt caching 가이드](https://platform.openai.com/docs/guides/prompt-caching)
- [Anthropic Prompt caching 문서](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- 원본 X 포스트: [@EngMoElgaraihy](https://x.com/EngMoElgaraihy/status/2122182283847180329)
