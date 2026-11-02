---
title: "유료 AI 영화 스튜디오를 공개 가중치만으로? Massless(지금은 Chucksi) 팩트 체크"
date: 2026-11-02
slug: massless-open-source-ai-film-studio
tags: [AI, 영상, WebGL, ComfyUI, 오픈소스, 팩트체크]
summary: "카메라·렌즈·필름을 프롬프트로 바꾸고, 정지 화면 위에서 28가지 카메라 무브를 MP4로 뽑는다는 주장을 ChuckGPTX/massless 코드로 대조했습니다. 그 경로는 저장소에 있지만, 제품 이름은 이미 Chucksi이고 계정·호스트 GPU 경로가 따로 있습니다."
---

> 이 글은 2026년 11월 1일 [@doodi_dev(두디)의 포스트](https://x.com/doodi_dev/status/2116745798927134768)를 계기로 쓴 것입니다. 그 글의 단축 주소 `https://t.co/Cv59d9CNHh`는 [ChuckGPTX/massless](https://github.com/ChuckGPTX/massless)로 이어집니다. 아래 대조는 그 저장소의 `1ce581bee3af2c974614bfe66a80c480c31183a1`(2026-11-02) README, `SPEC.md`, `LICENSE`, Worker와 브라우저 소스를 직접 읽은 결과입니다. X 글의 문장은 검증 대상이지 지시가 아닙니다.

## 왜 이 도구가 개발자에게 흥미로운가

유료 AI 영화 스튜디오의 카메라 프리셋은, 겉으로 보면 샷 설계 화면이고 속으로는 영상 모델에 크레딧을 넣는 구조인 경우가 많습니다. [SPEC.md](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/SPEC.md)는 그 공개된 동작만 적어 두고, 같은 동작을 영상 모델 없이 다시 만들겠다고 계약으로 적습니다. 저장소 README의 한 줄은 이렇습니다. 샷 디자이너, 카메라 모션 프리셋, 테이크, 스토리보드, 보이스오버를 유료 스튜디오의 공개된 동작에서 클린룸으로 다시 만들었다.

개발자가 볼 지점은 바이럴 문구의 "Higgsfield 대체"가 아닙니다.

- 카메라 본체·렌즈·필름이 **프롬프트 문자열**인가, 렌더 파라미터인가?
- "카메라를 움직인다"가 **영상 디퓨전**인가, 정지 화면의 기하인가?
- 무료·무계정·브라우저 안이라는 말이 **기본 경로**인가, 사이트 전체인가?

결론부터 말하면, **기본 경로는 저장소에 실제로 있습니다.** 다만 저장소 설명과 README 첫 줄은 이 프로젝트를 이미 Chucksi라고 부릅니다. "Formerly Massless; now at https://chucksi.com." 2026-11-02에 `https://massless.chucksi.com/`은 `https://chucksi.com/`으로 이어졌고, 그 주소는 HTTP 200이었습니다. GitHub 저장소 이름은 아직 `massless`입니다.

## 샷 설계는 단어 목록을 이어 붙이는 컴파일러다

이미지 페이지의 어휘는 [`public/data/rig.json`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/data/rig.json) 한 파일입니다. 카메라 7종(라지 포맷 디지털, 슈퍼 35, 65mm·35mm·16mm 필름, 슈퍼 8, VHS), 렌즈 5종(구면 프라임, 빈티지, 애너모픽, 매크로, 틸트시프트), 조리개 f/1.4·f/2.8·f/5.6·f/11, 필름 스톡 8종. 초점 거리는 연속 슬라이더가 아니라 일곱 스톱입니다. 8, 14, 24, 35, 50, 85, 135mm.

[`public/js/rig.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/rig.js)의 `compilePrompt`는 주제 문장 뒤에 장르, 샷 크기, 앵글, 카메라, 렌즈, 초점, 조리개, 조명, 스톡, 팔레트의 `prompt` 필드를 쉼표로 잇고, 마지막에 `cinematic film still, high detail, no text`를 붙입니다.

```javascript
export function compilePrompt(rig, subject, sel) {
  const s = { ...DEFAULT_SEL, ...sel };
  const parts = [
    (subject || 'a lone traveler with a lantern on a desert ridge at dusk').trim().replace(/[.\s]+$/, ''),
    pick(rig, 'genre', s.genre).prompt,
    pick(rig, 'shot', s.shot).prompt,
    pick(rig, 'angle', s.angle).prompt,
    pick(rig, 'camera', s.camera).prompt,
    pick(rig, 'lens', s.lens).prompt,
    pick(rig, 'focal', s.focal).prompt,
    pick(rig, 'aperture', s.aperture).prompt,
    pick(rig, 'light', s.light).prompt,
    pick(rig, 'stock', s.stock).prompt,
    pick(rig, 'palette', s.palette).prompt,
    'cinematic film still, high detail, no text',
  ];
  return parts.filter(Boolean).join(', ');
}
```

같은 파일의 `finishFor`는 그 선택을 렌더러 파라미터로도 바꿉니다. 카메라의 그레인·게이트 위브·VHS, 렌즈의 할레이션·스트릭·타원 보케, 초점 거리의 `distort`, 스톡의 채도·틸오렌지·모노. SPEC는 이 점을 "원본 대비 개선"으로 적습니다. 리그는 프롬프트 문장에만 남지 않고, 8/14mm 배럴, 애너모픽 플레어, VHS 스캔라인, 조리개에 따른 깊이 블러로도 들어갑니다.

ComfyUI로 같은 샷을 뽑는 [`comfy/run_shot.py`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/comfy/run_shot.py)는 같은 `rig.json`으로 프롬프트를 만들고, [`public/comfy/massless_shot_flux_schnell.api.json`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/comfy/massless_shot_flux_schnell.api.json)의 체크포인트 `flux1-schnell-fp8.safetensors`에 넣습니다. README의 실행 예는 이렇습니다.

```bash
python comfy/run_shot.py "a lighthouse keeper on a spiral stair" --camera 16mm --lens vintage --focal 24 --aspect 185
```

테이크 수는 이미지 페이지가 1에서 4 사이로 클램프합니다.

```javascript
$('#takes-minus').addEventListener('click', () => { state.takes = Math.max(1, state.takes - 1); updateChips(); });
$('#takes-plus').addEventListener('click', () => { state.takes = Math.min(4, state.takes + 1); updateChips(); });
```

## 히어로 프레임은 공개 가중치이고, 공짜의 단위는 요청 상한이다

기본 모델 id는 `flux-1-schnell`입니다. Worker [`src/index.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/src/index.js)의 이미지 목록은 Cloudflare Workers AI 네 개입니다.

| 페이지 id | Workers AI 모델 | 카탈로그가 적은 라이선스 |
|---|---|---|
| `flux-1-schnell` | `@cf/black-forest-labs/flux-1-schnell` | Apache-2.0 |
| `sdxl-lightning` | `@cf/bytedance/stable-diffusion-xl-lightning` | OpenRAIL++ |
| `dreamshaper-8-lcm` | `@cf/lykon/dreamshaper-8-lcm` | CreativeML OpenRAIL-M |
| `sdxl-base` | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | OpenRAIL++ |

`/api/shot`은 그 호출 앞에 KV 카운터를 둡니다. 환경 변수가 없으면 하루 120장, 방문자당 12장입니다.

```javascript
const dailyCap = Number(env.DAILY_CAP || 120);
const perVisitor = Number(env.PER_VISITOR_CAP || 12);
```

README는 이 카운터를 최선의 한도라고 적습니다. 동시 요청이 경합할 수 있고, 모델마다 소모가 다르며, 다른 AI 엔드포인트와 Cloudflare 할당을 나눈다고 합니다. 같은 Worker의 다른 기본 상한은 스크립트용 `/api/beats` 60/10, PDF 질문 `/api/ask` 30/8, MeloTTS `/api/tts` 300/40, Whisper `/api/transcribe` 120/15입니다. 파일 머리 주석은 이 상한이 하루 10,000 Neurons 무료 한도 안에 두기 위한 것이라고 적습니다. 그 숫자는 이 저장소의 주석이지, 이 글에서 Cloudflare 청구서로 다시 확인한 값은 아닙니다.

상한에 걸리면 페이지는 백업 엔진으로 넘어갈 수 있습니다. [`public/js/engines.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/engines.js)의 Pollinations 호출은 `model=sana`, 간격 45.5초입니다. 모델 카탈로그는 이 항목의 라이선스 칸에 "NVIDIA's licence, open weights"라고 적습니다. 세 번째 엔진은 방문자의 ComfyUI입니다. `--enable-cors-header`로 띄운 주소에 위 워크플로를 넣습니다.

카탈로그에는 멤버용 `moss-image-sft`도 있습니다. 노트는 "sign in"입니다. [`docs/WORKFLOWS-CLOUD-MOSS.md`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/docs/WORKFLOWS-CLOUD-MOSS.md)는 이 모델을 `OpenMOSS-Team/MOSS-Image-SFT`(Apache-2.0)로 적고, Runpod 워커를 통해 로그인 사용자에게 제공한다고 적습니다. 기본 버튼의 모델과 멤버 버튼의 모델은 다릅니다.

런치 페이지의 샘플 스틸은 또 다릅니다. README는 `public/media/art`의 샘플이 상용 이미지 모델(Higgsfield Soul)로 만들어졌고, 포털 히어로 그림은 OpenAI 이미지 생성이며, 방문자가 실행하는 경로의 출력이 아니라고 적습니다.

## 카메라 무브는 영상 모델이 아니라 깊이 메시다

영상 페이지의 입력은 스틸 한 장입니다. 생성된 샷이거나, 올린 사진입니다. 깊이는 브라우저의 [`public/js/depth.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/depth.js)가 맡습니다. 모델 id는 `onnx-community/depth-anything-v2-small`이고, Transformers.js 4.3.2가 WebGPU(fp16, 그다음 fp32)를 먼저 보고 실패하면 WebAssembly q8로 내려갑니다. 파일 주석은 이미지가 기기를 떠나지 않는다고 적습니다. 모델 로드가 실패하면 `heuristicDepth`가 바닥 평면과 중앙 융기로 대체합니다.

[`public/js/renderer.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/renderer.js)는 그 깊이로 WebGL2 메시를 만듭니다. 가로 분할은 320입니다.

```javascript
_buildMesh() {
  const gl = this.gl;
  const cols = 320;
  const rows = Math.max(40, Math.round(cols / this.aspect));
```

버텍스 셰이더는 각 점을 휴식 카메라의 광선을 따라 밀어 냅니다. 그래서 움직임이 0인 프레임은 원본과 맞게 설계돼 있습니다. 깊이 절벽 위의 삼각형은 잘라 내고, 그 뒤에는 전경을 밀어 낸 배경 레이어를 둡니다. README가 말하는 "늘어난 줄무늬 대신 그럴듯한 배경"은 이 레이어입니다. WebGL2가 없으면 렌더러는 `This browser has no WebGL2, which Chucksi needs to move the camera.`를 던집니다.

무브 28개는 [`public/js/moves.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/moves.js)의 `MOVES`입니다. 각 항목은 시간 `t`(0–1)를 `{ eye, target, fov, roll, focus, blur }`로 바꿉니다. 처음 배열에 14개, `MOVES.push`로 14개가 더해져 28개입니다. id는 다음과 같습니다.

- 푸시: `dolly-in`, `dolly-out`, `crash-zoom`, `crash-zoom-out`, `zoom-in`, `zoom-out`, `dolly-zoom`, `dolly-zoom-in`, `fpv`
- 오빗: `arc-left`, `arc-right`, `bullet-time`, `wide-orbit`, `snorricam`
- 크레인·틸트: `crane-up`, `crane-down`, `tilt-up`, `tilt-down`
- 슬라이드·팬: `truck-right`, `truck-left`, `pan-left`, `pan-right`
- 텍스처: `breathe`, `handheld`, `rack-focus`, `float`, `dutch-roll`, `earthquake`

돌리 줌은 카메라가 피벗에서 멀어지는 동안 화각을 좁혀, 피사체의 각크기를 유지합니다. `dolly-zoom-in`은 같은 함수를 `1 - t`로 재생합니다.

```javascript
fn(t, ctx) {
  const b = base(ctx);
  const e = ease.inOutCubic(t);
  const zs0 = b.D * ctx.sSub;
  const zs = zs0 * (1 + 0.95 * ctx.k * e);
  const eye = [0, 0, b.pivot[2] + zs];
  const fov = (2 * Math.atan((Math.tan((REST_FOV * Math.PI) / 360) * zs0) / zs) * 180) / Math.PI;
  return { eye, target: b.pivot, fov, roll: 0, focus: ctx.focusSub, blur: ctx.blur };
}
```

MP4는 [`public/js/recorder.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/recorder.js)가 캔버스를 프레임마다 인코드합니다. 우선 경로는 WebCodecs H.264(`avc1.640028`부터)와 mp4-muxer, 비트레이트 10 Mbps입니다. `VideoEncoder`가 없으면 캔버스 스트림의 MediaRecorder로 떨어지고, 그때 확장자는 브라우저가 주는 WebM 또는 MP4입니다. 스토리보드 내보내기(`exportBoard` in `public/js/pages/video.js`)는 샷마다 `duration`을 가진 세그먼트를 같은 `recordSegments`에 넣습니다.

README와 SPEC의 한계 문장은 이 구조의 결과입니다. 장면 속 인물은 연기하지 않습니다. 정지한 장면 위에서 카메라만 움직입니다. 큰 무브는 전경 뒤의 늘어난 배경을 드러냅니다. 장면 안 움직임용 오픈 비디오 모델은 README 로드맵에 있고, 기본 무브 경로의 모델 목록에는 없습니다.

그 옆에 로그인 사용자용 GPU 패널이 있습니다. [`public/js/gpu-panel.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/gpu-panel.js) 주석은 Video 패널의 네 모드를 Wan 2.2 A14B(Animate), Wan-Animate-2(Motion), Wan 2.2 S2V(립싱크), SeedVR2 7B(업스케일)로 적고, 음악 쪽은 ACE-Step 1.5라고 적습니다. 이 패널은 `accessToken`이 있는 사용자를 전제로 합니다. 워크플로 문서는 이 잡을 80GB Runpod 워커와 하루 예산(`GPU_DAILY_BUDGET_CENTS` 기본 500, 사용자당 `GPU_PER_USER_DAILY` 10)에 연결합니다. 이 글은 그 워커가 2026-11-02에 실제로 과금 중인지까지는 확인하지 않았습니다. 확인한 것은 소스에 그 경로가 있다는 점입니다.

## 스토리보드 옆의 오디오, 자막, 3D, PDF

보이스오버의 브라우저 경로는 [`public/js/audio-engine.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/audio-engine.js)입니다. `onnx-community/Kokoro-82M-v1.0-ONNX`를 `kokoro-js@1.2.1`로 불러 오고, 영어 목소리 8개(`af_heart`, `af_bella`, `af_nicole`, `am_michael`, `am_fenrir`, `am_puck`, `bf_emma`, `bm_george`)를 고릅니다. 파일 주석은 Kokoro가 기기를 떠나지 않는다고 적습니다. 여섯 언어(영어, 스페인어, 프랑스어, 중국어, 일본어, 한국어)는 MeloTTS이고, Worker가 `@cf/myshell-ai/melotts`를 호출합니다. 대본만 나갑니다.

자막은 Whisper입니다. `/api/transcribe`가 `@cf/openai/whisper-large-v3-turbo`를 부르고 `text`와 `vtt`를 돌려줍니다. 컷 페이지 설명은, 기기를 떠나는 것이 16 kHz 모노 음성이고 Transcribe를 눌렀을 때뿐이라고 적습니다. 단어 삭제와 MP4 재인코딩은 브라우저의 `textedit.js`와 WebCodecs입니다.

이미지→3D는 두 갈래입니다. 브라우저 갈래는 Depth Anything V2로 가우시안 스플랫을 만들어 궤도만 돌립니다. 전체 물체 갈래는 [`comfy/idol_server.py`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/comfy/idol_server.py)입니다. `speridlabs/idol`의 `IdolPipeline`을 불러 오고, `torch.cuda`가 있으면 그 GPU 이름을, 없으면 `CPU`를 찍습니다. 코드는 NVIDIA라는 문자열이나 8 GB를 검사하지 않습니다. README 표는 이 경로를 "Your own NVIDIA GPU, about 8 GB"로 적고, 시작 전에 `facebook/dinov3-vith16plus-pretrain-lvd1689m`과 `black-forest-labs/FLUX.2-dev` 접근 신청이 필요하다고 적습니다. GPU가 없으면 Idol의 Hugging Face 데모가 내보낸 `.ply`를 페이지의 Open으로 열 수 있다고도 적습니다.

PDF는 [`public/js/pdf-tools.js`](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/pdf-tools.js)가 pdf.js 6.4.299로 읽고 pdf-lib 1.17.1로 씁니다. 내보낸 함수는 이미지↔PDF, 병합, 분할, 회전, 압축, 텍스트 추출, 주석 쓰기입니다. Office 페이지의 편집 도구 id에는 `highlight`, 글자, 그리기, `sign`, 노트가 있습니다. "Ask your PDF"는 고른 텍스트를 `/api/ask`의 Llama 3.3(`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)으로 보냅니다.

## 팩트 체크

[@doodi_dev 포스트](https://x.com/doodi_dev/status/2116745798927134768)의 주장입니다. ✅ 저장소와 맞음 / ⚠️ 핵심은 맞거나 일부만 맞음 / ❌ 저장소와 어긋남. 기준 커밋은 [`1ce581b`](https://github.com/ChuckGPTX/massless/commit/1ce581bee3af2c974614bfe66a80c480c31183a1)입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 유료 AI 영화 스튜디오(Higgsfield 같은)의 기능을 공개 가중치만으로 다시 만든 오픈소스다 | ⚠️ | README는 샷 디자이너, 카메라 프리셋, 테이크, 스토리보드, 보이스오버를 공개된 동작에서 클린룸으로 다시 만들었다고 적고, Higgsfield의 코드·프롬프트·에셋·브랜드는 넣지 않았다고 적습니다. [SPEC.md](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/SPEC.md)의 계약도 그 범위입니다. 기본 히어로 모델은 FLUX.1 schnell 등 공개 가중치입니다. 같은 사이트에는 로그인 MOSS, 로그인 GPU 패널(Wan 2.2 등), Pollinations 백업이 있고, 샘플 스틸은 Higgsfield Soul·OpenAI로 만들었다고 README가 밝힙니다. 인물이 연기하는 유료 영상 모델의 기능은 기본 무브가 재현하지 않습니다. 제품 이름은 README 기준으로 Chucksi입니다. |
| 카메라 본체·렌즈·필름을 고르면 프롬프트로 바꿔 준다 | ✅ | `rig.json`의 camera, lens, stock과 `compilePrompt`가 그 문장을 만듭니다. 컴파일 결과는 화면의 `#compiled`에 들어가고, 사용자가 고치면 `state.edited`가 됩니다. |
| 무료 모델로 이미지를 만든다 | ⚠️ | 기본값은 Workers AI의 FLUX.1 schnell이고, 카탈로그 그룹 이름은 Free입니다. `/api/shot` 기본 상한은 하루 120장, 방문자 12장입니다. 상한은 README가 최선의 한도라고 적은 KV 카운터입니다. ComfyUI 경로는 자기 GPU입니다. |
| 그 이미지 위에서 카메라를 움직인다 | ✅ | Depth Anything V2 Small과 WebGL2 메시, `moves.js`의 가상 카메라입니다. 영상 디퓨전이 아닙니다. README 한계: 장면은 얼어 있고 카메라만 움직입니다. |
| 계정이 필요 없다 | ⚠️ | README와 워크플로 문서는 브라우저 도구와 로컬 라이브러리(IndexedDB)를 로그인 없이 쓸 수 있다고 적습니다. 같은 문서가 Supabase 로그인(비공개 프로젝트)을 추가했고, MOSS와 GPU 패널은 사인인을 요구합니다. 호스트 모델은 Turnstile 시크릿 세 개가 있을 때 6시간짜리 쿠키를 요구할 수 있습니다. 그 검사는 시크릿이 없으면 꺼집니다. |
| 카메라 무브 28가지(돌리 줌, 크래시 줌, 크레인, 불릿 타임 등)를 MP4로 보낸다 | ✅ | `moves.js`의 id가 28개이고 그 네 이름이 들어 있습니다. `recorder.js`는 WebCodecs H.264 MP4를 우선하고, 인코더가 없으면 MediaRecorder(WebM 또는 MP4)로 떨어집니다. |
| 스토리보드가 있다 | ✅ | `public/js/pages/video.js`의 `exportBoard`가 샷 배열을 한 클립으로 `recordSegments`에 넣습니다. |
| 보이스오버가 있다 | ✅ | 영어 8목소리는 브라우저의 Kokoro-82M입니다. 6개 언어는 상한이 있는 MeloTTS(`/api/tts`)입니다. |
| 자막이 있다 | ✅ | `/api/transcribe`가 Whisper large-v3-turbo로 `text`와 `vtt`를 돌려줍니다. 컷 페이지는 재타이밍한 `.srt`/`.vtt`와 번인 자막 MP4를 내보냅니다. 음성(16 kHz 모노)은 Transcribe 때 워커로 갑니다. |
| 이미지를 3D로 바꿀 수 있다 | ✅ | 브라우저 깊이 스플랫과, 자기 머신에서 돌리는 Idol `.ply` 두 경로가 `public/js/pages/three-d.js`에 있습니다. 전체 물체의 조건은 아래 NVIDIA 행입니다. |
| PDF를 편집할 수 있다 | ✅ | `pdf-tools.js`가 브라우저에서 pdf.js로 읽고 pdf-lib로 씁니다. 병합·분할·회전·압축·텍스트 추출·주석이 함수로 있고, Office 편집 도구에 하이라이트·텍스트·그리기·서명이 있습니다. 문서에 질문하기는 Llama 3.3 호스트 호출입니다. |
| 렌즈 범위가 8–135mm다 | ✅ | `rig.json`의 focal이 8, 14, 24, 35, 50, 85, 135mm입니다. 양 끝은 그 범위와 같고, 그 사이의 임의 mm는 없습니다. |
| 프롬프트당 테이크가 최대 4장이다 | ✅ | `public/js/pages/image.js`가 `takes`를 `Math.max(1, …)`와 `Math.min(4, …)`로 묶습니다. |
| 영상 제작과 편집이 브라우저 안에서 돈다 | ⚠️ | 무브 미리보기, 스토리보드 MP4, 컷 페이지의 단어 삭제·재인코딩은 브라우저(WebGL2, WebCodecs)입니다. 자막용 Whisper와 다국어 TTS는 워커입니다. Wan 영상 생성은 `gpu-panel.js`의 로그인 호스트 잡입니다. |
| 라이선스가 MIT다 | ✅ | 루트 [LICENSE](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/LICENSE)는 MIT이고 저작권은 Copyright (c) 2026 Chuck Crawley입니다. 모델·onnx·폰트는 각자 라이선스를 유지합니다. README와 `LICENSES/`가 Apache-2.0, OpenRAIL, BSD-3-Clause, SIL OFL을 따로 적습니다. |
| 브라우저 도구는 무료다 | ✅ | README 문장과 같습니다. 깊이, 카메라, Kokoro, PDF, 스플랫은 브라우저에서 돌고 호출당 과금 코드가 없습니다. |
| 호스트 AI에는 하루 한도가 있다 | ✅ | `/api/shot` 기본 `DAILY_CAP` 120, `PER_VISITOR_CAP` 12이고 beats·ask·tts·asr도 각자 상한이 있습니다. README는 이 상한이 지출 한도를 보장하지 않는다고 적습니다. 로그인 GPU 잡은 별도 하루 예산 변수를 갖습니다. |
| 3D 물체 전체에는 자기 NVIDIA GPU가 필요하다 | ⚠️ | README 표는 Idol을 "Your own NVIDIA GPU, about 8 GB"로 적습니다. `idol_server.py`는 `torch.cuda`를 쓰고, 브랜드나 8 GB를 검사하지 않습니다. 브라우저 깊이 스플랫은 이 GPU 없이 동작합니다. README는 GPU가 없을 때 Hugging Face 데모의 `.ply`를 열 수 있다고 적습니다. Idol 기동 주석은 DINOv3와 FLUX.2-dev 접근 신청을 요구합니다. |
| 태그에 ComfyUI가 있다 | ✅ | 포스트 해시태그는 `#AI #OpenSource #AIVideo #ComfyUI`입니다. GitHub topics는 빈 배열입니다. ComfyUI 연동 자체는 워크플로 JSON과 `comfy/run_shot.py`에 있습니다. 기본 브라우저 경로는 ComfyUI 없이 Workers AI 또는 Pollinations로 이미지를 받습니다. |

**총평:** "그런 저장소는 없다"로 꺾을 글은 아닙니다. 프롬프트 컴파일, 28개 무브, MP4, 테이크 4장, 8–135mm의 일곱 스톱, MIT, 브라우저 도구, 호스트 일일 상한은 소스에 있습니다. 문장보다 넓은 쪽은 "공개 가중치만", "계정 없음", "영상 제작과 편집이 전부 브라우저 안", "전체 3D는 NVIDIA GPU가 필수"입니다. 기본 카메라 경로는 그 문장과 맞고, 로그인 호스트 영상·멤버 이미지·Idol의 대체 `.ply`는 그 문장 밖에 있습니다. 그리고 2026-11-02의 README는 이 프로젝트를 Massless가 아니라 Chucksi로 소개합니다.

## 개발자로서 가져갈 점

1. **샷 설계와 카메라 무브를 다른 층으로 둔다.** 리그는 `rig.json`에서 프롬프트와 피니시 파라미터로 갈라지고, 무브는 깊이 메시 위의 카메라 함수입니다. 영상 모델 프롬프트에 "dolly zoom"을 쓰는 설계와 다릅니다.
2. **돌리 줌을 쓸 거면 화각과 거리를 같이 움직인다.** `dolly-zoom`은 피벗 거리 `zs`가 늘어날 때 `fov`를 `atan(tan(fov0/2) * zs0 / zs)`로 줄입니다. 줌만 바꾸는 `zoom-in`과 id가 따로 있습니다.
3. **무료 한도는 기능 플래그가 아니라 엔드포인트별 카운터다.** 이미지 120/12를 다른 호출에 재사용하지 않습니다. TTS, 자막, PDF 질문, 비트 생성은 키가 다릅니다.
4. **ComfyUI는 태그이자 선택 엔진이다.** 같은 `rig.json`을 `run_shot.py`가 읽고 FLUX.1 schnell fp8 워크플로에 넣습니다. 웹 기본 경로는 그 프로세스를 요구하지 않습니다.
5. **이름을 따라갈 때는 저장소 이름과 README 첫 줄을 같이 본다.** 클론 주소는 `ChuckGPTX/massless`이고, 문서와 라이브 사이트는 Chucksi(`https://chucksi.com`)입니다.

## 참고 자료

- ChuckGPTX/massless (문서상의 이름 Chucksi), 기준 커밋 `1ce581bee3af2c974614bfe66a80c480c31183a1` — [저장소](https://github.com/ChuckGPTX/massless) · [README](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/README.md) · [SPEC.md](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/SPEC.md) · [LICENSE](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/LICENSE) · [rig.json](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/data/rig.json) · [rig.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/rig.js) · [moves.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/moves.js) · [renderer.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/renderer.js) · [depth.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/depth.js) · [recorder.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/public/js/recorder.js) · [src/index.js](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/src/index.js) · [idol_server.py](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/comfy/idol_server.py) · [워크플로·MOSS 문서](https://github.com/ChuckGPTX/massless/blob/1ce581bee3af2c974614bfe66a80c480c31183a1/docs/WORKFLOWS-CLOUD-MOSS.md)
- 라이브 사이트 — [chucksi.com](https://chucksi.com/) (구 주소 massless.chucksi.com은 여기로 이어짐)
- 원본 X 포스트 — [@doodi_dev, 2026-11-01](https://x.com/doodi_dev/status/2116745798927134768) (같은 글: [https://x.com/i/web/status/2116745798927134768](https://x.com/i/web/status/2116745798927134768))
