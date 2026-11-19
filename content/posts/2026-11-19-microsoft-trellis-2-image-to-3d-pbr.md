---
title: "몇 초면 상용 3D인가? Microsoft TRELLIS.2 팩트 체크"
date: 2026-11-19
time: "22:24"
slug: microsoft-trellis-2-image-to-3d-pbr
tags: [TRELLIS.2, Microsoft, 3D생성, PBR, 팩트체크]
summary: "기본 run()은 1024 cascade이고 H100 공개 시간은 약 17초다. 512³만 약 3초, 1536³는 약 60초. 가중치는 MIT지만 기본 배경 제거는 CC BY-NC, GLB 베이크는 비상업 nvdiffrast다."
---

> 이 글은 X 포스트 [2123191492902813890](https://x.com/0x0SojalSec/status/2123191492902813890)를 계기로 썼습니다. 이 환경의 X API `get_posts_by_id`는 `billing-scope-missing`으로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2123191492902813890)(`code` 200)으로 읽었습니다. `created_at`은 `Wed Nov 18 23:07:53 +0000 2026`, **2026-11-19 08:07 KST**입니다. 계정은 0x0SojalSec, 표시 이름 Md Ismail Šojal, 사용자 id `1445347022555340805`, 팔로워 66,622, `verification.type`은 `individual`입니다. 같은 응답의 스냅샷은 답글 12, 리포스트 34, 좋아요 434, 북마크 488, 인용 3, 조회 15,930이고 커뮤니티 노트는 `null`입니다. `is_note_tweet`은 true입니다. 응답의 `text`는 아래 문장입니다.
>
> Microsoft Open-sourced a 4B model that turns any image into a production-ready 3D asset in seconds. TRELLIS.2 delivers fully textured, physically accurate models with complete PBR materials (base color, roughness, metallic, opacity). It handles complex geometry including hair, cloth, glass, and non-manifold surfaces, then exports clean .glb files ready for Unity, Unreal, or Blender. It runs locally, the full training code is public, and you can fine-tune it on your own asset library for studio-specific style.
>
> 링크는 `github.com/microsoft/TRELLIS.2`입니다. 이 문장들은 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-19에 연 1차 자료입니다. 논문은 Xiang 외, [Native and Compact Structured Latents for 3D Generation](https://arxiv.org/abs/2512.14692), arXiv:2512.14692v1, 2025-12-16입니다. 프로젝트 페이지는 [microsoft.github.io/TRELLIS.2](https://microsoft.github.io/TRELLIS.2/)이고, 그 HTML의 `Last-Modified`는 2025-12-17입니다. 코드는 [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)입니다. GitHub API 기준 `created_at`은 2025-11-26, `license.spdx_id`는 MIT, 같은 날 `stargazers_count`는 13,031, `forks_count`는 1,586입니다. `main`의 커밋 목록에서 본 시각은 Init Release `de38fdd4`가 2025-12-09, Release Training Code `5565d240`가 2026-01-10, 목록의 최신이 2026-06-05입니다. 저장소 `pushed_at`은 2026-07-10입니다. 가중치는 [microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B)이고, API의 `createdAt`은 2025-12-01, `lastModified`는 2025-12-27, `sha`는 `af44b45f2e35a493886929c6d786e563ec68364d`, `downloads`는 2,438,605, `likes`는 1,525입니다. 추론은 돌리지 않았고, safetensors 헤더도 읽지 않았습니다.

## 왜 중요한가

이미지 한 장에서 PBR 메쉬가 나오면, 게임·영상 스튜디오의 블록아웃 단계가 바뀝니다. 바뀌기 전에 나눠야 할 질문은 다음입니다.

- 4B가 가중치 파일 하나의 파라미터인가, 단계별 DiT의 합인가.
- "몇 초"가 어느 해상도, 어느 GPU의 숫자인가. 저장소 예제의 기본 파이프라인이 그 칸인가.
- PBR이 base color, roughness, metallic, opacity 네 채널인가, 노멀·이미시브까지 포함한 세트인가.
- `.glb`를 만드는 함수가 MIT 코드만 쓰는가, 라이선스가 다른 래스터라이저를 부르는가.
- 기본 전처리가 알파가 없는 사진에 어떤 배경 제거 모델을 붙이는가.
- 학습 코드가 공개된 것과, 스튜디오 화풍으로 맞춰진 체크포인트가 있는 것은 같은 문장인가.

이 포스트가 말하는 "지금 열린 4B"의 달력은 2026-11-18이 아닙니다. 논문 HTML은 2025-12-16, 추론 코드의 Init Release 커밋은 2025-12-09, 학습 코드 커밋 메시지는 2026-01-10입니다.

## 기술 설명

### 원조 TRELLIS와 갈라지는 지점

원조 [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS) README는 Structured LATent(SLat)와 rectified flow 트랜스포머로, 텍스트 또는 이미지에서 Radiance Field, 3D Gaussian, 메쉬를 만든다고 적습니다. 공개 모델은 최대 20억 파라미터이고, 학습 자산은 50만 개입니다. 라이선스 문장은 모델과 코드 대부분이 MIT입니다. 하드웨어 문장은 NVIDIA GPU 16GB 이상, 검증 장치는 A100과 A6000입니다. 논문은 arXiv:2412.01506, CVPR 2025입니다.

TRELLIS.2 논문 1절은 그 SLat를 이렇게 한정합니다. 멀티뷰 2D 특징과 렌더링 감독에 기대어, 복잡한 구조와 재질을 놓친다고 적습니다. 같은 절은 최근 대형 3D 모델이 SDF나 FlexiCubes 같은 등위면 장에 기대고, 그 표현이 열린 곡면, 비다양체, 내부에 닫힌 구조를 다루는 데 한계가 있다고 적습니다. TRELLIS.2는 메쉬에서 바로 뽑는 희소 복셀 **O-Voxel**과, 그 위의 Sparse Compression VAE, 그리고 flow-matching DiT로 이미지에서 3D를 만듭니다. 텍스트 조건 생성은 이 README의 기능 목록에 없습니다. 입력은 모델 카드가 "Single Image"라고 적습니다.

`pipeline.json`의 `sparse_structure_decoder`는 `microsoft/TRELLIS-image-large`의 `ss_dec_conv3d_16l8_fp16`입니다. 그 카드의 라이선스 필드는 `mit`이고 `createdAt`은 2024-12-02입니다. 점유 격자 디코더는 TRELLIS.2-4B 폴더 안이 아니라 원조 체크포인트입니다.

### O-Voxel은 장을 풀지 않는다

논문 3.1절의 한 자산은 활성 복셀마다의 튜플입니다. 기하 특징, 재질 특징, 격자 좌표. 비어 있는 복셀은 비활성입니다.

기하는 Flexible Dual Grid입니다. 각 활성 셀에 쌍대 정점 하나, 프리멀 간선과의 교차로 켜지는 사각형 면, 그 사각형을 삼각형으로 나누는 분할 가중치. Dual Contouring의 QEF를 쓰되, 부호 거리장을 풀지 않고 메쉬와 간선의 교차를 직접 센다고 적습니다. QEF에는 평면 거리, 경계 간선 거리, 교차점 평균으로의 정칙항이 있습니다. README가 적은 변환 시간은 텍스처 메쉬에서 O-Voxel로 단일 CPU에서 10초 미만, O-Voxel에서 텍스처 메쉬로 CUDA에서 100ms 미만입니다. 논문 초록은 메쉬로 되돌리는 쪽이 수십 ms라고 적습니다. 둘 다 최적화와 렌더링을 쓰지 않는다고 합니다.

재질은 식 (3)의 여섯 스칼라입니다. base color 3, metallic 1, roughness 1, opacity 1. 논문은 이 구성을 흔히 쓰는 metallic-roughness PBR이라고 부릅니다. 텍스처에서 복셀로는 UV와 밉으로 샘플한 뒤 거리 가중 평균이고, 복셀에서 텍스처로는 인접 복셀의 삼선형 보간입니다. 노멀 맵이나 이미시브 채널은 이 식에 없습니다.

이 표현이 논문과 README에서 이름으로 다루는 대상은 열린 곡면(README 예시는 clothing, leaves), 비다양체, 내부에 닫힌 구조, 반투명(opacity)입니다. 4.2절은 유리와 금속을 "translucent or reflective materials such as glass and metal"이라고 적습니다. **hair**라는 단어는 논문 텍스트, README, 프로젝트 페이지 본문에서 찾지 못했습니다.

### 16배 압축과 세 단계 생성

SC-VAE는 희소 합성곱 U-Net입니다. 다운샘플 2배마다 자식 8개의 채널을 묶어 잔차 단축키를 만들고, 업샘플 전에 자식 활성 마스크를 예측해 가지를 칩니다. 공간 압축은 16배입니다. 논문은 1024³ 텍스처 자산을 약 9.6K 잠재 토큰으로 넣는다고 적습니다. Table 1의 Ours 1024 행이 그 9.6K이고, 채널 차원 칸은 306K입니다. 같은 표의 Trellis도 토큰 수는 9.6K지만 다운샘플은 4배, 차원 칸은 77K입니다. 토큰 개수가 같다는 뜻이지, 같은 표현이라는 뜻은 아닙니다.

생성은 논문 3.3절의 세 단계입니다. 희소 구조(점유), 기하 잠재, 재질 잠재. 재질 DiT는 입력 이미지와 기하 잠재를 함께 조건으로 받습니다. 그래서 3단계는 메쉬가 있는 상태의 PBR 텍스처 모델로도 따로 돕니다. README의 `example_texturing.py`가 그 경로입니다. 이미지 조건은 DINOv3-L입니다. `pipeline.json`의 이름은 `facebook/dinov3-vitl16-pretrain-lvd1689m`입니다. DiT는 AdaLN-single과 RoPE를 쓰고, 원조 TRELLIS의 합성곱 패킹과 스킵을 빼서 vanilla DiT라고 부릅니다.

학습 숫자는 4절입니다. 형상 SC-VAE의 데이터는 Trellis-500K에서 PBR이 없는 자산을 뺀 Objaverse-XL, ABO, HSSD입니다. 부록은 재질 VAE가 metallic-roughness만 남겨 약 35만 자산이라고 적습니다. 생성 모델은 TexVerse를 더한 약 80만 자산이고, Blender로 자산당 16뷰를 렌더합니다. SC-VAE는 H100 16장, 배치 128입니다. 각 DiT는 약 1.3B(폭 1536, 블록 30, 헤드 12, MLP 폭 8192)이고 H100 32장, 배치 256입니다. 옵티마이저는 AdamW, 학습률 1e-4, weight decay 0.01, classifier-free guidance drop 0.1입니다. 기하와 재질은 512³에서 1024³로 해상도를 올립니다. 1536³는 4.5절의 테스트 타임 캐스케이드입니다. 1024³ O-Voxel을 더 성긴 점유 격자로 줄인 뒤 기하 단계를 다시 적용합니다.

### 4B는 세 DiT의 합이다

논문은 "about 4 billion parameters in total"과 "Each DiT ... approximately 1.3B"를 같이 씁니다. 1.3의 세 배는 3.9입니다. 체크포인트 파일은 그 세 단계의 **해상도별 사본**입니다. 2026-11-19에 tree API로 읽은 safetensors 바이트는 다음입니다. 헤더는 풀지 않았습니다.

| 파일 | 바이트 |
| --- | ---: |
| `ss_flow_img_dit_1_3B_64_bf16` | 2,584,426,920 |
| `slat_flow_img2shape_dit_1_3B_512_bf16` | 2,584,574,424 |
| `slat_flow_img2shape_dit_1_3B_1024_bf16` | 2,584,574,424 |
| `slat_flow_imgshape2tex_dit_1_3B_512_bf16` | 2,584,672,728 |
| `slat_flow_imgshape2tex_dit_1_3B_1024_bf16` | 2,584,672,728 |
| `shape_dec_next_dc_f16c32_fp16` | 948,490,494 |
| `shape_enc_next_dc_f16c32_fp16` | 708,797,208 |
| `tex_dec_next_dc_f16c32_fp16` | 948,458,812 |
| `tex_enc_next_dc_f16c32_fp16` | 708,797,208 |

flow 파일 하나, 약 25.8억 바이트는 BF16 1.3B(2바이트면 26억 바이트)와 같은 자릿수입니다. 정확한 파라미터 개수는 헤더를 읽지 않아 적지 않습니다. 512와 1024는 같은 단계의 다른 체크포인트라, 다섯 flow 파일을 더하면 논문의 4B가 되지 않습니다.

코드를 보면 기본값은 그 사본을 **둘 다** 올립니다. `pipeline.json`의 `default_pipeline_type`은 `1024_cascade`이고, `run()`은 이 모드에서 shape 512, shape 1024, texture 1024, 그리고 희소 구조 flow를 요구합니다. 논문의 4B는 단계당 하나의 DiT를 센 값이고, 기본 추론이 메모리에 올리는 shape 가중치는 512용과 1024용 두 파일입니다. 이 글은 VRAM을 재지 않았습니다. README가 적은 하한은 24GB이고, 검증 장치는 A100과 H100입니다.

샘플러 기본값은 `pipeline.json`에 있습니다. 세 단계 모두 `FlowEulerGuidanceIntervalSampler`, 스텝 12, `sigma_min` 1e-5입니다. guidance strength는 희소 구조 7.5, 형상 7.5, 재질 1.0입니다. guidance interval은 희소 구조와 형상이 `[0.6, 1.0]`, 재질이 `[0.6, 0.9]`입니다.

### 공개된 시간은 H100, 해상도별이다

README와 프로젝트 페이지, 논문 초록이 같은 표를 적습니다. NVIDIA H100에서 완전 텍스처 자산의 생성 시간입니다. 괄호는 shape와 material입니다.

| 해상도 | 합계 | 분해 |
| --- | ---: | --- |
| 512³ | 약 3초 | 2초 + 1초 |
| 1024³ | 약 17초 | 10초 + 7초 |
| 1536³ | 약 60초 | 35초 + 25초 |

4절의 "All runtime statistics are reported on an NVIDIA A100"은 Table 1 복원 디코드 시간 문장 옆에 있습니다. Table 1 캡션도 A100입니다. 생성 시간 표의 GPU는 H100입니다. 두 문장을 한 장치의 숫자로 섞지 않는 편이 맞습니다. 512³ 디코드는 Ours 512 행이 0.077초, 1024³가 0.301초입니다.

`run()`의 선택지는 `512`, `1024`, `1024_cascade`, `1536_cascade`입니다. 인자를 생략하면 `1024_cascade`입니다. README 예제 `pipeline.run(image)`는 그 기본값입니다. 그 칸의 공개 시간은 약 3초가 아니라 약 17초입니다. 약 3초는 `pipeline_type="512"`입니다. 약 60초는 `1536_cascade`입니다.

### 설치와 최소 예제

README의 설치 조건은 Linux, NVIDIA GPU 24GB 이상, CUDA Toolkit 권장 12.4, Python 3.8 이상입니다. `setup.sh --new-env`의 기본 PyTorch는 2.6.0, CUDA 12.4입니다. flash-attn을 못 쓰는 GPU(README 예시는 V100)는 xformers와 `ATTN_BACKEND=xformers`입니다. 이 환경에는 그 GPU가 없어 아래를 실행하지 않았습니다.

```bash
git clone -b main https://github.com/microsoft/TRELLIS.2.git --recursive
cd TRELLIS.2
. ./setup.sh --new-env --basic --flash-attn --nvdiffrast --nvdiffrec --cumesh --o-voxel --flexgemm
```

최소 예제는 README와 모델 카드가 같은 스크립트입니다. `assets/example_image/T.png`와 `assets/hdri/forest.exr`는 저장소에 있습니다. HDRI 폴더의 `license.txt`는 Poly Haven 원본을 CC0로 적습니다.

```python
import os
os.environ['OPENCV_IO_ENABLE_OPENEXR'] = '1'
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
import cv2
import imageio
from PIL import Image
import torch
from trellis2.pipelines import Trellis2ImageTo3DPipeline
from trellis2.utils import render_utils
from trellis2.renderers import EnvMap
import o_voxel

envmap = EnvMap(torch.tensor(
    cv2.cvtColor(cv2.imread('assets/hdri/forest.exr', cv2.IMREAD_UNCHANGED), cv2.COLOR_BGR2RGB),
    dtype=torch.float32, device='cuda'
))

pipeline = Trellis2ImageTo3DPipeline.from_pretrained("microsoft/TRELLIS.2-4B")
pipeline.cuda()

image = Image.open("assets/example_image/T.png")
# 기본값은 pipeline.json의 1024_cascade. 논문·README의 약 3초는 "512".
mesh = pipeline.run(image, pipeline_type="512")[0]
mesh.simplify(16777216)  # README 주석: nvdiffrast limit. simplify 본체는 CuMesh다.

video = render_utils.make_pbr_vis_frames(render_utils.render_video(mesh, envmap=envmap))
imageio.mimsave("sample.mp4", video, fps=15)

glb = o_voxel.postprocess.to_glb(
    vertices=mesh.vertices,
    faces=mesh.faces,
    attr_volume=mesh.attrs,
    coords=mesh.coords,
    attr_layout=mesh.layout,
    voxel_size=mesh.voxel_size,
    aabb=[[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]],
    decimation_target=1000000,
    texture_size=4096,
    remesh=True,
    remesh_band=1,
    remesh_project=0,
    verbose=True,
)
glb.export("sample.glb", extension_webp=True)
```

`preprocess_image`의 기본값은 True입니다. RGBA이고 알파가 전부 255가 아니면 그 알파를 쓰고, 아니면 `rembg_model`을 호출합니다. `pipeline.json`의 그 모델은 `BiRefNet`, `model_name`은 `briaai/RMBG-2.0`입니다. 알파가 있는 컷아웃을 넘기면 이 호출은 건너뜁니다.

`to_glb`은 `o-voxel/o_voxel/postprocess.py`에 있습니다. UV를 푼 뒤 `nvdiffrast.torch`의 `RasterizeCudaContext`로 UV 공간을 래스터화하고, 텍셀마다 3D 위치를 보간해 속성 볼륨을 텍스처로 굽습니다. `simplify()` 자체는 `cumesh.CuMesh`입니다. FlexGEMM과 CuMesh의 GitHub 라이선스 API 값은 MIT입니다.

### 엔진에 올릴 때

README는 `.glb`가 기본 `OPAQUE`이고, 알파 채널은 텍스처 안에 있으나 처음부터 켜져 있지 않다고 적습니다. 투명하게 쓰려면 텍스처 알파를 머티리얼의 opacity 또는 alpha에 직접 연결하라고 합니다. 아래는 그 문장에 맞춘 로더입니다. TRELLIS 저장소의 스크립트가 아니고, 생성된 파일을 이 환경에서 열어 보지는 않았습니다.

Blender의 Principled BSDF에 이미지 텍스처 알파를 잇는 조작입니다.

```python
import bpy
bpy.ops.import_scene.gltf(filepath="sample.glb")
mat = bpy.context.object.data.materials[0]
nt = mat.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
```

three.js는 `transparent`가 꺼져 있으면 base color의 알파를 그리지 않습니다. README의 OPAQUE 기본값과 같은 방향입니다.

```javascript
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

new GLTFLoader().load("sample.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.traverse((obj) => {
    const mat = obj.material;
    if (!mat || !mat.map) return;
    mat.transparent = true;
    mat.needsUpdate = true;
  });
});
```

Unity용 플러그인은 이 저장소에 없습니다. glTFast가 `.glb`를 읽는 최소 호출은 아래이고, 알파 모드는 임포터의 기본값을 따릅니다. README가 말한 수동 연결은 엔진 쪽 머티리얼에서 해야 합니다.

```csharp
using GLTFast;
var gltf = new GltfImport();
await gltf.Load("sample.glb");
await gltf.InstantiateMainSceneAsync(transform);
```

## 한계

논문 부록 F는 세 가지를 적습니다.

- 복셀보다 작은 구조는 앨리어싱이 납니다. 한 복셀을 지나는 가까운 두 면은 QEF가 그 사이에 정점을 두고, 재질은 두 면의 평균이 됩니다.
- 복원과 생성 결과에 작은 구멍이 생길 수 있습니다. 저자들은 희소 디코더가 닫힌 다양체 곡면을 보장하기 어렵기 때문이라고 보고, 구멍 메우기 같은 후처리로 대부분 고칠 수 있다고 적습니다.
- O-Voxel은 기하와 재질만 담고, 파트나 의미 구조는 인코딩하지 않습니다.

모델 카드의 Known Limitations는 같은 구멍을 반복하고, 3D 프린트처럼 닫힌 메쉬가 필요하면 후처리 스크립트를 쓰라고 합니다. 또 TRELLIS.2-4B는 사람 선호로 정렬하거나 특정 미감으로 미세조정하지 않은 사전학습 모델이라고 적습니다. 출력은 학습 데이터 분포를 따른다고 합니다.

하드웨어 한계는 README에 있습니다. Linux만 테스트했고, 24GB 미만은 요건 밖이며, 검증 GPU는 A100과 H100입니다. 소비자 카드의 시간 표는 README, 논문, 모델 카드에서 찾지 못했습니다. 프로젝트 페이지의 3초, 17초, 60초도 H100입니다.

## 비즈니스 인사이트

법률 자문이 아닙니다. 저장소와 모델 카드에 적힌 문장만 옮기고, 해석은 (분석)으로 표시합니다.

### 논문 표 안의 자리 (분석)

비교는 논문 Table 2입니다. 프롬프트는 Gemini 2.5 Flash Image로 만든 100장이고, 참여자는 약 40명입니다. 큐레이션 없이 같은 조건으로 생성했다고 4.2절이 적습니다. 정렬 점수는 CLIP, 노멀맵 CLIP, ULIP-2, Uni3D이고, 선호는 최종 렌더(Pref)와 노멀(Pref-N)입니다.

| 방법 | CLIP | CLIP-N | ULIP-2 | Uni3D | Pref | Pref-N |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Trellis | 0.876 | 0.748 | 0.470 | 0.414 | 6.40% | 2.82% |
| Hi3DGen | – | 0.753 | 0.395 | 0.373 | – | 6.57% |
| Direct3D-S2 | – | 0.746 | 0.420 | 0.392 | – | 12.2% |
| Step1X-3D | 0.875 | 0.738 | 0.464 | 0.411 | 11.8% | 0.469% |
| Hunyuan3D 2.1 | 0.869 | 0.753 | 0.474 | 0.427 | 13.3% | 7.51% |
| Ours | 0.894 | 0.758 | 0.477 | 0.436 | 66.5% | 69.0% |

정렬 점수 차이는 소수점 둘째 자리 수준이고, 선호 표는 Ours가 66.5%와 69.0%입니다. Hi3DGen과 Direct3D-S2의 Pref 칸은 표에 비어 있습니다. 이 표에 Meshy, Tripo 서비스, Rodin은 없습니다. Hunyuan3D 2.1은 논문이 PBR을 만드는 비교 대상으로 올린 모델이고, 인용은 arXiv:2506.15442입니다. 부록은 Step1X-3D, TRELLIS, Direct3D-S2, Hi3DGen에는 이 PBR이 없고 Hunyuan3D 2.1에는 있다고 적습니다.

복원 Table 1에서 Ours 1024의 Toys4K 전체 표면 Mesh Distance는 0.0042(×10^6 보고), F1 0.971, 노멀 PSNR 43.11입니다. Trellis 같은 표는 MD 85.07, F1 0.074, 노멀 PSNR 30.29입니다. 재질 복원은 비교 대상이 없어 자기 숫자만 있습니다. PBR 속성 38.89 dB / LPIPS 0.033, 셰이딩 38.69 dB / 0.026입니다.

### 라이선스는 가중치 한 장이 아니다 (분석)

TRELLIS.2 코드와 모델 카드의 라이선스는 MIT입니다. `LICENSE` 저작권자는 Microsoft Corporation입니다. README가 따로 적은 의존성은 둘입니다.

- [nvdiffrast](https://github.com/NVlabs/nvdiffrast) LICENSE.txt 3.3절: 그 Work와 파생물은 비상업으로만 쓰거나 쓰려 할 수 있다. "non-commercially"는 연구 또는 평가 목적이고, 직간접의 금전적 이득을 위한 것이 아니라고 정의합니다. NVIDIA와 그 계열은 상업적으로도 쓸 수 있다고 같은 절이 적습니다.
- [nvdiffrec](https://github.com/NVlabs/nvdiffrec) LICENSE.txt 3.3절도 같은 제한입니다. 연구 또는 평가 목적만 허용하고, NVIDIA와 그 계열은 상업 이용이 가능하다고 적습니다.

공식 예제의 비디오는 `PbrMeshRenderer`가 `nvdiffrec_render.light.EnvironmentLight`와 nvdiffrast를 불러 만듭니다. `.glb`의 텍스처 베이크는 `to_glb` 안의 `dr.rasterize`입니다. 가중치를 MIT로 받아도, README가 안내하는 내보내기 함수는 그 비상업 라이브러리를 import합니다.

전처리는 한 장 더 있습니다. 알파가 없는 입력의 기본 배경 제거는 `briaai/RMBG-2.0`입니다. 그 카드의 `license_link`는 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en)이고, `extra_gated_description`은 비상업 이용만 연다고 적습니다. 게이트 헤딩도 "non commercial use"입니다. 카드는 `gated: auto`입니다. RGBA 컷아웃으로 이 모델을 건너뛰는 분기는 `preprocess_image`에 있습니다.

이미지 인코더 `facebook/dinov3-vitl16-pretrain-lvd1689m`은 카드 라이선스가 `other`이고 `gated: manual`입니다. 저장소 [facebookresearch/dinov3](https://github.com/facebookresearch/dinov3)의 `LICENSE.md`(Last Updated: August 19, 2025)는 Meta의 DINO Materials에 대해 비독점, 전세계, 양도 불가, 로열티 없는 제한적 라이선스로 사용, 복제, 배포, 파생물, 수정을 허락합니다. 재배포는 같은 계약을 동봉해야 하고, 무역 통제와 ITAR, 군사·무기 용도 금지가 있습니다. 이 텍스트는 "연구 전용"이라는 문장을 쓰지 않습니다. MIT도 아닙니다. 상업 제품에서의 효력은 이 글이 판단하지 않습니다.

(분석) 스튜디오가 "MIT니까 게임에 넣는다"고 읽으면, 기본 경로의 배경 제거와 GLB 베이크는 그 문장 밖에 있습니다. 학습 코드와 DiT 가중치를 MIT로 미세조정하는 일과, README 예제 그대로 `.glb`를 구워 판매하는 일은 같은 허가가 아닙니다. 후자는 nvdiffrast 3.3절과, 알파가 없는 입력이라면 RMBG-2.0의 NC 조항을 먼저 읽어야 하는 구성입니다.

### 누가 이 숫자를 가져가나 (분석)

- **H100에서 512³ 초안을 만드는 연구 팀.** 공개 시간 약 3초는 그 칸입니다. 기본 예제는 그 칸이 아닙니다.
- **H100에서 1024³를 쓰는 팀.** 공개 시간은 약 17초이고, 코드 기본값 `1024_cascade`가 이 해상도 계열입니다. 형상 DiT 체크포인트가 두 개 올라갑니다.
- **1536³를 제품 턴어라운드로 말하는 팀.** 같은 표는 약 60초입니다. "몇 초"라는 포스트의 문장과 이 칸은 맞지 않습니다.
- **24GB 카드만 있는 팀.** README는 하한만 적고, 그 장치에서의 초 단위 표는 없습니다.
- **자기 자산으로 화풍을 맞추려는 팀.** README는 `train.py`로 처음부터 학습하거나 커스텀 데이터로 미세조정할 수 있다고 적고, `finetune_ckpt` 필드를 바꿨습니다. 예제 데이터 경로는 Objaverse-XL입니다. 모델 카드는 공개 체크포인트가 미감 미세조정을 거치지 않았다고 합니다. "스튜디오 화풍이 된다"는 결과는 이 글에서 확인한 실험이 없습니다.
- **EU, 영국, 한국에서 Hunyuan3D 2.1 가중치를 대안으로 보는 팀.** [Hunyuan3D 2.1 커뮤니티 라이선스](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)는 Territory를 전세계이되 유럽연합, 영국, 한국을 뺀다고 정의하고, 그 밖에서의 이용은 무라이선스라고 적습니다. 출시일 기준 월간 활성 사용자가 100만을 넘으면 Tencent의 별도 허락이 필요하다고 4절이 적습니다. 출시일은 라이선스 머리글의 2025-06-13입니다. 결과를 다른 AI 모델을 개선하는 데 쓰지 말라는 5.b절도 있습니다.

### 호스팅 서비스의 가격표는 다른 단위다 (분석)

로컬 모델의 한계비용과 API 크레딧은 같은 청구서가 아닙니다. 아래는 2026-11-19에 연 공식 페이지의 숫자이고, 크레딧의 달러 환산은 그 페이지가 적지 않은 경우 만들지 않았습니다.

- [Meshy API 가격](https://docs.meshy.ai/en/api/pricing)은 Image to 3D의 `meshy-7.1`을 메쉬만 20크레딧, 2K 또는 4K 텍스처 30크레딧, 8K 텍스처 35크레딧으로 적습니다. Ultra geometry는 2K 또는 4K에 +5입니다. [가격 페이지](https://www.meshy.ai/pricing) FAQ는 무료 플랜이 월 100크레딧이고 출력이 CC BY 4.0(저작자 표시가 있는 상업 이용)이며, Pro가 월 1,000크레딧이라고 적습니다. 같은 페이지는 Image to 3D 다운로드 형식에 `.glb`가 있다고 적습니다. [모델 문서](https://docs.meshy.ai/en/api/models)는 Meshy 7이 `enable_pbr: true`일 때 base color, metallic, roughness, normal을 만든다고 적고, 2K에서 그 텍스처 모델의 전형적 시간을 40초라고 적습니다. 이 40초는 TRELLIS.2의 H100 17초와 GPU 수, 해상도 정의, 측정 구간이 다른 숫자입니다.
- [Tripo 가격](https://www.tripo3d.ai/pricing)은 2026-11-19 조회에서 Free가 월 $0, 200크레딧, "Public Models · Non-Commercial Use"이고, Pro가 월 $20(연간 청구 $240), 3,000크레딧, "Private Models · Commercial Use"입니다. Max는 월 $90(연간 청구 $1,080), 25,000크레딧입니다. 가격 카드의 연간 단가와 월간 결제 금액이 다를 수 있어, 여기 적은 것은 그 카드가 "billed annually"로 붙인 숫자입니다.
- [Rodin Gen-2 API](https://docs.hyper3d.ai/en/api-specification/rodin-gen2)는 이미지 1장에서 5장 또는 텍스트를 받고, 기본 생성을 0.5크레딧으로 적습니다. 예시 응답의 `consumed`도 0.5입니다. 크레딧의 달러 가격은 그 문서에 없습니다. [이용약관](https://hyper3d.ai/legal/terms)은 Rodin 출력의 이용을, 약관과 법령과 제3자 조건 안에서, 서비스가 제한하지 않는다고 적습니다. 상업 이용이 플랜에 따라 갈린다는 문장도 같은 약관 앞에 있습니다.
- TRELLIS.2의 H100 시간당 임대료는 이 글에서 확인하지 않았습니다. 그래서 "한 장에 몇 원"은 계산하지 않습니다.

(의견) 가중치를 받을 수 있다는 사실과, 내일 게임 빌드에 넣는 에셋 파이프라인이 생겼다는 사실은 다릅니다. 논문의 선호 66.5%는 Hunyuan3D 2.1을 포함한 연구 비교이고, Meshy나 Tripo의 유료 플랜을 대체했다는 측정은 그 표에 없습니다. 오픈 가중치가 의미를 갖는 자리는 24GB 이상 NVIDIA에서 초안을 반복하고, 라이선스 스택을 읽은 뒤 베이크 경로를 고를 수 있는 팀입니다. 알파를 수동으로 잇고 구멍을 메워야 하는 `.glb`를 "clean"과 "production-ready"로 부르는 포스트는 그 후처리를 문장에서 지웠습니다.

## 팩트 체크

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| Microsoft가 4B 이미지-투-3D 모델을 오픈소스했다 | ✅ | 저장소는 `microsoft/TRELLIS.2`, SPDX는 MIT, 모델 카드 라이선스도 `mit`입니다. 논문은 flow 모델이 약 4B이고 DiT 하나당 약 1.3B라고 적습니다. 제1저자 Xiang은 Microsoft Research 인턴, 본소속은 Tsinghua이고, 교신 Yang은 Microsoft Research입니다. USTC 소속도 있습니다. 4B는 세 단계 DiT의 합이지, 해상도별 체크포인트 다섯 개의 합이 아닙니다. [논문](https://arxiv.org/abs/2512.14692), [GitHub](https://github.com/microsoft/TRELLIS.2), [모델 카드](https://huggingface.co/microsoft/TRELLIS.2-4B) |
| 2026-11-18에 새로 공개된 소식이다 | ⚠️ | 포스트 본문은 "just released"라고 쓰지 않습니다. 다만 문장은 공개 소식의 형태이고, 시각은 2026-11-18 23:07 UTC입니다. 논문은 2025-12-16, Init Release 커밋 `de38fdd4`는 2025-12-09, 모델 카드 `createdAt`은 2025-12-01, 학습 코드 커밋 `5565d240`는 2026-01-10입니다. [arXiv](https://arxiv.org/abs/2512.14692), [커밋](https://github.com/microsoft/TRELLIS.2/commit/5565d240) |
| 아무 이미지나 몇 초 만에 production-ready 자산이 된다 | ⚠️ | 입력은 단일 이미지입니다. H100 공개 시간은 512³ 약 3초, 1024³ 약 17초, 1536³ 약 60초입니다. 예제 `run()`의 기본값은 `1024_cascade`라 약 17초 칸입니다. 모델 카드는 작은 구멍과, 선호 정렬이 되지 않은 베이스 모델이라고 적습니다. "production-ready"는 저자 문장이 아니라 포스트 문장입니다. [README 시간 표](https://github.com/microsoft/TRELLIS.2#1-high-quality-resolution--efficiency), [pipeline.json](https://huggingface.co/microsoft/TRELLIS.2-4B/blob/main/pipeline.json) |
| 완전 텍스처와 PBR 네 채널(base color, roughness, metallic, opacity) | ✅ | 식 (3)이 그 네 값, 채널 수로는 6입니다. README와 프로젝트 페이지도 같은 네 이름을 적습니다. 노멀 맵과 이미시브는 그 식에 없습니다. [논문 3.1.2](https://arxiv.org/html/2512.14692v1), [프로젝트 페이지](https://microsoft.github.io/TRELLIS.2/) |
| 물리적으로 정확하다 | ⚠️ | 그림 5 캡션은 "physically accurate materials"라는 정성 표현을 씁니다. 재질 오차의 물리 측정 표는 없고, 재질 복원 숫자는 PSNR과 LPIPS입니다. [논문 그림 5](https://arxiv.org/html/2512.14692v1) |
| hair를 다룬다 | ❌ | hair는 논문 텍스트, README, 프로젝트 페이지 본문에서 찾지 못했습니다. 얇은 구조와 열린 곡면은 4.2절과 README에 있습니다. 그 문장을 머리카락으로 바꾼 것은 포스트입니다. [논문 4.2](https://arxiv.org/html/2512.14692v1) |
| cloth를 다룬다 | ⚠️ | README의 열린 곡면 예시는 "clothing, leaves"입니다. cloth라는 별도 카테고리나 정량 평가는 찾지 못했습니다. [README](https://github.com/microsoft/TRELLIS.2#2-arbitrary-topology-handling) |
| glass를 다룬다 | ✅ | 4.2절이 유리와 금속을 반투명·반사 재질의 예로 듭니다. opacity 채널이 그 표현의 근거로 3.1절에 있습니다. [논문 4.2](https://arxiv.org/html/2512.14692v1) |
| non-manifold를 다룬다 | ✅ | 초록, 3.1절, README, 프로젝트 페이지가 비다양체를 O-Voxel이 다루는 위상으로 적습니다. [README](https://github.com/microsoft/TRELLIS.2#2-arbitrary-topology-handling) |
| 깨끗한 .glb가 Unity, Unreal, Blender에 바로 들어간다 | ⚠️ | `to_glb`와 `glb.export`는 README에 있고 형식은 `.glb`입니다. 같은 README는 기본 알파 모드가 `OPAQUE`이고 알파를 수동으로 연결하라고 적습니다. 부록 F와 모델 카드는 작은 구멍을 적습니다. Unity·Unreal이라는 이름은 README와 논문에서 찾지 못했고, 저장소에 그 엔진 플러그인도 없습니다. 베이크는 nvdiffrast를 호출합니다. [README 주석](https://github.com/microsoft/TRELLIS.2#minimal-example), [postprocess.py](https://github.com/microsoft/TRELLIS.2/blob/main/o-voxel/o_voxel/postprocess.py) |
| 로컬에서 돈다 | ⚠️ | 추론 코드는 로컬입니다. 조건은 Linux, NVIDIA 24GB 이상, 권장 CUDA 12.4이고 검증은 A100·H100입니다. 이미지 인코더와, 알파가 없는 입력의 배경 제거 모델은 Hugging Face 게이트입니다. [README 설치](https://github.com/microsoft/TRELLIS.2#-installation) |
| 학습 코드가 전부 공개되어 있다 | ✅ | README 로드맵의 학습 코드 항목은 체크되어 있고, `train.py`와 `configs/`가 있습니다. 커밋 `5565d240` 메시지는 "Release Training Code", 시각은 2026-01-10입니다. SC-VAE, 희소 구조, 형상, 재질, 고해상도 미세조정 설정 이름이 README에 있습니다. [train.py](https://github.com/microsoft/TRELLIS.2/blob/main/train.py) |
| 자기 에셋으로 미세조정해 스튜디오 화풍을 낼 수 있다 | ⚠️ | README는 커스텀 데이터셋 미세조정과 `finetune_ckpt`를 적습니다. 모델 카드는 공개 가중치가 특정 미감으로 미세조정되지 않았다고 적습니다. "studio-specific style"이 달성된다는 실험은 논문에 없습니다. [README 학습](https://github.com/microsoft/TRELLIS.2#-training) |

## 참고 자료

- Xiang 외, [Native and Compact Structured Latents for 3D Generation](https://arxiv.org/abs/2512.14692), arXiv:2512.14692v1, 2025-12-16. [HTML](https://arxiv.org/html/2512.14692v1), [프로젝트 페이지](https://microsoft.github.io/TRELLIS.2/)
- Microsoft, [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2). [README](https://github.com/microsoft/TRELLIS.2/blob/main/README.md), [LICENSE](https://github.com/microsoft/TRELLIS.2/blob/main/LICENSE), [example.py](https://github.com/microsoft/TRELLIS.2/blob/main/example.py), [train.py](https://github.com/microsoft/TRELLIS.2/blob/main/train.py), [postprocess.py](https://github.com/microsoft/TRELLIS.2/blob/main/o-voxel/o_voxel/postprocess.py), [파이프라인 소스](https://github.com/microsoft/TRELLIS.2/blob/main/trellis2/pipelines/trellis2_image_to_3d.py)
- Hugging Face, [microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B), [pipeline.json](https://huggingface.co/microsoft/TRELLIS.2-4B/blob/main/pipeline.json). 리비전 `af44b45f2e35a493886929c6d786e563ec68364d`
- Xiang 외, [Structured 3D Latents for Scalable and Versatile 3D Generation](https://arxiv.org/abs/2412.01506). 코드 [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS). 희소 구조 디코더가 가리키는 [microsoft/TRELLIS-image-large](https://huggingface.co/microsoft/TRELLIS-image-large)
- NVIDIA, [nvdiffrast LICENSE](https://github.com/NVlabs/nvdiffrast/blob/main/LICENSE.txt) 3.3절, [nvdiffrec LICENSE](https://github.com/NVlabs/nvdiffrec/blob/main/LICENSE.txt) 3.3절
- Meta, [DINOv3 LICENSE.md](https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md). 가중치 [facebook/dinov3-vitl16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m)
- Bria, [briaai/RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0). 카드 `license_link`는 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en)
- Tencent Hunyuan, [Hunyuan3D 2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), [커뮤니티 라이선스](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE). 논문 [arXiv:2506.15442](https://arxiv.org/abs/2506.15442)
- [Meshy API 가격](https://docs.meshy.ai/en/api/pricing), [Meshy 가격](https://www.meshy.ai/pricing), [Meshy 모델](https://docs.meshy.ai/en/api/models)
- [Tripo 가격](https://www.tripo3d.ai/pricing)
- Hyper3D, [Rodin Gen-2 API](https://docs.hyper3d.ai/en/api-specification/rodin-gen2), [이용약관](https://hyper3d.ai/legal/terms)
- 원본 X 포스트: [@0x0SojalSec](https://x.com/0x0SojalSec/status/2123191492902813890)
