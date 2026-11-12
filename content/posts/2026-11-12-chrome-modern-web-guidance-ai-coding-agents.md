---
title: "212개 기능이 아니다: Modern Web Guidance 1.0이 에이전트에 넣는 것"
date: 2026-11-12
time: "20:20"
slug: chrome-modern-web-guidance-ai-coding-agents
tags: [Chrome, Baseline, 코딩 에이전트, 웹 플랫폼, 팩트체크]
summary: "v1.0.0(2026-11-10)은 사용 사례 가이드 203개로 웹 기능 250개를 다룬다. 212는 2026-11-06 평가의 태스크 수이고, 56%에서 88%는 한 행의 쌍이 아니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@DeepTechTR의 포스트](https://x.com/DeepTechTR/status/2120646729687265589)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2120646729687265589](https://x.com/i/status/2120646729687265589)입니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`(`developer.billing.write` 없음)으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2120646729687265589)(`code` 200)으로 읽었습니다. `created_at`은 `Wed Nov 11 22:35:54 +0000 2026`, **2026-11-12 07:35 KST**입니다. `screen_name`은 `DeepTechTR`, 표시 이름도 DeepTechTR, 사용자 id는 `1858176282032496640`, 팔로워 31,193, `verification.type`은 `individual`, `lang`은 `tr`입니다. 같은 응답의 스냅샷은 답글 0, 리포스트 16, 좋아요 207, 북마크 223, 인용 0, 조회 11,511입니다. 커뮤니티 노트는 `null`입니다. 본문은 터키어로, AI가 프론트엔드를 쓸 때 2019년 수준에 머물고 훈련 데이터가 옛 코드로 차 있으며, Chrome 팀이 `modern-web-guidance`로 212개 현대 웹 기능을 넣고, Claude Code·Codex·Copilot·Antigravity에서 성공률이 56%에서 88%로 올랐으며, 설치는 `npx modern-web-guidance` 한 줄이라고 적습니다. 그 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-12 20:15 KST 전후에 연 1차 자료입니다. [Philip Walton, Chrome for Developers, 2026-11-10](https://developer.chrome.com/blog/modern-web-guidance-v1), [문서 개요](https://developer.chrome.com/docs/modern-web-guidance), [Get started](https://developer.chrome.com/docs/modern-web-guidance/get-started), 배포 저장소 [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) `main` README와 [v1.0.0 릴리스](https://github.com/GoogleChrome/modern-web-guidance/releases/tag/v1.0.0)(`published_at` `2026-11-10T03:24:59Z`), 소스 저장소 [GoogleChrome/modern-web-guidance-src](https://github.com/GoogleChrome/modern-web-guidance-src) README, 태그 `v1.0.0`의 [`declarative-dialog-popover-control` 가이드](https://github.com/GoogleChrome/modern-web-guidance/blob/v1.0.0/skills/modern-web-guidance/guides/ui-behaviors/declarative-dialog-popover-control.md), [npm `modern-web-guidance@1.0.0`](https://www.npmjs.com/package/modern-web-guidance), [Baseline](https://web.dev/baseline), [평가 대시보드](https://googlechrome.github.io/modern-web-guidance-src/), [Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)입니다. 가이드 전문을 에이전트에 넣어 재실행하지 않았고, 평가 하네스를 다시 돌리지 않았습니다.

## 왜 중요한가

코딩 에이전트는 이미 동작하는 페이지를 만듭니다. Chrome 블로그의 문장은, 최신 프론티어 모델이 대체로 돌아가는 결과를 내도 웹 개발 전문가가 보면 더 빠르거나, 더 접근 가능하거나, 더 안전한 쪽으로 고칠 자리가 거의 항상 남는다는 것입니다. README는 그 이유를 훈련 데이터에 옛 코드가 많다는 데 둡니다. 플랫폼에 이미 있는 HTML·CSS로 끝날 일을, 모델이 JavaScript로 다시 짜는 패턴입니다.

Modern Web Guidance는 그 간격을 메우려고 만든 **에이전트 스킬과 CLI**입니다. 가이드와 Baseline·브라우저 호환 데이터를 에이전트 컨텍스트에 넣습니다. 안정판 1.0의 날짜는 **2026-11-10**입니다. 블로그는 프리뷰를 “at Google I/O in May”라고만 적고, 그 5월의 연도는 적지 않습니다. npm 패키지 생성 시각은 `2026-04-30T23:06:37.931Z`이고, 레지스트리에 올라온 첫 버전 `0.0.101`의 시각은 `2026-05-12T01:21:02.990Z`입니다. 패키지 기록상 그 5월은 1.0과 같은 해입니다.

1.0의 범위는 트윗의 한 줄보다 넓습니다. 릴리스 노트 첫 문장은 사용 사례 가이드 **203개**가 웹 플랫폼 기능 **250개**를 다룬다고 적고, 관리 주체를 Google Chrome, Microsoft Edge, Mozilla Firefox, MDN과 웹 커뮤니티로 적습니다. 블로그는 Firefox와 Edge가 Chrome에 합류하는 크로스 브라우저 작업이 된다고 적습니다. MDN은 그 문장에는 없고, README와 v1.0.0 릴리스 노트에 있습니다.

