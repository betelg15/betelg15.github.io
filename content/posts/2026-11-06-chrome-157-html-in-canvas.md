---
title: "Canvas에 HTML을 넣으면 Find·번역·a11y가 되나? Chrome 157 HTML-in-Canvas"
date: 2026-11-06
time: "21:15"
slug: chrome-157-html-in-canvas
tags: [Chrome, Web Platform, Canvas, HTML-in-Canvas, 웹개발]
summary: "Chrome 157이 HTML-in-Canvas를 안정판으로 올렸습니다. DOM을 canvas에 그리면서 선택·Find·번역·접근성 트리를 유지한다는 Chrome 공식 글을 기준으로 API와 교차 브라우저 현실을 정리했습니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@clockmaker의 포스트](https://x.com/clockmaker/status/2118490890927067597)(bookmark id `2118490890927067597`)를 계기로 썼습니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-06(KST)에 읽은 [Chrome 공식 블로그](https://developer.chrome.com/blog/html-in-canvas)(Natalia Markoborodova, 2026-10-26), [concepts](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts)·[2D 가이드](https://developer.chrome.com/docs/web-platform/html-in-canvas/2d), [Edge 157 릴리스 노트](https://learn.microsoft.com/en-us/microsoft-edge/web-platform/release-notes/157)(2026-11-05), [WHATWG HTML 이슈 #10650](https://github.com/whatwg/html/issues/10650), [WICG html-in-canvas](https://github.com/WICG/html-in-canvas)입니다.

## 왜 중요한가

캔버스 위에 UI를 올리는 웹앱을 만들면, 오래전부터 같은 갈림길에 섰습니다.

1. **`fillText()`로 글자를 픽셀로 그린다** — GPU·커스텀 셰이더에는 잘 맞지만, 스크린 리더·Find-in-Page(Ctrl/Cmd+F)·브라우저 번역·자동완성·복사/붙여넣기가 기본으로 따라오지 않습니다. Chrome 블로그가 적는 대로, 접근성을 살리려면 보이지 않는 폴백 DOM을 따로 만들어 계속 맞춰야 합니다.
2. **캔버스 위에 HTML을 띄운다(floating overlay)** — DOM의 접근성·타이포는 살리지만, 스크롤·줌·3D 카메라와 **프레임 타이밍이 어긋나** 레이어가 밀리거나 찢어질 수 있고, 오버레이는 항상 캔버스 **맨 위**에만 앉습니다. 매 프레임 `style.transform`을 JS로 다시 쓰는 비용도 Chrome 블로그가 명시합니다.

Chrome 157은 이 둘의 타협을 **공식 안정 API**로 줄이겠다는 발표입니다. 2026-10-26 Chrome for Developers 글의 첫 문장은 이렇게 시작합니다.

> Following a successful origin trial, Chrome 157 marks the official stable release of the HTML-in-Canvas API.

요지는 단순합니다. **진짜 DOM 서브트리를 canvas 안에 두고**, 2D·WebGL·WebGPU에 그 픽셀을 그리면서도, 브라우저는 상호작용·접근성 트리·Find/번역 같은 플랫폼 기능을 유지한다는 것입니다. 개발자 입장에서 궁금한 건 "혁명" 수사보다 다음입니다.

- 마크업·API가 오리진 트라이얼 때와 **같은가**? (`layoutsubtree` 등은?)
- 2D에서는 히트테스트/a11y가 **자동**인가, 3D에서는 **직접** `updateElementGeometry`를 써야 하나?
- Edge는 따라왔는가? Firefox·Safari는?
- 제품에 넣을 때 **이중 경로(폴백)** 비용은 어디에 생기나?

## 기술 설명: HTML을 canvas에 그리는 법

### 준비: `content="drawable"` + `drawable`

[concepts 문서](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts) 기준으로, canvas에 HTML을 넣으려면 속성이 두 개입니다.

