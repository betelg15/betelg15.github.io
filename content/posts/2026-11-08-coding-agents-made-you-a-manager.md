---
title: "'다 했어요'를 믿으면 내가 테스트다? 코딩 에이전트 매니저 습관 팩트 체크"
date: 2026-11-08
time: "21:22"
slug: coding-agents-made-you-a-manager
tags: [Claude Code, 코딩 에이전트, Addy Osmani, 팩트체크, CLAUDE.md]
summary: "Addy Osmani의 2026-11-08 X 기사 'Your coding agents made you a manager'를 Claude Code 문서, Wharton SSRN 초록, Grove, Netflix 문화 메모와 대조했다. /goal·Stop hook·auto mode·/batch는 문서에 있고, 'PR을 항상 연다'와 분류기의 '반드시 차단'은 문서보다 세다."
---

> 이 글은 제가 X에서 북마크해 둔 [@ryuhyun_dev(최류현)의 포스트](https://x.com/i/status/2119358123895029769)를 계기로 썼습니다. 그 글이 고른 두 문장은 "끝난 일을 스스로 확인할 방법을 같이 줘라", "같은 실수를 두 번 고쳤으면 규칙으로 적어라"입니다. 원문은 Addy Osmani([@addyosmani](https://x.com/addyosmani), 프로필 소개 "Claude Code @anthropicai")의 X Article [Your coding agents made you a manager](https://x.com/addyosmani/status/2119332146485891501)입니다. 기사 주소는 [x.com/i/article/2118901185377964033](https://x.com/i/article/2118901185377964033)이고, `created_at`은 `2026-11-08T07:32:13.000Z`, **2026-11-08 16:32 KST**입니다. 한국어 포스트의 `created_at`은 `Sun Nov 08 09:15:27 +0000 2026`, **2026-11-08 18:15 KST**입니다.
>
> 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter의 Osmani 응답](https://api.fxtwitter.com/status/2119332146485891501)과 [한국어 포스트 응답](https://api.fxtwitter.com/status/2119358123895029769)(`code` 200, 기사 `content.blocks`)으로 읽었습니다. 읽은 시각은 2026-11-08 21:17 KST 무렵입니다. 그 시점 스냅샷으로 Osmani 글은 답글 130, 리포스트 140, 좋아요 1,369, 북마크 2,237, 조회 87,788이고, 한국어 글은 답글 2, 리포스트 1, 좋아요 3, 북마크 4, 조회 216입니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 기능 대조는 같은 날 연 [Claude Code best practices](https://code.claude.com/docs/en/best-practices), [Keep Claude working toward a goal](https://code.claude.com/docs/en/goal), [Review locally with /code-review](https://code.claude.com/docs/en/code-review-local), [Choose a permission mode](https://code.claude.com/docs/en/permission-modes), [How Claude remembers your project](https://code.claude.com/docs/en/memory)입니다. 기사가 링크한 2026-01-08 블로그 [Your AI coding agents need a manager](https://addyosmani.com/blog/coding-agents-manager/)는 **다른 글**입니다. 이번 기사는 그 글을 앞에 둔 뒤, Claude Code를 만들며 배운 습관을 영향이 크다고 보는 순서로 다시 배열합니다.

## 왜 중요한가

코딩 에이전트 하루는 이미 관리의 하루와 같은 동작을 반복합니다. 할 일을 고르고, 지시를 쓰고, 맡기고, 따라가고, 결과를 판단하고, 무엇을 내보낼지 정합니다. Osmani의 첫 문장은 이겁니다. 에이전트를 관리하는 기술은 팀을 관리하는 기술과 거의 같고, 매니저가 아니어도 배울 수 있다.

그가 말하는 management는 캘린더에 들어가는 직책이 아닙니다. 본인 정의는 "다른 이의 일이 좋은 결과로 나오게 하는 것"입니다. 에이전트가 동료나 매니저를 대신한다는 뜻도 아니라고 적습니다. 나쁜 인수인계에서 느끼던 불만, 즉 모호한 요청, 빠진 맥락, 중간에 바뀌는 기대가 에이전트에게 일을 맡길 때의 버그 리포트라는 비유입니다.

북마크 글이 집어서 보여 준 두 습관이 기사에서 앞쪽에 있습니다.

1. 테스트, 빌드 종료 코드, 린터, diff 스크립트, 스크린샷처럼 **통과/실패가 갈리는 검사**를 주고, "looks done"(다 된 것처럼 보임)을 확인으로 받지 않는다.
2. 같은 교정을 두 번 했으면 `CLAUDE.md`나 공유 스킬에 적어, 다음 세션이 같은 실수를 혼자 다시 배우게 두지 않는다.

아래는 그 둘을 포함해 기사의 실천을 순서대로 옮기되, 슬래시 명령과 설정은 공식 문서에 있는 형태만 적습니다. 문서에서 찾지 못한 동작은 지어 내지 않고 팩트 체크에 ⚠️로 남깁니다.

## 1. 스스로 검사할 방법을 준다

가이드의 문장은 기사와 같습니다. Claude는 일이 끝난 것처럼 보이면 멈춥니다. 통과/실패를 돌려주는 명령이 없으면, 그 "끝난 것처럼 보임"이 유일한 종료 조건이고, 사람은 에이전트의 테스트 스위트가 됩니다.

검사가 될 수 있는 것은 테스트, 빌드 종료 코드, 린터, 픽스처와 출력을 비교하는 스크립트, 목업 옆의 브라우저 스크린샷입니다. 가이드는 그 명령을 적는 줄이 `CLAUDE.md`에서 **가장 쓸모 있는 한 줄**이라고 합니다. `CLAUDE.md`는 세션마다 읽히는 지시 파일이고, 가이드가 보여주는 짧은 형태는 이렇습니다.

```markdown
# Commands
- Install: pnpm install
- Run one test file: pnpm vitest run path/to/file.test.ts
- Typecheck: pnpm tsc --noEmit

# Conventions
- Use the error helpers in src/lib/errors.ts, never throw raw strings
- src/legacy/ is still live but don't copy its patterns into new code

# Gotchas
- Integration tests need DATABASE_URL set, see .env.example
```

같은 페이지가 강도를 네 단계로 나눕니다. 프롬프트와 `/goal`은 모델이 따르는 요청에 가깝고, Stop hook은 하네스가 끝내지 못하게 막습니다. `/code-review`는 그 대화를 보지 않은 서브에이전트에게 diff를 맡깁니다.

**프롬프트.** 가이드 예시는 `run the auth tests after, and keep going until they pass`입니다. 만족의 판단은 Claude에게 남아 있습니다.

**`/goal`.** 세션당 하나. 턴이 끝날 때마다 별도 모델이 조건을 대화 내용과 대조하고, 아직이라면 다음 턴을 엽니다. 전용 문서의 예는 이겁니다.

```text
/goal all tests in test/auth pass and the lint step is clean
```

평가 모델은 명령을 직접 실행하지 않습니다. Claude가 돌린 테스트 출력이 대화에 남아 있어야 판단할 수 있습니다. 조건은 4,000자까지이고, `or stop after 20 turns` 같은 상한을 문장에 넣을 수 있습니다. 구현은 세션 범위의 prompt Stop hook이며, 기본 평가 모델은 그 환경의 small fast model입니다. 목표가 충족되거나, 불가능하다고 판단되거나, 사용자가 고쳐야 하는 오류(인증 실패, 크레딧 소진, 압축으로도 안 되는 컨텍스트 초과, 사용 불가 모델)가 나면 지워집니다. `/goal clear`로도 지웁니다.

**Stop hook.** 타입체크를 강제하는 공식 예는 `.claude/settings.json`의 이 블록입니다. 종료 코드 2가 턴 종료를 막습니다. stderr로 보낸 컴파일러 출력이 Claude에게 "아직 못 끝낸다"는 이유가 됩니다.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "pnpm tsc --noEmit 1>&2 || exit 2" }
        ]
      }
    ]
  }
}
```

저장소의 패키지 매니저와 명령은 이 `pnpm tsc`를 바꾸면 됩니다. 스키마는 그대로입니다. 문서의 한계도 같이 있습니다. 도구 호출 없이 Stop hook이 **여덟 번 연속**으로 막으면, Claude Code는 다음 차단을 무시하고 턴을 끝냅니다. 상한은 `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`으로 올립니다. "타입체크가 통과할 때까지 절대 안 끝난다"는 문장으로 읽으면 문서보다 셉니다.

**`/code-review`.** 터미널에서는 자기 컨텍스트를 가진 백그라운드 서브에이전트가 리뷰합니다. 베스트 프랙티스 문장은 "대화를 보지 않은 새 서브에이전트"입니다. 인자 없이 치면 현재 브랜치의 커밋과 커밋되지 않은 변경을 봅니다. `HEAD~15..HEAD`, `main...my-feature`, PR 번호, 경로도 대상이 됩니다. `--fix`는 발견을 작업 트리에 적용하고, 권한 모드를 탑니다.

리뷰 범위를 좁히는 문장도 가이드에 있습니다. "문제를 찾아라"만 하면 항상 무언가를 찾습니다. 가이드가 권하는 쪽은 스펙 대비 정확성만 보고 스타일은 건너뛰는 것입니다.

```text
use a subagent to review the rate limiter diff against SPEC.md, check every requirement is implemented and the listed edge cases have tests, report gaps that affect correctness and skip style
```

기사의 "작성자가 자기 PR을 승인하지 않는 것과 같다"는 비유입니다. 제품 규칙은 아닙니다. GitHub용 Code Review(조직이 켜는 관리형 리뷰)와 로컬 `/code-review`는 문서가 다른 페이지로 나눕니다. 로컬 명령은 플랜을 가리지 않고, 사용량은 그 세션의 플랜 또는 API 과금에 포함됩니다.

끝난 뒤 앱을 실제로 띄워 보는 `/verify`도 같은 가이드에 있습니다. 기사 본문에는 없습니다.

## 2. 저장소에 없는 맥락만 적는다

에이전트는 작업 시작 때 코드를 읽습니다. 가이드는 폴더 구조, 관례, 테스트 구성을 설명보다 빨리 집어낸다고 하고, 적을 가치가 있는 것은 회의에서 정한 결정, 누군가 머릿속에만 있는 배포 절차, 이번 작업이 왜 중요한지, 이번에 끝난다는 것이 무엇인지라고 합니다. 두 질문이 모두 예라면 빼라고 합니다. 코드를 읽어 찾을 수 있는가, 그리고 실제로 읽어 보러 갈 것인가.

기사는 모호한 "대시보드를 빠르게"를 이렇게 바꿉니다. 숫자는 예시라고 본문이 밝힙니다.

```text
멤버 1만 명 이상 조직에서 /team 대시보드 p95 로딩을 2초 아래로.

