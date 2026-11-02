---
title: "DeepSeek이 '슈퍼 에이전트' 설계도를 MIT로 공개했다? 공식은 맞지만 '공식 제품'은 아니다: dsh-superagent 팩트 체크"
date: 2026-11-02
time: "12:44"
slug: deepseek-superagent-design
tags: [AI에이전트, DeepSeek, 멀티에이전트, 아키텍처, 오픈소스, 팩트체크]
summary: "DeepSeek Harness 팀이 '프롬프트 없이 채팅·GitHub·CI를 지켜보다 알아서 PR을 올리는' Super-agent 설계 글과 MIT 프로토타입을 공개했습니다. 출처는 진짜 deepseek-ai 조직이지만, 저장소 스스로 '공식 제품이 아닌 연구용 프로토타입'이라 밝히고, 글의 설계 일부(Watchdog 등)는 코드에 없습니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@iamsupersocks의 포스트(프랑스어)](https://x.com/iamsupersocks/status/2116948152821428432)를 계기로, 그 포스트가 인용한 [@DeepSeekHarness의 X 아티클 *Exploring Super-agent Design: Towards a More Autonomous Agent System*](https://x.com/DeepSeekHarness/status/2116857257245987236)과 공개 저장소 [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)의 문서·프롬프트·소스 코드를 직접 읽고 정리한 것입니다.

## 무슨 이야기인가

2026년 11월 2일 새벽(KST), 프랑스어권 X 계정 @iamsupersocks가 이런 요지의 글을 올렸습니다.

> "DeepSeek가 또 인류에게 선물을 내놨다. … DeepSeek가 (슈퍼 에이전트의) 전체 설계도를 MIT 라이선스 코드와 함께 공개했다."

포스트가 말하는 "슈퍼 에이전트"는 챗봇의 반대입니다. 프롬프트를 쳐 주지 않아도 **팀 채팅, GitHub, CI에 상주하면서** 들어오는 이벤트를 보고, 사람의 주의가 필요한 것만 골라 스스로 일을 시작합니다. 예시도 구체적입니다. 단체 채팅방에서 누군가 "더블클릭 버그" 때문에 투덜대는데 아무도 에이전트를 태그하지 않았다. 그런데 에이전트가 원인과 PR을 들고 돌아왔다.

그리고 설계를 여섯 조각으로 요약합니다.

1. **분류(triage):** 코드로 짠 규칙이 모델 호출 전에 노이즈를 버린다.
2. **Router:** 가벼운 모델. 사람과 대화하는 유일한 존재. 판단하고 배분하지만 코딩은 안 한다.
3. **Workers:** 작업 하나당 격리된 세션 하나, 최고 성능 모델. 이미 추적 중인 PR의 후속 이벤트는 Worker에게 바로 간다.
4. **응답:** 채팅엔 최대 100단어, 자세한 건 PR에.
5. **감시견(watchdog):** 각 Worker가 진전하는지 제자리를 맴도는지 판단하고, 깨지면 고친다.
6. **메모리:** 모델 바깥에 있어서, 역할별로 모델을 바꿔도 잃는 게 없다.

또 "병목은 모델이 아니라 사람의 주의력이고, 세션이 3~5개를 넘으면 뭐가 뭔지 모른다"고 덧붙입니다.

개발자 입장에서 이 이야기가 중요한 이유는 두 가지입니다.

- 요즘 "상주형(always-on) 에이전트"는 여러 회사가 동시에 밀고 있는 방향인데, **그 '바깥 레이어'(누가 거르고, 누가 판단하고, 누가 실행하고, 누가 감시하는가)의 설계를 실험 수치와 함께 공개한 사례**는 드뭅니다.
- 반대로 "DeepSeek 공식 + MIT + 전체 설계도 + 코드"라는 조합은 과장되기 쉬운 헤드라인이기도 합니다. 출처가 진짜인지, 코드가 설계를 정말 다 담고 있는지 확인해 볼 가치가 있습니다.

## 먼저 출처: 정말 DeepSeek인가

결론부터: **출처는 진짜 DeepSeek 쪽이 맞습니다. 다만 "공식 제품"은 아니라고 DeepSeek 쪽이 직접 적어 두었습니다.**

