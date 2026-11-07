---
title: "깃허브 18.4K로 플레이 앱까지? Craft Anything 팩트 체크"
date: 2026-11-08
time: "08:15"
slug: craft-anything-ai-software-cloning
tags: [Craft Anything, Rust, Reverse Engineering, Claude Code, Codex, REA, OSS, 팩트체크]
summary: "storytold/craft-anything(듀얼 라이선스, Rust, 2026-10-31 생성)의 Study→Build→Check를 README·STATUS·검사 코드로 대조했습니다. API 별은 20,496개, 플레이 상위 앱 클론은 문서에 없고, 한국어 README는 같은 커밋에서 영어판보다 뒤처집니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@kangyou82의 포스트](https://x.com/kangyou82/status/2118916471275639019)를 계기로 썼습니다. 작성 시각은 2026-11-07 13:00 KST(04:00:28 UTC)입니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-08(KST)에 클론·읽은 [storytold/craft-anything](https://github.com/storytold/craft-anything) `1f8508a`(2026-11-07 22:46 KST 푸시)의 README·`README.ko.md`·`docs/STATUS.md`·`docs/codex.md`·`docs/claude-code.md`·`docs/tools.md`·검사 코드, [GitHub REST API](https://api.github.com/repos/storytold/craft-anything) (2026-11-08 08:14 KST), [저작권법](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033063629)(법률 제21595호), [Google Play 이용약관](https://play.google.com/about/play-terms/index.html)입니다.

## 왜 중요한가

“다른 앱을 보여 주면 AI가 비슷한 걸 만들어 준다”는 말은 2026년 에이전트 도구의 단골 약속입니다. 실제로 갈리는 지점은 세 곳입니다.

1. **스크린샷을 코드로 옮기는 도구** — 보이는 화면을 HTML로 바꾸는 쪽입니다. 바이너리·게임 루프·“만든 결과가 원본과 얼마나 같은지”까지 닫힌 고리로 돌리지는 않습니다.
2. **리버싱 도구** — Ghidra·JADX·apktool처럼 파일을 읽는 쪽입니다. 읽은 결과를 새 프로젝트로 만들고, 다시 화면과 맞춰 고치는 제품은 따로입니다.
3. **코딩 에이전트** — Claude Code·Codex는 글을 코드로 바꿉니다. 원본을 어떤 증거로 보고, 어디까지 베끼면 안 되는지는 보통 사용자가 프롬프트로 정합니다.

