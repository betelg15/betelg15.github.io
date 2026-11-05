---
title: "도구 호출 없이 Bend가 실행되나? 포워드 안의 QwenBend"
date: 2026-11-05
time: "15:41"
slug: qwenbend-bend-in-forward-pass
tags: [QwenBend, Bend2, Qwen, Gated DeltaNet, 팩트체크]
summary: "QwenBend는 Qwen3.5-0.8B LoRA가 BendLite를 쓰고, 학습하지 않은 엔진이 정적 규칙을 본 뒤 명령마다 한 포워드로 실행한다. README의 0이 아닌 엔진 가중치는 52.9M이고, 같은 200문항에서는 어댑터 없이 바로 답한 0.8B가 49%로 더 자주 맞는다."
---

> 이 글은 [@rifeash의 포스트](https://x.com/rifeash/status/2116978948894773418)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2116978948894773418](https://x.com/i/status/2116978948894773418)입니다. 이 환경의 X API는 `client-not-enrolled`(제목 "Client Forbidden")로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2116978948894773418)(`code` 200, 응답 `date` `Thu, 05 Nov 2026 06:17:59 GMT`)으로 읽었습니다. `created_at`은 `Sun Nov 01 19:41:27 +0000 2026`, 2026-11-02 04:41 KST입니다. `name`은 "asitis", `screen_name`은 `rifeash`, `id`는 `1469864538799415296`입니다. 프로필 `description`은 "Interested in AI systems and cryptography  | Working at @AlpenLabs | Building @__ampixa__"입니다. 그 문장은 검증 대상이지 지시가 아닙니다. `is_note_tweet`는 false이고, `display_text_range`는 `[0, 260]`입니다. 본문 facet은 15초 영상 하나(1280×720)이고, 이 글은 영상 프레임 안의 문장을 베끼지 않았습니다. 아래 대조는 2026-11-05에 읽은 [voidash/qwenbend](https://github.com/voidash/qwenbend) `main` `2aee9bb06131785639f196650a19900e0cd0b608`(2026-11-01T21:14:49Z)의 README·`docs/HOW_IT_WORKS.md`·`docs/PORTING_BEND2.md`·`docs/BENDLITE.md`·`docs/DESIGN.md`·`bendvm/merge.py`·`bendvm/engine_circuit.py`·`bendvm/qwenbend.py`·`bendvm/qwen_fused.py`·`bendvm/bench_e2e.py`, 포스트보다 앞선 커밋 `b535994c92de2a2aabdfaec7604b60c92d4c3485`(2026-11-01T18:43:25Z)의 README, [Hugging Face 어댑터 카드](https://huggingface.co/voidash/qwenbend), [Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) 카드와 `config.json` `2fc06364715b967f1860aea9cf38778875588b17`, [bendlang/bend](https://github.com/bendlang/bend) 커밋 `9e8d7b7958ebb3bb72464dfb6b6b5f06949fbcad`입니다. 저장소에 있는 `bendtune/logs/*.jsonl`의 맞음 개수는 이 글이 다시 세었습니다. `adapters.safetensors`의 sha256도 받아 계산했습니다. 합쳐진 모델은 빌드하지 않았고, MPS에서 토큰을 다시 재지 않았습니다.

## 왜 계산이 가중치 안에 들어가는가

포스트의 문장은 순서입니다. Qwen이 Bend 프로그램을 쓰고, 같은 모델이 Bend2 규칙으로 타입을 검사한 뒤, 그 실행이 자기 포워드 안에서 끝난다는 것입니다. 인터프리터도, 컴파일러도, 도구 호출도 없고, CPU 전체가 모델 안에 손으로 넣은 0이 아닌 가중치 약 53M개라는 문장이 뒤따릅니다. 저장소는 그 포스트보다 먼저 있습니다. GitHub `voidash/qwenbend`의 `created_at`은 2026-11-01T17:49:55Z이고, 첫 커밋 시각은 2026-11-01T17:45:15Z입니다. 포스트는 19:41 UTC입니다.

개발자에게 닿는 지점은 "0.8B가 암산을 잘한다"가 아닙니다. 도구 호출은 모델을 나갔다가 파이썬이 답을 들고 돌아옵니다. QwenBend README가 적는 자리는 그 경계가 없는 한 체크포인트입니다. 작성은 학습된 LoRA이고, 실행은 학습하지 않은 회로입니다. 회로의 가중치는 [`bendvm/engine_circuit.py`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/engine_circuit.py)가 대입합니다.

같은 날 README가 이름을 적는 선행 CPU는 다른 사람, Divyansh Agrawal의 [Qwenputer](https://github.com/divagr18/qwenputer)입니다. QwenBend는 그 코드를 쓰지 않는다고 README와 `docs/DESIGN.md`가 적습니다. 빌려 온다고 적은 아이디어는 DeltaNet 상태를 RAM으로 쓰는 것과, 위치를 세지 않고 세는 방법입니다. 이 블로그의 [qwenFS 글](https://betelg15.github.io/posts/qwenfs-filesystem-in-llm-weights/)은 Qwen3.5-2B 앞에 파일시스템 층을 넣는 또 다른 저장소입니다. 소유자도, 하는 일도 다릅니다. qwenFS는 파일을 넣고, QwenBend는 BendLite 프로그램을 검사하고 실행합니다.

## 한 토큰이 한 클럭이다

`docs/HOW_IT_WORKS.md`의 시퀀스는 한 줄입니다.

```text
[chat prompt] </think> [Qwen이 BendLite를 쓴다] <|im_end|> [엔진 토큰 ...] END
```

`</think>`가 엔진 상태를 지우고 캡처를 시작합니다. Qwen이 토큰을 내는 동안 엔진 층은 그 토큰의 임베딩 행에 구워 둔 ROM에서 렉서 핸들 주소와 페이로드를 읽어, 32비트 워드 네 개로 메모리에 넣습니다. 이 구간은 트레이스 토큰을 찍지 않습니다. `<|im_end|>` 다음부터 로짓은 엔진 것입니다. 엔진 토큰은 `INS(pc)` 아니면, 그 명령이 쓴 값의 바이트입니다. 다음 포워드가 그 토큰을 입력으로 보고 명령을 붙잡고, 레지스터를 읽고, 계산하고, 씁니다. HOW_IT_WORKS는 그 한 스텝을 CPU의 클럭이라고 적습니다.

"Sum 22 copies of 35"에 대해 같은 문서가 적는 분해는 프롬프트 242토큰, 프로그램 70토큰, 엔진 7,869토큰, 답 770입니다. README 첫 예시의 답도 770이고, 엔진 토큰 수도 7,869입니다. 답을 숫자로 읽는 함수는 호스트의 `run_engine.result`입니다. `INS(OUT)` 뒤의 바이트 토큰을 모아 값을 복원합니다. 산술을 다시 하는 코드는 그 함수에 없습니다.

아래는 생성 루프의 스케치입니다. 가중치를 만드는 코드가 아닙니다.

```python
# 스케치. 실제 생성은 bendvm/merge.py의 run()이다.
# </think> 부터 <|im_end|> 직전까지: 캡처만. 트레이스 토큰은 없다.
# <|im_end|> 다음 토큰: 엔진. 한 토큰 = INS(pc) 또는 결과 바이트 하나.

def after_im_end(token_id, vocab0):
    local = token_id - vocab0
    if is_out_instruction(local):
        return read_following_bytes()  # 호스트가 트레이스에서 OUT 값을 읽는다
    return local  # 다음 포워드의 입력. 상태가 앞으로 가는 통로다
```

README의 문장은 "한 체크포인트, 토큰마다 `forward()` 한 번"입니다. 프로그램 전체가 행렬 곱 한 번에 끝나는 구조는 아닙니다. 명령 하나가 모델 전체의 포워드 하나입니다.

## 폭 4096인 35층

Qwen3.5-0.8B 카드의 언어 모델은 파라미터 규모 0.8B, 은닉 1024, 층 24, 어휘 248,320, 컨텍스트 262,144입니다. 배치 문장은 `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`입니다. `config.json` `text_config`의 `layer_types` 길이는 24이고, `linear_attention` 세 번 뒤에 `full_attention`이 옵니다. 선형 어텐션 헤드는 QK 16, V 16, 헤드 차원 128입니다. 어텐션은 Q 8, KV 2, 헤드 차원 256입니다. 중간 차원은 3584입니다. `tie_word_embeddings`는 true입니다. 카드 하이라이트의 "sparse Mixture-of-Experts"는 Qwen3.5 전반의 문장이고, 0.8B 개요는 전문가 수를 적지 않습니다. 이 글은 0.8B를 MoE로 세지 않습니다.

QwenBend가 합치는 클래스는 텍스트 모델입니다. `qwen_fused.py` 독스트링은 "text model only"이고, 가중치 키에서 `model.language_model.`만 가져옵니다. 비전 타워는 이 병합에 없습니다. LoRA는 그 텍스트 가중치에 fp32로 더한 뒤 bf16으로 한 번 반올림합니다. 카드와 코드가 적는 식은 `W += scale · (A @ B)^T`이고, `scale`은 20입니다.

합쳐진 배치의 상수는 `engine_circuit.py`와 `merge.py`에 있습니다.

```python
# bendvm/engine_circuit.py, main 2aee9bb
H, K = 4096, 3
QWEN_DIMS = 1024          # 0..1023은 Qwen 잔차
NH = 16
MEM_LAYER0, MEM_HEADS = 5, 64   # 메모리: 층 5–8, 층마다 헤드 16. 8,192워드
N_LAYERS = 10             # SELECT_LAYER(8) + 2

# bendvm/merge.py
N_QWEN_LAYERS = 24
EXIT = N_LAYERS           # 출구 층의 인덱스 10
# num_hidden_layers = 10 + 1 + 24
```

층 수는 10+1+24입니다. 은닉은 4096입니다. 0–1023은 Qwen, 1024–4095는 엔진입니다. 메모리 주석의 64헤드 × 128행은 8,192워드입니다. README가 적는 레지스터는 16개입니다. 출구 층은 믹서를 0으로 두고, MLP가 엔진 차원을 Qwen이 보기 전에 0으로 지웁니다. Qwen 층의 노름은 `norm_weight`가 `(1 + w) / sqrt(4096/1024)`로 나눕니다. 그 제곱근은 2입니다. HOW_IT_WORKS의 "norm weights are halved"는 이 나눗셈의 문장입니다.

`merge.py` 맨 위 독스트링은 첫 줄에서 은닉 4096을 적고, 같은 독스트링 안에서 Qwen 층을 "hidden 4608"로 패딩한다고 적습니다. 코드의 `H`는 4096이고 README도 4096입니다. 4608은 그 독스트링 안의 남은 숫자입니다.

엔진 층 10개와 출구 층은 `layer_types`에서 모두 `linear_attention`입니다. 그 뒤에 Qwen의 24개 타입이 붙습니다. Qwen 행렬은 잔차 축을 4096으로 늘리며 빈칸을 0으로 둡니다. README가 그 이유를 적은 문장은, 엔진이 잔차 약 3,000차원이 더 필요한데 HF는 모든 층의 폭을 하나로 요구한다는 것입니다. 1024에서 4096으로의 차이는 3072입니다.

## bf16에서 값이 정확히 떨어지게 하는 장치

HOW_IT_WORKS가 정확함의 조건으로 적는 것은 반올림이 없는 구간뿐입니다.

32비트 값은 니블 8개의 원-핫입니다. 니블 하나는 16차원 중 한 자리가 1.0입니다. 메모리 키도 원-핫이라 `l2norm`이 그 단위 벡터를 그대로 둡니다. SwiGLU 한 유닛은 AND입니다. 문서의 식은 `gate = 256·(Σ features − n) + 128`이고, SiLU가 128 또는 0이 됩니다. 코드의 `Mlp.unit`은 같은 형태에 노름 스케일 `S = 2^K = 8`을 곱합니다. DeltaNet의 β는 0 또는 1, 감쇠는 지우면 0이고 유지하면 1입니다. 밸러스트는 매 행의 에너지를 `4096·4³`으로 맞춰, 노름이 층마다 `2⁻³`을 곱하게 합니다.

`bendvm/circuit.py`는 이 회로를 fp64로 한 칸씩 돌리며, bf16으로 정확히 표현되지 않는 중간값이 나오면 예외를 냅니다. MPS가 서브노멀을 0으로 씻는 것도 그 평가기가 흉내 냅니다. README가 적는 통과 수는 평가기 39,913칸(프로그램 3개), 실제 torch bf16 MPS에서 3,230칸이 비트 단위로 같습니다. 이 글은 그 평가기를 실행하지 않았습니다.

## Bend2 앞단은 펌웨어 2,230줄이다

언어는 Bend2 전체가 아닙니다. [BendLite](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/BENDLITE.md)는 부분집합이고, 그 문서의 첫 문장은 BendLite 프로그램이 모두 유효한 Bend2 프로그램이라는 것입니다. 남긴 것은 `U32` `Nat` `Bool`, `+`가 붙은 여러 번 사용, 매개변수에 대한 `match`, `( ... : U32)` 안의 사칙연산과 비교, `U32.from_nat` `U32.is_eq` `U32.min` `U32.max`, 그리고 `1n+p`를 줄이는 구조적 재귀입니다. 증명을 지우는 것은 BendLite만의 발명이 아닙니다. PORTING은 Bend2 자신이 실행 전에 증명과 law를 지운다고 적고, law가 있는 프로그램의 컴파일 결과에 그 이름이 0번 나왔다고 적습니다. `bendvm/examples/RESULTS.tsv`는 예제 20개의 `bend` 값과 `check`가 모두 `ok`라고 적혀 있습니다. 이 글은 `bend`를 다시 실행하지 않았습니다.

검사가 보는 Bend2 규칙은 세 갈래입니다. `5`와 `5n`을 가르는 타입, 변수를 두 번 쓰면 `+`가 있어야 하는 아핀 사용, 재귀가 `1n+p` 바인더를 줄여야 하는 구조적 종료입니다. 깨지면 `FAIL`이고, 그 프로그램은 평가에 들어가지 않습니다. 증명과 law는 검사하지 않는다고 README 한계 절이 적습니다.

호스트에 컴파일러가 없으므로 앞단 전체가 가중치 안 CPU에서 돕니다. PORTING의 사슬은 네 단계입니다.

| 단계 | 하는 일 | 맞춘 대상 | 문서가 적은 결과 |
|---|---|---|---|
| `bendlite_ref.py` | Bend2 정적 검사와 인터프리터 | 실제 Bend2, 커밋 `9e8d7b7` | 값 1,100/1,100, unsound 0 |
| `bytecode.py` | 같은 검사 뒤 스레드 코드 | 위의 참조 | 프로그램 2,389/2,389 |
| `firmware2.py` | 같은 일을 BVM 어셈블리로 | `bytecode.py` | 불일치 0, 명령 2,230개 |
| `engine_circuit.py` | 그 펌웨어를 가중치로, 명령당 토큰 하나 | VM 트레이스 | 평가기 39,913칸, torch 3,230칸 |

`9e8d7b7958ebb3bb72464dfb6b6b5f06949fbcad`는 [bendlang/bend](https://github.com/bendlang/bend/commit/9e8d7b7958ebb3bb72464dfb6b6b5f06949fbcad)에 있고, 시각은 2026-10-30T20:50:53Z이며, 메시지는 UDP 송신 주소를 검사하는 IO 수정입니다. QwenBend가 그 리비전을 핀으로 찍었다는 뜻이지, 그 커밋이 이 회로를 위한 언어 변경이라는 뜻은 아닙니다. README가 링크하는 `HigherOrderCO/Bend`는 API에서 이 커밋으로 이어졌습니다.

ISA에는 하드웨어 곱과 나눗셈이 없습니다. PORTING은 가중치가 너무 커지기 때문이라고 적습니다. `MUL` `DIV` `MOD`는 펌웨어 루틴이고, 피연산자 쌍 3,196개로 자가 검사한다고 적습니다. `firmware2.py`의 `__main__`이 만드는 쌍은 가장자리 값 14개의 곱 196에 난수 3,000을 더한 수입니다. 이 글은 그 루프를 돌리지 않았습니다.

캡처 상한은 192토큰 미만입니다. `MAX_N = 192`이고, 인덱스는 `16·b + r < 192`입니다. 메모리는 8,192워드, 정수는 32비트입니다. 나눗셈의 가장자리는 Bend2를 재어 `x / 0 = 0`, `x % 0 = x`라고 PORTING이 적습니다.

## 엔진은 트레이스와 같았고, 작성자는 자주 틀렸다

LoRA는 MLX 형식입니다. 허브 카드와 `adapter_config.json`은 rank 8, scale 20, 학습률 1e-4, 배치 2, 마지막 16층, 400스텝입니다. 카드는 400스텝이 검증 손실 기준 최선이고 1,200스텝은 과적합이라고 적습니다. 테스트 로그를 이 글이 센 결과는 그 선택과 같은 방향입니다.

| 체크포인트 로그 | 200문항 정답 | 분포 안 100 | 보류 가족 100 | 유효 프로그램 |
|---|---:|---:|---:|---:|
| `tuned200_test.jsonl` | 62 | 58 | 4 | 140 |
| `tuned400_test.jsonl` | 84 | 80 | 4 | 116 |
| `tuned1200_test.jsonl` | 54 | 54 | 0 | 80 |
| `baseline_test.jsonl` (어댑터 없음) | 0 | 0 | 0 | 0 |

84/200이 README와 카드의 42%입니다. 80/100과 4/100이 분포 안 80%, 보류 4%입니다. 유효 116/200이 카드의 58%입니다. 보류 가족은 `bench_direct.py`의 집합 그대로 `digit_count`, `sum_multiples`, `reverse_digits`입니다. 베이스 모델이 Bend 프로그램을 맞게 쓴 로그 행은 200개 중 0입니다.

같은 200문항에 0.8B가 숫자를 직접 답한 로그도 있습니다. 생각 없이 그리디로 답한 `direct_nothink.jsonl`은 98/200, README의 49%입니다. 생각 모드 `direct_think.jsonl`은 70/200, README의 35%입니다. 생각 모드의 토큰 상한은 그 스크립트의 `--max-tokens`이고, README는 4k 캡이라고 적습니다. 스크립트 기본값은 256입니다. 로그 파일이 어느 상한으로 찍혔는지는 각 행에 없습니다.

끝에서 끝까지의 20건은 `bendtune/logs/e2e.jsonl`입니다. `bench_e2e.py`의 기본 간격은 10이라 인덱스는 0, 10, …, 190입니다. 20건 모두 `trace_equals_reference`가 true이고 `exit_violations`는 0입니다. 정답은 10/20입니다. 분포 안 10건 중 9건, 보류 10건 중 1건입니다. 실패 10건 중 8건은 `digit_count`가 Bend2 규칙에서 거절된 것이고, 2건은 규칙은 통과했으나 기대한 값과 다른 프로그램입니다. 같은 20개 인덱스에서 `direct_nothink.jsonl`의 정답은 14/20입니다. README의 70%와 50%는 이 두 로그와 같습니다. 20건 중 `program_equals_mlx`가 false인 행이 하나 있습니다. 인덱스 30, `sum_const`, 기대값 340입니다. 그 행도 트레이스는 참조와 같고 답은 340입니다.

README의 5/5 표는 이 20건 로그와 다른 기록입니다. 표의 문장은 sum_const 770(7,869토큰, 402초), gcd 두 번(16,299 / 16,630토큰), digit_sum 33(16,447), triangle 780(10,937)이고, 기계는 Apple M4 Pro, MPS, bf16입니다. `e2e.jsonl`의 첫 행도 sum_const 770에 엔진 토큰 7,869인데, `seconds`는 613.9입니다. 그 필드는 `run()` 전체의 벽시계라 프롬프트와 Qwen 토큰이 포함됩니다. 402초는 이 로그에 없습니다. 7,869를 402로 나누면 약 19.6입니다. README의 "약 20토큰/초"와 같은 자릿수이고, 이 글이 다시 잰 처리량은 아닙니다. 20건 로그의 엔진 토큰 합은 146,642이고 `seconds` 합은 11,374.8입니다. 그 나눗셈은 벽시계당 엔진 토큰이라 "약 20토큰/초"와 같은 단위가 아닙니다.

속도 문장이 같이 적는 것은 한 번에 7–14분, 트레이스 중앙값 약 7.5k토큰, p90 약 16k, 시험한 상한 약 50k입니다. 엔진이 끝난 뒤 Qwen에게 턴이 돌아가지 않는다고 한계 절이 적습니다.

## 52.9M이 세는 칸

README의 크기 문장은 밀집 파라미터 3.97B입니다. 그중 0이 아닌 칸은 Qwen 0.753B, 엔진 52.9M이고, 나머지는 폭 4096으로 늘리며 채운 0입니다. 이 글은 모델을 합치지 않아 그 두 수를 다시 세지 않았습니다. 세는 코드는 `merge.py`에 있고, 포스트 시각 이전의 README `b535994`에도 52.9M과 3.97B가 이미 있습니다.

```python
# bendvm/merge.py, build_merged의 0이 아닌 칸. 묶인 lm_head 이름은 세 분기에 없다.
n_params = sum({t.data_ptr(): t.numel() for t in m.parameters()}.values())
nz = {"qwen": 0, "engine": 0}
for n, t in m.named_parameters():
    if n == "model.embed_tokens.weight":
        nz["qwen"] += int((t[:, :1024] != 0).sum())
        nz["engine"] += int((t[:, 1024:] != 0).sum())
    elif n.startswith("model.layers."):
        nz["engine" if int(n.split(".")[2]) <= EXIT else "qwen"] += int((t != 0).sum())
    elif n == "model.norm.weight":
        nz["qwen"] += int((t != 0).sum())
```

엔진 버킷은 층 인덱스 `<= EXIT`입니다. `EXIT`가 10이므로 엔진 10층과 출구 1층이 같이 들어갑니다. 임베딩은 1024열 이후의 0이 아닌 값이 엔진입니다. Qwen 토큰 행에 구운 렉서 ROM도 그 열에 있습니다. 최종 노름은 전부 Qwen 버킷입니다. `qwenbend.py`의 출력 형식은 엔진 쪽을 `{:.0f}M`으로 찍습니다. 52.9는 그 형식에서 53이 됩니다. `merge.py`의 출력 형식은 `{:.1f}M`이라 README의 52.9와 같습니다. 포스트의 53M은 그 정수 형식과 같고, README는 같은 카운터를 소수 한 자리로도 적습니다.

카드의 언어 모델 0.8B와 이 0.753B는 다른 문장입니다. 0.753B는 위 카운터가 Qwen 버킷이라고 저장소가 보고한 값이고, 비전 타워를 뺀 텍스트 병합입니다. 이 글은 둘을 같은 정수로 읽지 않습니다.

`qwenbend.py`는 장치를 MPS 또는 CUDA로 고르고, 없으면 "about 8 GB in bf16"이라는 문장으로 끝냅니다. README의 요구는 약 9GB의 빈 자리입니다. 빌드는 약 15초이고, 체크포인트를 디스크에 쓰지 않는다고 같은 절이 적습니다. 첫 실행은 핀된 `Qwen/Qwen3.5-0.8B` 리비전 `2fc06364715b967f1860aea9cf38778875588b17`과 허브 어댑터를 받습니다. 그 리비전은 이 글이 읽은 카드의 `sha`와 같습니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 가격표와 시장 점유율은 이 글이 조사하지 않았습니다. QwenBend README에도 호스팅 가격은 없습니다.

2026-11-05에 읽은 공개 숫자는 이렇습니다.

| 출처 | 응답 시각 (GMT) | 이 글이 읽은 값 |
|---|---|---|
| `GET /repos/voidash/qwenbend` | 06:17:51 | 별 24, 포크 3, SPDX `Apache-2.0`, 푸시 2026-11-01T21:14:51Z |
| 허브 `voidash/qwenbend` | 06:18:00 | `downloads` 0, `likes` 1, `library_name` `mlx`, `usedStorage` 14,461,040, `license` `apache-2.0` |
| 허브 `Qwen/Qwen3.5-0.8B` | 06:18:12 | `downloads` 3,670,721, `likes` 811, `license` `apache-2.0` |
| `GET /repos/divagr18/qwenputer` | 06:19:07 | 별 660, 포크 79. 설명은 Qwen3.5-4B 안의 정확한 CPU. API `license.spdx_id`는 `NOASSERTION`. LICENSE 첫 줄은 "MIT License", 저작권은 Divyansh Agrawal |
| `GET /repos/bendlang/bend` | 06:25:34 | 별 24,741, 포크 793, SPDX `Apache-2.0`. 설명은 증명으로 AI의 실수를 막는 언어 |

어댑터 파일 `adapters.safetensors`는 14,461,040바이트이고, sha256 `4577f177fdaabd10ae0f920f71a93d8f89603236b05484822bf0393e4caf315c`는 카드에 적힌 해시와 같습니다. 그 바이트 수는 같은 날 허브 API의 `usedStorage`와 같은 정수입니다. [Built with Bend의 QwenBend 항목](https://builtwithbend.com/projects/qwenbend/)은 2026-11-05 06:18:00 GMT에 "Research & experiments", 별 24, 최근 24시간 조회 14를 적고, BendLite라는 제한된 부분집합이며 law를 검사하지 않고, 만든 프로그램이 질문에 답하는지는 증명하지 않는다고 적습니다.

**분석/의견.** 이득이 가는 자리는 README의 "Why"가 이미 좁혀 둔 곳입니다. 도구 서버를 둘 수 없는 한 개의 모델 파일이 필요하고, 명령과 값이 토큰으로 남아 참조 VM으로 다시 밟을 수 있어야 하며, 그 회로가 알려진 상태여야 하는 실험입니다. 0.8B를 받을 네트워크와, MPS 또는 CUDA에서 약 9GB를 비울 자리가 그 실험의 입장 조건입니다. 구독료로 문서가 적는 항목은 없습니다. 비용으로 문서가 적는 것은 시간입니다. 약 20토큰/초, 실행 7–14분, 그리고 속도가 목적이면 파이썬을 부르라는 문장입니다. README는 이 경로가 CPU보다 수백만 배 느리다고 적습니다. 그 배율의 측정 표는 옆에 없습니다.

같은 200문항에서 제품을 가를 숫자는 엔진의 비트 일치가 아닙니다. 어댑터 없이 바로 답한 0.8B가 98/200이고, BendLite를 맞게 쓴 비율은 84/200이며, 20건 끝에서 끝까지는 10/20 대 직접 답 14/20입니다. 수가 작아 베이스 모델의 암산이 종종 되는 집합이라고 README가 적고, 모델이 암산하지 못하는 계산에서의 이득은 여기서 시험되지 않았다고 같은 문단이 적습니다. 정확한 실행이 틀린 프로그램을 옳은 답으로 바꾸지는 않습니다. 카드의 문장 "Exact ≠ true"가 그 경계입니다.

채택 쪽에서 저장소가 미리 만든 3.97B 체크포인트를 올리지 않습니다. 배포 단위는 14,461,040바이트 LoRA와, 받는 쪽에서 15초 정도 합치는 스크립트입니다. 허브 `downloads` 0은 그 어댑터 저장소의 API 필드입니다. 베이스 `Qwen/Qwen3.5-0.8B`의 다운로드 3,670,721과 같은 자리가 아닙니다. 작성 학습은 MLX이고 실행은 torch입니다. 한 런타임을 사고 끝나는 구조는 README에 없습니다.

손해가 생기는 읽기는 네 가지입니다. 52.9M만 보면, 밀집 3.97B와 약 8–9GB와 폭 4096의 0 패딩이 빠집니다. Bend2 검사만 보면, 증명과 law가 빠져 있고 언어는 BendLite이며 작성 정확도 42%가 빠집니다. 인터프리터가 0이라는 문장만 보면, 펌웨어 2,230명령이 컴파일과 평가를 하고 CLI가 끝난 뒤 파이썬 참조 인터프리터로 트레이스를 비교한다는 사실이 빠집니다. Qwenputer나 이 블로그의 qwenFS와 같은 프로젝트로 보면, 코드 공유가 없다는 README 문장과 서로 다른 소유자가 빠집니다. 라이선스로 문서가 겹치는 것은 코드, LoRA, 베이스 모델이 모두 Apache-2.0이라는 점입니다. Qwenputer 코드는 이 병합에 들어가지 않습니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·이후 커밋에서 보강됨 / ❌ 사실 아님

본문은 fxtwitter `text`입니다. `display_text_range`는 `[0, 260]`입니다. 확인 시각은 2026-11-05입니다. 처리량과 39,913칸, 3,230칸, 1,100/1,100은 작성자가 적은 값이고, 이 글은 다시 재지 않았습니다. 200문항과 20건 로그의 개수는 저장소 파일을 세어 확인했습니다.

### @rifeash 포스트 (2026-11-01 19:41 UTC)

| 주장 | 판정 | 근거 |
|---|---|---|
| Qwen이 Bend 프로그램을 쓴다 | ⚠️ | 쓰는 언어는 [BendLite](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/BENDLITE.md)다. 그 문서의 첫 문장은 BendLite 프로그램마다 유효한 Bend2 프로그램이라는 것이다. 증명, law, `let`, 리스트, 문자열은 BendLite v1에 없다. 작성 가중치는 rank 8 LoRA이고, 베이스는 [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) 리비전 `2fc06364`다. 테스트 로그에서 어댑터 없는 작성은 0/200, 400스텝 어댑터의 정답 프로그램은 84/200이다. |
| 같은 모델이 Bend2 규칙으로 타입을 검사한다 | ⚠️ | [PORTING](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/PORTING_BEND2.md)과 README가 적는 검사는 `5`와 `5n`을 가르는 타입, 아핀 `+`, `1n+p` 구조적 종료다. 호스트 타입체커 호출이 아니라 펌웨어다. 증명과 law는 검사하지 않는다고 README 한계가 적는다. Bend2 `9e8d7b7`과의 값 일치는 1,100/1,100, unsound 0이라고 문서가 적고, 이 글은 `bend`를 다시 돌리지 않았다. |
| 그 실행이 자기 포워드 패스 안에서 돈다 | ✅ | [README](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/README.md)의 문장은 체크포인트 하나, 토큰마다 `forward()` 하나다. `<|im_end|>` 다음 로짓은 엔진이고, 다음 토큰이 다음 클럭의 입력이다. "Sum 22 copies of 35"는 엔진 토큰 7,869개다. 프로그램 전체가 포워드 한 번이라는 뜻의 문장은 HOW_IT_WORKS에 없다. 20건 로그는 트레이스가 참조와 토큰 단위로 같고 출구 위반이 0이다. |
| 인터프리터, 컴파일러, 도구 호출이 없다 | ⚠️ | 생성 루프는 도구 호출을 실행하지 않는다. README는 호스트 컴파일러가 없다고 적고, 렉스·검사·컴파일·평가를 가중치 안 CPU의 펌웨어 2,230명령으로 적는다. 그 펌웨어가 컴파일러와 평가기다. `qwenbend.py`는 생성 뒤에 `run_source`와 `trace`로 파이썬 참조와 비교한다. 답을 만드는 쪽은 트레이스이고, 비교는 그 다음이다. |
| qwenputer와 같다 | ⚠️ | README Credits는 [Qwenputer](https://github.com/divagr18/qwenputer)가 Qwen3.5 가중치 안에 CPU가 있을 수 있음을 보였고, QwenBend는 그 코드를 쓰지 않는다고 적는다. Qwenputer 설명의 베이스는 Qwen3.5-4B다. 이 블로그의 [qwenFS](https://betelg15.github.io/posts/qwenfs-filesystem-in-llm-weights/)도 다른 저장소다. 공통으로 문서가 적는 것은 Gated DeltaNet 상태에 기계를 둔다는 아이디어다. |
| CPU 전체가 손으로 넣은 0이 아닌 가중치 53M개다 | ⚠️ | 포스트 이전 README `b535994`와 HEAD가 적는 측정은 엔진의 0이 아닌 가중치 **52.9M**이다. `qwenbend.py`는 그 수를 `{:.0f}M`으로 찍어 53이 된다. 학습하지 않고 `engine_circuit.py`가 대입한다는 문장은 README와 카드가 같다. 52.9M개를 사람이 칸마다 친 절차는 문서에 없다. 카운터의 엔진 버킷에는 출구 층과, 1024열 이후의 렉서 ROM이 들어간다. 밀집 파라미터는 3.97B이고 나머지는 0 패딩이다. 이 글은 그 카운터를 다시 실행하지 않았다. |

**총평:** QwenBend 저장소는 있고, 포스트의 핵심 구조는 그 저장소의 README와 같습니다. Qwen3.5-0.8B가 BendLite를 쓰고, 학습하지 않은 회로가 정적 규칙을 본 뒤 명령마다 한 포워드로 트레이스를 냅니다. 느슨한 자리는 단위입니다. 53M은 52.9M의 정수 출력이고, 그 52.9M이 밀집 3.97B 전체를 뜻하지는 않습니다. 인터프리터가 없는 자리는 생성 루프이고, 펌웨어는 컴파일과 평가를 합니다. Bend2 전체의 증명 검사가 아니라 BendLite의 타입·아핀·종료 검사입니다. 포스트 이후 커밋 `2aee9bb`가 더한 200문항 비교에서는, 이 작은 수 집합에서 어댑터 없이 바로 답한 0.8B가 49%로 작성기 42%보다 자주 맞습니다.

## 참고 자료

- 계기 포스트 — [@rifeash, 2026-11-01 19:41 UTC](https://x.com/rifeash/status/2116978948894773418) · [i/status](https://x.com/i/status/2116978948894773418) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2116978948894773418)
- QwenBend `2aee9bb06131785639f196650a19900e0cd0b608`, 2026-11-01T21:14:49Z — [저장소](https://github.com/voidash/qwenbend) · [README](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/README.md) · [HOW_IT_WORKS](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/HOW_IT_WORKS.md) · [PORTING_BEND2](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/PORTING_BEND2.md) · [BENDLITE](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/BENDLITE.md) · [DESIGN](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/docs/DESIGN.md) · [merge.py](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/merge.py) · [engine_circuit.py](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/engine_circuit.py) · [qwenbend.py](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/qwenbend.py) · [qwen_fused.py](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/qwen_fused.py) · [bench_e2e.py](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/bench_e2e.py) · [LICENSE](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/LICENSE)
- 포스트 시각의 README `b535994c92de2a2aabdfaec7604b60c92d4c3485`, 2026-11-01T18:43:25Z — 52.9M, 호스트 컴파일러 없음, 5/5 표가 이미 있고, 직접 답 49% 비교는 아직 없다
- 로그 — [`tuned400_test.jsonl`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendtune/logs/tuned400_test.jsonl) 84/200 · [`direct_nothink.jsonl`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendtune/logs/direct_nothink.jsonl) 98/200 · [`direct_think.jsonl`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendtune/logs/direct_think.jsonl) 70/200 · [`e2e.jsonl`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendtune/logs/e2e.jsonl) 10/20, 트레이스 20/20 · [`examples/RESULTS.tsv`](https://github.com/voidash/qwenbend/blob/2aee9bb06131785639f196650a19900e0cd0b608/bendvm/examples/RESULTS.tsv)
- LoRA — [voidash/qwenbend](https://huggingface.co/voidash/qwenbend) `385333268b586ef2cf57f7542c5f7480a738326c`, 2026-11-05 06:18:00 GMT. downloads 0, likes 1, Apache-2.0. `adapters.safetensors` 14,461,040바이트, sha256은 카드와 일치
- 베이스 — [Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) `2fc06364715b967f1860aea9cf38778875588b17`. 2026-11-05 06:18:12 GMT. downloads 3,670,721, likes 811, Apache-2.0. 카드가 가리키는 블로그는 [qwen.ai/blog?id=qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- Bend2 — [bendlang/bend](https://github.com/bendlang/bend) 커밋 [`9e8d7b7`](https://github.com/bendlang/bend/commit/9e8d7b7958ebb3bb72464dfb6b6b5f06949fbcad), 2026-10-30T20:50:53Z. 2026-11-05 06:25:34 GMT API 별 24,741, 포크 793, Apache-2.0
- Qwenputer — [divagr18/qwenputer](https://github.com/divagr18/qwenputer), 2026-11-05 06:19:07 GMT 별 660, 포크 79. QwenBend README는 코드를 쓰지 않는다고 적는다
- 목록 — [Built with Bend: QwenBend](https://builtwithbend.com/projects/qwenbend/), 2026-11-05 06:18:00 GMT에 읽음
- 이 블로그의 다른 가중치 기계 — [qwenFS](https://betelg15.github.io/posts/qwenfs-filesystem-in-llm-weights/). 파일시스템이고, 이 저장소가 아니다
