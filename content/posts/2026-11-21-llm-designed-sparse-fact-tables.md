---
title: "1,800배는 0.94M 대 1.72B다: LLM이 쓴 표 팩트 체크"
date: 2026-11-21
time: "08:23"
slug: llm-designed-sparse-fact-tables
tags: [Weight-Space Programming, POSTECH, AI2 ARC, 팩트체크, 지식편집]
summary: "54.4%는 AI2 ARC 3,530문항에서 Claude Opus 5.5가 5세대에 쓴 3,349,538파라미터 표다. 1,800배는 1세대 0.94M을, 같은 LLM이 무작위 초기화에서 쓴 Qwen3-1.7B 1.72B로 나눈 값이다. 17배는 저자 forward의 연관기억 5세대이고, 54.4% 모델은 같은 크기 Transformer보다 90배 느리다."
---

> 이 글은 X 포스트 [2123716739347173682](https://x.com/ats/status/2123716739347173682)를 계기로 썼습니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2123716739347173682)(`code` 200)으로 읽었습니다. `created_at`은 `Fri Nov 20 09:55:02 +0000 2026`, **2026-11-20 18:55 KST**입니다. 계정은 ats, 표시 이름은 柴田 淳, 사용자 id `3524301`, 팔로워 6,355, `verification.type`은 `individual`입니다. 같은 응답의 스냅샷은 답글 2, 리포스트 28, 좋아요 118, 북마크 84, 인용 3, 조회 7,556이고 커뮤니티 노트는 `null`입니다. `is_note_tweet`은 true입니다. 응답의 `text`는 아래 문장입니다.
>
> AIに新しいAIを設計させたら、Transformerより最大1,800倍小さく、しかも高速なモデルが生まれた。さらに驚くべきことに、そのAIは「間違った知識だけを修正できる」という。
>
> 韓国・浦項工科大学の研究者らは、ClaudeやGPTなど3つの高性能LLMに、従来とは異なるニューラルネットワークの設計を任せた。すると3モデルとも、Transformerではなく、知識を表形式で保存・検索する構造を独立に考案した。
>
> 最良のモデルは約335万パラメータで、ARCベンチマークの正答率54.4%を達成。同規模のTransformerの29.8%を上回り、GPU推論では最大17倍の高速化も実現した。
>
> 興味深いのは、このモデルが従来のニューラルネットワークとは異なる学習方法を採用していることだ。
>
> 一般的なLLMは、誤差逆伝播と勾配降下法によって膨大なパラメータを調整する。そのため、微分可能で学習しやすい構造が重視されてきた。
>
> 一方、今回のモデルはLLMが知識を直接テーブルに書き込む。勾配降下法を前提としなければ、Attentionや深いネットワークに依存する必要もない。つまり、Transformerが主流なのは、それが知能にとって最適だからではなく、現在の学習方法に適しているからなのかもしれない。
>
> さらに、この仕組みには実用上の利点がある。
>
> 通常のLLMでは、知識が大量のパラメータに分散しているため、特定の誤りだけを修正するのは難しい。しかし、テーブル方式なら回答の根拠となる情報を特定し、必要な部分だけを書き換えられる。実験では、1行の削除が他の3,530件の予測に影響したのは約1件だった。
>
> 글 끝의 링크는 [emergent.sh의 기사](https://emergent.sh/news/llms-design-1-800x-smaller-models-beat)입니다. 이 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-21에 연 1차 자료입니다. 논문은 Hyunjong Ok, Jaeho Lee, [Weight-Space Programming Doesn't Need Transformers](https://arxiv.org/abs/2611.22055), arXiv:2611.22055v1입니다. arXiv API의 `published`는 `2026-11-17T01:33:13Z`(2026-11-17 10:33 KST)이고, 소속 줄은 Pohang University of Science and Technology (POSTECH), 메일은 `{hyunjong.ok, jaeho.lee}@postech.ac.kr`입니다. 본문 숫자는 같은 날의 [HTML](https://arxiv.org/html/2611.22055)과 PDF [2611.22055v1](https://arxiv.org/pdf/2611.22055v1)를 맞춰 읽었습니다. 저자 프로젝트 페이지는 [wsp-no-transformer.github.io](https://wsp-no-transformer.github.io/)이고, 코드와 공개 모델은 [effl-lab/Weight-Space-Programming](https://github.com/effl-lab/Weight-Space-Programming)(MIT, README가 POSTECH의 Ok와 Lee를 저자로 적음)입니다. 포항공과대학교 보도자료는 이 조회에서 찾지 못했습니다. 추론과 채점은 다시 돌리지 않았습니다. 같은 블로그의 [가중치를 직접 고치는 WSP 글](/posts/weight-space-programming/)은 Takehi 등의 2026-11-02 블로그를 다룹니다. 이 논문 1절과 9절이 그 글을 인용합니다.

## 왜 중요한가

Weight-space programming(WSP)은 큰 언어 모델이 다른 모델의 가중치를 경사하강 없이 직접 쓰는 설정입니다. 논문 1절은 Transformer가 잘 쓰인 이유를 경사하강과 GPU에서의 속도에 두고, 그 이유가 빠진 뒤에도 Transformer를 쓸지를 묻습니다.

개발자가 1,800배와 17배를 보기 전에 나눠야 할 질문은 다음입니다.

- 54.4%의 ARC가 Chollet의 ARC-AGI인가, Allen Institute의 과학 문항인가.
- 3.35M과 54.4%가 1,800배의 분자·분모인가.
- 17배가 그 54.4% 모델의 속도인가, 저자가 forward를 고정한 다른 모델인가.
- 비교 상대가 사전학습된 Qwen인가, 같은 LLM이 무작위 초기화 위에 쓴 Transformer인가, 크기를 맞춘 2층 Transformer인가.
- 한 줄을 지운 실험이 5세대 54.4% 모델인가, 1세대 평균인가.
- 오늘 받을 수 있는 저장소에 측정 코드가 있는가.

논문의 달력은 2026-11-20이 아닙니다. arXiv v1의 `published`는 2026-11-17입니다.

## 기술 설명

### 이 ARC는 과학 사지선다 3,530문항이다

2절은 평가 집합을 Clark 등(2018)의 ARC-Easy와 ARC-Challenge 시험 집합을 합친 사지선다 과학 문항 3,530개로 적습니다. 우연 정확도는 25%입니다. 저장소 README는 이 데이터를 Hugging Face의 `allenai/ai2_arc`(CC BY-SA 4.0)로 받으라고 적습니다. [ARC Prize](https://arcprize.org/arc-agi)가 설명하는 ARC-AGI는 2019년 François Chollet의 Abstraction and Reasoning Corpus이고, 유동 지능을 재기 위한 별도 벤치마크입니다. 이 논문의 표에 ARC-AGI라는 이름은 없습니다.

한 런에서 writer가 보는 ARC 훈련 문항은 Easy 5개와 Challenge 5개입니다. 시험 정확도는 샌드박스 안에서 보이지 않습니다. 계보(lineage)에서는 부모 모델과 부모의 검증 정확도 하나가 다음 세대로 갑니다. 검증 집합은 862문항이고, 시험 문항은 호스트가 샌드박스 밖에서 채점합니다.

### 쓰는 쪽과 채점하는 쪽

부록 A의 정의에서 파라미터는 밀집 텐서의 0이 아닌 값과, 희소 텐서에서는 저장된 값과 그 인덱스를 함께 셉니다. 밀집 텐서의 0은 저장되어도 파라미터에 넣지 않습니다. 표가 non-zero values라고 쓰면 인덱스를 빼며, 같은 크기 Transformer는 그 개수만큼의 파라미터를 가진 모델입니다.

Writer는 Claude Opus 5.5(high reasoning effort), GPT-6.1 Sol, GPT-6 Astra입니다. 부록 A는 적힌 곳에서 Claude Fable 5.2도 writer로 둔다고 합니다. ARC 본실험의 표 3은 앞의 세 이름입니다. Fable 5.2의 숫자가 본문에 있는 곳은 부록 H의 CIFAR-10 CNN입니다.

자유 설계에서 writer가 내는 것은 단어 목록, 손으로 쓴 텍스트를 텐서로 컴파일하는 build script, forward입니다. 정적 문법 검사는 Python 조건문, while, 불리언 연산, 텐서를 Python 스칼라나 리스트로 바꾸는 변환을 막고, `topk`와 `sort`와 `gather`를 포함한 텐서 연산은 허용합니다. 토크나이저는 고정된 정규식이고, 문항은 128단어, 보기는 48단어까지입니다. 경사 학습과 데이터에 대한 통계적 맞춤은 금지입니다. writer는 자기가 만든 연습 문항의 정확도는 볼 수 있습니다.

세대는 같은 과제에서 두 런입니다. 1세대에는 부모가 없습니다. 2세대부터는 이전 세대에서 검증 정확도가 더 높은 유효 런이 부모입니다. 틀린 문항 목록은 전달되지 않습니다. 계보는 검증 정확도가 더 오르지 않거나 10세대에 멈춥니다. 표 3의 비용은 기록된 토큰의 API 가격 환산이고 생각 토큰을 포함합니다. 고정 아키텍처는 한 런, 설계 모델은 그 세대까지의 계보 비용입니다.

### 세 LLM이 만든 표

세 writer는 자유 설계에서 attention, MLP, 밀집 임베딩이 없는 희소 사실 표로 모였습니다. 1세대 단일 모델의 본문 예는 Claude Opus 5.5입니다. 그 모델은 361,150단어를 3,368개 개념으로 묶고, 4,288행, 29,502개의 0이 아닌 칸을 가진 표와 맞춥니다. 보기마다 상위 행을 남기고, 상위 사실의 개념으로 한 번 더 맞춘 뒤, 부정과 절대어와 어순 규칙을 더합니다.

부록 C는 행을 나누는 방식이 다르다고 적습니다. Claude Opus 5.5는 한 문장이 키이자 값입니다. GPT-6.1 Sol은 방향이 있는 단서와 답으로 나눕니다. GPT-6 Astra는 문항 개념, 지지하는 답, 반대하는 답을 적습니다.

5세대 Claude의 지식 파일에는 이런 문장이 있습니다. "An advantage of solar energy is that it is renewable and produces no air pollution; a disadvantage is that it does not work at night or on cloudy days and solar panels are expensive." 컴파일은 411,268개 항목(단어 411,266과 예약 id 둘)으로 토큰을 개념에 연결합니다. 표 12의 그 모델은 쓴 줄 10,897, 텐서 155개, 원소 112M, 파라미터 3,349,538, ARC 시험 54.4%입니다. 112M개의 원소 거의 전부가 0입니다. 3.35M은 0이 아닌 값과 희소 인덱스를 센 수입니다.

GPT-6.1 Sol 7세대는 "force measurement unit then newton" 형태의 규칙 10,382개와 개념 9,626개로 희소 행렬 둘을 만듭니다. 0이 아닌 칸은 단서 쪽 40,699, 답 쪽 45,199입니다. 파라미터는 766,132, 시험 정확도는 47.4%입니다. GPT-6 Astra 5세대의 예는 "balanced_force, then net_force zero; constant velocity; no acceleration, then always motionless"이고, 파라미터 546,323, 시험 정확도 46.2%입니다.

논문이 따라간 시험 문항은 "Which adaptation helps a bird fly?"입니다. Claude 1세대 표에서 hollow bones의 문장 "Hollow bones make birds light so they can fly"의 support는 70이고 다음 사실은 60입니다. 오답 세 개의 최선 행은 13에서 22입니다. 규칙까지 더한 보기 D의 점수는 70.1에서 55.9가 됩니다.

식 (2)는 그 점수의 골격입니다. 사실 `i`의 희소 개념 벡터가 키이자 값이고, `q`는 문항의 개념 벡터, `o_c`는 문항에는 없고 보기 `c`에만 있는 개념입니다.

```python
def score_option(facts, q, option_only):
    # 식 (2). 최선 행 하나의 곱. 2차 행과 규칙은 부록 C
    return max(dot(k, q) * dot(k, option_only) for k in facts)
```

이 블록은 논문의 식을 줄인 것이고, 저장소의 `arch.py`를 실행한 결과가 아닙니다.

1세대 Claude의 전체 점수는 식 (5)–(7)입니다. 행 노름 `ν_i`는 희귀 개념의 가중 `w_j = ln(1 + N/df_j)`를 쓰고, `N`은 4,288입니다. 최선 support에 2–5위의 0.15배, 네 개념 창의 0.5배, 이웃 사실의 0.3배를 더합니다. 두 번째 패스는 문항과 가장 맞는 사실 세 개의 개념을 `q`에 더합니다. 문항이 except, least, not 같은 부정을 가지면 부호가 음이 됩니다. only, always, never만 있는 보기는 0.9배가 됩니다.

3.2절은 Claude Opus 5.5의 1세대 런이 이렇게 적었다고 전합니다. "Without training, the only way to get knowledge into the model is to write it, and short declarative facts are the cheapest form to write and check." 그리고 "A sparse retrieval model makes every number traceable to a sentence I wrote." 이 문장은 논문이 전한 writer의 노트입니다. 이 글은 `NOTES.md`를 다시 열지 않았습니다.

### 경사가 없을 때 구조에 남는 것

표 1은 경사하강과 WSP가 모델에 요구하는 것을 나눕니다. WSP에서 가중치를 정하는 쪽은 한 줄씩 쓰는 LLM이고, 텐서를 만드는 하드웨어는 CPU입니다. 미분 가능한 모델, 기울기가 흐르기 좋은 구조, 큰 훈련 집합은 표에서 필요 없음으로 표시됩니다. 사실 하나를 바꾸려면 다시 학습하는 칸 대신 한 줄을 고치는 칸이 있습니다.

식 (1)은 Transformer도 연상 기억의 스택으로 봅니다. 질의와 키가 닮으면 값을 불러오고, 선택은 선형층에서는 항등, MLP에서는 GELU, self-attention에서는 softmax입니다. 키가 밀집이면 다른 기억의 값이 섞입니다. 표 모델은 개념 3,368개 중 0이 아닌 칸이 대략 일곱 개인 키와, 상위 `k`행만 남기는 선택으로 그 섞임을 버립니다.

그래서 논문이 말하는 "attention과 깊이가 빠진다"는, 기울기로 가중치를 맞출 필요가 없어진 뒤 writer가 실제로 고른 구조가 한 줄에 한 사실을 두는 표라는 관찰입니다. 5.2절은 다른 읽기를 닫지 않습니다. LLM은 학습 없이 푸는 방법으로 검색을 이미 알고, 한 writer는 IDF 검색을 ARC의 고전 베이스라인이라고 부릅니다. 논문은 이 데이터가 "쓰기에 맞아서"와 "익숙해서"를 가르지 못한다고 적습니다. 행 표를 금지한 통제에서 Claude Opus 5.5는 다시 키로 읽는 기억을 만들었고, 중첩된 무작위 고차원 벡터를 썼습니다. 표 4에서 그 런의 0이 아닌 값은 84M–392M이고 ARC 시험 정확도는 45.6%입니다. 제한 없는 1세대 평균은 0.45M–0.57M, 50.7%입니다.

같은 내용을 Transformer에 넣으면 구조가 내용을 깎습니다. 표 6에서 Claude가 쓴 2층 Transformer 여섯 런의 평균은 36.1%이고, 그 텍스트에 대한 BM25는 44.1%입니다. 1세대 표는 50.7% 대 BM25 47.0%, 5세대 표는 54.1% 대 48.4%입니다. 8절은 이 결론의 범위를, 현재 LLM이 무작위 초기화에서 데이터를 돌리지 않고 가중치를 쓰는 방식으로 한정합니다. 회상 너머를 쓰는 방법이 나오면 최선의 구조는 열린 문제라고 같은 절이 적습니다.

### 저자가 forward를 고정한 연관기억

LLM이 설계한 표는 문항마다 저장된 사실을 모두 점수 매깁니다. 사실이 늘면 일도 늘고, 커널도 많이 뜹니다. 6.1절은 46개 변형 중 같은 크기 Transformer의 가장 빠른 입력보다 빠른 것이 하나이고, 중앙값은 9.4배 느리다고 합니다. Claude 계보에서 커널은 1세대 13개에서 5세대 118개로 늘어납니다.

저자들은 그래서 forward를 직접 고정하고, 값만 LLM이 쓰게 했습니다. 개념 표 `A`는 개념 `a`가 개념 `b`를 얼마나 부르는지이고, 쌍 표는 개념 쌍 `(a, b)`(`a < b`)가 함께 부르는 개념입니다. 주소는 `h(a, b) = (a p + b) mod H`이고 `p`는 고정 소수입니다. 검색은 없습니다. 문항 개념 중 가장 강한 `J = 16`개로 쌍 120개를 만들고, 그 120행과 `A`와의 곱 하나만 계산합니다.

```python
def associative_score(q, A, pair_rows, mu, option_only):
    # 식 (3). J=16이면 쌍은 120개. p와 H는 논문의 주소
    top = strongest(q, 16)
    recalled = zeros_like(q)
    for a, b in pairs(top):          # a < b
        recalled += q[a] * q[b] * pair_rows[(a * p + b) % H]
    recalled += mu * (A.T @ q)
    return dot(option_only, recalled)
```

이 루프도 식 (3)을 줄인 것이고 실행하지 않았습니다. Claude 1세대에서 `p = 1,000,003`, `H = 2^20`, 행 너비 `R = 40`, `μ = 1.5`입니다. 단어 40,312개가 개념 3,805개로 가고, `A`의 0이 아닌 칸은 2.06M입니다. 부록 A의 파라미터 정의로 이 모델은 2.53M이고, 1세대 LLM 설계 모델 0.94M의 2.7배입니다. 5세대는 `H = 2^22`, `R = 16`, `μ = 1.5`, 개념 4,324개, 파라미터 6.24M, 시험 52.4%입니다.

같은 새 문항에서 쌍 표의 (adaptation, fly) 행은 hollow와 bones를 부릅니다. 개념 표와 합치면 hollow bones가 52.1이고 다음 보기는 15.8입니다. 쌍 표 없이 `A`만 있어도 16.9 대 11.8로 같은 보기가 1위입니다.

### 1,800배가 나오는 나눗셈

부록 A는 초록과 그림 1의 크기 비를 이렇게 적습니다. Claude Opus 5.5가 검증 정확도로 가장 잘 쓴 공개 아키텍처는 Qwen3-1.7B이고, 파라미터 1.72B, 시험 정확도 48.7%입니다. 680배는 그 1.72B를 연관기억 모델의 2.53M non-zero 값으로 나눈 것이고, 1,800배는 1.72B를 LLM 설계 모델의 0.94M 파라미터로 나눈 것입니다. 0.94M은 표 3의 1세대(시험 50.8%, Easy 59.0, Challenge 34.2, 비용 $29)입니다. 5세대 3.35M이 아닙니다.

표 10은 같은 Qwen3-1.7B를 Decoder, 1.7B로 적습니다. 비에 쓰인 자릿수는 부록 A의 1.72B입니다. 표 11에서 이 48.7%는 무작위 초기화 위에 Claude가 가중치를 쓴 결과이고 런은 2개입니다. 같은 표의 경사하강 열은 그 아키텍처를 ARC 훈련 3,358문항으로 학습한 25.3%입니다.

```python
print(round(1.72e9 / 0.94e6))     # 부록 A의 1,800배
print(round(1.72e9 / 3.35e6, 1))  # 표 3의 5세대 3.35M으로 같은 분자를 나눔
print(round(1.72e9 / 2.53e6))     # 부록 A의 680배
print(round(302 / 18, 1))         # 표 16, 6.2M, 정렬 후 절단
print(round(15.8 / 0.176, 1))     # 표 7, LLM 설계 5세대
```

```text
1830
513.4
680
16.8
89.8
```

논문의 "about 1,800×"는 1,830입니다. 5세대 3.35M으로 같은 분자를 나누면 513.4입니다. 표 12의 3,349,538로 나누면 513.5입니다. 680배는 2.53M으로 680입니다. 위 나눗셈은 논문이 적은 수를 다시 계산한 것이고, 모델을 다시 센 값이 아닙니다.

표 3의 29.8%는 다른 칸입니다. 경사하강으로 학습한, LLM 설계 모델 크기의 2층 Transformer이고 파라미터는 3.33M, 라벨은 3,358개, Easy 31.2, Challenge 27.0, All 29.8입니다. 5세대 표는 3.35M입니다. 같은 크기 근처의 최선 소형망은 MLP 3.34M, 32.7%입니다. 같은 LLM이 가중치를 쓴 2층 Transformer의 평균은 36.1%(0.08M–3.96M, 비용 $16)입니다. 사전학습 뒤 ARC에 맞춘 Qwen3.5-0.8B는 752M, 82.1%입니다. 표 1은 Claude의 2층 Transformer를 경사하강 29.8, WSP 36.1로 적고, 쓴 표의 범위를 49.6–54.4로 적습니다. 그 범위는 LLM 설계 모델과 연관기억의 1세대와 5세대를 합친 것입니다.

사전학습 체크포인트를 고치지 않고 프롬프트만으로 읽은 표 20에서 Qwen3-1.7B는 87.9%입니다. 세 writer가 그 가중치를 고친 뒤에도 87.9%입니다. 1,800배의 48.7%와 프롬프트의 87.9%는 같은 아키텍처 이름의 다른 가중치입니다.

### 17배가 나오는 칸

표 7의 GPU 시간은 RTX 3090 한 장에서 ARC 시험 3,530문항입니다. 연관기억 5세대는 0.018초, 같은 non-zero 수의 2층 Transformer는 0.302초이고 논문은 이 칸을 17배 빠르다고 적습니다. 1세대는 0.018초 대 0.134초, 7배입니다. 타이머에 올린 Transformer의 가중치는 무작위이고, 정확도 열의 40.9%는 같은 너비로 Claude가 쓴 Transformer 두 런의 평균입니다. 그 쓴 Transformer는 어휘를 writer가 고르기 때문에 non-zero가 더 많습니다. 입력은 이미 GPU에 있고, 길이 정렬과 순서 복원은 시간에 넣지 않습니다.

표 16은 같은 3,530문항을 배치 64, CUDA 그래프에서 입력 처리별로 나눕니다. 연관기억은 2.5M과 6.2M 모두 18 ms입니다. 6.2M에서 Transformer는 패딩 1,530 ms(85배), 배치 길이로 자르면 633 ms(35배), 길이순으로 정렬한 뒤 자르면 302 ms(17배)입니다. 본문이 "up to 17×"라고 부르는 쪽은 두 세대 중 큰 쪽이고, 그 비교는 Transformer에게 가장 빠른 입력입니다.

LLM이 설계한 5세대는 같은 표에서 15.8초 대 0.176초, 90배 느립니다. 1세대는 0.566초 대 0.052초, 11배 느립니다. Claude에게 1세대와 5세대를 GPU용으로 다시 쓰게 한 결과는 표 17입니다. 정확도는 유지되고 출발점보다 빠르지만, 여전히 모든 행을 점수 매겨 같은 크기 Transformer의 가장 빠른 입력보다 6배에서 33배 느립니다.

Eager에서 합성 표로 쌍 표를 3M에서 10억 non-zero까지 키우면 GPU 문항당 시간은 0.012 ms에 머물고, 같은 크기 Transformer는 0.044 ms에서 14.5 ms로 늘어납니다. 개념 수를 키우면 다릅니다. `A`를 밀집으로 두면 약 15,000개와 32,000개 개념 사이에서 Transformer보다 느려지고, 행 리스트로 읽으면 약 100,000개념까지 빠르다고 8절이 적습니다. 5세대 연관기억의 개념 수는 4,324입니다.

### 한 줄을 지우는 실험

5.1절은 쓴 줄 하나를 지우고 모델을 다시 만든 뒤 시험 집합과 비교합니다. 모델마다 무작위 40줄입니다. 아무것도 지우지 않고 다시 만들면 변화가 없습니다. 표 5의 Claude 1세대 LLM 설계 두 런은 평균 0.9건과 0.8건이 바뀝니다. 표 18은 이 관찰을 "0.8–0.9 of 3,530 answers"로 적습니다. 분모는 시험 문항 전체 3,530입니다.

연관기억 두 런의 평균은 1.8과 0.5입니다. 1.8은 단어-개념 어휘 줄 두 개에서 23건과 30건이 바뀐 결과이고, 그 둘을 빼면 0.5입니다. 쓴 Transformer 첫 런은 평균 4.8건입니다. 둘째 런의 build script는 모든 벡터 코드를 난수 스트림 하나에서 뽑으므로, 줄 하나가 거의 모든 가중치와 답의 38%를 바꿉니다. 평균은 1,350.7건입니다. GPT-6.1 Sol과 GPT-6 Astra의 1세대 표 14에서 LLM 설계 모델은 줄당 0.5–1.8건이고, 연관기억은 0.4–8.7건입니다. 5.7과 8.7 중 바뀐 답의 53%와 96%는 어휘도 함께 바뀌는 줄에서 옵니다. 그들의 쓴 Transformer는 10.8건과 20.3건입니다.

최선 사실 하나만 남겨도 정확도는 가까이 갑니다. 표 4에서 제한 없는 1세대 한 런은 전체 50.8%이고, 보기마다 최선 사실만 쓰면 49.1%입니다. 연습 문항을 금지하면 두 런 평균이 50.7%에서 49.5%로 내려갑니다. 이 삭제 실험의 행은 1세대입니다. 5세대 54.4% 모델의 줄 삭제 평균은 표 5에 없습니다.

```python
def changed_answers(predict, questions):
    before = [predict(q) for q in questions]   # 3,530
    # 줄 하나를 지우고 다시 컴파일. 논문: 모델당 무작위 40줄의 평균
    after = [predict(q) for q in questions]
    return sum(a != b for a, b in zip(before, after))
```

표 5의 시험 정확도는 지우기 전과 뒤가 같습니다. LLM 설계 런 1은 50.7이고 런 2는 50.6입니다.

부록 D는 쓴 텍스트가 시험 문항을 베끼지 않았는지도 봅니다. Claude 5세대에서 시험 문항과 겹친 줄의 비율은 2.1%이고, 런 중 보지 않은 ARC 훈련 문항은 2.0%입니다. 겹친 줄 68개를 지우고 다시 만들면 54.4%가 54.3%가 됩니다.

## 한계

8절이 적은 경계는 정확도 표와 같습니다. 표 모델은 LLM이 적은 사실을 불러옵니다. 사실을 여러 단계로 잇거나 긴 답을 만들지 않습니다. 표 3에서 Claude 5세대의 Easy는 62.6%, Challenge는 37.8%입니다. ARC용으로 쓴 모델을 그대로 MMLU에 두면 25% 근처입니다. 7.2절은 SciQ에서 1세대와 5세대 모두 47.7%와 50.1%, OpenBookQA에서 30%에서 36%, MMLU에서 우연 근처라고 적습니다.

CIFAR-10 원본 픽셀에서 Claude가 쓴 여덟 아키텍처는 21%에서 28%이고 우연은 10%입니다. 부록 H의 무라벨 범위는 21.6–27.0%입니다. 픽셀 가중치에는 writer가 이름을 붙일 뜻이 없다고 논문이 설명합니다. DINOv2 토큰 위의 2,570파라미터 표는 무라벨 96.1%이고, 같은 토큰의 경사하강은 라벨 100개에서 95.8%입니다. 논문은 이 정확도가 인코더에서 온다고 적습니다.

저장소 README는 측정, 분석, 그림 코드가 `bm25/bm25.py`를 빼고 들어 있지 않다고 합니다. 공개 모델은 텍스트 56개, 68 MB입니다. writer별로는 opus 20, sol 18, astra 18이고, 100M–2.6B의 편집된 공개 체크포인트는 크기 때문에 빠집니다. 점수는 CPU마다 소수점 몇 자리가 달라질 수 있고, AMD EPYC 7302에서는 저장된 `result.json`과 정확히 맞고, Intel Xeon Silver 4314에서는 주어진 Transformer가 최대 0.4점 달라진다고 README가 적습니다. Writer 런은 상용 LLM을 부르므로 결정적이지 않습니다. 이 환경에서 채점은 다시 돌리지 않았습니다.

## 비즈니스 인사이트

법률 자문이나 구매 견적이 아닙니다. 숫자와 제품 문장은 아래 링크의 페이지에 있는 것만 옮기고, 해석은 (분석) 또는 (의견)으로 표시합니다.

### 같은 ARC 시험 집합 위의 자리 (분석)

표 3과 표 20을 한 시험 집합에 놓으면 자릿수가 갈립니다. Claude가 5세대에 쓴 표는 3.35M, 54.4%입니다. 크기를 맞춘 2층 Transformer를 3,358문항으로 학습하면 29.8%입니다. 같은 1.7B급 이름을 프롬프트만으로 읽으면 Qwen3-1.7B가 87.9%이고, Qwen3.5-2B는 91.0%입니다. 3,358문항으로 맞춘 Qwen3.5-0.8B는 82.1%입니다. 논문 초록의 문장은 사전학습 LLM이 더 정확하고, 주장은 가중치를 쓸 때 어떤 구조를 만들지에 관한 것이라는 문장입니다.

1,800배가 비교하는 48.7%는 사전학습 Qwen을 이긴 점수가 아닙니다. 무작위 초기화에서 같은 LLM이 쓴 Qwen3-1.7B의 시험 점수이고, 그 상대가 1세대 표 50.8%입니다. (분석) 크기 비의 분모와 분자 모두 WSP 산출물입니다. 사전학습 가중치를 파는 모델과 그 비를 한 줄의 원가로 잇는 칸은 표 3에 없습니다.

### 누가 이 표의 고객인가 (분석)

행 단위로 사실을 지울 수 있다는 측정은 5절입니다. Claude 1세대 표에서 줄 하나의 평균 변화는 3,530문항 중 0.8건과 0.9건입니다. 최선 행만 남겨도 50.8%가 49.1%입니다. 쓴 Transformer에서는 같은 시험이 4.8건, 또는 난수 스트림 때문에 1,350.7건입니다. 감사 가능한 지식은 이 칸에 있습니다.

라벨이 적을 때의 숫자는 ARC 표가 아니라 부록 G의 AG News입니다. 시험 기사는 7,600개, 클래스는 넷입니다. Claude는 기사 없이 클래스 이름과 훈련 토큰 상위 2,000개의 단어 목록만 보고 네 아키텍처의 가중치를 씁니다. 무라벨 정확도는 bag of words 84.5%, 1차원 CNN 83.9%, fastText 83.2%, 소형 Transformer 83.7%입니다. 파라미터는 8,012, 33,732, 32,100, 54,604입니다. 무작위 초기화 경사하강이 그 정확도에 도달하는 라벨 수는 논문의 로그선형 보간으로 4,223, 9,201, 2,470, 8,191입니다. 라벨 100개에서 무작위 시작의 최댓값은 bag of words의 63.6%이고, 그 bag of words를 쓴 가중치에서 이어서 학습하면 84.7%입니다. 8절은 의료나 개인화처럼 라벨이 적은 영역은 실험하지 않았다고 적습니다.

9절은 이미 학습된 Transformer를 고치는 선행 연구로 Meng 등의 ROME(2022)과 MEMIT(2023)를 인용합니다. 그 방법의 업데이트는 forward 통계와 기울기로 최적화한 목표 벡터에서 오고, 이 논문의 자유 설계는 빈 상태에서 줄을 씁니다. 7.1절의 사전학습 편집은 또 다릅니다. 87런 중 48런은 가중치의 1% 미만을 바꾸고, 그중 43런은 정확도가 체크포인트의 1점 안에 있습니다. 72.3% 이상의 체크포인트 28런은 덮어쓰이지 않았고, 각 런의 변경은 최대 0.07%입니다.

### 비용과 받을 수 있는 것 (분석)

표 3의 달러는 GPU 학습비가 아닙니다. 기록된 토큰의 API 가격 환산입니다. Claude의 LLM 설계 계보를 5세대까지 쓰면 $144, 연관기억 5세대까지는 $96입니다. GPT-6.1 Sol의 LLM 설계 7세대는 $45, GPT-6 Astra의 LLM 설계 5세대는 $266, 연관기억 8세대는 $490입니다. 공개 아키텍처 15개의 행에 적힌 비용은 $15이고, 캡션은 고정 아키텍처의 비용을 한 런으로 적습니다.

추론 시간의 측정 칸은 RTX 3090에서 시험 집합 전체입니다. 연관기억은 CUDA 그래프로 18–20 ms이고, 5세대 LLM 설계 표는 15.8초입니다. 개념이 약 15,000개를 넘으면 밀집 `A`의 속도 이점이 사라진다고 8절이 적습니다. RTX 3090의 달러 가격은 논문에 없습니다.

저장소는 MIT이고 텍스트 모델 56개를 포함합니다. README의 재현 경로는 Linux, bubblewrap 0.6.3, Python 3.11.13, `allenai/ai2_arc` 다운로드, 그리고 writer를 다시 돌릴 경우 Claude Code CLI 2.1.319과 로그인된 프로필입니다. `harness.score_model`은 공개 폴더를 ARC 검증과 시험에 대해 `result.json`과 맞춰 채점한다고 적습니다. 측정 코드는 BM25를 빼고 없습니다. (분석) 오늘 복제할 수 있는 것은 쓴 텍스트와 채점 하네스입니다. 그림 4의 커널 수와 표 7의 밀리초를 같은 스크립트로 다시 찍는 경로는 README가 빠졌다고 말한 쪽입니다.

### 개발자에게 남는 문장 (의견)

헤드라인의 1,800배와 17배를 한 모델의 스펙으로 읽으면 칸이 바뀝니다. 1,800배의 모델은 1세대 0.94M, 시험 50.8%이고, 17배의 모델은 저자가 주소를 고정한 연관기억 5세대, 6.24M, 52.4%, 18 ms입니다. 54.4%의 3.35M 표는 GPU에서 같은 크기 Transformer보다 90배 느립니다.

지식을 한 줄로 지우고 싶은 개발자에게 논문이 재는 것은 1세대 표의 0.8–0.9건입니다. 과학 문항 점수로 사전학습 디코더를 바꿀 근거로 이 표를 쓰기는 어렵습니다. 같은 시험 집합에서 프롬프트만인 Qwen3-1.7B가 87.9%이기 때문입니다. 라벨이 거의 없는 짧은 텍스트 분류에서는 부록 G의 무라벨 83–84%가, 논문이 직접 놓은 다른 자리입니다. 일반 챗봇의 대체라는 문장은 초록이 거부합니다.

## 팩트 체크

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 포항공과대학교 연구자가 Claude와 GPT 등 고성능 LLM 셋에 신경망 설계를 맡겼다 | ✅ | 저자는 Hyunjong Ok, Jaeho Lee, POSTECH입니다. Writer는 Claude Opus 5.5, GPT-6.1 Sol, GPT-6 Astra입니다. 셋 다 이름이 있습니다. [1절](https://arxiv.org/html/2611.22055), [arXiv API](https://export.arxiv.org/api/query?id_list=2611.22055) |
| 세 모델이 각자 Transformer 대신 지식을 표에 저장하고 검색하는 구조를 만들었다 | ✅ | 자유 설계에서 셋 다 평문 사실을 희소 표로 컴파일합니다. 행의 형식은 문장, 단서-답, 지지-반대로 갈립니다. 17배 모델의 forward는 세 LLM이 고른 구조가 아니라 저자가 고정한 뒤 값만 쓰게 한 것입니다. [3.1절](https://arxiv.org/html/2611.22055), [부록 C](https://arxiv.org/html/2611.22055) |
| 최선 모델은 약 335만 파라미터이고 ARC 정답률 54.4%다 | ✅ | 표 3과 표 12의 Claude Opus 5.5 5세대입니다. 파라미터 3,349,538, 시험 54.4%, Easy 62.6, Challenge 37.8. 본 라벨은 10개입니다. 원소 112M의 거의 전부는 0입니다. [표 3](https://arxiv.org/html/2611.22055) |
| 그 ARC는 ARC-AGI다 | ❌ | 논문의 ARC는 Clark 등(2018)의 AI2 ARC-Easy와 ARC-Challenge를 합친 과학 사지선다 3,530문항입니다. 저장소는 `allenai/ai2_arc`를 받습니다. ARC-AGI는 Chollet(2019)의 다른 벤치마크이고 이 표의 이름이 아닙니다. [2절](https://arxiv.org/html/2611.22055), [README](https://github.com/effl-lab/Weight-Space-Programming), [ARC Prize](https://arcprize.org/arc-agi) |
| 같은 규모의 Transformer가 29.8%다 | ⚠️ | 29.8%는 경사하강으로 학습한 2층 Transformer, 3.33M, 라벨 3,358개의 All입니다. 5세대 표는 3.35M입니다. 같은 LLM이 쓴 2층 Transformer 평균은 36.1%이고, 같은 크기대의 MLP 경사하강은 32.7%입니다. 파인튜닝한 Qwen3.5-0.8B는 82.1%입니다. [표 3](https://arxiv.org/html/2611.22055) |
| Transformer보다 최대 1,800배 작다 | ⚠️ | 부록 A는 1.72B ÷ 0.94M입니다. 분모는 1세대 LLM 설계 모델(시험 50.8%)이고 분자는 같은 LLM이 검증 점수로 가장 잘 쓴 Qwen3-1.7B(시험 48.7%, 무작위 초기화)입니다. 3.35M으로 나누면 513.4입니다. 680배는 2.53M non-zero로 나눈 다른 비입니다. 프롬프트만인 같은 이름의 사전학습 Qwen3-1.7B는 87.9%입니다. [부록 A](https://arxiv.org/html/2611.22055), [표 20](https://arxiv.org/html/2611.22055) |
| GPU 추론이 최대 17배 빠르다 | ⚠️ | 17배는 연관기억 5세대 0.018초 대 같은 non-zero 수의 2층 Transformer 0.302초입니다. RTX 3090, 3,530문항, 길이순 정렬 후 절단이 Transformer의 가장 빠른 입력이고 배치 64의 CUDA 그래프입니다. 54.4% 모델은 15.8초 대 0.176초로 90배 느립니다. 패딩 입력에서는 표 16이 85배입니다. [표 7](https://arxiv.org/html/2611.22055), [표 16](https://arxiv.org/html/2611.22055) |
| LLM이 지식을 표에 직접 쓰고 경사하강으로 학습하지 않는다 | ✅ | 프로토콜은 경사 학습과 데이터 맞춤을 금지합니다. 평문 줄을 CPU에서 희소 행으로 컴파일합니다. 텐서를 만드는 하드웨어 칸은 CPU입니다. [표 1](https://arxiv.org/html/2611.22055), [부록 A](https://arxiv.org/html/2611.22055) |
| 경사하강을 전제하지 않으면 attention과 깊은 망이 필요 없다 | ⚠️ | 표 1은 미분 가능성과 기울기 흐름용 구조를 WSP의 요구에서 뺍니다. 세 LLM의 자유 설계는 attention, MLP, 밀집 임베딩을 쓰지 않았습니다. 5.2절은 검색이 익숙해서 골랐을 가능성을 가르지 못한다고 적고, 행을 금지하면 고차원 벡터 기억(45.6%, non-zero 84M–392M)이 나옵니다. 8절은 범위를 무작위 초기화에서의 현재 쓰기로 한정합니다. [표 1](https://arxiv.org/html/2611.22055), [5.2절](https://arxiv.org/html/2611.22055) |
| 한 행을 지우면 다른 3,530개 예측 가운데 약 1개만 바뀐다 | ⚠️ | Claude 1세대 LLM 설계 두 런의 평균은 3,530문항 중 0.9건과 0.8건입니다. 무작위 40줄의 평균이고 5세대 54.4%의 표는 아닙니다. "다른 3,530건"이라는 나머지 집합은 논문 문장이 아닙니다. 연관기억의 1.8은 어휘 줄 둘(23건, 30건)에서 오고, 쓴 Transformer 한 런은 평균 1,350.7건입니다. [표 5](https://arxiv.org/html/2611.22055), [표 18](https://arxiv.org/html/2611.22055) |
| 틀린 지식만 골라 고칠 수 있다 | ⚠️ | 최선 행만으로 50.8%가 49.1%가 되므로 답의 대부분은 한 사실에 기대어 있습니다. 줄 삭제는 평균을 0으로 만들지 않고, 어휘 줄은 수십 건을 바꿉니다. 표 5의 시험 정확도는 지우기 전과 뒤가 같고, 런 1은 50.7, 런 2는 50.6입니다. [표 4](https://arxiv.org/html/2611.22055), [표 5](https://arxiv.org/html/2611.22055) |
| 사전학습 LLM의 일반 성능을 대체하지 않는다 | ✅ | 초록은 사전학습 LLM이 더 정확하다고 적습니다. 같은 시험에서 프롬프트만인 Qwen3-1.7B는 87.9%, Qwen3.5-2B는 91.0%이고, ARC에 맞춘 Qwen3.5-0.8B는 82.1%입니다. ARC용 표는 MMLU에서 우연 근처입니다. [초록](https://arxiv.org/abs/2611.22055), [표 20](https://arxiv.org/html/2611.22055) |

## 참고 자료

- Hyunjong Ok, Jaeho Lee, [Weight-Space Programming Doesn't Need Transformers](https://arxiv.org/abs/2611.22055), arXiv:2611.22055v1, `published` 2026-11-17T01:33:13Z. [HTML](https://arxiv.org/html/2611.22055), [PDF](https://arxiv.org/pdf/2611.22055v1)
- 저자 프로젝트 페이지, [wsp-no-transformer.github.io](https://wsp-no-transformer.github.io/)
- 코드와 공개 모델 56개, [effl-lab/Weight-Space-Programming](https://github.com/effl-lab/Weight-Space-Programming). MIT. 측정 코드는 `bm25/bm25.py`를 빼고 없음. ARC는 `allenai/ai2_arc`, CC BY-SA 4.0
- Clark, Cowhey, Etzioni, Khot, Sabharwal, Schoenick, Tafjord, [Think you have solved question answering? Try ARC, the AI2 reasoning challenge](https://arxiv.org/abs/1803.05457), arXiv:1803.05457, 2018. 논문 1–2절이 인용하는 과학 문항
- ARC Prize, [What is ARC-AGI?](https://arcprize.org/arc-agi). 2019년 Chollet의 Abstraction and Reasoning Corpus. 이 논문의 시험 집합과 다른 벤치마크
- Takehi, Teoh, Zhang, Khattab, [Sparks of Weight-Space Programming](https://rikiyat.github.io/blog/weight-space-programming/), 2026-11-02. 논문 1절과 9절이 인용. 이 블로그의 앞선 정리: [가중치만 읽고 고친다?](/posts/weight-space-programming/)
- Meng, Bau, Andonian, Belinkov, Locating and editing factual associations in GPT, NeurIPS 2022. 논문 9절이 인용하는 ROME
- Meng, Sharma, Andonian, Belinkov, Bau, Mass-editing memory in a transformer, ICLR 2023. 논문 9절이 인용하는 MEMIT
- 논문이 writer의 출처로 적은 페이지: Anthropic, [Introducing Claude Opus 5.5](https://www.anthropic.com/news/claude-opus-5-5) (2026-09-22). OpenAI, [GPT-6 Astra system card](https://deploymentsafety.openai.com/gpt-6-astra) (2026-09-03), [GPT-6.1 Sol addendum](https://deploymentsafety.openai.com/gpt-6-1-sol) (2026-09-29)
- 원본 X 포스트: [@ats](https://x.com/ats/status/2123716739347173682). 글 안의 링크는 [emergent.sh 기사](https://emergent.sh/news/llms-design-1-800x-smaller-models-beat)
