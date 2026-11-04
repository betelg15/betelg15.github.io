---
title: "말로 시키면 끝인가? n8n-mcp와 n8n 자체 MCP"
date: 2026-11-04
time: "22:22"
slug: n8n-mcp-claude-workflow-builder
tags: [n8n, MCP, Claude, 워크플로, 팩트체크]
summary: "n8n-mcp 2.101.0은 MIT MCP 서버입니다. 2026-11-04 GitHub 별은 23,199개이고, 같이 올라온 nodes.db는 노드 3,434개입니다. 인스턴스에 워크플로를 만드는 도구는 N8N_API_URL과 N8N_API_KEY가 있을 때 붙고, n8n 문서의 인스턴스 MCP와는 다른 서버입니다."
---

> 이 글은 북마크해 둔 [@dopamine_crypto의 포스트](https://x.com/dopamine_crypto/status/2117885810800554132)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117885810800554132](https://x.com/i/status/2117885810800554132)입니다. syndication 페이로드의 `created_at`은 2026-11-04T07:45:00.000Z, 2026-11-04 16:45 KST입니다. 화면 이름은 "도파민(Dopamine) l Nanotrading.xyz"입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117885810800554132)과 `cdn.syndication.twimg.com`의 같은 id 페이로드로 읽었습니다. 그 문장은 검증 대상입니다. 아래 대조는 2026-11-04에 읽은 [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) main `1c755c5c8d99eb71faade17753a7f24138f4212c`(2026-11-03 20:20:27Z)의 README·`docs/`·`src/`·`data/nodes.db`, npm `n8n-mcp@2.101.0`(2026-11-03 19:30:08Z), [n8n 문서](https://docs.n8n.io/), [n8n LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md), [MCP 명세 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/index.md)입니다. 이 글은 `npx n8n-mcp`를 실행하지 않았고, n8n 인스턴스에 워크플로를 만들지 않았습니다. GitHub 별 수는 같은 날 `GET /repos/czlonkowski/n8n-mcp`의 `stargazers_count`입니다.

## 왜 이 서버가 워크플로 작업에 닿는가

포스트의 첫 문장은 "n8n 자동화, 이제 클로드한테 말로 시키면 끝이야..?"입니다. 이어지는 문장은 n8n 워크플로를 클로드가 대신 짜 주는 도구가 있고, 깃허브 별이 2.3만 개이며, 이름은 n8n-mcp이고, 스킬보다 MCP라는 것입니다. 붙는 클라이언트로 클로드 데스크톱, 클로드 코드, 윈드서프, 커서를 적고, 마지막에는 n8n이 따로 돌아가야 하며 만든 흐름은 본인이 확인해야 한다고 적습니다.

그 저장소는 있습니다. GitHub 설명 문장은 "A MCP for Claude Desktop / Claude Code / Windsurf / Cursor to build n8n workflows for you"입니다. 2026-11-04 API의 별은 **23,199**, 포크는 3,681, 라이선스 SPDX는 MIT, 기본 브랜치는 `main`, 아카이브 상태는 아닙니다. npm `latest`는 **2.101.0**이고, 같은 태그 릴리스 시각은 2026-11-03 19:25:46Z입니다. 릴리스 노트는 n8n을 2.46.x로 올렸다고 적고, README 배지는 n8n **2.46.4**를 가리킵니다. 배지와 릴리스 노트의 대응은 그 문서에 있고, 이 글은 `node_modules` 안의 n8n 패키지 버전을 다시 풀지 않았습니다.

개발자에게 닿는 지점은 "말로 시키면 워크플로 JSON이 생긴다"의 경로입니다. n8n-mcp는 모델이 노드 스키마를 조회하고, 설정을 검증하고, API 키가 있을 때 n8n의 공개 REST API로 워크플로를 만듭니다. 모델을 대신하는 실행 엔진은 이 프로세스 안에 없습니다. [docs/SELF_HOSTING.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/SELF_HOSTING.md)는 Docker 이미지에 n8n 의존성이 없다고 적습니다. 이미지가 주장하는 "~280MB", "일반 n8n 이미지보다 82% 작다"는 그 문서의 문장이고, 이 글은 이미지를 pull해 크기를 재지 않았습니다.

## MCP가 이 서버에서 하는 일

[MCP 명세 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/index.md)에서 서버가 모델에 넘기는 기능은 tools, resources, prompts입니다. [tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md)는 모델이 고르고 호출하는 함수입니다. 명세는 도구 호출을 거절할 수 있는 사람이 루프 안에 있어야 한다고 적고, 호스트가 어떤 도구가 모델에 보이는지, 언제 호출되는지를 보여 주기를 권합니다. 프로토콜이 호스트의 확인 창을 대신 만들어 주지는 않습니다.

[stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio.md)에서는 클라이언트가 서버를 자식 프로세스로 띄웁니다. 서버는 `stdin`에서 줄 단위 JSON-RPC를 읽고, `stdout`에는 MCP 메시지만 씁니다. 로그는 `stderr`입니다. n8n-mcp의 Claude Desktop 설정이 `MCP_MODE=stdio`를 필수로 적는 이유가 이 규칙입니다. [SELF_HOSTING.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/SELF_HOSTING.md)는 이 변수가 없으면 디버그 로그가 stdout에 섞여 `"Unexpected token..."` 같은 JSON 파싱 오류가 난다고 적습니다. `src/mcp/server.ts`는 `MCP_MODE`가 설정돼 있고 그 값이 `http`가 아니면 stdout 가드를 설치합니다.

로컬 `npx`/`docker run -i` 경로는 이 stdio입니다. 원격으로 띄울 때는 명세의 다른 표준 전송인 Streamable HTTP가 있고, 저장소는 [docs/HTTP_DEPLOYMENT.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/HTTP_DEPLOYMENT.md)와 Railway 버튼을 따로 둡니다. 이 글은 HTTP 배포를 띄워 보지 않았습니다.

n8n에 대한 호출은 MCP 전송과 별개입니다. `src/config/n8n-api.ts`의 `getN8nApiConfig()`는 `N8N_API_URL`과 `N8N_API_KEY`가 둘 다 있을 때만 설정을 반환합니다. 하나라도 없으면 관리 도구는 붙지 않습니다. `src/services/n8n-api-client.ts`는 그 URL의 해시를 지우고, 끝에 `/api/v1`이 없으면 붙인 뒤, 헤더 `X-N8N-API-KEY`로 [n8n 공개 REST API](https://docs.n8n.io/api/authentication.md)를 호출합니다. 타임아웃 기본값은 30,000ms, 재시도 기본값은 3입니다. 인증된 클라이언트는 `maxRedirects: 0`입니다. `N8N_CF_CLIENT_ID`와 `N8N_CF_CLIENT_SECRET`이 있으면 Cloudflare Access 헤더로 나갑니다. README는 이 토큰이 `N8N_API_URL` 오리진에만 붙고, 웹훅 호스트가 다르면 그 호출에는 나가지 않는다고 적습니다.

인스턴스 MCP는 또 다른 비밀입니다. `deriveOfficialMcpEndpoint()`는 `N8N_API_URL`의 오리진에 `/mcp-server/http`를 붙입니다. 토큰 환경 변수는 `N8N_MCP_ACCESS_TOKEN`이고, `N8N_API_KEY`와 다른 값입니다. README는 n8n이 MCP를 다른 호스트(`N8N_MCP_BASE_URL`)에서 서빙하는 구성은 지원하지 않는다고 적습니다.

## 도구 면

`src/mcp/tools.ts`의 `n8nDocumentationToolsFinal`은 7개입니다. API 키 없이 이 목록이 서버가 등록하는 도구입니다. `server.ts`는 API가 설정되면 여기에 `n8nManagementTools` 21개를 더해 시작 로그의 개수로 씁니다. 7+21=28입니다. [Claude Code 설정 문서](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/CLAUDE_CODE_SETUP.md)의 스크린샷 설명은 "39 tools"라고 적습니다. 이 커밋의 두 배열에서 39개의 `name`은 세지지 않습니다.

문서 도구 7개:

| 도구 | 이 커밋의 스키마가 받는 것 |
|---|---|
| `tools_documentation` | 도구 사용 설명. README는 여기서 시작하라고 적음 |
| `search_nodes` | 노드 전문 검색. `source`로 community/verified, `includeExamples` |
| `get_node` | `detail` minimal/standard/full, `mode` docs·search_properties·versions/compare/breaking/migrations |
| `validate_node` | `mode` minimal 또는 full. full의 `profile`은 minimal, runtime, ai-friendly, strict. 스키마 기본 profile은 `ai-friendly` |
| `search_templates` | keyword, by_nodes, by_task, by_metadata, patterns |
| `get_template` | `mode` nodes_only, structure, full |
| `validate_workflow` | 연결, 표현식, AI Agent를 포함한 워크플로 JSON 검증 |

관리 도구 21개는 `N8N_API_URL`과 `N8N_API_KEY`가 있을 때 목록에 들어옵니다. `src/mcp/tools-n8n-manager.ts`의 이름입니다.

- 워크플로: `n8n_create_workflow`, `n8n_get_workflow`, `n8n_update_full_workflow`, `n8n_update_partial_workflow`, `n8n_delete_workflow`, `n8n_list_workflows`, `n8n_validate_workflow`, `n8n_autofix_workflow`, `n8n_workflow_versions`, `n8n_deploy_template`
- 실행: `n8n_test_workflow`, `n8n_executions`, `n8n_evaluations`
- 그 밖: `n8n_manage_folders`, `n8n_manage_datatable`, `n8n_manage_credentials`, `n8n_audit_instance`, `n8n_manage_agents`, `n8n_explore_node_resources`, `n8n_list_catalog`, `n8n_health_check`

README가 `N8N_MCP_ACCESS_TOKEN`을 요구한다고 적은 호출은 따로 있습니다. `n8n_manage_agents`, `n8n_explore_node_resources`(슬랙 채널이나 시트 탭처럼 자격 증명으로만 알 수 있는 값), `n8n_list_catalog`의 팀 프로젝트 폴백, `n8n_workflow_versions`의 `source: 'native'`, 트리거 URL이 없는 워크플로를 n8n MCP로 돌리는 `n8n_test_workflow`의 `prepare`/`pinned`/`direct`, 데이터 테이블 열 변경입니다. 공개 REST만으로는 그 호출이 끝나지 않습니다.

검증은 네 겹으로 README가 적습니다. `validate_node` minimal은 필수 필드, full은 profile에 따른 오류·경고·제안, `validate_workflow`는 조립된 JSON, `n8n_validate_workflow`는 이미 인스턴스에 있는 id입니다. README의 예시에서는 `resource`/`operation`/`text`만 있는 슬랙 설정이 런타임에 실패하고, `select`와 `channelId`까지 적어야 한다고 합니다. 기본값을 비워 둔 채 넘어가는 것이 실패의 주된 자리라고 같은 절이 적습니다. 이 검증은 스키마와 정적 규칙입니다. 자격 증명이 살아 있는지, 메일이 실제로 오는지까지 증명한다고 저장소는 적지 않습니다.

## 같이 올라온 노드 DB

`data/nodes.db`는 그 커밋에서 79,400,960바이트입니다. 이 글은 그 파일을 받아 `nodes`와 `templates`를 세었습니다. README의 비율은 분모를 문장으로 적지 않아서, 아래는 테이블 정의 그대로의 수입니다.

| 항목 | README | 이 커밋의 DB |
|---|---|---|
| 노드 합계 | 3,434 | 3,434 |
| 코어 / 커뮤니티 | 842 / 2,592 | `is_community=0` 842, `=1` 2,592 |
| 검증된 커뮤니티 | 2,164 | `is_community=1 AND is_verified=1` 2,164 |
| 코어 패키지 | 적지 않음 | `n8n-nodes-base` 708, `@n8n/n8n-nodes-langchain` 134. 합은 842 |
| 속성 스키마 | 99% | 코어 842개 중 gzip 스키마가 비어 있지 않은 리스트로 풀리는 행 840개, 99.76%. 노드 전체 3,434개 기준은 2,381개, 69.34% |
| 오퍼레이션 | 66.5% | 코어에서 `operations` JSON 배열이 비어 있지 않은 행 557/842 = 66.15%. 전체 기준 2,085/3,434 = 60.72% |
| 문서 텍스트 | 공식 문서 기준 86% | `documentation`이 비어 있지 않은 행은 713개이고 전부 코어입니다. 713/842 = 84.68% |
| AI 도구 변형 | 267개, 문서가 갖춰져 있음 | `is_tool_variant=1` 270. 270개 모두 `is_ai_tool=1`. 그중 `documentation`이 있는 행은 247 |
| 템플릿 | 2,352, AI 메타데이터 99.96% | 2,352행. `metadata_json`이 있는 행 2,351. 2351/2352 = 99.957% |
| 랭크된 설정 | 156 | `template_node_configs`에서 `rank>0` 156행. `rank<=5` 뷰는 134행 |

99%와 66.5%와 86%는 코어 842개를 분모로 두면 같은 자릿수입니다. 3,434 전체를 분모로 두면 속성 69%, 문서 21%입니다. README는 "3,434 n8n nodes" 바로 다음에 그 퍼센트를 적고 분모를 다시 쓰지 않습니다. 267과 270, 86%와 84.68%, 66.5%와 66.15%는 같은 커밋 안에서도 숫자가 같지 않습니다. `is_ai_tool=1`인 행은 전체 2,033, 코어 540이라 "도구 변형 267개"와 같은 열이 아닙니다.

n8n 저장소 설명은 "400+ integrations"입니다. 2026-11-04 API 별은 209,535입니다. 400+와 3,434는 세는 단위가 다릅니다. 3,434에는 커뮤니티 노드, LangChain 노드, 도구 변형 행이 들어 있습니다.

## 설정 조각

문서 도구만 쓰는 Claude Desktop 설정은 SELF_HOSTING.md의 JSON입니다. macOS 파일은 `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows는 `%APPDATA%\Claude\claude_desktop_config.json`, Linux는 `~/.config/Claude/claude_desktop_config.json`이라고 그 문서가 적습니다.

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true"
      }
    }
  }
}
```

인스턴스에 만들려면 같은 문서가 두 값을 더합니다. 아래 키는 자리표시자입니다.

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

Claude Code는 [CLAUDE_CODE_SETUP.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/CLAUDE_CODE_SETUP.md)가 이렇게 적습니다.

```bash
claude mcp add n8n-mcp \
  -e MCP_MODE=stdio \
  -e LOG_LEVEL=error \
  -e DISABLE_CONSOLE_OUTPUT=true \
  -e N8N_API_URL=https://your-n8n-instance.com \
  -e N8N_API_KEY=your-api-key \
  -- npx n8n-mcp
```

같은 문서는 기본 범위가 `--scope local`이라 키가 사용자 설정에 남고, `--scope project`는 `.mcp.json`에 남는다고 적습니다. 팀을 저장소에 키와 함께 넣으라는 뜻으로 읽히면 그 문장과 어긋납니다. Cursor와 Windsurf는 README가 [CURSOR_SETUP.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/CURSOR_SETUP.md), [WINDSURF_SETUP.md](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/WINDSURF_SETUP.md)를 가리킵니다. 이 글은 그 클라이언트를 실행하지 않았습니다. "적혀 있다"와 "이 환경에서 붙었다"는 다른 문장입니다.

npx를 Claude Desktop과 Claude Code가 동시에 띄우면 npm 캐시 잠금이 겹칠 수 있다고 SELF_HOSTING.md가 적고, 클라이언트마다 다른 `npm_config_cache`를 주라고 합니다. 같은 기계의 n8n이 `localhost`이면 Docker 쪽 URL은 `http://host.docker.internal:5678`이고, `WEBHOOK_SECURITY_MODE=moderate`를 같이 줘야 루프백을 SSRF 게이트가 막지 않는다고 같은 문서가 적습니다. 기본값 `strict`는 루프백을 거절합니다.

호스팅 선택지는 README 기준 다섯입니다. `npx n8n-mcp`, `ghcr.io/czlonkowski/n8n-mcp`, 클론 후 `npm run build`, Railway 버튼, [dashboard.n8n-mcp.com](https://dashboard.n8n-mcp.com). 대시보드의 "Free tier: 100 tool calls/day"는 README의 문장입니다. 계정을 만들어 호출 한도를 확인하지는 않았습니다.

## 한 문장에서 워크플로 JSON까지

아래는 README "Workflow Process"가 적는 순서입니다. 실행 로그가 아닙니다. 사용자의 문장 예는 포스트가 든 "메일 오면 시트에 정리하고 메신저로 알림"을 개발 인스턴스에 한정한 것입니다.

```text
사용자: 문의 메일이 오면 시트에 한 줄 추가하고 슬랙으로 알려 줘.
        프로덕션 워크플로는 수정하지 마. 초안만 개발 인스턴스에 둬.

1. tools_documentation
2. search_templates  (keyword 또는 by_task, by_nodes)
3. search_nodes      gmail / googleSheets / slack, includeExamples true
4. get_node          detail standard. 필요한 속성만이면 mode search_properties
5. validate_node     mode minimal, 이어서 mode full, profile runtime
6. 사용자에게 노드 구성 승인
7. validate_workflow 조립한 JSON
8. API 키가 있을 때만 n8n_create_workflow
9. n8n_validate_workflow  { id }
```

8번이 없으면 모델은 문서와 검증 결과만 가지고 있고, n8n 캔버스에는 아무것도 생기지 않습니다. 8번이 있으면 생성은 공개 API의 워크플로 생성입니다. 자격 증명 이름은 인스턴스에 이미 있는 값이어야 하고, 없는 채널 id를 모델이 지어 넣을 수 있습니다. 그걸 기존 리소스에서 찾으려면 `n8n_explore_node_resources`와 `N8N_MCP_ACCESS_TOKEN`이 README의 경로입니다.

만든 뒤의 확인은 포스트 마지막 문장과 README가 같이 가리키는 자리입니다. README의 안전 경고는 프로덕션 워크플로를 AI로 직접 고치지 말 것, 복사본을 만들 것, 개발 환경에서 시험할 것, 내보내 백업할 것, 배포 전에 검증할 것입니다. "AI results can be unpredictable"이 그 절의 문장입니다. `n8n_test_workflow`가 있어도 그 호출의 통과가 운영 승인인지는 저장소가 보장하지 않습니다.

읽기 전용으로 좁히려면 README가 `DISABLED_TOOLS`에서 생성·전체 갱신·부분 갱신·삭제·자동 수정·템플릿 배포·테스트·자격 증명·데이터 테이블 도구를 빼라고 적습니다. `DISABLED_TOOL_OPERATIONS`는 한 도구 안의 쓰기 연산만 막는 두 번째 스위치입니다. 여기에 "read-only n8n API key"를 겹치라고 README가 적습니다. [n8n 인증 문서](https://docs.n8n.io/api/authentication.md)에서 스코프를 고르는 절차는 Enterprise이고, Enterprise가 아닌 키는 계정의 리소스와 기능 전체에 접근한다고 적습니다. 커뮤니티 에디션에 읽기 전용 키가 있다는 문장은 그 페이지에 없습니다. 키를 만든 뒤 Settings → n8n API에서 지울 수 있다는 절차는 있습니다. 무료 체험 중에는 공개 API 자체가 없다고 같은 페이지가 적습니다.

## n8n이 이미 갖고 있는 MCP

n8n 문서 첫 화면은 "n8n is a fair-code licensed workflow automation tool that combines AI features with business process automation"입니다. [인스턴스 MCP](https://docs.n8n.io/connect/connect-to-n8n-mcp-server.md)는 클라이언트가 워크플로를 검색하고, MCP에 연 워크플로와 상호 작용하고, 실행·시험하고, 워크플로와 데이터 테이블을 만들고 고친다고 적습니다. 만들고 고치는 쪽은 n8n 2.13.0부터라고 같은 페이지가 적습니다. 서버 URL은 Settings → Instance-level MCP에서 복사하고 끝이 `/mcp-server/http`입니다. 인증은 OAuth 또는 API 키입니다. 문서가 연결 예로 적는 클라이언트에는 Claude Desktop, Claude Code, Cursor, Windsurf가 들어 있습니다.

노출은 인스턴스에서 MCP를 켠 다음 워크플로마다 "Available in MCP"를 켜는 방식입니다. `search_workflows`만 권한이 있는 워크플로의 미리보기를 반환하고, 본문 조회·실행·수정은 그 스위치를 켠 워크플로로 한정된다고 문서가 적습니다. `execute_workflow`의 기본은 게시된 버전입니다.

워크플로 한 개의 도구만 밖으로 내는 노드는 [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger.md)입니다. 전송은 SSE와 streamable HTTP이고 stdio는 없다고 그 페이지가 적습니다. 반대 방향인 MCP Client Tool은 워크플로가 바깥 MCP 서버를 호출합니다. 용어집의 한 줄이 이 둘과 인스턴스 MCP를 같이 적습니다.

n8n은 코딩 에이전트용 스킬도 따로 둡니다. 인스턴스 MCP 문서의 "n8n Skills"는 [n8n-io/skills](https://github.com/n8n-io/skills)를 가리키고, 13개 능력 스킬과 라우팅용 메타 스킬을 적습니다. czlonkowski의 [n8n-skills](https://github.com/czlonkowski/n8n-skills)는 n8n-mcp README가 선택 사항으로 가리키는 다른 저장소이고, Claude Code 설정 문서는 그 안에 7개 스킬이 있다고 적습니다. n8n-mcp 저장소 자체는 MCP 서버입니다. 스킬은 그 서버가 등록하는 `tools/list` 항목이 아닙니다.

## 비즈니스 인사이트

숫자와 회사 서술은 각 문장 옆의 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다.

같은 범주의 호스티드 자동화로 Zapier와 Make의 도움말이 자신을 설명하는 문장은 이렇습니다. Zapier 도움말(Updated November 02, 2026)은 "Zapier is the infrastructure for AI-powered automation"이라고 적고, 앱 라이브러리를 **9,000+**로 적습니다. Zap은 트리거와 하나 이상의 액션입니다. [What is Zapier?](https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier) [What is a Zap?](https://help.zapier.com/hc/en-us/articles/8496309697421-What-is-a-Zap) Make 도움말은 Make를 앱과 서비스를 연결해 워크플로를 자동화하는 플랫폼이라고 적고, 시나리오와 모듈이라는 말을 씁니다. [What is Make?](https://help.make.com/what-is-make) n8n 저장소 설명의 통합 수는 **400+**이고, 배포는 self-host 또는 cloud입니다. 9,000+와 400+와 n8n-mcp DB의 3,434는 카탈로그 정의가 달라서 이 글은 순위를 만들지 않습니다. Zapier 비교 페이지의 Make 가격·고객 수, n8n.io/pricing의 월 요금은 이 글이 인용하지 않습니다. 요금이 필요하면 n8n 문서가 가리키는 [pricing](https://n8n.io/pricing/)을 그 시점의 페이지로 보면 됩니다.

n8n 쪽 AI 기능은 문서에 이미 있습니다. [Integrate AI](https://docs.n8n.io/build/integrate-ai)는 OpenAI, Anthropic, Google 같은 LLM과 도구·메모리를 워크플로에 넣는 절입니다. [Use n8n MCP server](https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server.md)는 자연어로 워크플로를 설명하면 그 인스턴스 MCP가 만들고 실행하는 경로를 적습니다. n8n-mcp가 더하는 층은 인스턴스 없이도 열리는 노드 스키마 DB, 템플릿 2,352개 검색, `validate_node` profile, 공개 REST로의 관리 도구입니다. 인스턴스 MCP의 리소스 조회와 에이전트는 `N8N_MCP_ACCESS_TOKEN`이 있을 때 n8n-mcp가 그 서버의 클라이언트가 되는 경로입니다.

라이선스는 비용을 가릅니다. n8n-mcp의 [LICENSE](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/LICENSE)는 MIT이고 저작권 줄은 "Copyright (c) 2024 Romuald Czlonkowski"입니다. n8n의 [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)는 Sustainable Use License 1.0입니다. 사용은 자신의 내부 업무, 비상업, 개인 용도이고, 배포는 비상업 목적의 무상일 때라는 제한이 Limitations에 있습니다. `.ee.` 파일은 Enterprise 라이선스라고 같은 파일이 적습니다. GitHub API의 n8n `license.spdx_id`는 `NOASSERTION`입니다. 문서 첫 화면의 단어는 fair-code입니다.

[License FAQ](https://docs.n8n.io/n8n-community-license/community-license/license-faq.md)는 커뮤니티 라이선스의 공식 이름이 Sustainable Use License이고, 셀프호스트에 적용되며 n8n Cloud는 유료 구독이라고 적습니다. 허용 예는 사업 운영, 개인 학습, 클라이언트가 워크플로를 만들거나 고치지 못하는 조건에서의 대행 구축, 구축·교육·컨설팅 요금입니다. 금지 예는 n8n을 호스팅해 클라이언트가 워크플로를 만들게 하는 것, 외부 최종 사용자가 맞춤 UI·API·MCP·사용자를 대신하는 AI 에이전트로 워크플로를 만들거나 설정하게 하는 것, 코드를 포크해 자동화 제품을 내는 것, 브랜드를 지우고 되파는 것입니다. FAQ는 판단 기준을 "누가 워크플로 로직을 정하는가"로 적고, 인터페이스가 UI인지 API인지 MCP인지 에이전트인지는 그 기준을 바꾸지 않는다고 적습니다.

공개 API는 [인증 문서](https://docs.n8n.io/api/authentication.md)가 무료 체험 중에 쓸 수 없다고 적습니다. 키를 만들 때 스코프를 고르는 단계는 Enterprise입니다.

**분석/의견.** 이득이 가는 자리는 이미 n8n을 자기 인프라에서 돌리고, Claude Desktop·Claude Code·Cursor·Windsurf 중 하나에 노드 문서를 붙여 초안을 만든 뒤, 사람이 개발 인스턴스에서 실행을 보는 팀입니다. 컨설턴트가 자기 인스턴스에서 만들어 결과만 고객에게 넘기는 형태는 FAQ의 허용 예와 맞닿아 있습니다. 고객의 에이전트가 운영자의 n8n에 워크플로를 쓰게 하는 제품은 FAQ의 금지 예에 문장이 있습니다. 그 제품의 경로가 n8n-mcp이든 n8n 인스턴스 MCP이든, FAQ가 적은 기준은 인터페이스가 아닙니다.

손해가 읽히는 자리는 별도입니다. Zapier·Make 도움말은 각자 호스티드 자동화와 AI 기능을 이미 적습니다. n8n-mcp 별 23,199가 그 카탈로그의 사용자를 옮긴다는 수는 이 글의 출처에 없습니다. 포스트가 "강의까지 팔리는 이유"라고 적은 시장도 1차 수치를 확인하지 못했습니다. 개발자 작업이 바뀌는 지점은 캔버스에서 노드를 끄는 시간이 아니라, 도구 호출이 프로덕션 id를 만졌는지, 표현식과 자격 증명과 빈 기본값을 사람이 봤는지입니다. 별 개수는 그 확인을 대신하지 않습니다. 이 문단은 의견입니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·출처가 의견 / ❌ 사실 아님

원문: [fxtwitter의 `tweet.text`](https://api.fxtwitter.com/status/2117885810800554132). 2026-11-04에 읽은 전문입니다.

### @dopamine_crypto 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| n8n 자동화를 클로드에게 말로 시키면 끝이다 | ⚠️ | 첫 문장의 단정입니다. 같은 글 마지막은 n8n이 따로 돌아야 하고 결과를 본인이 확인해야 한다고 적습니다. README도 프로덕션 직접 수정 금지와 검증을 적습니다. API 키가 없으면 `n8n_create_workflow`는 서버 시작 시 도구 수에 포함되지 않습니다 (`server.ts`의 `isN8nApiConfigured`). |
| n8n 워크플로를 클로드가 대신 짜 주는 도구가 있다 | ⚠️ | 저장소 설명과 README는 AI가 n8n-mcp 도구로 워크플로를 설계·검증·생성한다고 적습니다. 생성 도구는 공개 API 설정이 있을 때 등록됩니다. 모델이 도구를 호출하는 구조이고, MCP 프로세스가 워크플로 엔진은 아닙니다. 클라이언트는 Claude만으로 적혀 있지 않습니다. |
| 깃허브 별 2.3만 개 | ✅ | 2026-11-04 `GET /repos/czlonkowski/n8n-mcp`의 `stargazers_count`는 23,199입니다. 2.3만은 그 수의 반올림입니다. 시각이 지나면 별 수는 달라질 수 있습니다. |
| 이름은 n8n-mcp | ✅ | 저장소 `czlonkowski/n8n-mcp`, npm 패키지 `n8n-mcp`, 릴리스 `v2.101.0`. |
| 엄밀히는 스킬보다 MCP이고, 하는 일로 보면 같이 묶어도 된다 | ⚠️ | 이 저장소가 등록하는 것은 MCP tools입니다. "같이 묶어도 된다"는 작성자 의견입니다. 스킬은 별도 산출물입니다. README가 가리키는 [n8n-skills](https://github.com/czlonkowski/n8n-skills)와, n8n 문서가 가리키는 [n8n-io/skills](https://github.com/n8n-io/skills)가 그 자리입니다. |
| n8n은 메일이 오면 시트에 정리하고 메신저로 알리는 일을 블록으로 이어 자동 실행하는 툴이다 | ⚠️ | 그 문장은 예시로 맞습니다. n8n 문서의 정의 문장은 "fair-code licensed workflow automation tool that combines AI features with business process automation"입니다. 저장소 설명은 시각적 빌드와 코드, 셀프호스트 또는 클라우드, 400+ 통합, 네이티브 AI입니다. |
| 오픈소스라 회사에서도, 부업러들도 많이 쓴다 | ❌ | 문서 첫 화면의 라이선스 단어는 fair-code이고, [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)는 Sustainable Use License입니다. GitHub `license.spdx_id`는 `NOASSERTION`입니다. "회사와 부업에서 많이 쓴다"의 규모는 이 글이 연 1차 자료에 없습니다. n8n 별 209,535(같은 날 API)는 저장소 인기이고 사용처 분포가 아닙니다. n8n-mcp의 MIT는 n8n의 라이선스가 아닙니다. |
| 블록 종류와 설정 칸이 많아 처음 켜면 막막하고, 그래서 강의가 팔린다 | ⚠️ | 노드가 많다는 점은 DB의 3,434행과 맞습니다. "막막하다"와 "강의가 팔린다"는 시장 관찰이고, 판매 수치의 1차 출처는 확인하지 못했습니다. |
| 원하는 흐름을 말하면 클로드가 n8n 워크플로를 짜 준다 | ⚠️ | README의 생성 경로는 도구 호출 다음 `n8n_create_workflow`입니다. 키가 없으면 그 도구는 빠집니다. n8n 자신의 [인스턴스 MCP 문서](https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server.md)도 자연어로 워크플로를 만들 수 있다고 적습니다. 그 경로는 n8n-mcp 저장소가 아닙니다. |
| 클로드 데스크톱, 클로드 코드, 윈드서프, 커서에서 된다고 적혀 있다 | ✅ | 저장소 설명, README의 IDE 절, SELF_HOSTING.md, CLAUDE_CODE_SETUP.md, CURSOR_SETUP.md, WINDSURF_SETUP.md에 그 이름이 있습니다. 포스트는 "적혀 있음"이라고 했고, 그 문장은 문서와 맞습니다. 이 글은 네 클라이언트를 실행하지 않았습니다. README는 VS Code, Codex, Antigravity도 적습니다. |
| 매주 보고 숫자, 문의 메일 분류, 주문 알림, 글의 시트 기록에 쓸 수 있다 | ⚠️ | 작성자가 든 사용 예입니다. 그 네 가지가 저장소의 내장 워크플로라는 문장은 README에 없습니다. 템플릿 검색으로 비슷한 노드 조합을 찾을 수 있는 구조는 `search_templates`에 있습니다. |
| 별 2.3만이면 자동화 쪽에서 이미 꽤 검증된 편이다 | ⚠️ | 글이 "라고 봄"이라고 적은 의견입니다. 23,199는 인기 지표입니다. 워크플로가 운영에서 맞는지는 README가 사용자 확인으로 남겨 둡니다. |
| 클로드가 짜 줘도 n8n은 따로 돌아야 하고, 흐름이 되는지는 본인이 확인해야 한다 | ✅ | SELF_HOSTING.md는 이미지에 n8n이 들어 있지 않다고 적습니다. 관리 도구는 별도 인스턴스의 API를 호출합니다. README 안전 절은 백업, 개발 환경, 배포 전 검증을 적습니다. |

**총평:** n8n-mcp는 2026-11-04 기준 별 23,199의 MIT MCP 서버이고, Claude Desktop·Claude Code·Windsurf·Cursor용 설정 문서가 있으며, 워크플로 실행은 따로 도는 n8n이 맡습니다. 느슨한 곳은 첫 문장의 "끝", n8n을 오픈소스라고 부른 점, 그리고 스킬·공식 인스턴스 MCP를 이 저장소와 한 덩어리로 읽는 부분입니다. README의 99%·66.5%·86%·267은 같은 커밋의 `nodes.db`와 자릿수는 가깝고 분모와 정수까지 같지는 않습니다.

## 참고 자료

- 원본 X 포스트: [@dopamine_crypto](https://x.com/dopamine_crypto/status/2117885810800554132) · [상태 주소](https://x.com/i/status/2117885810800554132) · 이 글이 본문을 읽은 미러 [api.fxtwitter.com/status/2117885810800554132](https://api.fxtwitter.com/status/2117885810800554132). `created_at` 2026-11-04T07:45:00.000Z
- n8n-mcp main `1c755c5c8d99eb71faade17753a7f24138f4212c` — [저장소](https://github.com/czlonkowski/n8n-mcp) · [README](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/README.md) · [LICENSE](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/LICENSE) · [SELF_HOSTING](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/SELF_HOSTING.md) · [Claude Code](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/CLAUDE_CODE_SETUP.md) · [공식 MCP 연결](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/docs/OFFICIAL_MCP_SETUP.md) · [nodes.db](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/data/nodes.db)
- 릴리스 [v2.101.0](https://github.com/czlonkowski/n8n-mcp/releases/tag/v2.101.0) (2026-11-03) · npm [n8n-mcp](https://www.npmjs.com/package/n8n-mcp)
- 도구 구현 — [`src/mcp/tools.ts`](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/src/mcp/tools.ts) · [`src/mcp/tools-n8n-manager.ts`](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/src/mcp/tools-n8n-manager.ts) · [`src/config/n8n-api.ts`](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/src/config/n8n-api.ts) · [`src/services/n8n-api-client.ts`](https://github.com/czlonkowski/n8n-mcp/blob/1c755c5c8d99eb71faade17753a7f24138f4212c/src/services/n8n-api-client.ts)
- n8n — [문서 첫 화면](https://docs.n8n.io/) · [License FAQ](https://docs.n8n.io/n8n-community-license/community-license/license-faq.md) · [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) · [공개 API 인증](https://docs.n8n.io/api/authentication.md) · [인스턴스 MCP](https://docs.n8n.io/connect/connect-to-n8n-mcp-server.md) · [MCP로 워크플로 만들기](https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server.md) · [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger.md) · [Integrate AI](https://docs.n8n.io/build/integrate-ai) · [n8n-io/n8n](https://github.com/n8n-io/n8n)
- MCP — [명세 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/index.md) · [stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio.md) · [tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md) · [아키텍처 개요](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture.md)
- 같은 범주 도움말 — [What is Zapier?](https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier) · [What is a Zap?](https://help.zapier.com/hc/en-us/articles/8496309697421-What-is-a-Zap) · [What is Make?](https://help.make.com/what-is-make)
