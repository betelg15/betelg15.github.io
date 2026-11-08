---
title: "한 줄이면 패스트레이싱? Tesseract 팩트 체크"
date: 2026-11-08
time: "11:22"
slug: tesseract-agent-creative-suite
tags: [Tesseract, Mirage, 3D, 패스트레이싱, Agent Skills, 팩트체크]
summary: "mirage-hq/Tesseract 공개본은 스킬과 문서다. v0.6.0 웹 ZIP은 WASM 런타임이고, manifest의 sourceCommit은 공개 저장소 API에 없다. 패스트레이싱은 기본 렌더가 아니고, 연 매출 100만 달러 이상 사업자의 상업적 사용은 약관이 별도 계약을 요구한다."
---

> 이 글은 제가 X에서 북마크해 둔 [@naka_1717의 포스트](https://x.com/naka_1717/status/2118899440715276357)를 계기로 썼습니다. 작성자 표시 이름은 ためトラ｜AI×個人開発, `screen_name`은 `naka_1717`입니다. `created_at`은 `Sat Nov 07 02:52:48 +0000 2026`, **2026-11-07 11:52 KST**입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2118899440715276357)(`code` 200)으로 읽었습니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-08(KST)에 읽은 1차 자료입니다.
>
> - 공개 저장소 [mirage-hq/Tesseract](https://github.com/mirage-hq/Tesseract), 클론 HEAD `f8a6caa07c90986a256838763b02484ddd56c580` (2026-11-06 15:35:29 -0500 → **2026-11-07 05:35 KST**, "Update README (#28)")
> - 그 트리의 `README.md`, `LICENSE`/`TERMS.md`, `THIRD_PARTY_NOTICES.md`, `plugin.json`, `skills/*/SKILL.md`, `skills/tesseract-3d/references/`
> - [GitHub REST API](https://api.github.com/repos/mirage-hq/Tesseract) (2026-11-08 11:18 KST, 응답 `Date: Sun, 08 Nov 2026 02:18:22 GMT`)
> - 릴리스 [v0.6.0](https://github.com/mirage-hq/Tesseract/releases/tag/v0.6.0)와 그 `release-manifest.json`. 이 글이 받아 연 것은 웹 런타임 ZIP뿐이다
> - 제품 페이지 [mirage.app/tesseract](https://mirage.app/tesseract), [패스트레이싱 가이드](https://mirage.app/tesseract/guides/path-tracing), [v0.5.0 업데이트](https://mirage.app/tesseract/updates/3d-and-path-tracing), [기능 목록](https://mirage.app/tesseract/features), [설치](https://mirage.app/tesseract/install), [호스티드 설정](https://mirage.app/tesseract/docs/hosted-setup)
> - 변환기 [mirage-hq/Tesseract-Converter](https://github.com/mirage-hq/Tesseract-Converter) README·LICENSE
>
> 이 글은 `npx skills add`를 실행하지 않았고, `tsrct`로 프레임을 렌더하지 않았으며, 약 140MB인 플랫폼 CLI ZIP은 열지 않았습니다. 약관 문장을 법률 자문으로 읽지 않습니다.

## 왜 중요한가

에이전트에게 영상을 맡긴다는 말은 요즘 두 갈래로 갈립니다. 하나는 영상 모델이 프레임을 생성하는 갈래이고, 다른 하나는 이미 있는 편집 개념(레이어, 키프레임, 합성, 오디오)을 에이전트가 조작하는 갈래입니다. Tesseract는 후자를 네이티브 프로젝트로 밀고, 그 위에 v0.5.0에서 편집 가능한 3D와 패스트레이싱을 올렸습니다.

개발자가 확인할 질문은 슬로건보다 다음입니다.

- GitHub에 있는 것이 렌더러 소스인가, 스킬과 다운로드 안내인가.
- `npx skills add mirage-hq/Tesseract` 한 줄이 엔진까지 설치하는가. 어느 에이전트에서 그 경로가 기본인가.
- 패스트레이싱이 기본 출력인가. RT 코어가 필요한가. 브라우저에서 실시간으로 도나.
- “무료”가 라이선스 조건 없는 사용인가, 다운로드 가격이 0인 사용인가.

## 기술 설명

### 저장소에 있는 것과 없는 것

README가 제품을 두 조각으로 나눕니다.

| 조각 | README가 적은 역할 |
|---|---|
| Skills | 에이전트에게 영상, 모션, 3D를 편집하는 방법을 가르친다 |
| CLI `tsrct` | 에이전트가 이걸로 프로젝트를 만들고, 고치고, 렌더한다 |

클론한 트리에는 `skills/` 다섯 개(`tesseract-video`, `tesseract-motion`, `tesseract-3d`, `tesseract-design`, `tesseract-editor`), `docs/`, `player/`, `LICENSE`, `TERMS.md`, `THIRD_PARTY_NOTICES.md`가 있습니다. `*.rs`, `*.cpp`, `Cargo.toml`은 없습니다. 스키마 파일도 없습니다. 3D 스킬은 필드 이름을 추측하지 말고 설치된 CLI의 `tsrct project schema`에서 찾으라고 적습니다. 그 스키마는 바이너리가 찍어 주는 출력입니다.

`player/index.html`은 `.tsrct`를 브라우저에서 재생합니다. `player/app.js`는 `./runtime/web_api.js`를 불러 `TesseractEngine.create`를 호출합니다. `player/.gitignore`는 `runtime/`입니다. 그 런타임은 저장소에 없고, 릴리스 자산 `tesseract-0.6.0-web.zip`에 있습니다.

2026-11-08에 받은 v0.6.0 웹 ZIP(GitHub 자산 크기 **20,562,706**바이트)을 열면 파일은 7개입니다.

| 경로 | 크기 |
|---|---:|
| `TERMS.md` | 61,363 |
| `THIRD_PARTY_NOTICES.md` | 5,472 |
| `manifest.json` | 139 |
| `runtime/web_api.js` | 170,411 |
| `runtime/web_api.d.ts` | 8,232 |
| `runtime/web_api_bg.wasm` | 57,866,732 |
| `runtime/web_api_bg.wasm.d.ts` | 5,133 |

WASM과 JS, 타입 선언, 약관입니다. Rust 소스, `licenses/`, `sources/`는 이 ZIP에 없습니다. 같은 ZIP의 `manifest.json`은 이렇습니다.

```json
{
  "version": "0.6.0",
  "sourceCommit": "023251bf2f6e5546f38d68854d2193f061bca53d",
  "buildRun": "42226443798",
  "buildAttempt": "1"
}
```

공개 저장소 커밋 API에 이 SHA를 물으면 HTTP **422**, `No commit found for SHA`입니다. 같은 저장소의 Actions run `42226443798`는 HTTP **404**입니다. 공개 HEAD `f8a6caa`와 런타임이 적는 `sourceCommit`은 다른 커밋이고, 후자는 이 공개 저장소에서 조회되지 않습니다. 어느 비공개 저장소의 커밋인지는 이 글이 확인하지 못했습니다.

플랫폼 CLI는 또 다른 ZIP입니다. v0.6.0 릴리스 노트는 플랫폼 ZIP을 받고 SHA-256을 맞춘 뒤 설치하라고 적고, FFmpeg를 LGPL 2.1 이상으로 쓴다고 적습니다. 노트는 각 CLI ZIP 안에 `THIRD_PARTY_NOTICES.md`, `licenses/`, 대응하는 서드파티 소스와 FFmpeg 빌드 안내가 `sources/`에 들어 있다고 적습니다. 자산 크기는 API 기준 darwin-arm64 **134,971,042**, darwin-x86_64 **139,993,197**, linux-x86_64 **140,230,960**, windows-x86_64 **172,390,297**바이트입니다. 이 글은 그 네 ZIP을 열지 않았습니다.

저장소 `THIRD_PARTY_NOTICES.md`가 패키징을 이렇게 적습니다. FFmpeg는 LGPL 2.1+, GPL과 nonfree 컴포넌트는 껐다. 오디오 인코더는 FDK-AAC이고, 그 라이선스는 특허 라이선스를 주지 않는다. 패스트레이서의 디노이저는 Intel Open Image Denoise `rt_hdr_alb_nrm` 2.5.1 가중치인데 번들에 없고, 렌더가 디노이저를 처음 쓸 때 Captions CDN에서 `models/oidn_rt_hdr_alb_nrm.oidn-2.5.1.tza`를 받는다. 가중치 라이선스는 Apache-2.0이다. `personMatte`도 가중치를 같은 CDN에서 받는다.

### 라이선스

`LICENSE`와 `TERMS.md`는 바이트 단위로 같습니다. 첫 줄은 “Last Updated on September 21, 2026.”이고, 당사자는 **Mirage US LLC**입니다. GitHub API `license.spdx_id`는 **`NOASSERTION`**, `license.name`은 **Other**입니다. OSI 라이선스 식별자가 아닙니다.

2.2.1은 약관 준수를 조건으로, 비독점·제한적·철회 가능한 로열티 프리 라이선스를 줍니다. 개인, 비영리, 교육, 정부, 직업적 사용과 상업적 사용이 적혀 있고, 2.2.2가 금지하는 범위와 2.2.3의 매출 조건을 같이 받습니다.

2.2.2는 이 플러그인으로 Tesseract 플러그인(그 렌더링 엔진과 기능을 포함)을 대체하거나 경쟁하는 제품·서비스를 만들 권리를 주지 않는다고 적습니다. 그 용도는 `sales@mirage.app`의 별도 서면 계약으로 넘기라고 적습니다. 3.1.1(m)은 디컴파일, 리버스 엔지니어링, 소스 도출을 금지 행위로 적습니다. 같은 저장소의 서드파티 고지는, 그 고지가 LGPL이 허용하는 FFmpeg 수정과 디버깅 목적의 리버스 엔지니어링을 제한하지 않는다고 적습니다. 엔진 약관과 FFmpeg의 LGPL은 범위가 다릅니다.

2.2.3의 문장은 이렇습니다. 연 매출이 **US$1,000,000** 이상인 영리 사업(개인 사업자 포함, 지배 관계의 회사를 합산)의 **Commercial Use**는, Mirage가 서명한 별도 서면 계약이 없으면 이 약관의 라이선스가 허락하지 않습니다. Commercial Use에는 사업 운영, 내부 개발, 테스트, 평가, 마케팅, 유료 서비스, 클라이언트 수주 작업이 포함된다고 적습니다. 개인이 고용주나 클라이언트와 무관하게 하는 비사업 프로젝트, 그리고 기관 자신의 목적의 비영리·교육·정부 활동은 이 매출 제한의 적용 밖이라고 적습니다. 2.2.4는 입력과 출력을 이용자 쪽으로 둡니다.

이 절은 법률 자문이 아닙니다. 조건의 적용 여부는 약관 본문과 각자의 사실관계로 판단할 일입니다.

### 설치와 에이전트

README의 권장 경로는 ChatGPT 플러그인입니다. 스킬을 ChatGPT에 넣고 자동으로 갱신하며, 추가 기능을 위해 선택적으로 로그인하는 MCP가 있다고 적습니다. Claude 플러그인은 “Coming soon”이고, 그 전까지는 다른 에이전트 절차를 쓰라고 적습니다.

다른 에이전트의 본문은 채팅에 설치 문장을 붙이는 것입니다. 터미널 명령은 접힌 대체 경로이고, Node.js가 필요하다고 적습니다.

```sh
npx skills add mirage-hq/Tesseract
```

그 명령은 스킬을 넣는 줄입니다. CLI 바이너리는 스킬의 `install-cli.md`가 따로 받게 합니다. 받을 버전은 `skills/tesseract-video/references/cli-version.txt`의 **0.6.0**이고, 루트 `plugin.json`과 `.claude-plugin/plugin.json`의 `version`도 0.6.0입니다. 파일 이름은 `tesseract-<VERSION>-<PLATFORM>-<ARCH>.zip`과 같은 이름의 `.sha256`입니다. 플랫폼 토큰은 `darwin-arm64`, `darwin-x86_64`, `windows-x86_64`, `linux-x86_64`입니다. 설치 스크립트는 sudo, Rust, Homebrew, Node를 요구하지 않는다고 적습니다. Node가 필요한 것은 위의 `npx` 경로입니다.

배지 alt 텍스트는 “Works in ChatGPT, Codex, Claude Code, and Cursor”입니다. 텔레메트리 문서가 허용하는 `TESSERACT_HOST` 값도 `chatgpt`, `codex`, `claude`, `cursor`입니다. [설치 페이지](https://mirage.app/tesseract/install)는 ChatGPT Mobile, ChatGPT와 Codex, Claude와 Claude Code, Muse, Grok Bot, Instinct, 그리고 Mac·Windows·호환 Linux에서 직접 실행을 고르게 합니다. Muse, Grok Bot, Instinct는 각각 [전용 페이지](https://mirage.app/tesseract/muse)가 있습니다. [호스티드 설정](https://mirage.app/tesseract/docs/hosted-setup)은 ChatGPT Mobile, Muse, Grok Bot, Instinct를 적고, 호스트가 x86_64와 glibc 2.35 이상이어야 한다고 적습니다.

설치된 명령 경로는 문서 기준 macOS `~/Library/Application Support/Tesseract/bin/tsrct`, Windows `%LOCALAPPDATA%\Tesseract\bin\tsrct.cmd`, Linux `${XDG_DATA_HOME:-$HOME/.local/share}/Tesseract/bin/tsrct`입니다.

텔레메트리는 릴리스에서 기본으로 켜져 있고, `tsrct telemetry disable`로 끕니다. 문서가 적는 수집 항목은 명령, CLI 버전, OS, 아키텍처, 선택 속성, 이벤트·실행·설치의 임의 ID, 성공 여부와 소요 시간입니다. `project.create`, `export`, `preview`, `filmstrip`만 이벤트를 내고, 프롬프트·파일 이름·경로·원문 인자는 보내지 않는다고 적습니다. 제품 FAQ는 로컬 Tesseract 사용에 Mirage 계정이 필요 없다고 적습니다.

### `.tsrct` 한 파일

다섯 스킬이 하나의 `.tsrct`를 공유한다고 README가 적습니다. 영상 스킬은 새 문서를 `tsrct project create`로 만들고, 기존 문서는 `project checkout`으로 편집용 JSON을 꺼낸 뒤 `project commit`이나 `project apply`로 되돌린다고 적습니다. `local-operation.md`는 `.tsrct`를 텍스트로 고치지 말라고 적습니다. `versions.md`는 저장 파일을 아카이브로 부르고, 그 안의 `metadata.json`에서 `formatVersion`, 선택적 `fxSchemaVersion`, `generator.name` / `version` / `engineVersion` / 선택적 `gitRevision`을 읽으라고 적습니다. `project inspect`가 돌려주는 것은 이 메타데이터가 아니라 편집용 프로젝트 JSON입니다.

문서 안에 이미지, 폰트, 클립, 모델이 포장됩니다. 레이어와 키프레임, 오디오는 그 문서의 편집 요소입니다. 영상 스킬은 “not avatar or video generation”이라고 못 박고, 지어낸 음성과 캡션을 만들지 말라고 적습니다. v0.5.0 업데이트 FAQ도 “내장 텍스트-투-3D 모델이냐”에 No라고 답합니다. 에이전트가 지원되는 지오메트리를 쓰거나 가져온 모델을 다루고, Tesseract는 편집과 렌더 컨트롤을 제공한다는 문장입니다.

### 패스트레이싱

3D 스킬은 사실적인 조명, 반사, 굴절에는 패스트레이서를 우선하고, 스타일과 레이아웃·동작 확인에는 래스터를 쓰라고 적습니다. `scene3d-basics.md`의 기본값은 플래그가 없으면 `raster`입니다.

```sh
tsrct project create --project scene.tsrct
tsrct preview --project scene.tsrct --time 2 --output frame.png \
  --renderer path-tracer --samples 16
tsrct export --project scene.tsrct --output scene.mp4 \
  --renderer path-tracer --json
```

위 줄은 스킬 문서의 명령입니다. 이 글은 실행하지 않았습니다. 렌더러는 문서에 저장되는 값이 아니라 명령 플래그이고, 그 명령이 그리는 모든 Scene3D 레이어에 적용된다고 적습니다. 프리뷰와 초안은 `--samples 16`과 디노이징, 최종 리뷰는 `--samples`를 생략한 기본 **128**을 시도하라고 적습니다. 공개 [패스트레이싱 가이드](https://mirage.app/tesseract/guides/path-tracing)는 초안 실험으로 **32**샘플, 비교 기준으로 기본 128을 적습니다. 기본 128은 같고, 초안 샘플 수는 스킬 문서와 가이드가 다릅니다.

같은 스킬 문단이 적는 차이입니다. 패스트레이서는 얇은 물체를 빛이 가로지르는 랜덤 워크로 서브서페이스를 계산한다. 점이 없는 포인트·스폿·선(sun) 조명은 거친 유리와 굴절 고체를 직선으로 통과한 빛으로 그림자를 만들고, 프리즘이 벽에 무지개를 던지지 않는다. 면광과 반지름이 있는 조명은 굴절된 경로로만 유리 너머에 닿는다. 투명 배경 위의 유리는 덮인 곳이 불투명한 커버리지라서, 그 뒤에 합성한 푸티지는 굴절되지 않는다. 굴절이 필요하면 푸티지를 씬 안에 넣으라고 적습니다. 패스 트레이서가 실패하면 래스터로 조용히 바뀌지 않고 실패한다고 적습니다.

가이드 FAQ는 패스트레이서가 **GPU 컴퓨트**로 돌고, 전용 RT 코어나 Apple 하드웨어 레이트레이싱 API를 쓰지 않는다고 적습니다. v0.5.0 업데이트 FAQ도 전용 하드웨어 레이트레이싱 API가 필요 없고, 오프라인 렌더이며 브라우저 실시간 재생이 아니라고 적습니다. 스킬은 하드웨어 GPU가 없으면 훨씬 느리다고 적고, 브라우저와 iOS 재생은 CLI가 패스트레이서로 뽑았어도 래스터라고 적습니다. Linux 문서는 물리 GPU 없이 Mesa lavapipe로 소프트웨어 렌더가 가능하다고 적습니다. GPU 컴퓨트가 기본 설명이고, CPU 폴백은 Linux 문서에 따로 있습니다.

가이드는 v0.5.0에서 Metal로 패스트레이싱할 때 유리, 서브서페이스, 이리데슨스 일부 머티리얼이 컴파일에 실패할 수 있다고 적습니다. 그 문장은 클론한 스킬 마크다운에서 찾지 못했습니다. v0.6.0 릴리스 본문은 체크섬과 약관, FFmpeg만 적고 이 제한의 수정 여부를 말하지 않습니다. 그래서 0.6.0에서 그 Metal 실패가 남았는지는 이 글이 확인하지 못했습니다.

지원 OS는 설치 문서와 v0.6.0 매니페스트가 같이 말합니다. macOS arm64와 x86_64, 64비트 Windows 10 이상, Linux x86_64(glibc 2.35 이상). Linux 런타임은 zlib, ALSA, libstdc++, Vulkan 로더와 호환 드라이버를 호스트에 요구하고, H.264 인코더는 번들에 없습니다. MP4는 외부 FFmpeg를 지정합니다.

```sh
tsrct export --project project.tsrct --output output.mp4 \
  --encoder-backend external-ffmpeg-command \
  --ffmpeg-path /absolute/path/to/ffmpeg
```

v0.1.0 릴리스 자산에는 Linux ZIP이 없고, Linux는 v0.2.0 노트(게시 2026-09-23T04:48:51Z)가 “Linux support”라고 적은 뒤 자산에 나타납니다. v0.6.0 매니페스트에 `linux-aarch64`는 없습니다.

Blender와의 관계는 “설치가 필요 없다”와 “기능이 같다”가 다릅니다. 3D 스킬은 `.blend`와 glTF를 가져오고, 블렌더 용어를 Tesseract 컨트롤로 옮기는 표를 둡니다. 그 표에서 Cycles에 대응하는 것은 `--renderer path-tracer`이고, Eevee에 대응하는 것은 기본 `raster`입니다. 드라이버와 컬렉션은 대응이 없고, Geometry Nodes는 산란만 대응이 있으며 그 밖 노드 트리는 없다고 적습니다. 천 모디파이어는 `.blend`에서 가져오지 않는다고 적습니다. 업데이트 페이지는 “Partial Blender import does not preserve every modifier, material or simulation.”이라고 적습니다.

After Effects는 제품 문장과 변환 범위가 다릅니다. 홈페이지는 Premiere나 After Effects를 열지 않고 에이전트가 편집·렌더할 수 있다고 적고, 기능 페이지는 지원이 부분적이며 After Effects 보내기는 실험적이라고 적습니다. 변환기는 별도 저장소 [Tesseract-Converter](https://github.com/mirage-hq/Tesseract-Converter)의 `tsrct-conv`입니다. 그 README 표는 Premiere `.prproj`가 양방향 Partial, After Effects `.aep`가 Adobe→TSRCT Partial, TSRCT→Adobe Experimental입니다. 그 저장소 LICENSE는 MIT이고, API `license.spdx_id`도 **MIT**입니다(2026-11-08 조회, 별 5). README는 개발의 원본이 [`bungeeapp/jerboa`](https://github.com/bungeeapp/jerboa)의 `opensource/conv/`이고 공개 저장소는 다운스트림 미러라고 적습니다. 이 글은 jerboa 트리를 열지 않았습니다. 렌더러 `tsrct`의 약관과 변환기 저장소의 MIT는 다른 라이선스입니다.

## 비즈니스 인사이트

숫자와 문서 내용은 문장 옆에 출처를 붙입니다. 그 밖의 판단은 **분석/의견**입니다. Mirage의 매출, 기업 가치, Captions의 실제 이용자 수는 이 글이 확인한 1차 자료에 없어 적지 않습니다. 홈페이지의 “millions of videos”와 “millions of users”는 Mirage가 적은 문장입니다.

**무엇이 공개됐고 무엇이 무료인가.** 공개된 GitHub 트리는 스킬, 문서, 약관, 플레이어 껍질입니다. 렌더 엔진은 v0.6.0 웹 ZIP 기준으로 WASM 바이너리이고, 그 빌드가 적는 커밋은 공개 저장소 API에 없습니다. 제품 페이지는 로컬 엔진의 프리뷰와 렌더에 요금을 매기지 않는다고 적고, 에이전트 구독료는 별도라고 적습니다. 약관 2.2.3은 연 매출 100만 달러 이상 영리 사업의 상업적 사용을 별도 계약 뒤로 보냅니다. **분석/의견.** “무료 오픈소스 3D 툴”로 읽으면 문서와 어긋납니다. 다운로드 가격이 0인 범위와, 소스를 포크해 경쟁 렌더러를 만들 권리는 약관이 나눠 놓습니다.

**옆의 도구가 여는 권리는 다릅니다.** [Blender 라이선스 페이지](https://www.blender.org/about/license/)는 Blender를 GPL로 두고, 어떤 목적으로든 사용할 수 있으며 결과 이미지·영상·`.blend`는 만든 사람의 것이라고 적습니다. 같은 페이지는 Cycles 엔진 모듈이 Apache 2.0이라고 적습니다. [Cycles GPU 문서](https://docs.blender.org/manual/en/latest/render/cycles/gpu_rendering.html)(매뉴얼이 표시한 Blender 5.2 LTS)는 NVIDIA OptiX가 RTX 카드의 하드웨어 레이트레이싱 가속을 쓴다고 적고, AMD HIP과 Intel oneAPI, Apple Silicon Metal에도 하드웨어 레이트레이싱 지원을 적습니다. Tesseract 가이드는 자기 패스트레이서가 그 API를 쓰지 않는 GPU 컴퓨트라고 적습니다. [three.js LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE)는 MIT이고 저작권 표기는 2010–2026 three.js authors입니다. three.js는 브라우저용 3D 라이브러리이고, Tesseract 홈페이지 FAQ는 HTML이나 React로 영상을 표현하는 도구와 자기 프로젝트 모델이 다르다고 적습니다. Three.js라는 이름은 그 FAQ 문장에 없습니다.

[Remotion 약관 v5.0](https://www.remotion.dev/docs/terms)은 개인, 그리고 3명 이하 조직의 Free License를 적습니다. 그에 해당하지 않으면 Company License입니다. Remotion for Creators는 시트당 월 **$25**, Remotion for Automators는 렌더당 **$0.01**에 월 최소 **$100**, Enterprise 최소는 월 **$500**이라고 같은 약관이 적습니다. `remotion-dev/remotion`의 API `license.spdx_id`도 `NOASSERTION`이고, 2026-11-08 11:18 KST 조회의 `stargazers_count`는 **71,524**입니다. **분석/의견.** 둘 다 “작은 팀은 무료, 큰 조직은 계약”에 가깝지만 축이 다릅니다. Remotion 약관은 인원 수이고, Tesseract 약관은 연 매출 100만 달러입니다. 네 명인 소규모 스튜디오와, 혼자지만 매출이 그 선을 넘는 사업자는 두 문서에서 서로 다른 쪽에 섭니다.

After Effects는 Adobe의 모션 그래픽 제품입니다. 이 글이 연 [제품 페이지](https://www.adobe.com/products/aftereffects.html) HTML에는 가격 숫자가 채워져 있지 않아, 구독료는 적지 않습니다. Tesseract가 그 제품을 대체한다고 변환기 README가 말하지는 않습니다. 왕복은 Partial과 Experimental입니다.

**누가 이 조합을 쓰게 되는가.** (1) Blender를 상시로 띄우거나 Remotion 앱을 유지하지 않고, 에이전트에게 레이어·키프레임·짧은 3D 샷을 맡기려는 사람. 네이티브 메쉬와 카메라, 라이트는 스킬 레시피에 있습니다. (2) 매출 조건 안에서 로컬 렌더 요금이 0인 엔진을 원하는 사람. 에이전트 사용료는 남습니다. (3) Premiere 프로젝트를 부분적으로 `.tsrct`로 옮기려는 사람. 변환기 README의 표가 Partial입니다. **분석/의견.** 소스 감사, 렌더러 포크, 카우스틱·멀티레이어 EXR, After Effects 왕복의 완전성, Linux ARM 호스트를 필요로 하는 쪽은 이 공개 산출물이 그 필요를 채우지 않습니다. 스킬은 EXR·Cryptomatte·깊이 패스가 없다고 적고, 가이드는 멀티레이어 EXR/AOV가 이 워크플로에 없다고 적습니다.

**도입에서 남는 일.** 스킬을 넣어도 CLI ZIP의 체크섬 확인, Linux라면 Vulkan과 외부 FFmpeg, 패스트레이싱이라면 샘플 수와 디노이저 가중치 다운로드가 남습니다. 첫 디노이즈 렌더는 Captions CDN을 봅니다. 텔레메트리는 기본 켜짐이고 opt-out이 있습니다. **분석/의견.** 에이전트 작업으로 바뀌는 부분은 메뉴를 누르는 시간이고, 바뀌지 않는 부분은 샷의 승인, 라이선스 적격, 긴 오프라인 렌더의 시간입니다. 가이드는 대표 프레임을 재고 나서 전체 보내기를 잡으라고 적습니다. 렌더 시간의 보장은 그 페이지에 없습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·시점·문서 간 차이가 있음 / ❌ 1차 자료와 어긋남

원본 X([@naka_1717](https://x.com/naka_1717/status/2118899440715276357), 2026-11-07 11:52 KST)의 문장과, 이 글에 요청된 확인 항목을 README·스킬·약관·릴리스·제품 페이지와 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| Blender 환경 없이 3D 영상을 만들 수 있다 | ⚠️ | 네이티브 메쉬·카메라·라이트는 `.blend` 없이 스킬이 작성합니다. `.blend` 임포트는 선택입니다. 스킬 표는 천 모디파이어를 가져오지 않고, 드라이버·컬렉션은 대응이 없으며, Geometry Nodes는 산란만 대응이라고 적습니다. 업데이트 페이지는 모든 모디파이어·머티리얼·시뮬레이션이 보존되지는 않는다고 적습니다. |
| Three.js 환경이 필요 없다 | ✅ | 저장소와 설치 문서에 Three.js 의존이 없습니다. 프로젝트는 `.tsrct`이고 CLI/WASM이 렌더합니다. 홈페이지 FAQ는 HTML·React 영상 도구와 다른 모델이라고 적습니다. |
| 에이전트가 3D 영상을 출력할 수 있다 | ✅ | `tesseract-3d` 스킬과 `--renderer path-tracer` 또는 기본 래스터로 `preview`/`export`. 텍스트-투-3D나 푸티지 생성 모델은 아니라고 업데이트 FAQ와 영상 스킬이 적습니다. |
| GitHub에 공개되어 있다 | ✅ | `mirage-hq/Tesseract`는 public입니다. 공개된 것은 스킬·문서·약관·플레이어 껍질과 릴리스 ZIP입니다. |
| (부가) 렌더 엔진 소스가 그 저장소의 오픈소스다 | ❌ | 클론에 엔진 소스가 없습니다. v0.6.0 웹 ZIP은 WASM 57,866,732바이트와 JS입니다. `manifest.sourceCommit` `023251bf…`는 공개 커밋 API 422입니다. SPDX는 `NOASSERTION`. 약관은 경쟁 제품과 리버스 엔지니어링을 제한합니다. |
| 11/7 시점 별 227개 | ⚠️ | 2026-11-08 11:18 KST API `stargazers_count`는 **277**, 포크 19, 열린 이슈 3입니다. 스타 시각 API는 인증 없이 HTTP 401이라, 11/7 02:52 UTC에 227이었는지는 이 환경에서 확인하지 못했습니다. |
| 레이어, 키프레임, 소리를 하나의 로컬 프로젝트로 잇는다 | ✅ | README와 `plugin.json`. 다섯 스킬이 하나의 `.tsrct`를 공유합니다. 오디오는 `import-asset --kind audio`와 오디오 레이어. 계정 없이 로컬 사용이 가능하다고 FAQ가 적습니다. 디노이저 가중치와 기본 텔레메트리는 네트워크를 씁니다. |
| 패스트레이싱으로 반사와 굴절을 계산한다 | ⚠️ | 패스트레이서는 반사·굴절을 계산한다고 스킬과 가이드가 적습니다. 기본 렌더는 `raster`이고 플래그가 필요합니다. 스킬은 점광 계열의 카우스틱이 없고, 투명 배경 뒤 푸티지는 굴절되지 않는다고 적습니다. 가이드는 v0.5.0 Metal에서 일부 유리 머티리얼 컴파일 실패를 적습니다. |
| (부가) GPU 컴퓨트이고 RT 코어가 필요 없으며 오프라인 전용이다 | ✅ | [패스트레이싱 가이드](https://mirage.app/tesseract/guides/path-tracing)와 [v0.5.0 업데이트](https://mirage.app/tesseract/updates/3d-and-path-tracing). 브라우저·iOS 재생은 래스터. Linux는 lavapipe 소프트웨어 렌더를 문서로 허용합니다. |
| After Effects의 세밀한 컴포짓을 에이전트에 넘기도록 만들어졌다 | ⚠️ | 에이전트용 편집·합성이 제품 문장입니다. After Effects 변환은 Partial, 보내기는 Experimental이라고 변환기 README와 기능 페이지가 적습니다. |
| 설치는 `npx skills add mirage-hq/Tesseract` 한 줄이다 | ⚠️ | README에 그 명령이 있고 Node.js가 필요하다고 적습니다. 권장 경로는 ChatGPT 플러그인입니다. Claude 플러그인은 Coming soon입니다. 그 줄은 스킬이고, `tsrct` ZIP·체크섬·플랫폼 설치는 그 다음입니다. |
| (부가) 무료다 | ⚠️ | 제품 페이지는 로컬 엔진의 프리뷰·렌더가 무료이고 에이전트 비용은 별도라고 적습니다. 약관 2.2.3은 연 매출 100만 달러 이상 영리 사업의 상업적 사용에 별도 서면 계약을 요구합니다. |
| (부가) macOS, Windows, Linux | ✅ | 배지와 `install-cli.md`, v0.6.0 매니페스트. Linux는 x86_64, glibc 2.35 이상. aarch64 자산은 매니페스트에 없습니다. |
| (부가) 텍스트-투-3D 모델이다 | ❌ | v0.5.0 업데이트 FAQ: “Is this a built-in text-to-3D model? No.” |

**총평:** X가 말한 공개 GitHub 프로젝트, 로컬 `.tsrct` 안의 레이어·키프레임·소리, 에이전트를 통한 3D 출력, `npx skills add mirage-hq/Tesseract`라는 명령은 1차 자료에 있습니다. 그 저장소가 렌더 엔진의 오픈소스는 아닙니다. 패스트레이싱은 기본값이 아니고, RT 코어를 쓰지 않는 오프라인 GPU 컴퓨트라고 공식 가이드가 적습니다. 별 227은 이 글의 API 시점(277)과 다르고, 11/7의 227 자체는 스타 시각을 받지 못해 확정하지 못했습니다. “무료”는 로컬 엔진 요금이 없다는 제품 문장과, 연 매출 100만 달러 이상 사업자의 상업적 사용을 빼 두는 약관이 같이 있습니다.

## 참고 자료

- 저장소 — [mirage-hq/Tesseract](https://github.com/mirage-hq/Tesseract) (클론 `f8a6caa07c90986a256838763b02484ddd56c580`. API 2026-11-08 11:18 KST: 별 277, 포크 19, 이슈 3, `license.spdx_id` `NOASSERTION`, 생성 2026-09-16T14:52:54Z, `pushed_at` 2026-11-06T20:35:32Z)
- 약관 — 저장소 [LICENSE](https://github.com/mirage-hq/Tesseract/blob/f8a6caa07c90986a256838763b02484ddd56c580/LICENSE) / [TERMS.md](https://github.com/mirage-hq/Tesseract/blob/f8a6caa07c90986a256838763b02484ddd56c580/TERMS.md) (동일 파일, Last Updated September 21, 2026, Mirage US LLC). 웹 ZIP 안의 `TERMS.md`도 저장소 파일과 바이트가 같았습니다
- 서드파티 — [THIRD_PARTY_NOTICES.md](https://github.com/mirage-hq/Tesseract/blob/f8a6caa07c90986a256838763b02484ddd56c580/THIRD_PARTY_NOTICES.md) (FFmpeg LGPL 2.1+, FDK-AAC, OIDN 2.5.1 가중치의 Captions CDN 다운로드)
- README — 설치, 스킬 다섯 개, `.tsrct`, ChatGPT 플러그인, `npx skills add`
- 스킬 — `skills/tesseract-3d/SKILL.md`, `references/scene3d-basics.md`(렌더러 플래그, 샘플, 카우스틱), `references/scene3d-blender.md`, `references/install-cli.md`, `references/versions.md`, `references/telemetry.md`, `references/cli-version.txt` (`0.6.0`)
- 릴리스 — [v0.6.0](https://github.com/mirage-hq/Tesseract/releases/tag/v0.6.0) (게시 2026-11-06T13:53:41Z), [v0.5.0](https://github.com/mirage-hq/Tesseract/releases/tag/v0.5.0) (게시 2026-11-03T15:36:02Z), [v0.2.0](https://github.com/mirage-hq/Tesseract/releases/tag/v0.2.0) (Linux). 이 글이 연 웹 ZIP `manifest.json`의 `sourceCommit` `023251bf2f6e5546f38d68854d2193f061bca53d`
- 제품 — [tesseract](https://mirage.app/tesseract), [path tracing](https://mirage.app/tesseract/guides/path-tracing), [v0.5.0 3D](https://mirage.app/tesseract/updates/3d-and-path-tracing), [features](https://mirage.app/tesseract/features), [install](https://mirage.app/tesseract/install), [hosted setup](https://mirage.app/tesseract/docs/hosted-setup)
- 변환기 — [mirage-hq/Tesseract-Converter](https://github.com/mirage-hq/Tesseract-Converter) (MIT, `tsrct-conv`, Premiere Partial, After Effects export Experimental)
- 비교 대상 — [Blender license](https://www.blender.org/about/license/), [Cycles GPU](https://docs.blender.org/manual/en/latest/render/cycles/gpu_rendering.html), [three.js LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE), [Remotion terms v5.0](https://www.remotion.dev/docs/terms), [remotion-dev/remotion](https://github.com/remotion-dev/remotion) (API 2026-11-08 11:18 KST: 별 71,524, SPDX `NOASSERTION`)
- 원본 X — [@naka_1717, 2026-11-07 11:52 KST](https://x.com/naka_1717/status/2118899440715276357)
