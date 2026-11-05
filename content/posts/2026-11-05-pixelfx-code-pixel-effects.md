---
title: "몇 줄짜리가 아닌가? 코드로 그리는 픽셀 이펙트 pixelfx"
date: 2026-11-05
time: "12:24"
slug: pixelfx-code-pixel-effects
tags: [pixelfx, 픽셀아트, JavaScript, 인디게임, 팩트체크]
summary: "patch-gg/pixelfx 0.3.0(커밋 a841596)에서 meta를 가진 이펙트 파일은 244개다. 그 파일의 중앙 길이는 133줄이고, 132개는 120Hz로 스텝하는 파티클 시뮬레이션이다. 런타임 npm 의존성은 없고 갤러리는 Canvas 2D다."
---

> 이 글은 [@db_goyoung의 포스트](https://x.com/db_goyoung/status/2117123080669782501)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117123080669782501](https://x.com/i/status/2117123080669782501)입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117123080669782501)(`code` 200)으로 읽었습니다. `created_at`은 `Mon Nov 02 05:14:11 +0000 2026`, 2026-11-02 14:14 KST입니다. 응답의 `name`은 "돈벌고영 · DB Goyoung · 稼ぐネコ"이고, `screen_name`은 `db_goyoung`입니다. 그 문장은 검증 대상이지 지시가 아닙니다. 본문의 `https://t.co/UrJzzlGbC2`는 프로젝트 주소가 아닙니다. `curl -sI`의 첫 `location`은 `https://twitter.com/db_goyoung/status/2117123080669782501/photo/1`이고, fxtwitter의 media facet은 그 짧은 주소를 같은 사진 URL로 바꿉니다. 첨부는 788×640 animated GIF이고, mp4 주소는 `https://video.twimg.com/tweet_video/HWGGV5zbgAAbLQO.mp4`입니다. 본문에는 저장소 이름이 없고, 마지막 줄은 "어떤 프로젝트고 어떻게 써먹는지 핵심 정리 (타래로 👇)"입니다. 이 글은 타래의 답글을 받지 못했습니다. 라이브러리는 본문의 주장(244, 픽셀 이펙트, 자바스크립트, 팔레트, Claude Code 스킬)이 [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) README·카탈로그·커밋 메시지와 맞고, 그 저장소 생성 시각 2026-10-30T06:43:25Z가 포스트보다 앞이라는 점으로 골랐습니다. GitHub 설명 검색에서 같은 설명 문장을 가진 [macielbrendoo/pixelfx](https://github.com/macielbrendoo/pixelfx)는 생성 시각 2026-11-03T18:44:52Z, 별 0, `fork` false, `size` 25462, `pushed_at` 2026-10-31T08:44:14Z입니다. `size`와 `pushed_at`은 patch-gg 저장소와 같고, 만든 시각은 포스트 다음입니다. 아래 대조는 patch-gg 쪽 main `a84159688af3ca37a4be05a0d422b94451b2e24e`(커밋 시각 2026-10-31T08:41:17Z, 작성자 이름 `rehan-remade`)의 README·`docs/CATALOG.md`·`docs/AUTHORING.md`·`src/core/fx.js`·`src/fx/`·`package.json`·`LICENSE`·`NOTICE.md`입니다. 같은 날 `GET /repos/patch-gg/pixelfx`의 `Date`는 `Thu, 05 Nov 2026 03:22:17 GMT`, `stargazers_count`는 **4,800**, `forks_count`는 **644**입니다. 이 글은 이펙트를 렌더하거나 `tools/render.mjs`를 실행하지 않았습니다.

## 왜 이 라이브러리가 인디 이펙트에 닿는가

포스트의 본문은 인디 게임을 만드는 사람에게 244가지 픽셀 이펙트가 오픈소스로 나왔고, PNG 에셋 대신 짧은 자바스크립트가 실시간으로 그리며, 팔레트는 코드 한 줄이고, Claude Code용 스킬이 새 이펙트를 만든다는 문장입니다.

저장소는 있습니다. GitHub 전체 이름은 `patch-gg/pixelfx`, 설명 문장은 "244 pixel art effects, every one a small piece of code. Plus a Claude Code skill to make your own.", SPDX는 MIT, 기본 브랜치는 `main`, 생성 시각은 2026-10-30T06:43:25Z, `pushed_at`은 2026-10-31T08:44:14Z, 아카이브 상태는 아닙니다. 주 언어 필드는 JavaScript입니다. `homepage`는 [patch-gg.github.io/pixelfx](https://patch-gg.github.io/pixelfx/)입니다. 조직 `patch-gg`의 API `blog`는 `https://patch.gg/`이고, 그 페이지를 2026-11-05에 열었을 때 보이는 문장은 "Coming soon."과 "Patch is almost ready."입니다. 직원 수나 매출은 그 페이지에 없습니다. `package.json` 버전은 `0.3.0`이고, 그 문자열은 커밋 메시지 "pixelfx 0.3.0: give the effects a body that performs them"에도 있습니다. 릴리스 목록과 태그 목록은 이 날 API에서 빈 배열이었습니다. npm 레지스트리 `GET /pixelfx`는 `Date: Thu, 05 Nov 2026 03:19:50 GMT`에 HTTP 404, 본문 `{"error":"Not found"}`였습니다.

개발자에게 닿는 지점은 "고퀄리티 이펙트 244개"라는 형용사보다, 프레임을 그림 파일로 들고 있지 않다는 점입니다. README가 브라우저 쪽으로 적는 이름은 canvas, Phaser, PixiJS, Kaplay, three.js이고, 그 경로는 코드를 직접 부릅니다. Godot, Unity, GameMaker, Defold, LÖVE, Bevy 쪽으로 적는 경로는 `node tools/render.mjs ice/frost-nova --sheet`가 만드는 투명 PNG와 Aseprite 스타일 JSON입니다.

## 이펙트 하나는 파일이고, 그림은 두 버퍼다

README의 개수 마커는 `<!-- count -->244<!-- /count -->`이고, [docs/CATALOG.md](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/docs/CATALOG.md) 첫 문장은 "244 effects in 21 categories"입니다. 카탈로그 표의 범주 합도 244입니다. moves 12, fire 12, explosions 12, water 12, ice 10, lightning 11, sci-fi 12, melee 12, impacts 11, projectiles 13, spawn & death 10, arcane 12, holy 10, shadow 12, status 13, nature 13, weather 12, ui 12, pickups 11, transitions 10, critters 12. `src/fx/categories.js`의 배열도 이 21개입니다.

`src/fx` 아래 `.js` 파일은 266개입니다. 그중 `export const meta`가 있는 파일은 244개입니다. 나머지 22개는 범주 20곳의 `_lib.js` 20개, 생성 파일 `src/fx/index.js`, 범주 목록 `src/fx/categories.js`입니다. moves에는 `_lib.js`가 없습니다. `src/fx/fire/_lib.js` 첫 주석은 앞의 `_`가 도구가 그 파일을 이펙트로 세지 않게 한다고 적고, 불꽃 혀·연기 레시피가 Sprite Fusion의 오픈소스 fire에서 왔으며 MIT, Copyright (c) 2026 Hugo Duprez라고 적습니다.

커밋 메시지는 "244 effects, 73 of them acted."입니다. `export const act`가 있는 파일은 73개이고, 그 가운데 moves 12개는 전부 act를 가집니다. 나머지 61개가 README가 "61 effects with a character, and the 12 moves"라고 적는 61과 같습니다. `.claude-plugin/plugin.json`의 description은 "ready-made effects in 20 categories"라고 적습니다. 카탈로그와 `categories.js`의 범주는 21개입니다.

그리는 방식은 두 가지이고, README "how it works"와 [docs/AUTHORING.md](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/docs/AUTHORING.md)가 이름을 붙입니다.

- **Pure.** `draw(p, t, o)`를 내보냅니다. 시각 `t`만으로 그 프레임이 정해져서 루프가 이음새 없이 이어진다고 README가 적습니다. 이 커밋에서 `export function draw` 또는 `export const draw`가 있고 `create` export는 없는 meta 파일은 **112개**입니다.
- **Simulated.** `create(o)`를 내보냅니다. 파티클과 파편, 빛을 상태로 두고 스텝합니다. meta 파일 중 `create` export만 있는 것은 **132개**입니다. 둘 다 내보내거나 둘 다 없는 meta 파일은 0개입니다.

라이브 인스턴스는 `src/core/fx.js`의 `createFx`입니다. 시뮬레이션의 `update`는 호출자의 `dt`를 120Hz 이하로 나눕니다. 주석의 이유는 프레임 레이트가 달라도 같게 보이게 한다는 것입니다.

```js
update(dt) {
  t += dt;
  if (!impl.update) return;
  // simulations step at 120 Hz or finer whatever the caller's frame rate, so they look the same everywhere
  const n = Math.max(1, Math.ceil(dt * 120 - 1e-9));
  for (let i = 0; i < n; i++) impl.update(dt / n, opts);
},
```

버퍼는 두 개입니다. `createFrame`이 만드는 객체는 `{ w, h, ox, oy, color, light }`이고, `color`와 `light`는 `Uint32Array`입니다. 주석은 Sprite Fusion VFX 프레임과 같은 모양이라고 적습니다. `color`는 불투명·디더·반투명 픽셀이고, `light`는 위에 더하는 글로우입니다. `composite`는 그 둘을 RGBA 바이트로 섞습니다. `bg`가 `null`이면 투명입니다.

갤러리 `gallery/app.js`는 `canvas.getContext("2d")`, `createImageData`, `putImageData`입니다. `src/` 안에서 `WebGL`이나 `getContext` 문자열은 검색되지 않았습니다. WebGL이라는 단어가 있는 곳은 스킬 문서입니다. [skills/pixelfx/SKILL.md](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/skills/pixelfx/SKILL.md)는 Canvas나 WebGL 게임에서 코드를 직접 쓰고, WebGL 엔진이면 합성된 RGBA를 텍스처로 올리라고 적습니다. 생성기가 셰이더를 컴파일한다는 문장은 그 파일에 없습니다.

시드는 이펙트 옵션입니다. AUTHORING.md는 `Math.random()`과 `Date`를 쓰지 말라고 적습니다. 이 커밋의 `src/fx`에서 `Math.random` 문자열은 검색되지 않았습니다.

팔레트는 이펙트 파일을 고치지 않는 옵션입니다. `ice/frost-nova.js`의 meta는 어두운 색에서 밝은 색으로 가는 hex 배열을 기본값으로 가집니다.

```js
export const meta = {
  name: "Frost nova",
  desc: "Frost spirals into a spinning snowflake, then a wave blooms three rings of ice crystals round the caster; snow drifts, frost creeps, and the ice melts back into the floor.",
  tags: ["ice", "nova", "aoe", "frost", "magic", "one-shot"],
  size: [288, 192],
  origin: [144, 150],
  duration: 3.4,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: ["#151a3d", "#212f6b", "#2c58aa", "#3a8bd8", "#62c8f4", "#a6ecff", "#dcfbff", "#ffffff"], reach: 104, seed: 4 },
};
```

`resolveOptions`는 호출자가 넘긴 램프의 길이가 기본값과 다르면 `fit`으로 기본 길이에 다시 샘플합니다. 그래서 이펙트 안의 `C[6]` 같은 인덱스가 호출자의 배열 길이와 어긋나지 않습니다. README의 파란 불꽃 예는 렌더 도구의 `--opts`입니다.

```bash
node tools/render.mjs fire/torch --gif --opts '{"palette": ["#102","#215","#43a","#8cf","#cff","#fff"]}'
```

같은 README는 힐이 분홍으로 빛날 수 있다고 적습니다. "1초"라는 측정은 README, AUTHORING, `fx.js`에 없습니다.

줄 수는 이 커밋의 meta 파일 244개를 `wc -l`과 같이 개행 수로 센 값입니다. 최솟값은 `moves/pistol-shots.js` **38줄**입니다. 그 파일은 자기 픽셀 루프가 없고 `chain()`으로 `muzzle-pistol`, `bullet-tracer`, `hit-spark`를 시각에 맞춰 부릅니다. 정렬했을 때 122번째와 123번째가 둘 다 **133줄**(`arcane/blink-out.js`, `melee/thrust.js`)이라 중앙값은 133줄입니다. 평균은 147.4줄, 합은 35,965줄, 최댓값은 `spawn/summon-rise.js` **412줄**입니다. 카탈로그가 예로 드는 `ice/frost-nova.js`는 215줄입니다. README의 "small piece of code"는 저장소의 표현이고, 포스트의 "단 몇 줄"과 같은 문장은 아닙니다.

## 게임 루프에 넣는 호출

README의 브라우저 예는 의존성 없이 `pixelfx`와 `pixelfx/fx/ice/frost-nova`를 import합니다. `package.json`의 `exports`는 `"."`가 `./src/core/index.js`, `"./fx/*"`가 `./src/fx/*.js`입니다. 설치 줄은 `npm i github:patch-gg/pixelfx`이거나, `src/core`와 쓸 이펙트 파일을 복사하는 것입니다. `engines.node`는 `>=18`입니다. `dependencies` 키는 없고, `devDependencies`는 `esbuild` `^0.25.10` 하나입니다.

```js
import { createFrame, clearFrame, createFx, composite } from "pixelfx";
import * as frostNova from "pixelfx/fx/ice/frost-nova";

const frame = createFrame(320, 180);                   // your game's pixel resolution
const img = new ImageData(320, 180);
const fx = createFx(frostNova, { x: 160, y: 140 });   // also: flip, angle, seed, palette, light...

function tick(dt) {
  fx.update(dt);
  clearFrame(frame);
  fx.draw(frame, "back");                              // behind characters
  drawCharacters();
  fx.draw(frame, "front");
  composite(frame, img.data, backgroundColor);         // color, then light added on top
  ctx.putImageData(img, 0, 0);                         // scale up with image-rendering: pixelated
}
```

`createFx`가 돌려주는 객체의 메서드는 `update(dt)`, `draw(frame, layer)`, `stop()`, `done()`입니다. `draw`의 `"back"`은 캐릭터 뒤, `"front"`는 앞이고, layer를 생략하면 둘 다입니다. `stop()` 이후 페이드 상수는 `FADE = 0.3`초입니다. `done()`은 그 페이드가 끝났거나, 루프가 아닌 이펙트가 `duration`에 도달했을 때 참입니다.

캐릭터가 있는 이펙트는 `createAct`로 몸과 타격을 같이 재생합니다. README가 예로 든 `melee/sword-slash`의 act 데이터는 준비 자세, 스냅, 0.14초 히트스톱을 가집니다.

```js
export const act = {
  target: { x: 58 },
  poses: [
    [-0.55, GUARD],
    [-0.3, WIND_UP],
    [0, CUT, "snap"],
    [0.06, FOLLOW_THROUGH, "snap"],
    [0.86, GUARD],
  ],
  hits: [{ t: 0.06, stop: 0.14, shake: 0.18, amp: 2, push: 2.8, straw: 18 }],
};
```

`src/core/rig.js`는 고정 길이 뼈의 3D 골격을 픽셀로 그린다고 README가 적고, 포즈는 12fps 스텝, 파티클은 풀 레이트입니다. 스톡 캐릭터 크기는 AUTHORING.md의 24×38 px(`actor: 2`)입니다. 이 글은 그 골격을 실행해 보지 않았습니다.

다른 엔진용 시트는 `tools/render.mjs`입니다. `--sheet`는 투명 PNG와 JSON을 쓰고, README는 그 JSON을 Aseprite 스타일(프레임 사각형, duration, `meta.pixelfx`의 fps·loop·columns·pivot)이라고 적습니다. Phaser의 atlas 로더와 Godot·Unity의 Aseprite 임포터가 읽는다고 같은 문단이 적습니다. `node tools/sheets.mjs`는 라이브러리 전체를 `sheets/`로 내보냅니다. 저장소에 미리 구워 둔 이펙트 PNG는 없습니다. 이미지 파일은 `docs/readme/montage.gif`와 `docs/readme/acts.gif` 두 개입니다.

새 이펙트의 공식 루프는 `node tools/new.mjs`, `node tools/render.mjs`(콘택트 시트), `node tools/check.mjs`(새어 나감, 이음새, 시드 없는 난수, 느린 프레임)입니다. Claude Code 스킬은 `skills/pixelfx`이고, README의 설치는 `/plugin marketplace add patch-gg/pixelfx` 다음 `/plugin install pixelfx@pixelfx`이거나 그 디렉터리를 `~/.claude/skills/`에 복사하는 것입니다. 스킬 본문이 방법을 돌리는 문장은 draft, render, look, refine입니다. 한 번의 프롬프트가 끝난다는 초 단위 측정은 그 파일에 없습니다.

## 라이선스

`LICENSE`는 MIT입니다. 저작권 줄은 `Copyright (c) 2026 Patch`와 `Copyright (c) 2026 Hugo Duprez`입니다. README는 코드와 이펙트를 상업 이용을 포함해 뭐든 쓸 수 있다고 적습니다. 조건은 저작권 고지와 허가 고지를 사본에 남기는 것입니다.

[NOTICE.md](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/NOTICE.md)는 세 갈래를 나눕니다. `src/core/sim.js`와 파일 머리에 그렇게 적은 이펙트는 Hugo Duprez의 Sprite Fusion 픽셀 VFX를 고친 것이고 MIT입니다. `src/core/act.js`는 Hollow Crown(`github.com/rehan-remade/hollow-crown`, Copyright (c) 2026 rehan-remade, MIT)의 스킬 재생을 고친 것입니다. `gallery/fonts`의 Patch Pixel은 Patch 소유이고 이 저장소의 MIT에 포함되지 않습니다. 폰트 NOTICE의 문장은 "© 2026 Patch. All rights reserved."입니다.

이 커밋의 작성자 이메일은 `rehan@remade.ai`입니다. 그 사실과 Hollow Crown 저장소 이름의 사용자 이름이 같다는 것 이상으로, 회사 관계를 이 글은 적지 않습니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 에셋 스토어 판매량과 점유율은 이 글이 측정하지 않았습니다.

비용으로 문서가 적는 것은 라이선스 가격이 아닙니다. MIT는 사용·복제·수정·배포·판매를 허락하고, 고지를 남기라고 합니다. 돈으로 확인한 비교 대상은 스프라이트 편집기 Aseprite의 Steam 목록입니다. 2026-11-05 `Date: Thu, 05 Nov 2026 03:22:57 GMT`의 `store.steampowered.com/api/appdetails?appids=431730&cc=us`에서 `price_overview.final`은 1999, `final_formatted`는 `$19.99`, `discount_percent`는 0, `currency`는 USD입니다. [aseprite.org](https://www.aseprite.org/)는 스프라이트 시트를 `.png`와 `.json`으로 내보낸다고 적습니다. pixelfx README가 `--sheet` 산출물을 Aseprite 스타일 JSON이라고 부르는 이유와 그 페이지의 내보내기 항목은 같은 파일 형식 이름입니다. $19.99는 그 편집기의 Steam 미국 표시 가격이고, 픽셀 VFX 팩의 가격이 아닙니다. aseprite.org 다운로드 HTML에서 이 글이 금액 문자열을 찾지는 못했습니다.

npm에 패키지가 없는 상태에서 README의 설치는 GitHub 의존성입니다. 버전 문자열 `0.3.0`은 `package.json`과 커밋 메시지에 있고, 태그된 GitHub 릴리스는 이 날 목록에 없습니다. 커밋을 고정하지 않으면 `github:patch-gg/pixelfx`가 가리키는 트리는 이동할 수 있습니다. 이 글이 읽은 트리는 `a841596`입니다.

**분석/의견.** 바로 이득이 가는 자리는 이미 Canvas나 Phaser, PixiJS 위에서 픽셀 해상도로 그리는 인디 게임입니다. 불꽃을 파랑으로, 힐을 분홍으로 바꾸는 일이 시트 전체를 다시 그리는 일이 아니라 `palette` 배열을 넘기는 일이 됩니다. 그 배열이 보기 좋은지는 저장소가 보장하지 않고, AUTHORING.md는 콘택트 시트를 보고 고치라고 적습니다.

Godot나 Unity로 가는 자리는 다릅니다. 런타임에 자바스크립트 이펙트를 호출하는 API는 README의 그 엔진 절에 없습니다. 그 절의 산출물은 PNG 시트입니다. 시트는 용량이 다시 생기고, 팔레트를 바꾸면 시트를 다시 구워야 합니다. 라이브 경로에서 사라진 PNG가, 비JS 경로에서는 빌드 산출물로 돌아옵니다. 유료 픽셀 팩과 같은 자리에 넣는 것은 코드 런타임이 아니라 그 시트입니다.

손해가 생기는 읽기는 세 가지입니다. 갤러리 폰트까지 MIT라고 보면 NOTICE의 All rights reserved가 빠집니다. "순수"를 저장소의 Pure로 읽으면 132개의 `create()` 시뮬레이션이 빠집니다. 스킬이 한 번에 출고 품질을 만든다고 보면, 스킬과 AUTHORING이 적는 루프(그리고 초안을 눈으로 보는 단계)가 빠집니다. 별 4,800은 2026-11-05 12:22 KST의 API 값이고, 도입 비용의 측정이 아닙니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름 / ❌ 사실 아님

### @db_goyoung 포스트 (2026-11-02)

| 주장 | 판정 | 근거 |
|---|---|---|
| 불꽃, 폭발, 얼음 마법, 베기, 날씨 효과가 들어 있다 | ✅ | [카탈로그](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/docs/CATALOG.md)와 README 표. fire 12, explosions 12, ice 10, melee 12(`sword-slash`, `double-slash` 포함), weather 12. 범주는 21개. |
| 244가지다 | ✅ | README 개수 마커, 카탈로그 첫 문장, 커밋 메시지, `export const meta` 파일 244개. `src/fx`의 `.js`는 266개이고 차이는 `_lib.js` 20개와 `index.js`, `categories.js`다. [fire/_lib.js](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/src/fx/fire/_lib.js)는 `_` 때문에 이펙트 집계에서 빠진다고 적는다. |
| 고퀄리티다 | ⚠️ | 포스트의 평가 단어다. AUTHORING.md의 기준 문장은 Sprite Fusion VFX 옆에서 디테일·빛·생기가 버텨야 한다는 것이다. 이 글은 244개를 렌더하거나 채점하지 않았다. |
| 오픈소스다 | ✅ | [LICENSE](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/LICENSE) MIT. GitHub `license.spdx_id` MIT. README는 상업 이용을 포함한다고 적는다. 폰트는 [NOTICE](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/NOTICE.md)에서 MIT 밖이다. |
| 무거운 PNG 에셋이 아니라 코드로 실시간으로 그린다 | ⚠️ | 이펙트 소스는 JS이고, 저장소 이미지는 README용 GIF 2개다. 브라우저 경로는 `Uint32Array` 프레임을 `composite`한 뒤 Canvas 2D `putImageData`다. 갤러리 [app.js](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/gallery/app.js)가 그 호출을 한다. Godot·Unity 등 README가 적은 비JS 경로는 `--sheet` 투명 PNG다. |
| 단 몇 줄짜리 코드다 | ❌ | meta 파일 244개의 개행 수. 최소 38(`moves/pistol-shots.js`, 본문은 `chain()`), 중앙 133, 평균 147.4, 최대 412(`spawn/summon-rise.js`). `ice/frost-nova.js`는 215줄. |
| 순수 자바스크립트다 | ⚠️ | `package.json`에 `dependencies`가 없고 devDependency는 esbuild 하나다. `src/`에 WebGL 호출은 없다. 저장소가 Pure라고 부르는 것은 `draw(p, t, o)` 112개다. 132개는 `create(o)`이고 [fx.js](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/src/core/fx.js)가 120Hz로 스텝한다. |
| 코드 한 줄로 파란 불꽃·분홍 힐로 바꾸고, 그 일이 1초다 | ⚠️ | `palette` 옵션과 `fit` 재샘플은 `resolveOptions`와 frost-nova meta, README `--opts` 예에 있다. 힐을 분홍으로 할 수 있다는 문장도 README에 있다. "1초"를 잰 숫자는 이 커밋의 README·AUTHORING·`fx.js`에 없다. |
| Claude Code가 새 도트 이펙트를 만드는 전용 스킬이 있다 | ✅ | [skills/pixelfx/SKILL.md](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/skills/pixelfx/SKILL.md), `.claude-plugin/marketplace.json`, README의 `/plugin marketplace add patch-gg/pixelfx`. 스킬이 적는 절차는 draft, render, look, refine이다. "뚝딱"의 소요 시간은 저장소에 없다. |

**총평:** 244개, MIT, 자바스크립트 소스, 팔레트 옵션, Claude Code 스킬은 저장소와 맞다. 어긋나는 문장은 "단 몇 줄"이다. meta 파일의 중앙 길이는 133줄이고, 가장 짧은 38줄은 다른 이펙트를 `chain()`으로 부르는 연출이다. "순수"를 의존성 없는 자바스크립트로 읽으면 맞고, 저장소 용어로 읽으면 112개만 Pure이며 132개는 120Hz 시뮬레이션이다. `t.co/UrJzzlGbC2`는 그 저장소가 아니라 포스트에 붙은 GIF다.

## 참고 자료

- 계기 포스트 — [@db_goyoung, 2026-11-02 05:14 UTC](https://x.com/db_goyoung/status/2117123080669782501) · [i/status](https://x.com/i/status/2117123080669782501) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2117123080669782501). `t.co/UrJzzlGbC2`의 리다이렉트는 같은 상태의 `/photo/1`
- pixelfx main `a84159688af3ca37a4be05a0d422b94451b2e24e`, 커밋 시각 2026-10-31T08:41:17Z — [커밋](https://github.com/patch-gg/pixelfx/commit/a84159688af3ca37a4be05a0d422b94451b2e24e) · [README](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/README.md) · [카탈로그](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/docs/CATALOG.md) · [AUTHORING](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/docs/AUTHORING.md) · [fx.js](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/src/core/fx.js) · [frost-nova.js](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/src/fx/ice/frost-nova.js) · [LICENSE](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/LICENSE) · [NOTICE](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/NOTICE.md) · [스킬](https://github.com/patch-gg/pixelfx/blob/a84159688af3ca37a4be05a0d422b94451b2e24e/skills/pixelfx/SKILL.md)
- 별·포크·라이선스 — 2026-11-05T03:22:17Z `GET /repos/patch-gg/pixelfx`. `stargazers_count` 4800, `forks_count` 644, `license.spdx_id` MIT, `created_at` 2026-10-30T06:43:25Z
- npm — [registry.npmjs.org/pixelfx](https://registry.npmjs.org/pixelfx), 2026-11-05T03:19:50Z HTTP 404
- 갤러리 — [patch-gg.github.io/pixelfx](https://patch-gg.github.io/pixelfx/)
- 방법이 나온 글과 원 코드 — [Hugo Duprez, How to make (good) pixel art effects with Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude) · [Sprite Fusion pixel art VFX](https://www.spritefusion.com/pixel-art-vfx) · [rehan-remade/hollow-crown](https://github.com/rehan-remade/hollow-crown)
- Aseprite Steam 미국 표시 가격 — `appdetails?appids=431730&cc=us`, `Date: Thu, 05 Nov 2026 03:22:57 GMT`, `final_formatted` `$19.99`. 공식 기능 설명의 시트 내보내기는 [aseprite.org](https://www.aseprite.org/)
- 조직 페이지 — [github.com/patch-gg](https://github.com/patch-gg) · [patch.gg](https://patch.gg) (2026-11-05에 읽은 문장은 Coming soon)