[Craft Anything](https://github.com/storytold/craft-anything)은 그 셋을 한 저장소에 묶습니다. README 첫 문장은 이겁니다.

> See how any website, app or game works, then have AI build your own version; an open-source, clean-room engine in pure Rust.

개발자 입장에서 확인할 질문은 슬로건보다 다음입니다.

- 루프는 정말 “분석 → 생성 → 화면 비교 → 수정”인가, 화면 비교가 전부인가?
- Windows 설치 파일과 한국어 문서가 있는가, 그 한국어는 영어와 같은 커밋인가?
- Codex는 “초기 알파”이고 Claude Code가 더 검증됐다는 말이 문서와 맞는가?
- “rea에 이어”는 이 저장소가 밝히는 계보인가?
- 구글 플레이 상위 앱 클론은 기능으로 적혀 있는가?

## 기술 설명: Craft Anything

### 저장소·라이선스·규모 (GitHub API, 2026-11-08 08:14 KST)

| 항목 | 값 |
|---|---|
| full_name | `storytold/craft-anything` |
| description | Craft Anything: understand how any software works, and craft your own. |
| stargazers | **20,496** |
| forks | **3,922** |
| open_issues_count | **265** (검색 API 기준 열린 이슈 158 + 열린 PR 107) |
| license 필드 | API는 `Apache-2.0`만 표시 |
| 저장소가 고른 라이선스 | **MIT OR Apache-2.0** (`LICENSE-MIT`, `LICENSE-APACHE`, `Cargo.toml` `license`) |
| language | Rust (API languages: Rust가 대부분, 이어서 Shell·PowerShell·Java·Swift·Python 등) |
| created_at | 2026-10-31T14:50:00Z → **2026-10-31 23:50 KST** |
| pushed_at | 2026-11-07T13:46:03Z → **2026-11-07 22:46 KST** (`1f8508a`) |
| 커밋 | API `Link`의 `rel=last`가 `per_page=1`일 때 **474**페이지 |
| 기여자 | contributors API(`anon=1`) 마지막 페이지 **68** |
| 최신 릴리스 | **v0.5.0** (published 2026-11-06T20:21:17Z → **2026-11-07 05:21 KST**) |
| 워크스페이스 버전 | 같은 커밋의 `Cargo.toml` `version`은 **0.4.0**, `rust-version` **1.97** |

저작권 표시는 “Copyright (c) 2026 ArtCraft Team and the Craft Anything contributors”입니다. `docs/brand/`의 ArtCraft 이름·로고는 이 라이선스 밖 상표이고, 포크는 빼야 한다고 README가 적습니다. 배지의 “100% Rust”와 달리 워크스페이스 lint는 `unsafe_code = "forbid"`인 Rust 크레이트가 본체이고, 언어 통계에는 패키징·보조 파일도 섞입니다.

공개 릴리스는 v0.1.0(2026-10-31)부터 v0.5.0까지 다섯 개입니다. v0.5.0 자산에 Windows x64·arm64·x86 MSI와 portable zip, macOS universal DMG, Linux AppImage·deb·rpm·Flatpak·tar.gz, FreeBSD tar.gz, `craft-anything-web-0.5.0.zip`이 있습니다.

### 네 단계와 실제로 비교하는 법

README의 순서는 Study → Build → Check → Ready이고, 상태 문서는 여기에 Refine을 붙입니다. 기본 설정(`crates/engine/src/settings.rs`의 `BuildSettings::default`)은 이렇습니다.

- 웹 비교 너비 **1440, 768, 390** px (비어 있으면 이 기본값)
- 시작 페이지 외 추가 페이지 **최대 4**
- 앱에서의 추가 다듬기 라운드 **6**, 닮음 **90%**에서 중단
- CLI `--rounds` 기본값은 **2** (`apps/craft-anything-cli/src/rebuild_cmd.rs`, `default_value_t = 2`)

웹 검사 `WebVisualCheck`는 만든 사이트를 루프백에 띄운 뒤, 원본과 같은 너비로 다시 찍습니다. 점수는 레이아웃(16px 타일 평균색이 맞는 비율)과 디테일(밝기의 SSIM)의 평균입니다. `website.rs`가 도구 결과(0–1)를 퍼센트로 바꾸는 식은 `(layout + detail) * 50.0`입니다. 텍스트·DOM 구조·색·글꼴·간격·가로 스크롤·콘솔 오류·메뉴는 노트와 claim으로 붙고, 점수 자체는 바꾸지 않습니다. claim이 하나라도 실패하거나 비교하지 못한 항목이 있으면 90%여도 통과가 아닙니다 (`docs/STATUS.md`의 Rebuild workflow 행).

흔들리는 부분(캐러셀, 영상, 애니메이션)은 비교에서 뺍니다. `website_tools.rs`는 같은 페이지를 간격을 두고 **세 번** 찍어 `noise-<width>.png` 마스크를 만들고, `web_pixels_compare`의 `ignore`로 넘깁니다.

```rust
// crates/engine/src/tools/website_tools.rs (요지)
// 같은 페이지를 두 번 더 찍어, 스스로 바뀐 칸만 마스크로 남긴다.
let second = photograph(client)?;
settle(client, 1300)?;
let third = photograph(client)?;
let mask = NoiseMask::between(&a, &b, 24).union(&NoiseMask::between(&a, &c, 24));
```

게임은 화면만으로 Ready가 되지 않습니다. `self_test.rs`의 계약은 빌드된 게임이 `--self-test <file.json>`으로 `move` / `act` / `hud`를 자기 상태에서 재고, 세 단계가 모두 통과해야 한다는 것입니다. 앱·게임의 창 스크린샷 닮음은 기본값에서 `picture_good_enough`가 비어 있어 **보고만** 하고, 통과선을 그리지 않습니다.

프로젝트 폴더는 `Documents/Craft Anything` 아래 `craft.json`, `capture/`, `app/`, `checks/`, `investigation.cany/`, `inbox/`입니다.

### Clean room과 Deep

기본은 **Clean room**입니다. 원본의 코드·파일·페이지 소스를 읽지 않고, 방문자가 보는 화면(스크린샷, 보이는 글, 측정한 레이아웃·색·글꼴·간격, 연 메뉴)과, 허용하면 창 사진만 씁니다. 안을 보는 도구는 거절되고 Deep를 켜라고 안내합니다.

**Deep**는 내장 디코더·디스어셈블러·디컴파일러와, 설치돼 있으면 Ghidra를 씁니다. 웹은 JavaScript를 읽고 시작 페이지를 지켜봅니다. README는 이 구분이 운영체제 샌드박스가 아니라고 못 박습니다. 코딩 에이전트는 사용자 권한으로 돌고, Claude Code의 읽기를 막는 방식은 에이전트마다 다릅니다 (`docs/claude-code.md`).

`docs/tools.md`는 `cargo xtask tools`가 생성한 목록이고, 이 커밋 헤더는 **엔진 도구 302개**입니다. 글머리표도 302개입니다. 영어 README는 “320 tools (300 in the engine)”, 한국어 README는 “314개 도구(엔진에 298개)”라고 적습니다. 같은 커밋에서 세 문서의 도구 수가 서로 다릅니다. 생성된 `tools.md`를 엔진 도구의 기준으로 보는 편이 맞습니다. AI·setup 계층(`rebuild_*`, `ai_*`, `setup_*`)은 그 위에 더해지고, 영어 README의 320은 그 합을 가리키는 문장입니다. 302와 300이 이미 어긋나므로 320을 정확한 합으로 쓰지는 않겠습니다.

Android 정적 도구(패키지, 클래스, 리소스, 컴포넌트, Flutter/Dart, JEB)와 adb 도구(설치 앱 목록, 스크린샷, 기기에서 앱 복사 등)는 `docs/tools.md`에 있습니다. `docs/tool-status.md` 요약표는 Android 기기(adb)를 **검증 2, 미검증 23**, 비고 “no device attached”로 둡니다. 이 표가 “플레이 스토어 상위 차트를 클론한다”는 뜻은 아닙니다.

웹 빌드는 파일을 브라우저에서 식별하는 WebAssembly 뷰어입니다 (`packaging/web`). 데스크톱의 Study→Build 루프 전체가 브라우저 안에서 도는 형태는 README가 말하지 않습니다. Flatpak은 샌드박스라 이 컴퓨터의 브라우저를 띄우지 못해, 웹사이트 조사에는 다른 패키지를 쓰라고 합니다.

### 어떤 에이전트로 만드는가

빌드에는 이 컴퓨터에 로그인된 코딩 에이전트가 필요합니다. 영어 README가 순서를 이렇게 적습니다.

- **Claude Code**를 먼저 지원합니다. 설치된 `claude`를 고치지 않고 실행하고, 계정은 Craft Anything이 보지 않습니다. `docs/STATUS.md`는 headless로 Opus 5.5(설정이 없으면 high effort)를 돌리고, 2026-11-02 Mac에서 Claude Code 2.1.316 라이브 런을 적습니다.
- **Codex** 어댑터는 있습니다. README 원문: “A Codex adapter exists but hasn't been verified on a real install yet.” `docs/codex.md`는 `codex exec`가 비대화형이라 `rebuild_start` 승인이 필요하고, 스타트업 도구 발견은 Codex CLI 0.166.0·루프백 모델로 봤으며 **“No real-account build was run.”** 이라고 끝냅니다. `docs/ROADMAP.md`의 “run `codex exec` on a real install” 항목은 아직 체크돼 있지 않습니다.
- **GitHub Copilot**, **Grok Build**, ACP 에이전트(Gemini CLI, Qwen Code, opencode, goose, Hermes, Maki)가 영어 README에 있습니다. 그중 라이브로 돌렸다고 한 것은 Maki뿐입니다(README). STATUS는 그 뒤로 Copilot·Grok·Aider·DeepSeek Harness의 라이브 기록을 더 적습니다. README Status의 “다른 코딩 에이전트는 구현만 되고 라이브는 아직”은 STATUS보다 거친 문장입니다.
- 질문·분석용 API로는 Anthropic, OpenAI, OpenRouter, xAI(Grok, `XAI_API_KEY`), 로컬 OpenAI 호환 서버가 Settings → AI에 있습니다. 이 키만으로 빌드 루프가 라이브 검증됐다는 뜻은 README “Partly there”가 부정합니다.

프로젝트 전체 배지는 **early alpha**입니다. “초기 알파”는 Codex만의 딱지가 아니라 제품 상태입니다. Codex는 그 안에서도 “실제 설치에서 빌드를 확인하지 않음”으로 한 단계 더 좁습니다.

### 실행

릴리스 설치 파일이 있으면 Rust 툴체인은 필요 없습니다. 소스는 README 기준입니다.

```sh
git clone https://github.com/storytold/craft-anything && cd craft-anything
cargo run --release -p craft-anything
cargo install --path apps/craft-anything-cli
craft-anything-cli doctor
craft-anything-cli rebuild https://example.com "Recreate this website"
craft-anything-cli rebuild - "A snake game in Rust" --rounds 1
```

Debian/Ubuntu 데스크톱 빌드는 `libxkbcommon-dev` 등 X11/Wayland/GTK 개발 패키지가 필요하다고 README가 적습니다. 의존성 설치 스크립트(`npm` 등)는 이 컴퓨터에서 코드를 실행할 수 있어, 처음 보는 종류의 명령은 묻고, `npm`을 “항상 허용”하면 이후 npm은 묻지 않습니다.

검사에 AI는 필요 없습니다. `craft-anything-cli mcp`로 같은 도구를 MCP 클라이언트에 넘길 수 있습니다.

### 한국어가 가리키는 것

두 층이 있습니다.

1. **README.ko.md** — 루트에 있고 영어 README 언어 막대에서 링크됩니다. 334줄입니다(영어 README는 427줄).
2. **앱 UI** — `docs/localization.md`가 Settings → General → Language의 **한국어(`ko`)** 를 적고, `crates/ui-egui/src/i18n/ko.tsv`가 있습니다. 용어는 클린룸 / 심층, 분석 / 만들기 / 검사 / 완성, 문장은 합니다체라고 그 문서가 적습니다.

같은 커밋에서 한국어 README의 “현재 상태”는 영어와 다릅니다.

- 영어: 공개 릴리스(Windows·macOS·Linux·FreeBSD 설치 파일)가 Releases에 있고, 다음은 **managed tier**.
- 한국어: “**다음:** 첫 공개 릴리스(…설치 프로그램과 브라우저 뷰어는 CI에 준비되어 있음)”.

한국어 파일의 다운로드 절은 바로 아래에서 최신 릴리스의 Windows MSI를 안내합니다. 상태 절과 다운로드 절이 한 파일 안에서 어긋납니다. AI 절도 영어보다 짧아서, Copilot·Grok·ACP·Aider·DeepSeek Harness가 빠지고 Codex만 “실제 설치 환경에서는 아직 검증되지 않았습니다”로 남습니다. 한국어 **문서가 있다**는 사실과, 그 문서가 이 커밋의 영어 본문과 **같다**는 사실은 다릅니다.

## 비즈니스 인사이트

숫자·제품 서술은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다. 매출·DAU·기업 가치는 적지 않습니다.

**같은 유행의 이웃.** [morluto/rea](https://github.com/morluto/rea)는 2026-04-14에 만들어진 TypeScript 저장소입니다(MIT, 설명 “Reverse engineer anything with agents…”, 홈페이지 [rea.tools](https://rea.tools)). 2026-11-08 08:14 KST API는 별 **440,915**, 포크 109,098입니다. Craft Anything보다 약 6개월 반 앞섭니다. 공개 README는 에이전트가 MCP로 바이너리·Electron·.NET·웹을 조사하고 증거를 받아 구현을 쓰게 하는 도구 묶음으로 자신을 설명합니다. Craft Anything README·NOTICE·이 커밋 검색에는 `rea`라는 이름이 없습니다. [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)는 2023-11-14 생성, MIT, 같은 시각 별 **81,078**, 설명은 스크린샷을 HTML/Tailwind/React/Vue로 바꾸는 도구입니다. 부모 커뮤니티 저장소 [storytold/artcraft](https://github.com/storytold/artcraft)는 Apache-2.0, 별 **39,539**, 설명은 아티스트용 크래프팅 엔진입니다. Craft Anything README는 PhotoCraft·VectorCraft 등 “Craft App Suite”의 한 칸으로 자신을 놓고, 사이트는 [getartcraft.com](https://getartcraft.com/)입니다.

**분석/의견.** 화면을 코드로 바꾸는 도구와, 파일을 읽는 리버서와, 구독제 코딩 에이전트가 이미 따로 있습니다. Craft Anything이 더하는 것은 그 사이를 **검사 점수로 닫는 데스크톱 루프**입니다. REA 별 44만은 관심의 크기이지, Craft Anything이 그 코드의 후속판이라는 증거가 아닙니다. screenshot-to-code는 웹 화면의 한 장에 강하고, Craft Anything의 웹 검사는 세 너비·노이즈 마스크·claim·최대 6라운드까지 갑니다. 게임 자기테스트와 Deep 모드의 Ghidra는 그 저장소의 범위 밖입니다.

**누가 이득을 보나.** (1) 자기 사이트·자기 바이너리를 증거와 함께 다시 짜 보고 싶은 개발자 — Clean room은 바깥만, Deep는 소유·허락이 있을 때. (2) ArtCraft가 말하는 제작자 커뮤니티 — README는 페인팅·영상·디자인 쪽 디스코드([discord.gg/artcraft](https://discord.gg/artcraft))를 본진으로 둡니다. (3) 이미 Claude Code가 깔린 사람 — 추가 모델 호스팅 없이 그 로그인을 빌더로 씁니다. **분석/의견.** 서버 로직·로그인 뒤 데이터·안티치트 게임의 “기능 복제”를 기대하는 사람에게는 README의 거절 조건(DRM·로그인·안티치트 우회 안 함)이 제품 경계입니다. 랜딩 페이지·작은 게임의 겉루프를 초안으로 만드는 쪽에 가깝습니다.

**비용.** 저장소와 릴리스 바이너리는 라이선스상 무료입니다. 빌드 비용은 사용자가 이미 가진 코딩 에이전트 요금입니다. `docs/claude-code.md`는 Craft Anything이 Claude 사용을 대신 결제하거나 재판매하지 않고, 청구는 사용자와 Anthropic의 계약이라고 적습니다. 같은 문서가 공개한 한도 질문은 Pro/Max의 “보통의 개인 사용” 가정과, 앱 기본 첫 빌드+최대 6라운드(CLI 기본 2)가 그 가정과 어떻게 맞는지 **유료 티어 전에 Anthropic에 확인이 필요하다**는 자체 메모입니다. 게임 그림·3D는 기본 꺼짐이고, 켜면 사용자 fal.ai 키와 프로젝트당 기본 **5달러** 예산입니다 (`docs/STATUS.md` Generated assets). 관리형 유료 티어는 영어 README의 “Next”에만 있고 아직 릴리스 항목이 아닙니다.

**분석/의견 — 도입.** 생성 다음날(10월 31일) v0.1.0, 11월 7일 새벽 v0.5.0, 커밋 474, 기여자 목록 68은 속도가 매우 빠르다는 뜻입니다. 빠른 스타(X가 본 18.4K에서 이 글의 API 20,496까지)는 채택·정확도의 보증이 아닙니다. STATUS는 영역마다 “라이브로 안 돌림”을 같이 적습니다. 에이전트 통합을 프로덕션 기본값으로 두기 전에 `doctor`와 한 건의 작은 웹 재구현으로 자기 환경의 Claude Code 로그인·브라우저·승인 카드를 보는 편이 맞습니다. Codex를 기본 빌더로 두는 것은 저장소 자신이 아직 막은 상태입니다.

## 법적·윤리 주의

이 절은 공개 조문과 약관·README를 소개합니다. 개별 앱을 뜯어 비슷하게 만들어도 되는지 판단해 주는 법률 자문이 아닙니다.

Craft Anything README의 **Responsible use**는 자기가 소유하거나 살펴볼 허락이 있는 소프트웨어에만 쓰라고 합니다. DRM·로그인·안티치트를 우회하지 않는다고 적고, 재구현은 레이아웃·스타일·동작을 증거로 다시 만들며, 소유나 허락을 확인하지 않으면 로고·사진·글을 복사하지 말라고 에이전트에 지시한다고 합니다. Clean room은 그 정책을 도구 거절로 구현한 것이고, README가 말하듯 법적 면역도 운영체제 격리도 아닙니다.

한국 [저작권법](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033063629)(시행 2026. 10. 29., 법률 제21595호, 2026. 4. 28. 일부개정)에서 이 글이 직접 확인한 조항은 두 개입니다.

- **제101조의3 제1항 제6호** — 프로그램의 기초가 되는 아이디어와 원리를 확인하려고 기능을 조사·연구·시험할 목적으로 복제할 수 있는 경우가 있습니다. 정당한 권한으로 그 프로그램을 이용 중인 때로 한정되고, 같은 항 단서는 권리자의 이익을 부당하게 해치면 빠집니다.
- **제101조의4(프로그램코드역분석)** — 정당한 권한자 또는 그 허락을 받은 사람이, 호환에 필요한 정보를 쉽게 얻을 수 없고 획득이 불가피할 때, **호환에 필요한 부분만** 허락 없이 역분석할 수 있습니다. 제2항은 그 정보를 **호환 밖 목적**으로 쓰거나 제3자에게 주는 경우, 그리고 대상 프로그램과 **표현이 실질적으로 유사한 프로그램을 개발·제작·판매**하거나 그 밖에 저작권을 침해하는 행위에 쓰는 경우를 금지합니다.

**분석/의견.** “상위 앱과 비슷하게 동작하는 앱을 만들어 팔거나 배포한다”는 사용은, 역분석 예외가 열어 둔 호환 정보 획득과 문장 그대로 부딪칩니다. 아이디어·동작 원리와, 글·그림·로고·코드 표현은 다릅니다. 화면 점수가 높다는 것은 표현이 가까워졌다는 신호이기도 해서, 90% 닮음을 목표로 다는 설정은 그 자체로 권리 사용 허락이 아닙니다.

[Google Play 이용약관](https://play.google.com/about/play-terms/index.html) “4. Rights and Restrictions”(이 글이 2026-11-08에 읽은 공개 페이지)는 콘텐츠 라이선스를 **개인적·비상업 사용**으로 두고, 제3자에게 콘텐츠를 수정·재배포하는 행위를 제한합니다. 보안 기능이나 난독화가 막는 접근을 우회하는 시도도 제한 목록에 있습니다. 앱·게임은 사용자와 제공자 사이의 추가 이용허락이 붙을 수 있다고 같은 절이 적습니다. 플레이에서 받은 패키지를 넣어 “상위 앱 클론”을 만드는 흐름은 이 약관과 맞닿습니다. 약관 위반과 저작권 침해는 별개로 겹칠 수 있습니다.

웹사이트는 사이트마다 약관이 다릅니다. 이 글은 특정 사이트의 약관을 확인하지 않았습니다. 보이는 글·사진·상표는 코드와 따로 보호됩니다. README가 로고·사진·글 복사를 기본 금지한 이유는 그 층입니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·시점·수사·출처가 다름 / ❌ 1차 자료와 어긋남

원본 X([@kangyou82](https://x.com/kangyou82/status/2118916471275639019), 2026-11-07 13:00 KST)를 `1f8508a` README·STATUS·코드·릴리스 자산·GitHub API와 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 깃허브 별 **18.4K** | ⚠️ | 포스트 시점의 수로 읽을 수 있습니다. **2026-11-08 08:14 KST API = 20,496**. 방향(1만 후반–2만 초반)은 맞고, 인용 숫자는 API가 우선입니다. |
| rea에 이어 Craft Anything | ⚠️ | [morluto/rea](https://github.com/morluto/rea)는 2026-04-14 생성으로 시간순·주제가 앞섭니다(API 별 440,915). `storytold/craft-anything` 문서·검색에는 REA를 전작·포크·후속으로 적지 않습니다. “유행이 이어진다”와 “이 저장소가 REA를 계승한다”는 다릅니다. |
| 다른 웹사이트·프로그램·게임을 분석해 비슷한 기능의 새 프로젝트를 만드는 오픈소스 | ✅ | README 표제·Study/Build. 라이선스는 MIT **또는** Apache-2.0. “비슷한 기능”은 목표이고, Clean room은 안을 읽지 않으며 로그인·DRM 우회는 하지 않는다고 적습니다. |
| 원본 분석 → 코드 생성 → 화면 비교 → 수정 반복 | ⚠️ | Study → Build → Check → Refine은 맞습니다. 화면 비교(세 너비, 레이아웃+SSIM, 세 번 찍어 노이즈 제거)는 **웹** 검사의 중심입니다. 게임 Ready는 `--self-test`의 move/act/hud입니다. 앱 창 닮음은 기본으로 통과선이 아닙니다. |
| Windows를 지원 | ✅ | README 다운로드 표와 [v0.5.0 자산](https://github.com/storytold/craft-anything/releases/tag/v0.5.0): `windows-x64`·`arm64`·`x86` MSI와 portable zip. macOS·Linux·FreeBSD·웹 뷰어도 있습니다. |
| 한국어 설명도 있다 | ✅ | `README.ko.md`와 UI `ko.tsv`. 다만 한국어 README 상태 절은 같은 커밋에서 “첫 공개 릴리스가 다음”이라고 하고, 도구 수도 314/298로 영어 320/300, 생성 목록 302와 다릅니다. 있음과 최신임은 다릅니다. |
| Codex 연동은 있고, 초기 알파이며, Claude Code 구현이 공식적으로 더 많이 검증됨 | ✅ | 배지 “early alpha”. Codex 어댑터·`docs/codex.md`는 있고 “No real-account build was run.” Claude Code는 STATUS에 라이브 빌더 턴이 있습니다. Codex는 “초기 알파”보다 더 좁게, 실제 계정 빌드가 없습니다. |
| 이제 구글 플레이 스토어 상위 앱들도 클론 코딩 | ❌ | 저장소에 그 기능·차트·검증 런이 없습니다. APK·adb 도구는 있으나 adb는 tool-status 요약상 미검증이 23개입니다. 책임 사용·저작권법 제101조의4 제2항·Play 약관의 개인적 사용·수정 제한과 부딪힙니다. |

**총평:** “오픈소스 엔진이 웹·앱·게임을 보고 코딩 에이전트로 새 프로젝트를 만들며, Windows 설치 파일과 한국어 문서가 있고, Claude Code가 Codex보다 검증이 많다”는 뼈대는 1차 자료와 맞습니다. 별 18.4K는 **시점 차이(08:14 KST 기준 20,496)** 입니다. “rea에 이어”는 **앞선 다른 저장소**이지 이 레포의 계보 진술이 아닙니다. 화면 비교는 웹 루프의 핵심이고 게임·앱의 전부가 아닙니다. 플레이 상위 앱 클론은 문서가 약속한 기능이 아닙니다.

## 참고 자료

- GitHub — [storytold/craft-anything](https://github.com/storytold/craft-anything) (API 2026-11-08 08:14 KST: ★20496 / forks 3922 / open_issues_count 265 / created 2026-10-31 / pushed 2026-11-07T13:46:03Z, `1f8508a`)
- 라이선스 — [LICENSE-MIT](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/LICENSE-MIT), [LICENSE-APACHE](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/LICENSE-APACHE), `Cargo.toml` `license = "MIT OR Apache-2.0"` (API `license.spdx_id`는 Apache-2.0)
- 영어 README — 루프, Clean room/Deep, Claude Code·Codex, 책임 사용, 다운로드
- 한국어 README — [README.ko.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/README.ko.md) (상태 절이 “첫 공개 릴리스가 다음”으로 남아 있음)
- [docs/STATUS.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/STATUS.md) — 검증 방법, 90%·6라운드, Claude Code 라이브, 게임 자기테스트
- [docs/codex.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/codex.md) — “No real-account build was run.”
- [docs/claude-code.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/claude-code.md) — 수정하지 않은 `claude`, 청구는 사용자 계약
- [docs/tools.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/tools.md) — 엔진 도구 302
- [docs/tool-status.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/tool-status.md) — adb 검증 2 / 미검증 23
- [docs/localization.md](https://github.com/storytold/craft-anything/blob/1f8508a104134c436cbba5ea2f675619ef47702f/docs/localization.md) — UI 한국어 `ko`
- 검사 코드 — `crates/ai/src/rebuild/kinds/website.rs` (`WebVisualCheck`), `crates/engine/src/tools/website_tools.rs` (세 번 촬영), `crates/ai/src/rebuild/kinds/self_test.rs`, `crates/engine/src/settings.rs`
- 릴리스 — [v0.5.0](https://github.com/storytold/craft-anything/releases/tag/v0.5.0)
- REA — [morluto/rea](https://github.com/morluto/rea) (API 2026-11-08 08:14 KST: ★440915 / MIT / 2026-04-14 / TypeScript)
- 스크린샷→코드 — [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) (API 같은 시각: ★81078 / MIT)
- ArtCraft — [storytold/artcraft](https://github.com/storytold/artcraft) (API 같은 시각: ★39539 / Apache-2.0), [getartcraft.com](https://getartcraft.com/)
- 저작권법 제101조의3·제101조의4 — [국가법령정보센터 조문](https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033063629) (법률 제21595호, 시행 2026. 10. 29.)
- Google Play 이용약관 제4절 — [play.google.com/about/play-terms](https://play.google.com/about/play-terms/index.html) (2026-11-08 열람)
- 원본 X 포스트 — [@kangyou82, 2026-11-07 13:00 KST](https://x.com/kangyou82/status/2118916471275639019)
