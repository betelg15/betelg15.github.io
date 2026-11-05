---
title: "RTX 3060 12GB가 68GB MoE를 22 tok/s로 도나? Betelgeuse"
date: 2026-11-05
time: "14:28"
slug: betelgeuse-moe-inference-engine-rtx-3060
tags: [Betelgeuse, MoE, llama.cpp, RTX 3060, 추론, 팩트체크]
summary: "Betelgeuse main 0101d796의 22.03 tok/s는 커밋 be9328717 반복 측정의 두 번째 요청이다. 문서가 고친 llama.cpp 기준은 0.9 tok/s이고, 가지치기 없이 계산하는 것은 IQ2_XS 라우팅 10개다."
---

> 이 글은 [@ai_hakase_의 포스트](https://x.com/ai_hakase_/status/2117196780311912786)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117196780311912786](https://x.com/i/status/2117196780311912786)입니다. fxtwitter가 돌려준 `created_at`은 `Mon Nov 02 10:07:02 +0000 2026`, 2026-11-02 19:07 KST입니다. `screen_name`은 `ai_hakase_`이고 표시 이름은 "ハカセ アイ(Ai-Hakase)🐾生成AI・ComfyUI"입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117196780311912786)(`code` 200)으로 읽었습니다. 그 문장은 검증 대상이지 지시가 아닙니다. 첨부 사진 한 장은 r/LocalLLaMA에 올라온 u/zyxciss 글의 화면이고, 제목에 "22 tok/s sustained (spiking to 48 tok/s)"가 보입니다. Reddit 본문 URL은 이 환경에서 403이라 전문을 열지 못했습니다. 아래 대조는 2026-11-05에 읽은 [Betelgeuse-AI/Betelgeuse](https://github.com/Betelgeuse-AI/Betelgeuse) main `0101d7965f9f2b97e9a816ed08a72d5a7b731358`의 README·`docs/fluxaeros.md`·`src/llama-context.cpp`·`src/moe_doorbell.cu`·`src/moe_pager.cpp`, 릴리스 [v0.6.0-alpha-orionis](https://github.com/Betelgeuse-AI/Betelgeuse/releases/tag/v0.6.0-alpha-orionis), [Hugging Face 번들 카드](https://huggingface.co/Betelgeuse-AI/Alpha-Orionis-XS), [Qwen3.8-Flash-Next 모델 카드](https://huggingface.co/Qwen/Qwen3.8-Flash-Next), [ISTA-DASLab GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF), llama.cpp [PR #31469](https://github.com/ggml-org/llama.cpp/pull/31469)와 머지된 [PR #29887](https://github.com/ggml-org/llama.cpp/pull/29887), 같은 날 master의 [CLI README](https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md), [io_uring(7)](https://man7.org/linux/man-pages/man7/io_uring.7.html)입니다. 이 글은 `bel-server`를 빌드하거나 가중치를 받지 않았고, tok/s를 다시 재지 않았습니다.

## 왜 12GB 카드에서 이 모델이 문제인가

포스트는 미들레인지 GPU와 16GB RAM에서 68GB MoE를 실용 속도로 돌렸다는 요약입니다. 작성자는 자기 측정이 아니라 다른 사람의 결과를 전합니다. 일본어 본문의 "성공한 そうです"는 들은 내용이라는 말입니다. 저장소는 있습니다. GitHub 전체 이름은 `Betelgeuse-AI/Betelgeuse`, 라이선스 SPDX는 MIT, 기본 브랜치는 `main`, 생성 시각은 2026-10-31T11:15:51Z, 포크는 아닙니다. 같은 날 API의 `stargazers_count`는 **92**, `forks_count`는 **2**입니다. 커밋 작성자 이름은 `zyxciss`이고, 그 계정의 `name` 필드도 `zyxciss`이며 `twitter_username`은 비어 있습니다.

개발자에게 닿는 지점은 "3060이 125B를 VRAM에 담는다"가 아닙니다. Qwen 모델 카드의 언어 모델은 파라미터 **125B 중 활성 6B**, 그 옆에 **n-gram 임베딩 51B**와 **MTP 4B**입니다. 층은 **48**, expert는 **512**, 토큰마다 **라우팅 10개와 공유 1개**입니다. 컨텍스트는 기본 **262,144**, YaRN으로 1,000,000까지입니다. 48 × 512 = **24,576**개의 routed expert가 디스크에 있고, 한 토큰이 계산하는 routed expert는 48 × 10 = **480**개입니다.

Betelgeuse README가 배포 크기로 적는 네 파일은 이렇습니다. dense GGUF 약 **3.77GB**(dense 텐서 페이로드 3,759,953,920바이트와 메타데이터), `experts.bin` **35,481,714,688바이트(35.48GB)**, PLE 동반 파일 **28,800,138,432바이트(26.82GiB)**, 프로파일 **6,920바이트**. 합이 대략 **68GB**입니다. 그 68GB의 큰 덩어리는 expert만이 아닙니다. 26.82GiB는 층별 n-gram 임베딩 샤드입니다. README는 dense 파일을 3.2GB짜리 expert 제거본으로 읽지 말라고 적습니다. 카드가 말하는 양자화 원본은 [ISTA-DASLab의 IQ2_XS](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/tree/ed59f92082b1e93c0e96d60a8b11aab089b52f09/IQ2_XS)이고, 번들은 그 바이트를 다시 양자화하지 않고 레이아웃만 바꿉니다. 원본 모델 리비전은 `de4b8e4d43b917e7706784d8bb445c9af86a3540`, 양자화 리비전은 `ed59f92082b1e93c0e96d60a8b11aab089b52f09`입니다.

## mmap이 모델보다 작은 RAM에서 느려지는 이유

llama.cpp CLI README의 `--load-mode` 기본값은 `auto`이고, 그 설명은 장치가 지원하면 **mmap**입니다. `mmap`은 파일을 프로세스 주소 공간에 붙입니다. 페이지를 건드릴 때 커널이 그 파일 페이지를 페이지 캐시에 올립니다. `mlock`은 그 페이지를 RAM에 붙잡습니다. 파일 전체가 RAM보다 크면 잠글 자리가 없습니다. 디코드는 토큰마다 다른 expert 몇 개를 파일의 먼 오프셋에서 읽습니다. 방금 올린 페이지가 다음 토큰의 expert에게 자리를 내주면, 같은 바이트를 디스크에서 다시 가져옵니다. 페이지 캐시가 작업 집합을 못 담을 때의 이름이 스래싱입니다.

같은 README의 `--cpu-moe`는 MoE 가중치 전체를 CPU에 두고, `--n-cpu-moe N`은 앞쪽 N개 층의 MoE 가중치를 CPU에 둡니다. `-ot` / `--override-tensor`는 텐서 이름에 버퍼를 덮어씁니다. expert를 CPU로 보낸 뒤에도 적재 방식이 mmap이면, 그 expert 파일 페이지는 여전히 페이지 캐시 위에 있습니다. RAM이 파일보다 작으면 CPU 오프로드가 디스크 왕복으로 돌아갑니다. `--load-mode none`은 mmap을 끄고, `dio`는 Direct I/O가 있으면 그것을 씁니다. 이 글이 읽은 줄은 2026-11-05 master의 표입니다.

[PR #31469](https://github.com/ggml-org/llama.cpp/pull/31469)가 자기 문제로 적는 문장은, 68GB `qwen4exp`를 12GB VRAM과 16GB RAM에서 표준 mmap으로 두면 페이지 캐시 스래싱과 층마다의 CPU/GPU 동기화가 디코드를 약 1.5 tok/s로 떨어뜨린다는 것입니다. 그 PR 표의 mmap 칸은 디코드 **1.47 / 1.63 tok/s**, 물리 디스크 읽기 **208.3 / 235.0 MiB/tok**입니다. 나중에 저장소가 고친 기준은 다릅니다. `docs/fluxaeros.md`는 같은 하드웨어에 대해 사용자가 다시 보고한 llama.cpp를 **0.9 tok/s**, Strata를 **8 tok/s**로 적고, 이 둘은 이 번들을 위해 새로 통제해서 잰 값이 아니라고 적습니다.

## 슬롯 풀은 5,000개를 층마다 다르게 나눈다

main `0101d796`의 `llama-context.cpp`는 이 배분을 "Arrival Slack"이라고 부릅니다. 48층일 때 프로파일 표가 기본입니다. 환경 변수 `MOE_POOL_PROFILE`이 없거나 0이 아니면 이 배열을 씁니다.

```cpp
// src/llama-context.cpp, main 0101d796, moe_fixed_slots.
// 층 0–4는 220. 그 뒤는 80–136. 합은 4996.
static const int profiled_slots[48] = {
    220, 220, 220, 220, 220, 120, 136, 120, 80, 80, 80, 80,
    128, 80, 80, 80, 80, 88, 120, 80, 80, 96, 136, 80,
    80, 80, 96, 80, 112, 80, 80, 80, 80, 80, 112, 80,
    80, 88, 128, 80, 80, 80, 88, 80, 80, 80, 80, 88,
};
```

`--moe-slots 5000`은 이 합 4996에 비율을 곱합니다. 정수 나눗셈이라 220은 220, 80은 80에 남습니다. 로그가 "L0-4, L5-42, L43-47"처럼 세 구간으로 찍는 숫자는 층 0, 층 5, 층 43의 값입니다. 층 5–42가 전부 120은 아닙니다. 표에는 80도 있고 136도 있습니다. 프로파일을 끄거나 층 수가 48이 아니면 폴백은 앞 5층 220, 그다음 92, 끝 80입니다.

각 층 풀에는 사용 슬롯 뒤에 **0으로 채운 센티넬 슬롯이 하나** 더 있습니다. 주석은, 상주하지 않은 expert를 -1로 두면 `get_rows`가 범위를 벗어나 그 층을 조용히 망가뜨리기 때문에 항상 0번 행으로 보낸다고 적습니다. 그래서 장치 위의 슬롯 행 수는 4,996이 아니라 층마다 하나씩 더한 수입니다. 5,000은 컨텍스트 길이도 아니고 호스트 캐시 크기도 아닙니다. README가 그 플래그에 적어 둔 문장입니다.

앞 층에 슬롯을 더 주는 이유는 PR이 "compute overlap slack이 0인 초기 층"이라고 적은 자리와 같습니다. 뒤 층의 미스 대기는 그 층의 GPU 계산과 겹칠 자리가 있고, 앞 층은 그 겹침이 없습니다. 이것은 층 예산의 설명이지, 히트까지 2µs라는 측정은 아닙니다. `moe_doorbell.cu`의 커널 주석은 히트일 때 디바이스 작업만 하고, 미스일 때 배치 계획을 올린 뒤 호스트 도어벨을 울리고 페이저가 슬롯을 채울 때까지 돈다고 적습니다. 그 주석과 README와 `fluxaeros.md`와 PR 본문에서 이 글은 **2µs**라는 숫자를 찾지 못했습니다.

```cpp
// moe_doorbell.cu, moe_resolve_slots_kernel 앞 주석. 시간 숫자는 없다.
// On a hit this is pure device work. On a cold miss the kernel publishes
// the whole batch plan, rings the host doorbell and spins until the pager
// filled the missing slots.
```

PR이 지우려는 동기화는 층 48개의 `cb_eval` 분할입니다. `KICK`은 라우터 top-k 직후에 expert id를 슬롯 id로 바꾸고, `KICK`과 `WAIT` 사이에 공유 expert FFN을 넣어 미스 처리와 겹칩니다. 디코드가 그래프 분할 **1**번과 CUDA 그래프 재생으로 줄어든다는 문장은 PR 표의 칸입니다. `fluxaeros.md`의 측정 표에는 그래프 분할 열이 없습니다.

## 호스트 캐시와 io_uring은 플래그 이름과 다릅니다

`--moe-direct-io`라는 이름은 남아 있습니다. README와 번들 카드는 최적화된 수요 워커가 **버퍼된 `io_uring` 읽기**라고 적고, 커널 페이지 캐시가 여전히 쓸모 있다고 적습니다. `llama-context.cpp`의 도어벨 워커 주석도 "Buffered reads: the page cache holds the hot expert set"입니다. `pack_loc()`이 돌려주는 fd는 `open`에 `O_RDONLY`만 주고 `POSIX_FADV_RANDOM`을 건 쪽입니다. `io_uring_queue_init(512)` 뒤에 `io_uring_prep_read`로 그 fd에 제출합니다.

[io_uring(7)](https://man7.org/linux/man-pages/man7/io_uring.7.html)의 인터페이스는 제출 큐와 완료 큐입니다. 사용자 공간이 SQE를 넣고 `io_uring_enter(2)`로 커널에 알립니다. 읽기 opcode는 `read(2)`에 해당하는 비동기 제출입니다. O_DIRECT를 강제하는 API는 아닙니다. 파일을 연 플래그가 페이지 캐시를 탑니다.

같은 워커에는 갈래가 하나 더 있습니다. `MOE_HOT_K`가 0보다 크고 랭크가 웜 창 밖이면, 그 미스는 `O_DIRECT`로 연 pack fd로 가서 웜 구간의 페이지 캐시를 밀지 않게 합니다. 문서의 실행 예는 `MOE_HOT_K=0`입니다. 그 값이면 이 갈래의 랭크 검사가 꺼져 읽기는 버퍼된 fd에 남습니다. 한편 `moe_pager.cpp`의 `fetch_batch`는 여전히 `O_DIRECT`로 연 `fd_pack_`에 `io_uring`을 제출하고, 헤더 주석은 페이지 캐시를 우회한다고 적습니다. 플래그 이름, 헤더, 워커가 서로 다른 세대를 가리킵니다. 2026-11-05 main에서 문서가 권하는 쪽은 버퍼된 도어벨 워커입니다.

호스트 victim 캐시의 기본은 DMA와 CUDA 그래프 경로에서 **8GiB**입니다. README는 이 8GiB가 프로세스 예산 **안**이라고 적습니다. 문서의 실행은 `systemd-run`으로 `MemoryMax=12G`, `MemorySwapMax=0`을 16GB 호스트 위에 겁니다. 캐시를 8GiB 더 사는 스위치가 아닙니다. `MOE_CACHE_MIB=0` 또는 `MOE_VICTIM_CACHE=0`이 캐시를 끕니다. 초기화 주석은 VRAM에 올라간 집합의 페이지 캐시 사본을 놓아 두 계층이 같은 바이트를 두 번 들지 않게 한다고 적습니다. 버퍼된 fd의 페이지 캐시 자체는 워커가 쓰려고 남겨 둡니다.

예측기는 기본으로 꺼져 있습니다. 같은 파일 주석은 RouterPredictorV2의 top-16 적중을 이 모델에서 **1.2%**로 재었고, 그 때문에 120MiB VRAM을 슬롯에 돌린다고 적습니다. `MOE_PRED=1`일 때만 다시 켜집니다. 다른 주석은 그 예측으로 미리 읽으면 NVMe만 태운다고 적습니다. 이 1.2%는 코드 주석의 숫자이고, 이 글이 다시 잰 값은 아닙니다.

## 22.03이 붙어 있는 실험과, 붙어 있지 않은 실험

`docs/fluxaeros.md`가 측정일로 적는 것은 **2026-10-30**입니다. 프로토콜은 expert-pack 페이지 캐시를 기동 전에 떨어뜨리고, 64토큰 웜업 뒤, 22토큰 프롬프트로 256토큰 그리디 완성을 같은 프로세스에서 두 번 보냅니다. 프롬프트 캐시는 꺼져 있습니다. 물리 MiB는 그 요청의 프롬프트 읽기를 포함하고 **생성 256토큰으로 나눕니다**. 기계 조건은 Linux x86-64, RTX 3060 12GB, CUDA `sm_86`, 시스템 RAM 16GB, 로컬 NVMe, 컨텍스트 **512**, `-ub 64`, 슬롯 5,000, `-np 1`입니다. PR은 그 RAM을 싱글채널 DDR4-3200, `MemoryMax=12G`로 적습니다.

| 구성 (`fluxaeros.md` 표) | TG 1회 / 2회 tok/s | PP 1회 / 2회 | 물리 MiB/생성토큰 |
| --- | ---: | ---: | ---: |
| 캐시 끔 | 13.87 / 14.27 | 14.89 / 17.95 | 44.66 / 39.67 |
| 8GiB victim 캐시, `be9328717` 반복 | **16.29 / 22.03** | 13.85 / 19.35 | **35.37 / 12.43** |
| 릴리스 코드, auto-warm 끔, 트레이스 | 16.32 / 21.43 | 13.89 / 18.62 | 35.38 / 12.47 |
| 같은 코드, auto-warm 켬, 트레이스 | **16.80 / 21.85** | 16.18 / 18.29 | 30.54 / 12.88 |

22.03과 같은 행의 첫 요청은 **16.29**입니다. 16.80과 같은 행의 두 번째 요청은 **21.85**입니다. README는 이 둘을 서로 다른 과거의 실행이라고 적고, 한 쌍의 벤치마크도 보편적인 속도 약속도 아니라고 적습니다. 16.80은 생성 웜업을 켠 팔이라 "콜드"가 웜업 비용 0을 뜻하지 않습니다. 그 웜업은 256토큰 생성과 한 번 재생이고, 기록된 기동 비용은 약 **42초**입니다. 같은 문서는 이 숫자들이 이름이 바뀐 스트립 번들보다 앞선 측정이라 **그 번들의 성능을 보증하지 않는다**고 적습니다. 프리필은 두 실행에 걸쳐 일관되게 좋아지지 않았다고 적습니다. PR 표의 mmap 프리필 14.11 / 20.81 tok/s와 포크 13.85 / 19.35 tok/s도 디코드 칸과 방향이 다릅니다.

스트립 번들 검증(2026-10-31)은 처리량이 아닙니다. `--cache-warmup 0`에서 22토큰 프롬프트가 기준 8토큰 `[271, 248068, 198, 760, 1156, 6587, 264, 11346]`을 냈다는 기능 확인입니다. 역사적 릴리스 검증은 서버 웜업 팔이 골든 토큰 **576/576**, 라우터 기록 **28,080/28,080**과 맞았다고 적습니다. 그 문장은 스트립 번들 이전 바이너리이고, 같은 절은 그 검사가 새 번들이나 이름이 바뀐 바이너리를 다시 검증했다고 말하지 않는다고 적습니다. 팩 비교로 24,576 expert가 원본 GGUF 바이트와 같았다는 문장도 그 역사적 절에 있습니다. 스트립 번들 절의 expert 비교는 층마다 처음·가운데·끝, 144개를 표본으로 본 것이고 새 전수 비교가 아니라고 적습니다.

MTP는 따로 어긋납니다. 1층 사이드카는 약 2.58GiB이고 번들에 없습니다. 드래프트를 CPU에 두고 victim 캐시를 6GiB로 줄인 16토큰 스모크는 드래프트 8개 중 6개를 받아들였지만, 생성 토큰 8에서 골든 연속과 갈라졌습니다. README는 정확한 출력의 페이징에 대해 인증된 MTP 구성이 없다고 적습니다.

실행 예가 문서에 있는 서버 명령은 웜 캐시를 약속하지 않습니다. `--cache-warmup 0`이고 `MOE_HOT_K`, `MOE_PREKICK`, `MOE_SEED_BUDGET_MS`는 0입니다.

```bash
export MOE_HOT_K=0 MOE_PREKICK=0 MOE_SEED_BUDGET_MS=0
systemd-run --user --scope --quiet -p MemoryMax=12G -p MemorySwapMax=0 \
    build/bin/bel-server -m "$BUNDLE/Qwen3.8-Flash-Next-Dense.gguf" -ngl 99 \
    --moe-direct-io --moe-pack-dir "$BUNDLE" --moe-slots 5000 \
    --moe-profile "$BUNDLE/profile-qwen4exp.bin" --cache-warmup 0 \
    -ub 64 -np 1 -c 512 -t 6 --host 127.0.0.1 --port 8080
```

바이너리 이름은 `bel-server`와 `bel-cli`입니다. CMake 타깃 이름은 그대로 `llama-server`, `llama-cli`입니다. README는 페이징 경로가 실험적이고 일부가 깨져 있으며 **`bel-server`를 우선**하라고 적습니다. 인증 범위는 Linux, `sm_86`, 위의 엔벨로프입니다. 다른 GPU, 다른 OS, CPU 전용 빌드, 더 큰 컨텍스트, 프로세스 안 병렬 컨텍스트는 이 결과가 보증하지 않습니다. 릴리스 `v0.6.0-alpha-orionis`는 2026-10-31T11:43:33Z에 나왔고, 본문은 `20d2b6c`에서 만든 `sm_86` 바이너리이며 더 오래된 배포판이나 다른 CPU를 인증하지 않는다고 적습니다. main은 그 뒤로 `0101d796`(2026-11-01, CLI 마크다운)까지 가 있습니다.

## 이미 있는 오프로드와 어디가 다른가

RAM 안에 이미 있는 expert를 GPU에 캐시하는 작업은 업스트림에 들어가 있습니다. [PR #29887](https://github.com/ggml-org/llama.cpp/pull/29887) `llama : add a GPU cache for MoE experts kept in host memory`는 2026-10-07T18:07:46Z에 머지됐습니다. #31469 서두가 자기 차이를 적은 문장은, #29887이 호스트 메모리에 상주하는 expert를 VRAM에 캐시하는 동안 이 브랜치는 expert가 물리 RAM(16GB)을 넘는 NVMe 구간을 겨냥한다는 것입니다. 그 구간에 더한다고 적은 것은 `io_uring` expert 팩, 배타적 호스트 victim 캐시, 비균일 슬롯 예산, `KICK`/`WAIT`입니다. PR은 기본 **off**인 RFC라고 적습니다. 2026-11-05에 그 PR은 **open**이고 `merged`는 false입니다.

같은 날 댓글은 네 개입니다. `ggml-gh-bot`은 백엔드가 여러 개인 점, PR 설명이 AI로 보이면 사람이 다시 쓰라는 점, 큰 변경은 사전 논의가 필요하다는 점을 적었습니다. 작성자 본문의 AI 고지는, 전반부의 direct I/O 페이징 원형은 생성 AI를 썼고 나머지 CUDA 그래프와 디버깅과 테스트는 사람이 했다고 적습니다. `Green-Sky`는 `moe-cache + load_mode dio`와 무엇이 다른지 물었고, 이 글이 읽은 스레드에는 그 질문에 대한 답이 없습니다. `zarbis`는 RTX 5080과 Ryzen 9800X3D에서 `ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF:IQ2_XS`, 컨텍스트 100000으로 재었고, 플래그 없는 디코드 **20.24 tok/s**, `--moe-direct-io --moe-slots 5000`은 **14.00 tok/s**라고 적었습니다. GPU 이용률은 90%에서 40–50%로 떨어졌다고 적었습니다. `zyxciss`의 답은 슬롯을 OOM 전까지 올리라는 한 줄입니다. 이 기계의 RAM 용량은 댓글에 없습니다. 3060·16GB·컨텍스트 512 엔벨로프의 재현이 아닙니다.

KTransformers는 Chen 등의 SOSP 2025 논문입니다. 초록은 공유 expert를 GPU에, routed expert를 CPU에 두고, Expert Deferral로 CPU와 GPU의 겹침을 늘린다고 적습니다. 그 추가 처리량의 정확도 비용으로 초록이 적는 상한은 다양한 벤치마크 평균 **0.5% 이하**입니다. 계산을 미루며 출력이 조금 움직일 수 있는 설계입니다. Betelgeuse 문서가 자기 경로에 적어 둔 목표는 양자화 바이트를 그대로 두고 라우터가 고른 expert를 빠뜨리지 않는 쪽입니다. 논문의 4.62–19.74배 프리필과 1.25–4.09배 디코드는 그 논문의 베이스라인에 대한 숫자이고, 3060 표의 숫자가 아닙니다.

PowerInfer는 Song, Mi, Xie, Chen의 SOSP 2024 논문([arXiv:2312.12456](https://arxiv.org/abs/2312.12456))입니다. 단위는 MoE expert 팩이 아니라 뉴런입니다. 자주 켜지는 hot 뉴런을 GPU에 미리 올리고, cold 뉴런은 CPU에서 계산하며, 온라인 예측기로 이번에 켜질 뉴런을 고릅니다. 평가에 적힌 모델은 OPT, LLaMA2, Falcon이고 GPU는 RTX 4090과 2080 Ti입니다. Betelgeuse 주석이 1.2% 적중 때문에 꺼 둔 예측기는 그 계열의 아이디어가 이 체크포인트에서 기본값이 아니었다는 기록입니다. PowerInfer의 11.69배와 OPT-30B의 A100 대비 82%는 그 논문의 숫자입니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 가격과 시장 점유율은 이 글이 조사하지 않았습니다.

2026년의 로컬 MoE 서빙에서 12GB 스티커와 68GB 파일이 동시에 성립하려면, 병목은 카드 용량보다 페이지 캐시와 동기화 횟수 쪽에 있습니다. llama.cpp가 이미 갖고 있는 레버는 `--n-cpu-moe`, `-ot`, `--load-mode none`/`dio`, 그리고 RAM 안에 있는 expert를 위한 #29887 캐시입니다. Betelgeuse가 자기 PR에서 빈 자리로 적는 것은 그 파일이 **RAM보다 클 때**의 NVMe 페이징입니다. KTransformers는 CPU expert 계산과, 정확도가 조금 움직일 수 있는 deferral을 논문에 적습니다. PowerInfer는 뉴런 예측입니다. 같은 "소비자 GPU" 문장 안에 서로 다른 기계가 있습니다.

**분석/의견.** 이득이 가는 자리는 이미 RTX 3060 12GB와 16GB RAM과 NVMe가 있고, Linux에서 CUDA `sm_86`을 빌드할 수 있으며, 컨텍스트 512 전후의 짧은 생성이 목적인 사람입니다. 문서의 프로세스 상한은 12GiB이고 스왑은 0입니다. 8GiB victim 캐시는 그 상한 안에서 나옵니다. 가중치를 받을 디스크는 대략 68GB이고, 엔진 MIT가 그 가중치를 다시 라이선스하지 않습니다. 양자화 저장소 카드의 `license`는 `apache-2.0`이고, 베이스 모델 카드는 `license_name`이 `qwen-community-license-1.0`입니다. README는 상업 MaaS와 AI Work Assistant 제한이 베이스 라이선스에 있다고 적고, 번들을 조건 없는 Apache-2.0으로 보지 말라고 적습니다.

손해가 생기는 읽기는 네 가지입니다. 22.03을 지금 Hugging Face에 있는 네 파일의 콜드 스타트 속도로 읽으면, 문서가 그 숫자를 스트립 번들 이전의 반복 워크로드에 묶어 둔 문장이 빠집니다. 1.47 tok/s를 같은 문서의 최종 기준선으로 읽으면, `fluxaeros.md`가 나중에 적은 0.9 tok/s가 빠집니다. 48층 expert를 전부 풀정밀도로 계산한다고 읽으면, 모델 카드의 라우팅 10개와 IQ2_XS가 빠집니다. 모델 카드의 262,144컨텍스트가 이 속도에 포함된다고 읽으면, 인증된 `-c 512`가 빠집니다. 표의 프롬프트 처리가 초당 약 14–19토큰일 때 262,144토큰은 산술로 수 시간입니다. 그 나눗셈은 이 글의 계산이고, 긴 프롬프트를 잰 실험이 아닙니다.

PR은 머지되지 않았고, 봇이 크기와 설명을 지적했고, 5080에서의 한 casual 테스트는 플래그를 켜자 20.24에서 14.00으로 내려갔습니다. 그 한 줄이 3060 표를 반증하지는 않습니다. 기계와 컨텍스트가 다릅니다. 제품 문장으로 쓰기에는 재현이 한 작성자의 표 안에 있습니다. 릴리스 바이너리의 빌드 환경은 GCC 16.1.1, glibc 2.43, CUDA 13.3, 드라이버 610.43.02이고, liburing은 묶여 있지 않다고 릴리스 본문이 적습니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·자체 보고라 재현 전 / ❌ 사실 아님

확인 시각은 2026-11-05입니다. 처리량과 바이트 일치는 작성자가 적은 값이고, 이 글은 다시 재지 않았습니다.

### @ai_hakase_ 포스트

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| `bel-cli` / `bel-server`라는 커스텀 엔진 Betelgeuse가 있다 | ✅ | [저장소](https://github.com/Betelgeuse-AI/Betelgeuse) main `0101d796`, MIT, 릴리스 `v0.6.0-alpha-orionis`. README는 페이징이 실험적이고 일부가 깨져 `bel-server`를 우선하라고 적습니다. 커밋 작성자는 `zyxciss`입니다. |
| RTX 3060 12GB와 16GB RAM이 시험 기계다 | ✅ | README, `docs/fluxaeros.md`, [PR #31469](https://github.com/ggml-org/llama.cpp/pull/31469). PR은 싱글채널 DDR4-3200과 `MemoryMax=12G`를 덧붙입니다. 인증 범위는 Linux, `sm_86`, 컨텍스트 512, `-np 1`입니다. |
| 68GB Qwen 3.8 Flash Next, GSQ-RCO-IQ2_XS | ⚠️ | 모델은 [Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)가 있고, IQ2_XS 샤드는 [ISTA-DASLab](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF)에 있습니다. 68GB는 번들 저장 용량입니다. expert 팩 35.48GB, PLE 26.82GiB, dense 약 3.77GB. 파라미터 125B와 활성 6B는 모델 카드의 다른 단위입니다. |
| expert를 치지 않고 비트 단위로 기준 출력과 같다 | ⚠️ | 양자화 바이트를 다시 양자화하지 않는다는 문장과, 역사적 바이너리의 그리디 토큰 576/576·라우터 기록 28,080/28,080은 `fluxaeros.md`에 있습니다. 같은 문서가 스트립 번들에서 다시 맞춘 것은 8토큰입니다. MTP 스모크는 토큰 8에서 골든과 갈라졌습니다. 독립 재현은 이 글에 없습니다. |
| 웜 디코드 22.03 tok/s, 최대 48 tok/s | ⚠️ | 22.03은 `be9328717` 반복의 **2회차**이고 1회차는 16.29입니다. 16.80은 auto-warm을 켠 다른 행의 1회차이고 그 행의 2회차는 21.85입니다. README는 스트립 번들 성능을 보증하지 않는다고 적습니다. 48 tok/s는 첨부 화면의 제목에 있고, 측정 표의 최댓값은 22.03입니다. 자체 보고입니다. |
| 표준 llama.cpp mmap이 페이지 캐시 스래싱으로 1.47 tok/s | ⚠️ | 1.47 / 1.63과 208.3 / 235.0 MiB/tok은 PR 표에 있습니다. `fluxaeros.md`가 나중에 적은 같은 하드웨어 llama.cpp는 **0.9 tok/s**이고, 새 통제 측정이 아니라고 적습니다. mmap이 파일보다 작은 RAM에서 페이지를 반복해 읽는다는 설명은 PR의 진단입니다. |
| 48층 expert를 풀정밀도로 모두 계산하는 Zero Gate Pruning | ❌ | 그 이름은 README·측정 문서·PR·`llama-context.cpp`에서 찾지 못했습니다. 모델 카드는 층마다 512개 중 라우팅 10개와 공유 1개입니다. 저장 정밀도는 IQ2_XS입니다. PR의 문장은 고른 10개를 저장된 양자화 정밀도로 계산하고 드롭하지 않는다는 쪽입니다. 예측기 주석의 top-16 적중 1.2%는 기본 off의 이유입니다. |
| VRAM에 약 5,000슬롯을 층마다 비균일로 둔다 | ✅ | `moe_fixed_slots`의 48개 값은 합 4,996이고 층 0–4가 220, 최소 80입니다. `--moe-slots 5000`의 정수 스케일은 그 표를 유지합니다. 각 층에는 0으로 채운 센티넬 행이 하나 더 있습니다. |
| 디바이스에서 약 2µs에 히트를 푸는 인스트림 커널 | ⚠️ | `GGML_OP_MOE_SLOT_RESOLVE_KICK` / `WAIT`와 도어벨 커널은 `moe_doorbell.cu`에 있습니다. 히트는 디바이스 작업이라는 주석까지입니다. 2µs는 이 글이 연 README, `fluxaeros.md`, PR 본문, 그 커널 주석에 없습니다. |
| 배타적 RAM 캐시와 io_uring이 토큰당 약 71MB를 12.43MB로 줄인다 | ⚠️ | 12.43은 `be9328717` 행의 **2회차 MiB/생성토큰**입니다. 같은 행 1회차는 35.37입니다. 프로토콜은 프롬프트 읽기를 포함하고 256으로 나눕니다. PR의 mmap 칸은 208.3 / 235.0 MiB/tok입니다. 71MB는 그 표에 없습니다. 문서가 권하는 워커는 버퍼된 `io_uring`이고, `O_DIRECT`는 `MOE_HOT_K>0`인 콜드 갈래와 `fetch_batch`에 남아 있습니다. 배타적이라는 주석은 VRAM에 있는 집합의 페이지 캐시 사본을 놓는 쪽입니다. |
| 약 190GB `Q8_K_XL`이 웜 12 tok/s이고 DeepSeek V4.1 Flash 이식이 진행 중이다 | ⚠️ | README, `fluxaeros.md`, PR #31469, 릴리스 노트, Alpha-Orionis-XS 카드에서 그 두 문장을 찾지 못했습니다. ISTA-DASLab 저장소 API의 파일 이름에는 `Q8`이 들어가는 샤드가 없었습니다. 소스의 DeepSeek 문자열은 업스트림 llama.cpp의 V4 HC fused op 이름입니다. Reddit 전문은 403이라, 원 글이 다른 숫자를 적었는지는 이 글이 확인하지 못했습니다. |

**총평:** Betelgeuse라는 llama.cpp 포크가 있고, RTX 3060 12GB와 16GB RAM과 NVMe를 전제로 expert를 VRAM 슬롯과 호스트 캐시와 `io_uring`으로 가져온다는 뼈대는 저장소와 맞습니다. 느슨한 곳은 속도의 짝입니다. 22.03은 16.80과 같은 실행이 아니고, 지금 받는 네 파일 번들의 인증 속도도 아니며, 1.47은 작성자가 나중에 0.9로 적어 둔 기준과 다릅니다. "풀정밀도로 48층의 expert를 모두 계산"은 모델 카드의 top-10과 IQ2_XS와 다릅니다. 비트 일치는 스트립 번들 이전 바이너리의 576토큰 자체 검사이고, 번들 재확인은 8토큰입니다.

## 참고 자료

- 엔진, main `0101d7965f9f2b97e9a816ed08a72d5a7b731358` — [저장소](https://github.com/Betelgeuse-AI/Betelgeuse) · [README](https://github.com/Betelgeuse-AI/Betelgeuse/blob/0101d7965f9f2b97e9a816ed08a72d5a7b731358/README.md) · [docs/fluxaeros.md](https://github.com/Betelgeuse-AI/Betelgeuse/blob/0101d7965f9f2b97e9a816ed08a72d5a7b731358/docs/fluxaeros.md) · [llama-context.cpp의 슬롯 표](https://github.com/Betelgeuse-AI/Betelgeuse/blob/0101d7965f9f2b97e9a816ed08a72d5a7b731358/src/llama-context.cpp) · [moe_doorbell.cu](https://github.com/Betelgeuse-AI/Betelgeuse/blob/0101d7965f9f2b97e9a816ed08a72d5a7b731358/src/moe_doorbell.cu) · [릴리스 v0.6.0-alpha-orionis](https://github.com/Betelgeuse-AI/Betelgeuse/releases/tag/v0.6.0-alpha-orionis) · 작성자 [zyxciss](https://github.com/zyxciss)
- 가중치 레이아웃 — [Betelgeuse-AI/Alpha-Orionis-XS](https://huggingface.co/Betelgeuse-AI/Alpha-Orionis-XS) · 양자화 원본 [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) `ed59f920` · 베이스 [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) `de4b8e4d` · [Qwen 라이선스](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)
- 업스트림 — [PR #31469](https://github.com/ggml-org/llama.cpp/pull/31469) (open, zyxciss, 2026-10-31) · [PR #29887](https://github.com/ggml-org/llama.cpp/pull/29887) (merged 2026-10-07, am17an) · [CLI README의 `--load-mode`, `--cpu-moe`, `--n-cpu-moe`, `-ot`](https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md) (2026-11-05에 읽은 master)
- 비교 논문 — Chen 등, *KTransformers*, SOSP 2025, [ACM](https://dl.acm.org/doi/10.1145/3731569.3764843) · Song 등, *PowerInfer*, SOSP 2024, [arXiv:2312.12456](https://arxiv.org/abs/2312.12456)
- I/O — [io_uring(7)](https://man7.org/linux/man-pages/man7/io_uring.7.html)
- 요약의 출발점 — [@ai_hakase_ 포스트](https://x.com/ai_hakase_/status/2117196780311912786) (2026-11-02 10:07 UTC). 첨부 화면은 r/LocalLLaMA의 u/zyxciss 글입니다. 그 Reddit 본문은 이 환경에서 열리지 않았습니다.