확인할 질문은 다음입니다.

- 설치 명령이 `npx modern-web-guidance`인지, `npx modern-web-guidance@latest install`인지.
- 212가 기능 수인지, 평가 태스크 수인지.
- 56%에서 88%가 어느 에이전트·어느 날짜의 쌍인지.
- 가이드가 실제로 무엇을 권하고, Baseline을 어디에 두는지.

## 기술 설명

### 스킬이 켜지고, 검색은 로컬에서 끝난다

README “How It Works”의 순서는 세 단계입니다.

1. **Activation.** 웹 플랫폼이 관련된 작업이면 에이전트가 `modern-web-guidance` 스킬을 켭니다. 스킬은 웹 플랫폼 질문에 CLI를 쓰라고 지시합니다.
2. **Local Semantic Search.** 에이전트가 `modern-web-guidance search "<query>"`를 실행합니다. 매칭은 오프라인, 의존성 없는 임베딩 모델과 **BM25**입니다. 이 검색 단계의 네트워크 호출과 API 키는 없습니다.
3. **Guide Fetch.** `modern-web-guidance retrieve <id>`가 그 가이드의 코드 패턴, 함정, 폴백을 컨텍스트에 넣습니다.

v1.0.0 릴리스 노트는 검색이 TensorFlow.js에서 빠져 나왔고, npm 다운로드가 **23.5MB에서 8.8MB**로 줄었다고 적습니다. 2026-11-12에 읽은 레지스트리 `dist`에는 `size` 필드가 없고 `unpackedSize`는 **16,503,129**바이트, `fileCount`는 280입니다. 8.8MB는 릴리스 노트의 “npm download”이고, 16,503,129바이트는 풀어 둔 패키지 크기입니다. 두 수를 같은 측정으로 두지 않습니다.

패키지를 받은 뒤의 `search`와 `retrieve`는 로컬입니다. `npx …@latest`로 패키지를 새로 받는 단계는 네트워크가 있습니다. README 팁의 문장은, 내용이 오래되지 않게 `npx`를 쓰고 CLI 자체는 오프라인이라는 것입니다.

Get started 문서가 예시로 붙인 검색 결과에는 가이드마다 `tokenCount`가 있습니다. 질의 `"animate a dialog modal backdrop"`의 상위 결과에 `light-dismiss-a-dialog` **1085**, `animate-to-from-top-layer` **1541**, `declarative-dialog-popover-control` **2684**, `html` **5484**, `accessibility` **7129**가 있습니다. 203개 가이드를 한 번에 넣지 않고, 고른 가이드의 토큰만 올라갑니다. 스킬 팩 설명 자체는 별도 크기입니다. README는 `modern-web-guidance` 팩을 약 **205**토큰, `chrome-extensions` 팩을 약 **175**토큰으로 적습니다. 그 수는 가이드 본문이 아닙니다.

v1.0.0은 검색이 약할 때의 재작성도 스킬에 넣었습니다. 릴리스 노트는 에이전트가 `"confirm destructive action"` 같은 의도 문장을 `"confirmation modal dialog"` 같은 UI 프리미티브로 바꾸고, 약한 `search`를 한 번 다시 쓴 뒤 `list`로 내려간다고 적습니다.

### 가이드가 다루는 것

README는 기능을 세 묶음으로 셉니다. **CSS & Layout 140**, **HTML & DOM 36**, **JavaScript & APIs 74**. 140+36+74 = **250**이고, 같은 README의 제목도 “250 modern web features”입니다. 그 아래 사용 사례 목록의 가이드 id를 2026-11-12에 세면 **203개, 중복 없음**입니다. 제목의 “203 real-world developer use cases”와 같습니다.

분야 이름은 문서와 README가 같이 적습니다. 이 글이 예시로 짚는 것만 적습니다.

| 에이전트가 자주 손대는 자리 | 가이드가 가리키는 플랫폼 기능 | 1차 자료의 위치 |
|---|---|---|
| 툴팁·메뉴를 `absolute`와 좌표 JS로 붙임 | CSS Anchor Positioning, Popover | README Forms & UI, 가이드 `position-aware-tooltips` |
| 모달을 div와 클릭 리스너로 여닫음 | `<dialog>`, Invoker Commands (`commandfor` / `command`) | 가이드 `declarative-dialog-popover-control` |
| 페이지 전환을 JS로 크로스페이드 | View Transitions | README User Experience |
| 뷰포트 너비에만 미디어 쿼리 | 컨테이너 쿼리 | 가이드 `size-aware-styling`, Get started의 CSS 절 |
| 긴 작업을 `setTimeout`으로 쪼갬 | `scheduler.yield` | README Performance 절의 INP·스케줄링 |
| 입력 칸 너비를 JS로 재측정 | `field-sizing: content` | Get started Forms, 가이드 `form-fields-automatically-fit-contents` |
| 빈 칸에도 즉시 오류 스타일 | `:user-invalid` | Get started Forms, 가이드 `validate-input-after-interaction` |
| 비밀번호만 있는 로그인 | 패스키, WebAuthn | README 보안 가이드 `passkey-registration` 외 6개. v1.0 노트는 그중 7개 가이드가 Signal API에 서버가 준 `rpId`를 넘기라고 고쳤다고 적습니다 |

