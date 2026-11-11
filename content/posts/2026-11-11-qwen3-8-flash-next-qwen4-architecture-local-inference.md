---
title: "원본 가중치가 FP8인가? Qwen3.8-Flash-Next 팩트 체크"
date: 2026-11-11
time: "19:19"
slug: qwen3-8-flash-next-qwen4-architecture-local-inference
tags: [Qwen, MoE, 로컬 LLM, vLLM, 팩트체크]
summary: "공식 인덱스의 BF16 합은 359,999,963,128바이트이고, Qwen FP8 저장소는 185,502,232,570바이트의 양자화본이다. 기술 보고서 첫 줄과 GitHub News의 출시일은 2026-08-26이다."
---

> 이 글은 제가 X에서 북마크해 둔 [@QwenAIFans의 포스트](https://x.com/QwenAIFans/status/2120295007676739940)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2120295007676739940](https://x.com/i/status/2120295007676739940)입니다. 이 환경의 X API `get_posts_by_ids`는 `billing-scope-missing`(`developer.billing.write` 없음)으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2120295007676739940)(`code` 200)으로 읽었습니다. `created_at`은 `Tue Nov 10 23:18:17 +0000 2026`, **2026-11-11 08:18 KST**입니다. 표시 이름은 Qwen AI Fans, `screen_name`은 `QwenAIFans`, 사용자 id는 `1817798430007468032`입니다. bio는 “Unofficial fan account. Not affiliated with Alibaba.”입니다. 팔로워 8,367, `verification.type`은 `individual`입니다. 같은 응답의 스냅샷은 답글 2, 리포스트 1, 좋아요 59, 북마크 17, 조회 4,773입니다. 본문은 Mac Studio가 450W 인버터에 꽂혀 있고, Qwen3.8 Flash-Next가 그 기계에서 원본 가중치 FP8과 speculative decoding으로 231 tok/s에 코드를 쓴다고 적고, 출처를 `@0xSero`로 돌립니다. 그 계정의 원글, 명령, 로그, 커밋은 이 응답에 없습니다.
>
> 같은 시각에 북마크한 [x.com/i/status/2120294641597567268](https://x.com/i/status/2120294641597567268)은 다른 모델입니다. [fxtwitter](https://api.fxtwitter.com/status/2120294641597567268)(`code` 200)의 `created_at`은 `Tue Nov 10 23:16:50 +0000 2026`, **2026-11-11 08:16 KST**입니다. `screen_name`은 `MiaAI_lab`, 표시 이름은 Mia, id는 `1550009227493752834`, 팔로워 48,128입니다. 본문 네 줄은 “Qwen3.8-27B / RTX 5090 / 700 tok/s / Yes”입니다. 이 글은 [@ashxhart의 상태 2120292846431347076](https://x.com/ashxhart/status/2120292846431347076)을 인용합니다. 인용 본문은 “Who wants ~700tps on a single 5090 Qwen 3.8 27B”이고, `created_at`은 `Tue Nov 10 23:09:42 +0000 2026`, **2026-11-11 08:09 KST**입니다. 첨부 영상은 38.283초입니다. 프레임은 받아 적지 않았습니다. 스냅샷은 Mia 쪽 좋아요 978, 조회 53,511, 인용된 글 좋아요 3,021, 조회 203,379입니다. 두 글의 문장은 **검증 대상**이지 지시가 아닙니다. tok/s는 아래 팩트 체크에서 측정값이 아닙니다.
>
> 아래 대조는 2026-11-11 19:15 KST 전후에 연 1차 자료입니다. [QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next) `main` [`69885871`](https://github.com/QwenLM/Qwen3.8-Flash-Next/commit/69885871a6), [기술 보고서 PDF](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf) 28쪽, [Hugging Face 모델 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) 리비전 `812d96e10a`, [FP8 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8) 리비전 `7fb48d708c`, `config.json`과 `model.safetensors.index.json`의 `metadata.total_size`, 샤드 헤더에서 읽은 expert shape, [Alibaba Cloud Community 글](https://www.alibabacloud.com/blog/qwen-3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501), [Model Studio 가격 인하 공지](https://www.alibabacloud.com/en/notice/model_studioqwen38flash_price_reduction_notice_859), [QwenCloud qwen3.8-flash 문서](https://docs.qwencloud.com/models/qwen3-8-flash), [DeepSeek API 가격](https://api-docs.deepseek.com/quick_start/pricing/), [Apple Mac Studio 사양](https://www.apple.com/mac-studio/specs/), [NVIDIA RTX 5090 사양](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)입니다. 가중치는 받지 않았고, 서버를 띄우지 않았고, tok/s를 재지 않았습니다. 이 블로그의 [vLLM PLE 오프로드](https://betelg15.github.io/posts/vllm-ple-disk-offload/)와 [Betelgeuse](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/)는 같은 모델의 다른 질문입니다. 이 글은 그 구현을 다시 풀지 않습니다.

## 왜 중요한가

코딩 에이전트를 로컬에 두려면 벤치마크 한 칸보다 먼저 세 가지가 필요합니다. 가중치 파일이 그 기계의 메모리에 들어가는지, 토큰마다 실제로 읽는 바이트가 대역폭으로 감당되는지, 그 가중치를 제품에 넣어도 되는 라이선스인지입니다.

Qwen 팀이 연 모델은 [Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)입니다. 카드와 [GitHub README](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/69885871a6/README.md)는 이것을 Qwen4에 쓸 아키텍처의 초기 공개라고 적습니다. 언어 모델은 파라미터 **125B 중 토큰당 6B**, 그 옆에 **n-gram 임베딩 51B**와 **MTP 4B**입니다. 기술 보고서 초록은 51B 표를 가속기 밖에 둔다고 적습니다. 활성 파라미터가 전체보다 훨씬 작으면, 디코드가 파일 전체가 아니라 그 조각의 메모리 트래픽에 묶입니다. 그래서 랙이 아닌 기계 한 대가 대화에 들어옵니다.

확인할 질문은 다음입니다.

- 출시일이 2026-08-26인지, 2026년 11월 초인지.
- “원본 가중치 FP8”이 공식 체크포인트의 dtype인지.
- 6B 활성, FP8, MTP가 한 기계의 tok/s를 만들 수 있는 산수의 범위가 어디인지.
- 벤치마크와 $0.16 / $0.47이 어느 문서의 숫자인지.

## 기술 설명

### 출시일은 8월 26일이다

기술 보고서 첫 줄의 날짜는 **2026-08-26**입니다. 제목은 “On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability”, 저자는 Qwen Team입니다. README News도 “2026-08-26: We release Qwen3.8-Flash-Next.”입니다. GitHub 첫 커밋 `4f58f4ddd8`의 작성 시각은 `2026-08-26T12:29:38Z`입니다. Hugging Face 첫 커밋 “Upload folder using huggingface_hub”는 `2026-08-26T08:17:26Z`, **2026-08-26 17:17 KST**입니다.

Alibaba Cloud Community 글의 표시 날짜는 **August 27, 2026**입니다. 인용 블록의 `month`는 August, `year`는 2026입니다. Hugging Face `lastModified` `2026-11-07T04:42:40Z`의 메시지는 “Add a response template and generation tags (#81)”입니다. 그 전 커밋 `2026-11-05`는 벤치마크 표의 다크 모드 색입니다. 11월에 바뀐 것은 카드 문구입니다.

2026-11-11 19:15 KST의 GitHub API는 스타 **468**, 포크 **27**, `license` 필드 null, `pushed_at` `2026-08-27T07:31:36Z`입니다. 같은 시각 Hugging Face API는 다운로드 **3,408,896**, 좋아요 **6,911**, `pipeline_tag` `image-text-to-text`, `sha` `812d96e10a0dd82b69d749e68693698cf6c36daa`입니다. 파라미터 합은 BF16 **179,999,981,424**와 I64 35, 총 **179,999,981,459**입니다. 125B + 51B + 4B = 180B와 같은 자릿수입니다.

### 네 층마다 한 번만 희소 어텐션을 한다

`config.json`의 `architectures`는 `Qwen4ExpForConditionalGeneration`, `text_config.model_type`은 `qwen4_exp_text`, `transformers_version`은 `5.8.0.dev0`입니다. `num_hidden_layers`는 **48**, `hidden_size`는 **2560**, `num_experts`는 **512**, `num_experts_per_tok`는 **10**, `shared_expert_intermediate_size`는 **640**입니다. `layer_types` 48칸은 `linear_attention` **36**과 `full_attention` **12**이고, 패턴은 선형 3개 다음 전역 1개입니다. 카드의 문장은 “12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE))”입니다.

보고서 2쪽은 계속 사전학습 시점에 그 전역 층을 **Qwen Sparse Attention(QSA)** 으로 바꾼다고 적습니다. 구현 절은 백본과 MTP의 전역 층을 모두 QSA로 바꿨다고 적습니다. 압축 인덱서는 MQA이고 질의 헤드 **4**, 공유 키 헤드 **1**입니다. 토큰 예산 `K = 2048`, 압축비 `r = 4`이면 질의마다 완전한 마이크로 블록을 최대 **512**개 고릅니다. `config.json`의 `indexer_budget`은 2048, `indexer_compress_ratio`는 4, `indexer_n_heads`는 4, `indexer_kv_heads`는 1입니다. 2048 / 4 = 512입니다. 체크포인트 인덱스에서 `self_attn.indexer`가 있는 층은 전역 층과 MTP입니다. 0번 층 텐서 이름은 `linear_attn.*`입니다.

같은 절이 적는 커널 비교는, 문맥 1M에서 QSA 어텐션 모듈이 프리필 **7.6×**, 디코드 **4.9×**라는 것입니다. 블로그는 프리픽스 캐시 적중 90%인 실험 설정에서 1M 문맥 프리필 처리량이 Qwen3.7-Plus의 **8.6×**라고 적습니다. 이 숫자는 그 문서의 커널·서빙 실험입니다. 이 글의 호스트에서 재지 않았습니다.

Gated Residual은 `hc_count` **4**, `hc_lowrank` **320**입니다. 카드의 “Number of Branches: 4, Bottleneck Rank: 320”과 같습니다. 보고서는 잔차 스트림을 네 갈래로 넓히고 원소 단위 게이트로 읽는다고 적고, 잔차 상태를 FP8로 저장할 수 있다고 적습니다. 그 FP8은 잔차 상태의 저장 형식입니다. 가중치 파일의 dtype과는 다른 문장입니다.

### N-gram 51B는 토큰마다 행렬을 곱하지 않는다

카드는 n-gram 임베딩을 MoE보다 계산이 적고 오프로드에 유리한 파라미터 축이라고 적습니다. `ple_layer_ids`는 `[2]`, `ngram_size`는 **3**, `heads_per_ngram`은 **8**, `ngram_vocab_size_base`는 **20,000,000**, `ple_embed_dim`은 **2560**입니다. 카드의 문장은 “bigrams/trigrams at layer 2”입니다. 가중치 맵에서 `ple` 텐서가 있는 언어 모델 층은 `model.language_model.layers.1` 하나입니다. 0부터 세면 두 번째 블록입니다. n-gram 샤드 파일은 **128**개이고, `split_ngram_parts`도 128입니다.

보고서 초록은 이 51B를 가속기 밖에 두고 호스트 메모리에서 미리 가져온다고 적습니다. 주소가 최근 토큰 id로 정해지므로, 디코드가 51B 전체를 읽지 않습니다. 읽는 것은 이번 토큰의 행입니다. MoE의 “512개 중 10개”와 같은 종류의 절약이 아니라, 룩업 표라는 다른 축입니다. 통합 메모리 기계에서는 호스트와 GPU가 같은 풀을 쓰므로, 표를 가속기 밖으로 빼도 그 바이트가 512GB 풀에서 사라지지는 않습니다. 디스크에서 행만 읽는 경로는 [앞 글](https://betelg15.github.io/posts/vllm-ple-disk-offload/)이 다룹니다.

### 활성 파라미터와 MTP가 속도 이야기의 분자다

0번 층 샤드 헤더의 shape는 이렇습니다. `mlp.experts.gate_up_proj`는 BF16 `[512, 1280, 2560]`, `mlp.experts.down_proj`는 BF16 `[512, 2560, 640]`, `mlp.shared_expert.down_proj.weight`는 BF16 `[2560, 640]`입니다. 1280 = 2 × 640이므로 `gate_up`은 중간 차원 두 장을 붙인 행렬입니다.

층당 routed expert 파라미터는 512 × 1280 × 2560 + 512 × 2560 × 640 = **2,516,582,400**입니다. 48층이면 **120,795,955,200**입니다. 토큰당 10개면 그 10/512인 **2,359,296,000**입니다. 공유 expert의 `gate_proj`와 `up_proj`는 별도 이름이고, 이 글은 그 둘의 shape를 헤더에서 읽지 않았습니다. `down_proj`가 한 expert의 down과 같고 나머지 둘도 같은 크기라면 층당 3 × 2560 × 640 = **4,915,200**, 48층은 **235,929,600**입니다. 그 가정까지 더하면 토큰당 expert 계산은 **2,595,225,600**입니다. 카드의 활성 6B는 이보다 큽니다. 6×10^9에서 이 값을 빼면 **3,404,774,400**이 어텐션, Gated DeltaNet, 임베딩, 노름 쪽에 남습니다. 6B는 카드의 반올림된 활성 규모이고, 방금의 분해는 이 글의 계산입니다.

디코드가 메모리 대역폭에 묶이면, 토큰당 읽는 활성 가중치가 상한을 만듭니다. Apple 사양 각주는 **1GB = 10억 바이트, 1TB = 1조 바이트**입니다. M5 Ultra의 대역폭으로 적힌 **1.2TB/s**를 그 각주대로 1.2×10^12 B/s로 두면 이렇습니다.

- 카드의 6B가 전부 BF16이면 토큰당 1.2×10^10바이트. 1.2×10^12 / 1.2×10^10 = **100 tok/s**.
- 공식 FP8 저장소의 분할을 그대로 쓰면 routed 활성 2,359,296,000은 1바이트, 공유 expert와 나머지 활성은 BF16 2바이트입니다. 합은 **9,640,704,000바이트**. 1.2×10^12 / 9.640704×10^9 = **124.5 tok/s**. 공유 expert 두 행렬의 shape를 확인하지 않은 항이 이 안에 있습니다.

보고서 Table 4는 4스텝 speculative decoding에서 QSA의 평균 MTP 수용 길이를 MT-Bench 3.47, GSM8K 4.20, MATH 4.30, HumanEval 4.26, MBPP 4.13, 평균 **4.07**로 적습니다. 드래프트가 공짜이고 수용 길이가 그 평균이라면 124.5 × 4.07 = **507 tok/s**까지 스케치가 올라갑니다. MTP 층은 expert와 QSA를 다시 가지므로 드래프트는 공짜가 아닙니다. 507은 타깃 패스만 본 상한입니다. 커뮤니티 글의 231은 이 상한 아래, 스펙큘레이션 없는 124.5보다는 위에 있습니다. 그 위치는 “대역폭 산수가 그 수를 바로 기각하지는 않는다”는 뜻이지, 그 기계에서 그 수가 나왔다는 뜻이 아닙니다.

`max_position_embeddings`는 **262144**이고 `rope_parameters.rope_type`은 `default`입니다. 1,000,000은 카드가 YaRN으로 켜라고 적은 확장입니다. MTP는 `mtp_num_hidden_layers` **1**이고, 그 층의 텐서에는 `self_attn.indexer`가 있습니다.

### 파일이 어느 메모리에 들어가는지

공식 BF16 인덱스의 `metadata.total_size`는 **359,999,963,128**바이트입니다. 179,999,981,424 × 2 = 359,999,962,848이고, 차이는 280바이트입니다. 저장 dtype은 파라미터당 2바이트입니다.

공식 [Qwen/Qwen3.8-Flash-Next-FP8](https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8)의 카드 첫 문장은 FP8로 양자화한 가중치라고 적고, 방법은 블록 128의 fine-grained fp8이며 지표는 원본과 거의 같다고 적습니다. `base_model`은 `Qwen/Qwen3.8-Flash-Next`이고 태그에 `base_model:quantized`가 있습니다. safetensors 파라미터는 F8_E4M3 **174,512,783,360**, BF16 **5,487,198,064**, I64 35입니다. 인덱스의 `total_size`는 **185,502,232,570**바이트입니다. 2026-11-11 19:15 KST의 다운로드는 **142,578**, 좋아요는 **304**입니다. `quantization_config.modules_to_not_convert`에는 어텐션 투영, Gated DeltaNet 투영, 공유 expert, 비전 블록이 들어 있고, routed expert 이름 `mlp.experts.down_proj`와 `gate_up_proj`는 그 목록에 없습니다. `modules_to_convert`는 `ple.ple_embedding.ngram_embedding`입니다. 큰 FP8 덩어리는 n-gram 표만이 아닙니다.

Apple이 2026-11-11에 적은 Mac Studio 구성은 이렇습니다. M5 Max 통합 메모리는 36GB이고, 40코어 GPU 구성에서 48, 64, 128GB까지입니다. M5 Ultra는 96GB이고, 36코어 CPU·80코어 GPU 구성에서 **256GB 또는 512GB**입니다. 각주대로 512GB는 5.12×10^11바이트, 256GB는 2.56×10^11바이트, 128GB는 1.28×10^11바이트입니다. 최대 연속 전력은 **480W**입니다. 대역폭은 M5 Ultra **1.2TB/s**, M5 Max 기본 **460GB/s**, 40코어 GPU 구성 **614GB/s**입니다.

| 파일 | 바이트 | 128GB (1.28×10^11) | 256GB (2.56×10^11) | 512GB (5.12×10^11) | RTX 5090에 적힌 32GB |
|---|---:|---|---|---|---|
| 공식 BF16 `total_size` | 359,999,963,128 | 초과 2.32×10^11 | 초과 1.04×10^11 | 남음 1.520×10^11 | 초과 |
| 공식 FP8 `total_size` | 185,502,232,570 | 초과 5.75×10^10 | 남음 7.05×10^10 | 남음 3.265×10^11 | 초과 |

남는 바이트는 운영체제, KV 캐시, 활성화가 같이 씁니다. 512GB 칸의 1.520×10^11바이트는 BF16 파일 다음의 여유이고, 256GB 칸은 BF16 파일을 올리지 못합니다. FP8 파일은 256GB와 512GB 칸에 들어가고 128GB 칸에는 들어가지 않습니다. NVIDIA 페이지의 GeForce RTX 5090은 **32 GB GDDR7**, 메모리 대역폭 **1792 GB/sec**, 총 그래픽 전력 **575 W**입니다. 185.5×10^9바이트는 32×10^9보다 크고, 32×2^30 = 34,359,738,368보다도 큽니다. README의 vLLM·SGLang 예는 `--tensor-parallel-size 4`와 `--tp-size 4`입니다. 그 예는 GPU 네 장을 전제로 한 명령입니다.

[Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)는 다른 모델입니다. API의 BF16 파라미터는 **27,781,427,952**이고, 2를 곱하면 **55,562,855,904**바이트입니다. `config.json`의 dtype은 `bfloat16`, expert 필드는 없고, 라이선스 카드는 `apache-2.0`입니다. 55.6×10^9바이트는 32GB로 적힌 카드에 들어가지 않습니다. 700 tok/s를 전 가중치 FP8 한 번 읽기로 환산하면, 1792×10^9 B/s / 27.781×10^9바이트 = **64.5 tok/s**가 한 토큰 상한이고 700은 그 상한의 **10.8배**입니다. NVIDIA 페이지는 GB의 밑을 각주로 정의하지 않습니다. 1792×2^30으로 읽어도 배수는 한 자릿수 10배 근처에 남습니다. 인용 글은 양자화, 명령, 수용 길이를 적지 않습니다.

### 문서에 있는 서빙 명령

README `69885871`의 vLLM 예는 이 한 줄입니다. 플래그는 그 파일에 있는 것만 적습니다.

```bash
vllm serve Qwen/Qwen3.8-Flash-Next --port 8000 --tensor-parallel-size 4 --max-model-len 262144 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
```

같은 절의 SGLang 예는 `sglang serve --model-path Qwen/Qwen3.8-Flash-Next --port 8000 --tp-size 4 --context-length 262144 --reasoning-parser qwen3 --tool-call-parser qwen3_coder`입니다. Apple Silicon 절은 `mlx-vlm`이 비전과 텍스트를 지원하고 원본 체크포인트를 변환할 수 있다고 적습니다. 그 절에는 실행 플래그가 없어서 이 글은 명령을 만들지 않았습니다.

모델 카드의 텍스트 호출은 로컬 OpenAI 호환 서버를 가정합니다. 환경 변수는 `OPENAI_BASE_URL`과 `OPENAI_API_KEY`입니다.

```python
from openai import OpenAI

client = OpenAI()
completion = client.chat.completions.create(
    model="Qwen/Qwen3.8-Flash-Next",
    messages=[
        {"role": "user", "content": "Write a Python function to merge two sorted linked lists."},
    ],
    extra_body={
        "chat_template_kwargs": {
            "enable_thinking": True,
            "preserve_thinking": True,
        },
    },
    reasoning_effort="xhigh",
    stream=True,
    stream_options={"include_usage": True},
)
```

카드는 생각 모드의 샘플링을 `temperature=1.0`, `top_p=0.95`, `top_k=20`으로 적고, 1M을 넘길 때의 YaRN은 `rope_type`을 `yarn`, `factor`를 4.0, `original_max_position_embeddings`를 262144로 두는 `--hf-overrides`와 `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--max-model-len 1000000`을 적습니다. 기본 서빙 예의 문맥은 262144입니다.

## 비즈니스 인사이트

숫자 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다.

**프로덕션 API의 이름은 가중치 이름과 다릅니다.** 블로그는 1M 문맥과 공식 도구가 붙은 프로덕션 버전을 QwenCloud의 **Qwen3.8-Flash**로 제공하고, 가격을 입력 100만 토큰당 **0.16 USD**, 출력 **0.47 USD**로 적습니다. [가격 인하 공지](https://www.alibabacloud.com/en/notice/model_studioqwen38flash_price_reduction_notice_859)는 2026-08-27 12:00 UTC+8부터 입력 단가를 **$0.16에서 $0.15**로 내린다고 적습니다. 출력 행은 그 표에 없습니다. 2026-11-11에 읽은 [QwenCloud 문서](https://docs.qwencloud.com/models/qwen3-8-flash)의 International 표는 입력 **0.15**, 출력 **0.47**, 암시 캐시 입력 **0.016**, 명시 캐시 생성 **0.2**, 명시 캐시 읽기 **0.016** USD, 단위는 100만 토큰입니다. 문맥 창은 **1,000,000**, 생각 모드의 최대 체인 오브 소트는 **262,144**, 최대 출력은 **131,072**입니다. 같은 추출본에는 입력 0.113, 출력 0.382인 두 번째 표가 스코프 제목 없이 반복됩니다. 그 표는 어느 리전의 정가인지 문장으로 확인하지 못해, 이 글의 비교에는 넣지 않습니다.

[DeepSeek API 문서](https://api-docs.deepseek.com/quick_start/pricing/)를 같은 날 읽었습니다. 모델 이름은 `deepseek-flash`, 버전은 DeepSeek-V4.1-Flash-1017, 문맥은 1M입니다. 캐시 미스 입력은 오프피크 **$0.15**, 피크 **$0.30**, 출력은 오프피크 **$0.60**, 피크 **$1.20**, 캐시 히트 입력은 오프피크 **$0.003**, 피크 **$0.006**입니다. 단위는 100만 토큰입니다. 피크는 월–금 01:00–04:00과 06:00–10:00 UTC이고, 중국 공휴일과 주말은 오프피크입니다. 각주는 옛 이름 `deepseek-v4-flash` 요청이 이 버전으로 처리된다고 적습니다. 모델 카드의 비교 열 “DeepSeek-V4-Flash-0731”은 그 각주의 퇴역 이름과 날짜가 다릅니다. 벤치마크 열과 오늘 청구되는 모델을 같은 가중치로 두지 않습니다.

100만 입력 토큰과 20만 출력 토큰을 각 단가에 곱하면, QwenCloud International은 0.15 + 0.2 × 0.47 = **$0.244**입니다. DeepSeek 오프피크 캐시 미스는 0.15 + 0.2 × 0.60 = **$0.270**, 피크 캐시 미스는 0.30 + 0.2 × 1.20 = **$0.540**입니다. 이 곱은 청구서의 예시이지 할인, 캐시 적중, 재시도를 포함한 측정이 아닙니다.

**학습 비용 1/9은 FLOP 비율입니다.** 보고서 Table 11 아래 문장은 Qwen3.7-Plus-Base 대비 활성 파라미터 약 1/3, 학습 토큰 약 1/3, 학습 FLOP 약 1/9입니다. 블로그의 “training takes only about 1/9 as much”는 그 FLOP 문장과 같이 읽을 숫자입니다. 달러 영수증은 보고서에 없습니다. 베이스 모델 표에서 Flash-Next-Base는 14개 중 8개에서 Qwen3.7-Plus-Base보다 높고, 나머지는 최대 2.6점 아래라고 초록이 적습니다. 카드의 DeepSWE 1.1 **58.7**, SWE-bench Pro **62.5**는 사후학습 모델의 자체 표입니다. 각주는 DeepSWE를 두 하네스 중 높은 점수로 적고, SWE-bench Pro는 문제 과제를 고친 뒤 베이스라인을 다시 쟀다고 적습니다. Claude-Opus-4.6 (Max)의 SWE-bench Pro 53.4만 공식 공개 점수라고 각주가 구분합니다.

**라이선스는 Apache-2.0이 아닙니다.** Hugging Face `license_name`은 `qwen-community-1.0`입니다. [LICENSE](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)는 사용, 수정, 배포, 파인튜닝, 파생물을 허용하고 두 조건을 붙입니다. 월간 활성 사용자 1억 또는 월 매출 2,000만 달러를 넘는 상업 제품은 모델 이름을 사용자 인터페이스에 표시해야 합니다. Model as a Service이거나, 코딩·사무 생산성이 주 목적인 독립 AI 제품(문서가 예로 드는 Qoder, QwenWork)을 사업으로 하면 상업적 사용 전에 Qwen의 별도 라이선스가 필요합니다. 제3자에게 모델과 출력과 능력을 열지 않는 내부 사용은 그 요건에서 빠집니다. Qwen3.8-27B 카드의 라이선스는 `apache-2.0`입니다. 같은 세대의 27B와 Flash-Next를 한 라이선스로 묶으면 카드와 어긋납니다.

**분석/의견.** 이득을 보는 쪽은 코드를 밖으로 보내지 않는 내부 에이전트와, 256GB 이상 통합 메모리나 GPU 여러 장으로 파일을 올릴 수 있는 팀입니다. API로 충분한 쪽은 QwenCloud의 1M 기본 문맥과 도구를 토큰 단가로 사는 쪽입니다. 제약이 큰 쪽은 코딩 어시스턴트를 제품으로 파는 조직과, 32GB 카드 한 장에 공식 파일을 올리려는 쪽입니다. 공식 BF16과 공식 FP8 파일은 그 카드에 들어가지 않습니다. 커뮤니티 GGUF로 줄인 배포는 다른 파일이고, 3060에서 그 파일을 읽는 경로는 [Betelgeuse 글](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/)에 있습니다.

**분석/의견.** 로컬의 비용은 토큰 단가가 아니라 메모리와 전력과 실패 시간입니다. M5 Ultra 열의 시작 가격으로 사양 표가 적는 숫자는 **$5,499**이고, 그 열의 기본 메모리는 96GB입니다. 256GB와 512GB는 주문 구성으로만 적혀 있고, 이 글은 그 구성의 결제 가격을 열지 않았습니다. 최대 연속 전력 480W는 450W 인버터가 그 상한을 덮는다는 문장과 맞지 않습니다. 실제 소비 전력 곡선은 사양 표에 없습니다. API $0.244의 예시는 하드웨어를 이미 가진 사람에게는 비싸고, 파일을 올릴 메모리가 없는 사람에게는 유일한 공식 경로입니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다르거나, 확인한 자료가 그 문장까지 가지 않음 / ❌ 1차 자료와 어긋남

원본은 [@QwenAIFans, 2026-11-11 08:18 KST](https://x.com/i/status/2120295007676739940)와 [@MiaAI_lab, 2026-11-11 08:16 KST](https://x.com/i/status/2120294641597567268)입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 2026-08-26에 공개됐다 | ✅ | 기술 보고서 첫 줄, README News, HF 업로드 `2026-08-26T08:17:26Z`. Community 글의 표시 날짜는 August 27, 2026입니다. |
| 2026년 11월 초에 출시됐다 | ❌ | HF `2026-11-05`와 `2026-11-07` 커밋 메시지는 표 색과 응답 템플릿입니다. `pushed_at`은 `2026-08-27T07:31:36Z`입니다. |
| Qwen4 아키텍처의 오픈 웨이트 프리뷰다 | ✅ | README와 카드가 “early preview”와 “experimental preview of the architecture that will underpin Qwen4”라고 적습니다. 출시된 Qwen4 가중치라는 문장은 없습니다. |
| 멀티모달 MoE다 | ✅ | `pipeline_tag`는 `image-text-to-text`, 비전 `depth` 27, expert 512, 토큰당 routed 10과 공유 1. |
| 125B 중 활성 6B, n-gram 51B, MTP 4B | ✅ | 모델 카드와 보고서 초록. HF 파라미터 합 179,999,981,459. |
| Gated DeltaNet과 QSA를 섞고, QSA는 마이크로 블록 단위다 | ✅ | 층 패턴 36+12, 보고서의 `r = 4`, `K = 2048`, 블록 512. 인덱스에 `linear_attn`과 `self_attn.indexer`가 있습니다. |
| Gated Residual은 4갈래, 병목 320이다 | ✅ | `hc_count` 4, `hc_lowrank` 320. 카드의 Branches 4, Bottleneck Rank 320. |
| N-gram은 MoE와 다른 스케일 축이고 앞쪽에 하나가 있다 | ✅ | 카드·블로그·보고서. `ple` 가중치는 `layers.1`에만 있고 `ple_layer_ids`는 `[2]`입니다. |
| Muon을 쓰고 배치 웜업을 뺐다 | ✅ | 보고서와 블로그. 블로그는 웜업이 옵티마이저 스텝을 18.8% 더 쓴다고 적습니다. 체크포인트 dtype과는 별개입니다. |
| 기본 문맥 262,144, YaRN으로 1,000,000 | ✅ | `max_position_embeddings` 262144, `rope_type` `default`. 1M은 카드의 YaRN 설정입니다. |
| Qwen3.7-Plus 대비 학습 비용이 약 1/9이다 | ⚠️ | 보고서의 단위는 학습 FLOP이고, 활성 파라미터와 학습 토큰은 약 1/3입니다. 비용 영수증은 없습니다. |
| DeepSWE 1.1 58.7, SWE-bench Pro 62.5 | ⚠️ | 카드 표에 있는 자체 점수입니다. 각주는 두 하네스 중 최댓값, 그리고 과제를 고친 뒤의 재측정이라고 적습니다. 이 글은 재실행하지 않았습니다. |
| QwenCloud Qwen3.8-Flash가 입력 $0.16, 출력 $0.47이다 | ⚠️ | 블로그는 그 가격을 적습니다. 2026-08-27 공지는 입력을 $0.15로 내립니다. 2026-11-11 International 문서의 입력은 $0.15, 출력은 $0.47입니다. |
| vLLM과 SGLang으로 서빙할 수 있다 | ✅ | README `69885871`에 두 명령이 있습니다. 예는 텐서 병렬 4입니다. 이 글은 실행하지 않았습니다. |
| Mac Studio, 450W 인버터, 원본 FP8, speculative decoding, 231 tok/s | ⚠️ | 팬 계정이 `@0xSero`에 돌린 문장입니다. 명령·로그·커밋이 없고 이 글은 재지 않았습니다. Apple의 최대 연속 전력은 480W입니다. |
| 공식 원본 가중치가 FP8이다 | ❌ | 원본 카드의 `dtype`은 `bfloat16`이고 인덱스 `total_size`는 359,999,963,128바이트입니다. FP8 저장소는 양자화본이라고 적고 `total_size`는 185,502,232,570바이트이며, 그중 5,487,198,064 파라미터는 BF16으로 남습니다. |
| Qwen3.8-27B가 RTX 5090 한 장에서 700 tok/s다 | ⚠️ | Mia 글과 그가 인용한 Ash Hart 글의 문장입니다. 재현 절차가 없습니다. 공식 27B는 BF16 55,562,855,904바이트라 32GB로 적힌 카드에 들어가지 않습니다. Flash-Next의 측정이 아닙니다. |

**총평:** Qwen3.8-Flash-Next는 2026-08-26에 열린 오픈 웨이트 멀티모달 MoE이고, 카드가 적는 구조는 125B 중 활성 6B, n-gram 51B, MTP 4B, 48층, expert 512 중 10+1, 기본 문맥 262,144입니다. 공식 원본 파일은 BF16 359,999,963,128바이트이고 Apple 각주대로의 512GB(5.12×10^11바이트)에 들어가며 256GB에는 들어가지 않습니다. 공식 FP8 파일은 185,502,232,570바이트의 양자화본이고 256GB 칸에 들어갑니다. 231 tok/s와 700 tok/s는 커뮤니티 글의 숫자로 남습니다. 국제 리전 입력 단가는 공지의 $0.15이고, 블로그의 $0.16은 그 전 가격입니다.

## 참고 자료

- 가중치 — [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) `812d96e10a` (2026-11-07 카드 수정, 업로드는 2026-08-26). API 2026-11-11 19:15 KST: 다운로드 3,408,896, 좋아요 6,911, BF16 파라미터 179,999,981,424
- FP8 양자화 — [Qwen/Qwen3.8-Flash-Next-FP8](https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8) `7fb48d708c`. F8_E4M3 174,512,783,360, BF16 5,487,198,064, `total_size` 185,502,232,570. 다운로드 142,578, 좋아요 304
- 27B — [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B). BF16 27,781,427,952, 라이선스 apache-2.0, 생성 `2026-08-05T08:22:59Z`
- 저장소 — [QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next) [`69885871`](https://github.com/QwenLM/Qwen3.8-Flash-Next/commit/69885871a6). API 2026-11-11 19:15 KST (`Date: Wed, 11 Nov 2026 10:15:49 GMT`): 스타 468, 포크 27
- 기술 보고서 — [tech_report.pdf](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf), 첫 줄 2026-08-26. Table 4 평균 수용 길이 4.07, Table 11, 1M에서 7.6×와 4.9×
- 블로그 — [Alibaba Cloud Community, August 27, 2026](https://www.alibabacloud.com/blog/qwen-3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501). 인용 URL로 README가 적는 [qwen.ai/blog?id=qwen3.8-flash-next](https://qwen.ai/blog?id=qwen3.8-flash-next)는 이 환경에서 본문이 서버 HTML에 없었습니다
- 가격 — [QwenCloud qwen3.8-flash](https://docs.qwencloud.com/models/qwen3-8-flash) (2026-11-11, International 입력 0.15, 출력 0.47). [입력 $0.16 → $0.15 공지](https://www.alibabacloud.com/en/notice/model_studioqwen38flash_price_reduction_notice_859) (2026-08-27 12:00 UTC+8). [DeepSeek 가격](https://api-docs.deepseek.com/quick_start/pricing/)
- 라이선스 — [Qwen Community License 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)
- 하드웨어 — [Mac Studio 사양](https://www.apple.com/mac-studio/specs/) (512GB는 36코어·80코어 M5 Ultra 구성, 1.2TB/s, 최대 연속 전력 480W, 1GB = 10억 바이트). [GeForce RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/) (32 GB GDDR7, 1792 GB/sec, TGP 575 W)
- 같은 모델의 다른 글 — [vLLM PLE 디스크 오프로드](https://betelg15.github.io/posts/vllm-ple-disk-offload/), [Betelgeuse](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/)
- X — [QwenAIFans 2120295007676739940](https://x.com/i/status/2120295007676739940), [MiaAI_lab 2120294641597567268](https://x.com/i/status/2120294641597567268), 인용 [ashxhart 2120292846431347076](https://x.com/ashxhart/status/2120292846431347076). fxtwitter로 읽음. X API는 `billing-scope-missing`