왜: 엔터프라이즈 관리자가 매일 열고, 느린 로딩이 지원 티켓 1위다.
제약: 스키마 변경 금지. API 응답 모양은 유지.
범위 밖: UI 변경, 페이지 전체 캐시.
확인: scripts/perf/team.sh 를 실행하고 앞뒤 숫자를 보여 줘.
```

목적, 이유, 제약, 범위 밖, 성공 확인이 한 메시지에 있습니다. 방법은 비워 둡니다. Osmani는 이를 군사 용어 commander's intent와 Netflix의 "context, not control"에 겹쳐 놓습니다.

미 육군 ATP 4-90.5는 ADP 6-0을 인용해 commander's intent를 "작전의 목적과 원하는 군사적 종료 상태를 분명하고 짧게 밝히는 것"으로 적고, 작전이 계획대로 풀리지 않아도 추가 명령 없이 그 결과를 향해 움직이게 하는 장치라고 설명합니다. [Netflix 문화 페이지](https://jobs.netflix.com/culture)의 현재 문장은 매니저에게 context not control을 요구합니다. 팀이 좋은 결정을 내리게 맥락과 명확함을 주고, 모든 것을 직접 통제하지 말라는 뜻입니다. 같은 문단은 이것을 방임과 구분합니다. 위기, 윤리, Netflix에 실질적 해를 줄 결정, 맥락이 부족한 새 팀원에게는 매니저가 개입한다고 적습니다.

아직 스펙을 쓸 수 없으면 가이드는 인터뷰를 먼저 시킵니다.

```text
공개 API에 레이트 리밋을 넣고 싶은데 아직 정리가 안 됐다. 스펙을 쓸 수 있을 때까지 질문하고, SPEC.md 로 저장해 줘.
```

그다음 **새 세션**에서 그 파일을 보고 구현합니다. 발견용 작업은 모호한 프롬프트로 시작해도 된다고 기사와 가이드가 같이 말합니다.

`gh`처럼 이미 아는 CLI는 설명하지 않아도 됩니다. 이슈 트래커나 에러 대시보드에 CLI가 없으면 MCP입니다. 가이드의 추가 예는 `claude mcp add --transport http notion https://mcp.notion.com/mcp`입니다.