접근성, CSP, Sanitizer, 추측 규칙(speculation rules), 온디바이스 번역·요약·언어 감지, WebMCP도 같은 목록에 있습니다. HTML-in-Canvas는 HTML & DOM 36개 안의 기능 이름입니다. 그 API의 출시 사실은 [앞 글](https://betelg15.github.io/posts/chrome-157-html-in-canvas/)이 다룹니다. 이 글은 그 스펙을 다시 풀지 않습니다.

가이드는 “모델이 이미 아는 최저 공통분모”를 평가로 덜어 낸다고 README가 적습니다. 폴백은 무조건 큰 폴리필이 아닙니다. README는 더해지기만 하는 향상(추측 프리로드처럼 옛 브라우저가 무시해도 되는 것)과, 대화상자처럼 동작이 필요한 경우를 나누고, 후자는 50줄 미만의 맞춤 폴백이나 조건부로 읽는 폴리필을 우선한다고 적습니다.

### 옛 클릭 리스너와, 가이드가 보여주는 선언적 대화상자

아래 첫 예는 이 글의 **설명용 스케치**입니다. 가이드 원문이 아닙니다. README가 말하는 “플랫폼에 답이 있는데 JavaScript로 다시 짜는” 형태를, 모달 하나에 압축한 것입니다.

```html
<div id="modal" role="dialog" aria-modal="true" hidden>
  <p>Are you sure?</p>
  <button type="button" id="cancel">Cancel</button>
</div>
<button type="button" id="open">Open</button>
<script>
  const modal = document.getElementById("modal");
  document.getElementById("open").addEventListener("click", () => {
    modal.hidden = false;
    document.getElementById("cancel").focus();
  });
  document.getElementById("cancel").addEventListener("click", () => {
    modal.hidden = true;
  });
</script>
```

포커스 트랩, Esc, 배경 클릭, `inert`, 접근성 트리에서 나머지 페이지를 빼는 일은 이 스케치에 없습니다. 그 공백을 라이브러리나 더 긴 스크립트로 채우는 쪽이, 블로그가 말하는 “돌아가는 코드와 전문가가 고치는 코드”의 차이입니다.

v1.0.0 가이드 `declarative-dialog-popover-control`은 그 여닫기를 버튼 속성으로 옮깁니다. 아래는 그 파일의 팝오버·모달 예를 줄인 것이고, 가이드의 “MANDATORY” 주석은 뺐습니다. 전문은 저장소에 있습니다. 가이드 문서는 CC BY 4.0입니다.

```html
<button commandfor="my-popover" command="toggle-popover">
  Toggle Popover
</button>
<div id="my-popover" popover>
  <p>Popover content goes here.</p>
</div>

<button commandfor="confirm-dialog" command="show-modal">
  Open Confirmation
</button>
<dialog id="confirm-dialog">
  <p>Are you sure you want to proceed?</p>
  <button commandfor="confirm-dialog" command="close">Cancel</button>
</dialog>
```

같은 가이드가 적은 Baseline은 이렇습니다. Invoker Commands는 **Newly available**, Baseline이 된 날은 **2025-12-12**, 지원 버전은 Chrome 135(2025-04), Edge 135(2025-04), Firefox 144(2025-10), Safari 26.2(2025-12)입니다. Popover는 **Newly available**, **2025-01-27**, Chrome 116(2023-08), Edge 116(2023-08), Firefox 125(2024-04), Safari 17(2023-09), iOS Safari 18.3(2025-01)입니다. 이 버전 표는 그 가이드가 집어넣은 호환 데이터입니다. 이 글이 MDN을 다시 열어 버전을 재지 않았습니다.

같은 파일이 요구하는 폴백은 기능 탐지 뒤에 **조건부** `import`입니다.

```javascript
if (!("commandForElement" in HTMLButtonElement.prototype)) {
  import("invokers-polyfill");
}
```

가이드는 `popovertarget`과 `commandfor`를 같은 버튼·같은 팝오버에 같이 쓰지 말라고 적습니다. 두 번 토글됩니다. 팝오버 폴리필은 `HTMLElement.prototype`의 `popover`를 `Object.hasOwn`으로 보고, 없을 때만 `@oddbird/popover-polyfill`을 읽으라고 적습니다. 폴리필은 `:popover-open` 의사 클래스를 만들지 못하고 `.\:popover-open` 클래스를 붙이므로, 선택자는 `:is(:popover-open, .\:popover-open)`처럼 묶으라고 합니다. 옛 브라우저는 모르는 의사 클래스가 있는 규칙 전체를 버립니다.

`showModal()`을 클릭 리스너에서 부르는 코드는 이미 `<dialog>`를 씁니다. 그 가이드가 바꾸는 것은 리스너입니다. “2019년 jQuery를 `<dialog>`로 바꾼다”와 “리스너 없이 `commandfor`로 연다”는 다른 단계입니다. 1.0의 목록에는 두 단계가 모두 있습니다.

### 설치, Baseline, 스캔

문서가 권하는 설치는 프로젝트 디렉터리에서 다음입니다.

```bash
npx modern-web-guidance@latest install
```

이미 깔려 있으면 `npx modern-web-guidance@latest update`입니다. 에이전트 스킬 CLI로는 `npx skills add GoogleChrome/modern-web-guidance`입니다. Get started는 이 밖에도 Claude Code, Codex, Copilot CLI, Gemini CLI, Antigravity, Goose, Grok, Kimi Code, WebStorm, `gh skill install`을 적습니다. 블로그의 마켓플레이스 목록에는 Cursor도 있습니다.

설치 없이 가이드만 볼 때는 README의 세 명령입니다.

```bash
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
npx modern-web-guidance@latest legacy-scan .
```

`legacy-scan`은 v1.0에 들어온 정적 분석입니다. 릴리스 노트는 옛 패턴을 찾고, 각 발견을 대체 가이드에 연결하며, **결정적 규칙이 있는 가이드의 대략 20%**를 덮는다고 적습니다. 스킬의 대응 절차는 scan, verify, report, modernize 네 단계입니다. 블로그가 에이전트에 보여주는 문장은 `/modern-web-guidance Modernize the code in this directory`입니다. 노트는 범위를 일부러 좁혀 결과가 예측 가능하게 시작했다고 적고, 나중에는 패턴 매칭을 넘어 에이전트가 코드를 직접 읽는 감사로 넓히겠다고 적습니다.

Baseline 목표는 `AGENTS.md` 또는 `CLAUDE.md`에 적습니다. Get started의 예는 `This project's Baseline target is Baseline 2024.`입니다. **목표를 적지 않으면 기본값은 Baseline Widely available**입니다. [web.dev/baseline](https://web.dev/baseline)의 정의는 세 칸입니다. Limited availability는 아직 상호운용되지 않음, Newly available은 핵심 브라우저가 모두 지원하기 시작한 뒤 30개월 미만, Widely available은 그 시점부터 30개월 이상입니다. 핵심 브라우저 집합은 Chrome(데스크톱·Android), Edge, Firefox(데스크톱·Android), Safari(macOS·iOS)입니다. Baseline을 만든 곳은 Chrome 팀이고, 지금은 WebDX Community Group이 정의합니다. Widely가 아닌 기능의 가이드는 폴백 절차를 같이 줍니다. 폴리필이 필요하면 조건부로만 읽으라고 문서가 적습니다.

실험 기능은 기본으로 `retrieve`가 막혀 있습니다. 검색에는 나와도, 오리진 트라이얼은 `npx modern-web-guidance@latest set-allow-origin-trials`, 단일 엔진이거나 아직 흔들리는 기능(volatile, 최근 3개월 또는 안정화 중)은 `npx modern-web-guidance@latest set-allow-volatile-features`로 `.mwgrc`에 옵트인해야 열립니다. 확장 프로그램을 만들 때는 `npx modern-web-guidance@latest install --choose`로 `chrome-extensions` 팩을 고릅니다.

텔레메트리는 기본으로 켜져 있습니다. README는 설치 횟수, 호출한 에이전트 이름, 가이드 id, 에이전트가 만든 검색 질의를 익명으로 모으고, 사용자 프롬프트 원문은 모으지 않는다고 적습니다. 끄려면 `DISABLE_TELEMETRY=1`입니다. 코드 라이선스는 Apache-2.0, `guides/` 문서는 CC BY 4.0입니다. 문서 일부는 MDN, W3C, WHATWG, IETF에서 왔다고 README가 적습니다.

### Chrome DevTools for agents와 짝

블로그는 작성(Modern Web Guidance)과 실행 확인(Chrome DevTools for agents)을 나눕니다. DevTools for agents는 다른 패키지입니다. 문서의 진입은 MCP 서버 `chrome-devtools-mcp`, CLI, 스킬이고, 주소는 [developer.chrome.com/docs/devtools/agents](https://developer.chrome.com/docs/devtools/agents)입니다. 블로그가 짝으로 드는 예는 세 가지입니다. 저사양 CPU를 시뮬레이트한 트레이스로 메인 스레드 차단이 50ms를 넘지 않게 맞추기, 애니메이션 녹화와 `prefers-reduced-motion` 확인, SPA 뷰 캐시의 메모리 증가 확인입니다. 50ms는 그 글이 INP에 연결해 적은 기준입니다. 이 글은 DevTools 쪽 설치를 재현하지 않았습니다.

## 평가 결과

평가는 제작자가 돌립니다. 소스 README의 파이프라인은 전문가 가이드와 데모, 실제 웹앱 위의 태스크와 Playwright 채점, 정답 구현은 통과 100%·손대지 않은 베이스 앱은 통과 0%가 될 때까지의 보정, 그다음 가이드를 켠 실행과 끄지 않은 실행의 비교입니다. 프롬프트는 API 이름을 일부러 적지 않습니다. 대시보드 페이지가 정적 HTML에 적어 둔 정의는, 통과율이 실행된 검사 중 통과한 검사의 비율이고, 채점 전에 죽거나 시간 초과한 실행은 짝과 함께 빼며, 리프트는 퍼센트포인트라는 것입니다. 접근성 자동 검사는 키보드, 포커스와 `inert`, `prefers-reduced-motion`과 대비, ARIA, 폼 레이블의 일부이고, **WCAG 전체 감사가 아니라고** 같은 페이지가 적습니다.

2026-11-12에 [평가 대시보드](https://googlechrome.github.io/modern-web-guidance-src/)를 가져왔을 때 표 자리는 “Loading…”, 실행 목록은 “No test runs found yet”이었습니다. 숫자는 클라이언트 렌더 뒤에 있습니다. 아래 표는 그 렌더 결과가 아니라, 같은 날 읽은 **배포 저장소 README의 “Recent eval results snapshot”**입니다. 소스 README의 같은 절과 숫자가 같았습니다. 연도는 표에 없고, 릴리스 일정과 맞춰 2026년으로 읽습니다.

| 날짜 | 에이전트 + 모델 | 태스크 / 어서션 | 비가이드 → 가이드 (리프트) |
|---|---|---:|---|
| Nov 8 | antigravity_cli (gemini-4-argon) | 214 / 1673 | 58% → 94% (+36pp) |
| Nov 8 | codex_cli (gpt-6.1-sol) | 215 / 1795 | 54% → 82% (+28pp) |
| Nov 8 | claude_code (opus-5-5) | 215 / 1801 | 57% → 88% (+31pp) |
| Nov 6 | codex_cli (gpt-6.1-sol) | 212 / 1773 | 53% → 86% (+33pp) |
| Nov 6 | claude_code (opus-5-5) | 212 / 1773 | 56% → 90% (+34pp) |
| Nov 6 | antigravity_cli (gemini-4-argon) | 212 / 1722 | 60% → 96% (+36pp) |
| Nov 4 | codex_cli (gpt-6.1-sol) | 209 / 1743 | 52% → 85% (+33pp) |
| Nov 4 | claude_code (opus-5-5) | 209 / 1743 | 57% → 90% (+33pp) |
| Nov 4 | antigravity_cli (gemini-4-argon) | 207 / 1722 | 60% → 96% (+36pp) |
| Nov 2 | codex_cli (gpt-6.1-sol) | 205 / 1729 | 55% → 82% (+27pp) |

README 스냅샷의 Nov 2 행은 Codex 한 줄에서 끊겨 있습니다. v0.0.197 릴리스 노트(페이지 표시 “02 Nov 14:56”)의 같은 주제 표는 세 줄입니다. codex_cli (gpt-6.1-sol) **205 / 1729, 55% → 82%, +27pp**. claude_code (claude-opus-5-5) **205 / 1729, 58% → 90%, +32pp**. antigravity_cli (gemini-4-argon) **205 / 1705, 61% → 96%, +35pp**. 태스크 수는 같고 어서션 수는 Antigravity만 1705입니다.

Get started는 “early results”의 평균으로 현대 관행 준수가 **37퍼센트포인트** 올랐다고 적고, 프로젝트·모델·프롬프트·에이전트에 따라 달라진다고 적습니다. 그 37을 만든 날짜와 가중치는 그 페이지에 없습니다. 위 Nov 8 세 행의 리프트를 이 글이 단순 평균하면 (36+28+31)/3 = **31.7pp**입니다. 이 평균은 이 글의 계산이고, 태스크 수가 214와 215로 다르므로 공식 집계가 아닙니다. 37pp와 11월 8일 표를 같은 수로 두지 않습니다.

읽을 때 남는 제한은 다섯 가지입니다. 하네스·태스크·채점기·정답 구현이 모두 이 프로젝트의 것입니다. 통과율은 프로덕션 버그율이나 사용자 과제 성공률이 아닙니다. 태스크 수가 날짜와 에이전트마다 달라 212를 기능 수로 읽을 수 없습니다. “With MWG”가 100%가 아닌 이유를 대시보드 문장은, 프롬프트가 MWG를 언급하지 않아 에이전트가 가이드를 스스로 찾아야 하기 때문이라고 적습니다. 채점기가 가이드와 다른 정당한 구현을 떨어뜨리면 저장소에서 어서션을 넓혀 다시 채점한다고도 적습니다. 그 문장대로라면 과거 점수는 채점기 수정과 함께 움직일 수 있습니다.

## 비즈니스 인사이트

숫자 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다. 아래 도입 사례의 퍼센트는 Chrome 블로그가 2026-11-10에 옮긴 고객 진술입니다. 이 글이 저장소나 작업 시간을 감사하지 않았습니다.

**브라우저 벤더가 에이전트의 출력 분포를 건드린다.** 1.0의 관리 주체는 Chrome, Edge, Firefox, MDN입니다. 설치면은 각 에이전트 제품의 플러그인 마켓플레이스입니다. 블로그가 이름을 적은 곳은 Claude Code, Codex, Cursor, Antigravity, Copilot, WebStorm, Kimi Code, Grok Build입니다. 모델 가중치를 브라우저 팀이 바꾸지 않아도, 스킬이 컨텍스트에 들어가는 순간 생성 코드의 기본값이 바뀝니다.

**Baseline이 그 기본값의 계약이다.** 목표를 적지 않으면 Widely available입니다. Newly인 Invoker Commands(가이드가 적은 Baseline 날 2025-12-12)를 쓰는 저장소는, 목표를 올리거나 가이드가 시키는 조건부 폴리필을 같이 받는 쪽에 섭니다. volatile과 오리진 트라이얼은 옵트인입니다. 최신 Chrome 전용 API를 모든 저장소에 넣는 구조가 아닙니다.

**분석/의견.** 프론트엔드 팀과 에이전시에서 줄어들 수 있는 비용은 “모달 라이브러리를 또 하나 고르는 시간”이고, 늘어나는 비용은 Baseline 목표를 문서로 고정하고, 스킬이 고른 폴백이 그 목표와 맞는지 리뷰하는 시간입니다. `legacy-scan`이 덮는 범위는 릴리스 노트 기준으로 가이드의 대략 20%입니다. 나머지는 에이전트가 `search`를 호출해야 합니다. 스킬을 깔아 두어도 호출하지 않은 턴에는 효과가 없습니다. 대시보드가 100%가 아닌 이유로 적은 것과 같은 구멍입니다.

**토큰은 가이드 단위로 듭니다.** Get started 예시의 `tokenCount`는 한 가이드가 1,085에서 7,129토큰입니다. 203개를 매 턴 넣지 않습니다. 스킬 설명 약 205토큰은 그 본문과 별도입니다. **분석/의견.** 호출당 비용은 가이드 몇 개의 입력 토큰과, 검색이 빗나가 다시 `search`하는 턴입니다. 라이선스 비용은 코드 기준 Apache-2.0이라 좌석 요금이 아닙니다. 남는 운영 비용은 텔레메트리 정책(`DISABLE_TELEMETRY=1`로 끌 수 있음), 플러그인 자동 업데이트, 그리고 벤더 평가를 사내 품질 지표로 오인하지 않는 것입니다.

도입 사례는 블로그가 적은 그대로입니다.

- **Pensionbazaar / Policybazaar.** 인도 핀테크 Paisabazaar가 연 은퇴 설계 서비스 Pensionbazaar가 Modern Web Guidance와 Chrome DevTools for agents를 같이 써서, 턴어라운드를 약 나흘에서 몇 시간으로 90% 넘게 줄이고 새 화면의 UI 버그를 90% 넘게 줄였다고 블로그가 적습니다. 같은 글은 보험 플랫폼 Policybazaar의 등록 고객을 9,700만 명 이상으로 적고, DevTools for agents로 트래픽이 큰 랜딩 약 30곳의 성능 감사를 자동화해 수작업 감사를 92% 줄였다고 적습니다. 인용은 Engineering Manager Aman Soni입니다. 블로그는 브라우저 호환 목표를 지키며 현대 표준으로 유도해 리뷰가 짧아졌다는 그의 문장을 옮깁니다.
- **WeTV.** 텐센트의 해외 동영상 서비스가 CI에 에이전트를 넣어, DevTools for agents로 성능 회귀를 진단하고 Modern Web Guidance로 고친다고 블로그가 적습니다. 실패한 성능 검사의 90%를 자동으로 진단·해결하고, 디버깅과 해결 시간을 87% 줄였다고 적습니다. 네 시간에서 30분이고, 사람 평가가 그 30분에 포함된다고 적습니다. 인용은 Head of Engineering Yangjie Zheng입니다.
- **note inc.** 일본의 크리에이터 플랫폼으로, 월간 활성 사용자 9,000만 명 이상이라고 블로그가 적습니다. 프로덕션 코드베이스에서 180회 평가의 현대 웹 검사 통과율이 61%에서 94%로 올랐고, 스크롤 애니메이션·툴팁·아코디언에서 커스텀 JavaScript 대신 HTML·CSS로 유도한 결과라고 적습니다. 병합된 PR 431개에서 LCP 이미지 우선순위가 제대로 붙은 비율이 28% 올랐다고 적습니다. 인용은 VP of Technology Takehiko Itabashi입니다.
- **MetaMask.** 다운로드 1억 회 이상, 약 190개국이라고 블로그가 적습니다. 오픈소스 브라우저 확장의 모든 PR에 세 줄 프롬프트로 리뷰 봇을 돌렸고, 처음 다섯 주에 PR 약 480개를 보고 64개에 댓글을 달았으며, 엔지니어가 43건을 고쳤다고 적습니다. 대부분은 린터가 잡지 못하는 접근성·HTML 시맨틱·폼이고, 댓글에서 수정까지 중앙값은 15분이라고 적습니다. 인용은 UX Engineer Francis Nepomuceno입니다. 그가 이름을 든 API는 Interest invokers와 Popover입니다.

**분석/의견.** 이 네 곳의 비율은 영업 자료로 쓰기에는 정의가 제각각입니다. note의 61%→94%는 사내 180회 평가의 통과율이고, README의 56%→90% 같은 공개 하네스 행과 분모가 다릅니다. MetaMask의 43/64는 봇이 댓글을 단 PR 가운데 고친 수이지, 전체 PR 480개의 결함률이 아닙니다. WeTV의 87%는 네 시간과 30분의 차이로 설명되어 있어 그 두 시각이 같은 종류의 일인지는 블로그 문장 안에서만 확인됩니다. 재현 절차와 원 로그는 블로그에 없습니다.

**분석/의견.** 도구 회사 입장에서 이 저장소는 모델 기능이 아니라 배포 채널입니다. 마켓플레이스에 공식 플러그인이 있는 에이전트는 “웹 코드를 시키면 Baseline을 읽는다”를 기본에 가깝게 만들 수 있고, 없는 에이전트는 사용자가 `npx`를 쳐야 합니다. 2026-11-12 20:16 KST 전후 GitHub API의 `stargazers_count`는 배포 저장소 **5,771**(포크 192, `pushed_at` `2026-11-10T03:22:38Z`), 소스 저장소 **2,164**(포크 156, `pushed_at` `2026-11-12T09:47:45Z`)입니다. 같은 시각 npm 페이지의 Weekly downloads는 **128,161**입니다. 이 수는 고유 팀 수가 아닙니다. CI와 `npx @latest`가 같은 주를 여러 번 셀 수 있습니다. 채택의 바닥은 “한 줄로 깔린다”이고, 천장은 “사내 디자인 시스템이 가이드와 다를 때 어느 쪽을 따르나”입니다. note는 블로그 인용에서 디자인 시스템과 같이 쓴다고 말합니다. 가이드가 컴포넌트 라이브러리를 대체한다는 문장은 그 인용에 없습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다르거나, 확인한 자료가 그 문장까지 가지 않음 / ❌ 1차 자료와 어긋남

원본은 [@DeepTechTR, 2026-11-12 07:35 KST](https://x.com/i/status/2120646729687265589)입니다. 터키어 본문의 주장을 이 표의 행으로 나눴습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| Google이 AI 프론트엔드가 2019년에 머물렀다고 공식 인정했다 | ❌ | 블로그는 전문가 리뷰에서 속도·접근성·보안을 더 고칠 자리가 남는다고 적습니다. README는 훈련 데이터의 옛 코드 때문에 에이전트가 오래된 패턴으로 기운다고 적습니다. “공식 인정”과 “2019”는 그 문장에 없습니다. |
| 원인 중 하나가 훈련 데이터 속의 레거시 코드다 | ✅ | README Why: “Coding agents often default to older patterns because LLM training data contains vast amounts of legacy code.” |
| Chrome 팀이 modern-web-guidance를 냈다 | ⚠️ | 블로그는 Chrome이 I/O 프리뷰와 1.0을 발표한다고 적습니다. v1.0.0 릴리스와 README의 관리 주체는 Chrome, Edge, Firefox, MDN과 커뮤니티입니다. Chrome만의 산출물로 두면 1.0 문장과 어긋납니다. |
| 212개 현대 웹 기능을 모델에 넣는다 | ❌ | v1.0.0 릴리스와 README는 기능 **250**(140+36+74), 사용 사례 가이드 **203**입니다. 212는 README 스냅샷에서 2026-11-06 세 에이전트의 **태스크 수**입니다. |
| Claude Code, Codex, Copilot, Antigravity에서 동작한다 | ✅ | Get started와 블로그가 이 네 이름을 설치 경로에 적습니다. 같은 문서에는 Gemini CLI, Cursor, Goose, Grok, Kimi, WebStorm, `npx skills`도 있습니다. 네 개로 끝이 아닙니다. |
| 성공률이 56%에서 88%로 올랐다 | ❌ | 그 쌍은 표에 없습니다. 11월 6일 Claude는 **56% → 90%**(212 태스크, +34pp). 11월 8일 Claude의 가이드 통과율 **88%**는 비가이드 **57%**와 짝입니다(215 태스크, +31pp). 56과 88은 다른 날짜의 칸입니다. |
| 설치는 `npx modern-web-guidance` 한 줄이다 | ❌ | 문서·README·블로그의 설치 명령은 `npx modern-web-guidance@latest install`입니다. 갱신은 `update`입니다. |
| v1.0이 2026-11-10에 안정판으로 나왔다 | ✅ | 블로그 Published: November 10, 2026. 릴리스 `published_at` `2026-11-10T03:24:59Z`. npm `1.0.0` 페이지의 Updated `2026-11-10T03:32:13.895Z`. |
| 1.0이 크로스 브라우저 노력이 되었다 | ✅ | 블로그: Firefox와 Edge가 Chrome에 합류. 릴리스 노트: Chrome, Edge, Firefox, MDN이 함께 관리. |
| 검색이 오프라인 임베딩과 BM25다 | ✅ | README How It Works. v1.0.0 노트는 TensorFlow.js를 빼고도 오프라인이라고 적습니다. `npx @latest`로 패키지를 받는 단계는 별개입니다. |
| 평균 개선이 37퍼센트포인트다 | ⚠️ | Get started가 “early results” 평균 37pp라고 적습니다. 날짜와 표본은 그 페이지에 없습니다. README의 11월 8일 세 행을 이 글이 단순 평균하면 31.7pp입니다. |
| 평가가 에이전트마다 가이드를 켜고 끈 비교다 | ✅ | README 파이프라인과 대시보드의 “Controlled A/B tasks”. 점수는 벤더가 공개한 것이고, 이 글이 재실행한 값이 아닙니다. |
| 접근성 자동 검사가 WCAG 전체를 대신한다 | ❌ | 대시보드 문장: 자동 검사는 요구의 일부이며 WCAG 전체나 보조기술 테스트를 대체하지 않습니다. |
| 기존 저장소를 전부 자동으로 현대화한다 | ⚠️ | `legacy-scan`은 v1.0에 있습니다. 릴리스 노트는 결정적 규칙이 있는 가이드의 대략 20%라고 범위를 적습니다. |
| Baseline 목표를 안 적어도 최신 기능을 기본으로 쓴다 | ❌ | Get started: 목표가 없으면 기본값은 **Widely available**입니다. volatile·오리진 트라이얼 `retrieve`는 `.mwgrc` 옵트인이 있어야 열립니다. |
| note의 61%→94%가 공개 하네스의 56%→88%와 같은 실험이다 | ❌ | note 숫자는 Chrome 블로그의 사내 180회 평가입니다. 56과 88은 README 공개 스냅샷의 서로 다른 행입니다. 분모가 다릅니다. |
| npm 주간 다운로드 128,161이 고유 사용자 수다 | ❌ | 그 수는 2026-11-12 npm 페이지의 Weekly downloads입니다. 고유 팀 수라는 필드는 페이지에 없습니다. |

**총평:** 1.0이 실재하고, 스킬과 CLI가 Baseline이 붙은 가이드를 에이전트에 넣으며, 공개 평가에서 가이드를 켜면 통과율이 오른다는 핵심은 1차 자료와 맞습니다. 트윗의 212와 56%→88%는 그 표의 칸을 한 문장으로 붙인 수입니다. 기능은 250개, 가이드는 203개, 11월 6일 Claude의 쌍은 56%→90%, 88%가 적힌 Claude 행은 11월 8일의 57%→88%입니다.

## 참고 자료

- Philip Walton, *Modern Web Guidance 1.0*, Chrome for Developers (2026-11-10) — [blog](https://developer.chrome.com/blog/modern-web-guidance-v1)
- Chrome docs — [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) · [Get started](https://developer.chrome.com/docs/modern-web-guidance/get-started)
- 배포 저장소 README — [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) (기능 250, 가이드 203, How It Works, 평가 스냅샷)
- v1.0.0 릴리스 — [releases/tag/v1.0.0](https://github.com/GoogleChrome/modern-web-guidance/releases/tag/v1.0.0) (`published_at` 2026-11-10T03:24:59Z)
- 소스 README — [GoogleChrome/modern-web-guidance-src](https://github.com/GoogleChrome/modern-web-guidance-src) (평가 파이프라인, 같은 스냅샷)
- 가이드 `declarative-dialog-popover-control` — [v1.0.0 blob](https://github.com/GoogleChrome/modern-web-guidance/blob/v1.0.0/skills/modern-web-guidance/guides/ui-behaviors/declarative-dialog-popover-control.md) (CC BY 4.0)
- npm — [modern-web-guidance@1.0.0](https://www.npmjs.com/package/modern-web-guidance) · 레지스트리 `unpackedSize` 16,503,129
- Baseline — [web.dev/baseline](https://web.dev/baseline)
- 평가 방법 페이지 — [googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/) (2026-11-12 정적 수집본의 표는 Loading)
- Chrome DevTools for agents — [docs](https://developer.chrome.com/docs/devtools/agents)
- 이 블로그의 HTML-in-Canvas 글 — [posts/chrome-157-html-in-canvas](https://betelg15.github.io/posts/chrome-157-html-in-canvas/)
- 원본 X 포스트 — [@DeepTechTR, 2026-11-12 07:35 KST](https://x.com/i/status/2120646729687265589)
