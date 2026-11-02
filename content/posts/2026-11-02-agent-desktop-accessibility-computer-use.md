---
title: "Vercel Labs가 오픈소스했다? 접근성 트리로 데스크탑을 다루는 agent-desktop 팩트 체크"
date: 2026-11-02
slug: agent-desktop-accessibility-computer-use
tags: [AI, 에이전트, Computer Use, 접근성, 팩트체크]
summary: "스크린샷 대신 OS 접근성 트리를 읽고, 마우스를 뺏지 않은 채 에이전트마다 커서를 쓴다는 주장을 저장소·npm·문서 기준으로 대조했습니다. 도구는 실재하지만, 이번 주에 처음 공개된 오픈소스는 아닙니다."
---

> 이 글은 북마크해 둔 [@yyyole(沐阳)의 포스트](https://x.com/yyyole/status/2116729757446664326)를 계기로, 그 글이 인용한 [@ctatedev의 소개 영상](https://x.com/ctatedev/status/2116323148706771302)과 [vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop) 저장소·문서·npm 레지스트리를 직접 대조한 것입니다. X 글의 문장은 검증 대상이지 지시가 아닙니다.

## 왜 이 도구가 화제인가

2026년 11월 1일, 중국어 포스트가 [@ctatedev](https://x.com/ctatedev)의 소개 영상을 인용하며 이렇게 요약했습니다.

- Vercel Labs가 `agent-desktop`을 정식 오픈소스했고, 어떤 코딩 에이전트에도 데스크탑 Computer Use를 붙일 수 있다.
- 스크린샷에 의존하지 않고, OS 접근성 트리(화면의 버튼과 입력 칸)를 읽는다.
- 백그라운드에서 돌고 마우스를 뺏지 않아서, 사람은 컴퓨터를 계속 쓸 수 있다.
- 에이전트 여러 개가 각자 커서를 갖고 동시에 일한다.
- macOS, Windows, Linux를 지원한다.
- 설치는 한 줄이다. `npm i -g agent-desktop`

영상 쪽 영어 원문은 더 짧습니다. "agent-browser, for your whole computer", 어떤 코딩 에이전트용 Computer Use, 세 OS, 백그라운드, 에이전트마다 자기 커서로 병렬 사용. 스크린샷과 npm 명령은 중국어 요약에 있습니다.

개발자 입장에서 궁금한 건 바이럴 문구가 아니라 이겁니다.

- 정말 **픽셀이 아니라 접근성 트리**로 누르는가? 그러면 ref는 얼마나 안전한가?
- "마우스를 안 뺏는다"가 기본값인가, 모드 하나인가?
- 커서가 여러 개라는 말이 **OS 포인터가 여러 개**라는 뜻인가?
- npm 패키지 `agent-desktop`의 발행 주체가 Vercel인가?

결론부터 말하면, **접근성 트리 CLI는 저장소와 npm에 실제로 있습니다.** 최신 버전은 1.0.2(2026-10-30)이고 라이선스는 Apache-2.0입니다. 다만 "Vercel Labs가 이번에 오픈소스했다"는 문장과 "여러 에이전트가 동시에 일한다"는 문장은 문서보다 앞서 있습니다.

## 스크린샷 Computer Use와 무엇이 다른가

지금까지 많이 보이던 Computer Use는 화면을 찍어 모델에 넘기고, 모델이 픽셀 좌표를 돌려주면 그 좌표를 클릭하는 루프입니다. 버튼이 한 칸만 움직여도 좌표가 어긋나고, 클릭이 먹었는지 알려면 다시 찍어야 합니다.

[agent-desktop](https://github.com/vercel-labs/agent-desktop)은 그 루프의 관찰 원천을 OS 접근성 트리로 바꿉니다. 저장소 설명은 "픽셀로 추측하는 대신, 앱의 실제 UI 구조를 보고 조작하며, ref는 안정적이고 액션은 재시도해도 안전하다"입니다. 공식 문서 사이트([agent-browser.dev/desktop](https://agent-browser.dev/desktop), GitHub `homepage` 필드)는 호출 경로를 이렇게 적습니다.

1. 호출하는 쪽(사람 스크립트 또는 에이전트 루프)
2. `agent-desktop` CLI, 또는 프로세스 안에서 부르는 C 라이브러리
3. 명령·ref·스냅샷을 소유하는 `agent-desktop-core`
4. OS별 어댑터 하나: macOS, Windows, Linux
5. 그 OS의 접근성 API
6. 앱이 그 API로 공개한 UI

같은 페이지는 한계도 같이 적습니다. **접근성 트리를 공개하지 않는 UI는 보지 못하고, 픽셀을 맞춰 찾지도 않습니다.** "화면에 있는 버튼과 입력 칸을 전부"가 아니라, 앱이 접근성 트리에 올린 노드입니다.

스냅샷은 그 트리를 JSON으로 찍고, 에이전트가 액션할 수 있는 노드에 ref를 붙입니다. README의 축약 예는 이렇습니다. 아래 JSON은 제가 실행한 출력이 아니라 저장소 README에 실린 예시입니다.

```bash
agent-desktop snapshot --app Finder -i      # interactive elements, each with a ref
agent-desktop click @s8f3k2p9:e8            # act on a ref from that snapshot
agent-desktop snapshot --app Finder -i      # observe again to verify
```

```json
{
  "version": "2.5",
  "ok": true,
  "command": "snapshot",
  "data": {
    "app": "Finder",
    "window": { "id": "w-204749", "title": "Downloads" },
    "snapshot_id": "s8f3k2p9",
    "ref_count": 59,
    "complete": true,
    "tree": {
      "role": "window",
      "name": "Downloads",
      "children": [
        { "role": "treeitem", "name": "Documents", "ref_id": "@s8f3k2p9:e8", "available_actions": ["Click"] }
      ]
    }
  }
}
```

스크린샷이 없는 제품은 아닙니다. 관찰 명령에 `screenshot`이 있고, `session start --screenshots`는 액션 전후 PNG를 남깁니다. 저장소의 `jev-desktop` 스킬은 트리를 컨텍스트에 넣지 않고 화면을 읽어 모델에 설명을 보냅니다. README는 이 헬퍼가 **네이티브 CLI와 별개**라고 적고, 스킬은 설치 패키지에 들어 있지 않으며 저장소를 클론하고 `TYPESAFE_API_KEY`가 있어야 한다고 적습니다. 기본 루프의 근거는 트리이고, 화면 읽기는 선택입니다.

## ref는 스냅샷 안에서만 결정적이다

바이럴 문구에는 없지만, 이 도구를 쓸 때 가장 중요한 계약은 ref입니다. [CONCEPTS.md](https://github.com/vercel-labs/agent-desktop/blob/main/CONCEPTS.md)의 문장을 그대로 옮기면, ref는 **한 스냅샷 안에서는 결정적**이고 **UI가 바뀌면 안정적이지 않습니다.** 출력은 항상 `@<snapshot_id>:e<N>` 형태이고, `@e8`처럼 스냅샷 id가 없는 ref는 `INVALID_ARGS`로 거절됩니다.

UI가 바뀌면 액션은 `STALE_REF` 또는 `AMBIGUOUS_TARGET`을 돌려줍니다. 그때 할 일은 그 ref를 다시 누르는 것이 아니라 스냅샷을 새로 찍는 것입니다. 스킬 문서는 정적 텍스트와 동작 없는 컨테이너에는 ref를 주지 않는다고 적습니다. 주소로 쓸 수 있는 노드만 ref를 받습니다.

"안정적"이 가리키는 쪽은 좌표가 아니라 **신원**입니다.

- 창 핸들은 OS가 재활용합니다. 신원은 핸들에 프로세스 생성 시각에서 온 토큰을 덧붙여, 같은 번호의 다른 창으로 붙지 않게 합니다. Windows는 HWND, macOS는 창 번호, Linux는 X11 클라이언트 id를 이렇게 묶습니다.
- 요소를 다시 찾을 때는 저장해 둔 경로를 먼저 보고, 그다음 개발자가 준 식별자, 그다음 역할에 따라 안정적이라고 보는 텍스트 순입니다. 신원이 없을 때만, 유일한 기하 일치로 폴백합니다.
- macOS에서는 스냅샷 네임스페이스마다 명령 호스트가 네이티브 접근성 객체를 붙들고 있어서, 지워진 행이 같은 식별자를 가진 살아 있는 행으로 조용히 해석되지 않습니다. 이 호스트는 15분 유휴 뒤 종료됩니다. `TMPDIR`은 현재 사용자 소유이고 모드 `0700`이어야 합니다.

즉 ref는 "한번 받은 번호로 계속 클릭하라"는 핸들이 아닙니다. **어긋나면 실패로 멈추는 핸들**입니다. 픽셀 클릭이 비슷한 버튼을 조용히 누르는 실패를, 명시적인 `STALE_REF`로 바꾼 쪽에 가깝습니다.

## 재시도는 에러 코드가 아니라 disposition이 정한다

모든 명령은 `ok`와 `data` 또는 `error`가 있는 JSON 봉투 하나를 출력합니다. 에러에는 `code`, `disposition`, 대개 `suggestion`이 있습니다. README의 규칙은 한 줄입니다. `error.disposition.retry`가 `safe`일 때만 재시도합니다.

[스킬](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop/SKILL.md)은 그 이유를 더 좁혀 적습니다. 안전한 재시도는 `delivery`가 `not_delivered`일 때뿐입니다. 그 외(`delivered_unverified` 등)는 입력이 이미 들어갔을 수 있어서, 같은 클릭·입력·토글을 반복하면 두 번 실행되거나 토글이 되돌아갑니다. 그때는 `get`, `is`, 또는 새 스냅샷으로 화면을 다시 읽고 결정합니다.

읽기와 쓰기의 재시도 표는 일부러 분리돼 있습니다. Windows에서 읽기 쪽의 "다시 시도해도 되는" HRESULT가, 쓰기에서는 이미 전달된 호출일 수 있기 때문입니다. macOS도 변경 계열 에러가 미전달을 증명하지 못하면 폴백을 멈추고 unsafe retry를 붙입니다. "에러가 났으니 같은 명령을 다시"는 이 도구의 사용법이 아닙니다.

액션 전에는 기본 5초(`type`은 글자당 30ms를 더함) 동안 대상이 동작 가능해질 때까지 기다립니다. `--timeout-ms 0`이면 한 번만 시도합니다. 가시성·안정성·활성·가림처럼 지나갈 수 있는 검사는 폴링하고, 지원하지 않는 액션·정책·편집 가능 여부는 기다리지 않고 바로 실패합니다.

## OS마다 접근성 API가 다르다

문서 사이트의 지원 표와 [docs/install.md](https://github.com/vercel-labs/agent-desktop/blob/main/docs/install.md), 플랫폼 스킬을 겹쳐 보면 이렇습니다.

| | macOS | Windows | Linux |
|---|---|---|---|
| 접근성 API | AX API | UI Automation | AT-SPI |
| 문서가 적은 바닥 | macOS 13+, Intel 또는 Apple Silicon | Windows 10 1809+ 또는 Server 2019+, x64/ARM64, 로그인한 사용자의 대화형 데스크탑 | Ubuntu 24.04+ (x86_64/aarch64), glibc 2.35, 사용자 그래픽 세션의 AT-SPI 버스. GNOME 46이 주 측정 대상 |
| 권한 | Accessibility 필수. `screenshot`과 `session start --screenshots`는 Screen Recording. 알림 센터는 System Events Automation | 같은 무결성 수준이면 별도 허용 없음. 관리자 권한 앱은 읽을 수 있으나 입력은 상승된 에이전트만 | 그래픽 세션 안의 `at-spi2-core`. TTY·세션 환경이 없는 SSH에서는 앱이 안 보임 |
| 물리적 입력 | `CGEvent` | `SendInput` | X11은 XTest, Wayland 키는 GNOME Mutter RemoteDesktop |

세 플랫폼 모두 명령 이름은 60개로 같고, 그중 56개가 동작합니다. `key-down`, `key-up`, `mouse-down`, `mouse-up`은 누른 키·버튼을 놓아 줄 데몬이 생기기 전까지 모든 OS에서 거절됩니다.

차이도 표의 "Yes" 안에 있습니다.

- **macOS.** `agent-desktop permissions --guide`가 시스템 설정의 빠진 권한으로 안내합니다. 헤드 모드의 `click`, `right-click`, `type`, `clear`, `scroll`은 시맨틱 호출보다 실제 입력 이벤트가 앞섭니다. `expand`나 `set-value`, `toggle` 같은 상태는 `--headed`여도 시맨틱입니다. AX 반환 코드만으로 효과를 단정하지 말라고 스킬이 적습니다. Finder는 아무 일도 안 한 `AXConfirm`에도 성공을 돌려준 적이 있습니다.
- **Windows.** `type`과 `right-click`은 헤드리스에서 `POLICY_DENIED`입니다. UIA에 선택 영역에 끼워 넣는 쓰기가 없어서, 헤드리스 텍스트 경로는 `set-value`입니다. 최소화된 창의 요소는 `offscreen`이라 액션이 실패하고, `focus-window`는 사용자 포그라운드를 가져갑니다. 바이너리는 서명이 없어 브라우저로 받은 파일은 SmartScreen·백신·깨끗한 Windows 11의 Smart App Control에 걸릴 수 있습니다. npm으로 설치하는 경로는 SmartScreen을 타지 않는다고 설치 문서가 적습니다.
- **Linux.** 시맨틱 액션은 X11과 Wayland 모두입니다. Wayland에서는 앱 포인터 입력이 거절되고 네이티브 창 제어가 없습니다. 더블클릭·호버·드래그는 X11이고 `--headed`입니다. Ubuntu 22.04의 ATK 브리지는 `Action.GetActions`에서 중단된다고 적혀 있습니다. 클립보드는 Wayland에서 `wl-clipboard`가 필요합니다. 알림은 GNOME Shell이고, 셸 위젯 배치는 GNOME Shell 46.0에서 확인했다고 스킬이 범위를 한정합니다.

npm 패키지의 `os`는 `darwin`, `win32`, `linux`이고 `cpu`는 `arm64`, `x64`입니다. 셸 표면(`open-system-surface`)은 README 표에서 macOS가 Planned, Windows는 동작, Linux는 GNOME 트레이와 Action Center입니다.

## 에이전트는 이 바이너리를 호출한다

이 저장소는 에이전트가 아닙니다. 스킬 첫머리의 문장입니다. 관찰·실행·확인 루프는 호출하는 쪽에 있고, 바이너리는 명령 하나에 JSON 하나를 출력하고 끝납니다. 모델이 안에 들어 있지도 않습니다.

에이전트에 붙이는 방법으로 문서가 적는 것은 세 가지입니다.

```bash
npm install -g agent-desktop
agent-desktop version
agent-desktop skills get desktop      # 루프, ref, 확인, 재시도
agent-desktop skills get platform     # 지금 OS에서 다른 점
```

```bash
npx skills add https://github.com/vercel-labs/agent-desktop --skill agent-desktop
```

또는 `AGENTS.md`에 `agent-desktop skills get desktop`과 `skills get platform`을 먼저 실행하라고 적습니다. 스킬 본문은 바이너리 안에 들어 있어서, `skills get`이 그 버전의 문서를 출력합니다.

프로세스 안에서 부르고 싶으면 릴리스에 포함되는 `libagent_desktop_ffi`가 있습니다. README의 예는 C ABI를 Python `ctypes`로 열고 `ad_init`에 헤더의 `AD_ABI_VERSION_MAJOR`를 넘기는 형태입니다. 웹 페이지 자동화는 이 도구의 범위 밖이고, 문서 사이트는 그 자리에 [agent-browser](https://github.com/vercel-labs/agent-browser)를 가리킵니다. Chromium·Electron은 `launch --cdp`로 DevTools 포트를 열어 웹 콘텐츠만 그쪽에 넘길 수 있다고 적습니다.

## 백그라운드, 그리고 커서 여러 개

헤드리스가 기본입니다. README는 ref 액션이 접근성 API로 가고 **포인터를 움직이지도, 포커스를 가져가지도 않는다**고 적습니다. 전역 `--headed`를 줘야 물리적 입력이 허용됩니다. 스킬은 헤드리스에 시맨틱 경로가 없으면 조용히 마우스로 대체하지 않고 실패한다고 적습니다. 헤드리스 실패를 피하려고 `--headed`로 올라가지 말라는 문장도 있습니다.

그래서 "마우스를 안 뺏아서 내가 컴퓨터를 계속 쓴다"는 **기본 ref 액션의 계약**과 맞습니다. 제품 전체의 계약은 아닙니다. `--headed`, `focus-window`, Windows의 `type`/`right-click`, Linux의 포인터 제스처는 포커스나 OS 포인터를 씁니다.

커서는 그 포인터와 별개의 오버레이입니다. `session start --cursor` 또는 `cursor-overlay enable`이 그립니다. [CONCEPTS.md](https://github.com/vercel-labs/agent-desktop/blob/main/CONCEPTS.md)는 이 커서가 **표현용**이고 OS 포인터를 움직이거나 바꾸지 않으며, 액션의 전달 방식도 바꾸지 않는다고 적습니다. 클릭하면 잔물결이 나오고 요소 테두리가 잠깐 강조됩니다.

여러 에이전트는 `session start --cursor --multi-agent`입니다. 하네스가 서브에이전트마다 안정적인 `--agent-id`(또는 `AGENT_DESKTOP_AGENT_ID`)를 줍니다. 이 모드에서 데스크탑 UI 액션은 그 id가 없으면 거절됩니다. 관찰·클립보드·세션 관리 명령은 id가 필요 없습니다.

동시에 움직이는 것은 **오버레이 커서의 이동**입니다. 문서의 문장은, 헤드리스 액션이 상호작용 락을 잡기 전에 자기 커서를 옮기므로 여러 커서가 같이 이동하고, **액션 자체는 차례를 기다린다**는 쪽입니다. 같은 커서를 그리는 명령은 이동부터 클릭 효과까지 직렬입니다. 상호작용 락은 머신 전체에서 합성 입력을 한 프로세스만 넣게 하는 장치라, 물리적 입력이 서로 끼어들지 않습니다. 락은 대기 시간이 아니라 디스패치만 감쌉니다.

플랫폼 범위는 문서끼리 폭이 다릅니다. 에이전트가 읽도록 만든 [commands-system.md](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop/references/commands-system.md)는 멀티 에이전트 커서를 **macOS와 Windows**라고 적습니다. CONCEPTS.md는 **macOS, Windows, Linux X11**이라고 적습니다. Linux 스킬은 X11에서 `cursor-overlay enable`이 `data.rendered: true`를 돌려주고, Wayland에서는 설정만 저장하고 `rendered: false`라고 적습니다. "각자 커서로 동시에 작업"을 Linux Wayland까지 포함한 문장으로 읽을 근거는 없습니다.

세션을 나누는 명령은 문서에 이렇게 있습니다.

```bash
export AGENT_DESKTOP_SESSION="$(agent-desktop session start --name "invoice-bot" | jq -r '.data.session_id')"
agent-desktop session end "$AGENT_DESKTOP_SESSION"
```

멀티 커서의 시작 명령은 `agent-desktop session start --cursor --multi-agent`이고, 이후 UI 액션에 `AGENT_DESKTOP_AGENT_ID` 또는 전역 `--agent-id`를 붙입니다. id는 세션 안에서 1–64자의 영숫자, `-`, `_`입니다.

## 팩트 체크

[@yyyole 포스트](https://x.com/yyyole/status/2116729757446664326)의 주장입니다. 영상 원문과 겹치는 항목은 같이 봤습니다. ✅ 문서와 맞음 / ⚠️ 핵심은 맞거나 일부만 맞음 / ❌ 문서와 어긋남

| 주장 | 판정 | 근거 |
|---|---|---|
| Vercel Labs가 `agent-desktop`을 정식 오픈소스해서, 어떤 코딩 에이전트에도 데스크탑 Computer Use를 더했다 | ⚠️ | 공개 저장소는 [vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop)이고 README에 "Vercel Labs Product" 배지가 있으며, 설명도 "any agent"용 데스크탑 Computer Use입니다. 다만 저장소 id `1161958643`의 `created_at`은 2026-02-19이고, `lahfir/agent-desktop`은 같은 id로 301입니다. npm은 2026-02-23의 0.1.2부터 공개였고 1.0.1(2026-10-28)까지 homepage가 `github.com/lahfir/agent-desktop`입니다. 1.0.2(2026-10-30) 체인지로그의 문구는 "Point the npm package and repository links at vercel-labs/agent-desktop"입니다. 라이선스는 그 전부터 Apache-2.0입니다. npm `maintainers`는 개인 계정 `lahfir`이고, 1.0.2를 올린 주체는 GitHub Actions trusted publisher입니다. 2026-11-02에 가져온 [vercel.com/labs](https://vercel.com/labs)의 Labs products·Active experiments 목록에는 이 저장소가 없고, 같은 계열로 올라 있는 것은 agent-browser입니다. 문서 홈은 [agent-browser.dev/desktop](https://agent-browser.dev/desktop)입니다. |
| 스크린샷에 의존하지 않고, 버튼·입력 칸마다 OS 접근성 트리를 읽는다 | ⚠️ | 기본 루프는 접근성 트리고 픽셀 매칭을 하지 않습니다. [문서](https://agent-browser.dev/desktop)는 트리를 공개하지 않는 UI는 보지 못한다고 적습니다. ref는 조작·드릴다운 가능한 노드에만 있고, 정적 텍스트와 비활성 컨테이너에는 없습니다. `screenshot` 명령과 `session start --screenshots`, 그리고 별도 스킬 `jev-desktop`의 화면 설명이 있습니다. "화면에 있는 모든 버튼과 입력 칸"은 문서의 범위보다 넓습니다. |
| 백그라운드에서 돌고 마우스를 뺏지 않아, 사람이 컴퓨터를 계속 쓸 수 있다 | ✅ | 기본값은 헤드리스입니다. README: ref 액션은 접근성 API로 가고 포인터를 옮기거나 포커스를 가져가지 않습니다. `--headed`일 때만 물리적 입력입니다. 영어 원문의 "Runs in bg while you keep working"도 이 기본 계약과 맞습니다. 단, Windows `type`/`right-click`, Linux 포인터 제스처, `focus-window`는 포커스나 OS 포인터를 씁니다. 그 경로는 이 문장에 포함되지 않습니다. |
| 에이전트 여러 개가 각자 커서를 갖고 동시에 일한다 | ⚠️ | `session start --cursor --multi-agent`가 `(session, agent-id)`마다 오버레이 커서를 둡니다. 커서는 OS 포인터가 아니고, 이동은 겹칠 수 있습니다. 액션은 차례를 기다리며, 물리적 입력은 상호작용 락으로 직렬화됩니다. 명령 레퍼런스는 macOS·Windows, CONCEPTS.md는 거기에 Linux X11을 더합니다. Wayland 오버레이는 `rendered: false`입니다. |
| macOS, Windows, Linux를 지원한다 | ✅ | README와 npm `os` 필드, 문서 사이트가 세 플랫폼을 적습니다. 바닥은 macOS 13+(Accessibility 권한), Windows 10 1809+/Server 2019+(같은 무결성, 서명되지 않은 바이너리 주의), Linux Ubuntu 24.04+의 그래픽 세션과 AT-SPI입니다. 마우스·창 제어·알림·셸 표면은 플랫폼 표가 보여주는 만큼만 됩니다. macOS 셸 표면은 README에서 Planned입니다. |
| 한 줄로 설치한다. `npm i -g agent-desktop` | ✅ | 패키지 이름은 `agent-desktop`이 맞고, 2026-11-02 레지스트리 `latest`는 1.0.2입니다. `npm i`는 `npm install`의 별칭이라 문서의 `npm install -g agent-desktop`과 같은 설치입니다. 바이너리 이름은 `agent-desktop`, Node 18 이상, 네이티브 바이너리는 x64/ARM64입니다. 설치 다음 단계로 macOS는 권한 안내(`agent-desktop permissions --guide`)가 남아 있습니다. 이 패키지의 npm 메인테이너 계정은 Vercel 조직 계정이 아니라 `lahfir`입니다. |

**총평:** ❌로 꺾을, 도구가 없다는 식의 주장은 아닙니다. CLI·접근성 트리·세 OS·한 줄 설치·헤드리스 기본값은 1차 자료에 있습니다. 가장 크게 어긋난 뉘앙스는 "Vercel Labs가 이번에 처음 연 오픈소스"와 "에이전트들이 동시에 각자 일한다"입니다. 전자는 2월부터 공개돼 있던 Apache-2.0 저장소가 10월 30일 1.0.2에서 `vercel-labs`로 링크가 옮겨진 기록에 가깝고, 후자는 오버레이 커서가 같이 움직이는 동안 액션은 줄을 서는 구조입니다.

## 개발자로서 가져갈 점

1. **데스크탑을 맡길 때 기본 루프는 `snapshot → ref 액션 → 다시 snapshot`이다.** 좌표 클릭은 `--headed`와 `--xy` 쪽의 명시적 폴백입니다. ref는 스냅샷에 묶여 있으므로, UI가 바뀌면 새 ref를 받습니다.
2. **재시도는 `disposition.retry == safe`일 때만 한다.** 그 외에는 같은 명령을 반복하지 않고 `get`/`is`/새 스냅샷으로 확인합니다. 토글과 제출 버튼에서 이 차이가 바로 이중 실행이 됩니다.
3. **OS를 하나 더 지원한다고 같은 명령이 같은 정책으로 성공하는 것은 아니다.** Windows에서 글자를 넣는 헤드리스 경로는 `type`이 아니라 `set-value`이고, Linux Wayland에서는 포인터 제스처가 거절됩니다. 에이전트를 붙이기 전에 `agent-desktop skills get platform`을 읽히는 쪽이 문서의 사용법입니다.
4. **여러 에이전트를 붙이면 커서는 나뉘고 입력 락은 하나다.** 동시에 움직이는 것은 화면에 그린 커서이고, 합성 입력은 머신당 한 줄입니다. "각자 OS 마우스를 잡고 진짜로 병렬 클릭"으로 설계하면 문서와 어긋납니다.
5. **패키지 이름만 보고 발행 주체를 단정하지 않는다.** `npm i -g agent-desktop`은 이 저장소의 설치 명령이 맞습니다. 2026-11-02 기준 레지스트리 메인테이너는 `lahfir`이고, `vercel.com/labs` 목록에는 아직 이 이름이 없습니다. README 배지와 조직 이전은 사실이고, "Vercel이 이번 주에 처음 공개했다"는 그 사실과 다른 문장입니다.

## 참고 자료

- vercel-labs/agent-desktop — [저장소](https://github.com/vercel-labs/agent-desktop) · [README](https://github.com/vercel-labs/agent-desktop/blob/main/README.md) · [CONCEPTS.md](https://github.com/vercel-labs/agent-desktop/blob/main/CONCEPTS.md) · [설치·권한](https://github.com/vercel-labs/agent-desktop/blob/main/docs/install.md) · [JSON 봉투](https://github.com/vercel-labs/agent-desktop/blob/main/docs/json-output.md) · [CHANGELOG 1.0.2](https://github.com/vercel-labs/agent-desktop/blob/main/CHANGELOG.md) · [Apache-2.0](https://github.com/vercel-labs/agent-desktop/blob/main/LICENSE) · [릴리스](https://github.com/vercel-labs/agent-desktop/releases)
- 문서 사이트 (저장소 homepage) — [agent-desktop](https://agent-browser.dev/desktop)
- 에이전트 스킬 — [SKILL.md](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop/SKILL.md) · [commands-system.md](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop/references/commands-system.md) · [macOS](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop-macos/SKILL.md) · [Windows](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop-windows/SKILL.md) · [Linux](https://github.com/vercel-labs/agent-desktop/blob/main/skills/agent-desktop-linux/SKILL.md) · [jev-desktop](https://github.com/vercel-labs/agent-desktop/blob/main/skills/jev-desktop/SKILL.md)
- npm — [agent-desktop](https://www.npmjs.com/package/agent-desktop) · [레지스트리](https://registry.npmjs.org/agent-desktop)
- Vercel Labs 목록 (2026-11-02에 가져온 페이지에는 agent-desktop이 없음) — [vercel.com/labs](https://vercel.com/labs)
- 원본 X 포스트 — [@yyyole, 2026-11-01](https://x.com/i/status/2116729757446664326) · 인용된 소개 영상 [@ctatedev, 2026-10-31](https://x.com/ctatedev/status/2116323148706771302)
