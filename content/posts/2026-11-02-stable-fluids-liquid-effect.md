---
title: "손가락으로 펴 바르는 파운데이션, 그 밑엔 1999년 논문이 있다: Stable Fluids로 만든 WebGL 액체 효과 팩트 체크"
date: 2026-11-02
slug: stable-fluids-liquid-effect
tags: [WebGL, GLSL, 유체시뮬레이션, StableFluids, three.js, 팩트체크]
summary: "Misaki Nakano(@misaki_mofu)가 5년 전 만든 '펴 바르는 액체' 효과를 공개했습니다. 그 바탕인 Jos Stam의 Stable Fluids(SIGGRAPH 1999)를 개발자 관점에서 정리하고, 글과 포스트의 주장을 원 논문·GPU Gems·소스 코드로 검증했습니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@misaki_mofu(Misaki Nakano)의 포스트](https://x.com/misaki_mofu/status/2116729774207021360)를 계기로, 링크된 글 [*Spreading Liquid with three.js*](https://mofu-dev.com/en/blog/fluid-foundation/)와 그 원전인 Jos Stam의 [*Stable Fluids*](https://www.josstam.com/_files/ugd/cf1fd6_898fe9b63df946689101b8d074f8efba.pdf)(SIGGRAPH 1999), NVIDIA [*GPU Gems* 38장](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)을 직접 읽고 정리한 것입니다.

## 무슨 이야기인가

2026년 11월 1일(KST), WebGL 개발자 Misaki Nakano가 X에 이렇게 올렸습니다.

> "I wrote a new article about a liquid effect I implemented 5 years ago. … Stable Fluids is used in this algorithm, and I explain how I applied it to create the liquid effect in this article. There are also small interactive demos …"