- canvas에 **`content="drawable"`** — 자손 DOM을 “숨긴 콘텐츠”가 아니라 **레이아웃 대상**으로 옵트인합니다.
- 그리고 싶은 요소에 **`drawable`** — 독립 paint root로 표시합니다. `drawable` 요소는 자기 서브트리를 잡고, **중첩된 다른 `drawable`은 부모 스냅샷에서 빠집니다.**

오리진 트라이얼 시절의 불리언 `layoutsubtree`는 [Chrome OT 변경 안내](https://developer.chrome.com/blog/html-in-canvas-ot-changes)에서 `content="drawable"`로 이름이 바뀌었습니다. 옛 튜토리얼만 보고 붙이면 157에서 조용히 안 됩니다. **현재 Chrome 문서를 기준으로 맞추세요.**

### 2D: `paint` 이벤트와 `drawElementImage()`

2D에서는 [2D 가이드](https://developer.chrome.com/docs/web-platform/html-in-canvas/2d)처럼 `paint` 핸들러 안에서 `drawElementImage()`를 호출합니다. 기본값으로는 **히트테스트·접근성 기하가 자동으로 따라갑니다.**

아래는 Chrome docs의 패턴을 합친 **최소 2D 예제**입니다(설명용. 프로덕션에서는 `ResizeObserver`로 canvas 그리드를 device pixel에 맞추는 편이 concepts가 권장합니다).

```html
<canvas id="canvas" width="600" height="300" content="drawable">
  <div id="card" drawable style="box-sizing:border-box;width:220px;padding:12px;background:#0f172a;color:#e2e8f0;border-radius:8px;">
    <strong>Hello</strong> from HTML
    <input type="text" value="type here" aria-label="demo input" />
  </div>
</canvas>
```

```js
function supportsHtmlInCanvas() {
  if (typeof document === "undefined") return false;
  const test = document.createElement("canvas");
  test.setAttribute("content", "drawable");
  return test.content === "drawable";
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const card = document.getElementById("card");

if (!supportsHtmlInCanvas()) {
  // 폴백: floating overlay / 대체 UI / html2canvas 계열 등
  console.warn("HTML-in-Canvas not supported; use a fallback path.");
} else {
  canvas.onpaint = () => {
    ctx.reset();
    // (element, dx, dy) — 기본 크기로 (20, 20)에 그림
    ctx.drawElementImage(card, 20, 20);
  };
  // DOM이 안 바뀌어도 한 번 paint를 예약하고 싶을 때
  canvas.requestPaint();
}
```

`drawElementImage()` 오버로드는 가이드에 4가지가 정리돼 있습니다. 위치만, 목적지 박스 스케일, 소스 크롭, 크롭+리사이즈. 옵션으로 `{ preserveElementGeometry: true }`를 주면 **자동 기하 동기화를 끄고** 직접 `updateElementGeometry()`로 맞출 수 있습니다.

브라우저가 `drawable` 자손의 레이아웃·텍스트·스타일이 바뀔 때마다 canvas에 **`paint` 이벤트**를 보냅니다. `CanvasPaintEvent`의 `changedElements`에는 이번 프레임에 시각적으로 바뀐 drawable만 들어갑니다. `paint` 안에서 그린 픽셀은 **이번** 렌더 업데이트에 반영되지만, `paint` 안에서 DOM 스타일을 바꾸면 **다음** 프레임에 보입니다 — 문서가 명시하는 프레임 생명주기입니다.

### 3D: 텍스처 + `updateElementGeometry`

WebGL/WebGPU에서는 HTML이 텍스처로 복사된 뒤 셰이더가 임의로 매핑하므로, 브라우저가 클릭·a11y 경계를 스스로 알 수 없습니다. Chrome 블로그 quickstart는 대략 이렇게 적습니다.

```js
// 3D에서는 변환을 만들어 전달
const transform = new DOMMatrix().translate(x, y);
canvas.updateElementGeometry(myElement, { canvasTransform: transform });
```

히트 스택은 기본으로 “마지막에 기하를 갱신한 요소가 위”입니다. 배경을 나중에 갱신하면서 포그라운드 클릭을 빼앗지 않으려면 `{ preserveHitTestOrder: true }`를 씁니다. 화면에서 빼려면 `clearElementGeometry()`.

### 좌표계 한 줄 요약

concepts가 강조하는 함정은 **CSS px · device px · canvas grid**가 동시에 존재한다는 점입니다. `drawable` HTML은 CSS px로 레이아웃되고, `drawElementImage`의 `dx/dy` 등은 **canvas grid** 단위입니다. 그리드가 물리 픽셀과 1:1이 아니면 안티앨리어싱이 두 번 겹쳐 흐려질 수 있어, `ResizeObserver` + `devicePixelContentBoxSize`로 그리드를 맞추라고 합니다.

### 프레임워크 쪽 (Google 공식 지원 아님)

Chrome 블로그·docs는 Three.js / PlayCanvas / Babylon.js / PixiJS / CanvasUI 이름을 나열하면서, **커뮤니티·서드파티이며 Google/Chrome 팀이 개발·유지·공식 지원하지 않는다**고 두 번 못 박습니다.

| 라이브러리 | Chrome 블로그가 적은 진입점 |
|---|---|
| Three.js | 실험적 `THREE.HTMLTexture` |
| PlayCanvas | `setSource()` (+ `paint` 리스너) |
| Babylon.js | `BABYLON.HtmlTexture` |
| PixiJS | `v8.19.0`의 `HTMLSource` |
| CanvasUI | HTML-in-Canvas용 컴포넌트 라이브러리 |

폴백으로 블로그가 적는 이름은 floating overlay, `three-html-render`, `html2canvas`, `dom-to-image`입니다. 역시 서드파티 고지입니다.

### 기능 탐지

Chrome이 권장하는 탐지는 `content` 반영 여부입니다.

```js
export function supportsHtmlInCanvas() {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("content", "drawable");
  return canvas.content === "drawable";
}
```

Modern Web Guidance 쪽에는 `('content' in HTMLCanvasElement.prototype)` 형태도 보입니다. 프로덕션에서는 **현재 Chrome docs의 권장 탐지 + 실제 `drawElementImage` 존재**를 함께 보는 편이 안전합니다(**분석/의견**).

## 비즈니스 인사이트

숫자·제품 서술은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다. Chrome·Edge 사용자 수·점유율·매출은 이 글이  invent 하지 않습니다.

**Chromium 엔진 먼저.** Chrome 블로그는 157 안정 출시를 선언하고, [Edge 157 릴리스 노트](https://learn.microsoft.com/en-us/microsoft-edge/web-platform/release-notes/157)(게시 기준 2026-11-05)는 “HTML-in-canvas”와 `drawElementImage`, paint 이벤트, 히트테스트/a11y용 geometry sync를 나열합니다. 같은 Chromium 계열이 제품 경로에 들어왔다는 1차 신호입니다.

**Firefox·Safari 출하를 이 글은 주장하지 않습니다.** WHATWG [html#10650](https://github.com/whatwg/html/issues/10650)은 2024-09-26에 열린 “HTML-in-Canvas” 이슈로, WICG에서 배양 중이며 논의가 2026까지 이어집니다. 스펙 PR 언급은 이슈 스레드에 있으나, **Baseline이거나 Firefox/Safari가 이미 실었다고 말할 1차 출하 공지는 이 글이 확인하지 못했습니다.** 커뮤니티 사이트(html-in-canvas.dev 지원 표, Buildful 등)는 Firefox 미구현·Mozilla standards-positions #1076을 말하지만, 2차 자료로만 취급합니다.

**분석/의견.** 교차 브라우저 SaaS(디자인 툴, 화이트보드, 브라우저 게임, 크리에이티브 편집기)는 당분간 **Chromium 경로 + 폴백(오버레이/대체 UI)** 이중 유지비가 남습니다. Chrome 블로그가 줄이는 비용은 “매 프레임 `style.transform` 문자열 파싱·스타일 재계산”과 “invisible DOM a11y 동기화” 쪽이고, 그 이득은 **Chromium 사용자 세그먼트**에 먼저 옵니다. 표준 이슈가 열린 상태라, 엔진마다 세부 동작이 어긋날 **이중 작성(dual-write) 리스크**는 아직 닫히지 않았습니다.

**누가 이득을 보나 (Chrome이 적은 use case 기준).** 블로그 Primary use cases는 (1) 대형 canvas 기반 앱의 UI를 workspace에 직접 그려 접근성을 올리고 번들을 줄이는 것, (2) WebXR·게임에서 터미널·책 같은 **장면 안 인터랙티브 DOM**, (3) HTML 타이포 + 셰이더를 합성해 `toDataURL`/`toBlob`/`captureStream`으로 내보내는 미디어 툴, (4) HTML을 픽셀처럼 조작하는 표현적 UI입니다. Find·번역·autofill·확장 프로그램·DevTools·크롤러/AI 에이전트 인덱싱이 “캔버스 픽셀”이 아니라 **실제 DOM**에 붙는다는 점이, Figma류·문서형 canvas SaaS의 접근성·국제화 재구현 부담을 줄일 수 있는 자리입니다.

**분석/의견 — 비용.** 국제화·타이포 JS 엔진을 canvas용으로  bundling 하던 팀은, Chromium에서는 CSS 레이아웃에 기대는 쪽으로 옮길 여지가 있습니다(Chrome 블로그가 fillText 경로의 “큰 JS 레이아웃 엔진” 비용을 한계로 적음). 다만 Firefox/Safari 폴백을 유지하면 **번들 절감은 전체 사용자 기준으로 부분적**입니다. 3D 엔진은 Three/Babylon/Pixi/PlayCanvas 어댑터가 진입 비용을 낮추지만, 블로그 고지대로 **Google 지원이 아니므로** 버전 핀·실험 API 깨짐을 제품 리스크로 잡아야 합니다.

**분석/의견 — 경쟁.** 당장 “캔버스 UI + 플랫폼 a11y”를 Chromium에서 네이티브에 가깝게 쓸 수 있다는 건 엔진 기능 선점입니다. 동시에 WHATWG 이슈가 열려 있어, 스펙이 굳기 전에 API 표면이 또 바뀔 수 있습니다(이미 `layoutsubtree` → `content="drawable"`, WebGL 메서드 이름 변경이 OT 안내에 있습니다). 장기 베팅은 “Chrome 전용 최적화”보다 **탐지 + 폴백 + 표준 트래킹** 쪽에 가깝습니다.

2차 자료인 [Buildful](https://buildful.ai/blog/html-in-canvas)은 Chrome `157.0.8103.39`, 전체 안정 2026-11-03, Edge 157, Firefox/Safari 없음, WHATWG stage 3을 적습니다. **버전 빌드 번호·stage 라벨은 Chrome/Edge/WHATWG 1차 문서보다 우선하지 않습니다.** 인용할 때는 secondary로 표시하세요.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·수사가 다름 / ❌ 1차 자료와 어긋남

원본 X([@clockmaker](https://x.com/clockmaker/status/2118490890927067597))의 요지를, 이 환경에서 읽은 공개 요약과 부모 에이전트가 정리한 주장 단위로 Chrome 블로그·Edge 노트와 대조했습니다. X 본문 전문을 이 글이 보증하지는 않습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| Chrome 157이 나왔고 HTML-in-Canvas가 공식(안정)으로 실렸다 | ✅ | Chrome 블로그 2026-10-26: “Chrome 157 marks the official stable release of the HTML-in-Canvas API.” 오리진 트라이얼 성공 뒤 안정판이라는 문장. |
| HTML/CSS 레이아웃을 canvas에 넣어 효과를 줄 수 있다 | ✅ | 블로그 benefits: CSS 타이포·멀티라인/양방향, 폼 컨트롤, 셰이더·픽셀 수준 조작 use case. concepts/`drawElementImage`로 DOM 서브트리를 canvas에 그림. |
| 선택·복사·Find·번역·a11y가 canvas 안 HTML에 붙는다 | ✅ | 블로그 Key benefits 목록(선택/복사/컨텍스트 메뉴, a11y 트리, translate·autofill·Find-in-Page, 확장, DevTools, 크롤/AI, export). |
| Edge도 157에서 HTML-in-canvas를 적는다 | ✅ | Edge 157 릴리스 노트(2026-11-05): HTML-in-canvas, `drawElementImage`, paint, geometry sync. |
| Firefox·Safari에도 이미 있다 / Baseline이다 | ❌ | 이 글이 확인한 1차 출하 공지 없음. WHATWG #10650은 열린 이슈·WICG 배양. Baseline 주장 금지. |
| API 이름은 예전부터 쓰던 `layoutsubtree` 그대로다 | ❌ | OT 변경 안내: `layoutsubtree` → `content="drawable"`. 자손은 `drawable` 속성. 옛 속성만으로는 157 경로와 어긋남. |
| 2D·3D 모두 브라우저가 히트/a11y 기하를 알아서 맞춘다 | ⚠️ | 2D는 `drawElementImage` 기본 자동 동기화. WebGL/WebGPU는 `updateElementGeometry` 필요(블로그·concepts). |
| Three.js 등이 “공식 지원”이다 | ⚠️ | 이름·진입점은 블로그에 있으나, **커뮤니티/서드파티·Google 미지원** 고지가 붙음. Three는 “experimental”. |
| “혁명급”으로 웹 표현이 바뀐다 | — | **의견/수사.** 사실 표에서 ✅/❌하지 않음. 플랫폼 갭(DOM↔canvas)을 줄인다는 방향은 블로그와 맞지만, 교차 엔진·표준 미완은 그대로. |

**총평:** Chrome 157 안정 출시와 “DOM을 canvas에 그리면서 브라우저 기능을 유지한다”는 핵심은 공식 글과 맞습니다. X의 “혁명”은 제품·표현 측면의 기대치이고, 엔지니어링 현실에서는 **Chromium(+Edge 157) 先行 · 폴백 유지 · OT 이후 속성/메서드 이름 변경**을 같이 봐야 합니다.

## 참고 자료

- Natalia Markoborodova, *HTML-in-Canvas in Chrome 157…*, Chrome for Developers (2026-10-26) — [blog](https://developer.chrome.com/blog/html-in-canvas)
- Chrome docs — [HTML-in-Canvas overview](https://developer.chrome.com/docs/web-platform/html-in-canvas) · [concepts](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts) · [2D](https://developer.chrome.com/docs/web-platform/html-in-canvas/2d)
- Origin trial API 변경 — [html-in-canvas-ot-changes](https://developer.chrome.com/blog/html-in-canvas-ot-changes) (`layoutsubtree` → `content="drawable"`)
- Microsoft Edge — [Release notes for Edge 157](https://learn.microsoft.com/en-us/microsoft-edge/web-platform/release-notes/157) (2026-11-05)
- Standards — [WHATWG html#10650 HTML-in-Canvas](https://github.com/whatwg/html/issues/10650) · [WICG/html-in-canvas](https://github.com/WICG/html-in-canvas)
- 2차(주의) — [Buildful: HTML-in-Canvas in Chrome 157](https://buildful.ai/blog/html-in-canvas) — 빌드 번호·stage 라벨은 1차 문서와 충돌할 수 있음
- 원본 X 포스트 — [@clockmaker](https://x.com/clockmaker/status/2118490890927067597) (bookmark id `2118490890927067597`)
