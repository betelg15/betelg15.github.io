---
title: "744B MoE가 RAM 9.9GB에 상주하나? colibri"
date: 2026-11-05
time: "21:23"
slug: colibri-ssd-streaming-moe-inference
tags: [colibri, MoE, SSD, 추론, 팩트체크]
summary: "colibri main 0a5504a1의 9.9GB는 GLM-5.2 int4 dense 상주분이다. 같은 기준 표의 채팅 피크 RSS는 약 20GB이고, 콜드 토큰은 디스크에서 약 11GB를 읽는다."
---

> 이 글은 [@nagi_aiwatch의 포스트](https://x.com/nagi_aiwatch/status/2117960761494610034)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117960761494610034](https://x.com/i/status/2117960761494610034)입니다. fxtwitter가 돌려준 `created_at`은 `Wed Nov 04 12:42:50 +0000 2026`, 2026-11-04 21:42 KST입니다. `screen_name`은 `nagi_aiwatch`이고 표시 이름은 "ナギ｜海外AIウォッチ"입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117960761494610034)(`code` 200)으로 읽었습니다. 그 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 2026-11-05에 읽은 [JustVugg/colibri](https://github.com/JustVugg/colibri) main `0a5504a1dc64f86fcd0fe7db298b0448c730e7e6`(2026-10-31T21:29:12Z)의 README·`docs/benchmarks.md`·`docs/mistral-large4.md`·`docs/tuning.md`·`c/colibri.c`·`c/st.h`·`c/setup_catalog.py`·`START-HERE.bat`, 릴리스 [v2.1.0](https://github.com/JustVugg/colibri/releases/tag/v2.1.0), [zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) `cf457fa7`의 `config.json`과 모델 카드, [mistralai/Mistral-Large-4-1T-A52B](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B) `af26e786`의 카드와 `text_config`, 그리고 같은 날 llama.cpp master `da3416d807`의 [CLI README](https://github.com/ggml-org/llama.cpp/blob/da3416d8077c55d68e45ce15babd999ac7ba1c49/tools/cli/README.md)입니다. 이 글은 엔진을 빌드하거나 가중치를 받지 않았고, tok/s와 RSS를 다시 재지 않았습니다.

## 왜 이 엔진이 로컬 서빙에 닿는가

포스트는 7440억 파라미터 모델을 메모리 상주 9.9GB로 돌리는 C 엔진이 있고, 자주 쓰는 부분만 RAM에 두며 나머지는 SSD에서 읽고, GPU가 없어도 되며, 10월 31일 업데이트로 약 1조 파라미터 Mistral-Large-4를 돌리고, Windows는 bat 파일을 더블클릭하면 시작된다고 적습니다.

저장소는 있습니다. GitHub 전체 이름은 `JustVugg/colibri`, 기본 브랜치는 `main`, 생성 시각은 2026-07-01T12:27:49Z, 포크는 아닙니다. 라이선스 SPDX는 Apache-2.0입니다. 같은 날 API의 `stargazers_count`는 **47954**, `forks_count`는 **5573**, `language`는 C입니다. 설명 문장은 "hot experts on the GPU (CUDA, Vulkan), warm ones in RAM, cold ones streamed from NVMe"입니다. main의 끝 커밋은 2026-10-31이고, API의 `pushed_at`은 2026-11-05T10:46:06Z입니다. 이 글이 읽은 트리의 SHA는 `0a5504a1`입니다.

개발자에게 닿는 지점은 "744B가 9.9GB RAM에 들어간다"가 아닙니다. README가 GLM-5.2에 적어 둔 문장은, 파라미터가 744B이고 토큰마다 약 40B를 쓰며, 그 가운데 토큰마다 바뀌는 라우팅 expert가 약 11GB라는 것입니다. 항상 RAM에 남는 것은 attention, shared expert, embedding 같은 dense 부분입니다. 라우팅 expert는 디스크에 있고, 라우터가 고를 때 읽습니다. 배치가 속도를 바꾸고, 라우터의 선택과 가중치의 정밀도를 바꾸지 않는 것이 README가 적은 설계 목표입니다.

이 블로그에서 이미 적은 이웃은 세 갈래입니다. [FreeToken](https://betelg15.github.io/posts/freetoken-consumer-gpu-giant-models/)은 expert 풀의 기준 사본을 호스트 RAM에 두고, NVMe는 기동에 씁니다. [Betelgeuse](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/)는 68GB Qwen expert를 NVMe에서 RTX 3060의 VRAM 슬롯으로 가져옵니다. [vLLM의 `disk_offload`](https://betelg15.github.io/posts/vllm-ple-disk-offload/)는 MoE expert가 아니라 Qwen의 51B n-gram 표에서 행만 읽습니다. colibri가 자기 README에서 같은 문장으로 묶는 것은, 큰 MoE의 라우팅 expert를 디스크에 두고 토큰이 고른 것만 가져온다는 쪽입니다.

## 한 토큰이 만지는 가중치

[zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2/blob/cf457fa734ab149ffef225f80893eb38c6ff5cdc/config.json) `cf457fa7`의 `config.json`은 `model_type`이 `glm_moe_dsa`입니다. 층은 **78**, `first_k_dense_replace`는 **3**, 라우팅 expert는 **256**, 토큰당 **8**, shared expert는 **1**, hidden은 **6144**, MoE intermediate는 **2048**, dense MLP intermediate는 **12288**입니다. 어휘는 **154880**, `kv_lora_rank`는 **512**, `qk_rope_head_dim`은 **64**, `num_nextn_predict_layers`는 **1**입니다. 78에서 앞 3개 dense 층을 빼면 MoE 층은 **75**입니다. `docs/benchmarks.md`의 콜드 비용이 "75 layers × 8 experts"인 것과 층 수가 맞습니다.

같은 카드의 README를 2026-11-05에 읽었을 때, 본문에 **744B**나 **40B**라는 파라미터 총량은 없었습니다. 744B와 "토큰당 약 40B"는 colibri README·카탈로그·벤치 문서의 말입니다. 카드가 적는 것은 1M 컨텍스트, IndexShare, MTP, MIT 라이선스, 그리고 [Z.ai API](https://docs.z.ai/guides/llm/glm-5.2)입니다. 이 글은 config의 차원으로 744B를 다시 합산하지 않았습니다.

README의 기준 모델 표는 이렇습니다. `--model glm-5.2`의 다운로드는 **429GB**, RAM은 **16 / 24GB**입니다. 표의 규칙상 첫 숫자 아래에서는 시작하지 않고, 둘째 숫자부터 측정된 대로 돕니다. `c/setup_catalog.py`의 같은 항목은 `disk_gb=429.3`, `ram_min_gb=16`, `ram_good_gb=24`, `dense_gb=9.9`이고, 저장소는 [`mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp`](https://huggingface.co/mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp)입니다. README는 더 오래된 per-row int4 미러를 쓰지 말라고 적습니다. 품질이 약 9점 낮고, [#455](https://github.com/JustVugg/colibri/issues/455)의 루프 답변이 그 형식이었다고 적습니다.

`docs/benchmarks.md` 맨 위 기준 표는 "원래 개발 박스"입니다. WSL2, 12코어, **25GB RAM**, NVMe는 VHDX를 탑니다. 그 표의 디스크 위 모델은 **약 370GB**입니다. 카탈로그의 429GB와 같은 파일이라고 그 표가 적지는 않습니다. 같은 표가 9.9GB를 붙이는 칸의 이름은 `resident RAM (dense, int4)`입니다.

| 기준 표의 칸 (`docs/benchmarks.md`) | 값 |
| --- | --- |
| 디스크 위 int4 컨테이너 | 약 370GB |
| resident RAM (dense, int4) | 9.9GB |
| 로드 시간 | 약 30초 |
| 채팅 중 피크 RSS | 약 20GB (auto-capped) |
| 콜드 디코드 | 약 11GB 디스크 읽기/토큰 (75층 × 8 expert) |
| 그 박스의 디스크 천장 | 약 1GB/s → 콜드 0.05–0.1 tok/s |

README 맨 위의 샘플 화면은 `colibri v2.1.0 · GLM-5.2 · 744B MoE · int4 · streaming CPU` 다음에 `ready in 32s · resident 9.9 GB`를 찍습니다. 32초는 그 샘플의 숫자이고, 측정 표가 로드 시간으로 적는 것은 약 30초입니다. 이 글은 그 로그를 다시 받지 않았습니다.

9.9가 문서 안에서 가리키는 자리는 세 군데입니다. dense 상주 9.9GB, 통합 GPU에서 Qwen3.6-35B-A3B 디코드 **9.9 tok/s**, i9-12900K 행의 **약 9.9GB read/token**입니다. 셋은 같은 양이 아닙니다.

콜드 토큰의 바이트를 다른 실험 로그가 한 번 더 적습니다. [4×A6000 로그](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/docs/experiments/glm52-4xa6000-2026-08-02.md)의 식은 `8 experts × 20.1 MB × 75 layers = 12.1 GB`입니다. 기준 표의 약 11GB와 이 12.1GB는 같은 75×8을 가리키고, 바이트가 한 칸으로 잠겨 있지는 않습니다. 이 글은 컨테이너를 열어 다시 재지 않았습니다.

## 라우터, 캐시, 그리고 pread

한 층의 forward는 라우터가 expert id를 고르고, 배치 안의 고른 id를 합치고, 이미 RAM이나 VRAM에 있는 것은 그 자리에서 계산하고, 없는 것은 디스크에서 슬롯으로 읽습니다. `c/colibri.c`의 캐시 필드는 층마다 있는 LRU `ecache`와, 대화에서 배운 hot set인 `pin_slot_by_expert`입니다. 사용 기록은 `.coli_usage`이고, README는 턴마다 갱신된다고 적습니다.

[zai-org config](https://huggingface.co/zai-org/GLM-5.2/blob/cf457fa734ab149ffef225f80893eb38c6ff5cdc/config.json)의 `num_experts_per_tok`은 8입니다. 디코드 한 토큰이 75개 MoE 층에서 새로 고르는 routed expert는 75×8입니다. 배치가 같은 expert를 다시 고르면 합집합이라 파일은 한 번 읽습니다. 기본 경로는 고른 expert를 빼지 않습니다. `EXPERT_BUDGET`와 `DEGRADE_ZERO`는 켜야만 미스 쪽을 덜어 내고, 주석은 그 덜어 내기가 프리필의 KV를 망가뜨리므로 디코드(S≤4)에만 둔다고 적습니다. README의 문장과 같습니다. 느려져도 모델을 조용히 다시 정의하지 않는 쪽이 기본값입니다.

디스크 읽기는 mmap이 아닙니다. `c/st.h` 머리 주석은 `pread`와 `posix_fadvise(DONTNEED)`로 페이지를 프로세스에 남기지 않아, 피크 RAM이 모델 전체가 아니라 dense와 캐시가 되게 한다고 적습니다. expert 하나의 행렬 세 개(`gate_proj`, `up_proj`, `down_proj`)가 같은 샤드에 붙어 있으면 한 번의 `pread`로 읽습니다. 스케일 `.qs`는 그 다음의 작은 읽기입니다.

```c
/* c/colibri.c expert_load_impl, main 0a5504a1. 이어진 세 행렬만 남긴 축약.
 * O_DIRECT가 need 바이트 이상을 받으면 done=1이라 아래 버퍼된 pread는 타지 않는다.
 * 원문의 실패 분기는 fatal이면 exit(1)이다. */
int contig = tw[ord[0]]->fd==tw[ord[1]]->fd && tw[ord[1]]->fd==tw[ord[2]]->fd
          && tw[ord[0]]->off+tw[ord[0]]->nbytes==tw[ord[1]]->off
          && tw[ord[1]]->off+tw[ord[1]]->nbytes==tw[ord[2]]->off;
if(contig){
    int64_t off0=tw[ord[0]]->off;
    int dfd = g_direct ? st_direct_fd_rep(&m->S, tw[ord[0]]->fd, rep) : -1;
    if(dfd>=0){
        int64_t base=off0 & ~4095LL, need=(off0-base)+wtot;
        int64_t len=(need+4095)&~4095LL;
        ssize_t r=(ssize_t)mir_pread_striped(&m->S,tw[ord[0]]->fd,rep,(char*)s->slab,len,base);
        if(r<need) r=pread(dfd, s->slab, len, base);
        if(r>=need) done=1;
    }
    if(!done && mir_pread(&m->S, tw[ord[0]]->fd, rep, s->slab, wtot, off0, "pread expert"))
        return -1;
}
```

`DIRECT=1`은 README가 "빠른 NVMe에서는 큰 이득인 경우가 많고, 다른 드라이브에서는 같거나 더 나쁘다"고 적은 스위치입니다. 재어 보고 켜라고 `docs/tuning.md`가 적습니다. Windows의 MinGW 경로는 다른 행이 적습니다. i5-12600K 네이티브 Windows 11 행은 "buffered (no O_DIRECT on MinGW)"입니다. bat로 시작한다고 Linux의 `DIRECT=1`과 같은 읽기가 열린다는 문장은 그 행에 없습니다.

캐시가 비어 있으면 토큰마다 약 11GB가 디스크에서 옵니다. 처리량의 산술은 그 바이트를 드라이브가 공급하는 속도로 나누는 쪽에 가깝습니다. 기준 박스의 약 1GB/s는 0.05–0.1 tok/s로 적혀 있고, 본문은 이 숫자를 추정이 아니라 측정된 바닥이라고 적습니다. 같은 문서의 뒤 표는 "추정이지 측정이 아니다"라고 적힌 다른 칸입니다. PCIe4 NVMe 32GB에서 0.5–1 tok/s, PCIe5나 NVMe 두 개와 64GB에서 2–4 tok/s 같은 줄이 그 칸입니다.

히트가 올라가면 디스크에서 빠지는 바이트가 줄어듭니다. 같은 기계에서 디스크만 바꾼 [#31](https://github.com/JustVugg/colibri/issues/31)은 그 경계를 적습니다. Ryzen 9 9950X, 123GB RAM에서 Crucial P3의 버퍼 읽기 1.51GB/s는 0.10 tok/s, 프로파일의 66%가 디스크였습니다. 모델을 Samsung 9100 PRO로 옮긴 뒤 O_DIRECT **8.81GB/s**는 **0.28 tok/s**였고, 프로파일은 디스크 32%, matmul 57%로 뒤집혔습니다. 대역폭 5.8배가 토큰 2.9배였습니다. 디스크가 충분히 빠르면 천장은 CPU 커널 쪽으로 이동합니다.

RAM이 작으면 캐시 슬롯 자체가 줄어듭니다. 기준 문서의 정리는, 24GB에서는 expert 캐시가 층당 2슬롯으로 자동으로 막혀 디스크가 빨라도 디코드가 차갑게 남는다는 것입니다. [#923](https://github.com/JustVugg/colibri/issues/923)은 16GB를 큰 모델의 바닥 아래로 적습니다. i5-12450H, 16GB DDR5, DRAM 없는 QLC에서 빌드와 자기 테스트는 통과하고, 디코드 숫자는 없습니다. 콜드 토큰이 약 11GB를 읽는데 RAM 캡이 상주로 남길 자리가 거의 없기 때문입니다. 그 크기에서는 OLMoE나 Qwen3.6을 쓰라고 같은 절이 적습니다.

핫 expert를 남는 RAM에 고정하는 명령은 벤치 문서에 있습니다. `PIN=stats.txt PIN_GB=20`처럼 자유 RAM에 맞춥니다. 두 번째 SSD는 사본을 읽습니다.

```bash
COLI_MODEL_MIRROR=/second/glm52_i4 ./coli chat --model /fast/glm52_i4
```

독립 컨트롤러의 NVMe 두 개에서 디코드 **+37.5%**가 측정됐다고 README와 [#1249](https://github.com/JustVugg/colibri/issues/1249)가 적습니다. 더 느린 세 번째 드라이브는 가중 스트라이프 뒤에서 중립이었다고 같은 문장이 적습니다. 샤드 파일을 심볼릭 링크로 나누는 것과, 한 번의 19MB 읽기 안에서 스트라이프하는 것은 다릅니다. 12900K에서 파일 단위 분할은 +5.5%였고, 벤치 문서는 그 차이를 "파일을 나누는 것"과 "블록을 스트라이프하는 것"의 가격이라고 적습니다.

다음 층을 미리 읽는 스위치는 기본이 아닙니다. `docs/tuning.md`는 GLM-5.2에서 층 L의 post-attention 상태에 층 L+1의 라우터를 적용하면 실제 top-8의 **71.6%**를 맞히고, 직전 토큰과 같은 expert라는 기준은 **41.3%**라고 적습니다. `c/colibri.c`의 PILOT 주석도 그 두 숫자를 적습니다. `PILOT=1`은 그 예측으로 `WILLNEED`를 내고, 디스크가 이미 포화된 호스트에서는 힌트만 있는 PILOT이 손해가 될 수 있으니 재어 보라고 적습니다. 이 71.6%는 그 문서와 주석의 숫자이고, 이 글이 다시 잰 값은 아닙니다.

GPU가 있으면 가장 뜨거운 expert와 dense 층을 카드에 둡니다. README의 GLM-5.2 속도 줄은 그 차이를 한 목록에 적습니다. 6× RTX 5090에서 expert가 전부 상주일 때 5.8–6.8 tok/s, selective NUMA로 **9.0–9.2 tok/s**. 128GB CPU만인 Ryzen AI Max+ 395에서 **1.83 tok/s** warm. RTX 5070 Ti 한 장 **1.07 tok/s**. 25GB 노트북의 콜드 **0.05–0.1 tok/s**. 9.0 tok/s와 0.05 tok/s는 같은 엔진의 다른 상주입니다.

## 양자화와 Mistral-Large-4

권하는 GLM-5.2 컨테이너는 group scale 64의 int4이고, MTP 헤드는 int8입니다. `docs/tuning.md`는 int4 헤드의 수락률이 0–4%로 무너진다고 적습니다. 품질 절이 [#108](https://github.com/JustVugg/colibri/issues/108)에 붙이는 숫자는 hellaswag/arc/mmlu 0-shot log-likelihood, 과제당 n=40에서 평균 acc_norm **62.5%**입니다. 같은 문장은 0-shot 객관식이 추론 모델에 부족하다고 적습니다. 양자화 비용으로 그 절이 따로 재는 것은 OLMoE의 fp16 대 int4로, **-8.2 퍼센트포인트**이고, 그룹 스케일이 그 손실의 약 63%를 되돌린다는 문장은 [#225](https://github.com/JustVugg/colibri/issues/225)를 가리킵니다. 62.5%를 GLM-5.2의 공식 벤치 점수라고 카드가 적지는 않습니다.

Mistral-Large-4는 GLM 엔진 파일 `c/colibri.c` 위에 있습니다. `docs/mistral-large4.md`는 [mistralai/Mistral-Large-4-1T-A52B](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)를 1T, 활성 52B, 72층, hidden 6144, 헤드 64, 라우팅 expert 128개 중 토큰당 4개, shared 1개, 첫 층은 dense, 어휘 204800으로 적습니다. 같은 리비전 `af26e786`의 모델 카드 첫 문단은 "1 trillion-parameter", 토큰당 활성 **49B**, embedding과 출력층을 포함하면 **52B**입니다. colibri 표의 "52B active"는 카드가 둘로 나눈 숫자 중 큰 쪽입니다. `text_config`는 층 72, hidden 6144, 헤드 64, `n_routed_experts` 128, `num_experts_per_tok` 4, 어휘 204800으로 문서와 맞습니다.

공개 갱신은 릴리스입니다. `CHANGELOG.md`의 `[2.1.0] - 2026-10-31`은 새 모델 목록의 첫 줄에 Mistral-Large-4를 적고, GitHub 릴리스 v2.1.0의 `published_at`은 **2026-10-31T12:50:50Z**입니다. 텍스트 모델을 GGUF에서 읽는 커밋 `50976d3b4e`의 작성 시각은 **2026-10-29**, PR [#2493](https://github.com/JustVugg/colibri/pull/2493)의 머지는 **2026-10-30**입니다. 10월 31일은 그 코드가 릴리스 노트에 올라온 날입니다.

측정은 기계 D입니다. i5-13500, RAM 62GB, RTX PRO 4000 Blackwell 24GB, NVMe 두 개. UD-IQ1_S는 **233GB**이고, dense 17.9GB가 상주하며 expert는 디스크입니다. CUDA 디코드 **1.34–1.36 tok/s**, 240토큰 프롬프트 66–82초입니다. Vulkan 디코드는 1.16–1.17 tok/s입니다. CPU만은 같은 문서의 다른 표에서 0.52 tok/s입니다. 카드 라이선스 필드는 `other`입니다. 엔진의 Apache-2.0이 가중치를 다시 허락하지 않습니다.

Windows에서 더블클릭하는 파일은 저장소 루트의 `START-HERE.bat`입니다. 첫 주석은 "Double-click this file."입니다. 하는 일은 Python 3.10 이상의 `coli setup`을 부르는 것입니다. Python이 없으면 winget으로 3.12를 사용자 범위에 설치할지 묻습니다. 엔진 바이너리 자체가 그 bat는 아닙니다.

```bat
rem START-HERE.bat, main 0a5504a1
rem First run: finds your hardware, recommends a model, gets the engine,
rem downloads the model, then opens the dashboard.
"%COLI_PY_EXE%" %COLI_PY_ARG% "%COLI_LAUNCHER%" setup %*
```

Linux에서 같은 진입은 `./start-here.sh`입니다. `--model glm-5.2`로 고를 수 있고, `--no-gpu`는 CPU입니다. 모델이 이미 있으면 `./coli chat --model /nvme/glm52_i4`입니다. 다운로드가 429GB인 항목을 이 글은 받아 보지 않았습니다.

## 커뮤니티 저장소는 다른 측정이다

아래 네 저장소는 2026-11-05 GitHub API에서 `fork`가 false였습니다. colibri main의 벤치 행이 아닙니다. 각 README가 자기 기계에서 적는 숫자입니다.

[s-b-repo/peregrine](https://github.com/s-b-repo/peregrine)는 Rust로 다시 쓴 스핀오프라고 자신을 소개합니다. 스타 6, 푸시 2026-10-26. README는 colibri의 CUDA MoE가 단계적이라 CPU expert와 GPU expert가 한 층에서 겹치지 않는다고 적고, 파일 이름으로 `glm.c`를 듭니다. `0a5504a1`의 GLM 엔진 파일은 `c/colibri.c`입니다. 그 README의 "81초"는 이 글이 현재 main에서 다시 찾지 않았습니다.

[PhilipJohnBasile/iliria](https://github.com/PhilipJohnBasile/iliria)는 Apache-2.0이고, Apple Silicon용 C/Metal 실험이라고 적습니다. 주 측정이 GLM-5.2 int4, M5 Max, 128GB 통합 메모리, 디스크 약 370GB, 웜 디코드 약 **1.5 tok/s**라고 적습니다. colibri 벤치 문서의 M5 Max 행은 다른 설정에서 1.06, 1.83, 2.06 tok/s입니다. 같은 기계 이름의 다른 기록입니다.

[andy12b/colibri-hybrid](https://github.com/andy12b/colibri-hybrid)는 2026-07-18에 멈춰 있다고 적습니다. EntMTP와 MoE-SpeQ를 합쳐 **0.151 tok/s, +19%**라고 적고, 그 변경이 엔진에 들어갔다고 적습니다. `0a5504a1` 트리에서 `EntMTP`와 `SpeQ` 문자열은 없었습니다. 그 +19%는 이 포크의 표입니다.

[Dapperscyphozoa/colibri-ds](https://github.com/Dapperscyphozoa/colibri-ds)는 MIT이고, API의 `parent`는 비어 있습니다. 본문이 돌리려던 모델은 DeepSeek-V3급 **671B**, expert 14,848개이고, 코드는 Python과 MLX입니다. `c/colibri.c`의 GLM-5.2 경로가 아닙니다. Apple M4 Pro 24GB, 외장 NVMe 약 3GB/s에서 적은 음성 결과는 세 줄입니다. 진짜 expert와 LRU는 **0.31–0.40 tok/s**에 출력은 정합했습니다. LRU를 2GB, 5GB, 9GB로 올리자 0.39, 0.40, **0.31 tok/s**였습니다. 병렬 fetch 천장은 **3.87 tok/s**인데 끝에서 끝까지는 약 0.4 tok/s라, 벽시계의 약 90%를 호스트의 계산과 expert를 푸는 시간으로 적습니다. 증류한 ghost expert는 **13.4 tok/s**에 평균 상대오차 0.35로 문장이 깨졌습니다. 캐시를 키우는 일이 그 24GB 박스의 671B 작업에서는 레버가 아니었다는 기록이고, colibri 기준 표의 0.05–0.1 tok/s를 대체하는 숫자는 아닙니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 클라우드 API의 토큰 가격은 이 글이 가격표까지 대조하지 않았습니다. Z.ai 카드가 GLM-5.2 API를 가리키고, Mistral 카드가 `mistral-large-4`라는 모델 id로 [자기 API](https://docs.mistral.ai/models/mistral-large-4-0)를 가리킨다는 것까지만 읽었습니다.

2026년의 로컬 MoE에서 "파일이 RAM보다 크다"를 푸는 방법은 이미 여러 개입니다. llama.cpp CLI README의 `--load-mode` 기본값은 `auto`이고, 그 설명은 장치가 지원하면 **mmap**입니다. `mlock`은 그 페이지를 RAM에 붙잡습니다. `--cpu-moe`는 MoE 가중치를 CPU에 두고, `--n-cpu-moe N`은 앞쪽 N개 층의 MoE를 CPU에 둡니다. `--lazy-mode`는 "per-layer embeddings 같은 특정 텐서의 행을 필요할 때 읽는다"고 적혀 있고, mmap이 필요합니다. colibri `st.h`가 자기 읽기에 적어 둔 이유는, mmap이 페이지를 남겨 RSS가 모델 전체가 되었던 버그를 `pread`와 `DONTNEED`로 피한다는 것입니다. 429GB 파일을 25GB 기계의 페이지 캐시에 기대는 경로와, dense 9.9GB만 올리고 expert는 슬롯에 복사하는 경로는 다른 메모리 계약입니다.

이 블로그의 [FreeToken 글](https://betelg15.github.io/posts/freetoken-consumer-gpu-giant-models/)이 논문에서 옮긴 기계는, expert 풀 전체를 호스트 RAM에 두고 GPU는 LRU입니다. 그 논문이 NVMe에 적어 둔 시간은 기동입니다. [Betelgeuse 글](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/)의 인증 범위는 Linux, RTX 3060 12GB, 16GB RAM, 컨텍스트 512이고, 22.03 tok/s는 반복 측정의 두 번째 요청입니다. [vLLM PLE 글](https://betelg15.github.io/posts/vllm-ple-disk-offload/)의 디스크 읽기는 n-gram 행입니다. colibri 기준 모델의 디스크 읽기는 층마다 expert 8개의 행렬 세 개입니다. 같은 "SSD 오프로드" 문장 안에 읽는 텐서가 다릅니다.

하드웨어로 문서가 가리키는 레버는 RAM 캡, 그 다음 드라이브, 그 다음 커널입니다. 24GB에서는 캐시가 층당 2슬롯으로 막혀 빠른 디스크도 차갑습니다. 16GB에는 GLM-5.2 디코드 행이 없습니다. 9950X에서 디스크를 8.81GB/s로 바꾸자 0.10이 0.28이 된 뒤 병목은 matmul이었습니다. NVMe를 두 개 달아 +37.5%를 잰 행은 독립 컨트롤러입니다. 벤치 문서의 SSD 메모는 읽기 자체는 마모를 의미 있게 만들지 않고, RAM이 부족해 스왑이 쓸 때와 오래 읽힐 때의 온도를 걱정하라고 적습니다. WSL에서 모델을 `/mnt/c`에 두면 여러 배 느리다고 README가 적고, 기본 위치는 `~/colibri-models`입니다.

가중치와 엔진의 허락은 분리돼 있습니다. 엔진 LICENSE는 Apache-2.0입니다. 이 글이 읽은 GLM-5.2 카드의 `license`는 `mit`입니다. Mistral-Large-4 카드의 `license`는 `other`입니다. 추천 컨테이너는 429GB이고, Mistral UD-IQ1_S는 233GB입니다. 9.9GB는 그 다운로드가 끝난 뒤의 dense 상주입니다.

**분석/의견.** 이득이 가는 자리는 이미 NVMe와 24GB 이상의 RAM이 있고, 744B급 가중치를 자기 디스크에 두며, 25GB 노트북의 0.05–0.1 tok/s나 캐시가 데워진 데스크톱의 1 tok/s 안팎을 대기 시간으로 받아들일 수 있는 사람입니다. 문서의 9.0–9.2 tok/s는 expert가 전부 올라간 6× RTX 5090입니다. 그 숫자를 9.9GB 상주의 속도로 읽으면 기준 표의 콜드 바닥이 빠집니다. 코딩 에이전트가 수십 tok/s를 전제로 턴을 쌓는 자리에는, 같은 README가 Qwen3.6이나 OLMoE처럼 RAM에 들어가는 모델을 권하는 줄이 따로 있습니다. 16GB 기계에 429GB GLM을 깔고 대화가 된다고 읽으면, #923이 디코드 숫자를 비워 둔 이유가 빠집니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·자체 보고라 재현 전 / ❌ 사실 아님

확인 시각은 2026-11-05입니다. 처리량과 RSS는 저장소가 적은 값이고, 이 글은 다시 재지 않았습니다.

### @nagi_aiwatch 포스트

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 7440억 파라미터 모델을 돌리는 OSS colibri가 있다 | ⚠️ | [저장소](https://github.com/JustVugg/colibri) main `0a5504a1`, Apache-2.0, C. README·카탈로그·벤치는 GLM-5.2를 **744B**로 부릅니다. [config.json](https://huggingface.co/zai-org/GLM-5.2/blob/cf457fa734ab149ffef225f80893eb38c6ff5cdc/config.json)은 78층, 앞 3층 dense, expert 256, 토큰당 8, shared 1, hidden 6144입니다. 같은 리비전의 모델 카드 README에서 744B라는 총량은 찾지 못했습니다. 이 글은 파라미터를 다시 합산하지 않았습니다. |
| 메모리 상주 9.9GB로 그 모델이 돈다 | ⚠️ | [기준 표](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/docs/benchmarks.md)의 9.9GB는 **dense int4 상주**입니다. 같은 표의 채팅 피크 RSS는 약 **20GB**, 콜드 읽기는 약 **11GB/토큰**, 25GB 박스의 콜드 속도는 **0.05–0.1 tok/s**입니다. 카탈로그 RAM은 16 / 24GB이고 `dense_gb=9.9`입니다. [#923](https://github.com/JustVugg/colibri/issues/923)은 16GB에 디코드 숫자가 없다고 적습니다. README 샘플의 `ready in 32s · resident 9.9 GB`는 예시 화면이고, 표의 로드는 약 30초입니다. 9.9 tok/s는 Qwen3.6 Vulkan 디코드이고, 약 9.9GB read/token은 i9-12900K 행의 다른 칸입니다. |
| 자주 쓰는 부분만 RAM에 두고 나머지는 SSD에서 읽는다 | ⚠️ | README: dense는 RAM에 남고, 라우팅 expert는 디스크에 있다가 라우터가 고르면 읽으며, 캐시가 자주 쓰는 expert를 배웁니다. 항상 남는 dense와, 그 위의 pin·LRU가 있습니다. 콜드 토큰은 여전히 약 11GB를 읽습니다. `st.h`는 그 읽기를 `pread`로 하고 페이지를 버리지, 모델 전체를 mmap으로 상주시키지 않습니다. |
| C로 만들어졌다 | ✅ | 엔진은 모델 패밀리당 C 파일 하나이고 GLM과 Mistral은 `c/colibri.c`입니다. README는 BLAS가 없고, Python은 셋업·런처·변환기·API 게이트웨이만 돌린다고 적습니다. `coli serve`의 HTTP는 그 게이트웨이입니다. |
| GPU 없이도 된다 | ✅ | README "No GPU needed": 모든 엔진이 CPU만으로 돕니다. GPU는 가중치를 더 빨리 두는 자리이고, 큰 모델에서는 디스크가 속도를 정한다고 적습니다. `--no-gpu`와 `START-HERE.bat --no-gpu`가 있습니다. |
| 10월 31일 업데이트로 약 1조 파라미터 Mistral-Large-4를 지원한다 | ✅ | [CHANGELOG 2.1.0](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/CHANGELOG.md)의 날짜는 2026-10-31이고, [릴리스 v2.1.0](https://github.com/JustVugg/colibri/releases/tag/v2.1.0)은 2026-10-31T12:50:50Z에 나왔으며 새 모델로 Mistral-Large-4를 적습니다. 엔진 커밋은 2026-10-29, PR #2493 머지는 2026-10-30입니다. [모델 카드](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/af26e7869af601441d5cdf75a1272469ddc3d059/README.md)는 1조 파라미터, 토큰당 활성 49B, embedding과 출력을 포함하면 52B입니다. colibri 측정은 기계 D에서 UD-IQ1_S 233GB, CUDA 1.34–1.36 tok/s입니다. |
| Windows는 bat을 더블클릭하면 시작한다 | ✅ | [`START-HERE.bat`](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/START-HERE.bat) 주석이 더블클릭을 적고, `coli setup`을 부릅니다. Python 3.10 이상이 필요하고, 없으면 winget으로 설치를 제안합니다. 그 다음 실행은 다운로드와 빌드 없이 시작한다고 README가 적습니다. |

**총평:** colibri라는 C 엔진이 있고, GLM-5.2의 dense int4를 9.9GB로 상주시키며 라우팅 expert는 `pread`로 디스크에서 가져온다는 뼈대는 저장소와 맞습니다. 느슨한 곳은 9.9GB가 기계의 RAM이라는 읽기입니다. 같은 기준 표의 피크 RSS는 약 20GB이고, 콜드 토큰은 약 11GB를 더 읽으며, 25GB 개발 박스의 콜드 디코드는 0.05–0.1 tok/s입니다. 16GB는 디코드 숫자가 없는 크기로 적혀 있습니다. 744B는 엔진 문서의 이름이고, 이 글이 연 Z.ai 카드 README에는 그 총량이 없었습니다. Mistral-Large-4는 2026-10-31 릴리스 v2.1.0의 새 모델이고, 카드의 1조 파라미터와 맞습니다. Windows bat은 더블클릭이 맞고, 그 파일이 부르는 것은 Python 셋업입니다.

## 참고 자료

- 엔진, main `0a5504a1dc64f86fcd0fe7db298b0448c730e7e6` — [저장소](https://github.com/JustVugg/colibri) · [README](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/README.md) · [benchmarks.md](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/docs/benchmarks.md) · [tuning.md](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/docs/tuning.md) · [mistral-large4.md](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/docs/mistral-large4.md) · [st.h의 pread 주석](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/c/st.h) · [expert_load_impl](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/c/colibri.c) · [setup_catalog.py](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/c/setup_catalog.py) · [START-HERE.bat](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/START-HERE.bat) · [CHANGELOG 2.1.0](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/CHANGELOG.md) · [릴리스 v2.1.0](https://github.com/JustVugg/colibri/releases/tag/v2.1.0) · [LICENSE](https://github.com/JustVugg/colibri/blob/0a5504a1dc64f86fcd0fe7db298b0448c730e7e6/LICENSE)
- 가중치 쪽 1차 문서 — [zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) `cf457fa7` · [config.json](https://huggingface.co/zai-org/GLM-5.2/blob/cf457fa734ab149ffef225f80893eb38c6ff5cdc/config.json) · 추천 컨테이너 [mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp](https://huggingface.co/mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp) · [Mistral-Large-4 카드](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/af26e7869af601441d5cdf75a1272469ddc3d059/README.md) `af26e786`
- 업스트림 mmap — llama.cpp master `da3416d807`(2026-11-05)의 [`--load-mode`, `--cpu-moe`, `--lazy-mode`](https://github.com/ggml-org/llama.cpp/blob/da3416d8077c55d68e45ce15babd999ac7ba1c49/tools/cli/README.md)
- 이 블로그의 이웃 글 — [FreeToken](https://betelg15.github.io/posts/freetoken-consumer-gpu-giant-models/) · [Betelgeuse](https://betelg15.github.io/posts/betelgeuse-moe-inference-engine-rtx-3060/) · [vLLM PLE 디스크 오프로드](https://betelg15.github.io/posts/vllm-ple-disk-offload/)
- 2차 맥락으로만 읽은 커뮤니티 저장소 — [peregrine](https://github.com/s-b-repo/peregrine) · [iliria](https://github.com/PhilipJohnBasile/iliria) · [colibri-hybrid](https://github.com/andy12b/colibri-hybrid) · [colibri-ds](https://github.com/Dapperscyphozoa/colibri-ds). 각각의 속도는 그 README의 측정이고, colibri 기준 표의 행이 아닙니다.
- 원본 X 포스트: [@nagi_aiwatch](https://x.com/nagi_aiwatch/status/2117960761494610034) · [상태 주소](https://x.com/i/status/2117960761494610034) (2026-11-04 12:42 UTC)