## 3. 교정은 다음 세션에 남긴다

같은 지적을 세션마다 반복하는 것이 안티패턴입니다. 두 번 고친 것은 `CLAUDE.md`에 적거나, 반복 절차면 스킬로 올립니다. 가이드가 `CLAUDE.md`에 남기라고 하는 종류는 네 가지입니다. 확인 명령, 코드가 오해시키기 쉬운 곳, 저장소에 없는 결정, 이미 두 번 고친 것.

파일은 짧게 유지합니다. 매 세션에 실리므로, 이번 작업과 무관한 줄도 주의를 차지합니다. `/init`이 초안을 만들고, `/doctor`가 코드만으로 알 수 있는 줄을 자르라고 하며, 메모리 가이드는 200줄 아래를 권합니다. 개인 취향은 `CLAUDE.local.md`에 두고 `.gitignore`에 넣습니다.

한 디렉터리에만 해당하는 규칙은 `.claude/rules/`에 `paths`를 답니다.

```markdown
---
paths:
  - "src/api/**/*.ts"
---
- 요청 본문은 src/api/schemas/ 의 zod로 검증한다
- 새 엔드포인트는 openapi.yaml 에 항목이 있어야 하고, 없으면 CI가 실패한다
```

릴리스처럼 부작용이 있는 절차는 스킬로 빼고, 모델이 혼자 시작하지 못하게 할 수 있습니다.

```markdown
---
name: release
description: Cut a new release. Bumps the version, writes the changelog entry, tags it and pushes the tag so CI can publish.
disable-model-invocation: true
---
1. main 이고 워킹 트리가 깨끗하지 않으면 멈추고 물어 본다.
2. 버전을 올리고 그 결과를 커밋한다.
3. 지난 태그 이후 PR을 사용자에게 보이는 변경만 CHANGELOG.md 에 한 줄씩 적는다.
4. v<버전> 태그를 푸시한다. 퍼블리시는 CI가 하고, 이 머신에서는 하지 않는다.
```

`disable-model-invocation: true`이면 사용자가 `/release`를 칠 때만 돕니다. 기사가 말하는 "공유 스킬"의 문서상 위치는 저장소의 `.claude/skills/<이름>/SKILL.md`입니다. 커밋하면 팀에 따라갑니다.

기사는 코드 리뷰에서 `@claude`를 불러 피드백을 정책으로 남기는 팀도 있다고 합니다. 그건 관행 서술이지, 이 글이 따로 확인한 제품 기능의 이름은 아닙니다. 로컬 `/code-review --comment`는 발견을 GitHub PR 인라인 코멘트 또는 GitLab 노트로 올리는 플래그입니다. 문서에 있는 쪽은 이 플래그입니다.

새 모델이 나오면, 적어 둔 교정이 아직 필요한지 다시 보라고 기사가 말합니다. 가이드의 `/doctor prompt-audit`은 옛 모델용 문장, 없는 파일을 가리키는 줄, 서로 모순인 줄을 표시합니다.

## 4. 판단은 맡기고, 구부릴 수 없는 것만 강제한다

가이드의 표는 지시를 둘로 나눕니다.

| | 모델이 읽고 판단 | 하네스가 항상 실행 |
|---|---|---|
| 무엇을 할지 | 프롬프트, `CLAUDE.md`, 스킬 | hook, 사용자만 시작할 수 있는 스킬 |
| 무엇을 만질지 | auto mode 분류기 | deny 규칙, strict 샌드박스, managed settings |
| 언제 끝났는지 | 증거를 달라는 말, `/goal`, `/code-review` | 테스트, 타입체크, Stop hook, CI |
| 얼마나 쓸지 | effort, Claude의 속도 | `-p`의 `--max-turns`, `--max-budget-usd` |
| 마지막 말 | Claude의 요약 | 브랜치 보호, 머지를 승인하는 사람 |

프롬프트와 `CLAUDE.md`와 스킬은 요청입니다. 현재 모델이 잘 따르더라도 보장은 없습니다. hook, deny, managed settings는 모델이 무엇이라 판단해도 적용됩니다. 가이드가 강제 예로 드는 문장은 "생성된 클라이언트는 수정하지 않는다", "파일을 만든 뒤 라이선스 헤더 스크립트를 항상 돌린다"입니다. `CLAUDE.md`에 강조를 더해도 계속 빠지면 hook으로 옮기고, 취향을 hook으로 걸어 두었으면 지우라고 합니다.

