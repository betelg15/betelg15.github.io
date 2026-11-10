---
title: "5060 Ti 한 장으로 95.6M을 처음부터? Sekai-1 팩트 체크"
date: 2026-11-10
time: "09:18"
slug: sekai-1-llm-pretrained-on-single-rtx-5060-ti
tags: [Sekai-1, LLM, RTX 5060 Ti, Hugging Face, 사전학습, 팩트체크]
summary: "8BitStudio/Sekai-1의 safetensors는 F32 95,581,504개이고 카드 라이선스는 Apache-2.0이다. 거부 응답 제외는 SFT 문장뿐이고 필터는 없으며, 학습 로그와 코드도 저장소에 없다."
---

> 이 글은 제가 X에서 북마크해 둔 [@rS_alonewolf의 포스트](https://x.com/rS_alonewolf/status/2119748126387130424)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2119748126387130424](https://x.com/i/status/2119748126387130424)입니다. 표시 이름은 rS_ローカルLLM×投資, `screen_name`은 `rS_alonewolf`입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2119748126387130424)(`code` 200)으로 읽었습니다. `created_at`은 `Mon Nov 09 11:05:11 +0000 2026`, **2026-11-09 20:05 KST**입니다. `is_note_tweet`은 true입니다. 본문은 「何が重要？」 뒤에서 잘리지 않았고, t.co 패싯은 사진(1160×1252)입니다.
>
> 그 응답의 본문은 이렇습니다. RTX 5060 Ti 한 장으로 LLM을 처음부터 학습한 개인 개발자의 「Sekai-1」이 Hugging Face에 공개되었다. 한 일은 95.6M(약 9600만) 파라미터, RTX 5060 Ti 한 장으로의 사전학습, 기존 모델의 LoRA나 증류가 아님, 거부 응답을 포함한 데이터를 학습 때 제외, Apache 2.0 공개. 중요한 점으로는, 큰 GPU 클러스터 없이도 스스로 LLM을 설계해 처음부터 학습할 수 있는 실례이고, 아직 매우 작은 모델이라 실용 성능은 미지수이며, 로컬 LLM을 돌리는 데서 그치지 않고 학습 데이터와 모델 구조부터 연구할 수 있는 점이 매력이라고 적습니다. 마지막 문장은 RTX 5070 Ti로도 이런 연구를 해보고 싶어진다는 말입니다. 같은 응답의 스냅샷은 답글 3, 리포스트 13, 좋아요 100, 북마크 80, 인용 3, 조회 7,045입니다. `verification.type`은 `individual`, 팔로워는 4,669입니다. 읽은 시각은 2026-11-10 09:10 KST 무렵입니다. X 글과 첨부 그림의 문장은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-10(KST)에 연 1차 자료입니다. 가중치는 추론을 돌리지 않았고, `model.safetensors`는 앞 262,144바이트만 받아 헤더(28,184바이트)의 텐서 모양을 세었습니다. `tokenizer.json`은 받아서 어휘를 세었습니다. 학습은 재현하지 않았습니다.

## 왜 중요한가

100M 안팎의 디코더를 처음부터 학습하는 일 자체는 새 문장이 아닙니다. [nanoGPT README](https://github.com/karpathy/nanoGPT)는 GPT-2 124M을 OpenWebText로 8×A100 40GB 노드에서 약 4일 학습한다고 적고, 셰익스피어 문자 모델은 A100 한 장에서 약 3분이라고 적습니다. 이번에 확인할 질문은 “작은 사전학습이 가능한가”보다 다음입니다.

- Hugging Face에 `Sekai-1`이라는 가중치가 실제로 있는가. 이름은 상하이 AI Lab의 영상 데이터셋 [Lixsp11/Sekai](https://huggingface.co/datasets/Lixsp11/Sekai)와 겹칩니다. 그 데이터셋은 1인칭 영상입니다. 이 글의 모델은 그 저장소가 아닙니다.
- 95.6M은 반올림인가, 파일의 원소 수인가.
- “처음부터, 5060 Ti 한 장”은 카드 문장인가, 학습 로그인 가.
- LoRA가 아니라는 말과 증류가 아니라는 말은 같은 증거로 닫히는가.
- 거부 응답을 뺐다는 문장이 사전학습 전체인지, SFT 문단인지, 필터가 공개됐는지.
- Apache-2.0은 라이선스 파일인가, 카드의 라이선스 필드인가.

개발자에게 이 체크포인트가 의미 있는 지점은 제품 대체보다 규모입니다. 카드가 스스로 말하는 한계(사실 오류, 긴 대화, 다단계 추론, 안전 튜닝 없음, 영어만)를 숫자와 파일로 붙여 두면, “소비자 GPU로 LLM을 학습했다”는 문장을 어느 크기에서 읽을지가 갈립니다.

## 기술 설명

### 공개된 저장소

모델은 [8BitStudio/Sekai-1](https://huggingface.co/8BitStudio/Sekai-1)입니다. Hub API를 2026-11-10에 읽었을 때 `createdAt`은 `2026-11-08T00:42:36.000Z`(2026-11-08 09:42 KST), `lastModified`는 `2026-11-09T14:08:16.000Z`(2026-11-09 23:08 KST), `sha`는 `251811183992620942e861efd6e3c093d53ce9bc`입니다. 같은 응답의 다운로드는 290, 좋아요는 3, `pipeline_tag`는 `text-generation`, `library_name`은 `transformers`입니다. `safetensors.parameters`는 `{"F32": 95581504}`이고 `total`도 95,581,504입니다. 저장소가 쓰는 용량은 384,064,402바이트입니다.

파일 목록은 `.gitattributes`, `Leaderboard.png`, `README.md`, `Sekai-1.png`, `chat_template.jinja`, `config.json`, `generation_config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`입니다. `adapter_config.json`도, `train.py`도, `LICENSE` 파일도 이 목록에 없습니다.

계정은 Hub 사용자 `8BitStudio`입니다. [overview API](https://huggingface.co/api/users/8BitStudio/overview)의 `type`은 `user`, `fullname`은 Jackson Yeskie, `orgs`는 빈 배열입니다. `createdAt`은 `2025-11-15T21:23:10.000Z`입니다. 같은 응답의 `hardwareItems`는 기본 GPU로 NVIDIA RTX 5060 Ti 1장, `mem` 16, 그리고 CPU로 AMD Ryzen Zen 4 7000(Ryzen 7), 메모리 32입니다. 프로필 HTML에는 `https://github.com/8-bitStudio` 링크가 있습니다. 그 GitHub 사용자의 공개 저장소는 2026-11-10 API 기준 9개(`3d-jelly`, `Amadeus`, `aniimage`, `ChunkClaim`, `db`, `Glance`, `retro-fin`, `The-worst-calculator`, `vakcodinglanguage`)이고, 이름에 Sekai가 들어간 저장소는 없습니다. 학습 설정 파일은 모델 저장소와 이 공개 저장소 목록 양쪽에서 찾지 못했습니다.

같은 계정의 [Aniimage-1 카드](https://huggingface.co/8BitStudio/Aniimage-1)는 다른 모델(256×256 애니 이미지)의 GPU를 “NVIDIA RTX 5060 Ti 16GB”라고 적습니다. 그 문장을 Sekai-1 런의 로그로 읽지는 않습니다.

### 아키텍처와 95,581,504

카드의 문장은 “Qwen3-style decoder-only”입니다. `config.json`의 `architectures`는 `Qwen3ForCausalLM`, `model_type`은 `qwen3`입니다. 이 클래스 이름은 가중치의 출처가 아닙니다. 비교로 연 [Qwen/Qwen3-0.6B `config.json`](https://huggingface.co/Qwen/Qwen3-0.6B/raw/main/config.json)은 `vocab_size` 151,936, `hidden_size` 1024, 층 28, 쿼리 헤드 16, KV 헤드 8, `head_dim` 128, `rope_theta` 1,000,000, `max_position_embeddings` 40,960, `torch_dtype` `bfloat16`입니다. Sekai-1은 아래와 같습니다.

| 항목 | Sekai-1 `config.json` |
|---|---|
| 층 | 23, 모두 `full_attention` |
| hidden / intermediate | 576 / 1536 |
| 쿼리 헤드 / KV 헤드 / head_dim | 9 / 3 / 64 |
| 활성화 | `silu` (SwiGLU의 게이트) |
| 정규화 | RMSNorm, `rms_norm_eps` 1e-6. 층마다 `input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm` |
| 위치 | RoPE, `rope_theta` 10,000, `rope_type` `default` |
| 문맥 | `max_position_embeddings` 2048, sliding window 없음 |
| 어휘 / 임베딩 | 24,576, `tie_word_embeddings` true |
| dtype | `float32` (`torch_dtype`도 `float32`) |
| 체크포인트가 적은 transformers | `5.15.1` |

헤더의 0번 층 모양은 이 표와 같습니다. `q_proj`는 `[576, 576]`, `k_proj`와 `v_proj`는 `[192, 576]`, `o_proj`는 `[576, 576]`, MLP의 `gate_proj`·`up_proj`는 `[1536, 576]`, `down_proj`는 `[576, 1536]`입니다. `lm_head` 텐서는 없습니다. 묶인 임베딩이라 출력 행렬은 `embed_tokens`와 같습니다.

원소 수를 모양으로 다시 더하면 헤더의 95,581,504와 같습니다.

```python
# model.safetensors 헤더의 모양으로 센 값. 학습 재현이 아니다.
embed = 24_576 * 576                 # 14,155,776
q = o = 576 * 576                    # 331,776
k = v = 192 * 576                    # 110,592
q_norm = k_norm = 64
gate = up = down = 1_536 * 576       # 884,736
ln = 576
layer = q + k + v + o + q_norm + k_norm + gate + up + down + ln + ln
# layer == 3,540,224
total = embed + 23 * layer + 576     # 최종 RMSNorm
# total == 95,581,504
```

카드의 95.6M은 이 정수를 백만 단위로 반올림한 표기입니다. 95,581,504 × 4바이트는 382,326,016바이트, 364.6 MiB입니다. 추론용 FP32 가중치의 크기이고, 학습 중 VRAM은 아닙니다.

### 토크나이저

`tokenizer.json`의 `model.vocab` 길이는 24,576이고, 머지는 24,312개입니다. 특수 토큰은 `tokenizer_config.json`과 같습니다. `<|endoftext|>`가 0번이자 BOS·PAD·UNK, `<|im_start|>`가 1, `<|im_end|>`가 2, `<|reserved_0|>`부터 `<|reserved_4|>`가 3–7입니다. `model_max_length`는 2048입니다.

숫자 토큰은 파일에서 확인됩니다. `"0"`부터 `"9"`는 id 23–32이고, 두 글자 이상의 숫자로만 된 토큰은 0개입니다. `"10"`, `"100"`, `"2024"`는 어휘에 없습니다. 카드의 “numbers into single digits”는 이 어휘와 맞습니다. 채팅 템플릿은 ChatML이고, 맨 앞에 BOS(`<|endoftext|>`)를 붙인 뒤 `<|im_start|>role\n...<|im_end|>\n`을 반복합니다.

### 데이터, 옵티마이저, 토큰 수

카드 본문:

- 사전학습 58.5B 토큰. 웹, 교육, 수학, 코드, 대화. Muon과 AdamW. warmup-stable-decay. 마지막 약 12B 토큰은 더 높은 품질 혼합에서의 decay.
- SFT 약 400M 토큰. 지시 따르기, 일상 대화, 짧은 답과 긴 답, 요약, 다시 쓰기, 코드 작성과 수정, 모델이 자신이 Sekai-1임을 알게 하는 소량의 identity 예시. chain-of-thought는 쓰지 않는다고 적습니다. 이 문단의 마지막 절은 “refusals were filtered out of the data”입니다.

58.5B를 95,581,504로 나누면 파라미터당 **612** 토큰입니다. 약 12B / 58.5B는 **20.5%**입니다. 카드의 “~12B”이므로 이 비율도 근사입니다. SFT 400M은 58.5B의 **0.68%**입니다.

카드 YAML의 `datasets`는 단계를 나누지 않은 한 목록입니다. 본문이 각 id를 사전학습과 SFT 중 어디에 얼마큼 넣었는지는 적지 않습니다. 목록은 `karpathy/climbmix-400b-shuffle`, `HuggingFaceTB/smollm-corpus`, `HuggingFaceTB/finemath`, `HuggingFaceTB/cosmopedia`, `openbmb/UltraX-Preview`, `allenai/dolma3_dolmino_mix-100B-1025`, `allenai/dolma3.5_pool`, `allenai/dolmino-mix-1124`, `IFM/TxT360-v2`, `nvidia/OpenMathInstruct-2`, `nvidia/Nemotron-MIND`, `openbmb/UltraData-Math`, `microsoft/orca-math-word-problems-200k`, `meta-math/MetaMathQA`, `OpenCoder-LLM/opc-annealing-corpus`, `HuggingFaceTB/smoltalk`, `HuggingFaceTB/smoltalk2`, `HuggingFaceH4/ultrachat_200k`, `allenai/tulu-3-sft-mixture`, `bigcode/commitpackft`입니다.

이 가운데 세 장의 데이터 카드는 다른 모델이 쓴 문장이라고 밝힙니다.

- [HuggingFaceTB/cosmopedia](https://huggingface.co/datasets/HuggingFaceTB/cosmopedia)는 Mixtral-8x7B-Instruct-v0.1이 만든 합성 교과서·글이고, 25B 토큰 이상이라고 적습니다.
- [nvidia/OpenMathInstruct-2](https://huggingface.co/datasets/nvidia/OpenMathInstruct-2)는 Llama-3.1-405B-Instruct로 만든 1400만 문제-풀이 쌍이라고 적습니다.
- [HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)는 ChatGPT가 만든 140만 대화를 걸러 만든 집합이라고 적습니다. 원문의 “1.4M dialogues generated by ChatGPT”는 필터 전 UltraChat을 가리킵니다.

목록에 있다는 사실이 그 데이터셋 전체를 썼다는 뜻은 아닙니다. 배치 크기, 학습률, 시퀀스 패킹, 정밀도, 마이크로배치, 피크 VRAM, 벽시계 시간은 카드에 없습니다. Muon과 AdamW를 어느 파라미터에 나눴는지도 없습니다.

### 불러오기

카드의 예입니다. 이 글은 `generate()`를 실행하지 않았습니다.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "8BitStudio/Sekai-1"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

messages = [{"role": "user", "content": "Who are you?"}]
inputs = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, return_dict=True, return_tensors="pt"
)
outputs = model.generate(**inputs)
print(tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True))
```

`generation_config.json`에는 카드 본문이 적은 temperature 0.5, top-p 0.9, top-k 40, repetition penalty 1.1 외에 `min_p` 0.02, `max_new_tokens` 512, `do_sample` true, `eos_token_id` `[2, 0]`이 있습니다. 카드는 결정적 출력이 필요하면 `do_sample=False`를 넘기라고 합니다. 카드는 CPU에서 돌릴 수 있을 만큼 작다고 적고, 별도의 VRAM 요구는 적지 않습니다.

### 6×N×D는 추정이다

학습 FLOPs로 자주 쓰는 근사는 순전파 약 2ND, 역전파 약 4ND, 합이 6ND입니다. N은 파라미터 수, D는 토큰 수입니다. 아래는 그 식에 카드의 58.5B와 헤더의 N을 넣은 값입니다. 측정된 학습 시간이 아닙니다.

```python
N = 95_581_504
D = 58_500_000_000          # 카드의 사전학습 토큰. SFT 약 400M은 별도
flops = 6 * N * D           # 3.354911e19

# NVIDIA 비교표의 CUDA 코어 4608, 부스트 2.57 GHz.
# 50 시리즈 칸은 Ada 칸과 달리 shader TFLOPS를 적지 않는다.
# 2 * 코어 * 클럭은 FP32 FMA를 2 FLOP로 센 이 글의 추정이다.
peak = 2 * 4608 * 2.57e9    # 2.368512e13 FLOP/s, 23.685 TFLOP/s
seconds = flops / peak      # 1,416,463초 ≈ 393.5시간 ≈ 16.4일
```

이 16.4일은 세 가지를 동시에 가정합니다. 6ND가 맞다, GPU가 부스트 클럭의 FP32 피크를 100% 쓴다, 사전학습 토큰만 센다. 셋 다 카드에 없습니다. 실제 학습 활용률은 100%보다 낮고, BF16 텐서 코어를 썼다면 피크가 다릅니다. NVIDIA 비교표의 5060 Ti “5th Generation 759 AI TOPS”는 그 표에서 정밀도를 밝히지 않아서, 이 글은 그 숫자를 학습 시간으로 바꾸지 않습니다. SFT 400M을 같은 6ND로 넣으면 2.29e17 FLOPs로, 사전학습 추정의 0.68%입니다. 이것도 추정입니다.

가중치만 364.6 MiB라는 사실과, 학습 VRAM을 알 수 없다는 사실은 같이 두어야 합니다. AdamW라면 가중치·기울기·1차·2차 모멘텀이 파라미터당 상태를 더하지만, 카드는 Muon과 AdamW를 같이 썼다고만 하고 비율을 적지 않습니다. 활성화 메모리는 배치와 2048 문맥에 붙는데 배치가 없습니다. 그래서 이 글은 학습 VRAM 예산을 숫자로 내놓지 않습니다.

### 이 규모가 하는 일과 하지 않는 일

카드의 Limitations는 사실 실수, 긴 대화에서 맥을 잃음, 다단계 추론과 간단한 산술을 넘는 수학에 약함, 안전 튜닝과 거부 행동이 없음, 영어만 이해함입니다. “don't use it anywhere that needs either”의 either는 안전 튜닝과 거부입니다.

첨부 `Leaderboard.png`를 2026-11-10에 OCR했습니다. 제목은 “Open SLM Leaderboard — Under 100M”이고, 캡션은 zero-shot HellaSwag, ARC-Easy, ARC-Challenge, PIQA, ArithMark-3를 Intelligence Index로 합친다고 합니다. 다른 점수는 [AxiomicLabs/Open_SLM_Leaderboard](https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard)의 100M 미만 필터, 2026-11-07, 상위 20개에서 가져왔고 Sekai-1은 같은 과제를 로컬에서 채점했다고 캡션이 적습니다. 막대 안의 숫자는 첫 막대 **30.26**, 주황 막대(Sekai-1) **26.22**로 읽혔습니다. 30.26은 [KLM-1.5 카드](https://huggingface.co/MinimaLabs/KLM-1.5)가 자신의 Intelligence Index로 적은 30.26과 같습니다. 그 카드의 리더보드 시점은 2026-10-22입니다. 이 글은 lm-eval을 다시 돌리지 않았습니다. 26.22는 저자가 올린 그림의 로컬 점수입니다.

같은 크기대의 공개 숫자와 나란히 두면 이렇습니다. 점수를 한 표로 섞지 않았습니다. 과제와 토큰 정의가 다릅니다.

| 모델 | 출처가 적은 규모 | 학습 규모로 출처가 적은 것 |
|---|---|---|
| Sekai-1 | 95,581,504, 문맥 2048, 어휘 24,576 | 사전학습 58.5B + SFT 약 400M. GPU는 카드 문장 |
| [KLM-1.5](https://huggingface.co/MinimaLabs/KLM-1.5) | 99.0M(카드는 98,975,308도 적음), 문맥 2048, 어휘 4,100 | “trained from scratch on 100B tokens”. 본문은 stable 80B, decay 20B, 워밍업은 ClimbMix 128B를 약 18B 연산으로 덮는다고 적음 |
| [SmolLM-135M](https://huggingface.co/HuggingFaceTB/SmolLM-135M) | 135M, 문맥 2048, 임베딩 묶음, GQA | 600B 토큰, bfloat16, GPU 64×H100, 프레임워크 Nanotron |
| [GPT-2 small](https://huggingface.co/openai-community/gpt2) | HF 카드 “124M”, 어휘 50,257, 문맥 1024 | WebText 40GB. 카드는 토큰 수와 작은 모델의 학습 시간을 적지 않음 |
| [nanoGPT](https://github.com/karpathy/nanoGPT) | README의 GPT-2 124M 재현 | OpenWebText, 8×A100 40GB, 약 4일, val loss 약 2.85. 토큰 수는 그 README에 없음 |

600B / 58.5B는 약 **10.3**입니다. SmolLM-135M은 파라미터도 135/95.6 ≈ 1.4배입니다. KLM-1.5 카드는 같은 다섯 과제에서 ARC-Easy 59.68, ARC-Challenge 32.68, HellaSwag 43.74, PIQA 68.55, ArithMark-3 48.20을 적습니다. Sekai-1 카드 본문은 과제별 점수를 글로 적지 않고 그림에 합산 지수만 둡니다.

작은 사전학습이 하는 일은 여기까지입니다. 영어 다음 토큰과 짧은 ChatML 대화를 목표로, CPU에 올라가는 체크포인트를 만들고, 저자 채점으로는 100M 미만 다섯 과제의 합산 지수에서 KLM-1.5 다음에 두는 것입니다. 하지 않는 일도 카드에 있습니다. 사실을 지키는 모델, 긴 맥락, 다단계 수학, 거부가 필요한 자리. nanoGPT가 보여 준 “한 노드에서 124M”과 SmolLM이 보여 준 “64장의 H100으로 600B” 사이에, 이 릴리스는 소비자 카드 한 장이라는 **저자의 문장**과 채팅 SFT가 붙은 가중치를 더합니다. 학습 코드는 더하지 않습니다.

### 거부 응답과 안전

확인할 문장은 SFT 문단에 있습니다. “refusals were filtered out of the data.” 사전학습 문단은 웹·교육·수학·코드·대화를 말할 뿐, 거부 문장을 걸렀다고 적지 않습니다. 걸러 낸 예시의 수, 필터 스크립트, 걸러 내기 전과 후의 샘플은 저장소에 없습니다.

첨부 그림의 ①번 칸은 OCR로 “拒否応答の除外は作者の説明。具体的な処理は未確認”입니다. 포스트의 글머리표는 제외를 사실로 적고, 같은 포스트의 그림은 처리가 확인되지 않았다고 적습니다.

Limitations의 안전 문장은 측정치가 아니라 저자의 사용 제한입니다. 안전 튜닝이 없고 거부 행동이 없으니, 둘 중 하나가 필요한 곳에는 쓰지 말라고 합니다. 이 글은 그 문장을 행동 실험으로 확인하지 않았습니다. 거부 문장을 SFT에서 빼면 모델이 거부 문장을 따라 하도록 배우지 않게 하려는 데이터 선택입니다. 그 선택이 유해 요청에 어떻게 답하는지는 별도 평가입니다. 평가 수치를 카드는 주지 않습니다. 사전학습에 들어간 공개 코퍼스 안에 거부처럼 보이는 문장이 남아 있는지도 카드가 말하지 않습니다.

학습이 끝난 뒤 거부 방향을 지우는 작업과는 단계가 다릅니다. 그 갈래는 이 사이트의 [Heretic 2](/posts/heretic-2-llm-abliteration/)가 다룹니다. Sekai-1 카드는 그 절차를 쓰지 않았다고 적지 않고, 데이터에서 거부를 걸렀다고만 적습니다.

## 비즈니스 인사이트

숫자와 제품 문장은 옆에 출처를 붙입니다. 그 밖의 판단은 **분석/의견**입니다. 전기요금, 임대료, 매출은 출처가 없어 만들지 않습니다.

**어느 시장인가.** 100M 전후의 영어 디코더는 SmolLM, KLM, GPT-2 small이 이미 있는 연구·온디바이스 구간입니다. Sekai-1이 저자 그림에서 26.22로 2위라는 말은 다섯 개 zero-shot 과제의 합산이고, 코딩 에이전트나 다국어, 안전 평가가 아닙니다. KLM-1.5는 99M, 처음부터 학습, Apache-2.0, Intelligence Index 30.26을 자기 카드에 적습니다. **분석/의견.** 이 구간에서 경쟁 상대는 호스팅 API가 아니라, 같은 크기에서 데이터와 학습 코드를 더 많이 공개한 체크포인트입니다. Sekai-1은 가중치와 카드는 공개하고 학습 코드는 공개하지 않았습니다.

**누가 이득을 보나.** (1) transformers로 CPU에 올려 영어 짧은 생성을 만져 보려는 사람. FP32 가중치 364.6 MiB는 파일에서 계산됩니다. (2) 숫자를 한 자리 토큰으로 나누는 24,576 BPE가 작은 모델에서 어떤 차이를 만드는지를 보려는 사람. 어휘 파일은 그 분할을 보여 주고, 태스크별 점수는 보여 주지 않습니다. (3) 거부가 필요하거나 사실 확인이 필요한 제품을 만드는 팀. 카드가 그 용도를 하지 말라고 적습니다. **분석/의견.** 세 번째 팀에게 이 가중치는 부품이 아니라 반례에 가깝습니다. 앞에 필터를 두라는 문장은 카드의 한계 절이 이미 합니다.

**소비자 GPU 사전학습의 비용.** [NVIDIA의 5060 안내](https://www.nvidia.com/en-us/geforce/news/ultimate-guide-to-5060/)는 RTX 5060 Ti를 2025년 4월에 소개하면서 시작 가격 **$379**, 실제 가격은 제조사와 판매처에 따라 다르다고 적고, 8GB 또는 16GB GDDR7, CUDA 코어 4608, 부스트 2.57 GHz를 적습니다. [비교표](https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs)는 같은 코어·클럭에 더해 메모리 버스 128-bit, 대역폭 448 GB/s, TGP 180W, 권장 시스템 전원 600W, Blackwell, PCIe Gen 5를 적습니다. 8GB와 16GB가 한 행에 있고, Sekai-1 카드는 둘 중 어느 쪽인지 적지 않습니다. 계정 overview의 장비 목록만 16GB 한 장을 가리킵니다. **분석/의견.** 보이는 비용은 카드 한 장의 가격입니다. 보이지 않는 비용은 실패한 런, 데이터 준비, 전기, 그리고 코드를 공개하지 않아서 다음 사람이 같은 런을 다시 짜는 시간입니다. 위의 16.4일은 그 전기요금을 계산하는 입력이 아닙니다.

**개발자에게 남는 것.** Apache-2.0은 카드 YAML과 Hub 태그 `license:apache-2.0`에 있습니다. 파일 목록에 `LICENSE` 본문은 없습니다. 허브가 그 태그로 라이선스를 표시하는 방식과, 저장소 안에 라이선스 전문이 없는 상태는 같이 보는 편이 낫습니다. 영어만, 안전 튜닝 없음, 학습 재현에 필요한 배치·정밀도·스크립트 없음. **분석/의견.** 이 릴리스에서 재사용할 수 있는 것은 가중치와, 카드가 글로 적은 구조(23층, 576, GQA 9/3, 숫자 한 자리, 58.5B, decay 약 12B)입니다. “클러스터 없이 연구할 수 있다”는 X의 문장은, 연구가 가중치를 읽는 데 그치면 맞고, 같은 학습을 다시 돌리는 데까지 가면 코드가 빠져 있습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다르거나, 저자 문장 외에 확인할 자료가 없음 / ❌ 1차 자료와 어긋남

| 주장 | 판정 | 근거 |
|---|---|---|
| Sekai-1이 Hugging Face에 공개되어 있다 | ✅ | https://huggingface.co/8BitStudio/Sekai-1 생성 `2026-11-08T00:42:36Z`. 영상 데이터셋 Lixsp11/Sekai와는 다른 저장소 |
| 개인 개발자 계정이 올렸다 | ✅ | overview API: `type=user`, `fullname` Jackson Yeskie, `orgs=[]`. https://huggingface.co/api/users/8BitStudio/overview |
| 95.6M 파라미터 | ✅ | 카드의 95.6M. safetensors `F32` 합과 모양 재합산 모두 **95,581,504** |
| RTX 5060 Ti 한 장으로 처음부터 사전학습 | ⚠️ | 카드 첫 문장이 “trained from scratch on a single RTX 5060 Ti”이다. 프로필 장비는 5060 Ti 16GB 1장이다. 저장소에 학습 스크립트·로그·시간·배치는 없다. 장비 목록은 그 런의 영수증이 아니다. 8GB/16GB는 카드가 적지 않는다 |
| 기존 모델의 LoRA가 아니다 | ✅ | `model.safetensors` 하나, `lm_head` 없음, `adapter_config.json` 없음. 어휘 24,576·층 23·hidden 576은 Qwen3-0.6B(어휘 151,936, 층 28, hidden 1024)와 다르다. 카드는 from scratch라고 적는다 |
| 기존 모델의 증류가 아니다 | ⚠️ | 카드는 “증류가 아니다”라고 적지 않는다. 로짓 증류의 교사 이름도 없다. 동시에 cosmopedia(Mixtral 생성), OpenMathInstruct-2(Llama-3.1-405B-Instruct 생성), ultrachat_200k(ChatGPT 대화의 필터본)가 데이터 목록에 있다. 문장 수준의 합성 데이터와 로짓 증류는 다르고, 카드는 둘 중 어느 쪽도 부정하지 않는다 |
| 거부 응답이 들어 있는 데이터를 학습에서 제외했다 | ⚠️ | 그 문장은 SFT 문단의 “refusals were filtered out of the data”이다. 사전학습 문단에는 없다. 필터, 건수, 샘플이 없다. 같은 X 그림 ①은 “作者の説明。具体的な処理は未確認”이라고 적는다. Limitations는 안전 튜닝과 거부 행동이 없다고 적는다. 이 글은 모델 행동을 측정하지 않았다 |
| Apache 2.0으로 공개 | ✅ | 카드 YAML `license: apache-2.0`, Hub 태그 `license:apache-2.0`. 파일 목록에는 `LICENSE` 전문이 없다 |

**총평:** 저장소, 95,581,504개, Qwen 가중치의 LoRA가 아니라는 점, Apache-2.0 태그는 파일과 카드로 닫힙니다. “5060 Ti 한 장으로 처음부터”는 저자 문장이고 로그가 없습니다. “증류가 아니다”와 “거부 데이터를 학습에서 뺐다”는 카드가 그 범위로 말해 주지 않습니다. 안전에 대해 카드가 말하는 사용 제한은, 거부가 필요한 곳에 쓰지 말라는 것입니다.

## 참고 자료

- 모델 카드·가중치 — [8BitStudio/Sekai-1](https://huggingface.co/8BitStudio/Sekai-1) (API 2026-11-10: F32 95,581,504, 다운로드 290, 좋아요 3, sha `25181118…`)
- 계정 — [8BitStudio overview](https://huggingface.co/api/users/8BitStudio/overview) (Jackson Yeskie, `orgs` 없음, 장비 목록 5060 Ti 16GB ×1). 프로필이 링크한 [github.com/8-bitStudio](https://github.com/8-bitStudio) 공개 저장소 9개, Sekai 학습 저장소 없음 (API 2026-11-10)
- 구조 비교 — [Qwen/Qwen3-0.6B config](https://huggingface.co/Qwen/Qwen3-0.6B/raw/main/config.json)
- 리더보드 그림 — 모델 저장소의 `Leaderboard.png`. 공간은 [AxiomicLabs/Open_SLM_Leaderboard](https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard)
- 같은 구간 — [MinimaLabs/KLM-1.5](https://huggingface.co/MinimaLabs/KLM-1.5), [HuggingFaceTB/SmolLM-135M](https://huggingface.co/HuggingFaceTB/SmolLM-135M), [SmolLM 블로그](https://huggingface.co/blog/smollm), [openai-community/gpt2](https://huggingface.co/openai-community/gpt2), [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)
- 합성 데이터 카드 — [cosmopedia](https://huggingface.co/datasets/HuggingFaceTB/cosmopedia), [OpenMathInstruct-2](https://huggingface.co/datasets/nvidia/OpenMathInstruct-2), [ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
- GPU — [NVIDIA 5060 안내](https://www.nvidia.com/en-us/geforce/news/ultimate-guide-to-5060/) (시작가 $379, 2025-04), [NVIDIA 비교표](https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs) (CUDA 4608, 부스트 2.57 GHz, 8GB/16GB, 448 GB/s, TGP 180W, 759 AI TOPS)
- 이름만 같은 데이터셋 — [Lixsp11/Sekai](https://huggingface.co/datasets/Lixsp11/Sekai)
- 관련 글 — [Heretic 2](/posts/heretic-2-llm-abliteration/)

## 원문 X 링크

- 북마크 — [@rS_alonewolf](https://x.com/rS_alonewolf/status/2119748126387130424) (id `2119748126387130424`, [x.com/i/status/2119748126387130424](https://x.com/i/status/2119748126387130424))
