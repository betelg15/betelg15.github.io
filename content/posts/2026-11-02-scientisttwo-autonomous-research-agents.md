---
title: "구글이 박사 학위를 100% 자동화했다? ScientistTwo는 프리프린트다: 팩트 체크"
date: 2026-11-02
time: "19:46"
slug: scientisttwo-autonomous-research-agents
tags: [AI에이전트, 멀티에이전트, 연구자동화, 논문리뷰, 팩트체크]
summary: "ScientistTwo(arXiv:2609.19644)는 주어진 문제에서 가설·실험·ablation·모의 심사까지 돌리는 멀티에이전트 프레임워크입니다. 저자 7명 중 6명의 소속은 Google Cloud AI Research이고, 86/107과 평균 +25.2%는 성공한 과제와 자동 심사 기준의 수치입니다."
---

> 이 글은 북마크해 둔 [@EngMoElgaraihy의 아랍어 포스트](https://x.com/EngMoElgaraihy/status/2117092467258339703)(2026-11-02 12:12 KST)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117092467258339703](https://x.com/i/status/2117092467258339703)입니다. 이 환경의 X API는 계정 등록 오류로 본문을 주지 않아, 공개 상태 페이지의 글을 읽었습니다. 그 글의 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 [arXiv:2609.19644 HTML](https://arxiv.org/html/2609.19644)(v1, 2026-09-17 제출), [프로젝트 사이트](https://scientist-two.github.io/), [scientist-two GitHub 조직](https://github.com/scientist-two)의 공개 저장소 목록을 직접 본 결과입니다.

## 무슨 이야기인가

포스트의 첫 문장을 옮기면 이렇습니다. 구글이 박사 학위와 과학 연구 전체를 인간 개입 없이 100% 자동화했고, 구글 연구팀이 ScientistTwo라는 멀티에이전트 프레임워크를 공식 출시했으며, 그 시스템이 아이디어부터 심사 논문까지 연구 사이클을 혼자 돌린다는 주장입니다.

이어지는 설명은 조금 더 구체적입니다. 문제나 과학적 도전만 주면 나머지는 시스템이 맡고, 선행 논문을 읽어 베이스라인을 정하고, 가설을 세운 뒤 코드를 짜서 실험하고, ablation을 하고, 가짜 피어 리뷰로 스스로 논쟁한 다음 원고를 다듬는다고 합니다. 숫자도 있습니다. NeurIPS와 ICML에 채택된 최고 논문들과 겨뤄 86개 task에서 인간 최고 모델을 개선했고, 성능이 25.2% 뛰었으며, 참고문헌 환각이 100% 없고, 코드는 돌고 논문은 바로 낼 수 있다는 문장입니다.

개발자에게 이 이야기가 닿는 지점은 헤드라인이 아닙니다. **주어진 문제 위에서 비판자(critic)가 산출물을 받고, 고치거나 버리고, 예산이 끝나면 멈추는 연구 루프**가 논문에 단계별로 적혀 있습니다. 반대로 "박사 과정의 100% 자동화"와 "구글 공식 출시"는 그 논문이 말하는 범위와 다릅니다.

## 왜 이 구조가 개발자에게 중요한가

요즘 연구 에이전트 데모는 "논문을 써 줘" 한 문장으로 끝나는 경우가 많습니다. ScientistTwo가 논문에서 못 박는 문제는 그 다음입니다. 단일 스칼라에 과적합하고, 이긴 이유가 제안한 방법인지 학습률인지 가리지 못하고, 리뷰가 와도 문장만 고친다는 점입니다.

그래서 파이프라인은 에이전트 하나를 오래 돌리는 구조가 아닙니다. 단계마다 후보를 만들고, 비판자가 판정하고, 그 판정이 나쁘면 버리거나 정해진 횟수만큼만 고칩니다. 논문 Figure 4가 모든 단계에 공통으로 적은 루프는 이렇습니다.

```python
# 논문 Figure 4의 의사 코드. 단계 공통 골격이다.
def stage(candidate, critic, refine, max_rounds):
    for _ in range(max_rounds):
        verdict, feedback = critic(candidate)
        if verdict == "accept":
            return candidate
        elif verdict == "refine":
            candidate = refine(candidate, feedback)
        else:
            return None
    return None
```

프로젝트 사이트는 이 루프를 여섯 묶음으로 요약합니다. Idea Generator, Evaluator, Analyzer, Writer, Peer-Review, Meta-Review. 논문 본문(§3)은 그 안을 더 잘게 나눕니다. 구현을 베끼기 전에 볼 설정은 Appendix A.2입니다. 기본 에이전트는 Gemini 3.6 Flash이고, 아이디어 실험 코딩·ablation·반론·초고 보강은 Claude Code 위의 Opus 4.8입니다.

## 파이프라인

입력은 과학 문제 G 하나입니다. 논문의 식은 (P+, C+) = A(G)입니다. 나온 것은 논문과, 그 방법을 재현할 수 있는 코드베이스입니다. 사람이 문제를 정하고, 그 다음 사이클을 에이전트가 돈다는 분업을 서론이 먼저 적습니다.

아래 순서는 §3의 단계 이름과 Appendix A.2의 예산을 읽기 쉽게 다시 적은 **설명용 스케치**입니다. scientist-two 조직에서 2026-11-02에 확인한 공개 저장소는 웹사이트뿐이라, 이 함수는 저장소에 있는 구현이 아닙니다.

```python
# 설명용 스케치 — §3의 순서와 Appendix A.2의 예산. 공개 구현이 아님.

def run(G):
    # §3.1 한계 추출. 검증자가 부족하다고 하면 빠진 한계를 보탠다. 최대 16라운드.
    limits = stage(extract_limits(G), limit_verifier, add_missing, 16)
    seeds = rank_by_novelty(expand_ideas(limits))  # 신규성: Google Search로 논문 2편

    goods = []
    for _ in range(4):                       # 성공 아이디어가 4개면 조기 종료
        # A.2: 라운드마다 시드 1개 + 진화 아이디어 1개.
        # §3.3의 진화는 이전 라운드 흔적이 생긴 뒤부터다.
        for idea in (one_seed(seeds), one_evolved(goods)):
            # §3.2 부분집합에서 Bad / Good / Engineer. 엔지니어링은 최대 2라운드.
            # Good이 아니면 전체 벤치로 올리지 않는다. 2라운드 안에 Good이 아니면 Bad.
            idea, logs, code, verdict = experiment(G, idea, engineer_rounds=2)
            if verdict == "Good":
                goods.append((idea, logs, code))
        if len(goods) >= 4:
            break
    if not goods:
        return None                          # §3.3 성공이 0이면 파이프라인 종료

    best, logs, code = selector(G, goods)

    # §3.4 ablation으로 성분을 가르고, Refine이면 최대 1회 다시 짠다.
    # 새 결과가 더 나을 때만 best를 바꾸고, 그때 ablation을 다시 돈다.
    best, logs, code, ablations = ablate(best, code, max_refine=1)

    # §3.5 PaperOrchestra, ICLR 2025 형식. ScholarPeer가 8 미만이면 반론 실험.
    # 심사는 최대 2라운드. §3.6 메타 리뷰의 아이디어 재수정은 최대 1회.
    paper, review = draft_and_rebut(best, logs, ablations, peer_rounds=2, bar=8)
    return meta_review(paper, review, code, max_idea_refine=1)
```

### 아이디어는 빈 페이지가 아니라 한계에서 나온다

§3.1은 인간 SOTA의 한계를 Limitation Extractor가 뽑고, Limitation Verifier가 "이 목록으로 새 개선을 이끌 수 있는가"를 봅니다. 부족하면 빠진 한계를 더합니다. A.2의 상한은 16라운드입니다.

그 한계를 겨냥해 시드 아이디어 h0를 만들고 Novelty Checker가 점수를 매깁니다. Idea Generator가 더 새롭고 서로 다른 아이디어를 보태 시드 집합을 채운 뒤, 신규성 내림차순으로 정렬합니다. 신규성 계산에 쓰는 외부 자료는 A.2에 적힌 대로 Google Search로 가져온 참고 논문 두 편입니다. 시드 개수 N_seed의 구체적 값은 A.2에 숫자로 없습니다.

### 부분집합을 먼저 보고, 이긴 것만 전체 벤치로 올린다

§3.2의 비용 장치는 부분집합입니다. Baseline Coding Agent가 G의 주요 실험을 부분집합에서 재현합니다. 그 다음 신규성 상위 아이디어만 Subset Coding Agent가 그 코드 위에 올립니다.

Subset Critic의 판정은 세 가지입니다.

- **Bad:** 베이스라인보다 크게 나쁘면 버립니다.
- **Good:** 일관되게 이기면 전체 집합으로 올립니다.
- **Engineer:** 가능성은 있는데 하이퍼파라미터나 코드 조정이 필요하면 Subset Engineering Agent가 고칩니다. A.2는 이 엔지니어링을 최대 두 라운드로 적습니다. 그 안에 Good이 아니면 Bad로 칩니다.

Good만 Full-Set Coding Agent가 전체 벤치로 확장하고, Full-Set Critic과 Full-Set Engineer가 다시 판정합니다. 이후 라운드에서는 이 경로 전체를 Idea Implementer A_Coder 하나로 부릅니다.

### 진화는 성공 로그와 실패 로그를 같이 본다

§3.3에서 두 번째 라운드부터의 Idea Evolver는 지금까지의 실행 흔적을 봅니다. Good의 결과와 Bad의 실패 로그가 둘 다 입력입니다. 진화만 하면 초기 시드 주변에 갇히므로, 아직 안 돌려 본 시드를 신규성 순으로 다시 끼워 넣습니다. A.2의 운영 설정은 라운드마다 후보 둘, 즉 시드 하나와 진화 아이디어 하나입니다. 루프는 최대 네 라운드이고, 성공 아이디어가 네 개 모이면 멈춥니다. 마지막 라운드까지 Good이 하나도 없으면 연구 전체를 종료합니다. 하나라도 있으면 Selector가 전체 벤치 로그를 비교해 h_best를 고릅니다.

### Ablation은 그림이 아니라 통과 조건이다

§3.4에서 Ablation Planner가 h_best에 맞는 실행 계획 N_p개를 만들고, Ablation Coding Agent가 검증된 코드에서 성분을 빼거나 바꿔 돌립니다. Ablation Critic이 Good이면 초고로 넘기고, Refine이면 Full-Set Engineering Agent가 방법을 고칩니다.

여기서 한 번 더 거릅니다. 구조가 더 깔끔해 보여도 Result Comparison Agent가 새 결과를 더 낫다고 할 때만 best를 교체하고, 교체되면 ablation 계획을 다시 짭니다. A.2는 이 재수정을 최대 한 번으로 적습니다.

부록 B의 TeCh(Yu et al., 2026) 사례가 이 문의 역할입니다. ScientistTwo의 DMC-TeCh는 여섯 지표 중 다섯에서 베이스라인을 넘겼지만, ablation 비판자가 이득의 출처를 제안한 멀티코어 구조가 아니라 EMA와 label smoothing으로 봤고, 그 안은 기여로 받지 않았습니다. 지표가 움직였는가와, 그 움직임이 주장한 성분에서 왔는가는 다른 합격 기준입니다.

### 초고 다음에 반론은 문장이 아니라 추가 실험이다

§3.5의 초고는 PaperOrchestra(Song et al., 2026)를 포함한 Initial Drafter가 씁니다. A.2는 형식을 ICLR 2025로 적습니다. 심사자는 ScholarPeer(Goyal et al., 2026)이고, 점수 s_review는 1에서 10입니다. 논문은 합격 문턱의 예로 8을 듭니다. 8 미만이면 Rebuttal Planner가 추가 실험 과제를 만들고, Rebuttal Coding Agent가 그때의 코드베이스 C_best로 그 실험을 실행합니다. Paper Enhancer가 리뷰와 추가 결과를 원고에 넣은 뒤 ScholarPeer가 다시 채점합니다. A.2의 상한은 두 라운드이고, 점수가 8에 닿으면 일찍 멈춥니다.

§3.6의 Meta-Review Agent는 원고와 리뷰를 보고 Accept 또는 Refine을 냅니다. Accept면 그 원고와 코드가 최종 산출물입니다. Refine이면 메타 비판을 보고 아이디어를 다시 짜고, 새 실험이 기존 best를 엄밀히 이길 때만 상태를 갱신한 뒤 ablation과 초고와 심사를 다시 탑니다. 이기지 못하면 직전 산출물로 끝냅니다. A.2는 이 리뷰 기반 아이디어 재수정을 최대 한 번으로 적습니다.

## 무엇으로 점수를 매겼나

평가는 107개 문제입니다. Appendix A.1의 구성은 NeurIPS 2025 채택 논문 38편(AutoSOTA 벤치에서 가져옴), ICLR 2026 채택 논문 5편(역시 AutoSOTA 벤치), ICML 2026 스포트라이트 64편(AutoSOTA의 재현 가능성 필터를 따른 부분집합)입니다. Table 3에서 ScientistTwo가 논문을 만든 수는 33/38, 4/5, 49/64이고, 합은 86/107, 논문이 적은 성공률 80.4%입니다.

점수 기계는 두 개입니다. ScholarPeer와 Stanford Agentic Reviewer입니다. 논문 각주가 후자의 주소로 [paperreview.ai](https://paperreview.ai/)를 적습니다. 논문은 ScholarPeer를 학습 분포 안이라고 부릅니다. 초고를 고치는 데 쓴 심사자를, 결과 표의 채점기로도 쓰기 때문입니다. Stanford Agentic Reviewer는 베이스라인과 이 방법을 만드는 동안 보지 않은 held-out 채점기라고 적습니다. ScholarPeer 참고문헌의 저자 표기는 T. Pfister, J. Yoon이고, 이 논문의 Tomas Pfister, Jinsung Yoon과 이름이 겹칩니다.

Table 2와 Table 3, 그리고 프로젝트 사이트가 같이 적는 전체 숫자는 다음과 같습니다. ScientistTwo 86편의 ScholarPeer 평균은 7.5±1.3, 수용률 91.9%입니다. Stanford Agentic Reviewer 평균은 5.7±0.6, 수용률 72.1%입니다. 같은 두 채점기에서 ICLR 2026 채택 5편은 6.8 / 60.0%와 5.2 / 60.0%, NeurIPS 2025 채택 38편은 6.2 / 65.8%와 5.5 / 76.3%입니다. ICML 2026 스포트라이트 64편은 6.9 / 79.7%와 6.1 / 96.9%입니다. 논문의 문장은 ICLR 2026과 NeurIPS 2025의 평균은 두 채점기 모두에서 넘고, 스포트라이트 수준에는 닿지 않는다는 쪽입니다. 표만 보면 ICML에서 나온 49편의 ScholarPeer 평균 7.6은 스포트라이트 64편의 6.9보다 높고, Stanford 평균 5.7과 수용률 69.4%는 스포트라이트 64편의 6.1과 96.9%보다 낮습니다.

비교 대상 에이전트의 편수도 같지 않습니다. Table 2의 "# Papers"는 각 시스템이 공개한 AI 생성 논문 수입니다. AI Scientist-v2는 3편, ScientistOne은 21편, ScientistTwo는 86편입니다. 107문제를 모두에게 동일하게 준 대결이라는 문장은 그 표에 없습니다.

성능 이득은 리뷰 점수와 별개입니다. Table 4는 성공한 사례의 상대 이득을 적습니다. ScientistTwo 86편의 중앙값은 7.7%, 평균은 25.2%입니다. 평균이 중앙값보다 큰 이유는 논문이 과제별로 풀지 않습니다. 같은 표에서 ICLR 2026 4편의 중앙값은 2.2%, 평균은 3.8%로, AutoSOTA의 5.0%와 7.2%보다 낮습니다. NeurIPS 2025 33편에서는 중앙값 7.0%, 평균 13.9%로 AutoSOTA(3.7%, 8.5%)보다 높습니다. 부록 B는 두 시스템의 델타가 서로 다른 하드웨어에서, 각자 재현한 베이스라인 대비라서 공통 지표의 맞대결이 아니라고 적습니다.

리뷰 루프를 돌릴수록 두 채점기가 같이 오르지는 않습니다. Table 5는 ICML 스포트라이트에서 온 49문제입니다.

| 변형 | ScholarPeer 수용률 | Stanford 수용률 |
|---|---|---|
| 리뷰 0라운드, 반론 없음 | 46.9% (평균 5.2) | 49.0% (평균 5.6) |
| 1라운드, 반론 있음 | 79.6% (평균 6.9) | 73.5% (평균 5.8) |
| 2라운드, 반론 있음 | 93.9% (평균 7.6) | 69.4% (평균 5.7) |

논문은 1라운드에서 Stanford 수용률도 올랐고, 그 일반화는 첫 라운드에서 특히 크다고 적습니다. 표의 2라운드 칸은 ScholarPeer 수용률이 79.6%에서 93.9%로 오르는 동안 Stanford 수용률이 73.5%에서 69.4%로 내려간 숫자입니다.

사람 평가도 있습니다. 다만 학회 채택/거절이 아닙니다. §4.3과 Table 10은 NeurIPS에서 파생된 문제의 생성 논문 33편을, 경험 있는 사람 리뷰어 9명이 1–5 Likert로 본 결과입니다. 단독 점수는 여섯 항목 모두 3을 넘고, 전체 과학적 성숙도는 3.7입니다. 사람 논문과의 상대 비교에서 3.0이 동률인데, 전체는 3.0, 방법의 엄밀함은 2.9로 사람 논문 쪽, 실험의 베이스라인·벤치 폭은 3.5로 ScientistTwo 쪽입니다. 블라인드인지, 평가자 간 일치도는 얼마인지는 이 표와 본문에 없습니다.

무결성 감사는 CoE Integrity Audit(Meng et al., 2026) 네 가지입니다. 저장소를 다시 돌려 숫자를 맞추고, 규칙 위반과 reward hacking을 보고, 참고문헌이 실재하는지 보고, 방법 절과 코드를 맞춥니다. Table 7의 전체 시스템은 49/49 점수 재현, 명세 위반 0/49, 환각 참고문헌 0/1,814, 방법–코드 일치 49/49입니다. 이 49는 §4.2가 말한 ICML 2026 스포트라이트 유래 문제 집합과 수가 같습니다. 사이트도 "49편이 코드와 맞다"와 "1,814개 참고문헌"을 같이 적습니다. 참고문헌 검증 에이전트를 빼면 같은 표에서 환각이 19/1,814, 19/1,817로 남습니다. 명세 필터를 빼면 점수 재현은 50/50이지만 명세 위반이 1/50이고, 각주는 그 한 건을 reward hacking이라 걸러야 한다고 적습니다.

코딩 백엔드를 갈아 끼운 실험은 Table 8, ICLR 2026 과제 5개입니다. Claude Code(Opus 4.8)의 성공률은 80.0%, 성공 사례 평균 이득은 3.8%입니다. Antigravity(Gemini 3.8 Flash)는 성공률 60.0%, 평균 이득 16.7%입니다. 논문은 Antigravity가 만든 코드베이스도 재현되고, 명세 위반이 없고, 설계와 맞았다고 적습니다. 표본은 5개입니다.

비용은 NeurIPS 2025에서 온 33문제에 대한 Figure 11입니다. 캡션은 논문 하나당 평균 2.5일, 본문은 2–3일입니다. 토큰과 VM을 포함한 평균 비용은 $3,765이고, 한계 절은 과제 하나당 약 $3,800이라고 적습니다. 시간의 대부분은 아이디어 정제, 동적 피어 리뷰, 메타 리뷰에 있고, 그 안은 벤치 실행입니다.

## 한계

논문이 스스로 적은 한계는 두 줄입니다. 스포트라이트나 오럴처럼 문제 설정을 바꾸는 수준에는 아직 못 미치고, 개선이 국소적인 알고리즘 수정에 머문다는 것. 그리고 과제당 약 $3,800이라 실험실이나 개인이 그대로 돌리기 어렵다는 것입니다. 오픈 모델로 비용을 내리는 쪽을 후속 과제로 적습니다.

여기에 표를 읽고 보태야 하는 한계가 있습니다.

- 헤드라인 수용률의 한쪽 채점기(ScholarPeer)는 루프 안에서 이미 최적화한 심사자입니다. Table 5의 2라운드는 그 점수가 오를 때 held-out 수용률이 같이 오르지 않을 수 있음을 보여 줍니다.
- 사람 평가는 Likert 33편이지, 이 86편이 NeurIPS·ICML·ICLR에 채택되었다는 기록이 아닙니다. "accepted paper"는 사이트의 표현이고, 본문의 Accept는 메타 리뷰 에이전트의 판정입니다.
- 무결성 네 칸을 모두 통과한 숫자(49편, 참고문헌 1,814개)는 Table 7의 집합입니다. 86편 전부에 대한 같은 표는 논문에 없습니다.
- 프레임워크 소스 저장소는 확인하지 못했습니다. 2026-11-02에 [scientist-two](https://github.com/scientist-two) 조직의 공개 저장소는 사이트용 [scientist-two.github.io](https://github.com/scientist-two/scientist-two.github.io) 하나였습니다. 사이트 하단은 템플릿을 Nerfies에서 가져왔다고 적습니다. 라이선스가 프레임워크 코드의 라이선스라는 뜻은 그 페이지에 없습니다.
- 프로젝트 사이트에는 "See It Run" 절과 데모 영상 `static/videos/polarisgo-demo.mp4`가 있고, 영상의 접근성 이름은 "PolarisGo demo: browsing a ScientistTwo end-to-end run"입니다. 논문 HTML의 본문과 부록에서 PolarisGo라는 이름은 찾지 못했습니다. 영상 내용은 여기서 서술하지 않습니다.

## 팩트 체크

북마크한 아랍어 포스트의 주장을 원문과 대조했습니다. ✅ 사실 / ⚠️ 부분적으로 사실·과장 / ❌ 사실 아님. 한국어는 그 포스트의 번역입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 구글 연구팀이 ScientistTwo를 만들었다 | ⚠️ | [arXiv HTML 저자 소속](https://arxiv.org/html/2609.19644): Jaehyun Nam, Jinsung Yoon, Yanzhou Pan, Rui Meng, Parthasarathy Ranganathan, Tomas Pfister는 Google Cloud AI Research. Yubo Wang은 University of Waterloo. [프로젝트 사이트](https://scientist-two.github.io/)는 일곱 이름 아래에 "Google Cloud AI Research" 한 줄만 적는다. |
| 박사 학위와 과학 연구를 100% 자동화했다 | ❌ | 논문은 학위 과정을 말하지 않는다. 입력은 이미 있는 문제 107개이고, 논문을 만든 수는 86개(80.4%)다. [Table 3](https://arxiv.org/html/2609.19644), 한계 절. |
| 어떤 인간 개입도 없다 | ⚠️ | 초록은 초기 문제를 받은 뒤의 발견 사이클을 "without human intervention"이라고 적는다. 같은 초록과 서론은 그 도전을 인간 전문가가 준다고 적는다. 107문제는 사람이 쓴 채택 논문이다. |
| 구글 연구팀이 프레임워크를 공식 출시했다 | ⚠️ | 공개된 1차 자료는 [arXiv 프리프린트](https://arxiv.org/abs/2609.19644)(2026-09-17 제출, Jaehyun Nam)와 [프로젝트 사이트](https://scientist-two.github.io/)다. 프레임워크 구현 저장소와 구글 제품 출시 공지는 확인하지 못했다. [조직 저장소 목록](https://github.com/scientist-two). |
| 아이디어부터 심사 논문까지 전 과정을 돈다 | ⚠️ | §3.1–§3.6과 사이트의 "from Idea to Accepted Paper"는 그 루프를 설명한다. 심사와 Accept는 ScholarPeer·메타 리뷰 에이전트의 판정이지, 학회 채택 기록이 아니다. 21개 문제는 논문이 나오지 않았다. |

포스트의 숫자 주장도 같은 기준으로 보면 이렇습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 문제만 주면 나머지를 한다 | ⚠️ | 형식적 입력은 문제 G가 맞다. 보고된 실험의 G는 채택 논문의 문제 명세와 코드베이스다. [Table 3 캡션](https://arxiv.org/html/2609.19644), [사이트 Results](https://scientist-two.github.io/). |
| 선행 연구를 읽고 베이스라인·가설·코드·실험·ablation·모의 피어 리뷰를 한다 | ✅ | §3.1–§3.5와 Appendix A.2. 피어 리뷰는 ScholarPeer를 이용한 모의 심사다. |
| NeurIPS·ICML 최고 채택 논문과 겨뤘다 | ⚠️ | 입력에는 ICLR 2026 5편도 있다. 107편은 그 학회의 전체 채택본이 아니다. NeurIPS 38편과 ICLR 5편은 AutoSOTA 벤치고, ICML 64편은 스포트라이트 중 재현 필터를 통과한 집합이다. [Appendix A.1](https://arxiv.org/html/2609.19644). |
| 86개 task에서 인간 최고 모델을 개선했다 | ⚠️ | 86은 107번 시도 중 성공한 수다. 베이스라인은 그 입력 논문의 human state-of-the-art다. [Figure 1, Table 3](https://arxiv.org/html/2609.19644). |
| 인간 최고 성취 대비 성능이 25.2% 올랐다 | ⚠️ | 25.2%는 Table 4가 성공 사례에 대해 적은 평균 상대 이득이다. 같은 칸의 중앙값은 7.7%이고, ICLR 4편의 평균은 3.8%다. |
| 참고문헌 환각이 100% 없다 | ⚠️ | 전체 시스템 행은 환각 0/1,814이다. 그 감사는 49편이다. 86편 전체에 대한 같은 수치는 없다. [Table 7](https://arxiv.org/html/2609.19644). |
| 코드가 돌고 논문은 즉시 출판할 수 있다 | ⚠️ | Table 7은 49편에서 보고된 점수가 다시 실행된다고 적는다. "즉시 출판"은 자동 심사 문턱에 대한 저자 표현이고, 한계 절은 스포트라이트·오럴 수준이 아니라고 적는다. |

**총평:** 파이프라인 설명(문제에서 출발해 실험과 ablation, 모의 심사까지 간다)과 86, 25.2%라는 숫자의 출처는 논문에 있습니다. 그 숫자를 "박사 학위의 100% 자동화"와 "구글의 공식 제품 출시", "사람 개입 제로", "학회가 받은 논문"으로 읽으면 원문 밖으로 나갑니다.

## 개발자로서 가져갈 점

1. **비판자의 판정을 예산 있는 상태 기계로 두자.** Figure 4의 accept / refine / 그 외(버림)와, A.2의 2라운드·4성공·심사 8점 조기 종료가 이 논문에서 재현 가능한 설계 결정입니다. 에이전트 이름보다 그 예산이 시스템을 결정합니다.
2. **전체 벤치 전에 부분집합 관문을 두자.** §3.2는 비싼 실행을 Good 판정 뒤로 미룹니다. Engineer를 무한히 두지 않고 두 라운드에서 Bad로 떨어뜨리는 쪽이 논문의 설정입니다.
3. **최적화에 쓴 심사자와 보고용 심사자를 나누자.** ScholarPeer 수용률 91.9%는 루프가 그 심사자를 본 뒤의 숫자입니다. Table 5에서 2라운드는 그 수용률만 올리고 held-out 수용률은 73.5%에서 69.4%로 내려갑니다. 지표를 하나 더 두기 전에, 그 지표가 학습 루프 밖에 있는지를 먼저 보면 됩니다.
4. **이긴 커밋과 기여한 커밋을 가르자.** 부록 B의 TeCh처럼 지표 5/6이 올라도, 이득이 주장한 모듈이 아니면 버리는 검사가 이 시스템의 ablation 비판자입니다. 에이전트 PR 리뷰에 같은 질문을 넣을 수 있습니다.
5. **비용을 구조의 일부로 적자.** 논문이 적은 NeurIPS 33문제 평균은 2.5일과 $3,765입니다. 이 루프를 로컬 에이전트 스케치로 축소하면 벤치 실행이 빠지고, 그러면 논문이 시간을 쓴 바로 그 구간이 사라집니다.

## 참고 자료

- Nam, Yoon, Pan, Wang, Meng, Ranganathan, Pfister, *ScientistTwo: Pioneering the Human Knowledge Frontier with Autonomous AI*, arXiv:2609.19644 (제출 2026-09-17, v1) — [abs](https://arxiv.org/abs/2609.19644) · [HTML](https://arxiv.org/html/2609.19644) · [PDF](https://arxiv.org/pdf/2609.19644)
- 프로젝트 사이트 — [scientist-two.github.io](https://scientist-two.github.io/)
- GitHub 조직의 공개 저장소(사이트) — [scientist-two/scientist-two.github.io](https://github.com/scientist-two/scientist-two.github.io)
- Goyal, Parmar, Song, Palangi, Pfister, Yoon, *ScholarPeer: A Context-Aware Multi-Agent Framework for Automated Peer Review*, arXiv:2601.22638 — [arXiv](https://arxiv.org/abs/2601.22638)
- Stanford Agentic Reviewer — 논문 각주가 적은 [paperreview.ai](https://paperreview.ai/)
- 원본 X 포스트: [@EngMoElgaraihy, 2026-11-02 12:12 KST](https://x.com/EngMoElgaraihy/status/2117092467258339703)
