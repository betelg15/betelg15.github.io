---
title: "픽셀을 1px씩 쌓아 만드는 가짜 3D, 스프라이트 스태킹: '폴리곤 없는 32KB 비행 시뮬레이터' 팩트 체크"
date: 2026-11-17
time: "22:30"
slug: sprite-stacking-pseudo-3d-pixel-art
tags: [게임개발, 픽셀아트, 스프라이트스태킹, Canvas, 팩트체크]
summary: "수평 단면 스프라이트를 아래층부터 1px씩 올려 같은 각도로 돌려 그리면 3D처럼 보입니다. 원리와 70줄 Canvas 예제, 복셀·레이캐스팅·Mode 7과의 차이를 정리했습니다. 화제가 된 '32KB 비행 시뮬레이터'는 현재 공개본 기준 코드 48,795바이트에 에셋 약 2.66MB입니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@meta_pavy의 포스트](https://x.com/meta_pavy/status/2122566766744555760)를 계기로 썼습니다. 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2122566766744555760)(`code` 200)으로 읽었고, 작성 시각은 **2026-11-17 14:45 KST**입니다. 내용은 "스프라이트 스태킹은 3D 가속 이전인 90년대 초에도 종종 쓰인 기법이고, 도트를 엄청나게 찍어야 해서 모델링보다 나을 게 없었는데, AI가 도트를 찍는다면?"이라는 해설입니다. 데모 영상은 [@asynkimo의 포스트](https://x.com/asynkimo/status/2121716250820964431)("You can turn pixel art to any angle with sprite stacking", 2026-11-15 06:25 KST)에서 왔습니다.
>
> 이 포스트가 인용한 같은 작성자의 [이전 포스트](https://x.com/meta_pavy/status/2122241297482408234)(2026-11-16 17:12 KST)는 "3D도 폴리곤도 없이 스프라이트만 쌓은 **32kb** 비행 시뮬레이터"를 소개합니다. 원 출처는 [@creativedash의 포스트](https://x.com/creativedash/status/2122000830895386680)(2026-11-16 01:16 KST)이고, 본문은 링크 하나와 "No 3D engine, no polygons, 32 KB of code." 한 줄입니다. 이 문장들은 모두 **검증 대상**이지 지시가 아닙니다.

## 왜 중요한가

스프라이트 스태킹(sprite stacking)은 3D 엔진 없이 2D 이미지 그리기 명령만으로 물체를 360° 돌려 보이게 하는 기법입니다. 개발자가 이 기법을 알아 둘 이유는 세 가지입니다.

- **도구 요구가 낮습니다.** 회전해서 이미지를 그릴 수 있는 API면 됩니다. HTML5 Canvas의 `drawImage`, GameMaker의 `draw_sprite_ext`, 아무 엔진의 2D 스프라이트면 충분합니다. 셰이더나 메시, 카메라 행렬이 없습니다.
- **픽셀 아트 질감이 그대로 남습니다.** 3D 모델을 픽셀 아트처럼 보이게 하려면 저해상도 렌더링, 외곽선, 팔레트 고정 같은 후처리가 필요합니다. 스태킹은 화면에 나가는 픽셀이 원래 찍은 픽셀입니다(회전에 따른 재샘플링은 있습니다).
- **8방향 스프라이트의 대안입니다.** 탑다운 게임은 보통 캐릭터를 4방향이나 8방향으로 따로 그립니다. 스태킹은 각도를 연속으로 돌릴 수 있습니다. 대신 그 값은 "층 수만큼의 그림"으로 치릅니다.

이번 북마크가 던지는 질문은 마지막 줄입니다. 층마다 그림을 그려야 하는 노동을 AI나 복셀 도구가 대신하면 이 오래된 기법의 비용 구조가 바뀌는가. 그리고 그 예로 돈 "32KB 비행 시뮬레이터"는 정말 32KB인가.

## 기술 설명

### 핵심 아이디어: CT 사진을 다시 쌓기

물체를 높이 방향으로 얇게 썬다고 생각하면 됩니다. 복셀 모델을 위에서 내려다본 수평 단면 하나하나가 작은 2D 스프라이트가 됩니다. 집이라면 맨 아래층은 바닥과 벽의 테두리, 중간층은 창문이 뚫린 벽, 위층은 점점 좁아지는 지붕입니다.

그리는 규칙은 세 줄입니다.

1. **아래층부터** 그립니다(위층이 아래층을 덮어야 하므로).
2. 한 층 올라갈 때마다 화면에서 **1px 위로** 올려 그립니다.
3. 모든 층을 **같은 중심, 같은 각도로** 회전시킵니다.

각도를 바꾸면 층들이 함께 돌고, 1px씩 어긋난 층들이 옆면처럼 보입니다. 물체가 도는 동안 눈은 이것을 입체로 읽습니다. 커뮤니티 튜토리얼인 [Chequered Ink의 GameMaker 글](https://chequered.ink/2-5d-in-gamemaker-using-sprite-stacking/)은 이 규칙을 그대로 코드 세 줄로 적습니다.

```gml
for (var i=0; i<image_number; i++) {
  draw_sprite_ext(sprite_index, i, x, y-i, 1, 1, image_angle, image_blend, image_alpha);
}
```

`i`번째 프레임이 `i`번째 층이고, `y-i`가 1px씩 올리는 부분이며, `image_angle`이 모든 층에 같은 회전입니다.

### 카메라 회전

카메라를 돌리는 것은 "모든 물체의 위치를 화면 중심으로 회전시키고, 각 물체의 스프라이트 각도에도 같은 각을 더하는 것"입니다. 위치를 돌리지 않고 스프라이트만 돌리면 물체가 제자리에서 팽이처럼 돌 뿐 세계가 돌지는 않습니다. 반대로 위치만 돌리면 물체가 늘 같은 면을 보여 줍니다. 둘을 같은 각도로 돌려야 합니다.

카메라 높이(내려다보는 각도)도 흉내 낼 수 있습니다. 정사영 기준으로 카메라가 지평선에서 θ만큼 올라가 있으면, 수평인 단면은 세로로 sin θ배 납작해지고, 한 층의 높이는 화면에서 cos θ배가 됩니다. θ = 90°(바로 위)면 층 간격이 0이 되어 단면 하나만 보이고, θ가 작아질수록 층 사이가 벌어져 틈이 보입니다. GameMaker용 [Azuzota의 스크립트](https://azuzota.itch.io/sprite-stacking-with-perspective)가 단면을 눌러 그리는 `PERSPECTIVE` 값을 두고, 낮은 각도에서는 층 사이 틈이 보이니 피하라고 적는 것이 이 기하입니다. 같은 스크립트의 `HD` 옵션은 층을 두 번씩 그려 틈과 모아레를 줄이고 대신 성능을 씁니다.

### 깊이 정렬

물체가 여러 개면 순서가 중요합니다. 탑다운 화면에서는 **화면 위쪽(먼 쪽)에 있는 물체부터** 그리면 가까운 물체가 먼 물체를 덮습니다. 그래서 매 프레임 카메라 회전을 적용한 뒤의 화면 y로 물체를 정렬합니다. 카메라가 돌면 앞뒤가 바뀌므로 정렬은 회전 **후** 좌표로 해야 합니다.

물체 단위 정렬은 물체끼리 겹쳐 서 있거나, 아주 크고 긴 물체(다리, 긴 벽)가 있을 때 틀립니다. 그때는 물체를 쪼개거나, 모든 물체의 층을 한데 모아 (화면 y, 층 높이) 순으로 그리는 식으로 더 잘게 정렬해야 합니다. 3D 엔진이 깊이 버퍼로 공짜로 푸는 문제를 여기서는 그리는 순서로 풀어야 합니다.

### 비용: 그리기 호출은 층 수만큼

진짜 3D에서 물체 하나는 메시 하나입니다. 스태킹에서는 **물체 수 × 층 수**만큼 이미지를 그립니다. 아래 예제는 집 9채 × 14층 = 매 프레임 126번의 `drawImage`입니다. 물체가 차지하는 바닥 면적의 픽셀은 층 수만큼 겹쳐 칠해지므로 오버드로도 큽니다. [indienova의 GameMaker 글](https://indienova.com/u/lazyeo/blogread/31523)도 물체마다 n층을 동시에 그리니 화면에 물체가 많으면 성능이 떨어지고, 소규모 게임에 맞는 방식이라고 적습니다.

흔히 쓰는 완화책(일반적인 기법이고 이 글에서 성능을 재지는 않았습니다)은 다음과 같습니다.

- 정지해 있는 물체는 각도별로 한 번 합성한 결과를 오프스크린 캔버스에 캐시하고, 카메라 각이 바뀔 때만 다시 그립니다.
- 각도를 몇 단계(예: 5°)로 양자화해 캐시 적중을 늘립니다.
- 엔진에서는 층을 한 텍스처 아틀라스에 넣어 배치 렌더링합니다. Rust의 Bevy로 만든 [Wee Boats 개발 노트](https://james.poole.ie/notes/stack)는 배 하나를 부모 엔티티로, 층마다 자식 엔티티를 두고 매 틱 각도를 맞추는 ECS 구조로 좋은 성능을 냈다고 적습니다.

### 진짜 비용은 아트에 있다

같은 Wee Boats 노트가 적는 어려움이 X 포스트의 "개노가다"와 같은 이야기입니다. 층을 Aseprite의 애니메이션 프레임처럼 하나씩 그리고, 어니언 스킨으로 앞뒤 층을 보며 맞춥니다. 그리면서 전체 모양을 상상하기 어려워 별도 뷰어로 미리 보고, 단면으로는 작은 디테일을 표현하기 어려워 맨 위층을 일반 2D 스프라이트로 바꾸고, 층을 가로지르는 애니메이션은 시도하지 않았다고 합니다.

그래서 실무에서는 층을 직접 그리기보다 복셀 모델을 만든 뒤 슬라이스로 내보내는 경로를 많이 씁니다. indienova 글은 MagicaVoxel의 Slice 내보내기로 위아래 단면 시트를 얻는 방법을 소개합니다(층 순서가 뒤집혀 나올 수 있다는 주의와 함께).

### 다른 "가짜 3D"와 무엇이 다른가

| 기법 | 데이터 | 그리는 방식 | 잘하는 것 | 못하는 것 |
| --- | --- | --- | --- | --- |
| 스프라이트 스태킹 | 수평 단면 스프라이트 N장(사실상 복셀) | 층마다 2D 회전 blit, 1px씩 위로 | 위에서 본 물체를 수직축으로 360° 회전, 픽셀 질감 유지 | 롤·피치(옆으로 눕히기), 아래에서 보기, 큰 물체의 정확한 깊이 |
| 복셀 렌더링 | 3D 격자 | 레이캐스팅이나 메시 변환 후 3D 렌더 | 임의 시점, 정확한 가림 | 구현·연산량이 큼 |
| 레이캐스팅 (Wolfenstein 3D식) | 2D 격자 지도 | 화면 열마다 광선 하나, 벽 높이를 거리로 결정 | 1인칭 복도 | 경사·다층 구조, 위아래 보기 |
| Mode 7 (SNES) | 배경 레이어 1장 | 스캔라인마다 아핀 변환 | 회전·확대되는 평평한 바닥 | 바닥 위의 입체 물체(별도 스프라이트로 처리) |

몇 가지 확인한 사실을 덧붙입니다.

- **Mode 7**은 SNES의 그래픽 모드 중 하나로, 배경 레이어 하나를 회전·확대할 수 있고 이를 스캔라인마다 바꿔 원근 효과를 냅니다([Wikipedia: Mode 7](https://en.wikipedia.org/wiki/Mode_7), Nintendo의 1993년 SNES 개발 매뉴얼 인용). 1990년 SNES 런칭 타이틀 [F-Zero](https://en.wikipedia.org/wiki/F-Zero_(video_game))가 대표 예입니다. 평면 하나를 비틀어 보이는 것이므로 층을 쌓는 스태킹과는 다른 기법입니다.
- **레이캐스팅**은 [Wolfenstein 3D](https://en.wikipedia.org/wiki/Wolfenstein_3D)(1992, id Software)로 대표되는 1인칭 기법입니다.
- **복셀 쪽 이웃**으로는 Ken Silverman의 [Build 엔진](https://en.wikipedia.org/wiki/Build_(game_engine))이 있습니다. [Wikipedia: Voxel](https://en.wikipedia.org/wiki/Voxel)은 Shadow Warrior와 Blood가 일부 아이템과 소품을 스프라이트 대신 복셀로 렌더링했다고 적습니다. 이것은 복셀 렌더링이지 스프라이트 스태킹 그 자체는 아닙니다.

스태킹이 롤을 못 하는 이유는 구조에서 나옵니다. 모든 층이 "수평 단면"이라는 가정 위에서만 1px 오프셋이 옆면처럼 보입니다. 비행기를 옆으로 기울이려면 기울어진 방향으로 다시 썬 단면이 필요합니다. 그래서 비행기처럼 롤이 필요한 물체는 별도 스프라이트나 다른 요령을 섞어야 합니다.

### 역사: "90년대 초"는 확인되지 않았다

이 기법을 **대중화한** 것은 비교적 최근입니다. [WIRED 2016년 10월 기사](https://www.wired.com/2016/10/nium-preview-fantastic-arcade/)는 Downwell을 만든 Ojiro "Moppin" Fumoto가 Fantastic Arcade 2016을 위해 만든 *Nium*을 소개하며, Fumoto가 발표에서 게임 공간 대부분을 2D 스프라이트를 위아래로 쌓아 만들었다고 말했다고 적습니다. 이후 GameMaker 커뮤니티 튜토리얼들(위 Azuzota, Chequered Ink, indienova)이 하나같이 Nium을 출발점으로 듭니다.

그 이전 사례는 근거가 약합니다. 커뮤니티에서는 1994년 메가드라이브 게임 Red Zone(Zyrinx)이 평평한 스프라이트를 겹쳐 벽과 구조물을 입체로 보이게 했다는 이야기가 나옵니다([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/RedZone), [ChronoCrash 포럼](https://www.chronocrash.com/forum/resources/3d-sprite-stacking.186/)). 하지만 [Wikipedia의 Red Zone 문서](https://en.wikipedia.org/wiki/Red_Zone_(1994_video_game))는 전체 화면 회전, 3D 벡터, 실시간 줌, FMV를 꼽을 뿐 스프라이트 겹치기는 적지 않고, 개발사 쪽 1차 자료는 찾지 못했습니다. 포스트가 말한 "슈퍼패미컴 시절"의 구체적인 스태킹 게임도 찾지 못했습니다. SNES의 대표적인 가짜 3D는 위의 Mode 7입니다.

## 손으로 확인해 보기: 70줄짜리 Canvas 예제

아래 파일을 `index.html`로 저장해 브라우저로 열면 됩니다. 외부 이미지 없이 복셀 함수로 집 한 채의 14개 단면을 만들고, 9채를 배치해 카메라를 천천히 돌립니다. 좌우 화살표로 카메라를 돌릴 수 있습니다. 저는 headless Chrome으로 열어 화면이 그려지는 것을 확인했습니다.

```html
<!doctype html>
<meta charset="utf-8">
<title>Sprite stacking demo</title>
<canvas id="c" width="480" height="320" style="image-rendering:pixelated;width:960px;height:640px;background:#2b4a3a"></canvas>
<script>
// 1) 복셀 모델 -> 수평 슬라이스(층별 16x16 스프라이트) 만들기
const W = 16, D = 16, H = 14;              // 가로, 세로(깊이), 층 수
function voxelColor(x, y, z) {             // 집 한 채: 벽 + 지붕 + 문
  const cx = x - 7.5, cy = y - 7.5;
  if (z < 7) {                             // 벽 (속은 비우고 외벽만)
    const wall = Math.abs(cx) > 5 && Math.abs(cx) < 7 || Math.abs(cy) > 5 && Math.abs(cy) < 7;
    if (!(Math.abs(cx) < 7 && Math.abs(cy) < 7) || !wall) return null;
    if (cy > 5 && Math.abs(cx) < 1.5 && z < 4) return "#5a3a22"; // 문
    return z % 2 ? "#e8d8b0" : "#d8c8a0";
  }
  const r = 7 - (z - 7);                   // 층이 오를수록 좁아지는 지붕
  if (Math.abs(cx) < 7.5 && Math.abs(cy) < r) return z % 2 ? "#b8443a" : "#a83a32";
  return null;
}
const slices = [];
for (let z = 0; z < H; z++) {
  const s = document.createElement("canvas");
  s.width = W; s.height = D;
  const g = s.getContext("2d");
  for (let y = 0; y < D; y++) for (let x = 0; x < W; x++) {
    const col = voxelColor(x, y, z);
    if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
  }
  slices.push(s);
}

// 2) 월드에 오브젝트 배치 (x, y는 바닥 평면 좌표, a는 오브젝트 자체 회전)
const objects = [];
for (let i = 0; i < 9; i++)
  objects.push({ x: (i % 3 - 1) * 40, y: (Math.floor(i / 3) - 1) * 40, a: i * 0.7 });

const ctx = document.getElementById("c").getContext("2d");
ctx.imageSmoothingEnabled = false;
let cam = 0;                               // 카메라 회전각
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

function frame() {
  cam += keys.ArrowLeft ? -0.03 : keys.ArrowRight ? 0.03 : 0.005;
  ctx.fillStyle = "#2b4a3a";
  ctx.fillRect(0, 0, 480, 320);
  const cos = Math.cos(cam), sin = Math.sin(cam);

  // 3) 카메라 기준으로 회전한 화면 좌표 계산
  const view = objects.map(o => ({
    o,
    sx: 240 + o.x * cos - o.y * sin,
    sy: 180 + o.x * sin + o.y * cos,
  }));
  // 4) 깊이 정렬: 화면 위쪽(먼 쪽)부터 그려야 가까운 물체가 위에 덮인다
  view.sort((p, q) => p.sy - q.sy);

  for (const { o, sx, sy } of view) {
    // 5) 아래 층부터, 한 층에 1px씩 위로 올려서, 모든 층을 같은 각도로 회전해 그린다
    for (let z = 0; z < H; z++) {
      ctx.save();
      ctx.translate(sx, sy - z);
      ctx.rotate(o.a + cam);
      ctx.drawImage(slices[z], -W / 2, -D / 2);
      ctx.restore();
    }
  }
  requestAnimationFrame(frame);
}
frame();
</script>
```

읽을 때 볼 곳은 세 군데입니다.

- `ctx.translate(sx, sy - z)`: 층마다 1px씩 위로.
- `ctx.rotate(o.a + cam)`: 모든 층에 같은 각도. 물체 자신의 방향 `o.a`에 카메라 각 `cam`을 더합니다.
- `view.sort((p, q) => p.sy - q.sy)`: 회전 **후** 화면 y로 깊이 정렬.

해 볼 만한 실험입니다.

- `ctx.translate(sx, sy - z)`를 `sy - z * 2`로 바꾸면 층 사이 틈이 생깁니다. 캔버스를 2배로 키워 그릴 때 층을 두 번씩 그려야 하는 이유입니다.
- 정렬 줄을 지우고 카메라를 돌리면, 뒤의 집이 앞의 집 위에 그려지는 순간이 보입니다.
- `voxelColor`를 바꿔 나무나 탑을 만들어 보세요. 층을 손으로 그리는 대신 함수로 정의하는 것이 "복셀 → 슬라이스" 파이프라인의 축소판입니다.

## '32KB 비행 시뮬레이터'를 열어 보면

@creativedash가 건 링크 `https://remix.ui8.ai/fly`는 301로 `forge.ui8.ai/share/frag_1eb8944c-…`로 넘어갑니다. 이 페이지의 제목은 "fighter · Forge"이고, 설명은 "Pixel-art fighter jet built by sprite stacking, over stacked islands"입니다. Forge는 [ui8.ai/forge](https://ui8.ai/forge)에서 "The visual layer for Claude Code, Codex and Cursor"라고 스스로를 소개하는 서비스입니다.

로그인 없이 열리는 공유 메타데이터 API(`/api/v1/fragments/frag_1eb8944c-…/share`, 2026-11-17 22:18 KST 조회)에서 확인한 숫자는 다음과 같습니다.

| 항목 | 값 |
| --- | --- |
| 태그 | `pixel-art`, `sprite-stacking`, `canvas`, `animation`, `interactive`, `game` |
| 만든 시각 / 마지막 공개 | 2026-11-15 15:51 KST / 2026-11-17 02:59 KST (revision 44, 공개 revision 43) |
| 소스 크기 (`sourceByteSize`) | **48,795바이트** |
| 에셋 | 32개, 합계 2,659,352바이트: `jet-four-views.png`(689,268), `pilot-four-views.png`(862,083), mp3 효과음 30개 |
| 전체 크기 (`byteSize`) | 3,183,871바이트 |

정리하면 이렇습니다.

- "스프라이트 스태킹으로 만든 픽셀 아트 전투기"라는 설명과 태그는 제작자 쪽 메타데이터와 일치합니다.
- **현재 공개본**의 코드는 32KB가 아니라 약 48KB(48,795바이트)이고, 이미지와 소리를 합치면 약 3.2MB입니다. 다만 트윗(2026-11-16 01:16 KST) 이후에도 수정이 이어졌으므로, 트윗 시점의 코드가 32KB였을 가능성은 배제할 수 없습니다. 그 시점 버전은 확인하지 못했습니다. 어느 쪽이든 한국어 포스트의 "32kb짜리 비행 시뮬레이터"처럼 **전체가 32KB**라고 읽으면 틀립니다.
- 소스 본문은 로그인 없이 읽을 수 없어서 "폴리곤이 없다"는 코드로 확인하지 못했습니다. 설명에 "click rolls"(클릭하면 롤)가 있는데, 앞에서 본 것처럼 순수한 수평 단면 스태킹은 롤을 표현하지 못합니다. 에셋 이름이 `jet-four-views.png`(네 방향 그림)인 것을 보면 별도 스프라이트를 섞었을 수 있지만, 이것은 추정입니다.
- "AI가 끌어올렸다"는 부분은 Forge가 코딩 에이전트용 서비스라는 정황뿐이고, 이 데모의 픽셀을 AI가 그렸다는 제작자 진술은 찾지 못했습니다.

## 비즈니스 인사이트

### 시장: 공급 과잉 속의 '보이는 차별점'

[SteamDB 연도별 출시 집계](https://steamdb.info/stats/releases/)는 2025년 Steam 출시작을 2만 개 남짓으로 셉니다. 이 수치는 조회 시점마다 바뀝니다(검색 인덱스의 최근 스냅샷은 21,181개, 2026년 8월 보도 스냅샷은 21,344개). [PC Gamer](https://www.pcgamer.com/gaming-industry/more-than-19-000-games-launched-on-steam-this-year-but-almost-half-have-fewer-than-10-reviews/)가 인용한 2025년 12월 12일 스냅샷에서는 19,112개 중 9,327개가 리뷰 10개 미만, 2,229개는 리뷰 0개였습니다.

**분석:** 하루 수십 개씩 나오는 시장에서 소규모 팀이 쓸 수 있는 몇 안 되는 무기는 스크린샷과 짧은 영상에서 바로 보이는 시각적 개성입니다. 스프라이트 스태킹은 "픽셀 아트인데 돈다"는 점이 몇 초짜리 영상에서 바로 드러납니다. 이번 북마크들이 퍼진 방식도 그렇습니다. 원본 데모 영상 두 개가 퍼지고, 설명은 그 뒤에 붙었습니다.

### 비용 구조: 렌더링은 싸고 아트는 비싸다

- **도구값은 낮습니다.** 층을 그리는 데 흔히 쓰는 Aseprite는 2026-11-17 Steam 미국 스토어 API(`appids=431730&cc=us`) 기준 `$19.99`(할인 0%)입니다. MagicaVoxel 같은 복셀 편집기에서 슬라이스로 내보내는 경로도 있습니다.
- **비싼 것은 시간입니다.** 16×16×14 모델 하나가 14장의 그림입니다. 물체 종류가 늘면 층 수 × 물체 종류만큼 늘어납니다. Wee Boats 노트가 적듯 애니메이션은 층을 가로질러야 해서 더 비쌉니다.
- **실행 비용은 대체로 작지만 공짜는 아닙니다.** 물체 × 층만큼의 그리기 호출과 오버드로가 있어 물체 수가 많은 장면에서는 캐시나 배치가 필요합니다.

### AI 픽셀 아트 도구: 어디까지 와 있나

- [PixelLab](https://www.pixellab.ai/) 홈페이지는 "Create unique pixel art assets for your game 10x faster with AI", "Loved by 3,000+ indie game developers"라고 적고, 기능으로 4·8방향 회전, 스켈레톤 기반 애니메이션, 타일셋, 인페인팅을 나열합니다. "10배", "3,000명 이상"은 업체 주장이며 이 글이 검증하지 않았습니다. 공식 가격 페이지는 이 글을 쓰는 동안 직접 열지 못해 가격은 적지 않습니다.
- 이번 데모가 올라간 Forge는 Claude Code, Codex, Cursor 같은 코딩 에이전트의 결과물을 공유하고 리믹스하는 서비스로 자신을 소개합니다. 데모의 공유 메타데이터에도 `linkAccess: remix`가 있습니다.
- Steam은 2024년 1월부터 개발자가 Content Survey에서 AI 사용을 밝히도록 했습니다. 개발 중 AI로 만든 콘텐츠(Pre-Generated)는 불법·침해 콘텐츠가 아님을 확인해야 하고, 공개 내용의 상당 부분이 스토어 페이지에 표시됩니다([Valve 공지](https://store.steampowered.com/news/group/4145017/view/3862463747997849618), [The Verge](https://www.theverge.com/2024/1/10/24032678/valve-steam-generative-ai-rules-disclosure-pre-generated-live-illegal-content-copyright)).

### 개발자에게 의미하는 것 (분석/의견)

- **AI는 "층을 그리는 일"보다 "복셀을 만드는 일"에 붙는 편이 맞다고 봅니다.** 스태킹에서 어려운 것은 층 하나하나의 그림이 아니라 층 사이의 **일관성**입니다. 14장을 따로 생성하면 층끼리 어긋날 위험이 큽니다. 3D 형태(복셀)를 하나 만들고 기계적으로 썰면 층 사이 일관성은 공짜로 따라옵니다. 예제의 `voxelColor` 함수가 그 축소판이고, 코딩 에이전트가 쓰기에도 이미지보다 이런 함수나 복셀 데이터가 다루기 쉽습니다.
- **8방향 스프라이트 생성 도구와는 경쟁이자 보완 관계입니다.** PixelLab 같은 도구가 4·8방향 회전 이미지를 싸게 만들어 주면, "연속 회전"이 꼭 필요한 물체(차량, 배, 건물, 카메라가 도는 게임)에만 스태킹을 쓰고 나머지는 방향별 스프라이트로 가는 혼합이 현실적입니다.
- **영상의 숫자는 조달 판단의 근거가 아닙니다.** 이번 "32KB"처럼 데모 영상의 한 줄 숫자는 버전과 범위(코드만인지 에셋 포함인지)가 빠져 있기 쉽습니다. 기법을 도입할 때는 직접 만든 최소 예제로 층 수 × 물체 수에서 프레임 시간을 재 보는 편이 빠릅니다.
- **AI로 만든 픽셀을 출시작에 쓰면 Steam 공개 의무가 따라옵니다.** 마케팅 문구에 "AI로 만든"을 넣지 않더라도 스토어 페이지에는 표시될 수 있으니, 아트 파이프라인을 정할 때 같이 고려해야 합니다.

## 팩트 체크

### X 포스트 (@meta_pavy, @creativedash, @asynkimo)

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 데모는 스프라이트 스태킹으로 만든 픽셀 아트 비행기다 | ✅ | 공유 페이지 설명 "Pixel-art fighter jet built by sprite stacking", 태그 `sprite-stacking`. [Forge 공유 페이지](https://remix.ui8.ai/fly) |
| "32 KB of code" (@creativedash) | ⚠️ | 현재 공개본(revision 43~44)의 `sourceByteSize`는 48,795바이트입니다. 트윗 이후 수정이 있어 트윗 시점 크기는 확인 불가. [원 포스트](https://x.com/creativedash/status/2122000830895386680), [Forge 공유 페이지](https://remix.ui8.ai/fly) |
| "32kb짜리 비행시뮬레이터" (전체 크기로 읽을 때) | ❌ | 에셋만 32개 2,659,352바이트(PNG 2개 약 1.55MB, mp3 30개), 전체 `byteSize` 3,183,871바이트. [인용된 포스트](https://x.com/meta_pavy/status/2122241297482408234) |
| 3D 엔진도 폴리곤도 없다 | ⚠️ | 설명·태그(`canvas`)와는 맞지만 소스를 읽지 못해 미확인. 설명의 "click rolls"는 순수 수평 단면 스태킹으로는 어려운 동작입니다. [Forge 공유 페이지](https://remix.ui8.ai/fly) |
| AI로 끌어올린 결과물이다 | ⚠️ | Forge가 코딩 에이전트용 서비스라는 정황뿐, 이 데모를 AI가 만들었다는 제작자 진술은 찾지 못했습니다. [ui8.ai/forge](https://ui8.ai/forge) |
| 스프라이트 스태킹은 90년대 초부터 종종 쓰인 기법이다 | ⚠️ | 1994년 Red Zone(메가드라이브) 사례가 커뮤니티 자료에만 있고 Wikipedia 문서·개발사 1차 자료로는 확인 못 함. 대중화는 2016년 Nium. [WIRED 2016](https://www.wired.com/2016/10/nium-preview-fantastic-arcade/), [Wikipedia: Red Zone](https://en.wikipedia.org/wiki/Red_Zone_(1994_video_game)) |
| "슈퍼패미컴 시절에 도트로 쌓아올린 그 감성" | ⚠️ | SNES 스태킹 게임은 찾지 못했습니다. SNES의 대표 가짜 3D는 Mode 7(배경 1장 아핀 변환)로 다른 기법입니다. [Wikipedia: Mode 7](https://en.wikipedia.org/wiki/Mode_7) |
| 도트를 엄청나게 찍어야 하는 노동집약적 기법이다 | ✅ | 층마다 그림이 필요하고, 개발자 노트가 층별 작화·미리보기·애니메이션의 어려움을 적습니다. [Wee Boats 노트](https://james.poole.ie/notes/stack) |
| 스태킹으로 픽셀 아트를 "어떤 각도로든" 돌릴 수 있다 (@asynkimo) | ⚠️ | 수직축 회전(요)은 연속으로 됩니다. 롤·피치나 아래에서 보기는 수평 단면 구조상 안 됩니다. 카메라 높이는 단면 압축으로 일부 흉내 낼 뿐입니다. [Azuzota 스크립트 설명](https://azuzota.itch.io/sprite-stacking-with-perspective), [원 포스트](https://x.com/asynkimo/status/2121716250820964431) |

### 배경 지식

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| Nium(Moppin)이 스프라이트를 쌓아 깊이감을 냈다 | ✅ | Fumoto가 게임 공간 대부분을 2D 스프라이트를 쌓아 만들었다고 발표. [WIRED 2016-10](https://www.wired.com/2016/10/nium-preview-fantastic-arcade/) |
| 층마다 1px씩 올리고 같은 각도로 회전해 그린다 | ✅ | `draw_sprite_ext(..., x, y-i, ..., image_angle, ...)`. [Chequered Ink](https://chequered.ink/2-5d-in-gamemaker-using-sprite-stacking/) |
| Mode 7은 SNES에서 배경 레이어를 회전·확대하고 스캔라인마다 바꿀 수 있다 | ✅ | [Wikipedia: Mode 7](https://en.wikipedia.org/wiki/Mode_7) (Nintendo SNES 개발 매뉴얼 인용) |
| Shadow Warrior와 Blood는 Build 엔진에서 일부 소품을 복셀로 그렸다 | ✅ | [Wikipedia: Voxel](https://en.wikipedia.org/wiki/Voxel) |
| 물체가 많으면 성능 부담이 커진다 | ✅ (원리) | 물체 × 층만큼 그리기 호출. [indienova](https://indienova.com/u/lazyeo/blogread/31523). 구체적 프레임 수치는 이 글에서 재지 않았습니다. |

## 참고 자료

- 원본 X 포스트: [@meta_pavy (해설)](https://x.com/meta_pavy/status/2122566766744555760) · [@meta_pavy (32kb 비행 시뮬레이터)](https://x.com/meta_pavy/status/2122241297482408234) · [@creativedash (원 데모)](https://x.com/creativedash/status/2122000830895386680) · [@asynkimo (회전 데모)](https://x.com/asynkimo/status/2121716250820964431)
- 데모: [remix.ui8.ai/fly → Forge "fighter"](https://remix.ui8.ai/fly) · [Forge 소개](https://ui8.ai/forge)
- [WIRED, 8-Bit Nium Is a Striking Glimpse at an Irradiated Wilderness (2016-10)](https://www.wired.com/2016/10/nium-preview-fantastic-arcade/)
- [Chequered Ink, 2.5D in GameMaker using Sprite-Stacking](https://chequered.ink/2-5d-in-gamemaker-using-sprite-stacking/)
- [Azuzota, Improved Sprite Stacking (GameMaker 스크립트)](https://azuzota.itch.io/sprite-stacking-with-perspective)
- [James Poole, How we are using Sprite Stacking for Wee Boats (2024-02-11)](https://james.poole.ie/notes/stack)
- [indienova, 伪3D之Sprite Stacking](https://indienova.com/u/lazyeo/blogread/31523)
- Wikipedia: [Mode 7](https://en.wikipedia.org/wiki/Mode_7) · [F-Zero](https://en.wikipedia.org/wiki/F-Zero_(video_game)) · [Wolfenstein 3D](https://en.wikipedia.org/wiki/Wolfenstein_3D) · [Build engine](https://en.wikipedia.org/wiki/Build_(game_engine)) · [Voxel](https://en.wikipedia.org/wiki/Voxel) · [Red Zone (1994)](https://en.wikipedia.org/wiki/Red_Zone_(1994_video_game))
- 커뮤니티 자료: [TV Tropes: Red Zone](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/RedZone) · [ChronoCrash: 3D Sprite Stacking](https://www.chronocrash.com/forum/resources/3d-sprite-stacking.186/)
- 시장: [SteamDB 연도별 출시 집계](https://steamdb.info/stats/releases/) · [PC Gamer (2025-12)](https://www.pcgamer.com/gaming-industry/more-than-19-000-games-launched-on-steam-this-year-but-almost-half-have-fewer-than-10-reviews/) · [Aseprite Steam](https://store.steampowered.com/app/431730/Aseprite/) · [PixelLab](https://www.pixellab.ai/)
- Steam AI 정책: [Valve 공지 (2024-01)](https://store.steampowered.com/news/group/4145017/view/3862463747997849618) · [The Verge (2024-01-10)](https://www.theverge.com/2024/1/10/24032678/valve-steam-generative-ai-rules-disclosure-pre-generated-live-illegal-content-copyright)