- 인용된 원 글은 X 계정 [@DeepSeekHarness](https://x.com/DeepSeekHarness)의 X 아티클입니다(2026-11-01 20:37 KST 게시). 이 계정의 프로필 링크는 [deepseek.com/en/harness](https://www.deepseek.com/en/harness/)를 가리킵니다. 단, 이 계정의 인증 배지는 유료 구독형(blue)이고, 공식 계정 [@deepseek_ai](https://x.com/deepseek_ai)에서 이 글을 언급한 포스트는 제가 검색한 범위(2026-10-01 이후)에서는 찾지 못했습니다.
- 더 강한 근거는 GitHub입니다. 글이 링크한 [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)은 DeepSeek의 GitHub 조직 **deepseek-ai** 아래에 있고(2026-10-31 생성), 같은 조직의 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 저장소는 홈페이지를 deepseek.com/harness로 걸어 두었습니다. 개인이 deepseek-ai 조직에 저장소를 만들 수는 없으니, 출처 자체는 DeepSeek라고 봐도 됩니다.
- 라이선스는 [MIT](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/LICENSE)가 맞습니다(저작권자 표기: "DeepSeek Harness Team").

하지만 두 문서가 스스로 선을 긋습니다.

- 아티클 첫머리: *"This article discusses architectural ideas. It is not an introduction to existing features of DeepSeek Harness."* 그리고 원문은 중국어이며 X에 올라온 것은 기계 번역본이라고 밝힙니다.
- 아티클 끝: *"This plugin is only a prototype for validating the technical approach, not an official DeepSeek product."*
- 저장소 [README](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/README.md): *"Research prototype for reference only, not an official DeepSeek product."* 그리고 *"it is not identical to our internal version or the implementation described in [the article]. Some designs discussed in the article are directions for future development and are not implemented in this prototype."*

즉 "DeepSeek가 슈퍼 에이전트를 출시했다"가 아니라, **"DeepSeek Harness 팀이 사내에서 돌리는 구조의 설계 에세이 + 그 일부를 구현한 연구용 플러그인을 MIT로 공개했다"**가 정확한 표현입니다. 이 플러그인은 DeepSeek Harness 위에서 도는 번들이고, 이벤트 소스로는 GitHub와 (선택적으로) Feishu를 지원합니다.

## 설계는 어떻게 생겼나

원 글은 Super-agent의 네 가지 성질을 정의합니다. **Continuous**(채널이 바뀌어도 하나의 에이전트처럼 보임), **Productive**(여러 작업을 병렬로), **Proactive**(지시를 기다리지 않고 이벤트에 반응), **Persistent**(항상 켜져 있고 이상 상황에서 스스로 복구). 그리고 이를 받치는 모듈을 **여섯이 아니라 다섯 개**로 제시합니다.

| 원 글 섹션 | 모듈 | 한 줄 요약 |
|---|---|---|
| §2 | 2계층 구조 (Router / Worker) | 오래 사는 Router가 사람과의 대화·조율만, Worker는 작업별 격리 세션에서 실행 |
| §3 | 이벤트 기반 Trigger | 2단계 필터링, 구독(pass-through) 라우팅, 컨텍스트 Inline & Spill, 선제 실행 |
| §4 | 전이중 멀티채널 상호작용 | 비동기 `start()`/`stop()` 도구로 대화가 블로킹되지 않게, 채널별 응답 규칙 |
| §5 | 컴퓨트·상태·실행 환경 분리 | 에이전트 루프는 클라우드의 무상태 컨테이너, 세션 상태는 DB, 실행 환경은 사용자 기기의 경량 데몬 |
| §6 | Watchdog | 메인 시스템 밖의 독립 세션이 인프라 장애와 Worker의 "헛돌기"를 감시·수리 |

X 포스트의 "여섯 조각"은 이 다섯 모듈에서 필터링(§3.1), 100단어 규칙(§4.2)을 따로 떼어 내고, §5를 "메모리"로 재해석한 요약입니다. 하나씩 보겠습니다.

### 1. 2계층: Router는 판단만, Worker는 실행만

이벤트를 전부 한 세션에 몰면 맥락은 이어지지만 ReAct 루프가 한 번에 한 걸음씩만 가니 느리고, 여러 작업의 중간 과정이 한 컨텍스트에 뒤섞입니다. 이벤트마다 새 세션을 띄우면 빠르지만 작업끼리 맥락이 끊기고, 여러 세션이 제각각 사람에게 답해서 혼란스럽습니다. 원 글의 답은 둘을 층으로 나누는 것입니다.

- **Router 층:** 모든 입구의 사람 상호작용을 받는 장수(long-lived) 세션. 전역 순서점·조율점·메모리 역할. 병목이 되지 않도록 **작업을 직접 실행하지 않고, Bash 도구 없이도 돌 수 있게** 설계했습니다. 원 글은 "Router의 일은 생각보다 단순해서 **더 가벼운 모델**로도 속도와 품질을 다 챙길 수 있었다"고 씁니다.
- **Worker 층:** 작업 하나에 전용 세션 하나, 격리된 컨텍스트와 전체 실행 도구. 코드 품질을 결정하니 **가장 성능 좋은 모델**이 필요하다고 봅니다. Worker는 사람과 직접 말하지 않고 Router에 보고합니다.

재미있는 관찰은 Router의 **자동 배칭**입니다. 한 번 추론하는 동안 쌓인 이벤트는 다음 호출에 한꺼번에 들어가고, Router는 "입력은 길고 출력은 짧은" 일만 하니 prefill에서 병렬로 처리됩니다. 원 글의 스트레스 테스트에서 결정이 필요한 Trigger를 분당 약 1개에서 약 40개로 올렸을 때 평균 배치 크기는 1.0→2.8, 요청당 시간은 2.5초→3.9초, **결정당 상각 추론 시간은 6.4초→1.6초**로 내려갔습니다.

### 2. 이벤트 기반: 코드로 먼저 거르고, 모델은 나중에

실제 채팅방과 코드 플랫폼에 연결하면 이벤트 대부분은 에이전트가 할 일이 없는 잡음입니다. 원 글은 컴퓨터 시스템의 **Fast Path / Slow Path** 개념을 빌립니다.

- **프로그램 정책(Fast Path):** 이벤트 출처, 그룹, 사용자·봇 허용 목록 같은 결정적 조건을 **코드로** 검사해서 모델 호출 전에 대부분을 버립니다. 출처별로 "명시적 요청에만 반응 / 후보 이벤트로 취급 / 무시"를 고를 수 있습니다.
- **의미 정책(Slow Path):** 통과한 후보만 LLM이 맥락과 프롬프트로 쓴 정책을 보고 판단합니다.

라우팅에도 같은 원리를 씁니다. 같은 PR·같은 IM 토픽·같은 메일 체인의 이벤트 흐름을 **Thread**라고 부르고, Router가 첫 이벤트로 Worker를 만들면 그 Worker가 Thread를 **구독**합니다. 이후 이벤트는 코드가 Router를 거치지 않고 Worker에게 직접 넘깁니다(pass-through). Router는 구독자가 없는 새 이벤트만 판단합니다.

여기에 컨텍스트 관리용 **Inline & Spill**(곧 필요할 정보는 창에 넣고, 길거나 드문 정보는 ID·요약만 남겨 필요 시 도구로 읽게 함)과, 이 ID 참조를 따라 여러 단계로 과거 맥락을 되짚는 **Chain of Recall**, 그리고 신호만 보고 백그라운드에서 미리 일을 해 두는 **선제(speculative) 실행**이 붙습니다. "더블클릭 버그" 예시가 바로 이 선제 실행입니다. 원 글은 사내 DeepSeek Harness 사용자 그룹에 **"조용히 재현하고 고치기"** 정책을 걸어 두었고, 이슈를 확인하고 간단한 수정을 찾았을 때만 결과를 내놓고 아니면 끝까지 조용히 있는다고 설명합니다.

### 3. 채널별 응답: IM은 100단어, 자세한 건 PR

§4.2는 채널마다 말투와 밀도를 바꾸라고 합니다. IM에서는 사람을 최소한으로 방해하고, 결정이나 승인이 필요할 때만 짧은 결론을 냅니다. 그리고 *"One simple, effective hard rule we have verified is a cap of 100 words per reply."* GitHub·메일 같은 비동기 채널에서는 문제 배경·변경 내용·검증 결과를 갖춘 구조화된 출력을 냅니다.

이건 프로토타입 코드에도 그대로 있습니다. [`src/infra/text.ts`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/src/infra/text.ts)에 `IM_WORDS = 100`이 상수로 박혀 있고, 중국어까지 세기 위해 `Intl.Segmenter('zh', { granularity: 'word' })`로 단어를 셉니다. [`prompts/replies.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/prompts/replies.md)는 *"100 words is a hard ceiling, not a writing target. The transport rejects longer IM messages"* 라고 못 박고, 긴 복문·세미콜론 연결·여러 메시지로 쪼개기 같은 "우회"까지 금지합니다. 프롬프트로 부탁만 하는 게 아니라 **전송 계층이 거부**한다는 점이 포인트입니다.

### 4. 상태 분리와 Watchdog

§5는 에이전트 루프를 클라우드의 무상태 컨테이너로 돌리고 세션·상태는 DB에 두며, 코드 저장소·로컬 자격 증명이 있는 실행 환경은 사용자 기기에 둔 채 경량 데몬으로만 연결합니다(BYOM, Bring Your Own Machine). 원 글은 Anthropic의 [*Decoupling the brain from the hands*](https://www.anthropic.com/research/managed-agents)와 같은 접근이라고 직접 언급합니다.

§6의 Watchdog은 메인 시스템 밖에서 예약 메시지로 구동되는 독립 세션입니다. API 오류 같은 인프라 장애를 처리하고, **모델로 각 Worker가 실질적으로 진전하는지, 목표에서 벗어났는지**를 판단해 고칩니다. 프로세스는 살아 있는데 모델이 헛도는 상황은 전통적인 liveness probe로는 못 잡기 때문입니다.

### 그림으로 보면 (설명용 스케치)

아래 코드는 **원 글의 구조를 이해하기 위한 설명용 의사 코드**입니다. 실제 dsh-superagent 코드(TypeScript, DeepSeek Harness 플러그인)와는 이름도 구조도 다릅니다.

```python
# 설명용 스케치 — 실제 구현이 아님
from dataclasses import dataclass, field

@dataclass
class Event:
    source: str        # "github", "im" ...
    thread: str        # PR 번호, IM 토픽 등
    sender: str
    text: str
    mentions_agent: bool = False

ALLOWED = {"alice", "bob"}
IM_WORDS = 100

def fast_path(ev: Event) -> str:
    """1단계: 결정적 규칙. 모델 호출 없음."""
    if ev.sender.endswith("[bot]") and ev.source != "ci":
        return "drop"
    if ev.mentions_agent and ev.sender in ALLOWED:
        return "explicit"
    return "candidate"            # 의미 판단이 필요한 것만 남김

@dataclass
class Worker:
    task: str
    model: str = "strongest-model"
    history: list = field(default_factory=list)   # 작업별 격리 컨텍스트
    def on_event(self, ev: Event):
        self.history.append(ev)                    # 후속 이벤트는 Router를 거치지 않음

class Router:                                      # 가벼운 모델, 실행 도구 없음
    def __init__(self, store):
        self.store = store                         # 세션·구독은 모델 밖(DB)에 저장
        self.queue: list[Event] = []

    def handle(self, ev: Event):
        verdict = fast_path(ev)
        if verdict == "drop":
            return
        owners = self.store.subscribers(ev.thread)
        if owners:                                 # 구독된 Thread → pass-through
            for w in owners:
                w.on_event(ev)
            return
        self.queue.append(ev)                      # 새 이벤트만 Router가 판단

    def step(self, llm):
        batch, self.queue = self.queue, []         # 쌓인 Trigger를 한 번에 → 자동 배칭
        for decision in llm.decide(batch):         # accept / ignore
            if decision.accept:
                w = Worker(task=decision.summary)
                self.store.subscribe(decision.thread, w)

    def reply(self, text: str) -> str:
        if len(text.split()) > IM_WORDS:           # 전송 계층에서 거부
            raise ValueError("IM reply over 100 words; put details in the PR")
        return text

def watchdog(store, judge):
    """메인 시스템 밖에서 주기적으로 실행."""
    for w in store.live_workers():
        if judge(w.history) == "looping":          # 모델이 '진전 vs 헛돌기' 판정
            store.restart(w)
```

## 그런데 공개된 코드는 설계를 얼마나 담고 있나

저장소를 직접 클론해서(커밋 `6337fc8`, 2026-10-31) 문서와 소스를 확인했습니다.

**들어 있는 것**

- **코드 게이트 + 모델 판단의 2단계 분류.** [`docs/002-authorization.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md)의 gate는 허용 목록·봇 목록·출처별 admission 표로 결정하고, 통과한 후보만 Eval(모델 판단)로 갑니다. 이 권한 규칙은 프롬프트가 아니라 호스트 코드가 강제합니다.
- **Router 역할의 "main Session"과 Worker 역할의 "Executor".** [`prompts/orchestrator.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/prompts/orchestrator.md)는 *"Workers investigate and implement; never add implementation plans."*, [`docs/004-prompts.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/004-prompts.md)는 *"The main Session only routes … and makes no technical decisions"* 라고 씁니다. main Session은 라우팅용의 작은 도구 세트와 5초 셸 제한을 받고([`docs/003-execution.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md)), Executor만 저장소의 `AGENTS.md`와 코딩 프롬프트를 읽습니다.
- **Thread 구독과 pass-through.** [`docs/001-domain.md`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/001-domain.md)의 Subscription은 Ticket(작업)과 Thread의 다대다 관계이고, 구독된 Thread의 사람 메시지는 Eval을 거치지 않고 해당 Executor에 갑니다. PR이 닫히거나 머지된 뒤에도 구독이 남아, 사람이 다시 말을 걸면 같은 작업이 재개됩니다.
- **IM 100단어 하드 리밋**(위에서 설명), 그리고 main Session이 다른 작업에 건네는 메모는 30단어(`NOTE_WORDS = 30`).
- **역할별 모델 설정.** [`src/app/role-models.ts`](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/src/app/role-models.ts)가 Eval·Executor 역할마다 모델을 지정하고 새 세션에 심습니다. 세션·구독·대기 메시지는 저장소에 영속화되어 재시작 후에도 남습니다(`docs/003-execution.md`). 단, 문서는 *"an existing Session keeps its model"* 이라고 해서, 이미 돌고 있는 세션의 모델을 갈아 끼우는 기능은 아닙니다.

**들어 있지 않거나 다른 것**

- **Watchdog이 없습니다.** 저장소 전체(문서·프롬프트·소스)에서 "watchdog"을 검색하면 한 건도 나오지 않습니다. 대신 모델 제공자·네트워크의 일시적 실패를 지수 백오프로 세 번 재시도하는 수준의 복구(`docs/003-execution.md`)와 health 보드가 있습니다. 원 글의 "Worker가 헛도는지 모델로 판단하는 외부 감시 세션"은 프로토타입에 들어 있지 않습니다.
- **"아무도 태그하지 않았는데 PR을 들고 온다"는 기본 동작이 아닙니다.** 프로토타입의 [철학 문서](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md)는 *"It acts only when asked, or when a written rule allows it"* 이고, 요청받지 않은 일은 팀이 쓴 규칙이 있어야 하며 *"starts in a mode that only records what the agent would have done"* 라고 합니다. 실제로 accept mode의 기본값은 `observe`라서, 선제적 후보는 평가만 하고 "would accept"로 기록할 뿐 아무것도 시작하지 않습니다. `auto`로 바꿔야 원 글 예시처럼 움직입니다.
- **사람이 직접 말 걸 수 있는 채널은 GitHub와 Feishu**입니다. "CI"는 별도 채널이 아니라, 허용된 봇(CI 봇 등)의 메시지가 선제 후보나 구독 Thread의 맥락으로 들어오는 형태입니다.

## 실험 결과는 믿을 만한가

원 글 §7은 스스로 *"synthetic workloads and simplified environments … the results below are indicative only"* 라고 단서를 답니다. 약 300개 메시지(그중 실제 작업 요청 약 20개)를 흘려보내고, 코딩 작업은 시간만 소비하는 가짜 도구로 대체해 **스케줄링·조율만** 비교했습니다. 각 설계를 5번씩 돌린 결과입니다.

| 설계 | 작업 완료 시간 p50 / p95 (분) | 실행당 cache-read 토큰 |
|---|---|---|
| Super-agent | 12.4 / 15.7 | 23.2M |
| Super-agent (pass-through 없음) | 12.6 / 15.5 | 31.8M |
| 단일 세션 + Subagent 도구, 중립 프롬프트 | 20.4 / 29.5 | 6.1M |
| 단일 세션 + Subagent 도구, 위임 우선 프롬프트 | 13.8 / 29.0 | 10.8M |

읽을 거리는 세 가지입니다.

- 단일 세션 방식은 **프롬프트에 크게 좌우**됐습니다. 중립 프롬프트에선 5번 모두 서브에이전트를 한 번도 안 불렀고, 위임 우선 프롬프트에서도 1번은 "작은 일"이라며 직접 해서 꼬리가 길어졌습니다. 2계층 구조는 이 판단을 **시스템 수준에서 강제**합니다.
- Super-agent는 **토큰을 더 써서(23.2M vs 6.1~10.8M) 시간을 산** 구조입니다. 공짜 점심은 아닙니다.
- pass-through를 빼도 완료 시간은 거의 같았지만, Router 결정이 약 30% 늘고 토큰이 약 37% 늘었습니다. 즉 pass-through는 속도보다 **Router 비용**을 줄이는 장치입니다.

## 팩트 체크

X 포스트(@iamsupersocks)의 주장을 원 글·저장소와 대조했습니다. ✅ 사실 / ⚠️ 부분적으로 사실·과장·검증 한계 / ❌ 사실 아님

| 주장 | 판정 | 근거 |
|---|---|---|
| DeepSeek가 공개했다 | ⚠️ | 출처는 진짜: deepseek-ai GitHub 조직의 저장소, @DeepSeekHarness 프로필은 deepseek.com/en/harness로 연결. 그러나 글과 README 모두 *"not an official DeepSeek product"*, 글은 *"not an introduction to existing features of DeepSeek Harness"*. 공식 @deepseek_ai의 언급은 찾지 못함. [저장소](https://github.com/deepseek-ai/dsh-superagent-prototype) · [원 글](https://x.com/DeepSeekHarness/status/2116857257245987236) · [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) |
| 코드가 MIT 라이선스 | ✅ | LICENSE: MIT, Copyright (c) 2026 DeepSeek Harness Team. [LICENSE](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/LICENSE) |
| "전체 설계도(plan complet)를 코드와 함께" | ⚠️ | 설계 글은 공개됐지만, README가 *"not identical to … the implementation described in [the article]. Some designs … are not implemented in this prototype"*. Watchdog 등은 코드에 없음. [README](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/README.md) |
| 설계가 여섯 조각으로 되어 있다 | ⚠️ | 원 글은 **다섯 모듈**(2계층·이벤트 기반·전이중 멀티채널·컴퓨트/상태/환경 분리·Watchdog). 포스트의 6분류는 재구성한 요약. [원 글 §1](https://x.com/DeepSeekHarness/status/2116857257245987236) |
| 1) 코드 규칙이 모델 호출 전에 노이즈를 버린다 | ✅ | 원 글 §3.1 programmatic policies(Fast Path). 프로토타입의 gate·admission 표도 코드로 강제. [002-authorization](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md) |
| 2) Router: 가벼운 모델, 유일한 대화 창구, 배분만 하고 코딩 안 함 | ✅ | §2.1: 작업 실행 안 함, Bash 없이 가능, "a lighter model can usually provide both speed and quality". §2.2: Worker는 사람과 직접 대화 안 함. 프롬프트도 *"Workers investigate and implement"*. [orchestrator.md](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/prompts/orchestrator.md) |
| 3) Worker: 작업당 격리 세션, 최고 모델, 추적 중인 PR 후속은 Worker로 직행 | ✅ | §2.2 "usually need the most capable models", §3.2 subscription & pass-through. 프로토타입 Subscription 규칙과 일치. [001-domain](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/001-domain.md) |
| 4) 채팅 응답 최대 100단어, 상세는 PR | ✅ | §4.2 "a cap of 100 words per reply". 코드 `IM_WORDS = 100`, 전송 계층이 초과 메시지 거부. [text.ts](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/src/infra/text.ts) · [replies.md](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/prompts/replies.md) |
| 5) Watchdog이 Worker의 진전/헛돌기를 판단하고 수리 | ⚠️ | 원 글 §6에는 정확히 있음. 하지만 공개 프로토타입에는 Watchdog 구현이 없음(저장소 전체 검색 0건). "코드와 함께"라는 맥락에선 과장. |
| 6) 메모리가 모델 밖에 있어 역할별로 모델을 바꿔도 잃지 않는다 | ⚠️ | 원 글 §5.1은 세션·상태를 DB에 두는 "컴퓨트-상태 분리"이고, 목적은 상시 온라인. 역할별 모델 지정은 프로토타입에 있음(role-models.ts). 다만 원 글은 장기 메모리를 미해결 과제(§8.1)로 꼽고, 기존 세션은 모델이 바뀌지 않음. [003-execution](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md) |
| 예시: 단체방 더블클릭 버그, 태그 없이 원인과 PR | ⚠️ | 원 글 §1·§3.4가 "@멘션 없이도 원인을 찾아 PR"하는 사내 인스턴스를 설명(구체적 사례는 이미지로 제시). 단, 사내 인스턴스 이야기이고, 프로토타입 기본값(`observe`)에선 선제 작업을 기록만 함. [000-philosophy](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md) |
| 병목은 사람의 주의력, 세션 3~5개가 한계 | ✅ | §1 "a person can usually follow only 3 to 5 active sessions at once … multi-tasking is limited by human attention". 단, 팀의 경험칙이지 측정값은 아님. |
| 다른 회사들도 다 같은 걸 만든다 / 폐쇄형 연구소는 에이전트를 팔고 DeepSeek는 설계를 준다 | ⚠️ | 포스트 작성자의 의견. 원 글은 "비슷한 제약은 비슷한 구조를 낳는다"고만 함. 검증 대상 아님. |

**총평:** 헤드라인 "DeepSeek가 MIT로 공개"는 **출처와 라이선스는 사실**이지만, DeepSeek Harness 팀 스스로 "공식 제품이 아닌 연구용 프로토타입"이고 "글의 설계 일부는 구현되지 않았다"고 밝혔습니다. 포스트가 꼽은 여섯 요소 중 분류·Router·Worker·100단어 규칙은 글과 코드 모두에서 확인되고, **포스트 작성자가 "내게 없던 조각"이라며 가장 반긴 Watchdog은 정작 공개 코드에 없습니다.**

## 개발자로서 가져갈 점

1. **"누가 거르고, 누가 판단하고, 누가 실행하는가"를 역할로 분리하라.** 단일 세션에 "필요하면 위임해"라고 프롬프트로 부탁하는 것보다, Router가 실행 도구를 아예 갖지 않게 만드는 편이 결과가 안정적이었다.
2. **싸고 결정적인 판단은 코드로.** 허용 목록·출처·봇 여부 같은 건 모델에게 묻지 말고 Fast Path에서 끝내라. 권한 규칙은 프롬프트가 아니라 호스트가 강제해야 프롬프트 인젝션에도 버틴다.
3. **사람의 주의력이 진짜 예산이다.** IM 100단어 상한을 "부탁"이 아니라 전송 계층의 거부로 구현한 것은 그대로 가져다 쓸 만한 패턴이다.
4. **선제적 에이전트는 '관찰 모드'로 시작하라.** 프로토타입도 기본값은 "했을 일을 기록만" 하는 `observe`다. 팀 채팅에서 아무도 부르지 않았는데 PR이 날아오는 경험은, 결과가 틀리면 그만큼 비싸다.
5. **헤드라인과 README 사이의 거리를 확인하라.** "공식", "전체", "코드 포함"은 저장소 첫 줄의 면책 문구 하나로 의미가 크게 달라진다.

## 참고 자료

- DeepSeek Harness 팀(Yujia Qiao 외), *Exploring Super-agent Design: Towards a More Autonomous Agent System* (X 아티클, 중국어 원문의 기계 번역, 2026-11-01) — [x.com/DeepSeekHarness](https://x.com/DeepSeekHarness/status/2116857257245987236)
- GitHub: [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) — [README](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/README.md) · [LICENSE (MIT)](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/LICENSE) · [000 Philosophy](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md) · [001 Domain](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/001-domain.md) · [002 Authorization](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md) · [003 Execution](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md) · [004 Prompts](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/004-prompts.md)
- GitHub: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [DeepSeek Harness 소개 페이지](https://www.deepseek.com/en/harness/)
- Anthropic, *Decoupling the brain from the hands* (원 글이 비교 대상으로 인용) — [anthropic.com](https://www.anthropic.com/research/managed-agents)
- X 계정: [@DeepSeekHarness](https://x.com/DeepSeekHarness) · [@deepseek_ai](https://x.com/deepseek_ai)
- 원본 X 포스트: [@iamsupersocks](https://x.com/iamsupersocks/status/2116948152821428432)
