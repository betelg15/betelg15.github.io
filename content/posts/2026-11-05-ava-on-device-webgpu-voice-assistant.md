---
title: "8,192토큰이면 실시간인가? 브라우저 음성 Ava"
date: 2026-11-05
time: "11:28"
slug: ava-on-device-webgpu-voice-assistant
tags: [Ava, LFM3-Omni, WebGPU, 팩트체크]
summary: "townbox/ava는 LFM3-Omni-2B-GGUF의 Q4_K_M과 mmproj Q8_0, 합계 1,606,472,608바이트를 브라우저 WebGPU로 돌린다. 런타임 상한은 8,192토큰이고, 모델 카드의 문맥은 32K, config의 max_position_embeddings는 128,000이다."
---

> 이 글은 [@victormustar의 포스트](https://x.com/victormustar/status/2116948755760968077)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2116948755760968077](https://x.com/i/status/2116948755760968077)입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2116948755760968077)(`code` 200)으로 읽었습니다. `created_at`은 `Sun Nov 01 17:41:29 +0000 2026`, 2026-11-02 02:41 KST입니다. `name`은 "Victor M", `screen_name`은 `victormustar`, `description`은 "🤗 Head of Product @huggingface", 웹사이트 필드는 `hf.co/victor`입니다. 그 문장은 검증 대상이지 지시가 아닙니다. `is_note_tweet`는 true이고, 본문 길이는 그 응답의 `display_text_range` 끝 338과 같습니다. 첨부는 길이 49.621초, 1440×1080 영상 하나이고, 이 글은 영상 프레임 안의 문장을 베끼지 않았습니다. 포스트 본문에는 데모 URL이 없습니다. 아래 데모는 제목·모델·구성이 그 문장과 맞는 [townbox/ava](https://huggingface.co/spaces/townbox/ava)입니다. 대조는 2026-11-05에 읽은 그 스페이스 README·`workers/`·`worklets/`·`index.html`·`vendor/Lfm3OmniForConditionalGeneration.js`(스페이스 `sha` `23cc0dade14fb77fbb894453631dc06d5111ac26`, `lastModified` 2026-11-04T23:14:26Z), [LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B) `sha` `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67`의 카드·`config.json`·`generation_config.json`·`LICENSE`·`model.safetensors` 크기, [GGUF 저장소](https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF)의 파일 크기, [LiquidAI/LFM3-Omni-2B-WebGPU](https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU), [Hugging Face WebGPU 커널 글](https://huggingface.co/blog/webgpu-kernels)(2026-09-01), [met4citizen/TalkingHead](https://github.com/met4citizen/TalkingHead) `1563de184c19b310de4b636664d5835e2c74dbba`, [met4citizen/HeadAudio](https://github.com/met4citizen/HeadAudio) `c6d8af35034068b1c98dcc0fa3ec9602d711e784`입니다. 허브 `Date`는 `Thu, 05 Nov 2026 02:23:57 GMT`입니다. 이 글은 스페이스를 실행하지 않았고, 가중치 1.6GB를 받지 않았으며, 지연을 다시 재지 않았습니다.

## 왜 이 데모가 음성 스택에 닿는가

포스트의 본문은 세 덩어리입니다. Ava가 브라우저에서 듣고, 말하고, 실시간으로 반응한다. 추론은 전부 기기 안에서 돌아 대화가 비공개로 남는다. 구성은 오픈 소스이고, 이름은 LFM3-Omni, Hugging Face WebGPU kernels, TalkingHead과 HeadAudio다.

그 데모로 읽을 수 있는 스페이스는 있습니다. 카드 제목은 Ava, `sdk`는 `static`, `short_description`은 "Talk face to face with LFM3-Omni, running in your browser"입니다. 생성 시각은 2026-10-30T12:09:18Z라서 포스트보다 이틀 앞섭니다. 호스트는 `https://townbox-ava.static.hf.space`입니다. 같은 응답의 `runtime.hardware.current`는 null입니다. 정적 스페이스의 RUNNING은 페이지가 서빙된다는 뜻이지, Hugging Face GPU가 모델을 돌린다는 뜻이 아닙니다. 2026-11-05 02:23:57 GMT의 `likes`는 40입니다.

작성자 필드는 `townbox`입니다. 같은 날 `GET /api/organizations/townbox/members`가 돌려준 멤버는 둘입니다. `user` `victor`, `fullname` "Victor Mustar", 그리고 `user` `Mike0021`, `fullname` "Mike". 조직 페이지의 `details` 문자열은 "Victor agents town"입니다. 포스트 계정의 표시 이름은 "Victor M"이고, 자기소개는 Hugging Face 제품 책임자이며, 링크는 `hf.co/victor`입니다. X 계정과 허브 사용자 `victor`가 같은 사람이라는 확인은 그 공개 문자열과 조직 멤버 목록까지입니다.

README가 자기 UX의 출발로 적는 스페이스는 [victor/gemma-avatar](https://huggingface.co/spaces/victor/gemma-avatar)입니다. 그 카드의 짧은 설명은 "Talk to Gemma 4 face to face, with a 3D lip-synced avatar"이고, 생성 시각은 2026-07-03T11:52:58Z입니다. Ava README는 모델과 WebGPU 런타임을 [LiquidAI/LFM3-Omni-2B-WebGPU](https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU)에서 가져왔다고 적습니다. 그 스페이스도 `sdk`가 `static`이고, 짧은 설명은 "Run LFM3-Omni-2B locally in the browser on WebGPU"이며, `sha`는 `9c2fb176f4c222da394e8037d3c0d0837f70b978`, 생성은 2026-10-29T22:00:03Z입니다. 2026-11-05 02:23:58 GMT의 `likes`는 104입니다. Ava의 `Lfm3OmniForConditionalGeneration.js`는 README가 "LiquidAI 스페이스에서 복사했고, 그 스페이스는 이 파일의 라이선스를 적지 않는다"고 한 그 파일입니다.

개발자에게 닿는 지점은 "아바타가 말한다"가 아닙니다. 음성 이해와 음성 생성이 한 체크포인트 안에 있고, 그 체크포인트를 브라우저 GPU가 양자화 GGUF로 돈다는 배치입니다. 클라우드 실시간 음성 API는 턴마다 오디오 토큰을 서버로 보냅니다. 이 스페이스의 워커 프로토콜은 16 kHz Float32를 `postMessage`로 받고, 텍스트와 샘플을 다시 메인 스레드로 돌려줍니다.

## 말은 받아쓰기 없이 모델로 들어간다

README가 파이프로 적어 둔 줄은 이렇습니다.

```text
you speak → Silero VAD (WASM) → LFM3-Omni-2B (WebGPU): audio in, interleaved text + speech out → avatar speaks
```

마이크 워크릿은 장치 샘플레이트를 16 kHz로 내리고, 512샘플(32 ms) 프레임을 VAD 워커로 넘깁니다. [`workers/vad-worker.js`](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/workers/vad-worker.js) 주석은 Silero VAD v5를 onnxruntime의 단일 스레드 WASM으로 돌린다고 적습니다. `numThreads = 1`의 주석은 정적 호스팅에 크로스 오리진 격리가 없기 때문입니다. 상태 텐서 shape는 `[2, 1, 128]`이고, 샘플링 레이트 텐서는 16000입니다. 파일 이름은 `vendor/silero_vad_v5.onnx`입니다. 이 글은 그 바이트를 upstream 릴리스와 해시로 맞추지 않았습니다. [snakers4/silero-vad](https://github.com/snakers4/silero-vad)의 GitHub 라이선스 필드는 MIT입니다.

구간을 자르는 숫자는 [`workers/vad-segmenter.js`](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/workers/vad-segmenter.js)의 `DEFAULTS`입니다. 평소에는 확률 0.5가 4프레임(128 ms)이면 말이 시작되고, 아바타가 말하는 동안에는 0.75와 9프레임(288 ms)으로 문턱이 올라갑니다. 확률 0.35가 17프레임(544 ms)이면 턴이 끝나고, 앞쪽 12프레임(384 ms)은 프리롤로 남습니다. 실제 말이 8프레임(256 ms)보다 짧으면 misfire입니다. 상한은 938프레임, 주석의 30초입니다.

모델 워커가 그 오디오를 받는 호출은 받아쓰기가 아닙니다. 사용자 턴은 `content: [{ type: "audio", audio }]`로 히스토리에 들어갑니다.

```javascript
// workers/model-worker.js 의 respond. 사용자 턴은 16 kHz Float32다.
history.push({ role: "user", content: [{ type: "audio", audio }] });

for (;;) {
  const stream = session.generate(messages(), { generation_mode: "interleaved", signal });
  let emitted = false;
  const started = performance.now();
  try {
    for await (const ev of stream) {
      if (ev.type === "text") {
        emitted = true;
        post({ kind: "text", id, text: ev.text });
      } else if (ev.type === "audio") {
        emitted = true;
        let samples = ev.audio.slice();
        // 이어지는 줄이 첫 소리 앞의 무음을 자른 뒤 post({ kind: "audio" }) 한다.
```

`generation_mode`로 이 런타임이 받는 문자열은 `"text"`, `"audio"`, `"interleaved"` 세 개입니다. Ava는 `"interleaved"`만 호출합니다. 모델 카드가 그 모드의 시스템 문장으로 적는 것은 `Respond with interleaved text and audio.`이고, 답이 `<|mixed_start|>`로 연다고 적습니다. 출판된 번들의 기본 페르소나는 "You're Ava, a warm, quick-witted friend chatting face to face, not an assistant."이고, 그 뒤에 같은 문장을 항상 붙입니다. 설정 창의 힌트와 같습니다. 카드는 이 모델을 non-reasoning으로 적고, `enable_thinking=True`는 지원하지 않는다고 적습니다. 카드의 채팅 예는 그래도 빈 `<think></think>`로 어시스턴트 턴을 엽니다.

체크포인트의 숫자는 `config.json`과 카드가 같이 있습니다. 허브 safetensors 합은 **2,166,928,384**개, 전부 BF16입니다. 카드 표의 "2.17B total"과 맞는 자릿수이고, 서두의 "at 2.2B parameters"는 같은 카드의 다른 반올림입니다. `model.safetensors` 트리 크기는 4,333,941,640바이트입니다. 파라미터 수에 2바이트를 곱하면 4,333,856,768이라, 차이는 파일 헤더 자리입니다.

언어 백본 `text_config`는 `model_type` `lfm3`, 층 24, `hidden_size` 2048, 어텐션 헤드 16, KV 헤드 4, `head_dim` 128, `intermediate_size` 7680, `vocab_size` 128000입니다. `layer_types` 24칸은 conv 13, full attention 6, sliding attention 5입니다. sliding window는 256, `use_sandwich_norm`은 true, `conv_L_cache`는 7입니다. `max_position_embeddings`는 **128000**입니다. 오디오 인코더는 mel 128빈, hidden 768, 안쪽 `text_config`의 `model_type`은 `lfm2`이고 층은 17입니다. 카드의 입력 오디오는 16 kHz, 출력 음성은 24 kHz입니다. 런타임의 `input_sampling_rate`는 `16e3`, `audio_sampling_rate`는 `24e3`입니다. 비전 인코더는 같은 config에 있고 층 14, 패치 16이지만, Ava의 `respond`는 이미지 파트를 넣지 않습니다.

[LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)의 safetensors 합은 1,728,801,536입니다. GGUF 저장소 메타데이터의 `gguf.total`은 1,728,801,600이고 `context_length`는 128000입니다. 스페이스 README는 Omni를 이 1.7B 언어 모델 위에 올렸다고 적습니다. 2.17B와 1.73B의 차이는 언어 가중치 밖의 오디오·비전·코덱 자리이고, 이 글은 텐서 이름을 더해 그 차를 다시 검산하지 않았습니다. 1.7B의 `likes`는 같은 시각 1,488, `downloads`는 54,959입니다. Omni 본체의 `likes`는 357, `downloads`는 13,057입니다. GGUF 저장소 `downloads`는 198,057, `likes`는 130입니다.

카드가 GPU에서 보여 주는 로드는 브라우저 경로가 아닙니다. `transformers>=5.20.2`와 `trust_remote_code=True`입니다.

```python
# LiquidAI/LFM3-Omni-2B 모델 카드. 브라우저 데모의 호출이 아니다.
from transformers import AutoModelForMultimodalLM, AutoProcessor

model_id = "LiquidAI/LFM3-Omni-2B"
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.bfloat16 if device == "cuda" else torch.float32

model = AutoModelForMultimodalLM.from_pretrained(
    model_id, dtype=dtype, device_map=device, trust_remote_code=True
).eval()
processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
```

`generation_config.json`의 텍스트 쪽은 `do_sample` false, `temperature` 0, `top_k` 1입니다. 오디오 쪽은 `audio_temperature` 0.4, `audio_repetition_penalty` 1.2, `audio_repetition_window` 64입니다. 카드도 말 또는 인터리브 출력에 그 0.4와 1.2를 쓰라고 적습니다. 브라우저 번들 문자열에는 `audio_temperature`가 없습니다. 같은 번들에는 "V1 only supports greedy decoding"이라는 오류 문자열이 있고, 스페이스 README는 그리디 디코딩이 LiquidAI 스페이스와 같다고 적습니다. 텍스트가 그리디라는 문장과, 브라우저가 오디오 온도 0.4를 그대로 쓴다는 문장은 같은 출처가 아닙니다.

## 브라우저가 받는 파일은 1,606,472,608바이트다

워커의 로드는 `Lfm3OmniForConditionalGeneration.from_pretrained`입니다. 페이지 번들의 기본 저장소는 `LiquidAI/LFM3-Omni-2B-GGUF`이고, 쿼리 `model`로 바꿀 수 있습니다. 압축된 런타임 끝의 파일 규칙은 이 두 줄입니다.

```javascript
// vendor/Lfm3OmniForConditionalGeneration.js 끝의 출판된 식. 원문은 한 줄이다.
K3=e=>(e.split("/").pop()??e).replace(/-GGUF$/i,"");
defaultFile:e=>`${K3(e)}-Q4_K_M.gguf`
defaultMmproj:e=>`mmproj-${K3(e)}-Q8_0.gguf`
```

기본 저장소에 대입하면 `LFM3-Omni-2B-Q4_K_M.gguf`와 `mmproj-LFM3-Omni-2B-Q8_0.gguf`입니다. 2026-11-05에 `Content-Length`로 읽은 크기는 1,099,630,080바이트와 506,842,528바이트입니다. 런타임 오류 문자열은 mmproj를 "speech encoder, depth decoder and codec"이라고 부릅니다. mmproj가 없으면 로드는 그 문장으로 거절됩니다.

```python
# 두 Content-Length의 합. 스페이스 README는 이것을 1.6 GB라고 적는다.
q4_k_m = 1_099_630_080
mmproj_q8_0 = 506_842_528
total = q4_k_m + mmproj_q8_0  # 1_606_472_608 bytes = 1.606 GB (10^9)
```

같은 저장소의 다른 파일은 이 기본 경로가 아닙니다. 언어 GGUF의 BF16과 F16은 각각 3,466,628,608바이트, Q8_0은 1,846,240,768바이트, Q4_0은 1,049,617,920바이트입니다. mmproj BF16은 949,841,248바이트, Q4_K_M은 291,586,720바이트입니다. README의 1.6 GB는 그 목록의 중간값이 아니라, 기본으로 고른 두 파일의 합을 소수 한 자리로 적은 것입니다. 워커 주석은 이미 캐시된 바이트는 다시 받지 않는다고 적습니다.

문맥 상한은 카드·config·브라우저가 세 숫자입니다. 카드 표는 "32K tokens (input + output)"입니다. `text_config.max_position_embeddings`와 GGUF 메타데이터의 `context_length`는 128000입니다. 브라우저 런타임은 그 위에 상수를 하나 더 둡니다.

```javascript
var gx=8192;function Xi(e){return Math.max(1,Math.min(gx,Ba(e)))}
```

`Ba`는 장치 `maxBufferSize`와 `maxStorageBufferBindingSize`, KV dtype 폭으로 길이를 더 줄일 수 있고, 마지막에 `max_position_embeddings`와도 비교합니다. `Xi`가 먼저 `gx`로 자르므로, 세션이 요청하는 길이는 8,192를 넘지 않습니다. 워커 주석도 "session's 8192 tokens"라고 적고, 히스토리 예산 기본값은 6,000입니다. 그 위를 넘으면 사용자 턴의 절반을 한 번에 버립니다. 답은 텍스트만 히스토리에 남습니다. 주석이 든 이유는 음성이 초당 약 16토큰이라 말한 내용이 들어갈 자리가 없기 때문이고, 이 글은 그 초당 16을 다시 세지 않았습니다. 같은 주석은 이렇게 해서 44턴 대화가 들어간다고 적습니다. 그 44는 주석의 숫자입니다.

`defaultMaxNewTokens`는 4096입니다. 한 턴의 생성 상한은 그 값과, 남은 컨텍스트 중 작은 쪽입니다. 컨텍스트가 모자라면 `ContextOverflowError`가 나고, 워커는 아직 토큰을 내지 않았을 때만 가장 오래된 교환을 지우고 다시 시도합니다.

첫 오디오에서 진폭 0.01이 나오기 전의 샘플은 버리고, 그 앞 1,200샘플(주석의 50 ms)만 남깁니다. 주석은 답이 약 0.8초의 무음으로 연다고 적습니다. 재생 워크릿 주석은 GPU가 실시간보다 느리면 말하기 전에 쿠션을 쌓는다고 적습니다. 번들의 리드 계산은 실시간 계수가 1.25 이상이면 0.12초이고, 더 느리면 커집니다. 이 글은 그 계수를 어떤 GPU에서 재지 않았습니다. README가 요구하는 브라우저는 WebGPU와 `shader-f16`이 되는 최근 Chrome 또는 Edge, 데스크톱입니다. 출판된 UI 문자열은 그 문장 옆에 "Safari on iOS 26 or later" 분기를 하나 더 가지고 있고, 메모리 부족이면 다른 탭을 닫고 새로고침하라고 적습니다. 이 글은 그 분기 중 어디에서도 페이지를 열어 보지 않았습니다.

끼어들기는 `abort` 메시지입니다. 생성과 재생 큐를 지웁니다. README의 "talk over her and generation and playback stop immediately"는 그 경로를 가리키고, 밀리초로 잰 표는 README에 없습니다.

## 입은 글이 아니라 소리에서 고른다

`index.html`의 한 줄은 "LFM3-Omni on WebGPU · Silero VAD · TalkingHead 3D"입니다. 번들이 `TalkingHead`에 넘기는 옵션은 `ttsEndpoint: "N/A"`, `lipsyncModules: []`, `cameraView: "upper"`입니다. 클라우드 TTS로 음을 받는 경로가 이 옵션에서는 꺼져 있습니다. 기본 아바타 URL은 쿼리 `avatar`가 없으면 데스크톱에서 `avatars/ava-hd.glb`, 모바일 분기에서 `avatars/ava-hd-mobile.glb`입니다. 번들은 `Wolf3D_Glasses`라는 노드 이름으로 안경을 켜고 끕니다.

립싱크는 README가 "gemma-avatar에서처럼 HeadAudio가 오디오에서 만든다"고 적은 그 연결입니다. 번들은 `vendor/headworklet.min.mjs`를 워크릿으로 등록하고, `vendor/model-en-mixed.bin`을 읽은 뒤, `audioSpeechGainNode`를 그 노드에 잇습니다. `onvalue`는 `mtAvatar[key]`의 `newvalue`를 고칩니다. [HeadAudio README](https://github.com/met4citizen/HeadAudio/blob/c6d8af35034068b1c98dcc0fa3ec9602d711e784/README.md)가 그 키로 적는 이름은 Oculus 비짐, 예를 들어 `viseme_aa`이고 값 범위는 0에서 1입니다. 같은 README의 방식은 MFCC와 가우시안 프로토타입, 마할라노비스 거리입니다. 16 kHz에서 512샘플 창의 끝단 지연을 그 README는 약 50 ms라고 적고, 처리 지연 50–100 ms를 스피커 경로의 `DelayNode`로 메우는 단계를 선택 사항으로 적습니다. Ava 번들에서 `DelayNode` 문자열은 0건입니다. 선택 지연을 넣지 않은 연결이 출판본입니다.

같은 README는 오디오 립싱크가 대본이나 타임스탬프 없이 어떤 스트림에도 붙고, 대신 VAD와 정확도는 텍스트 립싱크보다 나쁘며 신호가 시끄러우면 더 그렇다고 적습니다. 분류기 자체에 대해 그 문서가 적는 21초 발화 테스트의 프로세서 시간은 128샘플 블록당 약 0.035 ms입니다. 그 숫자는 HeadAudio 문서의 숫자이고, Ava를 이 글이 다시 잰 값은 아닙니다.

몸짓 이름은 번들에 있습니다. 무드는 neutral, happy, angry, sad, fear, disgust, love, sleep이고, 손 동작은 handup, index, ok, thumbup, thumbdown, side, shrug입니다. README는 이 몸짓을 말이 들리는 대로 `src/reactions.js`가 읽는다고 적습니다. 출판된 스페이스 트리에는 `src/`가 없습니다. 있는 것은 빌드된 `chunk-p1yb2ca4.js`와 워커입니다. 그래서 어떤 단어가 어떤 동작을 고르는지는 README의 문장과 번들 안의 이름까지이고, 규칙 소스의 원문은 이 트리에 없습니다.

README가 모델 때문에 생겼다고 적는 차이는 둘입니다. 인터리브 모드는 목소리가 하나이고 목소리 요청을 무시해서 목소리 선택기가 없습니다. 툴 스키마를 주면 대화가 샌다고 적습니다. 원래 스페이스의 도구로는 "let's play a quick game"이 타이머를 켜고, 아바타 도구로는 매 턴 제스처를 하고 답이 얕아지며 말 없이 루프할 수 있다고 같은 문단이 적습니다. 알려진 모델 행동으로 README가 적는 것은, 마지막 질문을 다시 묻고 Twenty Questions를 유지하지 못한다는 것입니다. 비밀을 붙들지 않고 전부 "no"라고 하며, LiquidAI 스페이스도 같은 모델로 그렇다고 적습니다.

## 라이선스는 저장소마다 다릅니다

모델 `LICENSE`의 제목은 "LFM Open License v1.0"이고, Licensor는 Liquid AI, Inc.입니다. 카드의 `license`는 `other`, `license_name`은 `lfm1.0`입니다. 2절은 저작권 라이선스를 사용료 없이 준다고 적고, 5절이 상업적 사용에 조건을 겁니다. "Commercial Use"는 직접·간접의 상업적 이득 또는 금전적 보상이 있는 사용입니다. "Threshold"는 연간 매출 1,000만 미국 달러 이상입니다. 5(a)는 상업적 사용의 권리가 그 기준을 넘지 않는 것에 걸려 있다고 적고, 5(b)는 기준을 넘는 법적 실체의 상업적 사용은 이 계약으로 라이선스되지 않는다고 적습니다. 5(c)는 자격이 되는 비영리의 비상업·연구 목적에는 그 기준을 적용하지 않는다고 적습니다. 이 글은 특정 회사의 매출이 그 기준에 걸리는지를 판정하지 않습니다.

[TalkingHead](https://github.com/met4citizen/TalkingHead/blob/1563de184c19b310de4b636664d5835e2c74dbba/LICENSE)의 라이선스 파일은 MIT이고 저작권 줄은 "Copyright (c) 2023-2024 Mika Suominen"입니다. `package.json`의 이름은 `@met4citizen/talkinghead`, 버전은 1.8.2, 저자 필드는 Mika Suominen입니다. 2026-11-05 02:18:48 GMT의 `GET /repos/met4citizen/TalkingHead`에서 `stargazers_count`는 1,662, `forks_count`는 364, `license.spdx_id`는 MIT, `pushed_at`은 2026-11-04T09:50:28Z입니다. main 커밋 `1563de18`의 커밋터 시각은 2026-11-04T09:49:53Z, 메시지는 "Updated README"입니다.

[HeadAudio](https://github.com/met4citizen/HeadAudio/blob/c6d8af35034068b1c98dcc0fa3ec9602d711e784/LICENSE)도 MIT이고 저작권 줄은 "Copyright (c) 2025 Mika Suominen"입니다. 패키지 `@met4citizen/headaudio` 버전은 1.0.0입니다. 같은 조회에서 별은 56, 포크는 12, `pushed_at`은 2026-10-22T16:58:53Z입니다. 태그된 설명과 맞는 커밋 `c6d8af35`의 메시지는 "Release v1.0"이고 시각은 2026-10-22T16:56:14Z입니다.

스페이스 README의 라이선스 절은 이렇게 끝납니다. `brunette.glb`는 Ready Player Me, CC BY-NC 4.0(비영리). 모델은 LFM license 1.0. 복사한 JS는 라이선스 표기가 없습니다. TalkingHead, HeadAudio, Silero VAD는 MIT. ONNX Runtime은 MIT. 이 글은 Ready Player Me 약관 페이지를 따로 열지 않았고, `ava-hd.glb`의 라이선스 문장은 그 README에 없습니다. README가 CC BY-NC로 이름을 거는 파일은 `brunette.glb`입니다. 기본으로 뜨는 파일은 `ava-hd.glb`입니다.

[Hugging Face 커널 글](https://huggingface.co/blog/webgpu-kernels)은 2026-09-01, 저자 Nico Martin과 Joshua입니다. 207개 WebGPU 커널을 `webgpu-kernels` 조직에 Apache-2.0으로 두고, 로더 `@huggingface/kernels`가 허브에서 받아 실행한다고 적습니다. npm 레지스트리가 이 글을 쓰는 세션에 돌려준 `dist-tags.latest`와 `preview`는 둘 다 `0.0.1-preview.3`이고, 패키지 `license`는 Apache-2.0입니다. 블로그의 속도 비교는 Apple M4 GPU 한 대, ONNX Runtime Web `1.30.0-dev.20260826-b1f76d586a`, 207연산의 테스트 1,756개 중 출력이 맞고 시간이 안정된 809개입니다. 기하 평균 2.57배, 중앙값 1.90배, 승 629, 패 176, 무 4입니다. 표의 Add는 3.52배, MatMul은 1.14배입니다. 같은 글은 이 숫자를 GPU 안에서 잰 연산 시간이라고 적고, 모델 전체의 약속이 아니라고 적습니다. 커널을 읽고 셰이더를 컴파일하고 출력을 다시 읽는 시간은 빼었다고 적습니다.

Ava에 들어 있는 JS를 문자열로 세면 매니페스트 `domain`은 `com.xenova` 22, `ai.onnx` 17, `co.huggingface` 2입니다. `ai.onnx.Conv` 같은 이름과 `*.wgsl.jinja` 템플릿이 파일 안에 있습니다. `getKernel`, `@huggingface/kernels`, `webgpu-kernels/` 문자열은 그 파일에 없습니다. 셰이더는 허브 저장소를 실행 중에 받는 것이 아니라, LiquidAI 스페이스에서 복사해 온 1,626,340바이트 파일 안에 들어 있습니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 음성 비서 시장의 점유율은 이 글이 측정하지 않았습니다. Liquid 콘솔과 플레이그라운드 링크는 GGUF 카드에 있고, 그 가격표는 이 글이 열지 않았습니다.

클라우드 쪽 1차 출처는 OpenAI 가격표입니다. [gpt-realtime-2.1](https://developers.openai.com/api/docs/models/gpt-realtime-2.1)의 오디오 토큰은 입력 100만당 $32, 캐시된 입력 100만당 $0.40, 출력 100만당 $64입니다. 텍스트는 100만당 입력 $4, 캐시 $0.40, 출력 $24입니다. 문맥은 128,000, 최대 출력은 32,000이라고 그 페이지가 적습니다. [gpt-realtime-2.1-mini](https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini)의 오디오는 100만당 입력 $10, 캐시 $0.30, 출력 $20이고, 같은 페이지는 WebRTC, WebSocket, SIP를 적습니다. [가격표](https://developers.openai.com/api/docs/pricing)의 Realtime 표도 2.1 오디오를 $32 / $64 / 캐시 $0.40으로 적습니다. [비용 가이드](https://developers.openai.com/api/docs/guides/voice-latency-cost?voice-api=realtime)는 사용자 오디오를 100 ms당 1토큰, 어시스턴트 오디오를 50 ms당 1토큰으로 적고, 대역폭과 연결 자체의 요금은 지금 없다고 적습니다. 같은 문서는 대화 전부가 다음 Response의 입력이 되므로 뒤 턴이 더 비싸진다고 적습니다.

아래는 그 규칙만으로 이 글이 계산한 새 오디오입니다. 캐시 적중과, 다시 실려 가는 과거 턴은 빠져 있습니다. 세션 청구액이 아닙니다.

```python
# developers.openai.com 의 100 ms / 50 ms 규칙과 gpt-realtime-2.1 오디오 단가.
# 사용자 60초 = 600 입력 토큰, 어시스턴트 60초 = 1,200 출력 토큰.
user_minute = 600 / 1_000_000 * 32      # $0.0192
assistant_minute = 1200 / 1_000_000 * 64  # $0.0768
# 둘을 더하면 $0.096. 캐시가 맞으면 입력 단가는 $0.40/1M이다.
```

Ava 쪽에 같은 단위의 청구 항목은 없습니다. 추론 루프가 브라우저 GPU와 WASM에 있고, 스페이스 하드웨어 칸은 null입니다. 대신 첫 방문이 받는 파일은 1,606,472,608바이트이고, 그 바이트의 출처는 `https://huggingface.co`입니다. 페이지 `index.html`은 Google Fonts에 preconnect합니다. 추론 서버의 토큰 미터가 없다는 문장과, 네트워크 요청이 하나도 없다는 문장은 다릅니다. 전기 요금과 사용자 GPU 시간은 이 글이 재지 않았습니다.

채택 조건으로 문서가 적는 것은 구독료가 아닙니다. WebGPU, `shader-f16`, 데스크톱 Chrome 또는 Edge라는 README, 그리고 UI가 따로 적은 iOS Safari 26 분기입니다. 목소리 선택기는 없고, 툴 스키마는 README가 대화를 망가뜨린다고 적습니다. 브라우저 세션은 8,192토큰에서 잘리고, 카드의 32K와 config의 128000은 그 세션의 길이가 아닙니다. 모델 카드의 텍스트 언어와 음성 언어 목록에는 한국어가 있습니다. Ava의 기본 시스템 문장은 영어이고, 이 글은 한국어 발화를 넣어 보지 않았습니다.

**분석/의견.** 이득이 가는 자리는 짧은 음성 대화를 사용자 GPU로 끝내고, 오디오 샘플을 자기 서버에 두고 싶지 않은 쪽입니다. 한계가 그 자리의 비용입니다. 1.6 GB를 한 번 받고, 2B급 인터리브 모델 하나의 목소리와 8,192토큰 세션을 받아들이며, 매출이 라이선스 기준 아래에 있거나 비상업으로 쓰는 쪽입니다. 클라우드 실시간 API가 가격표로 팔고 있는 자리는 그 바깥에 남아 있습니다. 128,000 문맥, 도구 호출, 고를 수 있는 음성, mini 페이지가 적은 SIP, 그리고 `shader-f16`이 없는 브라우저입니다. 토큰 단가가 0이 되는 범위는 추론 컴퓨트이지, 허브에서 가중치를 받는 첫 다운로드나 정적 페이지 호스팅이 아닙니다.

손해가 생기는 읽기는 세 가지입니다. "오픈 소스라서 제품에 넣으면 된다"고 보면 LFM Open License 5절의 매출 기준과, README가 `brunette.glb`에 붙인 CC BY-NC, 런타임 JS에 라이선스 문장이 없다는 README의 문장이 빠집니다. "Hugging Face 커널이 2.57배 빠르게 이 모델을 돌린다"고 보면, 그 2.57은 블로그가 모델 전체가 아니라고 적은 M4의 연산 비교이고 Ava 번들은 `getKernel`을 호출하지 않습니다. "32K 문맥의 실시간 음성"으로 보면 브라우저 상한 8,192와, 실시간보다 느린 GPU를 위해 쿠션을 쌓는 재생 워크릿이 빠집니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·이 글이 다시 재지 못함 / ❌ 사실 아님

### @victormustar 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| 브라우저 안에서 듣고 말한다 | ✅ | [townbox/ava](https://huggingface.co/spaces/townbox/ava) README의 파이프. 워커는 16 kHz 오디오를 넣고 `generation_mode: "interleaved"`로 텍스트와 오디오를 받는다. 카드의 입력은 16 kHz, 출력은 24 kHz. 포스트 본문에 URL은 없고, 이 스페이스가 그 문장과 맞는 데모다. |
| 실시간으로 반응한다 | ⚠️ | 끼어들기 `abort`와 말에서 읽는 몸짓은 README에 있다. 번들에 무드·손 동작 이름이 있다. `src/reactions.js`는 출판 트리에 없다. 끝단 지연을 적은 표는 스페이스 README에 없다. 재생 워크릿은 GPU가 실시간보다 느릴 때를 전제로 쿠션을 쌓는다. 워커 주석의 첫 무음 약 0.8초는 그 파일의 문장이고, 이 글은 재지 않았다. |
| 추론은 전부 기기 안에서 돈다 | ✅ | `sdk`는 `static`, `runtime.hardware.current`는 null. VAD는 WASM, 모델은 WebGPU 워커, 립싱크는 오디오 워크릿이다. 대화 오디오를 실어 나르는 `fetch`는 앱 번들에서 찾지 못했다. 가중치는 `huggingface.co`에서 받고, `index.html`은 Google Fonts에 연결한다. 이 글은 패킷을 캡처하지 않았다. |
| 그래서 대화가 비공개다 | ⚠️ | README는 "No backend: your voice never leaves the device"라고 적는다. 워커 프로토콜은 `postMessage`다. 비공개의 범위는 그 문장과, 출판 JS에 대화 업로드가 없다는 사실까지다. 실행 중 네트워크는 재지 않았다. |
| 오픈 소스로 돌아간다 | ⚠️ | TalkingHead·HeadAudio LICENSE는 MIT, Silero 저장소 SPDX는 MIT, 스페이스 README는 ORT도 MIT라고 적는다. 모델은 LFM Open License v1.0이고 연 매출 1,000만 달러 이상의 상업적 사용은 5(b)가 라이선스에서 뺀다. 런타임 JS는 README가 라이선스 표기가 없다고 적는다. `brunette.glb`는 README가 CC BY-NC 4.0이라고 적는다. |
| LFM3-Omni가 음성 이해와 생성이다 | ✅ | [LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B). 파라미터 2,166,928,384. 아키텍처 줄에 LFM3 백본, 비전 인코더, causal 오디오 인코더, LiquidCodec이 있다. 포스트의 이름은 `-2B`를 생략한다. Ava는 음성 입출력을 쓰고 이미지는 넣지 않는다. |
| Hugging Face WebGPU 커널이 빠르고 기기 안에서 추론한다 | ⚠️ | 추론이 WebGPU인 것은 워커와 README가 맞다. 번들 안에 `ai.onnx`·`co.huggingface`·`com.xenova` 매니페스트와 WGSL 템플릿이 있다. `getKernel`과 `webgpu-kernels/`는 없다. 셰이더는 [LiquidAI WebGPU 스페이스](https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU)에서 복사한 파일 안이다. 2.57배는 [블로그](https://huggingface.co/blog/webgpu-kernels)의 M4 연산 809건이고, 그 글이 모델 전체의 숫자가 아니라고 적는다. |
| TalkingHead와 HeadAudio가 아바타와 립싱크다 | ✅ | 번들이 `ttsEndpoint: "N/A"`, `lipsyncModules: []`인 TalkingHead에 `headworklet.min.mjs`와 `model-en-mixed.bin`을 잇는다. 저장소는 [met4citizen/TalkingHead](https://github.com/met4citizen/TalkingHead) `1563de18`, [met4citizen/HeadAudio](https://github.com/met4citizen/HeadAudio) `c6d8af35`, 둘 다 MIT. HeadAudio README의 선택 `DelayNode`(50–100 ms)는 Ava 번들에 없다. |

**총평:** Ava는 정적 스페이스가 LFM3-Omni-2B의 Q4_K_M과 mmproj Q8_0을 브라우저 WebGPU로 돌리고, Silero VAD로 말을 자르며, TalkingHead와 HeadAudio로 입을 움직이는 데모가 맞다. 느슨한 곳은 실시간과 오픈 소스와 커널 속도다. 실시간의 공개 숫자는 이 스페이스에 없고, 모델 라이선스에는 매출 기준이 있으며, 2.57배는 이 모델의 측정이 아니다. 브라우저가 실제로 연 문맥 상한은 8,192토큰이다.

## 참고 자료

- 계기 포스트 — [@victormustar, 2026-11-01 17:41 UTC](https://x.com/victormustar/status/2116948755760968077) · [i/status](https://x.com/i/status/2116948755760968077) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2116948755760968077)
- Ava 스페이스 `23cc0dade14fb77fbb894453631dc06d5111ac26`, 2026-11-04T23:14:26Z — [스페이스](https://huggingface.co/spaces/townbox/ava) · [README](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/README.md) · [model-worker.js](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/workers/model-worker.js) · [vad-worker.js](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/workers/vad-worker.js) · [vad-segmenter.js](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/workers/vad-segmenter.js) · [mic-capture.js](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/worklets/mic-capture.js) · [audio-playback.js](https://huggingface.co/spaces/townbox/ava/blob/23cc0dade14fb77fbb894453631dc06d5111ac26/worklets/audio-playback.js) · 정적 호스트 [townbox-ava.static.hf.space](https://townbox-ava.static.hf.space)
- 조직 멤버 — `GET https://huggingface.co/api/organizations/townbox/members`. `victor` / Victor Mustar, `Mike0021` / Mike
- LFM3-Omni-2B `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67` — [모델 카드](https://huggingface.co/LiquidAI/LFM3-Omni-2B) · [config.json](https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/config.json) · [generation_config.json](https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/generation_config.json) · [LICENSE](https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67/LICENSE) · 2026-11-05 02:23:57 GMT API. safetensors 2,166,928,384, likes 357, downloads 13,057
- GGUF `d508b88f08a5b4286f2d2805a6a8d69a0ff44c72` — [LiquidAI/LFM3-Omni-2B-GGUF](https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF). `Content-Length` Q4_K_M 1,099,630,080, mmproj Q8_0 506,842,528. 메타데이터 `context_length` 128000, `gguf.total` 1,728,801,600. likes 130, downloads 198,057
- LFM3-1.7B `0dc4268b561499c648c7ba7c9466bf3d8d01517a` — [모델](https://huggingface.co/LiquidAI/LFM3-1.7B). safetensors 1,728,801,536, likes 1,488, downloads 54,959. 라이선스 이름 `lfm1.0`
- Liquid 문서 — [Omni Models](https://docs.liquid.ai/lfm/models/omni-models). 온디바이스에서 ASR·비전언어·LLM·TTS를 한 모델로 둔다고 적는다
- LiquidAI WebGPU 스페이스 `9c2fb176` — [LFM3-Omni-2B-WebGPU](https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU), 2026-10-29 생성, likes 104
- gemma-avatar — [victor/gemma-avatar](https://huggingface.co/spaces/victor/gemma-avatar), 2026-07-03 생성. Ava README가 UX의 출발로 적는다
- WebGPU 커널 — [블로그, 2026-09-01](https://huggingface.co/blog/webgpu-kernels) · [npm @huggingface/kernels](https://www.npmjs.com/package/@huggingface/kernels) `0.0.1-preview.3`, Apache-2.0
- TalkingHead `1563de184c19b310de4b636664d5835e2c74dbba` — [저장소](https://github.com/met4citizen/TalkingHead) · [LICENSE](https://github.com/met4citizen/TalkingHead/blob/1563de184c19b310de4b636664d5835e2c74dbba/LICENSE). 2026-11-05 02:18:48 GMT 별 1,662, 포크 364
- HeadAudio `c6d8af35034068b1c98dcc0fa3ec9602d711e784` — [저장소](https://github.com/met4citizen/HeadAudio) · [README의 50–100 ms 지연 보정](https://github.com/met4citizen/HeadAudio/blob/c6d8af35034068b1c98dcc0fa3ec9602d711e784/README.md) · [LICENSE](https://github.com/met4citizen/HeadAudio/blob/c6d8af35034068b1c98dcc0fa3ec9602d711e784/LICENSE). 별 56, 포크 12
- Silero VAD — [snakers4/silero-vad](https://github.com/snakers4/silero-vad), GitHub `license.spdx_id` MIT. Ava가 읽는 파일은 `vendor/silero_vad_v5.onnx`
- 클라우드 음성 단가 — [gpt-realtime-2.1](https://developers.openai.com/api/docs/models/gpt-realtime-2.1) · [gpt-realtime-2.1-mini](https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini) · [가격표](https://developers.openai.com/api/docs/pricing) · [Realtime 비용 가이드](https://developers.openai.com/api/docs/guides/voice-latency-cost?voice-api=realtime)