`.env`를 읽지 못하게 하는 deny는 권한 모드와 무관하게 적용됩니다. auto mode와 `bypassPermissions`에서도 그렇습니다.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm tsc --noEmit)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./.env.local)", "Read(./secrets/**)"]
  }
}
```

문서가 같이 적는 경계: `Read` 규칙은 `cat .env`는 잡습니다. 그 파일을 여는 임의의 스크립트까지 잡지는 않습니다. 도메인 `WebFetch` deny는 샌드박스가 없으면 같은 도메인 `curl`을 막지 않습니다.

**auto mode.** 새 터미널 세션과 VS Code 세션은 auto mode로 시작합니다. 분류기가 위험한 행동을 보기 전에 거릅니다. 문서가 예로 든 것은 `curl | bash`, 프로덕션 배포와 마이그레이션, 다른 사람의 작업을 덮는 force push, 민감 데이터의 외부 전송, 사용자가 아니라 Claude가 읽은 내용이 밀어 올린 것처럼 보이는 행동입니다. 기사의 "프로덕션에 배포하거나 누군가의 작업을 force push로 덮는 행동을 거른다"는 이 목록과 맞습니다.

다만 가이드는 분류기를 하드 룰이 아닌 판단이라고 못 박고, 틀릴 수 있다고 합니다. deny와 `PreToolUse` hook은 분류기보다 먼저 적용됩니다. "never"는 deny나 hook에 두라고 경고합니다. 세 번 연속 또는 누적 스무 번 막히면 auto mode는 멈추고 다시 물어봅니다. 조직은 auto mode를 끌 수 있습니다.

**effort.** 가이드가 그만두라고 하는 습관 표에 ALL CAPS, `think hard` / `think harder` / `be thorough`, "don't be lazy"가 있습니다. effort가 생각하는 양의 조절이고, 그 문장들은 설정 안에서 살짝 밀 뿐 설정을 넘지 못합니다. 세션에서는 `/effort`로 바꿉니다. Opus 5.5, Sonnet 5.5, Haiku 5.5의 기본은 `medium`이고, 대부분의 플랜에서 새 세션의 기본 모델은 Opus 5.5라고 같은 페이지가 적습니다. `/effort high`와 `/effort xhigh`는 놓치기 쉬운 경우(남의 코드의 버그, 플레이키 테스트, 스키마 변경의 모든 독자)에, `/effort low`는 짧게 주고받으며 사람이 매번 볼 때에, `max`는 혼자 오래 파게 둘 때에 씁니다. 한 메시지만 더 깊게 보고 싶으면 설정 대신 그 프롬프트에 `ultrathink`를 넣습니다. "think harder는 이제 설정"이라는 기사 문장은 표와 맞고, `ultrathink`가 한 턴 예외로 남아 있다는 점은 기사에 없습니다.

Andy Grove는 *High Output Management*에서 task-relevant maturity를 그 과제에 대한 성취 지향, 책임을 질 준비, 교육, 훈련, 경험의 조합으로 정의하고, 전반적 능력과 별개로 **그 과제에서** 높고 낮을 수 있다고 합니다. 낮으면 무엇을 언제 어떻게 할지 구조적으로 말하고, 높으면 목표를 합의한 뒤 개입을 줄입니다. 어느 쪽이든 서프라이즈가 없을 정도로 지켜보는 일은 위임과 방임을 가르는 차이라고 적습니다. 기사가 말한 "그 과제에서의 수행 이력이지 전반적 역량이 아니다"는 이 정의의 핵심을 옮긴 것이고, 책의 정의에는 태도(성취 지향, 책임)도 들어 있습니다.

## 5. 만들기 전에 계획을 본다

plan mode는 파일을 읽고 계획을 쓰되, 승인 전에는 소스를 수정하지 않는 권한 모드입니다. 들어가는 방법은 `Shift+Tab`으로 모드를 돌리기, 프롬프트 앞에 `/plan`, 또는 `claude --permission-mode plan`입니다. VS Code 문서의 `/plan fix the auth bug`는 그 작업의 계획을 바로 시작합니다.

기사는 큰 일일수록 계획을 **두 번째 세션**에서 스태프 엔지니어처럼 읽으라고 합니다. 가정이 무엇인지, 어디가 불확실한지. 가이드도 구현 세션과 리뷰 세션을 나누는 쪽을 같은 이유로 적습니다. 한 세션이 레이트 리밋을 쓰고, 다른 세션이 그 파일이 쓰이는 과정을 보지 않은 채 리뷰합니다.

**`/batch`.** 베스트 프랙티스에 있는 명령은 이 형태입니다.

```text
/batch migrate every handler to the v2 response helpers
```

큰 기계적 변경을 **5에서 30개** 단위로 나누고 계획을 보여 줍니다. 승인한 뒤 각 단위는 자기 worktree(저장소의 별도 체크아웃)에서 돌고, PR을 열거나 무슨 일이 있었는지 보고합니다. 기사의 "각 작업마다 PR을 만든다"는 문서의 "PR을 열거나 보고한다"보다 셉니다. 계획 승인 단계도 문서에 있습니다. 겹치는 조각이 없는지, 공유 인터페이스가 먼저 들어가는지만 사람이 보면 된다는 것이 기사의 요지입니다.

worktree는 `claude -w feature-auth`로도 엽니다. `.env` 같은 gitignore 파일은 새 체크아웃에 없으므로, 필요한 파일은 저장소 루트의 `.worktreeinclude`에 적습니다. `node_modules`를 넣으면 워크트리마다 통째로 복사됩니다.

## 6. 첫 분에 보고, 두 번 실패하면 새로 쓴다

가이드의 조작은 세 개입니다.

- `Esc`는 진행 중인 행동을 멈추고, 그때까지 한 일은 남깁니다.
- 빈 프롬프트에서 `Esc` 두 번, 또는 `/rewind`는 되감기 메뉴를 엽니다. 코드, 대화, 또는 둘 다를 이전 프롬프트 시점으로 돌리거나, 대화 일부를 요약할 수 있습니다.
- 같은 교정이 두 번 실패한 뒤에는 `/clear`로 세션을 비우고, 배운 점을 넣은 새 프롬프트를 씁니다. 세 번째 교정은 실패한 시도 두 번을 모델이 다시 읽게 할 뿐이라고 합니다.

기사의 "/rewind가 코드와 대화를 되돌린다"는 메뉴의 선택지와 맞습니다. 항상 둘 다 되돌린다는 뜻은 아닙니다. 체크포인트는 메인 대화에서 Claude의 파일 도구가 고친 파일을 덮습니다. Bash만 건드린 파일은 복구되지 않고, git을 대신하지 않습니다. `/code-review --fix`가 백그라운드에서 고친, 대화의 체크포인트 밖 파일도 `/rewind`로 돌아오지 않을 수 있어 그때는 git을 씁니다.

## 7. 일은 맡기고 판단은 남긴다

기사의 안티패턴 이름은 code ratification입니다. 테스트가 녹색이고 이름이 그럴듯한 큰 diff를 승인하는 것. 그는 경쟁 제품 공백을 조사하게 한 뒤 로컬 PR까지 쓰게 했고, 연구는 읽었지만 코드는 훑기만 한 채 사용자에게 복잡성만 더하는 변경을 거의 푸시할 뻔했다고 적습니다. 600줄이라는 크기는 그 일화의 숫자입니다.

사람이 남긴다고 그가 적는 일은 제품 판단, 보안 경계, 규정, 무엇을 내보낼지입니다. 스타일, 린트, 리뷰 후속, 평범한 버그, 유닛 테스트는 에이전트 쪽으로 둡니다. "리뷰의 단위가 이해의 단위"이므로 변경을 작게 유지하라는 문장도 여기 있습니다.

위임과 방임을 가르는 Grove의 문장은 4절의 모니터링입니다. 외곽 루프, 즉 제약, 출력을 얼마나 읽는지, 어떤 증거를 남기는지, 무엇이 사람 서명을 요구하는지는 기사가 사람이 소유하라고 하는 자리입니다.

## 8. 자리를 비워도 되는 실행을 설계한다

가이드가 무인 실행 전에 던지는 질문은 다섯 개이고, 기사와 같은 순서입니다.

1. 끝이 어떻게 생겼는지 아는가. goal 조건, 스펙 파일, 또는 녹색으로 만들어야 하는 실패하는 테스트.
2. 스스로 확인할 수 있는가. 테스트, Stop hook, 리뷰 단계.
3. 어디를 만질 수 있는가. 권한 규칙, `dontAsk`, 샌드박스, worktree, 푸시해도 되는 브랜치 하나.
4. 무엇이 멈추게 하는가. `--max-turns`, `--max-budget-usd`, 지출 한도.
5. 결과가 어디에 나오고 누가 승인하는가. PR, 코멘트, 요약, 그리고 되돌리기 어려운 행동의 사람 승인.

스크립트 형태는 `claude -p`입니다. `--max-turns 20` 같은 상한, `--permission-mode dontAsk`, `--allowedTools`를 같이 씁니다. `--bare`는 hook, 스킬, 플러그인, MCP, `CLAUDE.md`를 건너뛰므로, hook이 필요한 실행에는 쓰지 말라고 문서가 적습니다. 가이드의 파일럿은 기사와 같습니다. **세 파일**에 먼저 돌리고, 프롬프트를 고친 다음 나머지를 돌립니다. 새 종류의 첫 몇 런은 지켜본 뒤에 무인으로 믿습니다.

세션 안 반복은 `/loop 15m ...`입니다. 노트북을 덮어도 돌아야 하면 `/schedule`의 클라우드 작업이고, claude.ai 로그인이 필요합니다. 그 전에 `main`을 그 작업이 우회할 수 없는 브랜치 규칙으로 막으라고 합니다.

## 9. 관심을 늘리지 말고 검증을 늘린다

Osmani가 orchestration tax라고 부르는 것은 그의 체감입니다. 에이전트가 몇 개를 넘으면 하나 추가할 때마다 주의가 더 들고, 자기는 보통 백그라운드 네다섯 개와 로컬 세션 몇 개이며 어떤 날은 그것도 많다는 1인칭 서술입니다. 측정된 상수는 아닙니다.

그가 제안하는 지표는 PR 사이클 타임, 새 사람의 적응 시간, revert와 재작업의 빈도입니다. AI가 쓴 코드의 비율은 목표로 두지 말라고 합니다. Grove는 지표가 시선을 끌어 그쪽으로 조향하니, 효과와 반대 효과를 짝으로 재라고 합니다. 재고를 줄이라고 재면 결품도 같이 재야 한다는 예시입니다. "머지된 PR 수" 옆에 "revert와 재작업"을 두라는 적용은 Osmani의 것이고, 짝을 지으라는 원칙은 Grove의 것입니다.

자리를 비운 감시의 문서상 도구는 goal의 턴마다 평가, Stop hook, 대화를 보지 않은 리뷰어, 알림입니다. 서브에이전트는 병렬, 시끄러운 출력을 본 대화 밖에 두기, 작성 과정을 모르는 리뷰에 쓰이고, 같은 질문에 더 똑똑한 답을 주려고 부르는 용도는 가이드가 그만두라고 하는 표에 있습니다. 토큰은 본 세션과 같은 사용량에서 나갑니다.

## 10. 만들지 않을 것을 정한다

싸게 시작할 수 있게 되면, 그럴듯한 아이디어가 PR이 되고, 리뷰와 보안과 유지보수가 부족한 자원이 됩니다. 기사가 돌리라고 하는 질문은 누가 요청했는가, 성공을 어떻게 아는가, 언제 그만둘 것인가, 동시에 진행하는 일의 상한을 둘 것인가입니다. "할 수 있는가"가 아니라 "해야 하는가"가 어려운 질문이 된다는 문장은 그의 1월 글에도 있고, 이번 기사에서 다시 나옵니다.

## 11. 비유가 깨지는 곳

기사 말미의 차이는 일곱 가지입니다. 사람 관리의 기술은 반대로 옮겨 가지 않는다(동기, 갈등, 커리어, 몇 달에 걸친 신뢰). 재작업은 거의 공짜라 사람에게 시키지 않을 비교 구현을 시킬 수 있다. 에이전트에게 경력의 경험은 없고 노트만 있다. 에이전트는 자신 있게 따르므로 사람이 과신하기 쉽다. 에이전트는 한 종류의 강점만 가지고 그 강점이 모델이 바뀔 때마다 같이 바뀐다. 주니어가 배우던 입문 과제를 에이전트가 가져가면, 그 반복을 의도적으로 다시 만들어야 한다. 에이전트만 관리하는 하루는 사람 팀을 만드는 시간을 밀어 낸다.

**auto memory.** 공식 문서의 문장입니다. "Auto memory is machine-local." 같은 git 저장소의 worktree와 하위 디렉터리는 그 머신의 `~/.claude/projects/<project>/memory/` 하나를 공유하고, 파일은 다른 머신이나 클라우드 환경과 공유되지 않습니다. 기본은 로컬 세션에서 켜져 있습니다. 기사의 "팀원의 세션으로 옮겨 가지 않는다"는 이 설계와 맞습니다. 팀에 남길 교정이 `CLAUDE.md`와 스킬이어야 하는 이유입니다. 메모리 인덱스의 앞 200줄 또는 25KB가 세션 시작 때 올라갑니다.

**cognitive surrender.** 기사는 Wharton 연구를 인용합니다. 참가자가 잘못된 AI 답을 대부분의 경우 받아들였고, 확신은 커졌다. 막을 방법은 에이전트에게 자기 답의 반론을 시키라는 그의 제안입니다.

1차 자료로 연 것은 Steven D. Shaw, Gideon Nave의 SSRN 논문 *Thinking—Fast, Slow, and Artificial*([abstract_id=6097646](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6097646), Date Written: January 11, 2026, The Wharton School Research Paper)의 **초록**입니다. PDF 본문은 이 환경에서 열리지 않았습니다. 초록이 말하는 내용은 다음과 같습니다.

- 사전 등록된 실험 세 개, Cognitive Reflection Test를 변형, N = 1,372, 시행 9,593.
- 숨은 시드로 AI 정답을 무작위화.
- 참가자는 시행의 과반(>50%)에서 AI를 보기로 선택.
- Study 1에서 AI가 맞으면 기준선(AI 없음) 대비 정확도 **+25%p**, 틀리면 **−15%p**.
- System 3를 쓰면 확신도 올랐고, 오류 뒤에도 그랬다.
- 시간 압박(Study 2), 문항별 보수와 피드백(Study 3)도 이 패턴을 없애지 못했다.
- 저자들이 cognitive surrender라고 부르는 것은 AI 출력을 최소한의 검토로 받아들여, 직관(System 1)과 숙고(System 2)를 덮어 쓰는 일입니다.

"대부분의 경우 잘못된 답을 받아들였다"의 **정확한 비율**은 초록에 없습니다. 2차 서술이 갈립니다. Osmani의 2026-05-05 글은 틀린 시행의 73%에서 오답을 받았다고 합니다. SSRN 블로그의 Shaw 인터뷰는 Study 1에서 AI를 연 뒤 잘못된 추천을 대략 다섯 번 중 네 번 따랐다고 합니다. Wharton Magazine 인터뷰는 오답일 때도 채택이 80%를 넘었다고 Shaw를 인용합니다. 방향(틀린 AI를 많이 따르고, 확신은 오른다)은 초록과 맞고, 73과 약 80은 이 글이 논문 본문으로 화해시키지 못했습니다. 그래서 이 항목은 ✅가 아니라 ⚠️입니다.

## 비즈니스 인사이트

숫자와 제품 설명은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**입니다. 매출, 기업 가치, 채용 공고 수는 적지 않습니다. 가격은 2026-11-08에 연 공개 페이지 기준이고, 각 페이지가 세금 별도·변경 가능이라고 밝힙니다.

**같은 일의 다른 제품.** 기사가 전제로 두는 도구는 Claude Code입니다. [Claude 가격 페이지](https://claude.com/pricing)에서 Pro는 월 $20, 연간 선결제 시 월 $17($200 선결제)이고 Claude Code가 포함됩니다. Max는 월 $100, Pro 사용량의 5배(5시간마다, 그리고 매주), 월 API 크레딧 $100. Ultra는 월 $200, 매주 Pro의 10배, 검증된 계정은 5시간 한도가 없고 월 API 크레딧 $200입니다. [도움말](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-max-or-ultra-plan)은 터미널과 VS Code, Cursor를 포함한 VS Code 포크, JetBrains가 같은 구독 한도를 쓴다고 합니다. `ANTHROPIC_API_KEY`가 있으면 구독 한도 대신 API 과금입니다.

[OpenAI Codex 페이지](https://openai.com/codex/)는 Codex가 ChatGPT 플랜에 포함된다고 하고 Plus $20, Pro $100, Business $20을 보여 줍니다. Business 옆 주는 "2인 이상, 연간 청구"입니다. 그 $20이 인당인지는 그 문장만으로 단정하지 않습니다. [Pro 티어 도움말](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)은 Pro 100 / 200 / 500을 월 $100 / $200 / $500으로 나누고, Pro 100과 Pro 500의 Work·Codex 포함량이 이전의 두 배가 되었다고 합니다. 마케팅 페이지의 Pro $100과 도움말의 세 단계가 같은 날 공존합니다. [Codex 사용 도움말](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)은 ChatGPT 계정으로 로그인하면 auto-review 안전 검사가 플랜 한도에 포함되지 않는다고 합니다. Codex Cloud는 Free와 Go에는 없고, Plus 이상의 자격에 달려 있습니다.

[Cursor 가격 페이지](https://cursor.com/pricing)의 JSON-LD Offer는 Plus $8, Premium $30, Super $100, Ultra $200, Teams $30입니다. 페이지 문장은 Free $0, Teams는 사용자당 $30부터, Premium이 "가장 인기"라고 표시합니다. Plus는 Grok 모델만 포함하고, Premium 이상은 Grok 사용량이 더 크며 서드파티 모델은 구독에 포함되지 않고 API 정가로 Cursor 안에서 따로 냅니다. 클라우드 에이전트, Origin 코드 호스팅, Bugbot 리뷰는 비교표에서 Premium부터 체크입니다. 같은 표에 X 게시, Grok, Grok Build가 한 플랜으로 묶여 있고, 리셀러 FAQ는 구독을 X Subscription Corp가 직접 판다고 적습니다. 이 글은 그 페이지가 2026-11-08에 그렇게 말한다는 것만 적습니다.

[GitHub Copilot 플랜 문서](https://docs.github.com/en/copilot/get-started/plans)와 [기능 페이지](https://github.com/features/copilot)는 Copilot Pro 월 $10(기본 크레딧 1,000 + flex 500 = 월 1,500), Pro+ 월 $39(합계 7,000), Max 월 $100(합계 20,000)입니다. 1 GitHub AI Credit = $0.01입니다. 채팅, CLI, 클라우드 에이전트, 서드파티 코딩 에이전트가 크레딧을 쓰고, 코드 완성과 다음 편집 제안은 유료 플랜에서 크레딧 밖이며 무제한이라고 합니다. 에이전트 세션은 모델 호출이 여러 번이라 짧은 채팅보다 많이 씁니다.

**비용.** 좌석 요금은 바닥입니다. Claude Code 문서의 무인 실행은 `--max-turns`와 `--max-budget-usd`로 상한을 따로 두라고 하고, `/goal` 평가 토큰은 small fast model로 청구되며 본 턴에 비하면 보통 작다고 합니다. `/batch`는 한 번의 기계적 변경을 최대 30개 단위로 나누므로, 토큰과 PR 리뷰가 같이 늘어납니다. **분석/의견.** 병렬 에이전트의 한계 비용에서 큰 쪽은 구독 한도 초과와, 사람이 읽는 시간입니다. Osmani의 orchestration tax는 후자를 가리키는 이름이지 청구서의 항목이 아닙니다.

**생산성을 어떻게 재는가.** [METR의 2025년 7월 RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)는 익숙한 대형 오픈소스에서 일해 온 개발자 16명, 과제 246개였습니다. 2025년 2–6월 도구(주로 Cursor Pro와 Claude 3.5/3.7 Sonnet)를 허용하면 완료 시간이 **19% 길어졌습니다**. 시작 전 개발자 예측은 24% 단축, 끝난 뒤 자기 평가는 20% 단축이었습니다. 같은 페이지는 이 결과를 현행 수치가 아니라고 표시합니다. [2026-02-24 후속](https://metr.org/blog/2026-02-24-uplift-update/)의 원자료는 기존 참가자 부분집합에서 시간 −18%(CI −38%에서 +9%), 새로 뽑은 개발자에서 −4%(CI −15%에서 +9%)입니다. METR은 AI 없이 하기 싫어 과제나 참여를 뺀 선택 편향 때문에 이 추정이 실제 가속보다 낮을 수 있고, 에이전트를 동시에 여러 개 쓰면 과제당 시간 측정이 깨진다고 밝히며 실험 설계를 바꾸겠다고 합니다.

**분석/의견.** 2025년 중반의 "느려졌다"와 2026년 초의 "빨라진 것 같다"를 하나의 생산성 배수로 합칠 수 없습니다. 후속 연구가 스스로 말한 빈칸이 Osmani의 측정 조언과 만납니다. 처리량만 보면 안 되고, 동시 에이전트는 시간 측정을 망가뜨립니다. AI가 쓴 줄의 비율은 두 연구 어디에도 성공 지표로 나오지 않습니다. Grove의 짝 지표를 여기 적용하면, 머지 수 옆에는 revert, 재작업, 그리고 사람이 실제로 읽은 비율이 있어야 합니다. 마지막 항목은 이 글의 제안이지 METR의 지표가 아닙니다.

**채용과 주니어.** 기사는 입문 과제를 에이전트가 가져가면 주니어가 기본기를 익힐 반복을 매니저가 일부러 만들어야 하고, 에이전트 다섯 개를 돌린 경험이 사람 다섯 명을 관리할 준비가 되지는 않는다고 합니다. **분석/의견.** 채용 공고의 "프롬프트 엔지니어링"은 기사가 효과를 낮게 보는 쪽입니다. 그가 앞에 둔 기술은 검사 가능한 완료 조건, 저장소 밖에만 있는 맥락, 두 번 실패한 세션을 버릴 판단, 녹색 테스트를 승인으로 착각하지 않는 리뷰입니다. 주니어 교육에서 빼면 안 되는 것도 같은 목록입니다. 에이전트가 입문 버그를 고쳐 주는 팀일수록, 그 버그를 사람이 처음부터 재현해 보는 과제를 일정에 넣지 않으면 논문 초록이 말한 패턴, 즉 확신이 정확도와 따로 노는 패턴이 온보딩에서 재현됩니다. 급여나 주니어 채용 감소를 이 글은 수치로 말하지 않습니다. 그런 통계를 여기서 확인하지 않았습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·강도·수치가 다름 / ❌ 1차 자료와 어긋남

원문 X Article(2026-11-08 16:32 KST)를 같은 날의 Claude Code 문서, SSRN 초록, 육군 ATP, Netflix 문화 페이지, Grove 본문 구절과 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 실천은 영향이 큰 순서로 대략 배열돼 있다 | ✅ | 기사 서문. 효과 크기를 잰 표는 없고, 저자의 배열입니다. |
| 에이전트는 일이 끝난 것처럼 보이면 멈추고, 검증 명령이 `CLAUDE.md`에서 가장 쓸모 있는 줄이다 | ✅ | [best practices](https://code.claude.com/docs/en/best-practices) "Give Claude a check to run". 검사 예로 테스트, 빌드 종료 코드, 린터, diff 스크립트, 스크린샷이 있습니다. |
| `/goal`은 매 턴 뒤 별도 모델이 조건을 검사한다 | ✅ | [goal 문서](https://code.claude.com/docs/en/goal). 평가 모델은 명령을 실행하지 않고 대화를 읽습니다. 세션당 하나, prompt Stop hook입니다. |
| Stop hook이 타입체크 통과 전까지 턴 종료를 막는다 | ⚠️ | 종료 코드 2가 막는 공식 JSON이 있습니다. 도구 호출 없이 8번 연속 막히면 다음 차단을 무시하고 턴이 끝납니다. |
| `/code-review`가 diff를, 대화를 보지 않은 서브에이전트에 보낸다 | ✅ | 베스트 프랙티스와 [로컬 리뷰 문서](https://code.claude.com/docs/en/code-review-local). 터미널에서는 별도 컨텍스트의 백그라운드 서브에이전트입니다. "작성자는 자기 PR을 승인하지 않는다"는 비유입니다. 관리형 GitHub Code Review와는 다른 기능입니다. |
| 새 터미널·VS Code 세션은 auto mode로 시작하고, 분류기가 프로덕션 배포와 남의 작업을 덮는 force push를 거른다 | ⚠️ | 시작 모드와 예시 목록은 문서와 같습니다. 문서는 분류기를 틀릴 수 있는 판단이라고 하고, 하드 룰은 deny·hook이라고 합니다. |
| 가이드가 버리라고 하는 습관에 ALL CAPS, "think harder"(effort가 설정), "don't be lazy"가 있다 | ✅ | "What you can stop doing" 표. 한 턴 예외로 `ultrathink`는 남아 있습니다. `/effort`의 값으로 low, medium, high, xhigh, max가 문서에 있습니다. |
| plan mode로 합의된 계획 뒤에 구현하고, 큰 계획은 두 번째 세션에서 본다 | ✅ | plan mode는 [permission modes](https://code.claude.com/docs/en/permission-modes)에 있습니다. 진입은 `Shift+Tab`, `/plan`, `--permission-mode plan`. "두 번째 세션"은 기사의 워크플로이고, 문서도 작성 세션과 리뷰 세션을 나눕니다. |
| `/batch`가 기계적 변경을 5–30개로 나누고, worktree마다 PR을 만든다 | ⚠️ | 5–30단위, 계획 표시, 단위별 worktree는 문서와 같습니다. 결과는 "PR을 열거나 무슨 일이 있었는지 보고"이고, 실행 전에 계획 승인이 있습니다. |
| 교정이 두 번 실패하면 세션을 비우고 프롬프트를 다시 쓴다. `/rewind`는 코드와 대화를 되돌린다 | ✅ | 두 번 실패 뒤 `/clear`. `/rewind` 메뉴는 코드, 대화, 또는 둘 다입니다. Bash만 수정한 파일은 체크포인트가 복구하지 않습니다. |
| 프롬프트·`CLAUDE.md`·스킬은 요청이고 hook·deny·managed settings는 강제다 | ✅ | 베스트 프랙티스 "Deterministic and non-deterministic instructions". |
| 새 세션의 기본이 Opus 5.5, medium effort다 | ✅ | 같은 가이드 "Change a default". "대부분의 플랜과 제공자"라는 한정이 있습니다. |
| task-relevant maturity는 그 과제의 수행이지 전반적 역량이 아니다 | ✅ | Grove, *High Output Management*, Task-Relevant Maturity. 책의 정의는 성취 지향, 책임 준비, 교육, 훈련, 경험의 조합이고 과제마다 다릅니다. |
| 지표에는 반대 효과(countermeasure)를 짝으로 둔다 | ✅ | 같은 책의 pairing indicators. 재고와 결품이 책의 예이고, PR 수와 revert는 Osmani의 적용입니다. |
| commander's intent, Netflix의 "context, not control" | ✅ | [ATP 4-90.5](https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN34147-ATP_4-90.5-000-WEB-1.pdf)가 ADP 6-0의 commander's intent를 목적과 종료 상태로 설명합니다. [Netflix 문화](https://jobs.netflix.com/culture)는 매니저에게 context not control을 요구하고, 방임이 아니라고 합니다. |
| 무인 실행의 다섯 질문, 세 파일로 파일럿 | ✅ | 베스트 프랙티스 "Let Claude run without you". 세 파일 파일럿은 `claude -p` 루프 문단입니다. |
| auto memory는 그 머신에만 남고 팀원 세션으로 가지 않는다 | ✅ | [memory 문서](https://code.claude.com/docs/en/memory): "Auto memory is machine-local." 클라우드와도 공유하지 않습니다. |
| Wharton 연구에서 참가자는 잘못된 AI 답을 대부분의 경우 받아들였고 확신은 커졌다 | ⚠️ | 초록: Study 1에서 틀린 AI는 정확도 −15%p, 확신은 오류 뒤에도 상승, AI 상담은 시행의 >50%. "대부분"의 정확 비율은 초록에 없고, 2차 자료가 73%(Osmani 5월 글), 약 4/5(SSRN 인터뷰), 80% 초과(Wharton Magazine)로 갈립니다. PDF 본문은 열지 못했습니다. |
| 에이전트 다섯 개 운영이 사람 다섯 명 관리의 준비가 된다 | ❌ | 기사는 이것을 **안티패턴**으로 적습니다. 동기, 갈등, 커리어, 장기 신뢰는 옮겨 가지 않는다고 합니다. |

**총평:** 북마크가 집었던 두 습관은 Claude Code 베스트 프랙티스와 문장 단위로 맞습니다. 검사 없는 "다 했어요"는 사람이 테스트 스위트가 되고, 두 번 고친 일은 `CLAUDE.md`에 적습니다. `/goal`, Stop hook, `/code-review`, auto mode, `/batch`, `/rewind`, effort 설정은 모두 공식 문서에 있습니다. 문서보다 센 곳은 두 군데입니다. `/batch`는 PR을 항상 만드는 것이 아니라 PR 또는 보고이고, auto mode 분류기는 프로덕션 배포와 force push를 보되 하드 룰이 아닙니다. Wharton의 "cognitive surrender"는 실재하는 논문이고 확신 상승과 오답 시 정확도 하락은 초록에 있으나, "대부분의 경우"의 퍼센트는 이 글이 본문으로 확정하지 못했습니다.

## 참고 자료

- X Article — Addy Osmani, [Your coding agents made you a manager](https://x.com/addyosmani/status/2119332146485891501) ([기사 주소](https://x.com/i/article/2118901185377964033), 2026-11-08 16:32 KST). 본문은 [fxtwitter](https://api.fxtwitter.com/status/2119332146485891501) `article.content` (2026-11-08 21:17 KST 무렵, `code` 200)
- 북마크 경유 — [@ryuhyun_dev, 2026-11-08 18:15 KST](https://x.com/i/status/2119358123895029769), [fxtwitter](https://api.fxtwitter.com/status/2119358123895029769)
- 저자의 이전 글 — [Your AI coding agents need a manager](https://addyosmani.com/blog/coding-agents-manager/) (2026-01-08), [Cognitive Surrender](https://addyosmani.com/blog/cognitive-surrender/) (2026-05-05, 73% 서술)
- Claude Code — [Best practices](https://code.claude.com/docs/en/best-practices) (`CLAUDE.md` 예, Stop hook JSON, deny 예, auto mode, `/batch`, `/rewind`, effort, 다섯 질문, 세 파일 파일럿)
- Claude Code — [`/goal`](https://code.claude.com/docs/en/goal), [`/code-review`](https://code.claude.com/docs/en/code-review-local), [permission modes](https://code.claude.com/docs/en/permission-modes) (plan mode), [auto memory](https://code.claude.com/docs/en/memory)
- Wharton / SSRN — Shaw & Nave, [Thinking—Fast, Slow, and Artificial](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6097646) (초록. N=1,372, 9,593시행, Study 1 +25/−15%p). 인터뷰: [SSRN Blog, 2026-07-13](https://blog.ssrn.com/2026/07/13/a-closer-look-thinking-fast-slow-and-artificial-how-ai-is-reshaping-human-reasoning-and-the-rise-of-cognitive-surrender-by/), [Wharton Magazine](https://magazine.wharton.upenn.edu/issues/fall-winter-2026/is-ai-hijacking-our-brains/)
- Andy Grove, *High Output Management* — pairing indicators(효과와 반대 효과를 같이 측정), Task-Relevant Maturity(과제 한정. 낮으면 구조적 지시, 높으면 목표 합의 뒤 개입 축소, 어느 쪽이든 서프라이즈가 없을 정도의 모니터링)
- 미 육군 — [ATP 4-90.5](https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN34147-ATP_4-90.5-000-WEB-1.pdf) para. 1-41, ADP 6-0의 commander's intent
- Netflix — [Culture](https://jobs.netflix.com/culture) "context not control" (2026-11-08 열람). 2024년 6월 PDF: [netflix-culture.pdf](https://jobs.netflix.com/netflix-culture.pdf)
- 가격 — [claude.com/pricing](https://claude.com/pricing), [Claude Code on Pro/Max/Ultra](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-max-or-ultra-plan), [openai.com/codex](https://openai.com/codex/), [ChatGPT Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers), [Codex with a ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan), [cursor.com/pricing](https://cursor.com/pricing), [GitHub Copilot plans](https://docs.github.com/en/copilot/get-started/plans)
- 생산성 — [METR, 2025-07-10](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) (16명, 246과제, +19% 시간; 저자들이 현행 수치 아님이라고 표시), [arXiv:2507.09089](https://arxiv.org/abs/2507.09089), [METR, 2026-02-24](https://metr.org/blog/2026-02-24-uplift-update/) (원자료 −18% / −4%, 선택 편향으로 해석을 보류)
