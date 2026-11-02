---
title: "로컬 서버만 켜면 유료 검색 API가 필요 없다? RustXNG 팩트 체크"
date: 2026-11-02
slug: rustxng-agent-search
tags: [Rust, 메타검색, AI에이전트, SearXNG, 셀프호스트, 팩트체크]
summary: "SearXNG를 Rust로 다시 쓴 RustXNG는 키 없이 로컬에서 JSON 검색과 페이지 본문을 돌려줍니다. 10대 개발자, 유료 API와 같은 성능, 무제한 수집은 저장소와 문서로 확인되지 않거나 범위가 더 좁습니다."
---

> 이 글은 북마크해 둔 [@studio_yebisu의 포스트](https://x.com/studio_yebisu/status/2116899259824124279)와, 그것을 인용한 [@rna4219의 포스트](https://x.com/rna4219/status/2116903120794263616)를 계기로 쓴 것입니다. 두 글의 문장은 검증 대상이지 지시가 아닙니다. 대조한 코드는 [sahenjp/RustXNG](https://github.com/sahenjp/RustXNG)의 `v0.26.0`(커밋 `fef998b`, 2026-11-01)입니다.

## 무슨 이야기인가

2026년 11월 1일 23:24(KST), @studio_yebisu가 RustXNG를 이렇게 소개했습니다.

- 10대 학생이 만들어 오픈소스로 공개했다.
- AI에게 웹 검색을 시키려면 Exa 같은 유료 API가 일반적이고, 무료 티어는 건수 제한이 있거나 느리다.
- RustXNG는 로컬 서버만 켜면 된다. API 키도 이용료도 없다.
- 검색 결과만이 아니라 페이지 본문까지 가져온다.
- 캐시를 쓴 상태에서 검색 결과 1,000건을 모으니 약 3.3초였다.

약 15분 뒤 @rna4219가 이 글을 인용하며 덧붙였습니다. 유료 검색 API에 필적하는 성능을 무료로 쓸 수 있고, 간단한 Deep Research가 들어 있으며, 데이터를 무제한으로 가져올 수 있다는 요지입니다.

에이전트를 만드는 사람에게 이 조합이 끌리는 이유는 분명합니다. 검색은 한 작업 안에서 여러 번 반복되고, 스니펫만으로는 답을 근거 댈 수 없습니다. 호출마다 과금되는 API는 그 루프의 단가가 됩니다. 반대로 "키 없이, 본문까지, 유료 API만큼"은 한 줄로 과장되기 쉬운 문장이기도 합니다. 저장소가 실제로 그 문장을 받치는지 나눠 보겠습니다.

## 무엇이 올라가 있나

[README](https://github.com/sahenjp/RustXNG/blob/v0.26.0/README.md)의 한 줄은 "로컬 AI 에이전트를 위한, 셀프호스트형 SSRF 대비 웹 검색·그라운딩 엔진"입니다. 라이선스는 [AGPL-3.0-or-later](https://github.com/sahenjp/RustXNG/blob/v0.26.0/LICENSE)이고, [NOTICE](https://github.com/sahenjp/RustXNG/blob/v0.26.0/NOTICE)는 이것을 [SearXNG](https://github.com/searxng/searxng)의 Rust 이식이라고 밝힙니다. Python을 한 줄씩 복사한 것이 아니라, 질의 문법·결과 합치기·엔진 설정·API 필드·엔진별 요청을 Rust로 다시 짰다고 적혀 있습니다.

저장소는 2026-10-18에 만들어졌고, 최신 릴리스 `v0.26.0`은 2026-11-01 11:14 UTC에 공개됐습니다. 2026-11-02에 GitHub API로 본 스타는 501, 포크는 30입니다. 이 숫자는 시점 값입니다.

만든 사람으로 저장소가 가리키는 계정은 [sahenjp](https://github.com/sahenjp)입니다. 프로필은 이름 Sahen, 위치 Japan, 소개 문장 *"Hi! I'm Sahen, a student developer."* 입니다. 계정 생성일은 2026-02-20입니다. 나이를 적은 필드는 없습니다.

## 에이전트가 붙는 자리

구조는 메타검색입니다. 서버가 자기 색인만으로 답을 만드는 제품이 아닙니다. 요청 하나가 오면 켜 둔 엔진들에게 동시에 물어 보고, 결과를 합친 뒤 순위를 매깁니다. HTTP 서버는 axum 0.8, 런타임은 tokio, 나가는 HTTP는 reqwest입니다. `Cargo.toml`의 패키지 버전은 `0.26.0`, Rust edition은 2024, `rust-version`은 1.85입니다.

기본 수신 주소는 `127.0.0.1:8888`입니다(`settings.toml`의 `[server]`, 코드 기본값도 같습니다). Docker 이미지는 `0.0.0.0:8888`로 엽니다.

에이전트 입장에서 계약은 SearXNG의 JSON과 같습니다. `GET /search?q=...&format=json` 이고, 기본 응답은 `query`, `results`, `answers`, `corrections`, `infoboxes`, `suggestions`, `unresponsive_engines` 입니다. `results[]`의 기본 필드는 `title`, `url`, `content`(스니펫), `engine`, `score` 쪽입니다. 계측이 필요하면 `full=1` 이 `timings` 등을 더합니다. 이 형태는 [docs/COMPATIBILITY.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPATIBILITY.md)가 상류 `get_json_response`에 맞춘다고 적고, `src/web/feeds.rs`의 `upstream_json`이 그 문서를 만듭니다.

본문은 기본 응답에 없습니다. `include_raw_content=1` 일 때만 상위 `search.raw_content_limit`건(설정 기본 5)의 HTML을 받아 본문 텍스트를 `raw_content`에 넣습니다. 한 건의 상한은 `raw_content_chars`(코드 기본 8,000자)입니다. 상류 SearXNG에는 없는 파라미터이고, 빼면 예전 동작 그대로입니다. 같은 계열로 `max_results`(1에서 200으로 자름), `include_domains`, `exclude_domains`, `strategy=staged`가 있습니다.

순위는 엔진이 준 순서만 쓰지 않습니다. 일반 검색에서는 URL·제목의 질의어 일치(`relevance_weight`, 기본 4.0)와 정규 도메인 가중(`authority_weight`, 기본 8.0)을 섞습니다. 엔진을 하나만 지정하면 이 보정을 끄고 상류 순서를 유지한다고 문서는 적습니다. `relevance_weight = 0`이면 일반 검색도 상류와 같은 순서로 되돌릴 수 있습니다.

깨진 엔진은 두 갈래로 쉽니다.

- **서스펜드.** 접근 거부·CAPTCHA·429·반복된 실패입니다. 429의 기본 쉬는 시간은 300초입니다. 설정 주석은 상류 기본이 3,600초라, Yahoo! JAPAN 같은 엔진에 한 시간은 너무 길다고 적습니다. CAPTCHA·접근 거부는 86,400초입니다.
- **휴식(rest).** 실패가 아니라, 빈 응답이 `empty_result_limit`(8)번 이어지면 `empty_result_cooldown`(300초) 동안 로테이션에서 빠집니다. `src/engine/state.rs`는 이 상태를 `"resting"`으로 구분합니다.

응답 캐시는 프로세스 안 TTL+LRU이고, 설정은 Valkey/Redis도 받습니다. 이 저장소의 `settings.toml`은 `backend = "memory"`, `ttl = 300`, `max_bytes = 33554432`(32MB)입니다. 주석은 페이지 본문까지 캐시하려면 8MB로는 부족하다고 적습니다. README가 말하는 반복 질의 **0.01초**는 이 캐시가 맞은 뒤의 숫자입니다.

선택 기능 `rustxng-index`는 Tantivy 0.27로 로컬 BM25 색인을 만듭니다. `local_index_path`가 비어 있으면 꺼져 있고, 기본 설정이 그렇습니다. 크롤은 robots.txt의 `Disallow`를 보고, 같은 호스트만 따라가며, 호스트마다 간격을 둡니다. [docs/LOCAL-INDEX.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/LOCAL-INDEX.md)는 이 기능이 실험이고, 5,000페이지 근처에서 그들의 100문 세트의 hit율이 더 오르지 않았다고 적습니다.

Deep Research는 별도 경로 `GET /research?q=...` 입니다. `src/deep_research.rs`의 순서는 (1) 하위 질의를 만들고 (2) 각 질의를 `include_raw_content`로 검색한 뒤 (3) LLM이 있으면 인용 있는 마크다운을 씁니다. LLM이 없으면 `queries` / `sources` / 본문만 돌아옵니다. `settings.toml`의 `[research]`는 `enabled = false`, `api_key = ""` 입니다. 보고서 모드만 API 키가 필요합니다.

```bash
# 기본 주소. 키 없음. 스니펫만.
curl "http://127.0.0.1:8888/search?q=tokio+runtime&format=json"

# 상위 5건의 본문까지. raw_content 는 가져온 뒤에만 생깁니다.
curl "http://127.0.0.1:8888/search?q=tokio+runtime&format=json&max_results=5&include_raw_content=1"

# 증거 묶음. [research] 를 켜지 않아도 queries/sources 는 돌아옵니다.
curl "http://127.0.0.1:8888/research?q=tokio+runtime&max_queries=3&max_sources=8"
```

에이전트 도구로 붙일 때의 최소 형태입니다. 저장소 예제가 아니라, 위 파라미터에 맞춘 호출입니다. 서버는 따로 떠 있어야 합니다.

```python
import json
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8888"

def web_search(query: str, limit: int = 5) -> str:
    qs = urllib.parse.urlencode({
        "q": query,
        "format": "json",
        "max_results": limit,          # 서버가 1..200 으로 자른다
        "include_raw_content": "1",
    })
    with urllib.request.urlopen(f"{BASE}/search?{qs}", timeout=30) as resp:
        data = json.load(resp)
    blocks = []
    for i, hit in enumerate(data.get("results", []), 1):
        body = (hit.get("raw_content") or hit.get("content") or "").strip()
        blocks.append(f"[{i}] {hit.get('title','')}\n{hit.get('url','')}\n{body[:800]}")
    return "\n\n".join(blocks)
```

언어를 지정하고 싶으면 질의 안의 `:ja` 이거나 `locale=ja` 입니다. `language=ja` 는 아래 주의에 적습니다.

## 설치

README가 적는 경로는 네 가지입니다. 태그는 릴리스에 맞춰 `v0.26.0`으로 적습니다. 영어 README의 cargo 예제는 아직 `v0.25.0`을 가리킵니다.

```bash
# 1. 릴리스 바이너리. 옆의 .sha256 과 맞춘 뒤에 실행.
curl -fsSL -o rustxng \
  https://github.com/sahenjp/RustXNG/releases/download/v0.26.0/rustxng-v0.26.0-x86_64-unknown-linux-musl
chmod +x rustxng && ./rustxng --version

# 2. cargo. rustxng 와 rustxng-index 가 같이 깔린다. Rust 1.85+.
cargo install --git https://github.com/sahenjp/RustXNG.git --tag v0.26.0

# 3. 이미지. v0.26.0 태그 push의 docker 워크플로가 GHCR에 올렸다.
docker run -p 8888:8888 ghcr.io/sahenjp/rustxng:0.26.0
```

2026-11-02에 `ghcr.io/sahenjp/rustxng:0.26.0` 매니페스트는 HTTP 200이었고, 플랫폼에는 `linux/amd64`가 있었습니다. 워크플로 [docker.yml 실행 41300228449](https://github.com/sahenjp/RustXNG/actions/runs/41300228449)는 성공으로 끝나 있습니다. 일본어 README는 아직 "빌드된 이미지는 미공개"라고 적고, 자산 예시가 `v0.4.0`에 머물러 있습니다. 영어 README·CHANGELOG 0.26.0·GHCR이 더 새 쪽입니다.

소스에서 빌드할 때는 `cargo build --release` 입니다. Dockerfile의 빌드 스테이지는 `rust:1.99.1-slim`이고, 실행 스테이지는 `debian:bookworm-slim`에서 uid 10001 사용자 `searxng`로 바꿉니다.

## 숫자: 프로젝트 자신의 100문

README 표는 정답 페이지가 있는 100문을 같은 기계에서 돌린 값이라고 합니다. 재현 명령은 `python3 tools/eval_quality.py` 이고, 문항은 `bench/quality-questions.json` 입니다. 저는 이 벤치를 다시 돌리지 않았습니다. 아래는 문서에 적힌 숫자입니다.

| | RustXNG | Exa | Tavily |
| --- | ---: | ---: | ---: |
| hit@1 | **79–83** | 77 | 34 |
| hit@5 | **92–96** | 91 | 79 |
| MRR | **0.853–0.889** | 0.840 | 0.514 |
| 요금 | **$0** | 유료 | $8/1k |
| 요청당 본문 | **약 32,000자** | 약 9,000 | 약 1,200 |
| 같은 질의의 두 번째 | **0.01초** | 0.6초 | 약 1초 |
| 첫 질의 | 0.8–1.6초 | **0.6초** | 약 1초 |

읽는 순서가 있습니다.

- 범위 79–83은 한 방이 아닙니다. [docs/COMPARISON-EXA.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPARISON-EXA.md)는 대표값으로 hit@1 **79/100**, hit@5 **92/100**, MRR **0.853**을 적고, 같은 설정에서도 hit@1이 **77–84**에서 움직인다고 합니다. [docs/LOCAL-INDEX.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/LOCAL-INDEX.md)의 5,000페이지 로컬 색인 병용은 **83 / 96 / 0.889**입니다. README의 구간은 이 두 줄을 묶은 것에 가깝습니다.
- 첫 질의는 Exa보다 느립니다. 빠른 쪽은 캐시가 맞은 반복입니다.
- Google은 이 빌드에서 쓸 수 없다고 문서가 적습니다. WML은 403, HTML은 자바스크립트가 필요하고, 헤드리스 브라우저는 봇으로 막혔다고 합니다. `settings.toml`에서 `google` 엔트리에 `disabled = true`는 없습니다. 켜져 있지만 그들의 측정 환경에서는 결과가 없었다는 뜻입니다.
- [docs/BENCHMARK.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/BENCHMARK.md) 안에는 더 이른 결론도 남아 있습니다. 100문 4회 평균이 hit@1 **62**로 Exa 74에 못 미친다는 절과, 그 뒤에 "API 키 없이 Exa의 세 지표를 넘었다"(hit@1 81, 재시작 없는 연속 실행)는 절이 같이 있습니다. 한 문서 안에서 결론이 바뀐 기록입니다. 단일 숫자를 제품 보증으로 읽지 말라는 문장도 문서가 스스로 적습니다.

본문 길이도 층이 있습니다. 코드 상한은 5건 × 8,000자입니다. COMPATIBILITY는 건당 약 4,000자라고 하고, BENCHMARK의 한 표는 raw를 붙였을 때 건당 4,158자, 상위 5건 합의 중앙값을 32,004자라고 합니다. README의 "약 32,000자"는 그 측정값입니다.

## 주의할 곳

**AGPL-3.0-or-later.** NOTICE의 구분은 이렇습니다. 바이너리를 띄우거나 `127.0.0.1`의 HTTP로만 말하면, 호출하는 프로그램의 라이선스는 호출자 것입니다. 그들이 예로 든 것은 MIT인 rustdsh입니다. 소스를 링크하면 AGPL이 이어지고, 고친 서버를 네트워크 서비스로 돌리면 AGPL 13조가 그 소스 제공을 요구합니다. [firecrawl/firecrawl#5524](https://github.com/firecrawl/firecrawl/pull/5524)도 같은 구분을 적습니다. 이 PR은 2026-11-02에 열렸고, 머지되지 않았습니다. 작성자는 2001Y입니다.

**상류 사이트의 조건과 차단.** 메타검색은 질의어를 Bing, Wikipedia, Yahoo! JAPAN 같은 사이트로 보냅니다. README의 "search terms never leave it"는 RustXNG라는 유료 API 사업자에게 안 보낸다는 뜻으로만 맞습니다. 엔진 코드는 그 사이트들로 HTTP를 냅니다. 각 사이트의 이용 조건·로봇 규칙·속도 제한은 그대로 적용되고, 막히면 결과가 비습니다. CHANGELOG 0.24.0은 새 인스턴스 한 번 검색에서 응답 44, 무응답 25(403이 12, CAPTCHA가 7)였다고 적습니다. 막힘을 우회하는 방법은 여기 적지 않습니다. 문서가 말하는 결론은, 프록시를 넣어도 막힘의 일부에만 가능성이 있고 그 환경에서는 해제 효과를 확인하지 못했다는 쪽입니다.

**젊은 트리.** 저장소 생성부터 `v0.26.0`까지가 2026-10-18에서 11-01입니다. 태그는 `v0.1.0`부터 `v0.26.0`까지 있고, 10월 29일부터 11월 1일 사이에 릴리스가 촘촘합니다. API 형태가 이미 여러 번 움직였습니다. 영어 README와 일본어 README, COVERAGE.md의 엔진 개수도 파일을 그대로 세면 어긋납니다. `v0.26.0`의 `settings.toml`에는 `[[engines]]`가 284개이고, 그중 `disabled = true`가 113줄입니다. 켜진 항목은 171개입니다. README는 "설정 352개, 기본 180개", COVERAGE.md는 "이 이식의 설정 275개, 기본 약 170개"라고 합니다. 352는 그 문서가 상류 SearXNG `settings.yml`의 엔트리 수로 설명하는 숫자입니다.

**`language` 파라미터.** `v0.26.0`에서 아직 그렇습니다. `SearchParams`에는 `language`가 있지만, `run_search`는 그 값을 검색에 넣지 않습니다. HTML 페이지 링크에 다시 실을 뿐입니다. 엔진이 읽는 언어는 `Query::engine_language` 입니다. 순서는 질의 안의 `:ja` 같은 지정, 그다음 `locale` 쿼리·쿠키, 둘 다 없으면 글자 범위로 `ja` 또는 `en`입니다. 히라가나·가타카나·한자 범위는 있고, 한글(U+AC00–U+D7AF)은 없습니다. 한글만 있는 질의는 이 분기에서 `en`이 됩니다. `SearchRequest.language`에 취향 쿠키와 `default_lang`(설정값은 `"auto"`)을 넣지만, 엔진 호출부가 이 필드를 읽지는 않습니다. `/config`의 엔진별 `languages`와 `regions`는 빈 배열이고, 주석은 트레이트가 엔진별 언어를 추적하지 않는다고 적습니다. Firecrawl PR도 같은 한계를 알려진 제한으로 적습니다. 그 클라이언트가 보내는 `language`는 지금 릴리스에서 무시됩니다.

**SSRF 가드의 범위.** `include_raw_content`와 이미지 프록시는 `is_public_url`로 `http`/`https`가 아닌 스킴, `localhost`, `.local`, 리터럴 사설·루프백·링크 로컬 IPv4를 거절합니다. 호스트 이름은 DNS로 풀어 보지 않고 통과합니다. 본문 취득은 시작 URL만 검사한 뒤, reqwest가 리다이렉트(기본 최대 20)를 따라갑니다. [docs/AI-INFRA.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/AI-INFRA.md)는 리다이렉트 포함이라고 적지만, `page_text`의 검사 위치는 시작 URL입니다. IPv6 쪽 거부는 루프백과 미지정 주소입니다. 기본 바인드는 루프백이고 `limiter = false`이며, `secret_key`는 `ultrasecretkey`라는 자리표시자입니다. 이 기본값으로 인터넷에 열 설정은 아닙니다.

GitHub 토픽에는 `mcp`가 있습니다. `v0.26.0` 트리에서 MCP 서버 구현은 찾지 못했습니다. 붙이는 면은 위의 HTTP입니다.

## 팩트 체크

✅ 그 문장과 맞는 1차 자료가 있음 / ⚠️ 핵심만 맞거나, 범위가 더 좁거나, 1차 자료가 없음 / ❌ 코드·문서와 어긋남

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 10대 학생이 만들어 오픈소스로 공개했다 | ⚠️ | 공개 저장소와 AGPL 릴리스는 맞다. [sahenjp](https://github.com/sahenjp) 소개는 *"a student developer"* 이고 위치는 Japan이다. 학생이라는 말은 본인 프로필의 자기 소개이고, 재학을 증명하는 문서는 없다. 10대라는 나이는 프로필·README·NOTICE·릴리스에 없다. [sahen.site](https://sahen.site)는 이 글을 쓰는 동안 Cloudflare 확인 페이지라 본문을 읽지 못했다. [원 포스트](https://x.com/studio_yebisu/status/2116899259824124279) |
| 로컬 서버만 켜면 되고, API 키와 이용료가 없다 | ✅ | 기본 검색은 `127.0.0.1:8888`, 키 없음, 소프트웨어 요금 $0. 선택 엔진 `exaapi`와 `/research`의 보고서 모드는 키가 필요하다. 기계 비용과 상류 사이트의 차단은 별도다. [README](https://github.com/sahenjp/RustXNG/blob/v0.26.0/README.md) · [settings.toml `[research]`](https://github.com/sahenjp/RustXNG/blob/v0.26.0/settings.toml) |
| 검색 결과만이 아니라 페이지 본문도 가져온다 | ✅ | `include_raw_content=1`일 때 상위 5건(기본)에 `raw_content`. 기본 JSON은 스니펫 `content`만 두고 이 필드를 생략한다. 건당 상한 8,000자. [COMPATIBILITY](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPATIBILITY.md) · [aggregator.rs `page_text`](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/aggregator.rs) |
| 캐시를 쓰면 1,000건을 약 3.3초에 모을 만큼 빠르다 | ⚠️ | 반복 질의 0.01초, 첫 질의 0.8–1.6초는 README에 있다. 첫 질의는 Exa 0.6초보다 느리다. 1,000건·3.3초는 포스트 작성자의 측정이고 저장소에 없다. 한 응답의 `max_results`는 200에서 잘린다. [handlers.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/web/handlers.rs) |
| 유료 검색 API에 필적하는 성능을 무료로 낸다 | ⚠️ | 그들의 100문에서 hit@1 79–83 대 Exa 77은 README가 그렇게 적는다. 같은 문서가 편차, Google 부재, 첫 질의 지연을 같이 적고, BENCHMARK.md의 앞부분은 평균 62로 Exa에 못 미친다고 적었다가 뒤에서 넘었다고 고친다. 독립 재현은 이 글에 없다. [COMPARISON-EXA](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPARISON-EXA.md) · [BENCHMARK](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/BENCHMARK.md) |
| Exa 같은 유료 API를 대체한다 | ⚠️ | 원 포스트는 "완전히 필요 없어지는지는 모르겠다"고 스스로 한 걸음 물러선다. 제품은 키 없는 대안을 표방한다. Exa의 자기 색인이 아니고, 상류가 막히면 정답 페이지가 결과 집합에 아예 없다. 그 차이를 BENCHMARK가 아키텍처 차이라고 적는다. |
| 간단한 Deep Research가 들어 있다 | ✅ | `GET /research`가 하위 질의, 검색, 본문 수집을 한다. LLM 보고서는 `[research].enabled`와 `api_key`가 있을 때이고 기본은 꺼져 있다. 키 없이도 증거 묶음은 반환한다. [deep_research.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/deep_research.rs) · [COMPATIBILITY의 ディープリサーチ](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPATIBILITY.md) |
| 여러 번 치면 보통 말하는 Deep Research가 된다 | ⚠️ | 인용 포스트의 예상이다. 한 번의 `/research`는 하위 질의를 최대 10개, 출처를 최대 50개로 자른 한 패스다. 기본은 5와 10이다. 장시간 조사 에이전트의 구현은 아니다. |
| 데이터를 무제한으로 가져올 수 있다 | ❌ | 요금 한도가 없다는 뜻과, 가져오는 양에 한도가 없다는 뜻은 다르다. `max_results`는 200, 본문은 5건×8,000자, 캐시 TTL은 300초, 429면 엔진이 300초 쉬고, 빈 응답이 8번이면 300초 휴식이다. 봇 리미터 코드도 있다(기본 `limiter = false`, 켜면 창 60초에 30회). 상류 429·CAPTCHA는 CHANGELOG에 측정으로 남아 있다. |
| Sahen이 일본어 사용자가 쓰기 비교적 쉬운 DSH의 메인 프로그래머다 | ⚠️ | [jimoto-no-llm/rustdsh](https://github.com/jimoto-no-llm/rustdsh) 기여자 API에서 sahenjp가 1,308, 다음 계정이 388이다(2026-11-02 조회). 기여 수와 "메인 프로그래머"는 같은 문장이 아니고, "메이저 릴리스가 곧"은 이 저장소에서 확인하지 못했다. |

**총평:** 로컬에서 키 없이 SearXNG형 JSON을 받고, 파라미터 하나로 상위 페이지 본문을 붙이며, `/research`로 짧은 증거 수집을 하는 서버는 `v0.26.0`에 있습니다. 포스트가 가장 크게 나간 두 문장, 10대라는 신원과 무제한 수집은 그 릴리스가 말하지 않습니다. 유료 API와 맞먹는다는 문장은 프로젝트 자신의 100문 hit율이고, 같은 문서가 첫 질의는 더 느리다고 적습니다.

## 개발자로서 가져갈 점

1. **기본 도구 호출은 `format=json&max_results=5&include_raw_content=1` 한 줄로 충분하다.** 본문이 없으면 `raw_content` 키 자체가 없다. 스니펫 `content`로 폴백하면 된다.
2. **언어는 `language=`가 아니라 `:ja` 또는 `locale=`로 넘긴다.** Firecrawl의 SearXNG 클라이언트가 보내는 `language`는 이 릴리스에서 검색 언어가 되지 않는다. 한글만 있는 질의의 자동 판정도 `en`이다.
3. **hit@1 79는 데모 숫자가 아니라 편차가 있는 자기 측정이다.** 엔진이 403·CAPTCHA로 빠지는 날에는 순위 가중치로 정답 페이지를 만들어 낼 수 없다. 그 페이지가 후보에 없기 때문이다.
4. **요금이 0이라는 말과 호출이 무한하다는 말을 섞지 않는다.** 429 서스펜드와 본문 상한이 이미 코드에 있다. 에이전트 루프에는 `max_results`와 캐시 TTL을 예산으로 넣는 편이 맞다.
5. **공개하기 전에 바인드, `secret_key`, 라이선스를 본다.** 기본은 루프백과 자리표시자 키다. 고친 바이너리를 남에게 서비스하면 AGPL 13조가 소스 제공을 요구한다. HTTP로만 부르는 쪽은 NOTICE가 호출자 라이선스를 유지한다고 적는다.

## 참고 자료

- sahenjp/RustXNG `v0.26.0` (커밋 `fef998b`) — [저장소](https://github.com/sahenjp/RustXNG) · [README](https://github.com/sahenjp/RustXNG/blob/v0.26.0/README.md) · [README.ja.md](https://github.com/sahenjp/RustXNG/blob/v0.26.0/README.ja.md) · [CHANGELOG 0.26.0](https://github.com/sahenjp/RustXNG/blob/v0.26.0/CHANGELOG.md) · [Cargo.toml](https://github.com/sahenjp/RustXNG/blob/v0.26.0/Cargo.toml) · [LICENSE (AGPL-3.0-or-later)](https://github.com/sahenjp/RustXNG/blob/v0.26.0/LICENSE) · [NOTICE](https://github.com/sahenjp/RustXNG/blob/v0.26.0/NOTICE) · [릴리스](https://github.com/sahenjp/RustXNG/releases/tag/v0.26.0)
- 문서 — [AI-INFRA](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/AI-INFRA.md) · [COMPARISON-EXA](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPARISON-EXA.md) · [BENCHMARK](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/BENCHMARK.md) · [COMPATIBILITY](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COMPATIBILITY.md) · [LOCAL-INDEX](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/LOCAL-INDEX.md) · [COVERAGE](https://github.com/sahenjp/RustXNG/blob/v0.26.0/docs/COVERAGE.md) · [SECURITY](https://github.com/sahenjp/RustXNG/blob/v0.26.0/SECURITY.md)
- 코드 — [handlers.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/web/handlers.rs) · [feeds.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/web/feeds.rs) · [image_proxy.rs `is_public_url`](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/web/image_proxy.rs) · [deep_research.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/deep_research.rs) · [query.rs `engine_language`](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/query.rs) · [engine/state.rs](https://github.com/sahenjp/RustXNG/blob/v0.26.0/src/engine/state.rs) · [settings.toml](https://github.com/sahenjp/RustXNG/blob/v0.26.0/settings.toml)
- 배포 — [Dockerfile](https://github.com/sahenjp/RustXNG/blob/v0.26.0/Dockerfile) · [docker 워크플로](https://github.com/sahenjp/RustXNG/blob/v0.26.0/.github/workflows/docker.yml) · [GHCR 공개 실행](https://github.com/sahenjp/RustXNG/actions/runs/41300228449) · `ghcr.io/sahenjp/rustxng:0.26.0`
- 상류 — [searxng/searxng](https://github.com/searxng/searxng)
- 관련 PR (미머지) — [firecrawl/firecrawl#5524](https://github.com/firecrawl/firecrawl/pull/5524). `language` 무시와 AGPL 분리 프로세스 설명을 적는다.
- 계정 — [sahenjp](https://github.com/sahenjp) · [jimoto-no-llm/rustdsh 기여자](https://github.com/jimoto-no-llm/rustdsh/graphs/contributors)
- 원본 X 포스트 — [@studio_yebisu, 2026-11-01](https://x.com/studio_yebisu/status/2116899259824124279) · 인용 [@rna4219, 2026-11-01](https://x.com/rna4219/status/2116903120794263616)
