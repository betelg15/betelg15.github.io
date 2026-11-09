---
title: "3시간, 파일 하나, 월 1억? fly.pieter.com 팩트 체크"
date: 2026-11-10
time: "08:23"
slug: pieter-levels-fly-vibe-coded-game
tags: [Pieter Levels, Cursor, Three.js, 바이브코딩, 팩트체크]
summary: "2025-02-22 글은 Cursor로 약 3시간, HTML 한 파일이라고 적는다. 17일 뒤 글의 $87,000은 MRR이고, 2025-03-11 Frankfurter 환율로는 1억 2,649만 원이다. 그는 1년 지속은 추측이라고 적었다."
---

> 이 글은 제가 X에서 북마크해 둔 [@ministerbtc(정청)의 포스트](https://x.com/i/status/2119645152994381859)를 계기로 썼습니다. 이 환경의 X API는 쓰지 않았고, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2119645152994381859)(`code` 200)으로 읽었습니다. `created_at`은 `Mon Nov 09 04:16:00 +0000 2026`, **2026-11-09 13:16 KST**입니다. 표시 이름은 정청, `screen_name`은 `ministerbtc`, `verification.type`은 `individual`, 팔로워는 5,781입니다. 프로필 설명은 “AI의 일상화, AI와 사람의 물아일체(物我一體)”로 시작합니다. 같은 응답의 스냅샷은 답글 2, 리포스트 10, 좋아요 79, 북마크 95, 인용 2, 조회 7,805입니다. 읽은 시각은 2026-11-10 08:20 KST 무렵입니다.
>
> 그 본문은 이렇습니다. “게임 한 번도 안 만들어본 사람이 AI로 3시간 만에 만든 게임, 17일 만에 월 1억 넘김.” 이어서 다섯 줄입니다. 피터 레벨스는 직원 없이 웹서비스 여러 개를 혼자 굴리는 1인 창업가이다. 작년 2월 게임을 한 번도 안 만들어 봤는데 AI 코딩 도구에 말로만 시켜서 비행 게임을 만들었다. 걸린 시간은 3시간쯤이었고 브라우저에서 바로 열리는 파일 하나로 끝냈다. 게임 속 광고 자리를 월 구독으로 팔았더니 17일 뒤 월 매출이 8만7000달러가 됐다. 그때까지 32만 명이 날아 봤다. 마지막 문장은 “나 같으면 3시간짜리 게임 만들고 친구들한테 자랑만 하다 끝났을 듯”입니다.
>
> 첨부 이미지는 1196×774 JPEG 한 장입니다. 화면은 X의 한국어 번역 UI이고, 위에 “원문 언어 영어 원본 보기”가 있습니다. 보이는 글은 [@levelsio의 2025-03-11 포스트](https://x.com/levelsio/status/1899596115210891751) 앞부분입니다. “$0에서 $100만 ARR”, “$87,000 MRR (즉, $1M ARR)”, 광고 슬롯 3개, “32만 명”, 그리고 “MRR이 정말 1년 내내 지속 가능할지는 추측만 할 수 있지만, 이건 구독이고 갱신도 되니까”까지입니다. UFO, XSS, Cursor와 Claude 3.5 문단은 이 크롭 아래에 있습니다. Stripe 영수증 화면은 아닙니다.
>
> X 글과 이미지 속 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-10(KST) 오전에 연 1차 자료입니다. 게임을 플레이하지 않았고, Stripe로 결제하지 않았으며, 웹소켓에 접속하지 않았습니다.

## 왜 중요한가

개발자가 볼 질문은 “3시간이면 월 1억인가”보다 다음입니다.

- 3시간과 파일 하나가 가리키는 대상이 첫 플레이 버전인가, 광고가 붙은 멀티플레이 버전인가.
- $87,000이 17일 동안 통장에 들어온 현금인가, 그가 MRR이라고 부른 구독 런레이트인가.
- 그 런레이트를 12로 곱해 “$1M ARR”이라고 적은 뒤, 본인이 1년 지속을 추측이라고 남겼는가.
- 비행기 위치와 기체가 브라우저에서 만들어졌다는 그의 말이, 나중에 그가 적은 UFO 조작과 어떻게 이어지는가.

바이브 코딩 이야기의 재료는 프롬프트 한 줄이 아닙니다. 이미 큰 타임라인이 있는 사람이, 브라우저 장난감을 며칠 동안 공개 운영하며 그 안의 광고 자리를 판 기록입니다.

## 기술 설명

### 첫날, 그리고 그가 말한 3시간

[2025-02-22 17:21 UTC](https://x.com/levelsio/status/1893350391158292550)(2025-02-23 02:21 KST) 글은 이렇게 시작합니다. Cursor에게 비행 시뮬레이터를 시켜 보자는 생각. 그가 적은 프롬프트는 “make a 3d flying game in browser with skyscrapers”입니다. “many questions and comments from me” 뒤에 vanilla HTML과 JS로 자기 해변 마을, 활주로, 땅, 절벽, 해변이 있는 씬이 생겼다고 적습니다.

두 시간 뒤인 [19:39 UTC](https://x.com/levelsio/status/1893385114496766155)(04:39 KST)에 주소를 올립니다. `http://fly.pieter.com`. 문장은 “I've never ever made a game before and just made my own flight simulator 100% with Cursor in I'd say 3 hours by just telling it what I wanted”입니다. 이어서 “It didn't go 100% smooth ofc, but 80% yes”, 이전 버전으로 돌아가 같은 요청을 몇 번 반복한 적이 있다고 적습니다. 마지막 괄호는 “(and yes the whole flight sim is one HTML file)”입니다. 두 글의 시각 차이는 2시간 17분 59초입니다. “I'd say 3 hours”는 그 글의 어림이고, 첫 글보다 앞에서 시작했을 가능성은 그 두 타임스탬프만으로 닫히지 않습니다.

같은 날 그는 풍선 사격, 건물과 배 파괴, nippleJS 가상 조이스틱을 Cursor에 시켜 모바일을 붙였다고 적습니다. [levels.io의 정리 글](https://levels.io/fly-pieter-com-vibecoded-flight-simulator)은 날짜를 “22 February, 2025”로 두고, “my first vibe coded game”이라고 부릅니다. Microsoft Flight Simulator는 로딩과 업데이트 때문에 바로 날기 어렵다는 비교가 그 글의 시작 이유입니다.

다음 날 [2025-02-23 15:08 UTC](https://x.com/levelsio/status/1893679316384244046) 글은 결이 바뀝니다. `fly.html`이 3,000줄이 되고, 한 수정을 위해 파일 전체를 보다가 15초가 걸리며, 절반이 넘는 시도에서 에러 없이 비행기나 조작이 빠진다고 적습니다. 그는 원인을 LLM 컨텍스트 한계와, Cursor가 소스와 모델 답을 diff하는 방식으로 추정합니다. 파일을 나누라고 시켰더니 `updatePlayer` 안에 “insert your updatePlayer code here”만 있는 파일이 나왔고, 게임을 되돌렸다고 적습니다. 팁으로 적은 문장은 처음부터 여러 파일로 시작하라는 것입니다. 같은 날 [Cursor 공동창업자로 그가 소개한 @mntruell](https://x.com/levelsio/status/1893732811477078092)이 짧은 파일이 낫다고 했고, 그는 Agent 모드를 아직 안 써 봤다고 적습니다.

[2025-03-07](https://x.com/levelsio/status/1898145978638889210)에는 기체 선택 UI를 Cursor에 시킨 뒤 버튼과 스타일을 직접 고쳤고, 인라인 CSS는 손으로 `<style>`로 옮긴다고 적습니다. “말로만”은 2월 22일 문장에 있습니다. 같은 스레드에는 질문, 롤백, 손으로 한 정리가 같이 있습니다.

모델 이름은 3시간 글에 없습니다. 그 글의 도구 이름은 Cursor입니다. [2025-02-25](https://x.com/levelsio/status/1894390543582371922)에 “WebSocket server from scratch in Python with Grok 3”라고 서버를 따로 적습니다. [2025-03-02](https://x.com/levelsio/status/1896333719469965414)는 “Cursor w/ Claude”가 대공 탱크를 한 번에 만들었다고 적습니다. [2025-03-09](https://x.com/levelsio/status/1898767487371465079)는 기체 모델을 Claude 3.5, Claude 3.7, Grok 3 모두로 시도했고 셋 다 투박했다고 적습니다. [2025-03-11](https://x.com/levelsio/status/1899596115210891751) 마지막은 “I still mostly use @cursor_ai + @AnthropicAI Claude 3.5 and trying 3.7 too now”입니다. Grok 3이 3시간짜리 클라이언트를 만들었다는 문장은 이 글들이 아닙니다.

### 화면은 Three.js 씬이다

[2025-02-24 20:39 UTC](https://x.com/levelsio/status/1894125123197964542)에 그는 별을 넣고 우주까지 날게 하려고 “the clipping distance of Three JS”를 10,000으로 올렸다고 적습니다. 달과 별은 그 가장자리에 두었다고 합니다.

2026-11-10 08:18 KST의 `curl -I https://fly.pieter.com/`은 `HTTP/2 200`, `server: nginx/1.30.6`, `content-type: text/html; charset=UTF-8`입니다. 본문은 493,805바이트, 10,786줄입니다. `<meta name="description">`은 “A fun free-to-play MMO flight sim, made with AI. Fly and dogfight with your friends online.”입니다. 크레딧 링크 문자는 “by @levelsio + Cursor + ThreeJS”입니다.

외부 스크립트는 다섯입니다. `scripts.simpleanalyticscdn.com/latest.js`, `challenges.cloudflare.com/turnstile/v0/api.js`, `pieter.com/game-links.js`, `/assets/three.min.js`, `/assets/nipplejs.min.js`. `three.min.js` 헤더는 `Copyright 2010-2021 Three.js Authors`, `SPDX-License-Identifier: MIT`입니다. 이 헤더의 연도로 보면 2024년 이후 릴리스의 빌드는 아닙니다. 파일 안의 `REVISION` 문자열은 이번 글에서 뽑지 않았습니다.

카메라는 두 번 만들어집니다. 메인 카메라는 페이지에 이렇게 있습니다.

```javascript
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 10000);
```

인자는 fov 85도, 화면 종횡비, near 0.1, far 10000입니다. far 10000은 2월 24일 글의 clipping distance와 같은 수입니다. 두 번째 생성은 주석 “Create rear view camera” 다음에 있고, fov 75, aspect 1, near 0.1, far 1000입니다. 페이지는 이 카메라를 후방 뷰라고 부릅니다.

현재 [three.js dev 브랜치 `PerspectiveCamera.js`](https://github.com/mrdoob/three.js/blob/dev/src/cameras/PerspectiveCamera.js) 생성자 기본값은 `fov = 50`, `aspect = 1`, `near = 0.1`, `far = 2000`입니다. 이 기본값은 2026-11-10에 그 파일을 받아 읽은 값입니다. 라이브 페이지는 far를 10000으로 직접 넘기므로, 2010–2021 번들의 기본 far가 몇인지는 화면 범위에 쓰이지 않습니다. 원근 카메라의 far는 이 평면보다 먼 것을 그리지 않는 클립 평면입니다.

[2025-03-06 19:19 UTC](https://x.com/levelsio/status/1897728697253453865)에 그는 활주로 조명을 PointLight에서 emissive 재질로 바꿨고, 어떤 기기에서는 8 FPS에서 60 FPS로 올라갈 수 있다고 적습니다. 같은 날 [22:59 UTC](https://x.com/levelsio/status/1897784027186446820)에는 느린 기기에서 5 FPS였던 것이 대부분 60 FPS 이상이 됐다고 적습니다. 두 문장의 시작 FPS는 그가 다르게 적었습니다. 2026-11-10 페이지에서 `PointLight` 문자열은 0건, `emissive`는 20건입니다. 기체 메시의 기하를 이 글은 복사하지 않습니다. 그는 3월 9일 글에서 모델이 Box 같은 기본 도형으로 투박하고, 부품 위치를 직접 30분씩 맞춘다고 적었습니다.

[2025-03-11 16:18 UTC](https://x.com/levelsio/status/1899495267025449069)에는 `scene.toJSON()`을 콘솔에 찍어 [three.js editor](https://threejs.org/editor/)로 가져오면 월드를 고치기 쉽다고 적습니다. 그 호출이 라이브 HTML에 있는지는 확인하지 않았습니다.

### 멀티플레이는 하루 만에 바뀌었다

[2025-02-23 01:11 UTC](https://x.com/levelsio/status/1893468798101094587)의 첫 멀티플레이는 WebRTC입니다. @marckohlbrugge 제안으로 “can you make it multiplayer with webrtc”라고 했고, Cursor가 PeerJS를 썼다고 적습니다. 전원이 한 방에 있는 구성은 안 됐고, ID를 주고받는 1대1은 됐다고 합니다. 시작부터 8시간이라고 적힌 글입니다.

[2025-02-25 11:57 UTC](https://x.com/levelsio/status/1894356073915597273)에 그는 PeerJS가 피어 투 피어라 한계가 있다고 보고, 100ms마다 `timestamp | username | x | y | z`를 서버에 보내는 방식을 묻습니다. 14:14 UTC에 Python과 Grok 3으로 웹소켓 서버가 생겼다고 합니다. [16:51 UTC](https://x.com/levelsio/status/1894429987006288259)의 “IT WORKS”는 이 문장입니다. Python 웹소켓 서버가 모든 플레이어 위치를 100ms(초당 10회)마다 받아 브로드캐스트한다. 코드는 거의 AI이고, 서버 코드는 Grok 3이 썼다. 빨간 비행기는 실제 사람이다.

이 글을 [Elon Musk가 인용](https://x.com/elonmusk/status/1894744125938819481)했습니다. fxtwitter의 `quote.id`는 `1894429987006288259`입니다. 본문은 “Wow, this is cool.”과 “AI gaming will be massive.”입니다. `created_at`은 `Wed Feb 26 13:39:36 +0000 2025`입니다. 2026-11-10 아침 스냅샷으로 이 인용은 조회 9,157,245, “IT WORKS” 글은 조회 13,468,321, 3월 11일 수익 글은 조회 2,410,046입니다.

2026-11-10 페이지의 상수는 `const WS_SERVER = 'wss://fly.pieter.com:8080`로 시작합니다. 포트 8080의 그 주소가 2월 25일과 같은 프로세스인지는 이 HTML만으로 말하지 않습니다. 서버 Python 소스는 이 글이 받지 않았습니다.

[2025-03-07](https://x.com/levelsio/status/1898056583461916713)에 그는 다른 플레이어 갱신을 10배 더 부드럽게 만들었다고 한 뒤, TCP(웹소켓)는 패킷이 밀리면 정체되고 UDP(WebRTC)는 버린다고 이해했다고 적습니다. 이어서 WebRTC로 바꾸는 편이 낫겠다고 적고, Python 시그널링 서버를 붙이는 안을 물음표로 남깁니다. 전환을 끝냈다는 문장은 그 글에 없습니다.

프레임과 물리의 분리는 [2025-03-02](https://x.com/levelsio/status/1896184528521081242)와 [2025-03-03 “Day 10”](https://x.com/levelsio/status/1896545631692271646)에 있습니다. MacBook Pro M3에서 배터리 20% 위나 전원 연결이면 120 FPS, 20% 아래면 30 FPS가 되고, 게임 속도도 30/120으로 느려진다고 적습니다. 아이폰도 30 FPS에서 게임이 너무 느리다고 합니다. 원인은 `requestAnimationFrame`으로 물리를 갱신한 것입니다. 3월 3일 글이 “Claude-generated code”라고 붙인 조각은 `performance.now()`로 경과를 재고, 프레임 간격을 0.25초로 자른 뒤, `timeAccumulator`가 `1/60` 이상일 때 `deltaTime`을 그 고정 스텝으로 두는 `while`입니다. fxtwitter가 돌려준 본문은 `// update physics here`에서 그 `while`이 끝납니다. `timeAccumulator`를 스텝만큼 빼는 줄은 이 응답에 없습니다. 잘린 붙여넣기일 수 있어, 그 조각을 완전한 루프로 읽지 않습니다.

### 돈은 게임 구매가 아니라 자리였다

무료 플레이가 기본입니다. 그가 공개한 유료 항목은 두 갈래입니다.

[2025-02-27 15:00 UTC](https://x.com/levelsio/status/1895126942233350340)의 첫 수익 글은 F-16 9대 × $29.99 ≈ $270, @sideshiftai 광고 비행선 1대 × $1,000, 합계 $1,270입니다. 같은 글의 통계는 비행한 사람 89,000, 동시 피크 26,000, 모바일 63%입니다.

[2025-03-02 19:33 UTC](https://x.com/levelsio/status/1896282625985102042)는 “after 9 days”입니다. F-16 12대 ≈ $360, 예전 가격의 비행선 17대 = $17,000/mo, 합계 $17,360/mo. 새 비행선 가격은 $2,500/mo. 그는 광고가 월드를 채우지 않게 가격을 두 배로 올리겠다고 적고, 다음 후보는 $5,000/mo, $10,000/mo입니다. F-16 판매는 기대보다 적어 멈췄다고 합니다. 광고 없는 방이나 업그레이드는 Nomads.com처럼 두고, 보통 1%만 광고를 끈다고 적습니다. Fortnite의 Nike, Coca-Cola, McDonald's 광고를 같은 글이 비교로 듭니다. 그 비교의 매출 숫자는 없습니다.

[2025-03-03 22:34 UTC](https://x.com/levelsio/status/1896690611257844116)는 “after 10 days”입니다. 그날 약 16,000명이 비행. 비행선 19대 = $38,000/mo, F-16 12대 ≈ $360, 합계 $38,360/mo. 광고 가격은 $5,000/mo. 그 $360은 그가 월 합계에 더했습니다. $38,360에서 $360이 차지하는 비율은 이 글의 나눗셈으로 0.94%입니다.

[2025-03-06 22:59 UTC](https://x.com/levelsio/status/1897784027186446820)는 “after 13 days”, “$67,000 MRR”, 전날보다 +$10K입니다. 그날 스폰서 이름으로 @boltdotnew(구름), @SynthflowAI, @coderabbitai, @scaledropship을 적습니다. 상시 20–50명, 하루 약 15,000명이라고 합니다. @404mediaco에 보도됐다고 적습니다. 이 글은 그 기사를 열지 않았습니다.

[2025-03-10 18:32 UTC](https://x.com/levelsio/status/1899166414667178314)는 당일 31,000명, 상시 약 50명, $72,000/mo, 누적 296,000명입니다. 첫 비기술 스폰서로 @AtlanticRecords 비행선을 적습니다. 남은 광고는 5자리입니다.

[2025-03-11 22:59 UTC](https://x.com/levelsio/status/1899596115210891751)가 한국어 포스트의 숫자 출처입니다. 전문의 수익 문장은 이겁니다.

> fly.pieter.com has now gone from $0 to $1 million ARR in just 17 days!
>
> Revenue update: $87,000 MRR (which is $1M ARR)
>
> Stats update: 320,000 people have now flown in the game
>
> Whether the MRR is truly sustainable for a year we can only guess, but they ARE subscriptions and they do renew so as long as the game keeps improving it might happen?

$87,000 × 12 = $1,044,000입니다. “$1M ARR”은 그 곱의 반올림입니다. 구독이라는 말과, 1년은 추측이라는 말이 같은 글에 있습니다. 남은 광고는 3자리이고, 링크는 `https://buy.stripe.com/00g5lueHfbdifBudR8`입니다. @basecamp용 UFO와 medvi.org 문장이 적힌 비행선도 이 글에 있습니다.

2월 22일을 1일로 세면 3월 2일은 9일째, 3월 3일은 10일째, 3월 6일은 13일째입니다. 그의 “after 9/10/13 days”와 맞습니다. 같은 세기면 3월 11일은 18일째입니다. “17 days”는 2월 22일과 3월 11일의 날짜 차이(17일)와 맞습니다. 포함 일수와는 하루가 다릅니다. levels.io 정리 글도 “$1M ARR in just 17 days”라고 적습니다.

2026-11-10 페이지에는 그 Stripe 링크가 남아 있습니다. 문장은 “Promote your startup with its own in-game ad”이고, 같은 문단이 `dashboard.simpleanalytics.com/fly.pieter.com`으로 “reach 100,000+ people”을 겁니다. 100,000+는 그 링크의 글자입니다. 대시보드에 로그인하지 않아 그 사이트의 집계를 읽지 않았습니다. F-16 항목은 `class`에 `disabled premium`이 있고, 표시 가격은 `$29.99`, `data-buy-url`은 `https://buy.stripe.com/dR64hq6aJgxC2OI14g`입니다. 버튼이 켜져 결제되는지는 누르지 않았습니다. 페이지 하단에는 `https://dronesim.com` 링크가 있습니다. 그가 이 링크의 광고비를 적은 글은 이번에 연 스레드에 없습니다.

환율은 [Frankfurter](https://www.frankfurter.app/)입니다. `https://api.frankfurter.app/2025-03-11?from=USD&to=KRW`는 `api.frankfurter.dev/v1/`로 301이 났고, 본문은 `{"amount":1.0,"base":"USD","date":"2025-03-11","rates":{"KRW":1453.96}}`입니다. $87,000 × 1,453.96 = 126,494,520원, 한글로 1억 2,649만 4,520원입니다. 2026-11-10을 요청한 응답의 `date`는 `2026-11-09`, 환율은 1,346.79입니다. 같은 곱은 117,170,730원, 1억 1,717만 730원입니다. 그 전 영업일로 받은 2026-11-06은 1,358.73이고, 곱은 118,209,510원입니다. 한국은행 매매기준율은 받지 않았습니다. 세 환율 모두에서 $87,000은 1억 원을 넘습니다. 넘는 금액은 그가 원화로 적은 매출이 아니라, 이 글이 그 MRR에 환율을 곱한 값입니다.

### 그가 공개한 운영 문제

절차는 적지 않습니다. 그가 적은 현상만 적습니다.

[2025-03-02](https://x.com/levelsio/status/1896206933910274172)에 외계 삼각형이 자신을 때리고 사람을 납치하며, 미사일은 클라이언트에 그리지 않는데 어떻게 됐는지 모르겠다고 합니다. 이어서 “the planes are generated on client too”라고 적습니다. [2025-03-08](https://x.com/levelsio/status/1898428193918574984) 기체 목록에는 “Alien Triangle (from the hackers)”가 있습니다. 3월 11일 글에서 그는 UFO 침입을 계기로 UFO를 팔기 시작했다고 적습니다.

[2025-02-28](https://x.com/levelsio/status/1895608319127273954)에는 봇이 스폰 보호가 있어도 사람을 죽여 Cloudflare CAPTCHA가 필요하다고 적습니다. 2026-11-10 페이지는 Turnstile 스크립트를 로드합니다. 그 위젯이 봇을 막는지는 시험하지 않았습니다.

[2025-03-08](https://x.com/levelsio/status/1898458737842806869)에 T키 채팅을 웹소켓으로 붙이며 “Let's HOPE this will not get XSS'd (yes I added protection this time!)”라고 적습니다. 3월 11일에는 XSS를 더 고쳤고, 찾으라고 하지 않으면 AI가 XSS를 보지 않는다고 적습니다. 2026-11-10 페이지의 `escapeHtml`은 `&`, `<`, `>`, `"`, `'` 다섯 문자를 바꿉니다. 이 함수가 모든 입력 경로를 덮는지는 호출부를 따라가지 않았고, 페이로드를 넣지 않았습니다.

[2025-03-10](https://x.com/levelsio/status/1899065515596722414)에는 `fly_server.log`가 flush되지 않아 16GB가 되고 디스크가 100%였다고 합니다. 게임은 느려도 돌았다고 합니다. 같은 날 그는 조인 스팸이 초당 1,000메시지였고, 그 수정과 `.log` 노출 수정, Nginx 설정을 적습니다. 설정 내용은 이 글에 옮기지 않습니다.

### 예시 코드

아래는 그의 저장소가 아닙니다. 라이브 페이지의 far=10000, 그가 공개한 1/60 고정 스텝, 2월 25일 글의 100ms 위치 전송을 한 덩어리로 줄인 골격입니다. 주소는 예입니다.

```javascript
// 예시. fly.pieter.com의 소스가 아니다.
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
const scene = new THREE.Scene();
const plane = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.4, 6),
  new THREE.MeshPhongMaterial({ color: 0xdddddd })
);
scene.add(plane);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

let last = performance.now();
let acc = 0;
const step = 1 / 60;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.25);
  last = now;
  acc += dt;
  while (acc >= step) {
    acc -= step; // 그가 올린 조각의 fxtwitter 본문에는 이 줄이 없다
    // 물리 갱신
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

const ws = new WebSocket("wss://example.invalid/positions");
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      x: plane.position.x,
      y: plane.position.y,
      z: plane.position.z
    }));
  }
}, 100);
```

라이브 페이지의 웹소켓 상수는 `wss://fly.pieter.com:8080`입니다. 메시지 필드의 실제 이름은 이 예시에 없습니다.

## 비즈니스 인사이트

숫자 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다.

**만드는 사람의 자기소개는 1인 운영입니다.** [levels.io](https://levels.io/) 첫 문단은 “I build internet startups by myself: Nomads.com, Remote OK, Hoodmaps, Photo AI and Interior AI. All bootstrapped without funding and just me coding everything on my laptop.”입니다. 같은 페이지의 구독 문장은 “185,267 people read my posts in full by email”입니다. [연락 페이지](https://levels.io/contact-me)는 “I run everything solo without employees”라고 적고, 1:1 콜을 “Starting at $15,000”, 30분 $15,000, 60분 $25,000으로 적습니다. 2026-11-10 fxtwitter의 [@levelsio 소개](https://api.fxtwitter.com/levelsio)는 팔로워 990,982이고, 본문은 PhotoAI.com $68K/m, VibeJam.com $44K/m, InteriorAI.com $23K/m, @X $20K/m, Nomads.com $7K/m, Hotelist.com $3K/m입니다. 이 여섯 줄의 합은 $165K/m입니다. 합은 이 글이 더한 값이고, 감사 자료가 아닙니다. 위치란은 “My book $4K/m”입니다. 이 소개에 `fly.pieter.com`은 없습니다. VibeJam의 $44K/m을 비행 게임 매출로 읽지 않습니다. 급여 대장이나 등기는 보지 않았습니다.

**17일 수익의 1차 자료는 위 트윗 여섯 개입니다.** $1,270에서 $17,360/mo, $38,360/mo, $67,000 MRR, $72,000/mo, $87,000 MRR로 그가 갱신합니다. 초기의 월 합계에는 F-16 일시불 약 $360이 들어 있습니다. 3월 11일 글은 그 일시불을 분리하지 않고 MRR 한 줄만 적습니다. Stripe 잔액 화면은 한국어 포스트의 이미지에도, 이번 글이 연 원문에도 없습니다.

**도달의 1차 숫자는 조회 스냅샷입니다.** 2026-11-10 아침 기준 “IT WORKS” 13,468,321회, 그 글의 Elon 인용 9,157,245회, 3월 11일 수익 글 2,410,046회, 첫 글 1,586,650회입니다. levels.io 정리 글이 화면에 보여주는 카운터는 1,584,687 views, 1,090 likes, 86 reposts입니다. 그 글은 “Someone messaged me saying he counted that the whole fly.pieter.com saga got over 100M views on 𝕏”라고 적습니다. 100M은 그가 전한 다른 사람의 집계입니다. 2025년 2월의 팔로워 수는 이번 조회에서 확인하지 못했습니다.

**지금 사이트는 열려 있고, 이후 매출 숫자는 이 소개에 없습니다.** 게임 페이지는 2026-11-10에도 200입니다. 광고 Stripe 링크와 비활성 클래스의 F-16 $29.99 URL이 HTML에 있습니다. 2026년 들어 월 매출이 0이 됐다는 2차 글이 있습니다. 예는 [WeirdTrue의 2026-09-23 글](https://weirdtrue.com/cases/fly-pieter-1m-arr-17-days)입니다. 그 주장은 당시 바이오의 `$0/month`를 근거로 듭니다. 2026-11-10에 받은 소개문에는 그 줄이 없습니다. 중간 시점의 바이오를 이 글이 보관하고 있지 않으므로, 0원을 사실로 적지 않고, $87,000이 유지됐다는 문장도 적지 않습니다.

**분석/의견.** 이 사례에서 복제되지 않는 입력은 3시간 프롬프트보다 배포 채널입니다. 콜 30분이 $15,000인 사람의 타임라인에 장난감이 붙었고, 그 멀티플레이 글이 Elon의 인용을 받았고, 그 주에 광고 자리를 $1,000에서 $5,000/mo로 올렸습니다. 자리를 산 쪽은 그가 이름을 적은 회사들입니다. Cursor는 공동창업자가 직접 답한 공개 데모를 얻었습니다. 프롬프트를 베끼는 사람에게 그 타임라인과 그 주 광고 수요가 같이 복사되지는 않습니다.

**분석/의견.** 가격을 두 배로 올리겠다는 그의 문장은 광고 재고를 희소하게 두겠다는 뜻입니다. 비행선 한 대의 한계비용으로 그가 적은 것은 설치 시간입니다. 월드를 광고로 채우면 그가 원하는 비행 게임이 아니게 된다고 3월 2일 글이 말합니다. 무료 플레이어는 그 광고를 보는 쪽이고, 그가 예상한 광고 제거 비율은 1%입니다. 이 1%는 Nomads.com에서 가져온 그의 경험치이고, fly의 측정치는 그 글에 없습니다.

**분석/의견.** 개발자에게 남는 작업 목록은 그가 3월 3일과 3월 11일에 적은 쪽에 가깝습니다. 게임 루프는 웹 요청과 다르고, 할 일 목록이 SaaS보다 길다고 그는 적었습니다. 컨텍스트가 3,000줄에서 흔들렸고, 인라인 CSS는 손으로 치웠고, 클라이언트에서 만든 기체가 조작 표면이 됐고, 채팅 XSS와 로그 16GB와 조인 스팸은 출시 뒤에 나왔습니다. AI가 XSS를 스스로 끝까지 보지 않는다는 문장도 그의 글입니다. 3시간 데모의 다음 단위는 모델 요금표가 아니라, 서버 권한과 고정 타임스텝과 로그와 광고 카피입니다. 토큰 청구서는 그가 공개하지 않았습니다. 2026년 Cursor 가격 페이지를 2025년 2월의 비용으로 쓰지 않습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·시점·본인 보고의 한계가 있음 / ❌ 1차 자료와 어긋남

원본은 [@ministerbtc, 2026-11-09 13:16 KST](https://x.com/i/status/2119645152994381859)입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 직원 없이 웹서비스 여러 개를 혼자 굴리는 1인 창업가다 | ⚠️ | [levels.io](https://levels.io/)는 혼자, 펀딩 없이, 노트북으로 코딩한다고 적고 제품 다섯 개를 나열합니다. [연락 페이지](https://levels.io/contact-me)는 “solo without employees”라고 적습니다. 2026-11-10 [X 소개](https://x.com/levelsio)에도 제품이 여러 개입니다. 등기나 급여 대장은 보지 않았습니다. |
| 작년 2월의 일이다 | ✅ | 글을 쓴 날은 2026-11-09 KST입니다. 시작 글은 2025-02-22 17:21 UTC, 2025-02-23 02:21 KST입니다. [정리 글](https://levels.io/fly-pieter-com-vibecoded-flight-simulator)의 날짜 줄은 “22 February, 2025”입니다. |
| 게임을 한 번도 안 만들어 봤다 | ⚠️ | [2025-02-22 19:39 UTC](https://x.com/levelsio/status/1893385114496766155)의 문장입니다. 정리 글은 “my first vibe coded game”이라고 합니다. 그 이전 출시를 전수 조사하지는 않았습니다. |
| AI 코딩 도구에 말로만 시켰다 | ⚠️ | 같은 글의 “by just telling it what I wanted”와 맞습니다. 같은 날 첫 글은 “many questions and comments”, 완료 글은 80%와 롤백을 적습니다. [3월 7일](https://x.com/levelsio/status/1898145978638889210)에는 인라인 CSS를 손으로 옮긴다고 합니다. |
| 3시간쯤이다 | ⚠️ | “I'd say 3 hours”는 본인 어림입니다. 17:21:24 UTC 글과 19:39:23 UTC 완료 글의 차이는 2시간 17분 59초입니다. 광고와 서버가 붙은 버전은 3월 11일까지 이어집니다. |
| 브라우저에서 바로 열리는 파일 하나로 끝냈다 | ❌ | 2월 22일 괄호는 HTML 한 파일입니다. [2월 23일](https://x.com/levelsio/status/1893679316384244046)에는 `fly.html` 3,000줄과 분할 실패가 있습니다. [2월 25일](https://x.com/levelsio/status/1894429987006288259)에는 별도 Python 웹소켓 서버가 있습니다. 2026-11-10 클라이언트는 HTML 한 파일이면서 three.min.js, nipplejs, Turnstile, 웹소켓을 로드합니다. |
| 3시간 버전을 Grok 3이 만들었다 | ❌ | 한국어 본문은 도구 이름을 적지 않습니다. 2월 22일 원문은 Cursor입니다. Grok 3은 [2월 25일 서버 글](https://x.com/levelsio/status/1894390543582371922)에 나옵니다. Claude 3.5와 3.7은 [3월 9일](https://x.com/levelsio/status/1898767487371465079)과 [3월 11일](https://x.com/levelsio/status/1899596115210891751)에 나옵니다. |
| 광고 자리를 월 구독으로 팔았다 | ✅ | [3월 11일](https://x.com/levelsio/status/1899596115210891751)은 “they ARE subscriptions and they do renew”라고 적습니다. 3월 2일·3일 가격은 $2,500/mo, $5,000/mo입니다. F-16 $29.99는 같은 시기 글에서 대수 × 단가의 일시불입니다. |
| 17일 뒤 월 매출이 $87,000이다 | ⚠️ | 3월 11일 글의 라벨은 “$87,000 MRR”입니다. 2월 22일과 3월 11일의 날짜 차이는 17일입니다. 그가 3월 2·3·6일에 쓴 포함 일수로는 3월 11일이 18일째입니다. 현금 입금액을 적은 문장은 아니고, 1년 지속은 “we can only guess”입니다. Stripe 대시보드는 첨부 이미지에 없습니다. |
| 월 1억 원을 넘겼다 | ⚠️ | $87,000 × 1,453.96(Frankfurter, 2025-03-11) = 126,494,520원입니다. 2026-11-09 환율 1,346.79를 곱하면 117,170,730원입니다. 둘 다 1억 원을 넘습니다. 원화 액수는 이 글의 환산이고, 본인 보고 MRR에 의존합니다. “$1M ARR”은 $1,044,000의 반올림입니다. |
| 32만 명이 날아 봤다 | ⚠️ | [3월 11일](https://x.com/levelsio/status/1899596115210891751)은 320,000, [3월 10일](https://x.com/levelsio/status/1899166414667178314)은 296,000입니다. 독립 집계는 없습니다. 라이브 페이지의 “100,000+ people”은 분석 링크의 문구입니다. |

**총평:** 3시간과 HTML 한 파일은 2025-02-22 저녁의 첫 플레이 버전에 대한 그의 말입니다. 한국어 제목이 월 1억과 묶는 대상은 그 뒤 17일에 걸친 광고 구독 MRR입니다. 그 숫자는 $87,000이고, 수익을 발표한 날의 Frankfurter 환율로는 1억 2,649만 원입니다. 같은 문단에서 그는 이 MRR이 1년 갈지는 추측이라고 적었습니다. 2026-11-10 프로필 소개에는 fly.pieter.com 매출이 없고, 게임 페이지는 아직 200으로 열립니다.

## 참고 자료

- 북마크한 X — [@ministerbtc, 2026-11-09 13:16 KST](https://x.com/i/status/2119645152994381859). 본문은 [fxtwitter](https://api.fxtwitter.com/status/2119645152994381859) `code` 200. 첨부 1196×774. 조회 스냅샷은 2026-11-10 08:20 KST 무렵
- 시작 — [@levelsio, 2025-02-22 17:21 UTC](https://x.com/levelsio/status/1893350391158292550). 프롬프트 “make a 3d flying game in browser with skyscrapers”
- 3시간·한 파일 — [2025-02-22 19:39 UTC](https://x.com/levelsio/status/1893385114496766155)
- 3,000줄 — [2025-02-23 15:08 UTC](https://x.com/levelsio/status/1893679316384244046). Cursor 쪽 피드백은 [같은 날 18:41 UTC](https://x.com/levelsio/status/1893732811477078092)
- PeerJS — [2025-02-23 01:11 UTC](https://x.com/levelsio/status/1893468798101094587)
- Three.js far 10,000 — [2025-02-24 20:39 UTC](https://x.com/levelsio/status/1894125123197964542)
- Python·Grok 3 서버 — [2025-02-25 14:14 UTC](https://x.com/levelsio/status/1894390543582371922), 초당 10회는 [16:51 UTC](https://x.com/levelsio/status/1894429987006288259)
- Elon 인용 — [2025-02-26 13:39 UTC](https://x.com/elonmusk/status/1894744125938819481). fxtwitter `quote.id`는 위 “IT WORKS”
- 수익 갱신 — [2월 27일 $1,270](https://x.com/levelsio/status/1895126942233350340), [3월 2일 $17,360/mo](https://x.com/levelsio/status/1896282625985102042), [3월 3일 $38,360/mo](https://x.com/levelsio/status/1896690611257844116), [3월 6일 $67,000 MRR](https://x.com/levelsio/status/1897784027186446820), [3월 10일 $72,000/mo](https://x.com/levelsio/status/1899166414667178314), [3월 11일 $87,000 MRR](https://x.com/levelsio/status/1899596115210891751)
- 루프·조명·채팅·로그 — [FPS가 게임 속도에 묶임](https://x.com/levelsio/status/1896184528521081242), [Day 10 고정 스텝](https://x.com/levelsio/status/1896545631692271646), [PointLight에서 emissive](https://x.com/levelsio/status/1897728697253453865), [클라이언트에서 만든 비행기](https://x.com/levelsio/status/1896206933910274172), [채팅과 XSS 걱정](https://x.com/levelsio/status/1898458737842806869), [16GB 로그](https://x.com/levelsio/status/1899065515596722414), [조인 스팸](https://x.com/levelsio/status/1899166414667178314)
- 정리 글 — [levels.io, 22 February 2025](https://levels.io/fly-pieter-com-vibecoded-flight-simulator). 화면 카운터 1,584,687 views. “my first vibe coded game”, “$1M ARR in just 17 days”
- 라이브 게임 — [fly.pieter.com](https://fly.pieter.com/). 2026-11-10 08:18 KST `HTTP/2 200`, nginx/1.30.6, 493,805바이트. 카메라 far 10000. `wss://fly.pieter.com:8080`. 광고 링크 `https://buy.stripe.com/00g5lueHfbdifBudR8`
- three.js — [PerspectiveCamera 생성자](https://github.com/mrdoob/three.js/blob/dev/src/cameras/PerspectiveCamera.js), 2026-11-10에 읽은 기본 far 2000. 에디터는 [threejs.org/editor](https://threejs.org/editor/)
- 환율 — Frankfurter `2025-03-11` USD/KRW 1453.96, `2026-11-09` 1346.79, `2026-11-06` 1358.73. 요청 URL은 `https://api.frankfurter.app/YYYY-MM-DD?from=USD&to=KRW`이고 응답은 `api.frankfurter.dev/v1/`입니다. 한국은행 매매기준율은 받지 않음
- 자기소개 — [levels.io](https://levels.io/), [contact](https://levels.io/contact-me), [X 프로필](https://x.com/levelsio). 2차 글이 이후 $0를 말하는 예는 [WeirdTrue, 2026-09-23](https://weirdtrue.com/cases/fly-pieter-1m-arr-17-days). 이 글이 받은 2026-11-10 소개에는 그 줄이 없음
