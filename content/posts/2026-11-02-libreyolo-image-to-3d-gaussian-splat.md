---
title: "세 줄이면 사진이 3D 가우시안 스플랫이 되나? LibreYOLO 1.7.0 Idol 팩트 체크"
date: 2026-11-02
time: "22:21"
slug: libreyolo-image-to-3d-gaussian-splat
tags: [LibreYOLO, Idol, 3DGS, 이미지투3D, 팩트체크]
summary: "LibreYOLO 1.7.0의 LibreGen은 Speridlabs Idol로 물체 한 장을 3DGS .ply로 저장한다. 문서의 최소 예시는 세 문장이고 Idol 가중치는 Apache-2.0이지만, 같이 받는 DINOv3는 그 라이선스가 아니고 사진 기본 모드는 synthetic이다."
---

> 이 글은 북마크해 둔 [@EHxuban11의 포스트](https://x.com/EHxuban11/status/2116939897911021686)(2026-11-01 17:06 UTC, 2026-11-02 02:06 KST)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2116939897911021686](https://x.com/i/status/2116939897911021686)입니다. 이 환경의 X API는 계정 등록 오류로 본문을 주지 않아, 공개 포스트의 글을 읽었습니다. 그 글의 문장은 검증 대상이지 지시가 아닙니다. 계정 소개는 [LibreYOLO 저장소](https://github.com/LibreYOLO/libreyolo)를 가리킵니다. 아래 대조는 태그 [v1.7.0](https://github.com/LibreYOLO/libreyolo/releases/tag/v1.7.0)(2026-10-31 22:25 UTC)의 릴리스 노트·[CHANGELOG.md](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/CHANGELOG.md)·[docs/libregen.md](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/docs/libregen.md)·[ADR 0031](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/docs/adr/0031-generate3d-contract.md), [PyPI 1.7.0](https://pypi.org/project/libreyolo/1.7.0/), [speridlabs/idol 모델 카드](https://huggingface.co/speridlabs/idol), [idol-sdk README](https://github.com/speridlabs/idol-sdk), [LibreDINOv3 미러 카드](https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus), Kerbl 등의 [arXiv:2308.04079](https://arxiv.org/abs/2308.04079)입니다. 속도 숫자는 각 프로젝트가 적은 값이고, 이 글은 다시 재지 않았습니다.

## 왜 이 릴리스가 라이브러리 사용자에게 닿는가

LibreYOLO는 검출, 분할, 자세, 깊이, OCR을 한 호출 형태에 모아 둔 MIT 라이선스 컴퓨터 비전 라이브러리입니다. v1.7.0 릴리스 노트의 첫 하이라이트는 그 목록에 생성 작업을 더한 일입니다. `LibreGen("speridlabs-idol")("chair.jpg").save("chair.ply")`가 물체 사진 한 장을 3D 가우시안 스플랫으로 저장합니다. 작업 이름은 `generate3d`이고, 첫 패밀리는 Speridlabs의 Idol입니다.

그 다음 패치 [v1.7.1](https://github.com/LibreYOLO/libreyolo/releases/tag/v1.7.1)(GitHub 게시 2026-11-01 23:22 UTC, PyPI 업로드 2026-11-02 00:03 UTC)이 이미 최신입니다. 포스트 시각에는 1.7.0이 최신이었습니다. 1.7.1의 `docs/libregen.md`는 v1.7.0과 같고, 3D 쪽 수정은 모르는 인자 오류가 `imgsz`를 나열하던 것과, 같은 모델을 두 인스턴스가 동시에 받을 때의 다운로드 경쟁입니다. 기능이 1.7.1에서 빠진 문장은 릴리스 노트에 없습니다.

이 블로그의 [Massless/Chucksi 노트](https://betelg15.github.io/posts/massless-open-source-ai-film-studio/)는 같은 `speridlabs/idol`을 SDK의 `IdolPipeline`으로 부릅니다. 이번 글의 입구는 그 SDK가 아니라 LibreYOLO의 `LibreGen`입니다.

## 한 장이 스플랫이 되기까지

Kerbl, Kopanas, Leimkühler, Drettakis의 [*3D Gaussian Splatting for Real-Time Radiance Field Rendering*](https://arxiv.org/abs/2308.04079)(arXiv 2023-08-08, 저널 표기 ACM Transactions on Graphics 42(4), 2023년 7월)은 여러 장의 사진으로 찍은 장면의 새로운 시점을 실시간으로 그리는 방법입니다. 초록은 카메라 보정에서 나온 성긴 점에서 시작해 장면을 3D 가우시안으로 나타내고, 비등방 공분산을 최적화와 밀도 조절로 다듬으며, 가시성을 아는 스플랫 래스터라이저로 1080p에서 초당 30프레임 이상을 낸다고 적습니다. 입력이 많은 시점이고, 출력이 그 장면의 가우시안 집합입니다.

Idol이 하는 일은 그 최적화가 아닙니다. 모델 카드의 문장은 물체 사진, 렌더, 생성 이미지 중 한 장을 받아, 사진에 없는 면까지 포함해 최대 1,048,576개의 가우시안을 표준 3DGS `.ply`로 쓴다는 것입니다. 표현(위치, 크기, 회전, 불투명도, 색)을 Kerbl 계열 뷰어가 읽게 맞춘 생성 모델입니다. ADR 0031은 결과를 장면이 아니라 물체 하나의 프레임에 둡니다. z가 위이고, 한 변이 1인 정육면체 `[-0.5, 0.5]^3` 한가운데입니다.

v1.7.0 ADR이 적는 계산 순서는 이렇습니다.

1. 1024px 입력을 DINOv3 ViT-H+와 FLUX.2 VAE가 토큰으로 바꿉니다.
2. 그 조건으로 rectified-flow 디노이저가 물체 잠재 8192토큰과 카메라 토큰 하나를 샘플합니다. 문서의 기본은 50스텝, guidance 3.0, shift 3.0입니다.
3. 옥트리 디코더가 앵커를 놓고, 가우시안 디코더가 앵커마다 32개의 가우시안을 만듭니다. 개수 인자는 32의 배수로 내려 32,768에서 1,048,576까지입니다. 기본은 262,144입니다.
4. 파일에 진짜 알파가 있으면 그 컷아웃을 쓰고, 없으면 BiRefNet이 배경을 뺍니다. `mode`는 크롭이 물체 주변에 남기는 여백입니다.

모델 카드의 파라미터 표와 LibreYOLO가 말하는 0.66B는 이렇게 만납니다. DiT 370.6M, 옥트리 디코더 50.8M, 가우시안 디코더 237.3M을 더하면 658.7M입니다. CHANGELOG의 "0.66B denoiser"는 이 합을 가리키고, DiT 행 하나만은 370.6M입니다. 같은 표의 전체 요청은 BiRefNet 220.7M, DINOv3 840.6M, FLUX.2 VAE 84.1M을 넣어 약 1.80B이고, 가중치 약 3.7–4.4GB, 피크 7.2GB입니다.

`Results.gaussians`의 배열은 ADR에 이렇게 적혀 있습니다. `xyz` `(N, 3)`, `scales` `(N, 3)` 선형 표준편차, `rotations` `(N, 4)` 쿼터니언 `(w, x, y, z)`, `opacities` `(N,)`, `sh` `(N, K, 3)`. Idol 경로의 색은 0차 구면조화라 `K = 1`이고, `colors`는 그 항이 가리키는 RGB입니다. 시점에 따라 색이 바뀌는 고차 항은 이 페이로드에 없고, `.ply` 저장은 `K > 1`을 거절합니다. `.ply`는 뷰어가 기대하는 y-up 3DGS 레이아웃이고, 시드와 카메라와 설정은 헤더 주석에 들어갑니다. `.splat`은 가우시안당 32바이트입니다. `plot()`은 가우시안 래스터가 아니라 입력 시점에서 점을 찍어 보는 미리보기입니다.

## 문서에 있는 세 줄

v1.7.0 `docs/libregen.md`의 Image to 3D 절은 호출을 세 문장으로 적습니다. ADR 0031도 같은 세 문장이고, "그게 설정의 전부"라고 합니다.

```python
from libreyolo import LibreGen

model = LibreGen("speridlabs-idol")      # autodownloads
result = model("chair.jpg")              # Results
result.save("chair.ply")                 # opens in any Gaussian splat viewer
```

설치는 그 밖에 있습니다.

```bash
pip install "libreyolo[gen]"
```

`gen` 엑스트라는 `diffusers>=0.38.0`, `transformers>=5.1.0`, `accelerate>=1.7.0`입니다. CHANGELOG는 이 엑스트라가 `libreyolo[all]`에 들어 있고 `libreyolo[molmo2]`와 같이 설치되지 않는다고 적습니다. 기본 `pip install libreyolo`만으로는 이 호출이 준비되지 않습니다.

사진이면 같은 문서가 `mode`를 바꿉니다. 기본값은 `"synthetic"`입니다.

```python
model("photo.jpg", mode="real")          # photographs: a looser crop
model("render.png", gaussians=1_048_576) # more detail, from 32,768 to 1,048,576
model("chair.jpg", steps=25)             # faster, a little less detail
```

| 인자 | 기본 | 문서가 적는 뜻 |
|---|---|---|
| `steps` | 50 | 샘플링 스텝. 줄이면 빠르고 디테일이 준다 |
| `guidance` | 3.0 | classifier-free guidance. 0이면 끈다 |
| `shift` | 3.0 | 플로우 시간을 높은 노이즈 쪽으로 |
| `gaussians` | 262144 | 32,768–1,048,576, 32의 배수로 내림 |
| `mode` | `"synthetic"` | 렌더·생성 이미지 또는 `"real"` 사진. 모델 페이지의 크롭 변은 물체 크기의 1.2배 또는 1.7배 |
| `margin` | 없음 | 크롭 변/물체 크기를 직접 지정. `mode`보다 우선 |

CLI는 `libreyolo generate source=chair.jpg`입니다. `source=`가 있으면 모델 기본값이 `speridlabs-idol`이고, 저장 기본값은 켜진 채 `runs/generate/predict` 아래 `.ply`입니다. `prompt=`와 `imgsz`는 이 패밀리에서 예외를 냅니다. `train()`, `val()`, `export()`도 `NotImplementedError`입니다.

포스트가 링크한 [모델 페이지](https://www.libreyolo.com/docs/models/speridlabs-idol)의 첫 예시는 이 세 문장보다 깁니다. SDK 예시 이미지 URL, `seed=0`, `.ply`와 `.splat`, `len(result.gaussians)`가 더 있습니다. 페이지 바닥은 "Verified against LibreYOLO v1.7.0"입니다.

## 속도와 결정론의 한계

`docs/libregen.md`와 ADR 0031이 H100 기본 설정으로 적은 시간은 eager 9.8초, `compile=True`로 첫 컴파일 이후 6.4초입니다. [모델 페이지](https://www.libreyolo.com/docs/models/speridlabs-idol)는 M4 Pro MPS eager에서 물체 둘을 464–467초로 적고, 첫 값에 로컬 디스크에서 가중치를 읽는 시간이 들어 있다고 합니다. `docs/libregen.md`는 GPU 메모리를 8GB 미만이라고 적습니다. `compile=True`는 CUDA 전용이고, SDK의 optimize 경로(디노이저 컴파일, guidance 있는 패스와 없는 패스를 한 배치, 샘플링 동안 cuDNN 어텐션과 TF32)를 재현합니다. eager와 컴파일 경로는 같은 물체이고 같은 가우시안 좌표는 아닙니다.

모델 카드의 GPU 표는 50스텝, 262,144개, 이미지 8장의 중앙값입니다. 최적화 샘플링은 GPU에서 기본입니다.

| GPU | 카드가 적은 VRAM | 요청 시간 |
|---|---:|---:|
| B300 | 269 GB | 3.4 s |
| H100 | 80 GB | 6.7 s |
| RTX 5090 | 32 GB | 14.1 s |
| RTX 4090 | 24 GB | 19.1 s |
| RTX 3080 | 10 GB | 46.2 s |
| L4 | 22 GB | 54.6 s |

같은 카드 첫머리는 "under 2 seconds"라고 적고, 표에서 가장 짧은 칸은 B300의 3.4초입니다. 같은 카드의 H100 품질 표 요청 시간은 6.8초입니다. 프로토콜이 문장마다 다르므로, 이 글은 2초를 측정값으로 쓰지 않습니다. LibreYOLO의 9.8초/6.4초와 SDK의 6.7초도 서로 다른 절차입니다.

시드는 장치 위 생성기에서 나옵니다. 그래서 같은 시드가 CUDA, MPS, CPU에서 같은 물체를 보장하지 않습니다. CUDA에서는 같은 시드와 설정이 SDK와 같은 물체를 내고, 드물게 가우시안 일부만 달라집니다. ADR은 H100, PyTorch 2.15에서 옥트리 디코더 첫 스텝의 cuDNN 커널이 GPU 메모리 이력에 의존하고, 40회 중 출력이 2종류, 차이 1.6e-4였다고 적습니다. 포트 대 SDK 143회 중 3회에서 일부 가우시안이 움직였고, SDK도 같은 현상이 있다고 합니다.

다운로드는 문서 기준으로 Idol 자체 가중치 약 3.1GB(`speridlabs/idol` → `weights/LibreSperidlabsIdol0.6b/`), DINOv3 1.7GB, FLUX.2 VAE 0.2GB입니다. 로그인은 필요 없다고 ADR이 적습니다. 그 문장의 의미는 아래 라이선스 절에 있습니다.

## 비즈니스 인사이트

2026년의 단일 이미지→3D는 호스팅 서비스와 가중치를 받는 로컬 모델이 같이 있습니다. 이 글이 가격표를 확인한 호스팅 요금은 없습니다. 로컬 쪽의 비교는 라이선스와 출력 형식입니다.

| 경로 | 라이선스 자료 | 출력이라고 적힌 것 |
|---|---|---|
| LibreYOLO 코드 | MIT ([LICENSE](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/LICENSE)) | 어댑터. Idol 네트워크는 별도 |
| Idol 코드·가중치 | Apache-2.0 ([모델 카드](https://huggingface.co/speridlabs/idol) `license: apache-2.0`, [NOTICE](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/libreyolo/models/gen/speridlabs_idol/NOTICE)) | 3DGS `.ply`, 32,768–1,048,576 |
| 공식 SDK가 받는 인코더 | 게이트. `facebook/dinov3-vith16plus-pretrain-lvd1689m`, `black-forest-labs/FLUX.2-dev`의 VAE. `hf auth login` | 카드의 1단계 |
| LibreYOLO가 받는 인코더 | DINOv3는 [LibreYOLO/LibreDINOv3vith16plus](https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus)의 DINOv3 License. VAE는 [FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) Apache-2.0 | bf16로 캐스팅한 동일 텐서라고 ADR과 미러 카드가 적음 |
| TRELLIS | 모델과 코드 대부분이 MIT ([README](https://github.com/microsoft/TRELLIS)) | 텍스트 또는 이미지에서 Radiance Field, 3D Gaussian, 메시. 최대 2B, 데이터 500K 물체. 테스트는 Linux |
| TripoSR | 코드·사전학습 가중치·데모가 MIT ([README](https://github.com/VAST-AI-Research/TripoSR)) | 단일 이미지 피드포워드 재구성. A100에서 0.5초 미만은 그 README의 문장 |
| Hunyuan3D 2.0 | [커뮤니티 라이선스](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE) | 저장소가 공개한 3D 생성 모델. 영토와 MAU 조건이 본문에 있음 |

Hunyuan3D 2.0 라이선스 첫머리의 문장은 이 계약이 유럽연합, 영국, 대한민국에는 적용되지 않는다는 것이고, Territory 정의도 그 세 지역을 뺍니다. 버전 릴리스일 기준으로 직전 달의 월간 활성 사용자가 100만을 넘으면 Tencent에 별도 라이선스를 요청해야 한다는 조항도 있습니다. 이 문단은 라이선스 본문을 옮긴 것이지 법률 자문이 아닙니다.

DINOv3 미러 카드는 가중치가 LibreYOLO의 MIT가 아니라고 적고, 계약을 통과시켜야 재배포할 수 있다고 합니다. 카드가 요약한 제한은 무역 통제와 개인정보 법령, ITAR 해당 활동, 군사·전쟁 목적, 원자력, 스파이, 총기나 불법 무기의 개발·사용, 역어셈블 금지, 연구 발표 때의 표시입니다. 카드는 이 요약이 본문을 대체하지 않는다고 적습니다. ADR은 미러의 615개 텐서가 bf16으로 읽은 Meta 체크포인트와 같고, FLUX.2-klein VAE도 bf16에서 `FLUX.2-dev` VAE와 텐서가 같아 출력이 바뀌지 않는다고 합니다. 게이트를 없앤 방법은 학습을 다시 한 것이 아니라 받는 저장소를 바꾼 것입니다.

Speridlabs가 H100 한 장에서 적은 품질 표는 Idol, TripoSplat, TRELLIS, LGM의 평균입니다. Idol은 SSIM 0.726, LPIPS 0.213, IoU 0.862, DINOv2 0.781, CLIP 0.885, sharpness distance 0.81, 요청 6.8초로 각 열의 최선이라고 굵게 표시됩니다. PSNR은 LGM 12.46이 Idol 12.25보다 높고, 요청 시간은 LGM 1.1초가 가장 짧습니다. 표 아래 주는 LGM의 PSNR이 픽셀 제곱 오차의 평균이라 흐린 결과도 높게 나올 수 있다고 합니다. 이 표의 저자는 Speridlabs이고, LibreYOLO 1.7.0 릴리스 노트에는 대응되는 품질 열이 없습니다.

**분석/의견.** 이득이 갈리는 자리는 "물체 하나, `.ply`, 자기 GPU, Python"입니다. 이미 LibreYOLO로 이미지를 다루는 코드에 세 문장을 붙이는 비용은 작고, Hugging Face 접근 신청을 기다리던 SDK 설치보다는 ADR이 적는 경로가 짧습니다. 손해가 생기는 읽기는 세 가지입니다. Apache-2.0 한 단어로 제품을 출하하면 DINOv3 계약이 빠집니다. 기본 `mode`로 휴대폰 사진을 넣으면 문서가 사진에 적어 둔 크롭이 빠집니다. `.ply`를 게임 엔진의 메시로 읽으면, ADR이 메시 생성과 `export()`를 범위 밖으로 둔 사실이 빠집니다. 검출 파이프라인을 1.6.0에서 1.7.0으로 올리는 일은 이 기능과 별개로 YOLO9 학습 숫자, 혼동 행렬 축, `agnostic_nms`의 예외를 바꿉니다. 3D 한 줄을 위해 그 릴리스를 통째로 받는 결정과, 생성만 새 환경에 두는 결정은 문서상 다릅니다.

한국에서 제품을 만드는 팀에게 Hunyuan3D 2.0 계약의 대한민국 제외는 품질 순위보다 먼저 읽는 문장입니다. TRELLIS의 MIT와 메시 출력, TripoSR의 MIT와 README의 0.5초 미만은 다른 산출물을 삽니다. Idol을 고르는 이유는 그 표의 1등이어서가 아니라, 가우시안 파일과 Apache-2.0 가중치와 LibreYOLO 호출이 한 자리에 있기 때문입니다. 품질을 제품 기준으로 쓰려면 Speridlabs 표 밖의 샘플이 필요합니다. 이 글은 그 샘플을 만들지 않았습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 방향은 맞거나 일부만 맞음 / ❌ 1차 자료와 어긋나거나, 그 내용이 1차 자료에 없음

확인 시점은 2026-11-02입니다. 포스트 본문은 공개 페이지에서 읽었고, 문장은 아래 표의 주장으로 나누었습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| LibreYOLO 1.7.0이 나왔다 | ✅ | 태그 [v1.7.0](https://github.com/LibreYOLO/libreyolo/releases/tag/v1.7.0) 게시 2026-10-31 22:25 UTC. [PyPI 1.7.0](https://pypi.org/project/libreyolo/1.7.0/) 업로드 2026-10-31 22:39 UTC. 포스트 시각 17:06 UTC에는 이것이 최신이었다. 이 글을 쓰는 시점의 PyPI 최신은 [1.7.1](https://pypi.org/project/libreyolo/1.7.1/)(업로드 2026-11-02 00:03 UTC)이다. |
| 이번 릴리스는 이미지→3D가 들어 있는 특별한 릴리스다 | ✅ | 릴리스 노트 첫 하이라이트가 Image to 3D with Speridlabs Idol, 작업 `generate3d`다. 같은 릴리스에 텍스트→이미지, WeVisOne-VL, 검증 지표, YOLO9 학습 수정도 있다. "특별하다"는 평가이고, 이미지→3D가 1.7.0에 들어온 것은 릴리스 본문이다. |
| 첫 모델은 @speridlabs의 Speridlabs Idol이다 | ✅ | ADR 0031: 첫 패밀리 `speridlabs-idol`, 업스트림 `speridlabs/idol`, 코드 `speridlabs/idol-sdk`. v1.7.0 README 작업 표의 3D generation 행은 Speridlabs Idol뿐이다. |
| 품질이 놀랍다 | ⚠️ | 릴리스 노트에 품질 숫자가 없다. 정량 표는 [모델 카드](https://huggingface.co/speridlabs/idol)의 자체 H100 비교다. Idol이 SSIM·LPIPS·IoU·DINOv2·CLIP·선명도 거리에서 표의 최선이고, PSNR과 요청 시간은 LGM이 앞선다. 작성 계정의 소개는 LibreYOLO 저장소를 가리킨다. 이 글은 표를 재지 않았다. |
| 사진 한 장이 들어가 3D 가우시안 스플랫이 나온다 | ⚠️ | 물체 한 장 → `.ply` 또는 `.splat`은 [docs/libregen.md](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/docs/libregen.md)와 ADR과 맞다. 장면은 ADR의 범위 밖이다. 기본 `mode`는 `"synthetic"`이고, 사진은 `mode="real"`이다. 세 문장 예시는 `mode`를 넘기지 않는다. 보이지 않는 면은 생성이다. 색은 0차 구면조화다. |
| 세 줄이면 된다 | ✅ | `docs/libregen.md`와 ADR 0031의 예시는 `import`, `LibreGen(...)`, `save` 세 문장이다. 릴리스 노트는 같은 호출을 `LibreGen("speridlabs-idol")("chair.jpg").save("chair.ply")` 한 줄로 적는다. `pip install "libreyolo[gen]"`은 그 밖에 있다. 포스트가 연 모델 페이지의 첫 블록은 URL과 `seed`와 `.splat`이 더 길다. |
| Apache-2.0이다 | ⚠️ | Idol 코드와 `speridlabs/idol` 가중치는 Apache-2.0이다. LibreYOLO 어댑터는 MIT이고, NOTICE의 TripoSplat 코드는 MIT다. 실행에 필요한 DINOv3는 [미러 카드](https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus)가 DINOv3 License이며 MIT가 아니라고 적는다. |
| 가중치를 그들의 Hugging Face에서 그대로 받는다 | ⚠️ | Idol 자체 가중치(디노이저, 디코더, BiRefNet)는 `speridlabs/idol` 핀된 스냅샷을 변경 없이 받는다고 ADR이 적는다. DINOv3는 `LibreYOLO/LibreDINOv3vith16plus`이고, VAE는 `black-forest-labs/FLUX.2-klein-4B`다. 모델 카드가 SDK 사용자에게 받는다고 적는 게이트된 `FLUX.2-dev`와 Meta DINOv3 저장소는 이 경로의 다운로드가 아니다. |

**총평:** 1.7.0에 이미지→3D가 들어 있고, 첫 모델이 Speridlabs Idol이며, 저장소 문서의 최소 호출이 세 문장이라는 뼈대는 릴리스와 ADR과 맞습니다. 느슨한 곳은 "사진"의 기본 모드, "품질이 놀랍다"는 작성자 평가, 그리고 Apache-2.0과 Hugging Face를 실행에 필요한 인코더까지 가리키는 읽기입니다. Idol 가중치 자체는 Apache-2.0으로 `speridlabs/idol`에서 오지만, 그 호출이 같이 받는 DINOv3는 다른 저장소와 다른 계약입니다.

## 참고 자료

- LibreYOLO v1.7.0 (2026-10-31 22:25 UTC) — [릴리스](https://github.com/LibreYOLO/libreyolo/releases/tag/v1.7.0) · [CHANGELOG.md](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/CHANGELOG.md) · [docs/libregen.md](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/docs/libregen.md) · [ADR 0031](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/docs/adr/0031-generate3d-contract.md) · [Idol NOTICE](https://github.com/LibreYOLO/libreyolo/blob/v1.7.0/libreyolo/models/gen/speridlabs_idol/NOTICE) · [PyPI 1.7.0](https://pypi.org/project/libreyolo/1.7.0/)
- LibreYOLO v1.7.1 (GitHub 2026-11-01 23:22 UTC, PyPI 2026-11-02 00:03 UTC) — [릴리스](https://github.com/LibreYOLO/libreyolo/releases/tag/v1.7.1) · [PyPI](https://pypi.org/project/libreyolo/1.7.1/). `docs/libregen.md`는 v1.7.0과 같다.
- 공개 문서 페이지(바닥의 확인 버전은 v1.7.0) — [Speridlabs Idol](https://www.libreyolo.com/docs/models/speridlabs-idol) · [3D generation](https://www.libreyolo.com/docs/tasks/3d-generation)
- Speridlabs, Idol 모델 카드와 SDK — [Hugging Face](https://huggingface.co/speridlabs/idol) · [idol-sdk](https://github.com/speridlabs/idol-sdk) · [연구 페이지](https://speridlabs.com/research/idol). 저자 표기는 NOTICE의 Alejandro Cañada, Chema Garabito, 2026.
- DINOv3 미러와 FLUX.2 VAE — [LibreYOLO/LibreDINOv3vith16plus](https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus) · [black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) (`license: apache-2.0`)
- Kerbl, Kopanas, Leimkühler, Drettakis, *3D Gaussian Splatting for Real-Time Radiance Field Rendering*, arXiv:2308.04079, 2023-08-08. 저널 표기 ACM Transactions on Graphics, volume 42(4), July 2023 — [abs](https://arxiv.org/abs/2308.04079)
- 라이선스 비교에 쓴 다른 이미지→3D — [TRELLIS README](https://github.com/microsoft/TRELLIS) · [TripoSR README](https://github.com/VAST-AI-Research/TripoSR) · [Hunyuan3D 2.0 Community License](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE)
- 원본 X 포스트: [@EHxuban11](https://x.com/EHxuban11/status/2116939897911021686) · [상태 주소](https://x.com/i/status/2116939897911021686)
