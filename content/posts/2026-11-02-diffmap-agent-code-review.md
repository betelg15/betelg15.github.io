---
title: "AI가 한 번에 1000줄을 바꾸면 사람은 도장만 찍나? diffmap 팩트 체크"
date: 2026-11-02
time: "15:11"
slug: diffmap-agent-code-review
tags: [AI, 코드리뷰, 에이전트, diffmap, 팩트체크]
summary: "에이전트 diff를 줄 단위로 읽지 말고, 의도·흐름·우선 볼 파일을 한 스펙으로 보게 하자는 diffmap을 저장소·스킬·발표 포스트와 대조해 정리했습니다."
---

> 이 글은 북마크해 둔 [@aburacadabra_(세일러아이리스)의 포스트](https://x.com/aburacadabra_/status/2116702513218945179)와, 그 글이 인용한 저자 [@tanishqk의 발표](https://x.com/tanishqk/status/2116212881125691850)를 계기로 쓴 것입니다. 포스트 문장은 검증할 주장으로만 다뤘고, 근거는 [diffmap 저장소](https://github.com/tanishqkancharla/diffmap)의 README, 스킬 파일, 커밋, npm 패키지입니다. 확인한 커밋은 `973e2c9`(2026-10-31, "Show images, videos, and Amp-style galleries in specs")입니다.

## 왜 이 형식이 나왔나

코딩 에이전트는 한 브랜치에 사람이 오후 내내 짤 분량의 변경을 올려 둡니다. 리뷰어에게 남는 화면은 파일 경로와 `+`/`-` 줄의 긴 목록입니다. 설계가 바뀐 지점과, lockfile이 바뀐 지점이 같은 밀도로 보입니다.

Tanishq Kancharla의 [diffmap](https://github.com/tanishqkancharla/diffmap)은 그 순서를 바꾸자는 제안입니다. 발표 포스트의 문장은 "중요한 설계 변경을 리뷰하게 하고, 거대한 줄 diff는 아니게 한다"입니다. 저장소 README와 [diffmap.dev의 소스](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/src/host/home.md)도 같은 두 문장으로 시작합니다.

> Your coding agent writes more code than you can review.
> Review the important design changes, not massive line diffs.

줄 diff를 없애는 도구는 아닙니다. 에이전트가 **마크다운 스펙 한 장**을 쓰고, 로컬 뷰어가 그 스펙의 다이어그램·호출 스택·"먼저 볼 파일" 카드를 그린 다음, 카드를 누르면 그때 줄 diff가 옆 패널에 열립니다. 리뷰의 입구가 패치가 아니라 의도라는 뜻입니다.

결론부터 말하면, **형식·스킬·프롬프트·뷰어는 저장소에 실제로 있습니다.** "1000줄", "거의 아무도 안 읽고 도장만 찍는다"는 측정치가 아니라 수사입니다. "이 스킬을 2개월 넘게 매일 쓴다"는 저자의 진술이고, 공개 git 이력만으로는 그 기간과 매일 사용을 확정할 수 없습니다.

## diffmap이 실제로 무엇인가

diffmap은 diff 알고리즘이 아닙니다. 세 조각입니다.

1. **문서 형식.** 에이전트가 쓰는 마크다운 스펙. 계획(planning)과, 이미 올라온 변경의 리뷰(reviewing) 둘 다 이 파일로 합니다. 발표 포스트의 한 줄 정의는 "a new document format for planning and reviewing agent code"입니다.
2. **에이전트 스킬.** [`skills/generate-diffmap/SKILL.md`](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/skills/generate-diffmap/SKILL.md). 스펙을 어디에 두고, 페이즈를 어떻게 나누고, 커밋이 끝난 뒤 어떤 참조를 고칠지 적혀 있습니다.
3. **로컬 뷰어이자 CLI.** npm 패키지 [`@tanishqkancharla/diffmap`](https://www.npmjs.com/package/@tanishqkancharla/diffmap). `package.json`의 description은 "Serve a spec or code walkthrough as a local page"입니다. 2026-11-02에 레지스트리를 조회했을 때 최신 버전은 **0.7.1**(배포 시각 2026-10-30T23:34:53Z)이었습니다.

저장소 메타데이터(같은 날 GitHub API):

| 항목 | 값 |
|---|---|
| 만든 사람 | Tanishq Kancharla. X [@tanishqk](https://x.com/tanishqk). 저작권 표기 "Copyright (c) 2026 Tanishq Kancharla" |
| 라이선스 | [MIT](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/LICENSE) |
| 저장소 생성 | 2026-09-10T16:53:28Z |
| 기본 브랜치 HEAD | `973e2c9`, 2026-10-31 |
| 설명 필드 | `big diff energy` (발표 문장과는 다른 필드입니다) |
| 홈페이지 | [diffmap.dev](https://diffmap.dev) |
| Star / fork | 206 / 8 (2026-11-02 조회, 이후 변합니다) |
| 런타임 | `package.json`의 `engines.node`는 `>=22` |
| 공개 커밋 | 104개, 커밋이 있는 날 19일 (2026-09-10 ~ 2026-10-31) |

커밋 저자 수는 저장소가 어떻게 만들어졌는지도 보여 줍니다. 104개 중 Amp 52, Tanishq Kancharla 36, Cursor Agent 13, tembo[bot] 2, cursor[bot] 1입니다. 개인 저장소이고, 그 안의 상당수는 에이전트 커밋입니다.

첫 커밋 [`eb5fba9`](https://github.com/tanishqkancharla/diffmap/commit/eb5fba9)(2026-09-10) 메시지는 "Extract tkstack package and walkthrough skill"입니다. 공개 이력은 그때 이미 있던 패키지를 꺼내는 장면으로 시작합니다. `tkstack`이라는 이름의 공개 저장소는 이 계정의 저장소 목록에서 찾지 못했습니다.

## 스펙 한 장이 담는 것

스킬이 정한 파일 위치는 두 가지입니다.

- 진행 중인 작업: `specs/<짧은-kebab-이름>.md`. 계획이 바뀌고 코드가 착지할 때마다 같은 파일을 고칩니다. 스킬의 말로는 living spec입니다.
- 이미 있는 풀 리퀘스트를 설명만 할 때: 그 PR에 스펙이 있으면 그것을 고치고, 없으면 `.diffmap/` 아래에 새로 씁니다.

권장 골격은 문제 개요, 해결 개요, 목표와 비목표, 페이즈, **References**입니다. 스킬은 "내용이 각 절에 필요한 것을 정한다"고도 적습니다. 고정된 스키마 파일은 없고, 마크다운 관례입니다.

페이즈 제목은 계획이면 평범한 제목, 진행 중이면 ⏳, 끝나면 ✅입니다. 각 페이즈는 쓰는 사람 입장에서 **Today**와 **Proposed**로 열고, 설명은 변경의 종류에 맞춥니다. 새 흐름이면 다이어그램과 호출 스택, 리팩터이면 호출 스택 diff, 의존성 올리기면 문장 두 개로 충분하다고 스킬이 말합니다.

페이즈의 끝에는 `changes` 펜스가 옵니다. 커밋 전에는 비어 있고, 커밋 뒤에는 SHA와 **리뷰어가 읽을 파일 순서**가 들어갑니다. 스킬이 적는 순서는 보통 사용자에게 닿는 진입점부터입니다. lockfile, 생성 코드, 스냅샷, 기계적인 이름 변경은 목록에서 빼고, 카드가 나머지를 "N other files"로 접습니다. README는 이 카드를 "most important first"라고 부릅니다.

홈페이지 소스는 역할을 한 문장으로 나눕니다. "코드를 쓰기 전에 에이전트가 스펙을 쓰고, 사람은 계획을 본 다음 페이즈가 착지할 때마다 다시 본다." 발표 포스트에 적힌 프롬프트는 **이미 있는 브랜치**용이고, 홈에는 계획용 문장이 하나 더 있습니다.

```text
Plan <feature> as a diffmap spec. Use github.com/tanishqkancharla/diffmap
```

```text
Write a diffmap spec for the changes on this branch. Use github.com/tanishqkancharla/diffmap
```

두 번째가 저자가 발표 포스트와 README "Try it"에 적은 사용 프롬프트입니다.

## 펜스: 뷰어가 특별 취급하는 블록

뷰어는 일반 마크다운에 더해, 정보 문자열(fence info)로 블록 종류를 가릅니다. README 표의 핵심만 옮기면 다음과 같습니다.

| 펜스 | 화면에 나오는 것 |
|---|---|
| `mermaid` | Mermaid 다이어그램 (beautiful-mermaid) |
| `services` | 서비스와 상태를 단계로 재생하는 그림. Play, 화살표, 진행 막대 |
| `mermaid diff`, `services diff` | 오늘만 있는 부분(`-`, 빨강)과 제안만 있는 부분(`+`, 초록)을 한 레이아웃에 |
| `callstack` 또는 `└──` / `├──`가 있는 `diff` | 호출 스택. `+` 행은 새 코드, `-` 행은 빠지는 코드 |
| `diff` 또는 `diff:path` | Pierre 패치 ([`@pierre/diffs`](https://www.npmjs.com/package/@pierre/diffs) 1.6.1) |
| `changes` | 커밋·범위·또는 빈 본문(커밋 안 된 변경)의 파일 카드와 Review 버튼 |
| `start:end:path` | 파일 일부 발췌 |
| `html` | 그 파일에 적힌 HTML. README는 "diffmap은 이를 새니타이즈하지 않는다"고 명시 |

줄 강조용 `{2-3}`, 호버 노트 `[!note L3]`, 갤러리 `:::gallery side-by-side` / `grid` / `carousel`도 있습니다. 서비스 배치에는 [ELK](https://eclipse.dev/elk/)를 쓰고, 마크다운 파서는 [md4x](https://github.com/unjs/md4x)입니다. MDC 문법(`::mermaid`, `::callstack`, `::diff`, `::changes`, `::details`)도 같은 뷰로 연결됩니다. `services`만은 들여쓰기가 의미라 MDC 형태가 없다고 README가 적습니다.

소스 연결은 `[[참조]]`입니다.

- `[[src/store.ts#Store.save]]` — TypeScript/JavaScript 선언. 이름이 겹치면 한정 이름을 쓰라고 안내합니다.
- `[[path#L12-L30]]` — 아무 언어나 되는 줄 범위.
- `[[<sha>:path#L12-L30]]` — 그 커밋(또는 `<sha>..<sha>` 범위) 안의 변경. SHA는 소문자 7~40자. 줄 번호는 **커밋 이후 파일** 기준이라, 삭제된 줄은 가리킬 수 없습니다.

참조가 없는 스택 줄은 약속된 API가 아니라 의사코드입니다. 잘못된 참조, 커밋에 없는 파일, 맞지 않는 줄 범위는 `serve`와 `share`가 **기동 시점에 실패**합니다. `changes`에 적은 파일이 그 커밋의 변경 목록에 없어도 실패합니다. 본문의 "왜"까지 자동으로 대조하지는 않습니다. 검사되는 것은 참조와 파일 목록이 git과 맞는지입니다.

스킬에 있는 예시 페이즈는 Diffmap 소스가 아니라 지어낸 경로와 SHA입니다. 형식이 한눈에 들어오게 앞부분만 줄였습니다.

````md
### ⏳ Phase 1: Validate request input

**Today**

The handler passes records straight to the service. A client that sends an empty name gets a success response.

**Proposed**

A client that sends an empty name gets an error naming the `name` field.

```callstack
 response = requestHandler(record) [[src/request.ts#requestHandler]]
-└── return existingService(record) [[src/service.ts#existingService]]
+├── error = validateInput(record) # reject empty names
+├── if error: return error
+└── return result
```

```changes
a1b2c3d
src/request.ts
src/validate.ts
```
````

서비스 다이어그램은 "누가 어떤 상태를 바꾸며 메시지를 주고받는가"를 단계로 보여 줍니다. README의 로그인 예는 `service` / `state` / `step` / `Browser -> API: POST /login` 형태이고, `>` 줄은 그 단계의 설명입니다. diff를 붙이면 같은 상태 키가 오늘 값(취소선)과 제안 값을 나란히 보여 줍니다.

## 스킬을 에이전트에게 맡기는 법

README의 설치 전 시험은 저장소를 클론하지 않습니다. 변경이 있는 저장소에서 에이전트에 위의 `Write a diffmap spec...` 문장을 붙입니다. 문장 안의 `github.com/tanishqkancharla/diffmap`이 에이전트에게 형식의 출처를 알려 줍니다.

결과물이 마음에 들면 스킬을 설치합니다. 이 명령은 README에 적힌 그대로입니다.

```sh
npx skills add tanishqkancharla/diffmap --skill generate-diffmap
```

스킬 프론트 매터의 `name`은 `generate-diffmap`이고, description은 "planning work, implementing from a spec, updating a spec, or explaining code changes"일 때 쓰라고 되어 있습니다. `agents/openai.yaml`의 기본 프롬프트는 "Use $generate-diffmap to create and update a living spec..."입니다.

스킬이 에이전트에게 시키는 순서는 대략 이렇습니다.

1. 관련 코드를 먼저 읽고, 설계·범위·페이즈 분할이 불명확하면 선택지와 자신의 안을 사용자에게 확인한 뒤에 많이 쓰지 말 것.
2. 저장소 루트에서 이미 떠 있는 뷰어가 있으면 `npx @tanishqkancharla/diffmap list`로 URL을 재사용하고, 없으면 `npx @tanishqkancharla/diffmap serve specs/<name>.md`.
3. 서버는 켜 둔 채 파일 경로와 URL을 사용자에게 줄 것. 브라우저는 요청받았을 때만 열 것.
4. 페이즈가 끝나면 코드를 커밋하고, SHA를 `changes`에 넣고, 읽을 파일을 순서대로 적고, 그 페이즈가 바꾼 참조를 전부 그 커밋으로 돌리고, 제목에 ✅를 달고, **스펙 갱신은 코드 커밋과 따로 커밋**할 것. 스펙이 코드 커밋의 SHA를 이름 붙이기 때문입니다.
5. `serve`를 다시 시작해서 커밋 참조 검사를 통과시킬 것.

UI가 바뀌는 페이즈는 스크린샷을 기본으로 하고, 호버·드래그·전환처럼 정지 화면이 못 담는 것만 15초 안쪽의 영상으로 남기라고 합니다. 경로는 `specs/media/<스펙-이름>/`. 캡처는 "무슨 일이 일어났는지"이지 동작의 증명은 아니라고, 어떤 검사를 돌렸는지 적으라고 스킬이 못 박습니다.

## 뷰어를 띄우고, 고르고, 나누는 법

```sh
npx @tanishqkancharla/diffmap serve path/to/file.md
```

인자만 주면 `serve`와 같습니다. `--port`로 포트를 고정하고(기본은 빈 포트), `--root`로 발췌의 워크스페이스 루트를 바꿉니다. 오른쪽 위의 **Close server**가 서버를 끝냅니다. 페이지나 소스 요청이 24시간 없으면 서버도 멈춥니다. 새로고침은 그 타이머를 리셋하고, 헬스체크와 Vite 연결은 리셋하지 않습니다.

`diffmap update`(또는 `--update`)는 전역 설치를 npm / pnpm / bun 가운데 당시 설치에 쓴 도구로 올립니다. `npx` 아래에서는 설치하지 않고 직접 칠 명령만 출력합니다.

코멘트는 스펙 파일이 아니라 **브라우저 localStorage(페이지마다)** 에 남습니다. 본문을 드래그해 Comment를 누르거나, diff 거터의 `+`로 줄 범위를 집습니다. 오른쪽 위의 **Copy comments**가 위치와 인용을 붙인 번호 매긴 마크다운으로 복사해, 에이전트에 붙여 넣게 합니다.

공유는 실험 기능입니다.

```sh
npx @tanishqkancharla/diffmap share path/to.md
```

`gh` 로그인이 필요하고, 로컬 서버는 켜지 않습니다. 결과 주소는 `https://diffmap.dev/g/<gistId>`입니다. gist는 unlisted이지 private가 아닙니다. 페이지가 브라우저에서 `api.github.com`으로 gist를 읽습니다. 로컬 이미지·영상이 있으면 `share`는 실패합니다. gist는 텍스트만 담기 때문에, 미디어는 https URL이어야 합니다. 스킬은 더 나아가, 참조된 커밋의 diff와 커밋 없는 참조가 읽은 파일 내용이 `diffmap-changes.json`과 `diffmap-files.json`으로 gist에 들어간다고 합니다. URL을 아는 사람은 그 스냅샷을 읽습니다.

PR에 커밋된 스펙은 `https://diffmap.dev/<owner>/<repo>/pull/<n>/specs/<name>.md`로도 열립니다. 이 경로의 커밋 diff는 GitHub API의 패치 hunk라서, 변경 근처 줄만 도달하고 Diff 버튼은 PR의 전체 diff로 이어집니다. 홈이 예시로 거는 Halo 스펙은 다른 형태입니다. [`cashew-labs/halo`의 `b01ac5e0`](https://github.com/cashew-labs/halo/commit/b01ac5e0633c906efb1d09bf164da46b8bed2b04)(2026-10-30, 작성자 ampagent, 메시지 "Add a diffmap walkthrough of shared workspace memory") 안의 [`.diffmap/shared-workspace-memory.md`](https://github.com/cashew-labs/halo/blob/b01ac5e0633c906efb1d09bf164da46b8bed2b04/.diffmap/shared-workspace-memory.md)이고, 주소는 `https://diffmap.dev/cashew-labs/halo/commit/b01ac5e0633c906efb1d09bf164da46b8bed2b04/.diffmap/shared-workspace-memory.md`입니다. 저자 프로필은 Cashew Labs에서 에이전트 운영체제를 만든다고 적혀 있습니다.

라이브러리로도 열립니다. README의 import는 `startServer`, `parseFence`, `parseViewerDocument`이고, 패키지 exports는 `./src/index.ts`입니다. 문서 모양의 주인은 스킬이고, 뷰어는 그 모양을 강제하지 않는다고 README가 적습니다.

릴리스는 `main`에 푸시한다고 자동으로 npm에 나가지 않습니다. [`AGENTS.md`](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/AGENTS.md)는 버전을 올린 커밋이 있어야 `Publish to npm` 워크플로가 `npm stage publish`를 하고, npmjs.com에서 메인테이너가 승인해야 공개된다고 합니다.

## 한계

형식은 리뷰 순서를 바꿀 뿐, 에이전트의 자기 요약을 사실로 만들어 주지는 않습니다. 확인한 범위에서 실용적인 한계는 다음과 같습니다.

- **설명의 진실성은 에이전트에게 달려 있습니다.** git이 실패시키는 것은 깨진 참조, 커밋에 없는 `changes` 파일, 파싱되지 않는 Mermaid입니다. "이 변경의 이유는 이것이다"는 문장은 검사 대상이 아닙니다. 스펙을 읽고 나서도, 카드가 접어 둔 파일은 따로 열어야 합니다.
- **줄 diff는 사라지지 않습니다.** 입구가 스펙일 뿐, Review와 파일 행은 Pierre 패널의 패치를 엽니다. "줄 단위 대신"을 "줄 diff 기능이 없다"로 읽으면 저장소와 다릅니다.
- **`html` 펜스는 새니타이즈하지 않습니다.** README는 로컬에서 자신이 쓴 파일에만 쓰라고 합니다.
- **공유는 실험이고, unlisted는 비밀이 아닙니다.** 이슈 [#32](https://github.com/tanishqkancharla/diffmap/issues/32)에서 저자는 gist 공유가 GitHub rate limit과 소스 노출 때문에 "a little unreliable"하다고 적고, Diffmap Cloud는 관심 투표용으로 열어 두었습니다(2026-10-30, 상태 open).
- **코멘트는 팀 리뷰 기록이 아닙니다.** 브라우저 localStorage라서 다른 사람 화면이나 스펙 커밋에는 없습니다. Copy comments로 꺼내 에이전트에 붙이는 구조입니다.
- **호스티드 뷰어의 소스 패널은 hunk 근처만 봅니다.** 정의로 점프하는 Cmd/Ctrl-클릭은 로컬 뷰어에서만 동작한다고 README가 적습니다.
- **Node.js 22 이상**이 `engines`에 적혀 있습니다. 그 아래 버전에서의 동작은 이 글에서 확인하지 않았습니다.
- **프로젝트는 공개된 지 두 달도 안 된 개인 저장소입니다.** 첫 공개 커밋은 2026-09-10이고, npm 0.1.3은 2026-09-16, 0.7.1은 2026-10-30입니다. 스킬 문장과 뷰어가 그 사이에 여러 번 바뀌었습니다. 오늘 읽은 `SKILL.md`가 다음 주 에이전트가 받는 문서와 같다는 보장은 없습니다.

## 팩트 체크

북마크한 글과 그 글이 인용한 발표를, 2026-11-02에 읽은 원문과 대조했습니다. ✅ 사실 / ⚠️ 일부만 사실·확인 불가·과장 / ❌ 사실 아님

확인에 쓴 1차 출처는 [README (`973e2c9`)](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/README.md), [generate-diffmap 스킬](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/skills/generate-diffmap/SKILL.md), [홈 소스](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/src/host/home.md), [첫 커밋 `eb5fba9`](https://github.com/tanishqkancharla/diffmap/commit/eb5fba9), [npm 레지스트리](https://registry.npmjs.org/@tanishqkancharla/diffmap), [발표 포스트](https://x.com/tanishqk/status/2116212881125691850), [한국어 포스트](https://x.com/aburacadabra_/status/2116702513218945179)입니다.

### @aburacadabra_ 포스트 (2026-11-01)

| 주장 | 판정 | 근거 |
|---|---|---|
| AI가 고친 코드를 사람이 검토하기 쉽게 만드는 문서 형식이 나왔다 | ✅ | 저자 발표(2026-10-30)의 정의와 같고, 형식은 `SKILL.md`와 README 펜스 표로 구현되어 있습니다. |
| 원래 코드 리뷰는 줄을 하나씩 보는 방식이다 | ✅ | 통상적인 `git diff` 설명입니다. diffmap이 측정한 사실은 아닙니다. |
| AI가 한 번에 1000줄씩 바꾸고, 그걸 다 읽는 사람은 거의 없어 대충 승인하게 된다 | ⚠️ | 1000줄이라는 수와 "거의 없다"는 측정은 포스트에도 저장소에도 없습니다. 저자와 README가 말하는 것은 "massive line diffs", "writes more code than you can review"라는 문제 설정입니다. |
| 줄 단위 대신, 무엇을 왜 바꿨는지·기능이 어떤 순서로 도는지·꼭 봐야 할 변경만 한 장에 정리한다 | ⚠️ | 방향은 맞습니다. 이유와 순서는 Today/Proposed, `services`/`callstack`/`mermaid`이고, 우선 파일은 `changes` 카드입니다. 다만 나머지 파일은 삭제되지 않고 "N other files"로 접히고, 줄을 누르면 줄 diff가 열립니다. 골라 담는 주체도 자동 필터가 아니라 스펙을 쓰는 에이전트입니다. |
| AI에게 이 변경을 diffmap으로 정리해 달라고 하면 만들어 주는 기능이 있다 | ✅ | 별도 버튼이 아니라 스킬과 프롬프트입니다. README와 발표에 적힌 문장은 `Write a diffmap spec for the changes on this branch. Use github.com/tanishqkancharla/diffmap`입니다. 한국어 문장은 그 프롬프트의 풀어쓰기입니다. |
| 막 나온 개인 프로젝트라 완성도는 기대하지 않는 편이 좋다 | ⚠️ | 개인 저장소(저작권 개인, 조직 저장소 아님)와 2026-10-30 공개 발표는 맞습니다. 다만 공개 커밋은 2026-09-10부터 있고, 테스트 스크립트·npm 배포·긴 README가 있습니다. 완성도에 대한 직접 근거는 `share`를 experimental로 단 점과, gist가 불안정하다는 [이슈 #32](https://github.com/tanishqkancharla/diffmap/issues/32)입니다. "기대하지 말라"는 조언이지, 저장소가 스스로를 스케치라고 부른 문장은 아닙니다. |
| "코드 리뷰는 의도부터 보자"는 아이디어만 가져가도 충분하다 | ✅ | 아이디어 자체는 발표와 홈의 "Review the important design changes, not massive line diffs"와 같습니다. "가져가도 충분하다"는 글쓴이의 판단입니다. |

### @tanishqk 발표 (2026-10-30)

| 주장 | 판정 | 근거 |
|---|---|---|
| diffmap은 에이전트 코드를 계획하고 리뷰하는 새 문서 형식이다 | ✅ | 발표 문장과 스킬의 역할(계획, 구현, 스펙 갱신, 변경 설명)이 일치합니다. GitHub 저장소 설명 필드는 따로 `big diff energy`입니다. |
| 거대한 줄 diff가 아니라 중요한 설계 변경을 리뷰하게 하려는 것이다 | ✅ | README, 홈 소스, 발표가 같은 문장입니다. 줄 diff 패널은 그 다음에 열립니다. |
| 사용 프롬프트가 `Write a diffmap spec for the changes on this branch. Use github.com/tanishqkancharla/diffmap`이다 | ✅ | 발표의 링크는 그 저장소로 풀리고, README "Try it"과 홈 소스에 같은 문장이 있습니다. 홈에는 계획용 `Plan <feature> as a diffmap spec...`도 있습니다. |
| 이 스킬을 2개월 넘게 다듬어 왔다 | ⚠️ | 공개 이력은 2026-09-10 추출 커밋부터 발표일까지 50일입니다. 첫 메시지가 기존 tkstack 패키지 추출이라 그 이전 작업은 있어 보이지만, 공개 저장소에서 그 기간을 세는 커밋은 찾지 못했습니다. 같은 저자의 [calldiff](https://github.com/tanishqkancharla/calldiff)(생성 2026-08-07, 에이전트 리뷰용 호출 스택 diff)는 주제가 가깝지만, diffmap 스킬의 전신이라고 적은 커밋은 없습니다. |
| 큰 기능이나 리팩터마다 매일 쓴다 | ⚠️ | 본인 진술입니다. diffmap 저장소 자체는 2026-09-10부터 2026-10-31까지 19일에만 커밋이 있습니다. 다른 저장소에서의 매일 사용은 이 이력으로 확인되지 않습니다. 발표 당일 Halo 저장소에 워크스루 커밋이 하나 있는 것은 확인됩니다. |
| 이제야 공개하게 되어 기쁘다 | ✅ | 발표일은 2026-10-30입니다. 저장소 `created_at`은 2026-09-10이라, "공개"가 저장소 생성과 같은 날인지는 이 API만으로 확정하지 못했습니다. 발표 시점의 자기 서술은 그 포스트에 있습니다. |

**총평:** 한국어 포스트의 핵심(한 장의 스펙, 에이전트에게 시키면 나온다, 의도부터 본다)은 저장소와 맞습니다. 어긋나는 부분은 1000줄이라는 수, "꼭 봐야 할 것만 남긴다"는 강한 표현, 그리고 완성도에 대한 조언입니다. 저자 포스트에서 공개 이력과 안 맞는 것은 "2개월 넘게"와 "매일"이고, 둘 다 거짓으로 단정할 자료는 없습니다. ❌로 닫을 주장은 없었습니다.

## 리뷰할 때 가져갈 점

1. **프롬프트 한 줄로 시험할 수 있습니다.** 설치 전에 README의 `Write a diffmap spec for the changes on this branch...`를 지금 브랜치에 붙여 보면, 스킬이 말하는 페이즈·Today/Proposed·`changes` 카드가 나오는지가 바로 보입니다.
2. **스펙은 리뷰의 목차이고, 패치의 대체물이 아닙니다.** `changes`에 적힌 순서대로 보고, 접힌 "N other files"은 생성 파일인지 아직 사람이 볼 변경인지 한 번은 구분하는 편이 맞습니다. 그 구분을 에이전트가 이미 했다고 가정하는 순간 이 형식의 구멍이 열립니다.
3. **공유 링크를 보내기 전에 스냅샷 범위를 보세요.** unlisted gist에는 참조된 파일 내용이 들어갈 수 있고, 로컬 미디어는 그 경로로 나가지 않습니다. 팀 공유가 필요하면 저자가 이슈 #32에 적어 둔 한계(rate limit, 소스 노출)를 같이 보는 것이 맞습니다.

## 참고 자료

- Tanishq Kancharla, diffmap — [GitHub](https://github.com/tanishqkancharla/diffmap) · [README @ `973e2c9`](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/README.md) · [스킬](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/skills/generate-diffmap/SKILL.md) · [홈 소스](https://github.com/tanishqkancharla/diffmap/blob/973e2c9/src/host/home.md) · [첫 커밋 `eb5fba9`](https://github.com/tanishqkancharla/diffmap/commit/eb5fba9) · [diffmap.dev](https://diffmap.dev)
- npm `@tanishqkancharla/diffmap` — [패키지](https://www.npmjs.com/package/@tanishqkancharla/diffmap) · [레지스트리](https://registry.npmjs.org/@tanishqkancharla/diffmap) (조회일 2026-11-02, 최신 0.7.1)
- 이슈 #32, "Diffmap Cloud hosting solution" — [링크](https://github.com/tanishqkancharla/diffmap/issues/32)
- 홈이 예시로 거는 Halo 워크스루 — [커밋 `b01ac5e0`](https://github.com/cashew-labs/halo/commit/b01ac5e0633c906efb1d09bf164da46b8bed2b04) · [스펙](https://github.com/cashew-labs/halo/blob/b01ac5e0633c906efb1d09bf164da46b8bed2b04/.diffmap/shared-workspace-memory.md)
- 원본 X 포스트: [@tanishqk의 발표](https://x.com/tanishqk/status/2116212881125691850) · [@aburacadabra_의 한국어 요약](https://x.com/aburacadabra_/status/2116702513218945179)
