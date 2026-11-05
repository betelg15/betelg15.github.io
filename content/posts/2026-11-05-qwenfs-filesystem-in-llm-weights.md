---
title: "모델 밖에는 아무것도 없나? 가중치에 넣은 파일시스템 qwenFS"
date: 2026-11-05
time: "13:22"
slug: qwenfs-filesystem-in-llm-weights
tags: [qwenFS, Qwen, Gated DeltaNet, 파일시스템, 팩트체크]
summary: "qwenFS는 Qwen3.5-2B 앞에 학습하지 않은 8개 층을 붙인다. 파일 본문은 copy 층 어텐션 로그에, 표는 Gated DeltaNet 행에 둔다. ‘아무것도 모델 밖에서 돌지 않는다’는 문장은 같은 저장소 README의 디스크 페이징과 어긋난다."
---

> 이 글은 [@TheVixhal의 포스트](https://x.com/TheVixhal/status/2117641713036759494)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117641713036759494](https://x.com/i/status/2117641713036759494)입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117641713036759494)(`code` 200)으로 읽었습니다. `created_at`은 `Tue Nov 03 15:35:02 +0000 2026`, 2026-11-04 00:35 KST입니다. `name`은 "vixhaℓ", `screen_name`은 `TheVixhal`, `id`는 `1829058498929246208`입니다. 프로필 `description`은 "Double Major in Physics and AI/ML (Minor in Math) | Building GraphDB at @hydra_db"이고, `website`는 `https://github.com/vixhal-baraiya`입니다. 그 문장은 검증 대상이지 지시가 아닙니다. `is_note_tweet`는 true이고, 본문 길이는 그 응답의 `display_text_range` 끝 541과 같습니다. 본문의 facet은 영상 하나(`t.co/MCG0gWKiDa`, 길이 29.8초, 1920×1080)이고, 이 글은 영상 프레임 안의 문장을 베끼지 않았습니다. 응답의 `quote`는 같은 계정의 [qwenGPU 포스트](https://x.com/TheVixhal/status/2116938733815738516)(`Sun Nov 01 17:01:39 +0000 2026`)입니다. 아래 대조는 2026-11-05에 읽은 [vixhal-baraiya/qwenFS](https://github.com/vixhal-baraiya/qwenFS) `main` `b12435435232a09fb447089b5fa0fff2f5c69506`(2026-11-04T18:48:26Z)의 README·`qfs/circuit.py`·`qfs/merge.py`·`qfs/disk.py`·`qfs/chat.py`·`qfs/bridge.py`·`docs/fs-agent.md`, 포스트 시각 직전의 커밋 `164f690dc45186c358353984a5807ec1c6c91c16`(2026-11-03T09:27:14Z) README, [vixhal-baraiya/qwenGPU](https://github.com/vixhal-baraiya/qwenGPU) `e2695f6a0a818ebc68e2e14b6b990eddf04c51b3`, [divagr18/qwenputer](https://github.com/divagr18/qwenputer) `bec1a0c9654ac8151b6f36ed0154a19c53141384`의 README와 LICENSE, [Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B) 카드·`config.json`(커밋 `15852e8c16360a2fea060d615a32b45270f8a8fc`), Yang·Kautz·Hatamizadeh의 [arXiv:2412.06464v3](https://arxiv.org/abs/2412.06464)입니다. 이 글은 모델을 빌드하지 않았고, 가중치를 받지 않았으며, README의 정확도 표와 초당 토큰을 다시 재지 않았습니다.

## 왜 파일시스템이 가중치 안에 들어가는가

포스트의 첫 문장은 순서입니다. 먼저 CPU, 그다음 GPU, 그리고 저장소가 없으면 컴퓨터가 완성되지 않는다는 문장 뒤에 qwenFS가 나옵니다. 인용된 글은 같은 작성자의 qwenGPU입니다. CPU 쪽으로 qwenGPU README가 이름을 적는 프로젝트는 다른 사람, Divyansh Agrawal의 Qwenputer입니다.

개발자에게 닿는 지점은 "모델이 파일을 기억한다"가 아닙니다. 도구 서버가 응답 토큰을 고르는 구조와, 그 선택이 포워드 패스 안의 고정 회로에서 나오는 구조는 다릅니다. qwenFS README의 문장은 플러그인도, 도구 서버도, API 뒤의 데이터베이스도 아니라는 것입니다. 파일시스템 층은 Qwen3.5-2B의 24층 앞에 붙는 8개 층이고, 그 가중치는 학습되지 않습니다. 호출은 Qwen이 원래 쓰던 도구 호출 형식이고, 응답 토큰은 그 회로가 고릅니다.

같은 계열의 앞선 파일시스템은 Qwenputer README의 "In-weight filesystem"입니다. 그쪽은 RISC-V 모델에 `put` `append` `get` `list` `delete`를 더하고, 이름 해시로 DeltaNet 상태의 디렉터리 슬롯을 고릅니다. 상한은 512개 파일, 약 53,000토큰입니다. qwenFS는 그 코드를 가져오지 않습니다. README Related는 qwenGPU만 링크하고, 층을 Qwen3.5의 레이어 타입에 직접 쓴다고 적습니다.

## 가중치는 학습 루프 없이 채워진다

`qfs/circuit.py` 모듈 독스트링이 층을 나눈 순서입니다. 0부터 7까지, 타입은 `linear_attention` 다섯 개와 `full_attention` 세 개입니다. `linear_attention`이 Qwen 카드가 Gated DeltaNet이라고 부르는 층이고, `full_attention`이 일반 어텐션입니다.

| 층 | 타입 | 하는 일 (모듈 독스트링) |
|---|---|---|
| P (0) | DeltaNet | 직전 토큰의 플래그·단어 형태를 지연 레지스터에 둔다 |
| 1 | DeltaNet | 경로 슬롯과 데이터 오프셋 카운터, 호출 레지스터 |
| 2 | DeltaNet | 경로 슬롯, 연산 레지스터, 파일 개수, 단어 플래그 |
| 3 | 어텐션 | 경로를 이전 ack의 경로와 맞춰 파일 인덱스를 찾는다 |
| 4 | DeltaNet | 버전 표, 경로 표, 베이스 표, 읽는 파일의 버전 |
| 5 | DeltaNet | ack와 호출의 소스·타깃, 쓴 텍스트의 베이스를 유지 |
| 6 | 어텐션 | 검색어와 링크 쌍을 seek 층의 행과 맞춘다 |
| 7 | 어텐션 | 읽기의 (인덱스, 버전, 오프셋)으로 저장된 토큰을 복사 |

`embeddings()`는 토큰 벡터의 지정 차원에 플래그를 심습니다. `=name`, `=text`, `=target`, `=query`, 줄바꿈, `</tool_call>` 같은 Qwen 도구 형식의 단일 토큰이 각 플래그 차원에서 1이 됩니다. MLP는 그 플래그 조합이 맞을 때만 relu가 1이 되도록 게이트와 업 프로젝션을 손으로 넣습니다. `Delta.register`는 키가 켜진 토큰에서 상태 행 하나를 쓰고, 매 토큰에서 그 행을 읽습니다. 주석은 세트 레일을 2, 8, 32, 128개 중 하나로 패딩해 헤드 노름의 스케일이 2의 거듭제곱이 되고, 읽기가 정확히 0/1 또는 ±1로 돌아온다고 적습니다.

호출 종류는 파라미터 토큰으로 갈립니다. 텍스트가 있으면 쓰기, 타깃이 있으면 링크, 쿼리가 있으면 검색입니다. 함수 이름 토큰으로 가르는 것은 `unlink`와 `append`뿐입니다. 독스트링이 그렇게 적습니다.

아래는 회로를 실행하는 코드가 아닙니다. `circuit.py`가 가중치에 심는 자료 배치를 줄인 스케치입니다.

```python
# 스케치. 학습은 없다. 실제 행렬은 qfs/circuit.py의 fill()이 채운다.
# 파일 본문: copy 층(7) 어텐션 로그. 키 = (file, version, offset)
# 표: DeltaNet 행. 한 행을 덮어 버전·경로·베이스·파일 개수를 유지한다.

def on_write_token(file_i, version, offset, token_id):
    attention_log.append(key=(file_i, version, offset), value=token_id)

def on_read_token(file_i, version, offset):
    # 같은 키로 질의. 맞는 행의 값 차원이 그 토큰의 출력 코드가 된다.
    return attention_copy(query=(file_i, version, offset))
```

상수로 박혀 있는 상한은 `NFILE = 128`, 경로 슬롯 `NSLOT = 8`, 오프셋 카운터 `NMAX = 600`, 버전 비트 `VB = 6`, 검색어 토큰 `S = 3`입니다. README 한계 문장은 이 상수와 같이 읽힙니다. 파일 128개, 경로 최대 8토큰, 쓰기나 append 한 번이 약 590토큰, 파일당 쓰기와 append 63번이라 파일 하나가 약 37,000토큰입니다. 모듈 독스트링은 세그먼트가 최대 63개, 각 약 590토큰이라고 적습니다. 카운터의 정확 범위는 600토큰입니다.

## 파일 본문은 어텐션 로그다

쓰기나 append 하나의 본문은 copy 층 어텐션 로그에 `(파일 인덱스, 버전, 오프셋)`으로 남습니다. 읽기는 그 키로 질의하고, 값 프로젝션이 토큰 id 코드를 출력 차원으로 복사합니다. `layer_copy` 독스트링의 문장입니다. 쓰기의 텍스트 토큰만 키가 살아 있고, 텍스트를 여는 줄바꿈은 빠집니다.

한 파일은 마지막 `write_file` 이후의 세그먼트 사슬입니다. append는 새 버전을 하나 더합니다. 읽기는 베이스에서 시작하고, 마지막이 아닌 세그먼트의 끝에서는 `</tool_response>` 대신 다음 세그먼트의 읽기 ack를 냅니다. ack가 오프셋 카운터를 다시 시작합니다. 그래서 한 번의 쓰기 길이보다 긴 파일이 됩니다.

층 3의 어텐션은 경로 조회입니다. 경로의 끝 토큰이 그 파일의 인덱스를 찾고, 정확한 일치와 가까운 불일치 사이의 점수로 "not found"에 떨어집니다. 층 6(seek)은 단어마다 한 행, 링크 변화가 있을 때마다 한 행을 둡니다. 검색은 응답 토큰마다 파일 하나를, 그 파일의 현재 베이스에 대해 확인합니다. 예전 버전에만 있던 단어는 맞지 않습니다. 링크는 +1 행과 -1 행이 번갈아 쌓이고, 평균이 0보다 크면 연결된 것으로 읽습니다. 상태가 바뀌지 않는 호출은 행을 더하지 않고, Qwen에게는 같은 단어로 보이는 no-op 변형("linked" / "removed")을 냅니다.

검색이나 링크 목록이 지나치는 파일은 skip 토큰입니다. 임베딩에서 skip은 줄바꿈의 0.25배라, Qwen의 층은 그 토큰을 줄바꿈으로 읽습니다. 목록에 찍히는 마커는 "-"의 0.25배입니다. `merge.py`의 `ALIAS = 0.25`가 그 스케일입니다.

## 표는 Gated DeltaNet의 한 행이다

Yang, Kautz, Hatamizadeh의 *Gated Delta Networks: Improving Mamba2 with Delta Rule*는 arXiv:2412.06464v3, 2025-03-06입니다. NVIDIA 페이지는 ICLR 2025라고 적고, [NVlabs/GatedDeltaNet](https://github.com/NVlabs/GatedDeltaNet)의 인용 블록도 같은 학회입니다. 식 (10)은 상태 행렬을 이렇게 갱신합니다.

```text
S_t = S_{t-1} @ (alpha_t * (I - beta_t * k_t @ k_t^T)) + beta_t * v_t @ k_t^T
```

`alpha_t`가 0에 가까우면 상태가 지워지고, 1에 가까우면 델타 규칙만 남아 맞는 키의 값만 갈아끼웁니다. 논문 서론이 그 두 끝을 그렇게 설명합니다. Qwen3.5-2B 카드의 언어 모델 배치는 이 층을 이미 씁니다. 은닉 2048, 층 24, 배치 `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, 선형 어텐션 헤드 16, 헤드 차원 128입니다. `config.json`의 `layer_types`는 `linear_attention` 세 번 뒤에 `full_attention`이 오는 패턴이 24층 끝까지 반복됩니다. `hidden_size` 2048, `num_hidden_layers` 24, `vocab_size` 248320, `max_position_embeddings` 262144입니다.

qwenFS가 그 갱신을 레지스터로 쓰는 방식은 Qwenputer README가 RAM이라고 적은 배치와 같습니다. 게이트를 열어 두고, 키를 한 행에 고정하면 그 행만 덮입니다. `circuit.py`의 `Delta.register`는 쿼리 채널을 `ONE` 차원의 20으로, 베타를 30으로, 감쇠 입력을 -100으로 두어 그 행이 매 토큰 유지되게 합니다. 오프셋은 다른 머리입니다. 모듈 독스트링은 앵커 이후 `alpha = 2^(-1/16)`로 줄어드는 카운터를, 헤드 노름의 eps 구간에서 읽어 600토큰까지 정확히 디코드한다고 적습니다. 코드의 감쇠 상수는 `Y = -3.125`입니다. 이 글은 그 로짓이 Qwen 구현에서 어떤 `alpha`로 풀리는지 다시 계산하지 않았습니다.

현재 `main`에서 DeltaNet이 잡는 표는 버전, 베이스, 경로, 파일 개수, 호출 상태입니다. 링크 행은 seek 어텐션에 있습니다. 그 이동은 커밋 `6e3eaee47bf3bc687a084f8d5a8737eb9072a8a6`(2026-11-04T18:41:48Z, "128 files: links and search on a seek layer")입니다. 포스트 시각의 트리 `164f690` README는 링크를 DeltaNet 상태의 `(source, target)` 행으로 적고, 파일 상한을 32로 적습니다.

정확도를 고정하는 다른 장치는 밸러스트입니다. 토큰마다 4차원에 8192를 넣고, 주석은 `sqrt(4 * 8192^2 / 4096) = 256`이 되어 FS 층 노름이 상수 스케일이 된다고 적습니다. 꺼진 키는 0 근처가 아니라 0보다 훨씬 아래에 둡니다. 주석이 이유를 적습니다. DeltaNet 키의 l2 노름이 작은 값을 다시 1로 키우기 때문입니다.

## 병합 뒤에 남는 것, 그리고 디스크

`qfs.merge`는 잔차를 2048에서 4096으로 넓히고, Qwen 행렬의 빈칸을 0으로 채우고, 디코더와 최종 노름 게인에 `sqrt(2048/4096)`을 곱합니다. FS 층이 앞쪽 8개, Qwen 층이 뒤쪽 24개입니다. FS 토큰은 어휘 뒤에 붙습니다. 출구 MLP는 FS 차원을 지우고, id 차원에만 `EPS = 1/64` 크기의 출력 코드를 남깁니다. 최종 노름이 그 코드를 키워, 강제 토큰이 Qwen의 로짓보다 앞에 섭니다. 코드가 0인 위치에서는 Qwen 로짓이 그대로입니다. README는 상위 1 예측이 확인한 139곳에서 같고, KL이 약 2.5e-3이라고 적습니다. 원인은 bf16으로 게인을 반올림한 것이라고 같은 문장이 적습니다.

`merge.py` 맨 위 독스트링은 아직 "2048 to 3072"와 `sqrt(2048/3072)`라고 적습니다. 같은 파일의 `WIDE`는 `sqrt(2048 / F.H)`이고 `circuit.py`의 `H`는 4096입니다. README도 4096입니다. 독스트링과 상수가 어긋나 있습니다.

디스크는 모델 가중치 밖의 이미지입니다. `disk.py`는 경로, 세그먼트 길이, 토큰 id 3바이트, 링크 쌍을 디렉터리에 씁니다. README는 저장 토큰당 약 3.3–3.8바이트라고 적습니다. 새 세션은 표를 마운트하고, 모델이 그 세그먼트의 읽기 ack를 내는 순간에만 본문을 페이지인합니다. 페이지인은 토큰 id를 그 층의 `k_proj`, `k_norm`, `v_proj`로 다시 넣어 copy 행을 만듭니다. 호스트가 본문을 생성하지는 않고, 행을 다시 심습니다.

README "What runs where"가 위치를 나눕니다.

- 가중치: 호출 파싱, 조회, 표 갱신, 강제 토큰, 읽기로 복사되는 토큰. 응답이 무슨 말을 할지는 모델 밖이 정하지 않는다.
- `qfs/chat.py`: 토큰을 디코드하고 `<|im_end|>`에서 멈춘다. 온도 0.7. 그리디에서는 2B 모델이 도구 호출을 반복하는 경향이 있다. 강제 토큰은 로짓이 수백 앞서 샘플링이 바꾸지 못한다.
- `qfs/disk.py`: 읽기 ack가 나오면 런타임이 그 파일의 바이트를 올린다. README는 디스크 컨트롤러에 비유한다.
- `qfs/monitor.py`: 패널이 DeltaNet 상태에서 파일시스템을 읽어 그린다. 패널은 자기 사본을 두지 않는다.

코드의 기본 온도도 0.7입니다. `bridge.py`의 `Session` 기본 `temp`와 `chat.py`의 `--temp`가 그렇습니다. `Chat`의 기본 `top_p`는 0.9입니다. README 본문은 top-p를 적지 않습니다.

## 측정과 한계

README Results는 Apple silicon, MPS, bf16에서 강제 토큰을 회로의 참조와 맞춘 숫자입니다. 이 글은 그 명령을 실행하지 않았습니다.

- 스크립트 세션 두 시드, 파일 10개: 강제 토큰 6308/6308과 6372/6372, 응답 70/70.
- 파일 128개 전부: 5355/5355.
- 빈 문맥의 새 세션에서 디스크의 파일에 append한 뒤 세그먼트를 가로질러 읽기: 5989/5989, 47/47. 마운트한 이미지 위에 두 번 저장해도 이미지는 그대로.
- Qwen3.5-2B에 합친 모델: 9,484토큰 세션과, append·링크·검색이 있는 6파일 세션에서 prefill과 토큰 단위로 정확. 128파일 세션은 prefill 한 번으로 정확.

시나리오 평가(저장과 회상, 목록 수정, 정리, 검색, 링크와 백링크, 링크 하나 제거, 없는 파일, 시드 3개, 턴 57)는 문서가 있을 때 57/57, 시나리오 21/21, 불필요한 호출 0입니다. 문서가 없으면 49/57, 17/21, 불필요한 호출 40입니다. README는 실패가 파일시스템의 답이 아니라 Qwen의 호출이라고 적습니다. Bob을 `people/alice.txt`에 저장한 뒤 Tokyo 검색이 그 파일을 맞게 찾거나, 호출을 반복하다 턴의 토큰이 끝난 경우입니다. 표본이 작다고 같은 문단이 적습니다.

한계로 README가 적는 것은 부분 수정이 없다는 것, 검색이 대소문자를 가리는 단어 하나(`Paris`는 되고 `paris`는 안 됨)이고 그 단어가 Qwen이 단독으로 쓸 때 3토큰 이하여야 한다는 것, 더 긴 단어는 찾지 못한다는 것, 본문에 `</`가 들어갈 수 없다는 것, 검색과 링크 목록이 파일마다 토큰을 하나씩 찍어 파일이 많으면 응답이 길어진다는 것입니다. 약한 쪽은 파일시스템이 아니라 Qwen의 판단이라고 적습니다. 대화만 보고 파일을 안 읽거나, 요청하지 않은 호출을 만듭니다. 속도는 MPS에서 약 20토큰/초이고, 이유는 Gated DeltaNet의 PyTorch 폴백 커널이라고 적습니다. 빠른 시작이 요구하는 메모리는 합쳐진 모델 기준 약 16GB입니다. Apple silicon, NVIDIA GPU, CPU를 같은 문장이 적습니다.

시스템 프롬프트 기본값은 `docs/fs-agent.md`입니다. `qfs/gen_doc.py`가 예제 응답을 합쳐진 모델로 찍는다고 README가 적습니다. 그 문서의 첫 문단은 대화 기억이 틀릴 수 있고 파일이 진실이니, 저장한 내용을 답하려면 먼저 읽으라고 합니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 로컬 에이전트 메모리 시장의 점유율은 이 글이 측정하지 않았습니다. qwenFS README는 가격표도, 호스팅 API도 적지 않습니다. 2026-11-05 04:18:29 GMT의 허브 `search=qwenFS`는 모델 0건이었습니다. 배포 경로는 README 빠른 시작입니다. `just build`가 `Qwen/Qwen3.5-2B`를 받고 파일시스템을 그 위에 컴파일합니다.

같은 시각의 GitHub 메타데이터는 이렇습니다. 응답 `Date`는 셋 다 `Thu, 05 Nov 2026 04:16:41 GMT`입니다.

| 저장소 | 별 | 포크 | 라이선스 필드 |
|---|---|---|---|
| [vixhal-baraiya/qwenFS](https://github.com/vixhal-baraiya/qwenFS) | 89 | 8 | SPDX `MIT`. LICENSE 저작권 줄은 "Copyright (c) 2026 TheVixhal" |
| [vixhal-baraiya/qwenGPU](https://github.com/vixhal-baraiya/qwenGPU) | 117 | 17 | SPDX `MIT` |
| [divagr18/qwenputer](https://github.com/divagr18/qwenputer) | 658 | 79 | API `license.spdx_id`는 `NOASSERTION`. LICENSE 첫 줄은 "MIT License", 저작권은 "Copyright (c) 2026 Divyansh Agrawal" |

베이스 체크포인트의 분포는 그 별과 다른 자리입니다. 2026-11-05 04:15:15 GMT 허브 API에서 `Qwen/Qwen3.5-2B`의 `downloads`는 3,388,358, `likes`는 465, `cardData.license`는 `apache-2.0`이었습니다. qwenFS README는 합쳐진 체크포인트의 가중치가 Qwen의 Apache-2.0 아래에 있다고 적습니다. 코드는 MIT입니다. 카드의 모델 개요는 파라미터 2B, 용도를 프로토타이핑과 과제별 미세조정, 연구·개발이라고 적습니다. 카드 하이라이트의 "sparse Mixture-of-Experts" 문장은 Qwen3.5 전반의 문장이고, 2B 개요의 층 배치는 전문가 수를 적지 않습니다. 이 글은 2B를 MoE로 세지 않습니다.

비교로 쓸 수 있는 1차 표는 Qwenputer README의 파일시스템 실험입니다. 다중 세션 회상 90문항에서 베이스 Qwen3.5-4B는 7.8, Qwenputer Filesystem은 83.3, 호스트의 파이썬 도구는 78.9입니다. 나중 세션에서 바뀐 사실 30문항은 3.3, 90.0, 83.3입니다. README는 이 파일시스템이 실험 중이고 코드가 `rv-store` 브랜치에 있다고 적습니다. 모델 카드에 빠른 시작과 전체 결과가 있다고 같은 절이 적으며, 이 글은 그 카드를 다시 열어 표의 칸을 대조하지 않았습니다. qwenFS의 시나리오 57턴은 이 표와 다른 과제입니다. 둘을 같은 정확도로 읽을 숫자는 어느 쪽 README에도 없습니다.

qwenGPU README가 자기 실행에서 적은 숫자는 따로 있습니다. 회로의 참조 인터프리터가 NVIDIA Tesla T4와 테스트 커널 49/49에서 맞았고, 텍스트 KL은 약 7e-4입니다. 일반 모드는 샘플 채팅 24개 중 20개를 GPU에서 계산한 숫자로 답했고, 고급 모드는 벡터·행렬 질문 5개 중 4개에서 첫 시도에 맞는 커널을 썼습니다. 발사 속도는 MPS에서 약 10–15토큰/초입니다. 호스트가 CUDA를 PTX로 컴파일한다고 그 README가 적습니다. qwenFS README는 그 컴파일러를 쓰지 않는다고 적습니다.

**분석/의견.** 이득이 가는 자리는 이미 2B급 가중치를 올릴 메모리 약 16GB가 있고, 도구 서버 없이 "저장한 문장은 토큰 단위로 그대로 돌아와야 한다"를 체크포인트 안에 두고 싶은 실험입니다. README의 20토큰/초, 파일 128개, 단어 단위의 대소문자 구분 검색, 부분 수정 없음이 그 자리의 경계입니다. 호스트 쪽 파일도구가 이미 있는 제품은 Qwenputer 표에서 파이썬 도구 열이 보여 주듯, 정확도의 상한이 모델 안에 있어야만 하는 것은 아닙니다. qwenFS가 그 표의 83.3이나 90.0을 재현했다는 문장은 이 저장소에 없습니다.

비용으로 문서가 적는 것은 구독료가 아닙니다. Qwen3.5-2B를 한 번 받고, 잔차를 4096으로 넓힌 32층 체크포인트를 메모리에 두고, 대화가 바뀌는 턴마다 디스크 이미지를 갱신하는 쪽입니다. 토큰 API의 미터가 없는 범위는 그 로컬 포워드입니다. 허브에서 베이스 가중치를 받는 일과, MPS 폴백 커널의 20토큰/초는 그 범위 밖에 있습니다.

채택 쪽에서 저장소가 아직 적은 이유는 별 89개라는 숫자만으로 단정하지 않습니다. README가 배포 단위로 적는 것이 미리 만든 체크포인트가 아니라 `just build`이고, 허브 검색 0건은 그 설명과 맞습니다. 도구 호출을 이미 서버에서 실행하는 에이전트 스택은 이 8개 층을 넣지 않아도 파일 응답을 만들 수 있습니다. 이 회로가 대신 고정하는 것은 응답 문자열이 참조 회로와 토큰 단위로 같다는 README의 검사입니다.

손해가 생기는 읽기는 세 가지입니다. "모델 밖 런타임이 0이다"로 보면 디스크 컨트롤러와 채팅 루프와 패널이 빠집니다. "링크까지 DeltaNet 표다"로 보면 2026-11-04의 seek 층 이동이 빠집니다. "Qwen이 파일을 판단한다"로 보면, 판단은 Qwen이고 강제되는 것은 호출이 이미 쓰인 뒤의 응답이라는 README의 약한 부분 문장이 빠집니다. 코드를 제품에 넣을 때의 라이선스는 두 겹입니다. 프로그램은 MIT이고, 합쳐진 가중치는 README가 Apache-2.0이라고 적습니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·이후 커밋에서 바뀜 / ❌ 사실 아님

본문은 fxtwitter `text`입니다. `display_text_range`는 `[0, 541]`입니다.

### @TheVixhal 포스트 (2026-11-03 15:35 UTC)

| 주장 | 판정 | 근거 |
|---|---|---|
| 먼저 CPU, 그다음 GPU | ⚠️ | 이 포스트의 `quote`는 [qwenGPU 발표](https://x.com/TheVixhal/status/2116938733815738516)가 맞다. [qwenGPU README](https://github.com/vixhal-baraiya/qwenGPU/blob/e2695f6a0a818ebc68e2e14b6b990eddf04c51b3/README.md)가 CPU로 적는 이름은 [Qwenputer](https://github.com/divagr18/qwenputer)이고, 저자는 LICENSE의 Divyansh Agrawal이다. 2026-11-05에 읽은 `vixhal-baraiya` 공개 저장소 목록에는 가중치 안 CPU 저장소가 없다. qwenFS README Related는 qwenGPU만 링크하고 코드를 공유하지 않는다고 적는다. |
| 저장소가 없으면 컴퓨터가 완성되지 않는다 | ⚠️ | 측정이 붙은 문장이 아니다. 이어지는 프로젝트 이름은 저장소의 설명 문장 "a filesystem compiled and inserted directly into its weights"와 같다. |
| qwenFS는 Qwen3.5-2B이고, 파일시스템이 가중치에 직접 컴파일되어 있다 | ✅ | [README](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/README.md) 첫 문단. 가중치는 학습되지 않고 `circuit.py`의 `fill()`이 채운다. qwenGPU가 쓰는 Qwenputer 컴파일러와는 코드를 공유하지 않는다고 Related가 적는다. "컴파일"은 그 저장소의 말이지, 별도의 컴파일러 바이너리는 이 트리에 없다. |
| 모델 밖에서는 아무것도 돌지 않는다 | ❌ | 포스트보다 앞선 [164f690 README](https://github.com/vixhal-baraiya/qwenFS/blob/164f690dc45186c358353984a5807ec1c6c91c16/README.md)의 "What runs where"가 이미 채팅 루프, 디스크 페이징, 패널을 모델 밖으로 적는다. 디스크 문장은 "like a disk controller"이다. 같은 절의 가중치 항만 "Nothing outside the model decides what a response says"로 범위를 좁힌다. HEAD `b124354`도 그 네 줄을 유지하고, 바뀐 턴마다 `fs/`에 저장한다고 빠른 시작이 적는다. |
| Qwen 자신의 24층 앞에 8개 층을 더한다 | ✅ | `LAYERS` 길이 8. 카드와 `config.json`의 `num_hidden_layers`는 24. `merge()`는 `len(FS_LAYERS) + n0`이다. |
| 어텐션이 파일을 잡고, Gated DeltaNet 상태가 표를 잡는다 | ⚠️ | 파일 본문이 copy 층 어텐션 로그인 것은 `164f690`과 HEAD가 같다. 포스트 시각의 README는 링크·버전·경로·파일 개수·호출 상태를 DeltaNet에 둔다고 적는다. HEAD README는 DeltaNet 표를 버전·베이스·경로·파일 개수·호출 상태로 좁히고, 링크와 단어 행은 seek 어텐션(`6e3eaee`, 2026-11-04)으로 옮겼다고 적는다. |
| 저장과 읽기가 모두 모델의 포워드 패스에서 돈다 | ⚠️ | 같은 세션에서 쓴 본문이 copy 로그에 들어가는 것은 `layer_copy`가 맞다. 디스크에 있는 파일의 읽기는 ack가 나온 뒤 `disk.py`가 copy 행을 다시 만든다. 이미지는 호스트가 `compact`로 토큰 로그에서 잘라 쓴다. |
| 쓰기는 본문을 copy 층의 어텐션 로그에 두고, 키는 파일·버전·오프셋이다 | ✅ | HEAD 모듈 독스트링: "file text — the copy layer's attention log, keyed by (index, version, offset)". 쓰기와 append는 각 세그먼트가 자기 버전이다. 포스트 시각의 README도 같은 키를 적는다. |
| 읽기는 그 키를 다시 쓰고, 어텐션이 토큰 단위로 정확히 복사한다 | ✅ | `layer_copy` 독스트링. 여러 세그먼트면 세그먼트 끝의 읽기 ack가 오프셋을 다시 시작한 뒤 다음 세그먼트를 같은 방식으로 복사한다. README Results의 강제 토큰 일치는 작성자가 MPS에서 잰 값이고, 이 글은 다시 재지 않았다. |

**총평:** qwenFS 저장소는 있고, 작성자 프로필의 깃허브와 저장소 소유자가 같습니다. 8개 층, Qwen 24층, copy 층에 `(파일, 버전, 오프셋)`으로 본문을 두고 읽기에서 그대로 복사한다는 문장은 소스와 맞습니다. 포스트 본문에서 가장 벗어난 문장은 "Nothing runs outside the model"입니다. 그 문장이 올라가기 전에 README는 이미 디스크 페이징을 모델 밖 디스크 컨트롤러로 적어 두었습니다.

## 참고 자료

- 계기 포스트 — [@TheVixhal, 2026-11-03 15:35 UTC](https://x.com/TheVixhal/status/2117641713036759494) · [i/status](https://x.com/i/status/2117641713036759494) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2117641713036759494)
- 인용된 GPU 포스트 — [@TheVixhal, 2026-11-01 17:01 UTC](https://x.com/TheVixhal/status/2116938733815738516)
- qwenFS `b12435435232a09fb447089b5fa0fff2f5c69506`, 2026-11-04T18:48:26Z — [저장소](https://github.com/vixhal-baraiya/qwenFS) · [README](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/README.md) · [circuit.py](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/qfs/circuit.py) · [merge.py](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/qfs/merge.py) · [disk.py](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/qfs/disk.py) · [chat.py](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/qfs/chat.py) · [bridge.py](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/qfs/bridge.py) · [fs-agent.md](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/docs/fs-agent.md) · [LICENSE](https://github.com/vixhal-baraiya/qwenFS/blob/b12435435232a09fb447089b5fa0fff2f5c69506/LICENSE)
- 포스트 시각의 트리 `164f690dc45186c358353984a5807ec1c6c91c16`, 2026-11-03T09:27:14Z — [그 커밋의 README](https://github.com/vixhal-baraiya/qwenFS/blob/164f690dc45186c358353984a5807ec1c6c91c16/README.md). 링크는 DeltaNet, 파일 상한 32, 잔차 폭 3072
- 링크를 seek 층으로 옮긴 커밋 `6e3eaee47bf3bc687a084f8d5a8737eb9072a8a6`, 2026-11-04T18:41:48Z
- 별·포크 — 2026-11-05 04:16:41 GMT `GET /repos/vixhal-baraiya/qwenFS` (89, 8, MIT), `GET /repos/vixhal-baraiya/qwenGPU` (117, 17, MIT), `GET /repos/divagr18/qwenputer` (658, 79, `NOASSERTION`)
- qwenGPU `e2695f6a0a818ebc68e2e14b6b990eddf04c51b3`, 2026-11-01T16:48:06Z — [README](https://github.com/vixhal-baraiya/qwenGPU/blob/e2695f6a0a818ebc68e2e14b6b990eddf04c51b3/README.md). 45층, 4레인, 레인당 레지스터 15, 4단 파이프라인, 전역 메모리 126워드. 생성 2026-11-01T13:45:16Z
- Qwenputer `bec1a0c9654ac8151b6f36ed0154a19c53141384` — [README](https://github.com/divagr18/qwenputer/blob/bec1a0c9654ac8151b6f36ed0154a19c53141384/README.md) · [LICENSE](https://github.com/divagr18/qwenputer/blob/bec1a0c9654ac8151b6f36ed0154a19c53141384/LICENSE). Qwen3.5-4B 앞 11층, RV32IM, 파일시스템 실험은 `rv-store`와 [divagr1925/Qwen3.5-4B-Qwenputer-Filesystem](https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem). 생성 2026-10-19T11:48:10Z
- Qwen3.5-2B `15852e8c16360a2fea060d615a32b45270f8a8fc` — [모델 카드](https://huggingface.co/Qwen/Qwen3.5-2B) · [config.json](https://huggingface.co/Qwen/Qwen3.5-2B/blob/15852e8c16360a2fea060d615a32b45270f8a8fc/config.json). 2026-11-05 04:15:15 GMT API. downloads 3,388,358, likes 465, `license` `apache-2.0`. 카드가 가리키는 블로그는 [qwen.ai/blog?id=qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- 허브 모델 검색 `qwenFS` — 2026-11-05 04:18:29 GMT 응답은 빈 목록
- Yang, Kautz, Hatamizadeh, *Gated Delta Networks: Improving Mamba2 with Delta Rule*, arXiv:2412.06464v3, 2025-03-06. [abs](https://arxiv.org/abs/2412.06464) · [HTML](https://arxiv.org/html/2412.06464) · [ICLR 2025 초록](https://proceedings.iclr.cc/paper_files/paper/2025/hash/4904fad153f6434a7bcf04465d4be2cc-Abstract-Conference.html) · [코드](https://github.com/NVlabs/GatedDeltaNet)
