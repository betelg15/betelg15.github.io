---
title: "23개 도구면 에이전트가 3D를 운전하나? 67js 팩트 체크"
date: 2026-11-09
time: "09:24"
slug: 67js-3d-engine-for-ai-agents-mcp
tags: [67js, WebGL2, MCP, Glaze, Cook, 팩트체크]
summary: "npm 0.16.0의 MCP 서버 소스는 도구 23개를 등록한다. 홈의 50.9 KB·2.6배는 three.js lit-box gzip 비교인데, 그 문장을 넣은 커밋의 기준선은 66,641바이트·2.01배였다."
---

> 이 글은 제가 X에서 북마크해 둔 [@anxuanng의 포스트](https://x.com/anxuanng/status/2119480946340835771)를 계기로 썼습니다. 작성자 표시 이름은 An Xuan, `screen_name`은 `anxuanng`입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2119480946340835771)(`code` 200)으로 읽었습니다. `created_at`은 `Sun Nov 08 17:23:30 +0000 2026`, **2026-11-09 02:23 KST**입니다. 그 응답의 본문은 이렇습니다. “Introducing 67js. A 3D engine that any AI agent can drive, through 23 MCP tools (and counting). It's open source, so you can use it right away.” 같은 응답의 스냅샷은 답글 19, 리포스트 26, 좋아요 410, 북마크 592, 인용 2, 조회 15,572입니다. 프로필 설명은 “Worlds, rendered. Contact: hello@codepawl.com”이고, `verification.type`은 `individual`입니다.
>
> 바로 다음 글 [2119482072054276239](https://x.com/anxuanng/status/2119482072054276239)도 fxtwitter로 읽었습니다. `created_at`은 `Sun Nov 08 17:27:58 +0000 2026`, **2026-11-09 02:27 KST**이고, 본문은 저장소 [github.com/codepawl/67.js](https://github.com/codepawl/67.js)와 문서 [67js.codepawl.com/docs](https://67js.codepawl.com/docs)를 가리킵니다. X와 웹 문서의 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-09(KST)에 연 1차 자료입니다.
>
> - GitHub [codepawl/67.js](https://github.com/codepawl/67.js). `https://github.com/anxuanng/67.js`는 **301**로 이 주소에 붙습니다. API 조회 `Date: Mon, 09 Nov 2026 00:18:23 GMT`(09:18 KST): 공개, 별 128, 포크 5, 열린 이슈 40, 생성 `2026-10-08T20:06:27Z`, `pushed_at` `2026-11-09T00:07:12Z`, `license.spdx_id` **`NOASSERTION`**
> - 릴리스 [v0.16.0](https://github.com/codepawl/67.js/releases/tag/v0.16.0), 태그 커밋 `bce0a97b245eb17d2c90e88cd1c2d30c3084a311`, 게시 `2026-11-08T06:18:20Z`. npm `@codepawlhq/67js` 0.16.0 시각 `2026-11-08T06:16:13.532Z`
> - 그 태그의 `LICENSE`, `package.json`, `src/index.js`, `src/renderer.js`, `src/path-tracer.js`, `scripts/mcp-server.mjs`, `scripts/smoke-mcp-clients.mjs`, `index.html`, `docs/mcp.md`, `docs/path-tracer.md`, `bench/size/baseline.json`, `bench/size/budgets.json`, `bench/size/README.md`, `bench/agent-modeling/README.md`, `CHANGELOG.md`
> - 배포 tarball `https://registry.npmjs.org/@codepawlhq/67js/-/67js-0.16.0.tgz`의 `package/build/mcp/server.mjs`와 `package/build/67.module.js`
> - 사이트 [67js.codepawl.com](https://67js.codepawl.com/), [mcp.md](https://67js.codepawl.com/mcp.md), [changelog.md](https://67js.codepawl.com/changelog.md), [agent-scene.md](https://67js.codepawl.com/agent-scene.md). 사이트 changelog에는 태그에 없는 Unreleased 절이 있습니다
> - `main` HEAD `496014d3367043d06b9c15f093cf47429b4c94fc`(2026-11-09T00:07:10Z). compare API 기준 태그보다 **317**커밋 앞이고, `package.json`의 `version`은 여전히 `0.16.0`입니다
>
> 이 글은 씬을 렌더하지 않았고, MCP `tools/list`를 브라우저 런타임으로 받지 않았습니다. 도구 개수는 소스의 `register('이름')`과 배포 번들 안의 이름 문자열을 센 것입니다. 이 환경에서 실행한 명령은 `npx --package @codepawlhq/67js 67js-mcp --version`뿐이고, 출력은 `0.16.0`이었습니다.

## 왜 중요한가

에이전트에게 3D를 맡기는 길은 이미 둘로 갈립니다. 하나는 Blender 안에서 `bpy`를 실행하게 하는 길이고, 다른 하나는 three.js 코드를 쓰게 하는 길입니다. 67js는 그 사이에, 씬을 JSON 레시피로 두고 stdio MCP 도구로만 고치게 하려는 엔진입니다. 실시간 렌더러의 공개 이름은 Glaze, 오프라인 패스트레이서의 공개 이름은 Cook입니다.

개발자가 확인할 질문은 슬로건보다 다음입니다.

- 레지스트리에 있는 패키지 이름과 `npx 67js-mcp`가 같은가.
- “23개”가 현재 릴리스의 `register` 호출인가, 예전에 함수 정의까지 세던 숫자인가.
- 50.9 KB와 2.6배가 어느 번들, 어느 커밋의 gzip인가.
- “아무 에이전트나”가 프로토콜 이야기인가, 프로젝트가 돌린 클라이언트 목록인가.

## 기술 설명

### 저장소와 패키지

공개 저장소는 `codepawl/67.js`입니다. npm 최신 버전은 `@codepawlhq/67js` **0.16.0**이고, `license` 필드는 **MIT**, `engines.node`는 **`>=20.19.0`**입니다. `bin`은 `67js-mcp` → `bin/67js-mcp.mjs`입니다. 이름 `67js`, `67js-mcp`, `@codepawlhq/67js-mcp`, `@codepawlhq/67js-render-native`는 2026-11-09 레지스트리 조회에서 **404**였습니다.

설치 문서가 적는 줄은 별칭입니다.

```sh
npm install 67js@npm:@codepawlhq/67js
npx 67js-mcp --backend gpu --memory 192
```

패키지가 로컬에 없을 때의 문서 문장은 `npx --package @codepawlhq/67js 67js-mcp`입니다. `--backend`는 프리뷰 브라우저의 `gpu` 또는 `cpu`(기본 `gpu`)이고, `--memory`는 32에서 384 MiB(기본 192)입니다. 서버는 Chrome 또는 Chromium 실행 파일이 필요하고, 브라우저를 내려받지 않는다고 `docs/mcp.md`가 적습니다. stdio만 쓰고 HTTP MCP 리스너는 없습니다.

`LICENSE` 첫 줄은 “MIT License”, 저작권은 “Copyright (c) 2026 CodePawl”입니다. 이어서 번들 gl-matrix 저작권(2015–2025, Brandon Jones, Colin MacKenzie IV)과 “This license covers the authored source code. WALL-E character rights belong to Disney/Pixar.”가 있습니다. 파일은 MIT 허가 문장을 담고, GitHub API의 SPDX는 그 파일에 대해 `NOASSERTION`입니다.

### Glaze와 Cook

`src/index.js`는 `Renderer67`과 `Glaze`를 함께 내보냅니다. `src/renderer.js` 주석은 “Glaze is the public name of the real-time renderer; Renderer67 stays for existing code.”이고, 줄은 `export { Renderer67 as Glaze }`입니다. 배포 `build/67.module.js`의 export에도 `Glaze`와 `Renderer67`이 같은 바인딩으로 있습니다.

Cook은 코어 export가 아닙니다. `src/path-tracer.js`는 `export const Cook = renderPathTracedImage`이고, 패키지 경로는 `67js/addons/path-tracer`입니다. [path-tracer.md](https://github.com/codepawl/67.js/blob/v0.16.0/docs/path-tracer.md)는 Cook을 Cook-Torrance와 “let it cook”에 대한 이름이라고 적고, 기본 `backend`는 **`cpu`**라고 적습니다. `gpu`는 WebGL2 프래그먼트 셰이더이고, 코어 번들에는 넣지 않는다고 적습니다.

같은 문서의 데모 룸(1920×1080, 64샘플, RTX 3060)은 GPU **58.15초**(웜 셰이더 캐시에서 컴파일 10.3초 포함) 대 CPU **585.9초**(2026-11-03)이고, 2026-11-04 재측정은 처음 보는 커널 **38.7초**(컴파일 7.0초), 같은 커널 다시 **41.0초**(컴파일 7.3초)입니다. 0.16.0 changelog 하이라이트의 “about 40 s, against 586 s”는 이 재측정과 CPU 585.9초에 대응합니다. 일반 속도 우위로 적은 문장은 아닙니다. README의 Performance claims는 같은 하드웨어의 대응 씬 비교이며, three.js에 대한 일반 속도 우위나 Blender와의 시각적 동등을 보여 주지 않는다고 적습니다.

v0.16.0 MCP의 `pathTracer` 스키마에는 `samples`, `bounces`, `denoise`, `seed`, `maxSeconds`, `noiseThreshold`만 있고 **`backend`가 없습니다.** path-tracer.md는 “Render jobs do not select the GPU backend yet.”이라고 적습니다. 프리뷰의 `--backend gpu`는 래스터 프리뷰이고, Cook의 GPU 백엔드 선택이 아닙니다. 사이트 changelog의 Unreleased에는 렌더 잡의 `backend: "gpu"`와 `@codepawlhq/67js-render-native`가 적혀 있습니다. 그 패키지는 이 글의 npm 조회에서 404였고, 태그 `CHANGELOG.md`는 `## 0.16.0`으로 시작합니다.

### 에이전트가 쓰는 도구

v0.16.0 `scripts/mcp-server.mjs`의 `register('…')`는 23개입니다. 배포 번들에도 같은 23개 이름이 있습니다. `main` HEAD에서도 23개였습니다.

| 묶음 | 도구 |
|---|---|
| 조회 | `scene_capabilities`, `scene_inspect`, `scene_asset_catalog`, `scene_walkmap`, `mesh_inspect` |
| 만들기·고치기 | `scene_create`, `scene_create_asset`, `scene_apply`, `mesh_edit`, `mesh_stack` |
| 보기 | `scene_look`, `scene_review` |
| 되돌리기 | `scene_checkpoint`, `scene_restore`, `scene_release_checkpoint` |
| 내보내기·정리 | `scene_export_recipe`, `scene_export_glb`, `scene_dispose` |
| 렌더 잡 | `scene_render_submit`, `scene_render_status`, `scene_render_cancel`, `scene_render_result`, `scene_render_release` |

문서가 적는 순서는 `scene_capabilities` → `scene_create` → `scene_inspect` → `scene_checkpoint` → `scene_apply`(현재 `expectedRevision`) → `scene_look`입니다. 활성 씬은 하나이고, 노드는 4096, 지오메트리와 머티리얼은 각 256, 배치는 256연산, 프리뷰는 변 64–1024픽셀(기본 768×512), 렌더 잡은 최대 1920×1080, PNG 응답은 1 MiB입니다. 임의 JavaScript, 원격 URL, 호출자가 고른 출력 경로는 없다고 적습니다. 예외는 상한이 있는 GLSL `postPasses`(최대 4패스, 패스당 4 KB)입니다. “MCP support does not establish Blender feature parity.”도 같은 문서에 있습니다.

레시피는 `format: "67js.scene"`, `schemaVersion: 1`입니다. 아래는 [agent-scene.md](https://67js.codepawl.com/agent-scene.md)의 예시입니다. 이 글은 실행하지 않았습니다.

```js
import { Renderer67 } from '67js';
import { createAgentScene } from '67js/addons/agent-scene';

const scene = createAgentScene({
  format: '67js.scene',
  schemaVersion: 1,
  geometries: [{ id: 'cube', type: 'box', bevel: 0 }],
  materials: [{ id: 'blue', color: [0.1, 0.3, 0.8] }],
  nodes: [
    { id: 'mesh', geometry: 'cube', material: 'blue' },
  ],
});

const renderer = new Renderer67(canvas, scene.parts, { ground: false });
renderer.render(scene.camera);
```

빈 씬에 상자를 더하는 `scene_apply` 배치도 문서의 예입니다.

```json
[
  { "type": "add-geometry", "geometry": { "id": "cube", "type": "box", "bevel": 0.04 } },
  { "type": "add-material", "material": { "id": "paint", "color": [0.2, 0.6, 0.8] } },
  { "type": "add-node", "node": { "id": "mesh", "geometry": "cube", "material": "paint" } }
]
```

클라이언트가 적을 설정은 `docs/mcp.md`의 예입니다. 경로는 그 문서의 Windows 예이고, 브라우저 경로는 표준 Chrome 설치에서 생략할 수 있다고 적습니다. 같은 문서는 Cursor, Gemini CLI, Claude Desktop, VS Code, OpenAI·Gemini 모델을 **돌리지 않았다**고 적고, 같은 `command`와 `args`로 구성하는 일은 미검증이라고 적습니다.

```json
{
  "mcpServers": {
    "67js-scene": {
      "command": "C:/Program Files/nodejs/node.exe",
      "args": [
        "C:/projects/my-scene/node_modules/67js/bin/67js-mcp.mjs",
        "--backend", "gpu",
        "--memory", "192"
      ]
    }
  }
}
```

`docs/mcp.md`는 스키마가 JSON Schema 2020-12라고 적습니다. draft-07 검증기는 `$schema`와 `prefixItems`에서 거절하고, OpenAI `strict: true`는 대부분의 속성이 선택이고 `additionalProperties: false`가 없으며 `oneOf`·`prefixItems`·`propertyNames`가 문서화된 부분집합 밖이라 거절한다고 적습니다. Gemini 함수 선언은 `const`, `oneOf`, `$ref`, `exclusiveMinimum`을 쓴다고 적습니다. 기록된 에이전트 런은 Claude Code이고, 모델링 스위트는 Claude Sonnet과 Haiku만이라고 같은 문서가 적습니다.

### 크기 숫자가 가리키는 것

`bench/size/README.md`는 esbuild로 minify·트리셰이크한 **gzip 바이트**를 잽니다. `scene:lit-box`는 애드온 없는 `Renderer67` 상자 하나이고, `entry:*`는 그 엔트리가 export하는 전부입니다. three.js 열은 같은 씬을 `package.json`의 three 버전으로 묶은 것이고 예산이 없습니다. `manifold-3d`와 `@dimforge/rapier3d-compat`은 선택 피어라 번들에 넣지 않는다고 적습니다.

v0.16.0 `bench/size/baseline.json`은 `threeVersion` **0.187.0**, three.js `lit-box` gzip **133,797**, 67js `scene:lit-box` gzip **51,056**입니다. 133,797/1000 = 133.8이라 홈의 “133.8 KB”와 맞습니다. 51,056/1000 = 51.1이라 홈의 “50.9 KB”와는 156바이트 차이입니다. 133,797/51,056 = **2.62**입니다. `budgets.json`의 `goals.lit-box`는 **50,000**이고, 51,056은 그 목표를 넘습니다.

홈 문장 “50.9 KB gzip · 2.6× smaller”가 들어 있는 커밋 `3d59166f74`(2026-11-06, “introduce Glaze + Cook names”)의 같은 필드는 gzip **66,641**, 비율 **2.01**이었습니다. 그 커밋에도 three.js gzip은 133,797입니다. 50.9 KB도 2.6배도 그 파일의 숫자가 아닙니다. 릴리스 커밋 `84f6b073c5`(2026-11-08, “Release 0.16.0”)에서 기준선이 51,056으로 바뀌어 2.6배에 가까워졌고, 홈 문장은 그대로입니다. size README의 2026-11-03 표는 또 다른 측정입니다. 67js 49,858, three.js 0.186.1의 133,652, 목표 50,000은 그때 “met”이라고 적혀 있습니다.

같은 기준선의 다른 씬은 lit-box가 아닙니다. `scene:gltf-box` gzip은 80,675, `scene:agent-scene+lazy`는 376,567, `entry:path-tracer+lazy`는 35,314입니다. glTF나 에이전트 레시피, Cook을 넣는 페이지의 크기를 50.9 KB로 읽으면 이 표와 어긋납니다.

### 에이전트 벤치가 재는 것

`bench/agent-modeling/README.md`의 2026-11-07 비교(이슈 #31)는 `claude-sonnet-5-5`, 태스크 6개, 시스템당 1회입니다. 67js MCP는 6/6, 평균 도구 호출 3.2, 평균 벽시계 24초, 평균 look 0.932입니다. three.js를 코드로 쓰게 한 쪽은 5/6, 8.8회, 359초, look 0.926입니다. 실패한 `window`는 닫힌 표면 검사입니다. 문서는 three.js 시간의 대부분이 헤드리스 Chrome으로 PNG를 쓰는 데 갔고, 토큰은 67js가 더 많으며(스키마를 호출마다 읽음), 태스크가 67js 스위트 기준으로 만들어졌다고 적습니다.

Blender 쪽은 “official Blender MCP server (Blender Lab, v1.0.3)”, Blender 5.1.2, 같은 여섯 태스크, 1회, Docker(x86_64를 Apple silicon에서 Rosetta)입니다. 6/6, 평균 도구 호출 3.8, 평균 벽시계 517초, look 0.926입니다. 문서는 517초를 Blender MCP 지연이 아니라 환경 비용으로 보라고 적습니다. `fence`만 38초였고, 나머지는 렌더 호출이 Claude Code의 300초 무응답 중단에 걸렸다고 적습니다. 서버는 가드 없는 Python을 실행하므로 벤치 기계에서 직접 돌리지 않았다고 적습니다.

## 비즈니스 인사이트

숫자와 문서 내용은 문장 옆에 출처를 붙입니다. 그 밖의 판단은 **분석/의견**입니다. CodePawl의 매출, 가격표, 기업 가치는 이 글이 연 패키지 메타데이터와 홈에서 찾지 못했습니다. npm 0.16.0의 라이선스 필드는 MIT이고, 홈과 `package.json`에 유료 티어는 적혀 있지 않습니다.

**라이선스가 여는 범위는 엔진마다 다릅니다.** [three.js LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE)는 MIT이고 저작권 표기는 2010–2026 three.js authors입니다. 2026-11-09 `npm view three`의 버전은 **0.187.0**, 라이선스는 MIT입니다. 67js 벤치가 고정한 three도 0.187.0입니다. GitHub API로 본 [mrdoob/three.js](https://github.com/mrdoob/three.js)는 별 **117,896**, SPDX **MIT**입니다. [Babylon.js license.md](https://github.com/BabylonJS/Babylon.js/blob/master/license.md)는 Apache-2.0이고, 같은 조회에서 [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js)는 별 **26,309**, SPDX **Apache-2.0**입니다. `npm view babylonjs`는 버전 **9.35.0**, 라이선스 Apache-2.0입니다. [Blender 라이선스 페이지](https://www.blender.org/about/license/)는 Blender를 GNU GPL(소스의 기본은 GPL 2 or later)로 두고, 어떤 목적으로든 사용할 수 있으며 결과물을 팔 수 있다고 적습니다. 같은 페이지는 Cycles를 Apache 2.0이라고 적습니다.

67js `LICENSE`는 작성 소스에 MIT를 적습니다. GitHub가 그 파일을 `NOASSERTION`으로 분류하는 것은 라이선스 스캐너가 SPDX를 못 고를 수 있다는 뜻이지, 파일에 MIT 문장이 없다는 뜻은 아닙니다. **분석/의견.** 앱에 렌더러를 넣는 비용의 축은 three.js, Babylon.js와 같이 “라이선스 수수료가 문서에 없다”에 가깝고, GPL 앱을 고쳐 배포할 때의 소스 공개 의무와는 다릅니다. 그 판단은 각 제품이 실제로 링크하는 코드에 따라 달라지고, 이 절은 법률 자문이 아닙니다.

**옆의 MCP는 코드 실행을 열어 둡니다.** [Blender Lab MCP 페이지](https://www.blender.org/lab/mcp-server/)는 Blender 5.1 이상, 애드온, LLM 클라이언트, MCP 서버 세 가지를 따로 설치한다고 적고, “The MCP server will execute LLM generated code in Blender without any guards”라고 경고합니다. 다운로드 링크는 [v1.0.3](https://projects.blender.org/lab/blender_mcp/releases/download/v1.0.3/mcp-1.0.3.zip)입니다. 67js 벤치가 적은 Blender Lab v1.0.3과 같은 버전 번호입니다. 커뮤니티 저장소 [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)는 API 설명이 “Not affiliated with the official Blender Foundation.”이고, 같은 조회의 별은 **33,672**, SPDX는 **MIT**입니다. **분석/의견.** 67js가 받는 대가는 기능 동등이 아니라, 도구 인자 밖으로 임의 코드와 원격 URL이 나가지 않게 문서가 경계를 그은 것입니다. Blender 쪽 별 수와 모델링 범위는 그 경계 밖에 있습니다.

**누가 이 조합을 쓰게 되는가.** (1) 웹 페이지에 WebGL2 씬을 넣고, 에이전트 없이 `new Glaze` 또는 `new Renderer67`만 부르는 쪽. lit-box 예산이 이 경우의 크기 이야기입니다. (2) 에이전트에게 레시피와 PNG 프리뷰를 맡기고, Node 20.19+와 로컬 Chrome을 에이전트 기계에 둘 수 있는 쪽. (3) Blender 파일을 왕복하거나 Cycles와 같은 그림을 보증으로 원하는 쪽은, 프로젝트 README가 시각적 동등을 주장하지 않고 path-tracer.md가 코스틱, 모션 블러, 피사계 심도, 이방성, 이리데슨스를 그리지 않는다고 적습니다. **분석/의견.** 제품에 붙일 때 남는 비용은 엔진 라이선스 요금이 아니라 모델 사용료, Chrome 프로세스, 그리고 lit-box가 아닌 엔트리(glTF, 에이전트 씬, Cook)의 바이트입니다. 별 128개인 2026-10-08 생성 저장소를 three.js의 대체재로 두는 근거는 이 자료에 없습니다.

**도입에서 남는 일.** `npx 67js-mcp`는 레지스트리 패키지 이름이 아닙니다. 별칭 설치 뒤의 bin이거나 `--package @codepawlhq/67js`가 필요합니다. 스키마가 strict 모드나 draft-07에서 거절될 수 있다고 프로젝트가 적습니다. 사이트 changelog의 Unreleased(WebGPU 패스트레이서, 네이티브 Vulkan 패키지)는 npm 0.16.0 태그 changelog에 없습니다. **분석/의견.** 문서를 사이트 최신본만 보고 붙이면, 배포된 서버에 없는 필드를 호출하게 됩니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·시점·문서 간 차이가 있음 / ❌ 1차 자료와 어긋남

원본 X([@anxuanng](https://x.com/anxuanng/status/2119480946340835771), 2026-11-09 02:23 KST)와 홈·changelog의 문장을 v0.16.0 소스, npm 0.16.0, 사이트 문서와 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 어떤 AI 에이전트든 이 엔진을 운전할 수 있다 | ⚠️ | stdio MCP 서버가 패키지에 있습니다. `docs/mcp.md`는 Cursor, Gemini CLI, Claude Desktop, VS Code, OpenAI·Gemini 모델을 돌리지 않았다고 적고, draft-07·OpenAI strict·Gemini 키워드에서 스키마가 거절될 수 있다고 적습니다. 기록된 모델링은 Claude Code의 Sonnet·Haiku입니다. |
| MCP 도구가 23개다 | ✅ | v0.16.0과 `main`의 `register('…')`가 23개입니다. 이름에 `scene_walkmap`이 있습니다. 배포 `build/mcp/server.mjs`에도 같은 23개 문자열이 있습니다. `smoke-mcp.mjs`와 `index.html`은 23을 적습니다. 이 글은 라이브 `tools/list`를 받지 않았습니다. |
| 23개이고 계속 늘어나는 중이다 | ⚠️ | “and counting”은 작성자의 말. 태그보다 317커밋 앞인 `main` HEAD에서도 등록은 23개였습니다. 24번째 이름은 이 글이 연 두 트리에 없습니다. |
| 오픈소스라서 바로 쓸 수 있다 | ⚠️ | `LICENSE`와 npm `license`는 MIT입니다. GitHub SPDX는 `NOASSERTION`입니다. 쓰려면 Node ≥20.19, 설치된 Chrome, `npm install 67js@npm:@codepawlhq/67js`가 필요합니다. 레지스트리 이름 `67js-mcp`는 404입니다. `npx --package @codepawlhq/67js 67js-mcp --version`은 이 환경에서 `0.16.0`을 출력했습니다. |
| 저장소가 anxuanng/67.js다 | ⚠️ | 그 URL은 301로 `codepawl/67.js`입니다. 작성자 답글이 가리키는 주소도 `codepawl/67.js`입니다. |
| 실시간 WebGL2 렌더러 이름이 Glaze다 | ✅ | `export { Renderer67 as Glaze }`. 홈 예제는 `import { Glaze } from '67js'`입니다. 이 글은 그 예제를 실행하지 않았습니다. |
| 오프라인 패스트레이서 이름이 Cook이다 | ✅ | `export const Cook = renderPathTracedImage`, 임포트는 `67js/addons/path-tracer`. 기본 backend는 문서상 `cpu`입니다. |
| MCP로 Cook의 GPU 백엔드를 고른다 | ❌ | v0.16.0 잡 스키마의 `pathTracer`에 `backend`가 없습니다. path-tracer.md는 렌더 잡이 GPU 백엔드를 아직 고르지 못한다고 적습니다. GPU 시간(RTX 3060, 1080p, 64샘플, 재측정 38.7초·41.0초, CPU 585.9초)은 애드온 측정입니다. |
| 한 패키지에 23개 도구가 있다 | ✅ | 별도 `67js-mcp` 패키지는 없고, bin이 `@codepawlhq/67js` 0.16.0 안에 있습니다. |
| lit-box가 50.9 KB gzip이고 three.js보다 2.6배 작다 | ⚠️ | 비교 대상은 홈이 적은 three.js lit-box이고, 133.8 KB는 baseline 133,797바이트와 맞습니다. 릴리스 `scene:lit-box`는 **51,056**바이트(2.62배)라 50.9 KB(50,900바이트)가 아닙니다. 문장을 넣은 `3d59166f74`의 기준선은 **66,641**바이트, **2.01배**였습니다. 목표 50,000바이트는 릴리스 기준선이 넘습니다. README는 이것을 일반 속도 우위라고 적지 않습니다. |
| changelog는 22개인데 마케팅은 23개다 | ⚠️ | **0.15.0** 항목(이슈 #180)은 “서버는 22개를 등록하고, 23번째 `register(`는 함수 정의라 당시 문서의 개수가 맞다”입니다. **0.16.0**은 `scene_walkmap`을 넣어 23개입니다. 그런데 0.16.0 `scripts/smoke-mcp-clients.mjs`의 `EXPECTED_TOOL_COUNT`는 **22**이고, `docs/mcp.md` 한 표는 Inspector **23**과 Python SDK **22**를 같이 적습니다. |
| `npx 67js-mcp` 한 줄이면 서버가 뜬다 | ⚠️ | 문서에 그 줄이 있습니다. 로컬 bin이 없을 때 npm이 찾는 패키지 이름 `67js-mcp`는 404입니다. 문서의 단독 실행은 `npx --package @codepawlhq/67js 67js-mcp`입니다. |
| three.js 코드와 Blender MCP보다 에이전트가 낫다 | ⚠️ | 2026-11-07 스위트는 존재합니다. 67js 6/6·3.2회·24초, three.js 코드 5/6·8.8회·359초, Blender Lab 6/6·3.8회·517초. 문서는 1회·한 모델·67js용 태스크라고 적고, 517초는 환경 비용이라고 적습니다. |

**총평:** X가 말한 공개 3D 엔진, MIT로 읽히는 라이선스, 패키지 안의 MCP 서버, 도구 23개는 0.16.0 소스와 npm tarball에 있습니다. “아무 에이전트나”와 “바로”는 프로젝트가 돌리지 않은 클라이언트, Node·Chrome, 패키지 별칭이 붙습니다. 22는 0.15.0에서 함수 정의까지 세던 숫자를 바로잡은 기록이고, 릴리스 소스의 등록은 23이지만 클라이언트 스모크와 Python SDK 문장은 22로 남아 있습니다. 홈의 50.9 KB·2.6배는 그 문장이 들어간 커밋의 기준선(66.6 KB, 2.01배)과 달랐고, 릴리스 기준선(51,056바이트, 2.62배)에도 50.9 KB와 같지는 않습니다.

## 참고 자료

- 원본 X — [@anxuanng, 2026-11-09 02:23 KST](https://x.com/anxuanng/status/2119480946340835771). 저장소 답글 — [02:27 KST](https://x.com/anxuanng/status/2119482072054276239). 본문은 [fxtwitter](https://api.fxtwitter.com/status/2119480946340835771) `code` 200
- 저장소 — [codepawl/67.js](https://github.com/codepawl/67.js). `anxuanng/67.js`는 301. API 2026-11-09 09:18 KST: 별 128, 포크 5, 이슈 40, SPDX `NOASSERTION`, 생성 2026-10-08T20:06:27Z. 태그 [v0.16.0](https://github.com/codepawl/67.js/releases/tag/v0.16.0) `bce0a97b245eb17d2c90e88cd1c2d30c3084a311`. `main` `496014d3367043d06b9c15f093cf47429b4c94fc` (ahead 317, `version`은 0.16.0)
- 패키지 — [npm @codepawlhq/67js 0.16.0](https://www.npmjs.com/package/@codepawlhq/67js) (게시 2026-11-08T06:16:13.532Z, MIT, `engines.node` `>=20.19.0`, unpacked 3,046,836). tarball 안의 `build/mcp/server.mjs`. `67js-mcp`와 `@codepawlhq/67js-render-native`는 같은 날 조회에서 404
- 라이선스 — [LICENSE](https://github.com/codepawl/67.js/blob/v0.16.0/LICENSE) (MIT 문장, CodePawl 2026, gl-matrix 저작권, WALL-E 권리 유보)
- 렌더러 이름 — [src/renderer.js](https://github.com/codepawl/67.js/blob/v0.16.0/src/renderer.js) (`export { Renderer67 as Glaze }`), [src/path-tracer.js](https://github.com/codepawl/67.js/blob/v0.16.0/src/path-tracer.js) (`export const Cook = renderPathTracedImage`), [docs/path-tracer.md](https://github.com/codepawl/67.js/blob/v0.16.0/docs/path-tracer.md) (기본 `cpu`, RTX 3060 58.15초 후 38.7·41.0초, CPU 585.9초, 잡은 GPU 백엔드를 아직 고르지 못함)
- MCP — [docs/mcp.md](https://github.com/codepawl/67.js/blob/v0.16.0/docs/mcp.md), [scripts/mcp-server.mjs](https://github.com/codepawl/67.js/blob/v0.16.0/scripts/mcp-server.mjs), [scripts/smoke-mcp-clients.mjs](https://github.com/codepawl/67.js/blob/v0.16.0/scripts/smoke-mcp-clients.mjs) (`EXPECTED_TOOL_COUNT = 22`), [agent-scene.md](https://67js.codepawl.com/agent-scene.md)
- 크기 — [index.html](https://github.com/codepawl/67.js/blob/v0.16.0/index.html) (“50.9 KB gzip · 2.6× smaller”, three.js “133.8 KB”). [baseline.json](https://github.com/codepawl/67.js/blob/v0.16.0/bench/size/baseline.json) (51,056과 133,797). 같은 필드가 `3d59166f74`에서는 66,641. [budgets.json](https://github.com/codepawl/67.js/blob/v0.16.0/bench/size/budgets.json) `goals.lit-box` 50,000. [bench/size/README.md](https://github.com/codepawl/67.js/blob/v0.16.0/bench/size/README.md) (2026-11-03 표: 49,858 대 133,652)
- 벤치 — [bench/agent-modeling/README.md](https://github.com/codepawl/67.js/blob/v0.16.0/bench/agent-modeling/README.md), [2026-11-07-blender-mcp.json](https://github.com/codepawl/67.js/blob/v0.16.0/bench/agent-modeling/results/2026-11-07-blender-mcp.json). README Performance claims는 일반 속도 우위와 Blender 시각적 동등을 부인
- 사이트 — [67js.codepawl.com](https://67js.codepawl.com/), [changelog.md](https://67js.codepawl.com/changelog.md) (Unreleased가 태그 changelog보다 앞섬)
- 비교 대상 — [three.js LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE), [mrdoob/three.js](https://github.com/mrdoob/three.js) (API: 별 117,896, MIT), npm `three` 0.187.0. [Babylon.js license](https://github.com/BabylonJS/Babylon.js/blob/master/license.md), [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) (API: 별 26,309, Apache-2.0), npm `babylonjs` 9.35.0. [Blender license](https://www.blender.org/about/license/) (GPL, Cycles는 Apache 2.0). [Blender Lab MCP](https://www.blender.org/lab/mcp-server/) (가드 없는 코드 실행, [v1.0.3](https://projects.blender.org/lab/blender_mcp/releases/download/v1.0.3/mcp-1.0.3.zip)). [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) (API: 별 33,672, MIT, Blender Foundation과 무관하다는 설명)
