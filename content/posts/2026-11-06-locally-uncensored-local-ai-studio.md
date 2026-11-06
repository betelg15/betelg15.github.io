---
title: "구독보다 세다? Locally Uncensored는 로컬 스튜디오이고, 월 요금도 있다"
date: 2026-11-06
time: "20:16"
slug: locally-uncensored-local-ai-studio
tags: [로컬 AI, ComfyUI, AGPL, 코딩 에이전트, 팩트체크]
summary: "AGPL 데스크톱에 채팅, ComfyUI, 코딩 에이전트가 있고 설치 파일 합은 278,926이다. '클라우드 구독보다 세다'와 '계정·터미널·월 요금이 없다'는 공식 FAQ와 요금 페이지와 어긋난다."
---

> 이 글은 [@EngMoElgaraihy의 포스트](https://x.com/EngMoElgaraihy/status/2118354670053683536)를 계기로 썼습니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter](https://api.fxtwitter.com/status/2118354670053683536)(`code` 200)로 읽었습니다. `created_at`은 `Thu Nov 05 14:48:05 +0000 2026`, 2026-11-05 23:48 KST입니다. `screen_name`은 `EngMoElgaraihy`, 표시 이름은 Mo Elgaraihy입니다. 그 글은 [Nyxelarm의 영상](https://x.com/Nyxelarm/status/2118046789915865109/video/1)을 붙이고, 같은 홍보를 아랍어로 옮깁니다. 영어 원문도 [fxtwitter](https://api.fxtwitter.com/status/2118046789915865109)로 읽었습니다. `created_at`은 `Wed Nov 04 18:24:40 +0000 2026`, 2026-11-05 03:24 KST이고, 표시 이름은 Nyxelarm입니다. 그 글의 답글 [2118102074487377939](https://x.com/Nyxelarm/status/2118102074487377939)는 `https://github.com/PurpleDoubleD/locally-uncensored.git`입니다. 답글의 `created_at`은 `Wed Nov 04 22:04:21 +0000 2026`, 2026-11-05 07:04 KST입니다. X 글의 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 2026-11-06(KST)에 읽은 GitHub API, 태그 `v3.0.10`의 커밋 `1370f0551d29b9c9ce25c4577401033cfc6fc29d`, `master` README, [locallyuncensored.com](https://locallyuncensored.com/), [설치 안내](https://locallyuncensored.com/guide/install/), [Android 페이지](https://locallyuncensored.com/android/), [lu-labs.ai/pricing](https://lu-labs.ai/pricing)입니다.

영어 원문의 문장은 이렇습니다. "YOUR PC JUST BECAME MORE POWERFUL THAN MOST CLOUD AI SUBSCRIPTIONS." 이어서 무료 앱 하나, 채팅·이미지·영상·코딩 에이전트, 전부 로컬, 계정 없음, Docker 없음, 터미널 없음, 월 요금 없음. 목록은 uncensored 모델과의 채팅, ComfyUI가 스스로 설치되는 이미지·영상, 내 저장소에서 도는 코딩 에이전트, 모든 것이 기기에 남음, Windows·Linux·macOS 베타·Android입니다. 마지막은 "No cloud. No limits."입니다. 아랍어 글은 같은 목록에 "더 강하고 더 빠르다", "100%", "절대적인 프라이버시", "클라우드로 데이터가 새지 않는다", "GitHub 링크는 첫 댓글"을 더합니다. 이 글이 연 아랍어 글의 답글 여섯 개는 본문을 받지 못했습니다.

## 왜 중요한가

로컬 채팅, 이미지, 영상, 저장소 에이전트는 보통 따로 둡니다. Ollama나 LM Studio가 글을 만들고, ComfyUI가 그림을 만들고, 코딩 도구가 저장소를 고칩니다. [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored)는 그 셋을 데스크톱 창 하나로 묶겠다는 공개 저장소입니다. GitHub API를 2026-11-06에 읽었습니다. `stargazers_count`는 **3,458**, `forks_count`는 **560**, `created_at`은 **2026-03-24T21:52:47Z**, `default_branch`는 **master**, `language`는 **TypeScript**, 라이선스 `spdx_id`는 **AGPL-3.0**, `homepage`는 **https://locallyuncensored.com**, `open_issues_count`는 **27**, `subscribers_count`는 **39**입니다. `pushed_at`은 2026-11-06T11:00:17Z입니다. 저장소 설명은 "Windows and Linux. No Docker, no terminal, no cloud required."입니다. 설명의 플랫폼은 Windows와 Linux이고, 문장은 클라우드가 **필요 없다**이지 클라우드가 **없다**가 아닙니다.

최신 릴리스는 [v3.0.10](https://github.com/PurpleDoubleD/locally-uncensored/releases/tag/v3.0.10)입니다. `published_at`은 2026-11-05T15:01:05Z입니다. 그 앞의 [v3.0.9](https://github.com/PurpleDoubleD/locally-uncensored/releases/tag/v3.0.9)는 2026-11-05T03:55:41Z입니다. 릴리스는 v1.0.0(2026-03-25T15:00:23Z)부터 이 글이 읽은 페이지에 **71개**입니다.

개발자가 볼 자리는 슬로건의 "구독보다 세다"가 아닙니다. 로컬 모드와 LU Cloud가 한 앱에 같이 있는지, ComfyUI 설치가 클릭인지, 코딩 에이전트의 Bypass가 확인을 끄는지, Android APK가 데스크톱과 같은 스튜디오인지입니다.

이 글은 제품 이름의 uncensored를 추천으로 옮기지 않습니다. README가 그 단어를 가중치에서 거절 행동을 뺀 모델이라고 정의하는 위치만 적습니다. 필터를 벗기는 절차와 생성 예는 싣지 않습니다.

## 창 하나는 네 갈래다

README의 상자는 Chat, Create, Code, Agent입니다. 스택으로 README가 적는 것은 Tauri v2, Rust 백엔드, React 19, TypeScript, Tailwind CSS 4, Vite 8, 이미지·영상용 ComfyUI, 음성용 faster-whisper와 Piper, Voice용 Pipecat입니다. 태그 `v3.0.10`의 [`package.json`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/package.json) `version`은 `3.0.10`, `license`는 `AGPL-3.0-only`, `engines.node`는 `>=22`입니다. 같은 태그의 [`src-tauri/Cargo.toml`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src-tauri/Cargo.toml)도 `license = "AGPL-3.0-only"`이고, 라이브러리 crate 타입은 `staticlib`, `cdylib`, `rlib`입니다. 그 주석은 Android가 cdylib를 읽고, iOS가 staticlib를 링크한다고 적습니다. 언어 API의 바이트는 TypeScript 34,786,567, Rust 8,636,310, 그 다음 JavaScript입니다. Kotlin 204,757과 Swift 202,806은 같은 저장소에 폰 코드가 있다는 크기입니다. 이 글은 앱을 실행하지 않았습니다.

### 채팅은 내장 엔진이거나, 이미 떠 있는 서버다

기본 백엔드는 LU Engine입니다. [`src/api/providers/types.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/api/providers/types.ts)의 `builtin` 프리셋은 `http://127.0.0.1:8127/v1`, `managed: true`입니다. 주석은 묶여 있는 llama.cpp `llama-server`이고, 바깥 설치가 없는 기본값이라고 적습니다. 온보딩 [`BackendsStep.tsx`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/components/onboarding/BackendsStep.tsx)의 첫 카드 문장은 "LU runs its own engine on your machine. Nothing to install."입니다.

같은 파일이 고를 수 있게 적어 둔 외부 로컬 백엔드는 열두 개입니다. Ollama(11434), LM Studio(1234), Jan(1337), GPT4All(4891), KoboldCpp(5001), llama.cpp(8080), vLLM(8000), LocalAI(8080), text-generation-webui(5000), TabbyAPI(5000), Aphrodite(2242), SGLang(30000). README의 "detects twelve"와 이름이 같습니다. 프리셋 목록에는 그 열두 개 밖에 LiteLLM과 TGI도 있습니다. 클라우드 프리셋으로 같은 파일이 적는 주소는 OpenRouter, Groq, Together, DeepSeek, Mistral, OpenAI, Anthropic, 그리고 사용자가 붙이는 OpenAI 호환 주소입니다. 키 칸이 있습니다.

Local API는 다른 포트입니다. [`src/lib/local-api.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/lib/local-api.ts)의 `LOCAL_API_DEFAULT_PORT`는 **8129**입니다. README는 이 주소를, LU Engine·Ollama·LM Studio에 올라간 모델을 하나의 OpenAI 호환 끝으로 내놓는 설정이라고 적습니다. 기본은 기기 안이고, "Reachable on the network"를 켜면 토큰과 함께 인터페이스에 붙는다고 적습니다.

홈과 README가 모델 개수를 한 숫자로 적지는 않습니다. 홈은 온라인 채팅을 47개와 48개로 같이 적고, 측정은 한 곳에서 44개 중 19개, README는 2026-10-05의 세 라운드 테스트를 포함해 **46개 중 19개**가 거절 없이 끝까지 답했다고 적습니다. 요금 페이지는 플랜마다 채팅 48, 이미지 15, 영상 6이라고 적습니다. 이 글은 모델 목록을 세어 그 수를 확정하지 않았습니다. README 표의 시작점만 옮기면, Qwen 3.8 27B Uncensored는 18 GB이고 IQ2_M은 11 GB로 12 GB 카드에 맞는다고 적혀 있습니다. 채팅 FAQ의 바닥은 GPU 없는 8 GB RAM의 3B입니다. 이미지 표의 입구는 Juggernaut XL과 DreamShaper XL, 6–8 GB입니다. Qwen-Image 2.1은 16–24 GB이고, README는 연구 라이선스와 비상업을 같이 적습니다.

### 이미지와 영상은 Windows·Linux에서 ComfyUI다

README Create 절은 이미지를 앱이 설치하고, 켜고, 고치고, 업데이트하는 ComfyUI로 그린다고 적습니다. 노드 그래프는 사용자가 만지지 않는다고 적습니다. 클라우드에서만 도는 갈래로 같은 절이 이름을 적는 것은 Upscale과 Erase Object입니다. 홈의 문장도 Enhance와 Erase는 클라우드가 필요하고, 나머지 열 갈래는 자신의 GPU에서도 돈다고 적습니다.

설치는 저장소에서 함수로 열려 있습니다. [`comfyInstallStore.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/stores/comfyInstallStore.ts)의 `runInstall` 주석은 "Install ComfyUI, installing Python first when the box has none."입니다. 단계는 `checking`, `python`, `comfyui`, `repair`, `error`입니다. README의 첫 실행 문장은, 엔진이 없으면 **한 번의 클릭**으로 설치하고 ComfyUI도 그렇게 한다는 것입니다. 홍보의 "installs itself"와 문서의 단위는 클릭 한 번입니다. 설치 안내는 Windows 설치 파일 자체를 약 22 MB로 적고, 모델과 ComfyUI와 PyTorch는 그 다음이라고 적습니다. ComfyUI의 기본 위치는 Windows `%USERPROFILE%\ComfyUI`, Linux `~/ComfyUI`입니다.

맥은 이 경로가 아닙니다. README는 맥의 Create가 ComfyUI 없이 맥 자체에서 이미지와 영상을 만들고, ComfyUI·VRAM·LoRA 폴더 설명은 Windows와 Linux라고 적습니다. 다운로드 표의 맥 상태는 베타, Apple Silicon, macOS 14 이상, Intel 제외입니다. 그 표가 가리키는 파일은 [`LU_3.0.9_aarch64.dmg`](https://github.com/PurpleDoubleD/locally-uncensored/releases/download/v3.0.9/LU_3.0.9_aarch64.dmg)이고, 문장은 "Mac: 3.0.10 follows shortly, this is the 3.0.9 build."입니다. 홈과 설치 안내도 그 문장입니다. 그런데 v3.0.10 릴리스 자산에는 `LU_3.0.10_aarch64.dmg`가 있고, 아래 표와 같은 API 응답의 `download_count`는 **21**입니다. v3.0.9 dmg은 **262**입니다. README는 앱이 지금까지 맥 한 대에서 돌았다고 적습니다. Voice는 맥에서 손으로 시험했다고 하고, 컴퓨터 제어는 앱에 있으나 macOS에서 다 시험되지 않았고, Remote Access와 자동 업데이트는 macOS에서 확인되지 않았다고 적습니다.

### 코딩 에이전트는 대화마다 Ask, Plan, Bypass다

README Code 절은 저장소 지도를 만들고, 요청한 줄만 고치고, 적용 전에 diff를 보여주고, 테스트를 돌린다고 적습니다. 프로젝트 규칙은 `.lurules`입니다. 모드 이름은 Ask, Plan, Bypass입니다.

태그 `v3.0.10`의 [`src/lib/codex-mode.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/lib/codex-mode.ts)는 그 셋을 이렇게 적습니다.

```ts
 *   Ask     confirm every arbitrary-exec tool, stage file_write / file_edit
 *   Bypass  local asking off, staging off, the CLOUD shell gate stays
 *   Plan    the read-only chain armed for the whole conversation
```

같은 파일의 한 줄 설명은 Ask가 "Confirm commands, review edits before they land", Bypass가 "Run without asking. Commands and edits land as they come", Plan이 "Read only. Writes a plan, then waits for approval"입니다. 기본으로 돌아가는 값은 `ask`입니다. 모드가 어긋나면 더 엄격한 쪽을 고르는 `stricterCodexMode`가 있습니다. 주석은 화면에 Ask가 보였는데 Bypass로 무인 실행되는 일을 막기 위한 것이라고 적습니다.

Agent 절은 웹 검색과 fetch, 파일, 셸, 코드 실행, 스크린샷, 이미지·영상, 사용자가 붙이는 MCP를 적고, 도구 호출이 사용자가 정한 권한 게이트를 지난다고 적습니다. 3.0.8 노트는 웹 검색이 키 없이 검색 서비스 다섯 곳에 차례로 묻는다고 적습니다. 컴퓨터 제어는 베타이고, 끄개가 기본이며, 터미널과 비밀번호 관리자와 비밀번호 칸은 만지지 않는다고 README가 적습니다. 확인은 Windows에서 돌았고, 맥은 아직 다 시험되지 않았다는 문장입니다.

diff를 먼저 보여주는 경로는 Ask입니다. Bypass는 같은 파일이 "묻지 않고 실행"이라고 적습니다. "권한 게이트가 항상 막는다"와 저장소의 모드 세 개는 다른 문장입니다.

### 라이선스는 AGPL-3.0-only다

README 마지막은 "AGPL-3.0-only. See LICENSE."입니다. `package.json`과 `Cargo.toml`의 문자열도 `AGPL-3.0-only`입니다. GitHub API의 `spdx_id`는 `AGPL-3.0`입니다. [LICENSE](https://github.com/PurpleDoubleD/locally-uncensored/blob/master/LICENSE) 첫 줄은 "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007"입니다. 13절은, 프로그램을 수정한 뒤 그 수정본이 네트워크로 원격 상호작용을 받으면, 그 사용자에게 수정본의 해당 소스를 네트워크로 받을 기회를 내놓아야 한다고 적습니다. 로컬에서 고친 바이너리를 배포하는 의무와, 고친 서버를 네트워크로 여는 의무가 같은 라이선스에 있습니다. lu-labs.ai가 그 의무를 어떻게 지키는지 이 글은 호스팅 소스를 대조하지 않았습니다.

### 폰은 데스크톱 설치 파일이 아니다

[Android 페이지](https://locallyuncensored.com/android/)는 `LU-3.0.10-Android.apk`, 약 31 MB, Android 7.0 이상 arm64, Play 스토어 밖이라고 적습니다. 페이지와 README가 같은 SHA-256을 적습니다. `dbd515d81bbc8ab70f21b850424f9f8b57ae88ae24962225beefc4116d139d2f`. 이 글은 APK를 받아 해시를 다시 계산하지 않았습니다. 페이지가 적는 기능은 기기 안 모델로의 오프라인 채팅, 문서·메모리·페르소나, 계정으로 여는 LU Cloud의 큰 채팅과 Create와 받아쓰기, 집 Wi-Fi로 PC의 LU에 붙어 PC 모델과 채팅, 자신의 모델 파일입니다. 업데이트는 앱이 스스로 하지 않고, 새 APK를 덮어 설치한다고 적습니다. v3.0.7 APK와 서명이 같아 데이터가 남다고 적습니다. 릴리스 자산에서 APK가 있는 태그는 이 글이 본 71개 중 v3.0.7과 v3.0.10 둘입니다. 같은 응답의 `download_count`는 12,146과 548입니다.

`Cargo.toml`의 `inproc-engine` 주석은, 폰이 데스크톱의 llama-server 사이드카를 띄우지 못하므로 Android와 iOS 빌드에는 프로세스 안 엔진이 항상 들어간다고 적습니다. README 로드맵의 Soon은 "Complete remote access via the mobile app: Chat, Agent, Code and all of Create from your phone, running on your PC"입니다. 그 문장은 아직 나온 기능 목록 밖에 있습니다. iPhone은 README와 [iOS 페이지](https://locallyuncensored.com/ios/)가 App Store 심사 중이라고 적습니다. 홍보 문장에는 iPhone이 없습니다.

## 비즈니스 인사이트

숫자와 제품 서술은 각 문장 옆의 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다.

로컬 카드의 가격은 [lu-labs.ai/pricing](https://lu-labs.ai/pricing)이 2026-11-06에 보여 준 **€0**입니다. 그 카드의 한 줄은 "No account needed"입니다. 같은 페이지의 월 요금은 Hosted **€19**, Hosted Pro **€49**, Hosted Max **€99**입니다. 크레딧은 각각 월 900,000, 2,350,000, 5,000,000입니다. 일회권은 €15에 450k, €35에 1.1M, €75에 2.4M, €125에 4.05M, €300에 9.75M이고, 페이지는 만료되지 않는다고 적습니다. Hosted의 일일 채팅 포함은 Flash 11개, Pro와 Max는 12개입니다. 페이지의 면책 한 줄은 "This is not an unlimited-use promise."입니다. 홈이 적은 이미지 단가는 Hosted에서 약 2센트, €15 팩에서 약 3센트이고, 5초 영상은 약 21센트와 약 33센트입니다. 요금 HTML의 Hosted 추정은 빠른 Flux Schnell과 5초 LTX-2를 기준으로 약 0.6센트와 €0.17이라고 적습니다. 두 페이지의 단가 문장은 모델이 다릅니다.

같은 날 [claude.com/pricing](https://claude.com/pricing)의 개인 요금은 Pro가 월 $20, 연간은 선불 $200으로 월 $17, Max $100, Ultra $200입니다. [cursor.com/pricing](https://cursor.com/pricing)의 JSON-LD Offer는 Plus $8, Premium $30, Super $100, Ultra $200, Teams $30입니다. 그 페이지는 월 가격에 서드파티 모델 사용이 포함되지 않고 따로 산다고 적습니다. [chatgpt.com/pricing](https://chatgpt.com/pricing/)은 플랜 이름으로 Free, Go, Plus, Pro, Business를 보여 줬고, 이 글이 받은 HTML에서는 달러 금액을 뽑지 못했습니다. ChatGPT의 달러 가격은 적지 않습니다.

**분석/의견.** 목록 가격만 놓으면 LU Hosted €19는 Claude Pro $20과 같은 자릿수이고, Cursor Premium $30보다 숫자로는 아래입니다. 사는 물건이 다릅니다. LU의 €19는 공유 크레딧 90만과 Flash 일일 한도이고, Claude 페이지는 5시간·주간 사용량으로 적습니다. 환율은 이 글이 바꾸지 않았습니다. 로컬 €0의 비용은 요금 페이지 밖에 있습니다. README 표의 18 GB 모델과 6 GB 이상의 VRAM, 설치 안내의 이후 PyTorch·모델 다운로드가 그 비용의 자리입니다.

다운로드 수는 사이트 문장 "270,000+"를 GitHub 릴리스 자산의 `download_count`와 맞춘 것입니다. 71개 릴리스 합계는 이렇습니다.

| 묶음 | 파일 수 | download_count 합 |
| --- | ---: | ---: |
| Windows `.exe`와 `.msi` | 140 | 235,240 |
| `.AppImage` | 68 | 13,223 |
| `.deb` | 68 | 7,367 |
| `.rpm` | 68 | 4,534 |
| `.dmg` | 5 | 5,868 |
| `.apk` | 2 | 12,694 |
| 위 설치 파일 합 |  | **278,926** |
| `latest.json`, 서명, SBOM, SHA256SUMS | 449 | 463,862 |
| `.tar.gz`와 `.zip` | 149 | 5,582 |

설치 파일 합 278,926은 사이트의 270,000+보다 큽니다. `latest.json`은 앱이 시작 직후와 이후 최대 6시간마다 읽는 업데이트 파일이므로, 그 46만은 설치 수가 아닙니다. 전부 더하면 748,370이고, 그 수도 270,000보다 큽니다. 어느 쪽으로 더해도 270,000+는 이 카운터에서의 하한으로 남습니다. 카운터는 고유 기기가 아닙니다. 다시 받은 파일과 자동 업데이트가 들어갑니다. 스타 3,458에 대해 홈이 적은 "3,000+"도 하한으로는 맞습니다.

**분석/의견.** 2026-03-25의 v1.0.0부터 2026-11-05의 v3.0.10까지 71개 릴리스는 배포 속도입니다. 그 속도가 월간 사용자 수는 아닙니다. 이익이 갈리는 지점은 구독 회사 전체가 아니라 자리입니다. GPU가 있고 채팅·그림·저장소 수정을 창 하나로 두고 싶은 사람에게는, 프로젝트 비교표가 LM Studio와 Open WebUI에 없다고 채운 이미지·영상·코딩 에이전트가 이유입니다. 그 표는 프로젝트 자신의 표입니다. 이 글은 LM Studio와 Open WebUI를 다시 설치해 칸을 검증하지 않았습니다. GPU가 없는 사람, Intel 맥, 폰에서 ComfyUI를 기대한 사람은 같은 페이지가 LU Cloud와 브라우저로 보냅니다. 그 경로의 가격은 €0이 아닙니다. "월 요금이 없다"는 홍보와 €19·€49·€99는 같은 주체의 두 제안입니다.

AGPL은 가격과 따로 있습니다. **분석/의견.** 고친 앱을 네트워크 서비스로 여는 조직에는 LICENSE 13절의 소스 제공이 배포 조건으로 붙습니다. MIT로 알려진 주변 도구와 이 저장소를 한 제품에 섞는 조합의 라이선스 검토는, 이 글이 그 주변 도구의 라이선스 파일을 오늘 열지 않았으므로 여기서 끝내지 않습니다. 비교표가 LM Studio의 오픈 소스를 No로 적은 칸은 그 표의 칸입니다.

프라이버시 문장도 가격과 같이 읽힙니다. README FAQ는 로컬 모드에서 분석 키트와 크래시 리포트가 없고, 그래도 네트워크를 두 가지에 쓴다고 적습니다. GitHub Releases 업데이트 확인, 그리고 Cloud 스위치를 누를 때마다 방향·플랫폼·앱 버전을 세며 식별자는 없다고 적습니다. LU Cloud에 로그인되어 있으면 5분마다 계정을 확인한다고 적습니다. 인터넷 너머 원격은 Cloudflare가 중계하고, 끝에서 끝까지의 암호화는 아니어서 Cloudflare가 읽을 수 있다고 적습니다. 요금 카드의 "Fully private, fully offline"과 홈의 "nobody watching"은 그 FAQ보다 짧습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다름 / ❌ 1차 자료와 어긋남

영어 원문은 [fxtwitter의 `tweet.text`](https://api.fxtwitter.com/status/2118046789915865109)입니다. 아랍어 글은 [2118354670053683536](https://api.fxtwitter.com/status/2118354670053683536)입니다. 이 글을 읽은 시각의 `views`는 영어 **45,597**, 아랍어 **27,899**입니다. 이 수는 시각이 지나면 바뀝니다.

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| PC가 대부분의 클라우드 AI 구독보다 더 강해졌다 | ❌ | [README FAQ](https://github.com/PurpleDoubleD/locally-uncensored/blob/master/README.md)는 대부분의 채팅·글·코딩은 좋은 8B–14B로 대체할 수 있고, **가장 어려운 추론에서는 프런티어 클라우드 모델이 여전히 더 강하다**고 적습니다. README·홈·릴리스에서 ChatGPT, Claude, Cursor 구독과의 벤치마크는 보지 못했습니다. |
| 아랍어 글의 "더 빠르다" | ❌ | 영어 원문에는 속도 문장이 없습니다. 위와 같은 1차 페이지에 구독 대비 지연 측정이 없습니다. |
| 무료 오픈 소스이고, 채팅·이미지·영상·코딩 에이전트가 한 앱에 있다 | ✅ | README 첫 절, `AGPL-3.0-only`, Chat·Create·Code·Agent. 로컬 가격은 [요금 페이지](https://lu-labs.ai/pricing)의 €0입니다. 맥 Create는 ComfyUI가 아니고, Android는 아래 행입니다. |
| 전부 로컬이다. 계정이 없다 | ⚠️ | 로컬 모드는 README가 기기 안이라고 적고, 요금 카드는 "No account needed"입니다. 홈 첫 절은 "on your PC **or online**"이고, LU Cloud·크레딧·로그인 중 5분 계정 확인이 있습니다. 저장소 설명은 "no cloud **required**"입니다. |
| Docker가 필요 없다 | ✅ | README 비교표의 "Runs without Docker"와 저장소 설명. 이 글은 Docker 파일을 요구하는 설치 경로를 README에서 보지 못했습니다. |
| 터미널이 필요 없다 | ⚠️ | Windows는 NSIS 설치 파일입니다. [설치 안내](https://locallyuncensored.com/guide/install/)의 AppImage는 `chmod +x`와 실행이고, `.deb`·`.rpm`은 `apt`·`dnf`입니다. 소스 빌드 README는 `npm install`과 `npm run tauri build`입니다. |
| 월 요금이 없다 | ❌ | 로컬은 €0입니다. 같은 요금 페이지의 Hosted €19, Pro €49, Max €99는 월 요금입니다. 팩은 월 구독이 아닌 일회 €15부터이고, 그것도 청구입니다. |
| uncensored 모델과 제한 없이 대화한다 | ⚠️ | README는 그 단어를, 거절 행동을 가중치에서 뺀 모델이 거절 없이 답하는 것이라고 정의합니다. 같은 메뉴에 주류 모델이 있다고 적습니다. 클라우드 글에는 자체 모더레이션 층을 더하지 않는다고 홈이 적고, 클라우드 이미지·영상은 계정의 Strict·Standard·off입니다. 측정은 README 기준 46개 중 19개입니다. 이 행은 위치 설명이고 사용 권고가 아닙니다. |
| ComfyUI가 스스로 설치되며 이미지·영상이 된다 | ⚠️ | README는 없을 때 **클릭 한 번**이고, 앱이 설치·시작·수리·업데이트한다고 적습니다. `runInstall`은 Python이 없으면 Python부터 설치합니다. 맥 Create는 ComfyUI를 쓰지 않습니다. Upscale·Erase Object는 클라우드 전용입니다. Android 페이지는 폰 안의 ComfyUI를 적지 않습니다. |
| 코딩 에이전트가 내 저장소에서 실제로 돈다 | ✅ | README Code 절과 `codex-mode.ts`. Ask는 명령 확인과 적용 전 리뷰, Plan은 읽기 전용 뒤 승인, Bypass는 묻지 않고 실행입니다. diff를 먼저 보여주는 문장은 Ask 경로입니다. |
| 모든 것이 기기에 남고, 클라우드로 새지 않는다 | ❌ | 로컬 FAQ의 남는 네트워크는 GitHub 업데이트 확인과 Cloud 스위치 집계입니다. 로그인 중에는 5분마다 계정 확인입니다. 웹 검색은 키 없이 서비스 다섯 곳입니다. 인터넷 원격은 Cloudflare 중계이고 종단 간 암호화가 아니라고 README가 적습니다. 선택 클라우드 키는 그 제공자로 프롬프트를 보냅니다. |
| Windows, Linux, macOS 베타, Android를 모두 지원한다 | ⚠️ | 네 자리의 공식 파일이 있습니다. Windows 10·11 x64와 Linux x64는 릴리스마다 패키지가 있습니다. 맥은 Apple Silicon 베타, Intel 제외, 문서가 권하는 파일은 아직 3.0.9 dmg이고 README는 맥 한 대에서 돌았다고 적습니다. v3.0.10 dmg 자산의 카운트는 21입니다. Android는 Play 밖 APK이고, 데스크톱 네 탭 전체가 아닙니다. |
| 설치하고 모델을 고르면 바로 된다 | ⚠️ | 설치 안내는 Windows 설치 파일이 약 22 MB이고, 모델·ComfyUI·PyTorch가 그 다음의 큰 파일이라고 적습니다. 채팅 바닥은 README의 8 GB RAM입니다. |
| 클라우드가 없고, 한도가 없다 | ❌ | LU Cloud가 홈·README·요금 페이지에 있습니다. 요금 페이지는 호스팅에 대해 무제한 사용 약속이 아니라고 적습니다. 로컬 FAQ의 사용량 한도 없음은 모델 다운로드 뒤, 자기 하드웨어 위입니다. |
| 영어 글 아래 링크가 이 저장소다 | ✅ | [답글 2118102074487377939](https://x.com/Nyxelarm/status/2118102074487377939)의 주소는 `https://github.com/PurpleDoubleD/locally-uncensored.git`이고, 그 저장소는 공개되어 있습니다. |
| 아랍어 글의 첫 댓글에 GitHub 주소가 있다 | ⚠️ | 아랍어 본문은 그렇게 적고, 본문에 붙은 주소는 Nyxelarm 영상입니다. 답글 여섯 개의 본문은 이 글이 받지 못했습니다. |
| 사이트의 270,000+ 다운로드와 3,000+ 스타 | ✅ | 스타는 API **3,458**입니다. 설치 파일로 묶은 `download_count` 합은 **278,926**입니다. 둘 다 사이트가 적은 하한보다 큽니다. 고유 사용자 수는 그 API에 없습니다. |

**총평:** 저장소는 공개되어 있고, 라이선스 파일은 AGPL-3.0이며 패키지는 `AGPL-3.0-only`라고 적습니다. 데스크톱에는 채팅, Windows·Linux의 ComfyUI, diff를 먼저 보여주는 Ask 모드의 코딩 에이전트가 있습니다. 설치 파일 합 278,926은 "270,000+"와 맞습니다. 영어 홍보의 "구독보다 세다", "월 요금이 없다", "클라우드가 없다", "모든 것이 기기에 남는다"는 같은 프로젝트의 FAQ·요금 페이지와 어긋납니다. Android APK는 공식 파일이고, 데스크톱 스튜디오와 같은 범위는 아닙니다. "No bullshit"은 평가라 판정하지 않았습니다.

## 참고 자료

- 저장소 — [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) · [GitHub API](https://api.github.com/repos/PurpleDoubleD/locally-uncensored) (이 글이 읽은 `stargazers_count` 3,458, `forks_count` 560, `created_at` 2026-03-24T21:52:47Z, `license.spdx_id` AGPL-3.0, `pushed_at` 2026-11-06T11:00:17Z) · [언어 API](https://api.github.com/repos/PurpleDoubleD/locally-uncensored/languages) · [릴리스 71개](https://api.github.com/repos/PurpleDoubleD/locally-uncensored/releases?per_page=100) · [v3.0.10](https://github.com/PurpleDoubleD/locally-uncensored/releases/tag/v3.0.10) (2026-11-05T15:01:05Z) · [v3.0.9](https://github.com/PurpleDoubleD/locally-uncensored/releases/tag/v3.0.9) · 태그 커밋 [`1370f055`](https://github.com/PurpleDoubleD/locally-uncensored/commit/1370f0551d29b9c9ce25c4577401033cfc6fc29d)
- 코드 — [`src/lib/codex-mode.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/lib/codex-mode.ts) · [`src/components/onboarding/BackendsStep.tsx`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/components/onboarding/BackendsStep.tsx) · [`src/stores/comfyInstallStore.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/stores/comfyInstallStore.ts) · [`src/api/providers/types.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/api/providers/types.ts) · [`src/lib/local-api.ts`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src/lib/local-api.ts) · [`package.json`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/package.json) · [`src-tauri/Cargo.toml`](https://github.com/PurpleDoubleD/locally-uncensored/blob/1370f0551d29b9c9ce25c4577401033cfc6fc29d/src-tauri/Cargo.toml) · [LICENSE](https://github.com/PurpleDoubleD/locally-uncensored/blob/master/LICENSE)
- 공식 사이트 — [locallyuncensored.com](https://locallyuncensored.com/) · [설치](https://locallyuncensored.com/guide/install/) · [Android](https://locallyuncensored.com/android/) · [iPhone](https://locallyuncensored.com/ios/) · [요금](https://lu-labs.ai/pricing)
- 비교로 연 가격 — [claude.com/pricing](https://claude.com/pricing) (Pro 월 $20, 연간 선불 $200으로 월 $17, Max $100, Ultra $200) · [cursor.com/pricing](https://cursor.com/pricing) (JSON-LD Plus $8, Premium $30, Super $100, Ultra $200, Teams $30. 페이지는 서드파티 모델이 월 가격 밖이라고 적습니다) · [chatgpt.com/pricing](https://chatgpt.com/pricing/) (이 글이 받은 HTML에서는 달러 금액을 뽑지 못함)
- 원본 X 포스트 — [@EngMoElgaraihy, 2026-11-05 23:48 KST](https://x.com/EngMoElgaraihy/status/2118354670053683536) · [@Nyxelarm, 2026-11-05 03:24 KST](https://x.com/Nyxelarm/status/2118046789915865109) · 저장소 답글 [2026-11-05 07:04 KST](https://x.com/Nyxelarm/status/2118102074487377939)
