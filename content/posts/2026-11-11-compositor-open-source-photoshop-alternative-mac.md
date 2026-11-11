---
title: "12MB면 포토샵인가? Compositor 팩트 체크"
date: 2026-11-11
time: "09:23"
slug: compositor-open-source-photoshop-alternative-mac
tags: [Compositor, Swift, Metal, Photoshop, MCP, 팩트체크]
summary: "발표 8분 전 v1.0.4의 앱 파일 합은 11,982,494바이트이고 유니버설 바이너리다. 현재 1.6.6은 arm64 전용이고 합은 14,207,805바이트다. 2026-11-11 09:18 KST 스타는 18,591, 라이선스는 MIT다."
---

> 이 글은 제가 X에서 북마크해 둔 [@EngMoElgaraihy의 포스트](https://x.com/EngMoElgaraihy/status/2120090204673364034)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2120090204673364034](https://x.com/i/status/2120090204673364034)입니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`(`developer.billing.write` 없음)으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2120090204673364034)(`code` 200)으로 읽었습니다. `created_at`은 `Tue Nov 10 09:44:28 +0000 2026`, **2026-11-10 18:44 KST**입니다. 표시 이름은 Mo Elgaraihy, `screen_name`은 `EngMoElgaraihy`, 사용자 id는 `1759922300671975424`입니다. `lang`은 `ar`, `is_note_tweet`은 true입니다. `verification.type`은 `individual`, 팔로워는 60,379입니다. 같은 응답의 스냅샷은 답글 3, 리포스트 13, 좋아요 142, 북마크 151, 인용 0, 조회 9,571입니다. `reposted_by`는 null입니다. 첨부 영상은 1668×1080, 길이 35.136초이고, 퍼블리셔는 `@alextalksai`입니다. 영상 주소는 그 계정의 [상태 2119758600167960620](https://x.com/alextalksai/status/2119758600167960620)입니다. 읽은 시각은 2026-11-11 09:14 KST 무렵입니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 아랍어 본문이 말하는 것은 이렇습니다. 개발자 한 명이 Adobe의 가장 큰 연구·수익 부문을 무너뜨렸고, 앱 크기는 12MB뿐이다. Adobe 구독이 비싸 처음부터 만든 포토샵풍 오픈소스 편집기의 이름이 Compositor다. 개발자 기기에서 포토샵은 6,455MB다. 개인 도구로 시작해 무료 오픈소스로 공개했다. 다운로드 링크는 첫 댓글에 있다고 적습니다. 그 댓글은 이 환경에서 읽지 못했습니다.
>
> 영상이 달린 스페인어 글은 [fxtwitter의 2119758600167960620](https://api.fxtwitter.com/status/2119758600167960620)(`code` 200)입니다. `created_at`은 `Mon Nov 09 11:46:48 +0000 2026`, **2026-11-09 20:46 KST**입니다. `screen_name`은 `alextalksai`, 표시 이름은 alex, `lang`은 `es`입니다. 팔로워 38,245, 스냅샷은 답글 20, 리포스트 120, 좋아요 540, 북마크 367, 인용 0, 조회 61,957입니다. 본문은 같은 크기 주장을 스페인어로 반복하고, 포토샵 크기를 “6.455 MB”로 적습니다.
>
> 저자의 발표 글은 [fxtwitter의 2100946395972976843](https://api.fxtwitter.com/status/2100946395972976843)(`code` 200)입니다. `created_at`은 `Fri Sep 18 13:53:49 +0000 2026`, **2026-09-18 22:53 KST**입니다. `screen_name`은 `robbietilton`, 표시 이름은 Robbie Tilton, 사용자 id는 `17087250`, `location`은 California, USA, bio는 “Designer/Founder. Reinventing the computer.”입니다. 팔로워 27,775입니다. 스냅샷은 답글 1,122, 리포스트 2,190, 좋아요 20,037, 북마크 19,138, 인용 467, 조회 2,486,392입니다. 본문 영어는 “The entire app is 12MB. Photoshop is 6,455MB on my machine.”입니다. 링크는 `https://robbietilton.com/compositor`입니다.
>
> 아래 대조는 2026-11-11 09:14–09:20 KST에 연 1차 자료입니다. 소스 인용은 `main` [`02e53989`](https://github.com/robbietilton/Compositor/commit/02e53989dc499d749d83f33023ff249de1c7b4eb)(2026-11-07 17:27:10 -0800 → **2026-11-08 10:27 KST**, “Publish update feed for Compositor 1.6.6”)입니다. 크기 측정은 그 태그의 DMG와, 발표 8분 전 태그 [v1.0.4](https://github.com/robbietilton/Compositor/releases/tag/v1.0.4)의 DMG를 받아 7-Zip 23.01이 적은 논리 크기입니다. 이 호스트는 Linux라 앱을 실행하지 않았고, `brew`와 `xcodebuild`도 돌리지 않았습니다. 포토샵이 깔린 부피도 재지 않았습니다.

## 왜 중요한가

이미지 편집기를 “구독 없이, 에이전트가 파일을 써서” 붙이려는 쪽에서 막히는 자리는 슬로건이 아닙니다. 설치 파일이 작은지, 그 숫자가 지금 릴리스인지, 프로젝트를 코드가 쓸 수 있는지, 그 경로가 MCP인지, 라이선스가 제품에 넣어도 되는지가 먼저입니다.

[Compositor](https://github.com/robbietilton/Compositor)의 README 첫 문단은 “Adobe Photoshop costs too much and tools like GIMP don’t feel familiar enough”입니다. 저장소 설명은 “The Photoshop alternative for Mac”입니다. 2026-11-11 09:18 KST의 GitHub API(`Date: Wed, 11 Nov 2026 00:18:08 GMT`)는 `stargazers_count` **18,591**, `forks_count` **1,855**, `open_issues_count` **33**, `license.spdx_id` **MIT**, `language` Swift, `created_at` `2026-09-16T20:35:54Z`(2026-09-17 05:35 KST), `pushed_at` `2026-11-08T01:27:12Z`입니다. `homepage` 필드는 null입니다. 같은 시각의 [기여자 API](https://api.github.com/repos/robbietilton/Compositor/contributors?per_page=100)는 26명이고, `robbietilton`의 `contributions`는 574입니다.

확인할 질문은 다음입니다.

- “12MB”가 발표 당시의 앱 묶음인지, 지금 받는 DMG인지, 실행 파일 하나인지.
- “6,455MB”가 Adobe가 적은 설치 용량인지, 저자가 자기 맥에서 본 숫자인지.
- 요구 사항이 지금 소스의 macOS 26.0과 Apple silicon인지, 발표 바이너리도 그랬는지.
- `.comp`가 PNG 레이어와 매니페스트 폴더인지, 그 밖에도 버전이 있는지.
- 에이전트 경로가 공식 MCP인지, 파일을 쓰는 문서인지.

## 기술 설명

### 릴리스와 만든 사람 표기

최신 릴리스는 [v1.6.6](https://github.com/robbietilton/Compositor/releases/tag/v1.6.6)입니다. `published_at`은 `2026-11-08T01:27:10Z`(2026-11-08 10:27 KST)입니다. 노트 두 줄은 PNG를 열면 캔버스 이름이 파일이름이 된다는 것과, Export As가 마지막 형식을 기억하고 ⌥⇧⌘S로 열린다는 것입니다. 자산 `Compositor.dmg`는 **8,867,874**바이트이고, 2026-11-11 09:19 KST에 연 릴리스 목록에서 `download_count`는 3,141입니다. 저장소 `appcast.xml`의 `shortVersionString`도 1.6.6, `sparkle:version`은 65, `minimumSystemVersion`은 26.0, enclosure `length`는 같은 8,867,874입니다.

첫 릴리스 [v1.0](https://github.com/robbietilton/Compositor/releases/tag/v1.0)의 `published_at`은 `2026-09-16T21:57:34Z`입니다. 발표 글보다 8분 앞인 [v1.0.4](https://github.com/robbietilton/Compositor/releases/tag/v1.0.4)는 `2026-09-18T13:45:44Z`, DMG **7,399,035**바이트입니다. 릴리스 API 한 페이지(`per_page=100`, `Date: Wed, 11 Nov 2026 00:19:48 GMT`)에 릴리스는 66개이고, 그중 DMG 65개의 `download_count` 합은 **128,702**입니다. 앱캐스트의 DMG 주소가 그 릴리스 자산이므로, 이 합에는 Sparkle 자동 업데이트가 같은 파일을 다시 받은 횟수가 섞입니다. 사람 수로 나누지 않았습니다.

`LICENSE`는 MIT License이고 저작권 줄은 “Copyright (c) 2026 Wonder Assembly LLC”입니다. 번들 식별자는 `com.wonderassembly.compositor`입니다. [robbietilton.com](https://robbietilton.com/)을 2026-11-11에 읽은 본문은 디자인 스튜디오 이름을 Object Assembly라고 적고, Apple Vision Pro의 Human Interface 팀(2017–2018)과 Google[X]의 Glass(2013–2015)를 자기 이력으로 적습니다. GitHub 사용자 API의 `name`은 Robbie, `company`는 null, `blog`는 빈 문자열, `location`은 null, `twitter_username`은 null, `public_repos`는 1, `created_at`은 `2011-12-17T05:43:03Z`입니다. Apple이나 Google 페이지로 그 재직을 확인하지는 않았습니다.

### 12MB는 어느 파일인가

발표 문장의 “The entire app is 12MB”와, 지금 받는 파일을 같은 자로 재었습니다. 7-Zip이 DMG 안의 파일에 적은 `Size`를, 경로가 `Compositor.app`인 것만 더했습니다. 클러스터(1.6.6의 HFS+는 4,096바이트)로 올린 할당 크기가 아닙니다. Finder가 “디스크 상의 크기”로 보여주는 값도 아닙니다.

| 빌드 | DMG | 앱 안 파일 수의 합 | 십진 MB (`÷ 10^6`) | MiB (`÷ 2^20`) | 바이너리 |
|---|---:|---:|---:|---:|---|
| v1.0.4, 2026-09-18 13:45 UTC | 7,399,035 | 11,982,494 (66개) | 11.98 | 11.43 | 유니버설. `file`은 x86_64와 arm64 |
| v1.6.6, 2026-11-08 01:27 UTC | 8,867,874 | 14,207,805 (68개) | 14.21 | 13.55 | Mach-O arm64 하나. `cputype` `0x100000c` |

11,982,494는 12,000,000보다 17,506바이트 작습니다. 십진 메가바이트를 정수로 반올림하면 12입니다. 2^20 기준이면 11.43 MiB입니다. 1.6.6의 합 14,207,805는 그 어느 쪽으로도 12가 아닙니다.

1.6.6에서 큰 조각은 이렇습니다. 실행 파일 `Contents/MacOS/Compositor` 8,437,488바이트, `Assets.car` 1,653,064, `CameraRawTables.bin` 1,247,790, Sparkle 본체 976,464, Autoupdate 708,528, Updater 339,968, Installer.xpc 207,296, Downloader.xpc 188,928. 업데이터 쪽 바이너리 다섯의 합은 2,421,184바이트입니다. “앱 12MB”에 편집기만 들어 있는 숫자는 아닙니다.

1.0.4의 `Info.plist`는 `CFBundleShortVersionString` 1.0.4, `CFBundleVersion` 5, `LSMinimumSystemVersion` **26.5**, `DTSDKName` `macosx26.5`입니다. 1.6.6은 버전 1.6.6, 빌드 65, `LSMinimumSystemVersion` **26.0**, `DTPlatformVersion` 27.2, `DTSDKName` `macosx27.2`, `DTXcode` 2720입니다. 최소 버전은 26.5에서 26.0으로 내려 있고, 아키텍처는 유니버설에서 arm64만으로 바뀌어 있습니다. Intel 슬라이스가 어느 태그에서 빠졌는지는 태그를 이분하지 않았습니다.

받은 1.6.6 DMG의 SHA-256은 `39c764723a6379f808a9c02dbeb01e7081df6236e445250fe00fb85944665f54`입니다. [Homebrew cask JSON](https://formulae.brew.sh/api/cask/robbietilton-compositor.json)의 `sha256`과 같고, `version`은 1.6.6, `url`은 그 릴리스의 DMG입니다. `generated_date`는 2026-11-11입니다.

### 화면은 Metal이고, 픽셀 일부는 C다

[AGENTS.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/AGENTS.md)는 “written in Swift (SwiftUI and AppKit, with some C for pixel work)”라고 적습니다. 이 클론에서 `Compositor/`의 Swift는 184파일, 46,691줄입니다. `CompositorTests`와 `CompositorUITests`의 Swift 합은 20,902줄입니다. `Compositor/`의 `.c`는 3,794줄입니다. `.metal` 파일은 없습니다. 셰이더는 Swift 문자열로 컴파일합니다.

`GPUCanvas.swift`의 `GPUCanvasRenderer` 주석은, CPU의 Core Graphics가 레티나에서 전체 크기 레이어 하나에 약 5ms가 들고 드래그·팬·줌의 매 프레임마다 그렇다는 이유로 GPU 경로를 설명합니다. 레이어는 텍스처로 남고, 프레임은 다시 배치합니다. 블렌드는 선형 빛이 아니라 sRGB이고, 주석은 캔버스와 Photoshop이 그렇게 한다고 적습니다. `CIContext`는 Metal 커맨드 큐에 붙고, 작업 색 공간은 HDR용 확장 sRGB입니다. 장치나 큐가 없으면 렌더러는 nil입니다. 메모리 압박이 critical이면 텍스처를 놓고, 다음 프레임이 다시 올립니다.

같은 파일의 `texture`는 한 변이 16,384를 넘으면 nil을 반환합니다. [project-format.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/docs/project-format.md)의 캔버스 한도는 한 변 30,000픽셀입니다. 30,000픽셀 문서가 어떤 타일로 나뉘는지는 `TiledLayerRenderer.swift`를 따라 실행하지 않았습니다. 두 숫자는 한 함수의 한도가 아닙니다.

브러시 문서는 팁을 Metal 컴퓨트 커널로 긋고, 바뀐 256×256 타일만 처리한다고 적습니다. 파이프라인은 시스템 컴파일러가 한 번 만들고, Xcode의 선택적 Metal 툴체인은 필요 없다고 적습니다. Camera Raw 문서는 GPU 룩업이 실패하면 CPU 렌더러로 떨어진다고 적습니다. 레이어 효과 테스트에는 CPU와 Metal을 나란히 보는 케이스가 있습니다.

볼류메트릭 라이트의 깊이 모델은 앱에 들어 있지 않습니다. `DepthModel.swift` 주석은 Depth Anything V2 Small에서 증류한 DepthMini이고 Apache-2.0이며, torchvision의 ImageNet MobileNetV3 가중치(BSD-3-Clause)에서 시작한다고 적습니다. 첫 사용에 [depth-model-1](https://github.com/robbietilton/Compositor/releases/tag/depth-model-1)에서 받습니다. 그 릴리스 자산은 `Manifest.json` 617바이트, `model.mlmodel` 165,354, `weight.bin` 2,491,808입니다. 합은 2,657,779바이트입니다. 주석의 “2.6 MB”는 이 합을 가리키는 반올림입니다.

### `.comp`는 폴더다

`Info.plist`의 프로젝트 타입은 `com.compositor.project`, 확장자는 `comp`, `LSTypeIsPackage`와 `UTTypeConformsTo` `com.apple.package`입니다. 파인더에서는 파일처럼 보이고, 안에는 디렉터리가 있습니다.

[writing-comp-files.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/docs/writing-comp-files.md)가 보여주는 최소 묶음은 이렇습니다.

```text
Example.comp/
├── manifest.json
└── images/
    ├── 6F1D3C2A-0B7E-4E8A-9C4D-2A1B3C4D5E6F.png
    └── 6F1D3C2A-0B7E-4E8A-9C4D-2A1B3C4D5E6F.mask.png
```

문서 예제의 `format`은 `com.compositor.project`이고 `version`은 11이며, 레이어 하나의 `imageFile`·`transform`·`opacity`·`blendMode`를 포함합니다. 지금 저장이 쓰는 버전은 소스의 `ProjectManifest.current` = **21**입니다. `supported`는 1부터 21까지와, GIF 브랜치 빌드가 쓰던 **27**입니다. 주석은 15와 16을 뺀 적이 1.5.4와 1.5.5가 저장한 프로젝트를 열지 못하게 만들었다고 적습니다.

레이어 배열은 아래가 먼저입니다. 보통 픽셀은 8비트 RGBA PNG이고, 파일 이름은 레이어 UUID입니다. 마스크는 8비트 그레이스케일 PNG입니다. 문서가 이어서 적은 예외가 있습니다. 버전 12는 16비트 PNG, 13은 OpenEXR(`.exr`), 17은 GIF입니다. 조정 레이어는 `imageFile` 없이 `adjustment` 객체를 가집니다. 그룹은 이미지가 없습니다. 형식 문서의 한도는 한 변 30,000픽셀, 레이어 10,000개, 매니페스트 4 MiB, 인코드된 자산 하나 512 MiB입니다.

깨진 매니페스트는 메시지 없이 거절되고, 열려 있던 캔버스는 그대로라고 같은 문서가 적습니다. 열려 있는 동안 고치려면 PNG를 먼저 쓰고, 매니페스트는 패키지 안의 임시 파일에 쓴 뒤 `manifest.json`으로 바꿉니다. 이름 변경은 원자적이라고 적습니다.

`ProjectWatcher`는 패키지, `manifest.json`, `images/`에 `EVTONLY` 파일 디스크립터를 엽니다. 폴링이 아닙니다. `coalescing`은 **300밀리초**입니다. 문서의 문장은 “about a third of a second after writes stop”이고, 안내 문장은 “usually within half a second”입니다. 다시 읽으면 확대와 스크롤과 선택은 유지하고, 실행 취소는 비운다고 적습니다. 사람이 저장하지 않은 수정이 있으면 되돌릴지 묻습니다.

블렌드 모드 enum은 24개입니다. `Normal`부터 `Luminosity`까지이고, 주석은 메뉴 구분선을 Photoshop의 그룹 순서라고 부릅니다. `Dissolve`라는 케이스는 이 enum에 없습니다. Adobe의 블렌드 모드 목록 페이지는 열지 않았습니다. README의 “Photoshop's full set”은 그 문장이고, 소스의 개수와 같은 문장인지는 그 페이지 없이 닫지 않습니다.

PSD에 대해 README는 8비트 RGB를 읽고, CMYK는 읽지 않는다고 적습니다. 아트보드는 탭이 됩니다. 폴더, 마스크, 블렌드 모드, 채운 사각형·타원, 단순한 가로 글은 편집 상태로 남고, 그 밖의 벡터와 세로 글은 픽셀이 됩니다. 적용 전에 변환 보고서를 보여 준다고 적습니다. 이 변환을 샘플 PSD로 돌리지는 않았습니다.

### Xcode 프로젝트가 확장점이다

README의 빌드 절은 `Compositor.xcodeproj`를 열고 **Compositor** 스킴을 실행하라고 적습니다. AGENTS.md의 명령은 이렇습니다.

```bash
xcodebuild -project Compositor.xcodeproj -scheme Compositor -destination 'platform=macOS' build
```

요구 사항 절은 macOS 26.0 이상, Apple silicon, 소스 빌드에는 Xcode 26 이상입니다. `project.pbxproj`의 `MACOSX_DEPLOYMENT_TARGET`은 26.0, `ARCHS`는 `arm64`, `MARKETING_VERSION`은 1.6.6, `CURRENT_PROJECT_VERSION`은 65입니다. README는 기능을 넣거나 빼려면 이 프로젝트를 고치라고 적습니다. 플러그인 SDK 문서는 없습니다.

번역 절은 지금은 영어만이고, 번역 PR은 받지 않는다고 적습니다. 유지 인원이 한 사람이고, 읽지 못하는 언어의 번역을 검토할 수 없다는 이유입니다. 다른 OS는 저자가 검토하지 않는 포트를 링크로만 적습니다. Windows용 [CompositorWindows](https://github.com/Cengokill/CompositorWindows), Windows·Linux용 [Composa](https://github.com/dvdstelt/Composa), Linux용 [CompositorLX](https://github.com/ClaudiuJitea/compositorLX)입니다. 이 글은 그 저장소를 빌드하지 않았습니다.

### 에이전트는 파일을 쓰고, 공식 MCP는 없다

문서의 문장은 “No plugin or API is involved”입니다. 파일을 쓸 수 있는 주체면 `.comp`를 만들 수 있고, 1.3 이후에는 열어 둔 캔버스가 갱신된다고 적습니다. 안내하는 상대는 Claude Code와 Codex 같은, 맥의 파일을 고칠 수 있는 에이전트입니다.

이 트리에서 `MCP`라는 모듈은 찾지 못했습니다. `memcpy`가 검색에 걸린 것과는 다릅니다. 공식 자동화 입구를 넣어 달라는 [이슈 119](https://github.com/robbietilton/Compositor/issues/119)는 2026-09-24에 열렸고 2026-09-27에 저자가 닫았습니다. 닫는 댓글은 에이전트를 파일에 두고 싶다는 것입니다. 내부를 아직 자주 바꾸고 있고, 그 안으로 들어오는 입구나 자동화 엔드포인트의 보안을 맡기 싫다는 이유입니다. 나중에 다시 볼 수 있다고 적습니다.

이슈 본문이 이름을 든 저장소는 API로 열려 있었습니다. 시각은 2026-11-11 09:15 KST 무렵입니다.

| 저장소 | 라이선스 | 스타 | 포크 | 설명 필드가 적은 경로 |
|---|---|---:|---:|---|
| [Josusanz/compositor-mcp](https://github.com/Josusanz/compositor-mcp) | MIT | 8 | 2 | 디스크의 `.comp`. 앱을 고치지 않음 |
| [marcushorndt/compositor-mcp](https://github.com/marcushorndt/compositor-mcp) | MIT | 0 | 1 | 문서 모델을 헤드리스로 컴파일 |
| [md-f-sarker/compositor-mcp](https://github.com/md-f-sarker/compositor-mcp) | MIT | 0 | 0 | 앱 안의 `EditorSession`을 패치해 호출 |

npm [compositor-mcp](https://www.npmjs.com/package/compositor-mcp) 0.1.4의 발행 시각은 `2026-09-25T15:04:07.176Z`이고, 그 페이지의 주간 다운로드는 69입니다. README는 포맷 버전 9로 저장한다고 적고, 더 높은 버전은 숫자를 유지한 채 모르는 필드를 보존한다고 적습니다. 같은 README의 한계 문장은 “Compositor does not watch files for changes”입니다. 그 문장과, 300밀리초 감시가 있는 현재 소스는 다릅니다. 0.1.4 이후 npm 버전은 페이지에 없습니다. 프리뷰가 건너뛴다고 적은 것은 클리핑 마스크, 조정 레이어, 레이어 효과입니다.

설치 예로 README와 cask가 같이 적는 명령은 이렇습니다. 이 호스트에서는 실행하지 않았습니다.

```bash
brew install --cask robbietilton-compositor
```

cask의 `depends_on.macos`는 `>= 26`입니다. Ruby 원문의 심볼은 `:tahoe`입니다. `conflicts_with`는 cask 토큰 `compositor`입니다. 그 토큰의 앱이 무엇인지는 이 글이 열지 않았습니다. `analytics.install`은 30일 631, 90일 2,222, 365일 2,222입니다. 90일과 365일이 같은 숫자인 이유의 첫 커밋 시각은 Homebrew 히스토리에서 확인하지 않았습니다. 아키텍처 제약은 이 Ruby에 없습니다. 지금 받는 1.6.6 바이너리는 arm64입니다.

[Apple 지원 문서](https://support.apple.com/en-us/109033)는 발행일이 2026-11-09이고, 최신 표의 맨 위가 macOS 27 Golden Gate 27.2.1, 다음이 macOS Tahoe 26의 26.7.3입니다. “macOS 26.0 or later”는 Tahoe만의 문장이 아닙니다. 1.6.6 바이너리의 SDK 이름은 27.2입니다.

## 한계

- 측정한 크기는 DMG를 풀어 파일 `Size`를 더한 값입니다. 1.0.4는 11,982,494바이트, 1.6.6은 14,207,805바이트입니다. 실행 중인 프로세스의 풋프린트는 재지 않았습니다.
- 1.6.6은 arm64만 있습니다. 1.0.4에는 x86_64 슬라이스가 있습니다. 그 슬라이스를 Intel 맥에서 실행하지는 않았습니다.
- GUI, 브러시, PSD 변환, 실시간 리로드는 맥이 없어 실행하지 않았습니다. 300밀리초는 소스의 상수입니다.
- PSD는 README가 8비트 RGB로 한정합니다. CMYK는 그 문장에서 빠집니다.
- 공식 MCP는 없고, 저자가 이슈 119에서 파일 경로를 유지하겠다고 닫았습니다. 서드파티 0.1.4의 “앱이 파일을 감시하지 않는다”는 현재 `ProjectWatcher`와 다릅니다.
- 영어만 받고, 번역 PR은 거절한다고 README가 적습니다.
- DepthMini는 첫 볼류메트릭 라이트에서 따로 받습니다. 앱 합 14,207,805바이트에 그 2,657,779바이트는 없습니다.
- 서명과 공증은 README와 `scripts/release.sh`가 하는 일로 적혀 있습니다. `stapler`로 확인하지 않았습니다.

## 비즈니스 인사이트

숫자 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다.

**구독 편집기와 한 번 받는 편집기가 같은 달에 같이 있습니다.** Adobe의 [포토샵 제품 페이지](https://www.adobe.com/products/photoshop.html)를 2026-11-11에 읽었습니다. 정적 본문으로 남은 FAQ는, 모바일 포토샵은 무료 앱이고 프리미엄 기능은 구독을 사면 열린다고 적습니다. 웹에는 무료 포토샵이 없고, 자기 사진을 올리려면 플랜이나 체험이 필요하다고 적습니다. 같은 날 [요금 HTML](https://www.adobe.com/creativecloud/plans.html)은 이 환경의 curl이 Access Denied였고, WebFetch가 받은 제품·요금 페이지의 가격은 `mas-field` 자리표시자라 달러 금액을 읽지 못했습니다. 그래서 이 글은 월 요금을 적지 않습니다.

같은 날 읽은 [데스크톱 기술 요구 사항](https://helpx.adobe.com/photoshop/desktop/get-started/technical-requirements-installation/adobe-photoshop-on-desktop-technical-requirements.html)은 “Last updated on Nov 10, 2026”입니다. 버전 28.x 이후 절의 macOS 줄에는 “macOS v 14.0”과 “macOS v15, 26, 27”이 있고, 디스크 줄은 “10 GB of available hard disk space (additional free space required during installation - cannot install on a volume that uses a case-sensitive file system)”입니다. 인터넷은 활성화, 멤버십 확인, 온라인 서비스에 필요하다고 적습니다. 6,455MB라는 설치본 크기는 이 페이지에 없습니다.

[Affinity의 2026-09-15 글](https://www.affinity.studio/blog/affinity-update-september-2026)은 “If you’re new to Affinity, you can download it for free”라고 적고, “Most of this release is free to use, including all your core photo, vector and layout tools. The Canva AI Studio is unlocked with a Canva premium plan.”이라고 적습니다. [2026-11-02 iPad 글](https://www.affinity.studio/blog/affinity-update-ipad-2026)은 “completely free for individuals”와 “Canva AI Studio requires a Canva premium plan. All core sketching, vector design, photo editing, and page layout tools are free.”를 반복합니다. Canva 프리미엄의 달러 가격은 열지 않았습니다.

[Apple의 Pixelmator Pro 페이지](https://www.apple.com/pixelmator-pro/)는 일회 구매 **$49.99**, Apple Creator Studio는 체험 30일 뒤 신규 **$12.99/월** 또는 **$129/년**, 교육자는 **$2.99/월** 또는 **$29.99/년**이라고 적습니다. 필요 OS는 “Pixelmator Pro is available on macOS 26 or iPadOS 26”입니다. Creator Studio 구독에는 Apple 계정과 인터넷이 필요하다고 적습니다.

[GIMP FAQ](https://www.gimp.org/docs/userfaq.html)는 상업 사용이 된다고 적고, 라이선스를 GPL v3 이상이라고 적습니다. 수정본을 배포하면 그 소스도 GPLv3+로 내놓아야 한다고 적습니다. “Are you trying to develop a Photoshop killer app?”의 답은 No입니다. 회사는 없고 자원봉사자라고 적습니다.

**누가 이 저장소를 쓸 수 있나.** (1) macOS 26 이상의 Apple silicon에서, README가 적은 합성·후보정 도구로 충분한 사람. 받는 파일은 cask 1.6.6이고 바이너리는 arm64입니다. (2) `.comp` 폴더를 생성하는 스크립트나 에이전트. 공식 입구는 파일이고, 열려 있으면 300밀리초 뒤에 다시 읽습니다. (3) MIT로 소스를 고치려는 사람. Xcode 26 이상이 그 경로의 요구 사항입니다. GPL처럼 수정본 공개를 요구하는 문장은 이 `LICENSE`에 없습니다. 저작권 고지를 남기는 조건은 있습니다.

**누가 이 파일만으로 포토샵 자리를 바꾸지 못하나.** Intel 맥은 1.6.6 바이너리에 슬라이스가 없습니다. Windows와 Linux는 저자가 지원하지 않는 포트입니다. CMYK와, README가 픽셀로 바꾼다고 적은 PSD 벡터는 그 가져오기 문장 밖에 있습니다. Firefly 같은 생성 기능은 이 README의 기능 목록에 없습니다. 멤버십으로 열리는 Adobe 기능의 가격은 위에서 읽지 못했습니다.

**채택 숫자는 세 개입니다.** 스타 18,591, DMG `download_count` 합 128,702, Homebrew 90일 설치 2,222. **분석/의견.** 이 셋을 사용자 수로 나열할 수 없습니다. 스타는 저장소 관심이고, DMG 횟수에는 자동 업데이트가 섞일 수 있고, cask 설치는 Homebrew를 쓴 맥만 셉니다. 90일 2,222와 스타 18,591을 나누면 0.12입니다. 그 비율이 전환율이라는 뜻은 아닙니다.

**분석/의견.** “바이브 코딩으로 만든 포토샵 복제”의 개수나 매출은 이 글이 센 적이 없습니다. 확인한 근처 사실은 따로 있습니다. 발표 뒤 며칠 안에 서드파티 MCP 저장소가 셋 생겼고, 저자는 9월 27일에 앱 안 자동화 입구를 닫았습니다. 에이전트가 실제로 받는 계약은 MCP 메서드 목록이 아니라 `manifest.json`과 PNG입니다. 그 계약은 버전이 21까지 올라 있고 27도 읽습니다. 제품을 붙인다면 포맷 문서를 고정하고, 0.1.4가 쓴다는 버전 9에 맞출지, 앱이 저장하는 21을 쓸지 고릅니다.

**분석/의견.** 개발자 제품에 남는 자리는 “포토샵을 대체했다”가 아닙니다. Adobe 페이지는 데스크톱 활성화에 멤버십 확인이 필요하다고 적고, 달러는 이 환경에서 읽히지 않았습니다. Affinity는 2026-09-15 글에서 핵심 도구를 무료로, Canva AI는 유료 플랜으로 나눕니다. Pixelmator Pro는 Apple이 $49.99 또는 Creator Studio 구독으로 팔고, 요구 OS가 macOS 26입니다. GIMP는 GPL이라 수정본을 제품에 넣어 배포하면 소스 의무가 따라옵니다. Compositor의 MIT는 그 의무가 없고, 대신 1.6.6 바이너리는 arm64와 macOS 26.0 이상입니다. 서버나 Windows 도구에 그대로 넣는 런타임이 아닙니다. 넣는다면 앱이 아니라 `.comp`를 쓰는 쪽입니다.

저자 사이트의 [Compositor 페이지](https://robbietilton.com/compositor)는 “Last update: 9/24/26”이고, “Photoshop and Adobe are trademarks of Adobe Inc. Compositor is not affiliated with or endorsed by Adobe.”라고 적습니다. 그 페이지의 기능 불릿은 레이어부터 브러시까지 17개이고, README에 있는 글자 도구·Camera Raw·GIF·PSD는 그 불릿에 없습니다.

## 팩트 체크

✅ 1차 자료 또는 이 글의 측정과 맞음 / ⚠️ 범위가 다르거나, 반올림이거나, 저자 문장 밖에 확인이 없음 / ❌ 1차 자료와 어긋남

원본 북마크는 [@EngMoElgaraihy, 2026-11-10 18:44 KST](https://x.com/i/status/2120090204673364034)입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 무료다 | ✅ | `LICENSE`는 MIT, “free of charge”. README 설치 경로와 cask에 가격이 없다. https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/LICENSE |
| 오픈소스이고 라이선스는 MIT다 | ✅ | 같은 파일. GitHub `license.spdx_id`는 MIT. API `Date: Wed, 11 Nov 2026 00:18:08 GMT` |
| Swift로 작성됐다 | ✅ | API `language` Swift. AGENTS.md는 SwiftUI, AppKit, 픽셀용 C를 같이 적는다. Metal 셰이더 파일은 없고 Swift 안의 커널이다 |
| macOS 26과 Apple silicon이 필요하다 | ⚠️ | 현재 README, `MACOSX_DEPLOYMENT_TARGET` 26.0, `ARCHS = arm64`, 1.6.6의 `LSMinimumSystemVersion` 26.0과 arm64 바이너리가 그렇다. 발표 8분 전 1.0.4는 최소 26.5이고 `file`은 x86_64+arm64 유니버설이다 |
| 앱이 12MB다 | ⚠️ | 저자 글의 문장이다. 1.0.4 앱 파일 합은 11,982,494바이트(십진 11.98MB, 11.43 MiB)이다. 1.6.6 합은 14,207,805바이트(14.21MB, 13.55 MiB)이고 DMG는 8,867,874바이트이다 |
| 포토샵이 약 6.4GB, 또는 6,455MB다 | ⚠️ | 저자 글은 “6,455MB on my machine”이다. 6,455MB는 십진 6.455GB이다. Adobe 기술 요구 사항(2026-11-10 갱신)은 설치에 10GB의 빈 공간을 적고, 6,455MB라는 설치 크기는 없다. 이 글은 설치된 포토샵을 재지 않았다 |
| 스페인어 글의 “6.455 MB”가 같은 측정이다 | ⚠️ | 자릿수는 저자의 6,455와 같다. 점을 천 단위로 읽으면 6,455MB이고, 소수점으로 읽으면 6.455MB이다. 아랍어 글은 “6,455 MB”로 적는다 |
| 스타가 약 1.8만이다 | ✅ | 2026-11-11 09:18 KST API `stargazers_count`는 18,591이다. 포크는 1,855이다 |
| `.comp`는 PNG 레이어와 매니페스트 폴더다 | ⚠️ | 패키지, `manifest.json`, `images/`의 PNG가 기본이다. 형식 12는 16비트 PNG, 13은 EXR, 17은 GIF, 27도 읽는다. 새 저장 버전은 21이다 |
| 에이전트와 MCP가 앱을 구동한다 | ⚠️ | 공식 문서는 파일 쓰기이고 “No plugin or API”이다. 감시 상수는 300밀리초이다. 이슈 119에서 저자가 인앱 입구를 거절했다. 서드파티 MCP 셋은 저장소로 남아 있고, npm 0.1.4는 앱이 파일을 감시하지 않는다고 적는다 |
| `brew install --cask robbietilton-compositor` | ✅ | README와 cask Ruby, cask JSON이 같은 명령·버전 1.6.6·같은 SHA-256이다. 이 호스트에서는 실행하지 않았다 |
| Xcode 프로젝트를 고치면 기능을 넣을 수 있다 | ✅ | README와 AGENTS.md가 그 경로를 적는다. 플러그인 SDK는 없다. 이 호스트에는 Xcode가 없어 빌드하지 않았다 |
| 개발자 한 명이 만들었다 | ⚠️ | 번역 절은 유지 인원이 한 사람이라고 적는다. 기여자 API는 26명이고 `robbietilton`이 574이다. 저자 사이트의 Apple·Google 이력은 그 사이트의 문장이다 |
| 개인 도구로 시작해 구독을 벗어나려고 공개했다 | ✅ | 저자 글과 README, 사이트 본문이 그 취지를 적는다. 구독 영수증은 보지 않았다 |
| 한 명이 Adobe의 최대 사업을 무너뜨렸다 | ❌ | 아랍어·스페인어 글의 문장이다. 매출이나 점유율을 측정한 자료가 그 글에 없고, 이 글도 Adobe 실적을 열지 않았다. 제품 페이지 FAQ는 데스크톱에 플랜이 필요하다고 적는다 |
| 아랍어 글이 alextalksai 글의 리포스트다 | ⚠️ | 영상 퍼블리셔와 주소는 그 상태다. fxtwitter `reposted_by`는 null이라 플랫폼 리포스트 필드는 비어 있다. 새 글이 그 영상을 붙인 것이다 |
| 포토샵의 블렌드 모드 전 집합이 있다 | ⚠️ | README가 그렇게 적는다. 소스 enum은 24개이고 `Dissolve` 케이스는 없다. Adobe 목록 페이지는 열지 않았다 |
| 서명·공증된 자동 업데이트다 | ⚠️ | README 기능 문장, Sparkle 피드, `appcast.xml`의 `edSignature`, 1.6.6 바이너리의 `SUFeedURL`이 있다. 공증 티켓은 확인하지 않았다 |

**총평:** MIT인 Swift 앱이 있고, `.comp`는 매니페스트와 이미지 폴더이며, 현재 바이너리는 macOS 26.0 이상·arm64입니다. 2026-11-11 09:18 KST의 스타는 18,591입니다. “12MB 대 포토샵 6.4GB”는 저자가 2026-09-18에 적은 자기 맥의 문장입니다. 그 시각에 받을 수 있던 v1.0.4의 앱 파일 합은 11,982,494바이트였고 유니버설이었습니다. 지금 1.6.6의 합은 14,207,805바이트이고 arm64만 있습니다. Adobe가 2026-11-10에 적은 것은 설치용 빈 공간 10GB이지, 6,455MB라는 앱 크기가 아닙니다.

## 참고 자료

- 저장소 — [robbietilton/Compositor](https://github.com/robbietilton/Compositor) (`main` [`02e53989`](https://github.com/robbietilton/Compositor/commit/02e53989dc499d749d83f33023ff249de1c7b4eb), 2026-11-08 10:27 KST). API 2026-11-11 09:18 KST: 스타 18,591, 포크 1,855, `open_issues_count` 33, SPDX MIT, Swift
- 라이선스 — [LICENSE](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/LICENSE) (Copyright 2026 Wonder Assembly LLC)
- 설명 — [README.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/README.md), [AGENTS.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/AGENTS.md), [writing-comp-files.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/docs/writing-comp-files.md), [project-format.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/docs/project-format.md), [brush-performance.md](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/docs/brush-performance.md)
- 릴리스 — [v1.0](https://github.com/robbietilton/Compositor/releases/tag/v1.0) (2026-09-16), [v1.0.4](https://github.com/robbietilton/Compositor/releases/tag/v1.0.4) (2026-09-18 13:45 UTC, DMG 7,399,035바이트), [v1.6.6](https://github.com/robbietilton/Compositor/releases/tag/v1.6.6) (2026-11-08, DMG 8,867,874바이트). 65개 DMG의 `download_count` 합 128,702. API `Date: Wed, 11 Nov 2026 00:19:48 GMT`
- 측정 — 7-Zip 23.01이 적은 논리 `Size` 합. v1.0.4는 11,982,494바이트, 유니버설, `LSMinimumSystemVersion` 26.5. v1.6.6은 14,207,805바이트, arm64, 최소 26.0, SDK `macosx27.2`. SHA-256 `39c764723a6379f808a9c02dbeb01e7081df6236e445250fe00fb85944665f54`
- 업데이트 피드 — [appcast.xml](https://github.com/robbietilton/Compositor/blob/02e53989dc499d749d83f33023ff249de1c7b4eb/appcast.xml)
- 깊이 모델 — [depth-model-1](https://github.com/robbietilton/Compositor/releases/tag/depth-model-1), `DepthModel.swift`. 자산 합 2,657,779바이트
- Homebrew — [cask JSON](https://formulae.brew.sh/api/cask/robbietilton-compositor.json) (`generated_date` 2026-11-11, 30일 631, 90일 2,222), [cask Ruby](https://github.com/Homebrew/homebrew-cask/blob/master/Casks/r/robbietilton-compositor.rb)
- 자동화 — [이슈 119](https://github.com/robbietilton/Compositor/issues/119) (2026-09-27 닫힘). [Josusanz/compositor-mcp](https://github.com/Josusanz/compositor-mcp), [marcushorndt/compositor-mcp](https://github.com/marcushorndt/compositor-mcp), [md-f-sarker/compositor-mcp](https://github.com/md-f-sarker/compositor-mcp). [npm 0.1.4](https://www.npmjs.com/package/compositor-mcp)
- 저자 사이트 — [robbietilton.com/compositor](https://robbietilton.com/compositor) (페이지 문구 “Last update: 9/24/26”), [robbietilton.com](https://robbietilton.com/)
- macOS 이름 — [Apple 지원, 사용 중인 macOS 확인](https://support.apple.com/en-us/109033) (발행 2026-11-09). Golden Gate 27.2.1, Tahoe 26.7.3
- Adobe — [포토샵 제품 페이지](https://www.adobe.com/products/photoshop.html) (2026-11-11, FAQ. 가격 자리표시자는 숫자로 읽지 않음), [데스크톱 기술 요구 사항](https://helpx.adobe.com/photoshop/desktop/get-started/technical-requirements-installation/adobe-photoshop-on-desktop-technical-requirements.html) (Last updated Nov 10, 2026)
- Affinity — [2026-09-15 업데이트](https://www.affinity.studio/blog/affinity-update-september-2026), [2026-11-02 iPad](https://www.affinity.studio/blog/affinity-update-ipad-2026)
- Pixelmator Pro — [apple.com/pixelmator-pro](https://www.apple.com/pixelmator-pro/) ($49.99, Creator Studio $12.99/월 또는 $129/년, macOS 26 또는 iPadOS 26)
- GIMP — [FAQ](https://www.gimp.org/docs/userfaq.html) (GPL v3 이상, 상업 사용, Photoshop killer 질문에 No)

## 원문 X 링크

- 북마크 — [@EngMoElgaraihy](https://x.com/EngMoElgaraihy/status/2120090204673364034) (id `2120090204673364034`, [x.com/i/status/2120090204673364034](https://x.com/i/status/2120090204673364034))
- 그 글에 붙은 영상 — [@alextalksai](https://x.com/alextalksai/status/2119758600167960620) (id `2119758600167960620`)
- 저자 발표 — [@robbietilton](https://x.com/robbietilton/status/2100946395972976843) (id `2100946395972976843`)
