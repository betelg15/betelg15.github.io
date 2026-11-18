---
title: "대화형 지연의 비디오 생성인가? Apple FastFrames 팩트 체크"
date: 2026-11-18
time: "22:28"
slug: apple-fastframes-interactive-latency-video-generation
tags: [FastFrames, Apple, Wan, 비디오생성, 팩트체크]
summary: "FastFrames-S는 B200 1장에서 잠재 프레임당 36ms, L의 45ms는 B200 8장이다. 월드모델 16배는 LingBot 1.3B의 842ms(2장)→52ms(8장)이고, 북마크의 827ms는 논문 HTML에 없다. 설치 문서는 CUDA 12.8이다."
---

> 이 글은 제가 X에서 북마크해 둔 [@C_of_Creativity의 포스트](https://x.com/C_of_Creativity/status/2122857308955054369)를 계기로 썼습니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2122857308955054369)(`code` 200)으로 읽었습니다. `created_at`은 `Wed Nov 18 00:59:57 +0000 2026`, **2026-11-18 09:59 KST**입니다. 계정은 C_of_Creativity, 표시 이름 PIYO, 사용자 id `1765273376262873088`, 팔로워 4,396, `verification.type`은 `individual`입니다. 같은 응답의 스냅샷은 답글 3, 리포스트 9, 좋아요 117, 북마크 113, 인용 0, 조회 8,617이고 커뮤니티 노트는 `null`입니다. 본문은 일본어이고 `is_note_tweet`은 true입니다. 응답의 `text`는 아래 문장입니다.
>
> Apple이 Wan2.1 기반의 고속 동영상 생성 모델 FastFrames를 공개했다. 2스텝 생성으로, 월드모델 응답이 827ms에서 52ms가 되었다(약 16배). Apple 연구인데 동작에는 NVIDIA GPU(CUDA)가 필요하다. Apple이 중국의 오픈 모델을 토대로 썼다. Hugging Face 안내도 NVIDIA GPU(CUDA)가 필요하다고 한다.
>
> 이 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-18에 연 1차 자료입니다. 논문은 Chou, Yang, Luan, Mescheder, Dong, Richter, Koltun, [FastFrames: Video Generation at Interactive Latency](https://arxiv.org/abs/2611.23226), arXiv:2611.23226v1, `published` 2026-11-17 18:59 UTC(2026-11-18 03:59 KST)입니다. 프로젝트 페이지는 [apple-aiml-research.github.io/ml-fastframes](https://apple-aiml-research.github.io/ml-fastframes/)입니다. 코드는 [apple-aiml-research/ml-fastframes](https://github.com/apple-aiml-research/ml-fastframes)이고, GitHub API 기준 `created_at`은 2026-11-17 21:30 UTC, `pushed_at`은 2026-11-18 05:29 UTC입니다. 가중치는 [apple/FastFrames-L](https://huggingface.co/apple/FastFrames-L) 리비전 `18f30cbd`(`lastModified` 2026-11-18 05:29 UTC)와 [apple/FastFrames-S](https://huggingface.co/apple/FastFrames-S) 리비전 `aa099efc`(같은 시각)입니다. 파라미터 개수와 dtype은 같은 날 safetensors 헤더의 range 요청으로 읽었습니다. 가중치 본문은 받지 않았고, 추론을 돌리지 않았습니다.

## 왜 중요한가

비디오 확산 모델의 속도 숫자는 대개 클립 전체를 만들고 프레임 수로 나눈 FPS입니다. FastFrames 논문은 그 나눗셈이 조작 지연을 숨긴다고 봅니다. 30프레임을 1초에 한 묶음으로 만들면 30 FPS지만, 사용자는 반응이 보이기 전에 1초를 기다립니다. 논문이 목표로 둔 값은 입력(예를 들어 조향)이 도착한 뒤 그 효과가 그려진 첫 RGB가 나오기까지의 끝간 지연이고, 상한은 50ms입니다. 50ms는 초당 20응답(RPS)입니다. 논문은 이 상한을 Deber 외 2015의 지연 지각 문턱으로 인용합니다.

개발자가 숫자를 보기 전에 나눠야 할 질문은 다음입니다.

- 36ms와 45ms가 어느 GPU 몇 장에서의 숫자인가. 1장인가, 8장인가.
- 그 시간이 RGB 한 장인가, VAE 시간 압축 뒤의 잠재 프레임 한 장인가.
- 2스텝이 매 프레임인가, 정상 상태인가, 첫 프레임도 그러한가.
- 827ms→52ms의 16배가 어느 모델이고, 시작과 끝의 GPU 수가 같은가.
- 설치 문서가 요구하는 장치가 NVIDIA CUDA인가, Apple Silicon인가.
- 공개된 가중치의 라이선스가 상업 제품에 바로 얹히는 조건인가.

## 기술 설명

### 두 모델, 그리고 파일에 적힌 개수

논문 4절은 FastFrames를 Wan 2.1 백본 두 크기로 만듭니다. FastFrames-S는 1.3B이고 Causal Forcing++(CF++)의 2스텝 체크포인트에서 초기화합니다. FastFrames-L은 14B이고, 양방향 Wan 2.1 14B에서 자기회귀 모델로 바꾼 뒤 증류합니다. Table 1의 크기 칸은 S가 1.3, L이 14.3입니다. 둘 다 480p(논문과 코드의 해상도는 832×480)에서 잠재 프레임 하나를 자기회귀 한 스텝으로 만들고, 정상 상태의 확산 샘플링은 2스텝입니다.

Hugging Face 카드의 `base_model`은 이 경로와 같습니다. L은 `Wan-AI/Wan2.1-T2V-14B`입니다. S는 `Wan-AI/Wan2.1-T2V-1.3B`와 `zhuhz22/Causal-Forcing`입니다. 설치 문서가 시키는 S의 생성기 파일은 Apple 저장소 안이 아니라 `zhuhz22/Causal-Forcing`의 `causal-forcing++/framewise-2step.pt`입니다. 그 카드의 라이선스 필드는 `apache-2.0`이고 `base_model`은 Wan 2.1 1.3B입니다. Apple이 S에 올려 둔 파일은 `kv_refiner.safetensors`와 `pixel_decoder.safetensors`입니다.

2026-11-18에 헤더만 읽어 센 개수는 다음과 같습니다. 바이트는 tree API의 `size`이고, 개수와 dtype은 safetensors 헤더입니다.

| 파일 | 바이트 | 헤더의 파라미터 | dtype |
| --- | ---: | ---: | --- |
| `fastframes-l/dit.safetensors` | 28,577,096,680 | 14,288,491,584 | BF16 |
| `fastframes-l/kv_refiner.safetensors` | 1,780,342,784 | 890,168,064 | BF16 |
| `fastframes-l/pixel_decoder.safetensors` | 286,952,688 | 71,737,344 | F32 |
| `fastframes-s/kv_refiner.safetensors` | 692,418,448 | 346,205,952 | BF16 |
| `fastframes-s/pixel_decoder.safetensors` | 255,494,944 | 63,873,024 | F32 |
| `lingbot-1.3b/kv_refiner.safetensors` | 692,418,448 | 346,205,952 | BF16 |
| `lingbot-1.3b/pixel_decoder.safetensors` | 127,748,904 | 63,873,024 | BF16 |

14,288,491,584는 142.9억입니다. Table 1의 14.3과 맞습니다. S의 픽셀 디코더 63,873,024는 부록이 적은 63.87M과 맞습니다. L의 픽셀 디코더는 71,737,344로 더 큽니다. 차이는 7,864,320이고, 5120×1536과 같습니다. 학습 문서는 L이 폭 5120 특징을 1536으로 투영한 뒤 S의 재구성 체크포인트로 초기화한다고 적습니다. S의 DiT 개수는 이 저장소에 가중치가 없어 헤더로 세지 못했고, 논문의 1.3B를 그대로 둡니다.

L의 중간 체크포인트 세 폴더는 학습 문서가 합계 143GB로 적습니다. tree API로 더한 safetensors 바이트는 causal teacher 57,154,078,456, consistency 28,577,096,016, DMD 57,154,078,456입니다. 문서는 dtype을 각각 FP32, BF16, FP32로 적고, 선택한 업데이트는 1700, 3000, critic 1500입니다. 이 세 파일의 헤더는 읽지 않았습니다.

### 지연은 잠재 프레임 하나다

추론 문서는 생성 단위를 이렇게 나눕니다. FastFrames는 잠재 프레임 1개이고, 그 스텝은 DiT 평가 2번, KV refinement 1번, 픽셀 디코더 1번입니다. CF++는 잠재 프레임 1개에 DiT 3번(디노이즈 2번과 깨끗한 KV 기록 1번)과 VAE 디코드입니다. Self-Forcing은 잠재 프레임 3개에 DiT 5번입니다. 문서의 한 줄은 잠재 프레임 하나가 RGB 4장을 만든다고 합니다. 픽셀 디코더는 토큰을 4×16×16 RGB 패치로 풀고 84프레임을 만든 뒤, Wan VAE의 관례대로 앞 3프레임을 버려 81프레임을 남깁니다. 출력은 832×480, 16fps입니다. 81÷16은 5.0625초입니다.

그래서 논문 초록의 "36 ms per frame"은 RGB 한 장의 시간이 아닙니다. 잠재 프레임 하나, 곧 RGB 4장에 대한 응답 시간입니다. RPS는 그 응답의 역수이고, 한 응답 안의 프레임 수로 FPS를 부풀리지 않습니다. 36ms의 역수는 초당 27.8응답이고, 초록은 이를 28 RPS로 반올림합니다. 45ms는 22.2 RPS, 초록은 22 RPS입니다.

`pipeline.py`의 스케줄은 프레임마다 같지 않습니다. 주석과 기본값은 이렇습니다.

| 모델 | 0번 프레임 timestep | 이후 timestep | `refine_timestep` | 디코더 dtype 필드 |
| --- | --- | --- | --- | --- |
| FF-S | 1000, 937.5, 833.333, 625 | 1000, 833.333 | 833.333 | float32 |
| FF-L | 1000, 937, 833, 625 | 1000, 833 | 833 | bfloat16 |

`rollout`은 0번 프레임에서 깨끗한 잠재에 대한 DiT 패스(`t = 0`)를 항상 호출합니다. 그 다음 프레임부터 `context="refiner"`이면 그 패스 대신 KV refinement가 캐시 슬롯을 고칩니다. README의 성분 표와 논문의 36ms는 캐시가 가득 찬 정상 상태입니다. 첫 프레임의 4스텝과 `t = 0` DiT는 그 표에 들어 있지 않습니다.

아래는 그 정상 상태를, README가 적은 S의 1 GPU 예제 시간에 맞춰 적은 의사코드입니다. 저장소 함수의 축약이고, 이 환경에서 실행하지 않았습니다.

```python
# 프레임 1..20, 캐시가 가득 찬 뒤. RGB 4장에 해당하는 잠재 프레임 하나.
schedule = (1000.0, 833.333)          # FF-S. 첫 프레임은 네 값이다
x = noise
for t in schedule:                    # DiT 16.1 ms, 16.2 ms
    x0, features, mod = dit(x, t, kv_cache)
    x = renoise(x0, next_t) if t != schedule[-1] else x0
kv_cache = kv_refiner(x0, kv_cache)   # 2.2 ms. t=0 DiT 패스를 대체
rgb = pixel_decoder(features, mod)    # 0.9 ms. Wan VAE 147 ms를 대체
rgb = rgb[:, -81:]                    # 84 -> 81
# 합 35.4 ms. 논문의 끝간 지연은 36 ms
```

### 병목은 디노이즈 스텝이 아니다

논문 3.1절은 비교 기준으로 CF++의 2스텝 변형을 B200 1장에서 프로파일합니다. CF++는 Wan 2.1 1.3B 백본입니다. BF16, cuDNN 어텐션, `torch.compile`에서 DiT 평가 한 번은 41.6ms입니다. KV 캐시 갱신은 그 DiT를 깨끗한 잠재에 한 번 더 돌리는 일입니다. VAE 디코더는 잠재 하나를 RGB 4장으로 푸는 데 147ms입니다. 합은 271.8ms이고, Table 1은 272ms로 적습니다.

```python
dit, vae = 41.6, 147.0
denoise, kv = 2 * dit, dit
total = denoise + kv + vae
print(round(total, 1), round(vae / total, 3), round((vae + kv) / total, 3), round(denoise / total, 3))
```

```text
271.8 0.541 0.694 0.306
```

VAE만 끝간 시간의 54%이고, DiT 한 번의 3.5배입니다(147÷41.6=3.53). 논문이 "VAE 디코드 한 번이 DiT 3.5번만큼 걸린다"고 한 비율입니다. VAE와 KV 갱신을 더하면 69%라, 초록의 "절반을 넘는다"와 맞습니다. 디노이즈 두 번은 31%라, 그림 2의 "확산 샘플링은 벽시계 시간의 30%"와 맞습니다. 스텝을 2에서 1로 줄여도 지연은 15%만 줄고 화질이 크게 떨어진다고 같은 절이 적습니다. 50ms 예산 안에 남기려면 샘플링 횟수보다 VAE와 KV 패스를 빼는 쪽이 크다는 것이 이 프로파일의 결론입니다.

FastFrames가 그 둘을 바꾼 뒤의 S, 1 GPU, 480p, 가득 찬 캐시의 README 예제는 이렇습니다.

| 성분 | 호출 | 호출당 | 합 |
| --- | ---: | ---: | ---: |
| DiT, t=1000 | 1 | 16.1 ms | 16.1 ms |
| DiT, t=833 | 1 | 16.2 ms | 16.2 ms |
| KV refinement | 1 | 2.2 ms | 2.2 ms |
| 픽셀 디코더 | 1 | 0.9 ms | 0.9 ms |
| 합 | | | 35.4 ms (논문 36 ms) |

논문 3.4절의 시스템 최적화는 같은 DiT를 41.6ms에서 16.4ms로 내립니다. README의 16.1ms와 16.2ms는 그 16.4ms와 0.3ms 안에서 다른 예제입니다. 논문이 적은 수단은 세 가지입니다. KV 버퍼와 RoPE, 텍스트, 타임스텝을 미리 두고 QKV를 한 matmul로 합칩니다. 길이 32,760의 KV를 6,552짜리 다섯 조각으로 나눠 어텐션 출력을 softmax로 합쳐 13%를 줄입니다. CUDA 그래프로 런치 오버헤드를 줄입니다. 8장으로 늘릴 때 지연이 줄어든 병렬은 문맥 병렬(context parallelism)뿐이었다고 같은 절이 적습니다. 쿼리 토큰을 GPU에 나누고, 레이어마다 키와 값을 NVLink symmetric-memory gather로 한 번 교환합니다. 그 결과 1.3B DiT는 16.4ms에서 5.8ms, 14B DiT는 75.6ms에서 20.3ms입니다.

Table 1과 추론 문서가 같은 측정으로 적은 끝간 지연은 다음입니다. 하드웨어는 NVIDIA B200, 해상도는 약 480p, 자기회귀 모델은 워밍업 뒤 가득 찬 캐시의 정상 상태입니다. 텍스트 인코딩, 호스트 전송, 화면 표시는 빠집니다.

| 모델 | GPU | 지연 | RPS (1000÷ms) | VBench Total / Quality / Semantic |
| --- | ---: | ---: | ---: | --- |
| Causal Forcing++ | 1 | 272 ms | 3.68 | 84.11 / 85.09 / 80.20 |
| FastFrames-S | 1 | 36 ms | 27.8 | 84.23 / 85.30 / 79.92 |
| FastFrames-S | 8 | 14 ms | 71.4 | 같은 점수 |
| FastFrames-L | 1 | 158 ms | 6.33 | 84.44 / 85.48 / 80.29 |
| FastFrames-L | 8 | 45 ms | 22.2 | 같은 점수 |
| Krea-Realtime 14.3B | 1 | 1,675 ms | 0.60 | 84.42 / 85.08 / 81.81 |
| Self-Forcing (재측정) | 1 | 717 ms | 1.39 | 84.10 / 84.84 / 81.13 |
| LongLive2.0 5B | 1 | 505 ms | 1.98 | 83.65 / 84.54 / 80.09 |

272÷36=7.56이라 논문의 "7.6배, 거의 8배"와 맞습니다. 1675÷158=10.6이라, 3.1절이 14B를 "같은 파라미터 수의 가장 빠른 공개 자기회귀 모델보다 10.6배"라고 한 비교는 Krea-Realtime의 1 GPU 칸과 맞습니다. 8장 45ms와 1장 1,675ms를 직접 나누면 GPU 수가 다릅니다. S와 CF++는 DiT 가중치를 공유하고, Total은 84.23 대 84.11, Quality는 85.30 대 85.09, Semantic은 79.92 대 80.20입니다. Semantic만 S가 낮습니다. 논문은 Quality 차이를 픽셀 공간의 적대적 학습 때문이라고 적습니다.

부록 Table 2는 720p와 H100을 더합니다. B200에서 S는 480p 36ms, 720p 127ms입니다. L은 8장에서 480p 45ms, 720p 116ms입니다. H100은 구성에 따라 약 25%에서 50% 느리다고 본문이 적고, 성분 표의 480p S는 DiT 25ms, KV refinement 3ms, 픽셀 디코더 1ms입니다. 정상 상태가 DiT 두 번이라면 25+25+3+1=54ms입니다. 이 54ms는 제가 성분을 더한 값이고, 논문이 H100 끝간 합계로 적은 숫자는 아닙니다.

8 GPU 실행의 조건은 추론 문서와 LingBot 문서에 있습니다. NVSwitch(NVLink multicast)가 있는 노드이고, `expandable_segments`가 켜진 `PYTORCH_ALLOC_CONF`는 끄라고 합니다. 측정 스택은 PyTorch 2.9.1, CUDA 12.8입니다.

### 픽셀 디코더가 대체하는 것

Wan VAE 디코더는 파라미터가 73.3M으로 DiT 1.3B보다 작지만, 시공간을 반복해서 올리고 각 해상도에서 3D 합성곱을 합니다. 논문은 480×832 4프레임 텐서가 약 160만 시공간 위치에서 합성곱을 한다고 적습니다. 디코더만으로 50ms 예산의 3배입니다.

FastFrames의 디코더는 일반 복원기가 아니라, 얼어 있는 DiT의 낮은 해상도 특징을 RGB로 읽는 헤드입니다. 블록 세 개는 causal 3×3×3 depthwise 합성곱과 채널 혼합 MLP이고, 21×30×52 토큰 격자 위에서만 돕니다. 마지막 선형층이 토큰을 4×16×16 RGB로 바꿉니다. 개수는 63.9M(부록 63.87M, 헤더 63,873,024)으로 VAE와 비슷하고, 시간은 1ms 대 147ms로 논문이 147배라고 적은 비율입니다. 배치 1, 81프레임, 832×480, BF16, activation checkpointing에서 VAE 디코더 업데이트의 피크 메모리는 약 68GB, 이 헤드는 약 5GB라고 3.2절이 적습니다.

학습은 두 단계입니다. 먼저 같은 잠재를 얼어 있는 VAE로 푼 영상을 목표로 L1, MSE, 기울기, 프레임 차, 움직임 가중 오차를 맞춥니다. 계수는 0.5, 5.0, 0.05, 0.05, 0.5입니다. 그 다음 내부 실사 영상 1만 개와 얼어 있는 DINOv3 ViT-S/16의 여섯 토큰 판별기로 relativistic softplus 적대 손실을 더합니다. DiT는 얼려 둡니다. 낮은 학습률로 DiT를 같이 풀면 불안정했다고 같은 절이 적습니다. 이 헤드는 Wan VAE처럼 1.3B와 14B가 공유하지 않고, 모델마다 다시 맞춥니다.

S의 재구성 레시피는 GPU 32장에 업데이트 60만 번, 적대 단계는 8장에 GPU당 롤아웃 5,000번입니다. 부록은 재구성을 B200 32장에서 약 일주일, 적대 단계를 8장에서 몇 시간으로 적습니다. 이 글은 그 학습을 다시 하지 않았습니다.

### KV refinement가 대체하는 것

2스텝에서 KV를 고치는 DiT 패스는 DiT 평가의 3분의 1입니다. 논문은 그 패스를 빼면 장면이 drift하고, 노이즈 캐시에 맞게 다시 학습해도 인공물이 남았다고 적습니다. 대체 네트워크는 공유 특징 추출기(얼어 있는 패치 임베딩과, 처음부터 학습하는 트랜스포머 블록 4개)와 레이어별 KV 보정 헤드입니다. 감독은 원래 DiT 패스가 만든 키·값이고, 손실은 코사인 거리와 상대 L2, 그리고 다음 청크의 어텐션 출력 비교입니다. 논문은 1.3B에서 약 2ms, 14B에서 약 6ms이고, 기준 패스 대비 약 20배와 12배라고 적습니다. README 예제의 1.3B는 2.2ms입니다. 헤더로 센 개수는 S 346,205,952(BF16), L 890,168,064(BF16)입니다.

S의 KV 레시피는 GPU 32장, 업데이트 142,500번입니다. L은 64장, 같은 업데이트 수이고, DMD 단계의 EMA(critic 업데이트 1500)에서 시작합니다.

### 증류: ODE, causal teacher, consistency, DMD

S는 이 증류를 다시 하지 않습니다. 2스텝 CF++ 생성기를 얼리고 그 주위의 두 네트워크만 학습합니다. L은 Wan 2.1 14B에서 시작하고, 학습 문서의 단계가 CF++ 레시피를 그대로 따라갑니다.

| 단계 | 설정 | 레시피 |
| --- | --- | --- |
| 0. ODE 궤적 | `ffl_ode_data.yaml` | Euler 48스텝, CFG 5 |
| 1. 프레임 단위 causal teacher | `ffl_causal_teacher.yaml` | 256 GPU, 업데이트 1700을 선택 |
| 2. consistency distillation | `ffl_consistency.yaml` | 128 GPU, 업데이트 3000을 선택 |
| 3. self-forcing DMD | `ffl_dmd.yaml` | 128 GPU, critic 업데이트 1500의 EMA |
| 4–6. 디코더 재구성, 적대 학습, KV | `ffl_decoder_*.yaml`, `ffl_kv_refinement.yaml` | 64 GPU / 8 GPU / 64 GPU |

코드의 모듈 docstring이 각 단계의 모델을 적습니다. Causal teacher는 양방향 Wan 2.1 가중치를 형태 그대로 프레임 단위 자기회귀로 미세조정하고, 깨끗한 과거 프레임을 보여주는 teacher forcing으로 flow `noise - x0`를 맞춥니다. Consistency는 학생, 얼어 있는 teacher, EMA 타깃 세 벌을 두고, teacher의 CFG Euler 한 스텝을 학생과 EMA가 맞추게 합니다. teacher만 가이드를 보고, 학생은 conditional로만 샘플링합니다. DMD는 2스텝 생성기, 그 EMA, 얼어 있는 양방향 real score(CFG), 생성기 분포를 배우는 fake score(critic)가 있습니다. 생성기 입력은 프롬프트와 노이즈뿐이고, 클립은 self-forcing 롤아웃입니다. critic 업데이트 10번에 생성기 업데이트 1번입니다. `ffl_dmd.yaml`의 정상 상태 timestep은 `[1000, 833]`이고, 0번 프레임은 `[1000, 937, 833, 625]`입니다. `pipeline.py`의 추론 스케줄과 같은 수입니다.

### 설치와 생성 명령

README와 `docs/installation.md`의 설치 조건은 한 문장으로 같습니다. Linux x86-64, NVIDIA GPU, CUDA 12.8과 맞는 드라이버입니다. `pyproject.toml`은 `torch==2.9.1+cu128`과 `torchvision==0.24.1+cu128`을 고정하고, 인덱스를 `https://download.pytorch.org/whl/cu128`로 둡니다. `.python-version`은 3.10입니다. 같은 문서와 `pyproject.toml`에서 MPS, MLX, Apple Silicon 경로를 찾지 못했습니다. 학습 코드의 autocast 장치 문자열도 `cuda`입니다.

```bash
uv sync
uv run hf download apple/FastFrames-S --include 'fastframes-s/*' --local-dir checkpoints
uv run hf download zhuhz22/Causal-Forcing causal-forcing++/framewise-2step.pt --local-dir checkpoints
uv run hf download Wan-AI/Wan2.1-T2V-1.3B --local-dir checkpoints/Wan2.1-T2V-1.3B

uv run python scripts/generate.py --model ff-s --checkpoint-dir checkpoints \
    --prompt "A corgi surfing a wave at sunset" --seed 0 --output outputs/corgi.mp4
```

L은 `--model ff-l`이고, `fastframes-l/*`과 `Wan-AI/Wan2.1-T2V-14B`를 받습니다. 생성만 할 때는 Wan 다운로드에 `--exclude 'diffusion_pytorch_model*'`를 붙여 베이스 DiT를 빼도 된다고 설치 문서가 적습니다. 텍스트 인코더와 토크나이저는 Wan 쪽에서 읽습니다. 지연 재현 명령은 S가 GPU 1장 기본값이고 L의 논문 칸은 8장입니다.

```bash
uv run python evaluation/latency/benchmark.py ff-s            # 논문 36 ms
uv run python evaluation/latency/benchmark.py ff-l --gpus 8  # 논문 45 ms
```

이 명령은 이 환경에 GPU가 없어 실행하지 않았습니다.

### LingBot과 RealWonder

논문 4절은 같은 교체를 카메라 조건 모델 LingBot과 물리 조건 모델 RealWonder에 옮깁니다. 둘 다 1.3B와, LingBot은 14B도 있습니다. T2V용 FastFrames보다 느린 이유로 논문은 세 가지를 듭니다. LingBot은 확산 4스텝, RealWonder는 3스텝입니다. 자기회귀 한 번에 잠재 프레임을 여러 장 예측합니다. 조건 입력이 DiT 계산을 더합니다. 부록 E는 LingBot이 한 번에 잠재 4장, RealWonder가 3장이라고 적습니다. FastFrames T2V의 2스텝, 잠재 1장과 다른 구조입니다.

논문 그림 5의 표는 B200, 832×480, 가득 찬 캐시, 정상 상태입니다. 시간에는 샘플링, 행동 조건, KV 갱신, 픽셀 디코드가 들어갑니다.

| 구성 | 지연 |
| --- | ---: |
| LingBot 1.3B 공식, 1 GPU | 1,085 ms |
| LingBot 1.3B 공식 + Ulysses, 2 GPU | 842 ms |
| LingBot 1.3B 공식 + Ulysses, 4 GPU | 865 ms |
| LingBot 1.3B + FastFrames, 1 GPU | 224 ms |
| LingBot 1.3B + FastFrames, 8 GPU | 52 ms |
| LingBot 14B 공식 + Ulysses, 8 GPU | 1,373 ms |
| LingBot 14B + FastFrames, 8 GPU | 233 ms |
| RealWonder 1.3B 공식, 1 GPU | 1,141 ms |
| RealWonder 1.3B + FastFrames, 1 GPU | 153 ms |
| RealWonder 1.3B + FastFrames, 8 GPU | 51 ms |

본문은 LingBot 1.3B를 "가장 빠른 공식 구성인 2 GPU의 842ms에서 8 GPU의 52ms로, 16배"라고 적습니다. 842÷52=16.19입니다. 같은 1 GPU끼리이면 1,085÷224=4.84입니다. 4 GPU 공식 구성은 865ms로 2 GPU보다 느립니다. RealWonder의 22배는 1,141ms(1 GPU)에서 51ms(8 GPU)입니다. 같은 1 GPU끼리이면 1,141÷153=7.46입니다. LingBot 14B는 8장에서도 233ms라 50ms 목표 밖에 있습니다.

저장소의 `docs/lingbot.md`는 같은 1.3B를 다시 잰 표로 1 GPU 220.7ms, 8 GPU 50.5ms를 적습니다. 논문의 224ms, 52ms와 수 ms 차이이고, 중앙값 프로토콜이 문서에 따로 있습니다. 데모는 `apps/lingbot/demo.py --gpus 1` 또는 `--gpus 8`이고 브라우저는 `http://localhost:8000`입니다. 이미지는 832×464로 가운데 잘라 쓰고, 생성 출력도 832×464, 16fps입니다. 논문 표의 832×480과 세로가 16픽셀 다릅니다. 관찰된 피크 장치 메모리는 B200에서 1 GPU 44.8GiB, 8 GPU 모드에서 GPU당 41.3GiB입니다. 브라우저의 재생은 50fps이고 모델 타임라인 16fps와 별개라고 문서가 적습니다.

LingBot-World v2 코드와 가중치의 라이선스는 업스트림 CC BY-NC-SA 4.0입니다. `LICENSE_LINGBOT`이 그 전문을 붙입니다.

## 비즈니스 인사이트

### 같은 표 안의 자리 (분석)

비교는 논문 Table 1로 충분합니다. 같은 프롬프트, 같은 시드, 약 480p, B200이고, 8 GPU라고 적힌 행만 GPU 수가 다릅니다. 50ms 아래이면서 VBench Total이 CF++ 이상인 행은 FastFrames-S(1장 36ms, 8장 14ms)와 FastFrames-L의 8장 45ms입니다. L의 1장 158ms는 50ms 목표를 넘습니다. Krea-Realtime은 Total 84.42로 L의 84.44와 0.02 차이이고 지연은 1,675ms입니다. Semantic은 Krea가 81.81로 L의 80.29보다 높습니다. "더 빠르면서 모든 점수가 높다"는 L과 Krea의 관계에 대한 문장으로는 표와 어긋납니다. Total과 Quality는 L이 높고 Semantic은 Krea가 높습니다.

양방향 Wan2.1 1.3B의 같은 표 지연은 30,444ms입니다. 30,444÷36=845입니다. 이 845는 제가 표의 두 칸을 나눈 값입니다. 논문은 이 비율을 따로 적지 않습니다. 양방향 모델의 RPS는 클립 전체 하나에 대한 응답이라, 자기회귀 모델의 프레임 단위 응답과 같은 제품 경험이 아닙니다. 논문 서론이 그 차이를 정의로 못 박습니다.

### 누가 이 숫자를 쓸 수 있나 (분석)

- **B200 1장이 있는 팀의 480p 텍스트-비디오.** S의 36ms는 그 조건입니다. 생성기 가중치는 Apache-2.0인 CF++ 체크포인트이고, Apple이 배포한 것은 픽셀 디코더와 KV refiner입니다. 14B DiT는 `apple/FastFrames-L`에 있고 헤더 기준 BF16 14,288,491,584파라미터입니다.
- **카메라 조작 프로토타입.** LingBot 1.3B의 52ms는 B200 8장입니다. 코드와 가중치는 CC BY-NC-SA 4.0이라 문서가 가리키는 조건은 비상업입니다. 14B 월드는 8장에서도 233ms입니다.
- **H100만 있는 팀.** 부록은 H100이 구성에 따라 25%에서 50% 느리다고 합니다. 480p S의 성분만 더하면 54ms로, 50ms 선 위에 걸칩니다. 이 합은 논문의 끝간 숫자가 아닙니다.
- **소비자 GPU나 Apple Silicon.** Wan2.1 README는 T2V-1.3B가 VRAM 8.19GB이고, 양자화 없이 RTX 4090에서 5초 480P를 약 4분에 만든다고 적습니다. 그 문장은 최적화를 빼기 전의 베이스 모델입니다. FastFrames의 36ms를 4090이나 M시리즈에서 잰 표는 논문, README, 설치 문서에 없습니다. 부록 A는 본 측정을 B200에서 했고, 더 가벼운 하드웨어는 이후 과제라고 적습니다.

### 라이선스를 제품 앞에 두기 (분석)

법률 자문이 아닙니다. 저장소에 적힌 문장만 옮깁니다.

FastFrames 코드의 `LICENSE`는 README가 Apple Sample Code License라고 부르는 텍스트입니다. 허가는 "personal, non-exclusive license"로, Apple의 저작권 아래에서 사용, 복제, 수정, 재배포를 허용합니다. 수정 없이 전체를 재배포하면 고지와 면책을 남겨야 합니다. Apple의 이름과 상표로 파생 제품을 홍보하려면 사전 서면 허가가 필요합니다. 이어서 "no other rights or licenses ... including but not limited to any patent rights"라고 특허권을 주지 않는다고 적습니다. Hugging Face 카드의 `license` 필드는 `apple-amlr`입니다. L의 DiT, 두 모델의 디코더와 refiner는 이 저장소의 `LICENSE`와 함께 올라와 있습니다.

Wan 2.1 1.3B와 14B 카드의 라이선스 필드는 `apache-2.0`입니다. CF++ 체크포인트 카드도 `apache-2.0`입니다. S를 돌리는 생성기는 이쪽입니다. LingBot만 상업적 이용을 라이선스 이름(CC BY-NC-SA 4.0)에서 제외합니다.

의견으로는, 480p 텍스트-비디오 데모를 붙이는 팀과 LingBot 데모를 제품에 넣는 팀은 같은 허가를 받는 것이 아닙니다. 후자는 비상업 조항을 먼저 읽어야 하는 구성입니다. Apple 라이선스의 "personal"과 특허 유보가 상업 배포에서 어떤 효력인지는 이 글이 판단하지 않습니다.

### GPU를 몇 장 사야 숫자가 성립하나 (분석과 의견)

분석: 논문이 대화형이라고 칠한 칸은 S의 B200 1장(36ms)과 8장(14ms), L의 B200 8장(45ms)입니다. L의 1장은 158ms입니다. 월드모델에서 50ms 근처는 LingBot 1.3B 8장의 52ms와 RealWonder 1.3B 8장의 51ms이고, 둘 다 1장에서는 224ms와 153ms입니다. 8장 실행은 NVSwitch 노드를 문서로 요구합니다. LingBot 데모의 피크는 B200에서 44.8GiB(1장)와 41.3GiB/GPU(8장)입니다. T2V FastFrames의 추론 VRAM은 설치 문서와 논문에서 찾지 못했습니다. 시간당 임대료는 이 글에서 확인하지 않았습니다.

의견: 북마크가 말하는 16배가 제품의 원가에 주는 의미는 "같은 서버가 16배 싸졌다"가 아닙니다. 논문의 16배는 2장짜리 공식 구성과 8장짜리 FastFrames 구성의 지연 비입니다. 장당 지연이 아니라 응답 지연이 준 것이고, 14B 텍스트-비디오의 45ms는 8장이 있어야 성립합니다. 4090에서 몇 분에 5초를 만드는 Wan 1.3B를 이미 돌리는 팀에게 이 논문이 바로 주는 것은 그 4090의 교체 숫자가 아니라, 지연의 절반 이상이 VAE와 KV 갱신에 있다는 프로파일입니다.

## 팩트 체크

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| Apple이 Wan2.1 기반 고속 비디오 생성 모델 FastFrames를 공개했다 | ✅ | 저자 소속은 Apple이고, Gene Chou는 Apple 인턴십 중 수행, Cornell 소속이 함께 표기됩니다. 모델은 Wan 2.1 백본의 FastFrames-S 1.3B, FastFrames-L 14B(Table 1은 14.3)입니다. S는 Wan 2.1 1.3B 위의 CF++에서, L은 Wan 2.1 14B에서 증류합니다. arXiv `published`는 2026-11-17 18:59 UTC, GitHub `pushed_at`과 HF `lastModified`는 2026-11-18 05:29 UTC입니다. [논문](https://arxiv.org/abs/2611.23226), [GitHub](https://github.com/apple-aiml-research/ml-fastframes), [FastFrames-L](https://huggingface.co/apple/FastFrames-L) |
| 2스텝 생성이다 | ✅ | 논문 4절: 두 모델 모두 2스텝 확산이고 자기회귀 스텝당 잠재 프레임 하나. `pipeline.py`의 정상 상태 timestep은 S가 1000과 833.333, L이 1000과 833입니다. 0번 프레임만 네 timestep에 `t=0` DiT 패스가 더해집니다. 논문의 36ms는 가득 찬 캐시의 정상 상태입니다. [논문 4절](https://arxiv.org/abs/2611.23226), [pipeline.py](https://github.com/apple-aiml-research/ml-fastframes/blob/main/fastframes/pipeline.py) |
| 그 2스텝이 월드모델 827ms→52ms를 만든다 | ⚠️ | 52ms와 약 16배는 LingBot 1.3B의 숫자로 논문에 있습니다. 그 모델의 샘플링은 4스텝이고, 한 번에 잠재 4장을 만듭니다. T2V의 2스텝이 그 지연의 이유가 아닙니다. [논문 그림 5, 부록 E](https://arxiv.org/abs/2611.23226) |
| 월드모델 응답이 827ms→52ms, 약 16배 | ⚠️ | 논문은 LingBot 1.3B를 842ms에서 52ms로, 16배라고 적습니다. 842는 공식+Ulysses의 B200 2장이고, 52는 FastFrames의 B200 8장입니다. 842÷52=16.19입니다. 827은 논문 HTML, 프로젝트 페이지, README, `docs/inference.md`, `docs/lingbot.md`에서 찾지 못했습니다. 같은 GPU끼리의 1장 비교는 1,085ms→224ms입니다. 저장소가 다시 잰 1.3B는 220.7ms와 50.5ms입니다. RealWonder는 1,141ms(1장)→51ms(8장)로 논문이 22배라고 적은 다른 비교입니다. [논문](https://arxiv.org/abs/2611.23226), [lingbot.md](https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/lingbot.md) |
| Apple 연구인데 NVIDIA GPU(CUDA)가 필요하다 | ✅ | README와 설치 문서의 문장은 "Linux x86-64 with an NVIDIA GPU and a CUDA 12.8-compatible driver"입니다. `pyproject.toml`은 `torch==2.9.1+cu128`을 고정합니다. HF 카드 README는 저장소 README와 같은 문장입니다. 그 문서들에서 Apple Silicon, MPS, MLX 설치 경로는 찾지 못했습니다. 측정 GPU는 B200이고 부록은 H100을 추가로 적습니다. [README](https://github.com/apple-aiml-research/ml-fastframes/blob/main/README.md), [pyproject.toml](https://github.com/apple-aiml-research/ml-fastframes/blob/main/pyproject.toml) |
| Apple이 중국의 오픈 모델 Wan(Alibaba)을 토대로 썼다 | ✅ | Wan 기술 보고서 HTML의 저자 줄은 "Wan Team, Alibaba Group"입니다. Alibaba Group 소개는 1999년 항저우의 Jack Ma 등 18명이 설립했다고 적습니다. Wan 2.1 1.3B와 14B 카드 라이선스는 Apache-2.0입니다. FastFrames `ACKNOWLEDGEMENTS`는 "The Alibaba Wan Team Authors"를 적고, HF `base_model`은 `Wan-AI/Wan2.1-T2V-14B`와 `Wan-AI/Wan2.1-T2V-1.3B`입니다. S의 생성기 파일은 그 위의 CF++ 체크포인트로, Apple 저장소에 DiT가 들어 있지 않습니다. [Wan 논문](https://arxiv.org/abs/2503.20314), [Alibaba Group 소개](https://www.alibabagroup.com/en-US/about-alibaba), [ACKNOWLEDGEMENTS](https://github.com/apple-aiml-research/ml-fastframes/blob/main/ACKNOWLEDGEMENTS) |

## 참고 자료

- Chou 외, [FastFrames: Video Generation at Interactive Latency](https://arxiv.org/abs/2611.23226), arXiv:2611.23226v1, 2026-11-17. [HTML](https://arxiv.org/html/2611.23226v1), [프로젝트 페이지](https://apple-aiml-research.github.io/ml-fastframes/)
- Apple, [apple-aiml-research/ml-fastframes](https://github.com/apple-aiml-research/ml-fastframes). [README](https://github.com/apple-aiml-research/ml-fastframes/blob/main/README.md), [설치](https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/installation.md), [추론](https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/inference.md), [학습](https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/training.md), [LingBot](https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/lingbot.md), [pipeline.py](https://github.com/apple-aiml-research/ml-fastframes/blob/main/fastframes/pipeline.py), [LICENSE](https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE), [LICENSE_LINGBOT](https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE_LINGBOT)
- Hugging Face, [apple/FastFrames-L](https://huggingface.co/apple/FastFrames-L) 리비전 `18f30cbd`, [apple/FastFrames-S](https://huggingface.co/apple/FastFrames-S) 리비전 `aa099efc`
- Wan Team, Alibaba Group, [Wan: Open and Advanced Large-Scale Video Generative Models](https://arxiv.org/abs/2503.20314), arXiv:2503.20314v1, 2025-03-26. [Wan2.1 README](https://github.com/Wan-Video/Wan2.1) (T2V-1.3B 8.19GB, RTX 4090, 약 4분). [Wan2.1-T2V-1.3B](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B), [Wan2.1-T2V-14B](https://huggingface.co/Wan-AI/Wan2.1-T2V-14B)
- [zhuhz22/Causal-Forcing](https://huggingface.co/zhuhz22/Causal-Forcing), [thu-ml/Causal-Forcing](https://github.com/thu-ml/Causal-Forcing)
- [Alibaba Group 소개](https://www.alibabagroup.com/en-US/about-alibaba)
- 원본 X 포스트: [@C_of_Creativity](https://x.com/C_of_Creativity/status/2122857308955054369)