글의 주인공은 2021년 일본 화장품 브랜드의 **리퀴드 파운데이션 프로모션 사이트**를 위해 만든 효과입니다. 화면 위의 반구형 액체 방울을 마우스나 손가락으로 끌면, 액체가 밀려나며 반대편이 부풀고 얇게 펴진 자국이 남습니다. 저자는 이 내용으로 2026년 10월 24일 [Vue Fes Japan 2026](https://vuefes.jp/2026/en/speaker/mnmxmx)에서 발표도 했습니다.

개발자 입장에서 흥미로운 지점은 세 가지입니다.

- **브라우저에서, 실시간으로, 프래그먼트 셰이더만으로** 유체처럼 보이는 걸 만든다는 것.
- 그 밑바닥에 있는 알고리즘이 **27년 전 SIGGRAPH 논문** 하나라는 것.
- 그런데 이 "액체"는 사실 **물리적으로 정확한 액체 시뮬레이션이 아니라는 것** — 저자 본인이 그렇게 씁니다. 그 "정확하지 않음"을 어디에 어떻게 허용했는지가 이 글의 진짜 노하우입니다.

## 배경: 왜 하필 Stable Fluids인가

### 풀어야 할 방정식

비압축성(incompressible) 유체의 속도장 `u`와 압력 `p`는 Navier–Stokes 방정식을 따릅니다. (블로그가 수식 렌더링을 지원하지 않아 텍스트로 적습니다. 밀도 ρ는 1로 둡니다.)

```text
∂u/∂t = −(u·∇)u  −  ∇p  +  ν∇²u  +  F      (운동량: 이류 / 압력 / 점성 확산 / 외력)
∇·u   = 0                                   (비압축성: 어디서도 유체가 생기거나 사라지지 않음)
```

화면을 격자로 보고 픽셀 하나를 셀 하나로 두면(Eulerian 관점), GPU의 텍스처가 곧 "격자 배열"이 되고 프래그먼트 셰이더가 "모든 셀에 대해 같은 계산을 하는 루프 본문"이 됩니다. GPU Gems 38장이 정확히 이 비유(Textures = Arrays, Loop Bodies = Fragment Programs)로 설명합니다.

### 문제는 "폭발"

Stam 이전의 그래픽스용 유체 솔버(예: Foster & Metaxas)는 이 방정식을 **명시적(explicit) 시간 적분**으로 풀었습니다. 구현은 쉽지만, 시간 간격 `dt`가 크거나 속도가 빠르면 수치적으로 "blow up"해 버립니다. 사용자가 마우스를 세게 휘두르는 인터랙티브 환경에서는 치명적이죠. Stam은 논문 결론에서 원래 Foster & Metaxas의 방법을 쓰려다 *"the instabilities inherent in their method forced us to develop a new algorithm"* 이라고 적었습니다.

Stam의 제안은 **어떤 `dt`를 써도 폭발하지 않는(unconditionally stable)** 솔버였고, 대신 그는 발표 자료에 스스로 **"NOT accurate"** 라고 적었습니다. 그래픽스에서는 정확도보다 "보기에 유체 같고, 실시간으로 돌고, 절대 터지지 않는 것"이 중요하다는 판단입니다.

## Stable Fluids 한 스텝 해부

핵심은 **연산자 분할(operator splitting)**: 방정식의 항을 한꺼번에 풀지 않고, 하나씩 순서대로 적용합니다. Stam 논문의 순서는 다음과 같습니다.

```text
w0 = u(t)
w1 = w0 + dt·F                  ① 외력 추가
w2 = w1(p(x, −dt))              ② 이류 (semi-Lagrangian 역추적)
w3 = (I − ν·dt·∇²)⁻¹ w2         ③ 점성 확산 (암시적 풀이)
u(t+dt) = P(w3)                 ④ 투영 (발산 제거)
```

### ① 외력

마우스 드래그 같은 힘을 속도에 더합니다. GPU Gems는 클릭 위치에 2차원 가우시안 "splat"을 찍어 속도 텍스처에 더하는 방식을 씁니다.

### ② 이류: 앞으로 밀지 말고, 뒤로 따라가라

"속도가 속도 자신을 실어 나르는" 비선형 항 `−(u·∇)u`가 가장 까다롭습니다. Stam은 이를 **특성곡선법(method of characteristics)** 으로 풉니다. 직관적으로는:

> 각 셀 `x`에서 현재 속도를 따라 **시간을 `dt`만큼 거꾸로** 추적해 출발점 `x − dt·u(x)`를 찾고, 그 위치의 값을 **선형 보간**으로 읽어 와 새 값으로 쓴다.

이른바 semi-Lagrangian 이류입니다. GPU에 특히 잘 맞는 이유도 GPU Gems가 정확히 짚습니다. 입자를 앞으로 미는(scatter) 방식은 프래그먼트가 *자기가 쓸 위치를 바꿀 수 없기 때문에* 셰이더로 구현할 수 없지만, 뒤로 따라가 읽는(gather) 방식은 텍스처 샘플 한 번이면 됩니다.

**왜 무조건 안정한가?** Stam의 설명은 한 줄입니다. 새 값은 이전 필드의 어떤 지점을 보간한 값이므로, *"the maximum value of the new field is never larger than the largest value of the previous field."* 선형 보간은 주변 값의 볼록 결합(가중 평균)이라 최댓값을 넘을 수 없고, 따라서 `dt`가 아무리 커도 값이 증폭되지 않습니다. 참고로 Stam은 고차 보간을 쓰지 않은 이유로 진동·오버슈트에 의한 불안정을 들었습니다.

다음은 제가 직접 쓴 **설명용 GLSL**입니다(WebGL1 스타일, 실제 프로젝트 코드 아님).

```glsl
// [설명용 예제] semi-Lagrangian advection
precision highp float;
uniform sampler2D uVelocity;   // 속도장 (xy)
uniform sampler2D uSource;     // 실어 나를 값 (속도 자신, 염료, 높이 등)
uniform vec2  uTexelSize;      // 1.0 / 격자 해상도
uniform float uDt;
varying vec2 vUv;

void main() {
  vec2 vel = texture2D(uVelocity, vUv).xy;
  // 속도를 '격자 셀/초' 단위로 두고, UV 공간으로 바꿔 거꾸로 추적
  vec2 prevUv = vUv - uDt * vel * uTexelSize;
  // LINEAR 필터링된 float 텍스처면 샘플러가 쌍선형 보간을 해 준다
  gl_FragColor = texture2D(uSource, prevUv);
}
```

### ③ 점성 확산: 암시적으로

`∂u/∂t = ν∇²u`를 명시적으로 풀면 점성이 클 때 불안정해지므로, Stam은 **암시적(implicit)** 형태 `(I − ν·dt·∇²) w3 = w2`를 씁니다. 이산화하면 희소 선형 시스템이 됩니다. 실무 팁: mofu의 이전 글은 *시각 효과라면 이 단계를 생략해도 무방하다*고 하며, 실제로 공개 저장소 [mnmxmx/fluid-three](https://github.com/mnmxmx/fluid-three)의 기본 설정도 `isViscous: false`입니다.

### ④ 투영: Helmholtz–Hodge 분해

①~③을 거친 `w3`는 일반적으로 발산(`∇·w ≠ 0`)이 있어, 유체가 어딘가에서 생기거나 사라지는 상태입니다. 여기서 **Helmholtz–Hodge 분해**가 등장합니다. 어떤 벡터장이든 *발산 없는 장 + 스칼라장의 기울기*로 유일하게 분해된다는 정리입니다.

```text
w = u + ∇p          (∇·u = 0)
→ 양변에 발산:  ∇²p = ∇·w      ← 압력 푸아송 방정식
→ 투영:         u = w − ∇p
```

즉 "발산을 계산 → 푸아송 방정식으로 `p`를 구함 → 기울기를 빼기" 세 패스입니다. 이 투영 덕분에 유체가 비압축성을 유지하고, Stam의 표현으로는 *"the projection step forces the fields to have vortices which result in more swirling-like motions"* — 유체 특유의 소용돌이가 생깁니다.

### GPU에서 푸아송 방정식 풀기: Jacobi 반복

GPU Gems 38장은 이 푸아송 방정식을 **Jacobi 반복**으로 풉니다. 각 셀을 "이웃 네 칸의 평균 − 우변"으로 갱신하는 걸 수십 번 반복하는, 가장 단순한 방법입니다. 모든 셀이 *이전 반복 결과만* 읽으므로 완전히 병렬이고, 텍스처 두 장을 번갈아 쓰는 ping-pong으로 구현됩니다. 챕터는 압력에 대해 **보통 40~80회**를 쓰고, **20회 미만이면 오차가 눈에 띈다**고 권합니다.

```glsl
// [설명용 예제] 압력 푸아송 방정식 ∇²p = div 의 Jacobi 한 스텝 (셀 간격 h = 1)
precision highp float;
uniform sampler2D uPressure;     // 이전 반복의 p (ping)
uniform sampler2D uDivergence;   // ∇·w
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float pL = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).r;
  float pR = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).r;
  float pB = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).r;
  float pT = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).r;
  float div = texture2D(uDivergence, vUv).r;
  // (pL + pR + pB + pT − 4p) = div  →  p = (pL + pR + pB + pT − div) / 4
  gl_FragColor = vec4((pL + pR + pB + pT - div) * 0.25, 0.0, 0.0, 1.0);
}
```

```js
// [설명용 예제] three.js에서 ping-pong으로 반복 (렌더 타깃 두 개를 번갈아 사용)
for (let i = 0; i < 40; i++) {
  jacobiMaterial.uniforms.uPressure.value = rtA.texture;  // 읽기
  renderer.setRenderTarget(rtB);                          // 쓰기
  renderer.render(fullscreenQuadScene, camera);
  [rtA, rtB] = [rtB, rtA];                                // 교체
}
renderer.setRenderTarget(null);
```

> ⚠️ 흔한 오해: "Stable Fluids = Jacobi 반복"은 **아닙니다.** Stam의 원 논문은 오히려 *"Relaxation schemes, though, have poor convergence and usually require many iterations"* 라며 더 정확한 솔버를 택했습니다. 이론적 최선은 multigrid, 실제 구현은 FISHPAK 라이브러리 솔버였고, 주기 경계에서는 FFT로 확산과 투영을 푸리에 공간에서 한 번에 처리합니다. Jacobi는 GPU Gems가 *"simplicity and easy implementation"* 때문에 고른 것이고, 지금 웹에 돌아다니는 WebGL 유체 구현 대부분이 이 GPU Gems 계보입니다.

## 손으로 확인해 보기

위 이야기를 작은 Node.js 장난감으로 확인했습니다. (논문·저자 코드가 아니라 제가 쓴 64×64 주기 경계 CPU 예제입니다. 전체 파일: [stable_fluids_toy.mjs](../../static/stable_fluids_toy.mjs), `node stable_fluids_toy.mjs`로 실행)

핵심 부분만 발췌하면 이렇습니다.

```js
// semi-Lagrangian: 거꾸로 따라가서 보간해 읽기
out[k] = sample(q, i - dt * u[k], j - dt * v[k]);

// 비교용 명시적(FTCS) 이류: 중앙차분 기울기로 앞으로 적분
out[k] = q[k] - dt * (u[k] * dqdx + v[k] * dqdy);
```

제 환경(Node.js v20)에서의 출력입니다.

```text
[안정성] 염료 최댓값 |q|max (초기 1.0), 30 스텝 후
  dt= 0.5  semi-Lagrangian=1.000  explicit=9.86e+0
  dt=   5  semi-Lagrangian=1.000  explicit=8.85e+21
  dt=  50  semi-Lagrangian=0.368  explicit=6.15e+51
```

명시적 방법은 `dt=0.5`에서도 값이 10배 가까이 부풀고, `dt`를 키우면 그대로 폭발합니다. semi-Lagrangian은 **어떤 `dt`에서도 1.0을 넘지 않습니다.** 그런데 `dt=50`에서는 최댓값이 0.368로 **줄어든** 것에 주목하세요. 터지지 않는 대신 보간을 반복하며 값이 뭉개지는 **수치 확산(numerical dissipation)** 입니다. "안정하다"는 "정확하다"가 아닙니다 — Stam이 "NOT accurate"라고 쓴 바로 그 지점이죠. GPU Gems도 데모에서 염료 확산 항을 아예 계산하지 않는데, 이류의 수치 오차가 어차피 확산을 만들어 내기 때문이라고 설명합니다.

투영 쪽도 하나 확인했습니다. 발산이 있는 랜덤 "마우스 힘" 속도장을 투영한 뒤 남는 발산(중앙차분 기준 RMS)입니다.

```text
[투영] Jacobi 반복 수에 따른 잔여 발산 RMS (투영 전: 0.0883)
  iters=  0  stride1=0.0883  stride2=0.0883
  iters= 20  stride1=0.0475  stride2=0.0182
  iters= 80  stride1=0.0282  stride2=0.0059
  iters=400  stride1=0.0216  stride2=0.0002
```

- **반복 수가 곧 품질 손잡이**입니다. 20회에서는 발산이 아직 절반 가까이 남습니다. GPU Gems가 "20회 미만은 오차가 눈에 띈다"고 한 이유를 숫자로 볼 수 있습니다.
- `stride1`은 위 GLSL처럼 **바로 옆 칸**을 쓰는 라플라시안, `stride2`는 **두 칸 건너** 셀을 쓰는 라플라시안입니다. 셀 중심에 속도와 압력을 함께 두는 격자(collocated grid)에서 발산과 기울기를 중앙차분으로 계산하면, 그 둘을 합성한 라플라시안은 정확히 2칸 간격 스텐실이 됩니다. 그래서 stride2는 (이 장난감에서) 반복할수록 발산이 0으로 수렴하고, stride1은 일정 수준에서 멈춥니다. 대신 2칸 스텐실은 격자를 서로 연결되지 않은 부분 격자로 쪼개 체커보드 형태의 압력 잡음이 생길 수 있다는 단점이 알려져 있어, 더 정확하게 가려면 GPU Gems 38.5.3이 소개하는 **staggered grid**로 갑니다. 흥미롭게도 mofu의 이전 글과 [fluid-three의 `poisson.frag`](https://github.com/mnmxmx/fluid-three/blob/master/js/modules/glsl/sim/poisson.frag)는 수식을 손으로 전개해 이 **2칸 스텐실**에 도달했습니다.

## mofu 글은 Stable Fluids를 어떻게 "액체"로 바꿨나

여기서부터가 원문의 핵심입니다. 먼저 짚어 둘 사실: **Stable Fluids 자체는 물 같은 액체의 표면을 다루지 않습니다.** Stam은 결론에서 *"we have not addressed the problem of simulating fluids with free boundaries, such as water"* 라고 명시했고, GPU Gems 38장도 자유 표면(free surface)은 범위 밖이라고 적습니다. 두 방법 모두 "화면 전체를 채운 유체"의 **속도장**만 계산합니다.

mofu의 해법은 **속도장은 Stable Fluids에게 맡기고, 액체의 '양'은 별도의 높이맵으로 표현하는 것**입니다. 이전 글 [*Stable Fluids with three.js*](https://mofu-dev.com/en/blog/stable-fluids/)(2022-07-31)의 시뮬레이션이 만든 velocity map을 그대로 쓰고, 그 위에 세 단계를 얹습니다.

1. **높이맵(두께) 이동** — FBO의 R 채널에 액체 두께를 저장합니다. 초기값은 셰이더로 만든 반구형 방울. 매 프레임 각 픽셀은
   - 자기 속도가 클수록 두께의 일부(`removed`)를 잃고,
   - 속도를 **거꾸로 추적한 출발 지점**(semi-Lagrangian과 같은 `backtraceUv()`)에서 두께의 일부(`added`)를 가져옵니다.
   - `smoothstep`으로 속도 임계값을 둬서, 거의 안 움직이는 곳은 흐르지 않게 합니다.
2. **알파맵으로 자국 남기기** — 지금까지 기록된 두께의 **최댓값 이력**을 저장해, 액체가 지나간 자리에 얇게 색이 남도록 합니다. 저자는 이것이 건조·흡수의 물리 모델이 아니라 "단순한 이력"이라고 밝힙니다.
3. **높이맵에서 법선 계산 → Matcap 렌더링** — 지오메트리를 변형하지 않고, 프래그먼트 셰이더에서 이웃 픽셀 높이로 두 접선 벡터를 만들어 외적으로 법선을 구한 뒤 Matcap 텍스처로 하이라이트를 입힙니다.

1단계의 구조를 제 식으로 단순화하면 이렇습니다(**설명용 의사 코드**, 원문 코드 아님. 원문의 상수와 세부 구현은 [원문](https://mofu-dev.com/en/blog/fluid-foundation/) 참고).

```glsl
// [설명용 예제] '속도에 비례해 내보내고, 역추적한 곳에서 받아 오는' 두께 갱신
float h      = texture2D(uHeight, vUv).r;
vec2  vel    = texture2D(uVelocity, vUv).xy;
vec2  srcUv  = vUv - uDt * vel * uTexelSize;                // semi-Lagrangian 역추적
float hSrc   = texture2D(uHeight, srcUv).r;
float kHere  = smoothstep(uMinSpeed, uMaxSpeed, length(vel));
float kSrc   = smoothstep(uMinSpeed, uMaxSpeed, length(texture2D(uVelocity, srcUv).xy));
float removed = min(h,    kHere * uRate * h);
float added   = min(hSrc, kSrc  * uRate * hSrc);
gl_FragColor  = vec4(max(0.0, h - removed + added), 0.0, 0.0, 1.0);
```

### "물리적으로 정확하지 않다"는 고백이 핵심이다

저자는 이 방식이 **부피를 보존하지 않는다**고 분명히 씁니다. 이유는 앞의 GPU 제약과 같습니다. 프래그먼트는 다른 픽셀에 값을 써 넣을(scatter) 수 없으니, 각 목적지 픽셀이 출발지를 거꾸로 찾아 읽어(gather) 옵니다. 그런데 여러 픽셀이 대략 같은 출발 영역을 읽을 수 있어서, 빠져나간 양과 들어온 양의 합이 맞지 않습니다. 원문 데모에서 직선으로 끌면 꽤 안정적이지만, **원을 그리면 샘플링 편향이 누적돼 액체가 계속 늘어난다**고 합니다. 저자는 이를 알고도 "보기 좋은 것"을 택했습니다.

### 덤: 8비트 텍스처의 계단

원문에는 높이맵을 8비트와 32비트 float 텍스처로 토글해 보는 데모도 있습니다. 8비트는 채널당 256단계뿐이라 높이가 양자화되고, 법선은 높이의 **차분**에서 나오므로 그 계단이 셰이딩에 그대로 드러납니다. 색 그라데이션의 밴딩 문제로만 알던 정밀도 한계가 "조명 계단"으로 보인다는 관찰입니다. 실무 교훈: 시뮬레이션용 FBO는 `THREE.FloatType`(또는 `HalfFloatType`) 렌더 타깃을 쓰세요. 원문 저자의 이전 글 코드도 FBO를 `FloatType`으로 만듭니다.

마지막 실험으로 색이 다른 세 방울을 같은 속도장 위에서 섞는 데모도 있는데, 저자는 두께에 따른 색 혼합에 **단순화한 Kubelka–Munk 모델**을 썼다고 설명합니다.

## 팩트 체크

X 포스트와 원문(및 원문이 기대는 1차 자료)의 주장을 대조했습니다. ✅ 사실 / ⚠️ 부분적으로 사실·검증 한계 / ❌ 사실 아님

### X 포스트 (@misaki_mofu)

| 주장 | 판정 | 근거 |
|---|---|---|
| "5년 전에 구현한 액체 효과" | ✅ | 원문: 2021년 1월 의뢰, 2021년 공개 프로젝트. 저자의 2021-12-18 포스트는 사이트가 "올해 6월" 공개됐다고 씀. 2026년 11월 기준 약 5년. [원문](https://mofu-dev.com/en/blog/fluid-foundation/) · [2021년 포스트](https://x.com/misaki_mofujp/status/1472284738971107330) |
| "이 알고리즘에 Stable Fluids를 사용" | ✅ | 속도장은 이전 글의 Stable Fluids 구현(외력→이류→(점성)→투영)에서 나옴. 단, 액체 두께 이동은 Stable Fluids가 아니라 저자 고유의 높이맵 기법. [이전 글](https://mofu-dev.com/en/blog/stable-fluids/) · [fluid-three](https://github.com/mnmxmx/fluid-three) |
| "어떻게 적용했는지 설명" | ✅ | 높이맵 이동·알파맵·법선/Matcap 3단계를 GLSL과 함께 설명. [원문](https://mofu-dev.com/en/blog/fluid-foundation/) |
| "작은 인터랙티브 데모가 있다" | ✅ | 액체 펴기 데모, 8bit/32bit float 토글, 3색 혼합 데모. [원문](https://mofu-dev.com/en/blog/fluid-foundation/) |

### 원문 글의 주장

| 주장 | 판정 | 근거 |
|---|---|---|
| Vue Fes Japan 2026에서 이 효과를 발표 | ✅ | 2026-10-24 Vue Track 16:55–17:25, "Finite Computation and a Smooth World, Seen Through WebGL". 참가 후기도 파운데이션 표현을 언급. [Vue Fes 스피커 페이지](https://vuefes.jp/2026/en/speaker/mnmxmx) · [참가 후기](https://www.wantedly.com/companies/jointcrew/post_articles/1102034) |
| 이전 글의 velocity map을 그대로 사용 | ✅ | 원문 명시. 이전 글의 데모·소스 공개. [데모](https://fluid-threejs.netlify.app/) · [GitHub](https://github.com/mnmxmx/fluid-three) |
| 두께 이동에 이류(속도 역추적 후 샘플링)를 사용 | ✅ | `backtraceUv()`는 Stam의 semi-Lagrangian 역추적과 같은 구조. [Stam 1999 §2.2](https://www.josstam.com/_files/ugd/cf1fd6_898fe9b63df946689101b8d074f8efba.pdf) |
| 프래그먼트 셰이더는 다른 픽셀에 쓸 수 없어 역추적(gather)을 쓴다 | ✅ | GPU Gems 38장: fragment programs *"cannot change the locations of the fragments they are writing"*. [GPU Gems ch.38](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu) |
| 이 방식은 물리적으로 정확하지 않고 부피를 보존하지 않는다 | ✅ | 저자 본인의 단서. 빠지는 양(`removed`)과 들어오는 양(`added`)을 서로 다른 픽셀이 독립적으로 계산하므로 총량이 맞을 보장이 없음(코드 구조로 확인). |
| 8비트 텍스처는 채널당 256단계라 법선·셰이딩에 계단이 생긴다 | ✅ | 2⁸ = 256. 법선이 높이 차분에서 나오므로 양자화가 증폭됨(원문 데모로 확인 가능). |
| 3색 혼합에 단순화한 Kubelka–Munk 모델 사용 | ⚠️ | 원문 서술뿐이고 해당 데모 소스는 공개 저장소에 없어 구현 세부는 검증 불가. Kubelka–Munk 자체는 실존하는 안료 혼합 모델. |

### 배경 지식에 대한 주장 (원문 이전 글 + 흔한 설명)

| 주장 | 판정 | 근거 |
|---|---|---|
| Stable Fluids는 Jos Stam, SIGGRAPH 1999 | ✅ | SIGGRAPH '99 Proceedings pp. 121–128. [ACM DL](https://dl.acm.org/doi/10.1145/311535.311548) |
| Stable Fluids는 무조건 안정(unconditionally stable)하다 | ✅ | 초록·§2.2. 단, Stam 본인 발표 자료에 "NOT accurate". [논문](https://www.josstam.com/_files/ugd/cf1fd6_898fe9b63df946689101b8d074f8efba.pdf) · [발표 자료](https://www.josstam.com/_files/ugd/cf1fd6_da80dae40efd4e8e98519f33be8c4e53.pdf) |
| Stable Fluids는 압력을 Jacobi 반복으로 푼다 | ❌ | Stam은 relaxation의 느린 수렴을 지적하고 FISHPAK 솔버(이론상 multigrid)·주기 경계에선 FFT를 사용. Jacobi는 GPU Gems 38장이 단순성 때문에 택한 것. [Stam 1999 §2.2, §3.2](https://www.josstam.com/_files/ugd/cf1fd6_898fe9b63df946689101b8d074f8efba.pdf) · [GPU Gems](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu) |
| Stable Fluids로 물 같은 액체를 시뮬레이션한다 | ❌ | Stam: 물 같은 자유 경계는 *"not addressed"*. GPU Gems도 free surface 제외. 이 글의 "액체"는 속도장 위의 높이맵 연출. |
| Stable Fluids는 실시간 렌더링에서 흔히 쓰이는 출발점 | ✅ | GPU Gems 38장이 Stam 1999를 기반으로 GPU 구현을 제시(GeForce FX에서 CPU 대비 최대 6배). |
| Jacobi는 병렬(GPU)에 적합, CPU에선 Gauss–Seidel이 나을 수 있다 | ✅ | Jacobi는 이전 반복값만 읽어 ping-pong으로 병렬 구현 가능(GPU Gems §38.3.1). Gauss–Seidel은 제자리 갱신이라 순차 처리에 유리. |
| 시각 효과라면 점성 단계를 생략해도 된다 | ⚠️ | 의견이지만 합리적. fluid-three 기본값도 `isViscous: false`. 다만 높은 점성의 "끈적한" 느낌이 필요하면 필요. [Simulation.js](https://github.com/mnmxmx/fluid-three/blob/master/js/modules/Simulation.js) |

**총평:** X 포스트의 주장은 모두 사실이고, 원문은 "어디까지가 Stable Fluids이고 어디부터가 연출인지"를 스스로 정직하게 구분합니다. ❌로 판정한 두 항목은 원문의 주장이 아니라, Stable Fluids를 소개할 때 **흔히 섞여 들어가는 오해**("Stam = Jacobi", "Stable Fluids = 액체 시뮬레이션")를 원 논문으로 바로잡은 것입니다.

## 개발자로서 가져갈 점

1. **"무조건 안정"은 인터랙티브 그래픽스의 1순위 요구사항이다.** 사용자가 어떤 입력을 주든 터지지 않는 대신, 정확도와 에너지(수치 확산)를 내준다. 이 트레이드오프를 알고 쓰자.
2. **GPU에서는 scatter 대신 gather로 생각하라.** semi-Lagrangian 이류도, mofu의 두께 이동도 "목적지에서 출발지를 거꾸로 찾아 읽는" 구조다. 그 대가(보존량이 깨짐)도 함께 이해해야 한다.
3. **Jacobi 반복 수는 품질 손잡이다.** 20회 미만은 눈에 띄는 오차, 40~80회가 GPU Gems의 권장. 성능 예산에 맞춰 조절하자.
4. **시뮬레이션 FBO는 float로.** 8비트에서는 시뮬레이션 값이 아니라 그 *미분*(법선)에서 먼저 티가 난다.
5. **물리는 재료, 목표는 '보이는 것'.** 정확한 액체 시뮬레이션 없이도, 속도장 하나 + 높이맵 + 이력 + Matcap으로 "펴 바르는 파운데이션"을 만들 수 있다.

## 참고 자료

- Misaki Nakano, *Spreading Liquid with three.js* (2026-11-01) — [mofu-dev.com](https://mofu-dev.com/en/blog/fluid-foundation/)
- Misaki Nakano, *Stable Fluids with three.js* (2022-07-31) — [mofu-dev.com](https://mofu-dev.com/en/blog/stable-fluids/) · [데모](https://fluid-threejs.netlify.app/) · [GitHub: mnmxmx/fluid-three](https://github.com/mnmxmx/fluid-three)
- Jos Stam, *Stable Fluids*, SIGGRAPH '99 Proceedings, pp. 121–128 — [ACM DL](https://dl.acm.org/doi/10.1145/311535.311548) · [PDF (josstam.com)](https://www.josstam.com/_files/ugd/cf1fd6_898fe9b63df946689101b8d074f8efba.pdf) · [발표 슬라이드](https://www.josstam.com/_files/ugd/cf1fd6_da80dae40efd4e8e98519f33be8c4e53.pdf)
- Mark J. Harris, *GPU Gems* Chapter 38. *Fast Fluid Dynamics Simulation on the GPU* — [NVIDIA Developer](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)
- Vue Fes Japan 2026, Misaki Nakano 세션 — [스피커 페이지](https://vuefes.jp/2026/en/speaker/mnmxmx)
- 이 글의 장난감 코드 — [stable_fluids_toy.mjs](../../static/stable_fluids_toy.mjs)
- 원본 X 포스트: [@misaki_mofu](https://x.com/misaki_mofu/status/2116729774207021360)
