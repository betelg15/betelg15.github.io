// stable_fluids_toy.mjs — 블로그 글용 설명 예제 (Stam 1999의 아이디어를 CPU에서 흉내 낸 장난감 코드)
// 실행: node stable_fluids_toy.mjs
// 격자: N x N, 셀 간격 h = 1, 주기(periodic) 경계 — 경계 처리를 단순화하기 위한 선택입니다.
const N = 64;
const idx = (i, j) => ((j + N) % N) * N + ((i + N) % N);   // 주기 경계로 감싸기
const field = () => new Float64Array(N * N);

// 쌍선형 보간 (Stam 논문의 LinInterp, GPU에서는 텍스처 샘플러가 해 줌)
function sample(q, x, y) {
  const i0 = Math.floor(x), j0 = Math.floor(y);
  const s = x - i0, t = y - j0;
  return (1 - s) * (1 - t) * q[idx(i0, j0)] + s * (1 - t) * q[idx(i0 + 1, j0)]
       + (1 - s) * t * q[idx(i0, j0 + 1)] + s * t * q[idx(i0 + 1, j0 + 1)];
}

// 1) Semi-Lagrangian 이류: 각 셀에서 속도를 거꾸로 따라가 이전 위치의 값을 가져온다
function advect(q, u, v, dt) {
  const out = field();
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = idx(i, j);
    out[k] = sample(q, i - dt * u[k], j - dt * v[k]);   // backtrace + 보간
  }
  return out;
}

// 비교용: 명시적(FTCS, 중앙차분) 이류 — 큰 dt에서 발산한다
function advectExplicit(q, u, v, dt) {
  const out = field();
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = idx(i, j);
    const dqdx = (q[idx(i + 1, j)] - q[idx(i - 1, j)]) / 2;
    const dqdy = (q[idx(i, j + 1)] - q[idx(i, j - 1)]) / 2;
    out[k] = q[k] - dt * (u[k] * dqdx + v[k] * dqdy);
  }
  return out;
}

// 2) 투영: div(w) 계산 → 압력 푸아송 방정식 ∇²p = div(w) 를 Jacobi로 풀기 → u = w - ∇p
function divergence(u, v) {
  const d = field();
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++)
    d[idx(i, j)] = (u[idx(i + 1, j)] - u[idx(i - 1, j)] + v[idx(i, j + 1)] - v[idx(i, j - 1)]) / 2;
  return d;
}

// stride = 1: GPU Gems 38장식 '이웃 1칸' 라플라시안
// stride = 2: 중앙차분 gradient의 중앙차분 divergence를 그대로 전개한 '2칸 건너' 라플라시안 (mofu 글의 방식)
function jacobiPressure(div, iters, stride) {
  let p = field(), next = field();
  const s = stride, scale = stride === 2 ? 4 : 1;     // stride 2: (p[i+2]+p[i-2]+... - 4p)/4 = div
  for (let n = 0; n < iters; n++) {
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++)
      next[idx(i, j)] = (p[idx(i + s, j)] + p[idx(i - s, j)] + p[idx(i, j + s)] + p[idx(i, j - s)]
                         - scale * div[idx(i, j)]) / 4;
    [p, next] = [next, p];                             // ping-pong (GPU에선 FBO 두 개를 번갈아 씀)
  }
  return p;
}

function project(u, v, iters, stride) {
  const p = jacobiPressure(divergence(u, v), iters, stride);
  const nu = field(), nv = field();
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = idx(i, j);
    nu[k] = u[k] - (p[idx(i + 1, j)] - p[idx(i - 1, j)]) / 2;
    nv[k] = v[k] - (p[idx(i, j + 1)] - p[idx(i, j - 1)]) / 2;
  }
  return [nu, nv];
}

const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length);
const maxAbs = (a) => a.reduce((m, x) => Math.max(m, Math.abs(x)), 0);

// 테스트용 속도장: 발산이 있는 랜덤 '마우스 힘' 몇 개 (외력 단계 흉내)
let seed = 1;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const u0 = field(), v0 = field();
for (let n = 0; n < 6; n++) {
  const cx = rand() * N, cy = rand() * N, fx = rand() * 4 - 2, fy = rand() * 4 - 2;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const g = Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / 30);   // 가우시안 splat
    u0[idx(i, j)] += fx * g; v0[idx(i, j)] += fy * g;
  }
}

console.log("[투영] Jacobi 반복 수에 따른 잔여 발산 RMS (투영 전:", rms(divergence(u0, v0)).toFixed(4) + ")");
for (const iters of [0, 20, 80, 400]) {
  const [a1, b1] = project(u0, v0, iters, 1);
  const [a2, b2] = project(u0, v0, iters, 2);
  console.log(`  iters=${String(iters).padStart(3)}  stride1=${rms(divergence(a1, b1)).toFixed(4)}  stride2=${rms(divergence(a2, b2)).toFixed(4)}`);
}

// 안정성: 같은 스칼라(염료)를 큰 dt로 30스텝 이류
const dye0 = field();
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) dye0[idx(i, j)] = (i > 20 && i < 44 && j > 20 && j < 44) ? 1 : 0;
const [U, V] = project(u0, v0, 80, 1);
console.log("[안정성] 염료 최댓값 |q|max (초기 1.0), 30 스텝 후");
for (const dt of [0.5, 5, 50]) {
  let a = dye0, b = dye0;
  for (let n = 0; n < 30; n++) { a = advect(a, U, V, dt); b = advectExplicit(b, U, V, dt); }
  const e = maxAbs(b);
  console.log(`  dt=${String(dt).padStart(4)}  semi-Lagrangian=${maxAbs(a).toFixed(3)}  explicit=${Number.isFinite(e) ? e.toExponential(2) : e}`);
}
