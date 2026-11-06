---
title: "3D 10만 점을 Python 코드로? Sand3D 데이터셋과 sand3d"
date: 2026-11-06
time: "22:54"
slug: sand3d-3d-as-code-dataset
tags: [Sand3D, sand3d, 3D, Python, Blender, LLM, Hugging Face, Sandflow]
summary: "Sandflow가 Hugging Face에 공개한 Sand3D(약 10.6만 객체, 3D-as-code)와 PyPI 라이브러리 sand3d 1.6.3을 공식 문서·HF 블로그·프레스 릴리스 기준으로 정리했습니다. 토큰 비교 수치와 관절 수 등 마케팅·1차 자료 차이를 팩트 체크합니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@tokufxug의 포스트](https://x.com/tokufxug/status/2118518008478085477)(bookmark id `2118518008478085477`)를 계기로 썼습니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-06(KST)에 읽은 [sand3d 공식 문서](https://sand3d.sandflow.ai/)(citation note Version 1.6.3), [PyPI sand3d 1.6.3](https://pypi.org/project/sand3d/), [GitHub Sandflow-ai/sand3d](https://github.com/Sandflow-ai/sand3d), [Hugging Face 블로그 *Sand3D: 106,094 3D Objects…*](https://huggingface.co/blog/Sandflow/sand3d-106094-3d-objects-in-one-code-substrate-for)(Thibault-SF / Sandflow, 2026-11-05), [프레스 릴리스](https://sandflow.ai/press/3d-as-code-dataset/)(2026-11-05, Lyon), [마케팅 페이지](https://sandflow.ai/sand3d/)입니다.

## 왜 중요한가

3D를 LLM·에이전트에 맡기려는 팀은 오래전부터 같은 벽에 부딪힙니다.

1. **메쉬만 있으면** — 파일은 크지만 “어떻게 만들었는지”가 없습니다. 구멍 지름을 6.6 mm에서 8 mm로 바꾸라는 한 줄 요청이 곧바로 파라미터 편집이 되지 않습니다.
2. **Blender Python(`bpy`)을 LLM이 직접 쓰게 하면** — 표현력은 충분하지만 프롬프트·생성 코드가 길고, 같은 지시라도 맞춘 파트가 들쭉날쭉해질 수 있습니다. sand3d 문서 홈은 공개 CAD 30파트 실험에서 LLM이 쓴 Blender Python이 **9/30만** 올바른 파트를 만들었다고 적습니다(같은 셋에서 sand3d는 30/30).
3. **CadQuery·FeatureScript·전용 SDK** — 각각 강한 CAD/아티큘레이션 표현이지만, LLM 컨텍스트에 넣을 API 표면·토큰 비용·학습 데이터 형태가 제각각입니다.

Sandflow(옛 Chat3D, 프랑스 리옹)가 2026-11-05에 공개한 **Sand3D**는 “객체를 짧은 Python 프로그램 + OpenUSD + 렌더”로 묶은 데이터셋이고, 그 프로그램을 실행하는 라이브러리가 **sand3d**입니다. 개발자 입장에서 궁금한 건 마케팅 슬로건보다 다음입니다.

- 객체 수는 정확히 얼마인가? (HF 표 106,094 vs 프레스 “100,000”)
- 가동기(articulated)와 관절 수는 어디에 적혀 있나?
- sand3d API는 프롬프트에 넣을 만할 정도로 짧은가?
- Blender·glTF·Three.js로 “바로” 쓸 수 있다는 말은 수출 포맷 기준으로 어디까지 맞나?

## 기술 설명: sand3d와 Sand3D

### 라이브러리 sand3d (PyPI 1.6.3)

[PyPI](https://pypi.org/project/sand3d/) 기준 **1.6.3**(업로드 2026-11-06T11:05:51Z 근처). 요구 Python은 `!=3.12.*, >=3.11,<3.14`입니다. Blender는 `bpy`로 따라옵니다 — 문서·PyPI README 기준 **Python 3.11 → bpy 4.5 LTS**, **Python 3.13(권장) → bpy 5.2 LTS**. 라이선스는 **Apache-2.0**. 인용 메타는 Thibault Neveu & Andréa Loy, note Version 1.6.3입니다.

설치는 한 줄입니다.

```bash
pip install sand3d        # 또는 uv add sand3d
```

설계 요지는 문서 첫 화면이 요약합니다. 프로파일·솔리드·편집·프레임·조인트·어셈블리를 **평평한 `s3d.` 표면**(공개 이름 약 **70개**)으로 두고, API 전체를 프롬프트에 넣으면 약 **3,643 토큰**입니다. 같은 프로그램은 **결정적(deterministic)** 메쉬를 만들고, `export` 한 번으로 확장자에 따라 **GLB / URDF / USDA / OBJ / STL**을 씁니다. 기본 단위는 **밀리미터**, 파일로 나갈 때는 **미터**입니다.

문서가 적은 토큰 비교(median, 상대 언어 토큰 / sand3d 토큰, o200k_base, 코드만)는 다음과 같습니다. **벤치 정의·표본 크기가 항목마다 다르므로** 숫자를 절대 순위로 읽지 마세요.

| 비교 상대 | 배수(median) | 표본·비고(문서) |
|---|---|---|
| Blender Python (LLM이 작성) | **4.0×** | 30 CAD 파트; LLM Blender는 9/30만 올바른 파트, sand3d는 30/30 |
| CadQuery (Zero-To-CAD 자체 프로그램) | **2.3×** | 17 CAD 파트 |
| FeatureScript / Onshape (CADFS) | **6.0×** | 13 CAD 파트 |
| Articraft Python SDK | **2.0×** | 12 articulated; 일부는 CadQuery도 사용 |

HF 블로그 쪽에는 손수 쓴 sand3d vs LLM Blender Python 30파트에 대해 **3.8×**라는 관련 서술도 있습니다. 이 글은 **문서 홈의 4.0× median**을 1차로 두고, 3.8×는 같은 계열의 다른 서술로 표시합니다(아래 팩트 체크 ⚠️).

### 첫 프로그램: 브라켓 (공식 예제)

아래는 [공식 문서 / PyPI README](https://sand3d.sandflow.ai/)의 bracket 예제입니다(귀속: Sandflow sand3d docs).

```python
import sand3d as s3d

def bracket(w=80, d=40, t=6, hole_d=6.6, pitch=50):
    plate = s3d.extrude("plate", s3d.rect(w, d, r=4), t)
    s3d.hole(plate, hole_d, on=s3d.grid(2, 1, pitch, 0))
    s3d.fillet(plate, 1, edges="top")
    return plate

s3d.export(bracket(), "bracket.glb")
```

문서는 이 조각을 약 10줄·121 토큰(o200k_base)으로 적습니다. `w`·`hole_d`·`pitch`가 함수 인자라서, “구멍만 키워” 같은 요청이 **파라미터 편집**으로 떨어집니다. X 북마크가 말한 “부품마다 함수화·치수는 파라미터”와 같은 축입니다.

### 조인트·어셈블리: washing machine 패턴

문서가 보여주는 프론트 로딩 세탁기 예는 캐비닛·드럼·도어(유리·핸들)·서랍·다이얼을 이름 있는 파트로 두고, 네 조인트로 움직임을 선언합니다. 핵심 줄만 옮기면 다음과 같습니다(귀속: 동일 docs/PyPI).

```python
door = s3d.group("door", ring, glass, handle)  # 핸들·유리가 같이 움직임
s3d.joint("door_hinge", door, hinge, axis="-Z", range=(0, 143))
s3d.joint("drum_spin", drum, front.move(0, 400), kind="continuous")
s3d.joint("drawer_slide", drawer, top_band.move(150), kind="prismatic",
          axis="+X", range=(0, 200))
s3d.joint("dial_turn", dial, top_band.move(-150), kind="continuous")
return s3d.assembly("washing_machine", cab, drum, door, drawer, dial, front=front)
```

문서 표기: 이 블록 6줄·153 토큰. `export(..., "washer.glb")`뿐 아니라 `.urdf`·`.usda`·`.obj`·`.stl`도 확장자로 고릅니다. GLB는 웹·뷰어·게임 엔진용으로 메쉬·머티리얼·노드 extras의 조인트를 현재 포즈로 담고, URDF는 ROS/PyBullet/MuJoCo/Isaac, USDA는 Omniverse·Isaac Sim·USD 파이프라인용이라고 문서 표가 적습니다.

### 데이터셋 Sand3D (Hugging Face)

[HF 블로그](https://huggingface.co/blog/Sandflow/sand3d-106094-3d-objects-in-one-code-substrate-for)(2026-11-05) 표가 1차입니다.

| 서브셋 | 개수 | 출처 |
|---|---|---|
| sand3d-objaverse | 66,887 | Objaverse |
| sand3d-cad | 24,495 | Zero-To-CAD 16,766 + CADFS 7,729 |
| sand3d-articraft | 9,209 | Articraft |
| sand3d-automate | 3,169 | AutoMate (872 assemblies, 2,297 parts) |
| sand3d-simready | 2,334 | NVIDIA SimReady |
| **합계** | **106,094** | 이 중 **articulated 10,456** |

라이선스: 데이터셋 **CC BY 4.0**(개별 객체는 원출처 라이선스 유지), 라이브러리 **Apache 2.0**. 객체마다 프로그램 + OpenUSD + 렌더가 붙고, F-score 하한은 블로그에 문서화되어 있습니다. 한계도 명시됩니다 — **대부분 hard-surface**이며 캐릭터·동물·오가닉은 아직입니다. 탐색은 [컬렉션](https://huggingface.co/collections/Sandflow/sand3d), [explorer 스페이스](https://huggingface.co/spaces/Sandflow/sand3d-explorer).

프레스 릴리스(2026-11-05, Lyon)는 “**100,000** objects”, “More than **10,000** articulated, with **36,000** joints”, SimReady 재작성 **2,369** 등을 말합니다. HF 표의 106,094 / articulated 10,456 / simready 2,334와 **반올림·집계 시점 차이**가 있어 아래 팩트 체크에서 ⚠️로 묶습니다. 마케팅 페이지([sandflow.ai/sand3d](https://sandflow.ai/sand3d/))도 “10K+ articulated objects and 36K joints”를 그대로 적습니다. 회사는 프레스에서 자사 **첫 3D 파운데이션 모델을 mid-December**에 둔다고 주장합니다 — **회사 클레임**이지 출하 검증이 아닙니다. CEO 인용은 Félix Balmonet(프레스).

GitHub API 기준(2026-11-06) Sandflow-ai/sand3d는 **stargazers 606**, **forks 73**, **open issues 4**, 라이선스 Apache-2.0, 저장소 생성 **2026-11-03**입니다. 스타 수는 관심 신호일 뿐 채택·품질을 보증하지 않습니다.

## 비즈니스 인사이트

숫자·제품 서술은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다. 펀딩 금액·DAU·기업 가치는 이 글이 invent 하지 않습니다.

**3D-as-code가 노리는 병목.** HF·문서가 같이 가리키는 자리는 “메쉬 덤프”와 “초장문 bpy 스크립트” 사이입니다. API ~3.6k 토큰·flat `s3d.` 표면은 **시스템 프롬프트에 통째로 넣는 전제**에 맞춰져 있고, 데이터셋 10.6만 프로그램은 그 어휘로 재구성된 학습·평가 기판입니다. **분석/의견.** LLM 코딩 에이전트·시뮬레이션 파이프라인·로보틱스(URDF)·Omniverse(USD)를 한 줄기로 묶으려는 팀에 먼저 읽히는 패키징입니다.

**누가 이득을 보나.** (1) 파라미터 CAD를 코드로 버전 관리하려는 프로덕트/툴링 팀 — bracket처럼 치수가 함수 인자. (2) articulated 자산이 필요한 로보틱스·시뮬 — HF 기준 articulated 10,456, 프레스/마케팅의 36k joints. (3) 웹·엔진으로 GLB를 보내는 뷰어/게임 쪽 — 문서가 GLB를 1급 export로 둠. **분석/의견.** 순수 아트/캐릭터 파이프라인은 한계(하드서피스 중심) 때문에 당장 대체재가 되기 어렵습니다.

**경쟁·대체재 맥락 (문서가 비교한 축).** CadQuery·FeatureScript·Articraft SDK·Blender Python은 토큰 표에 직접 등장합니다. sand3d는 “더 짧은 표현 + LLM이 맞출 확률”을 문서 수치로 밀고, 동시에 **Blender `bpy` 위**에 얹혀 deterministic mesh를 보장한다고 합니다. **분석/의견.** 기존 CadQuery/Onshape 숙련 팀의 이전 비용은 “API 학습”보다 **파이프라인·검증·라이선스(원객체 출처)** 쪽에 남을 수 있습니다. 스타 606(2026-11-06 API)은 출시 직후 관심이지, CadQuery급 생태계 규모와 같은 줄에 두지 마세요.

**비용·도입.** `pip install sand3d`로 진입 자체는 낮고, Python 3.12 휠이 없다는 제약은 PyPI·README가 명시합니다(Intel Mac + bpy 5.2도 3.11 권고). 데이터는 CC BY 4.0이지만 **객체별 원출처 라이선스**를 제품에 실을 때 다시 읽어야 합니다. **분석/의견.** 파운데이션 모델 “mid-December” 공언은 로드맵 신호일 뿐, 그 전까지는 **오픈 라이브러리+데이터셋**만으로도 실험·벤치·합성 데이터 생성에 쓸 수 있는지가 실질 ROI입니다. 토큰 배수(4.0× 등)는 문서 정의의 median이므로, 자사 파트 분포에 재측정하지 않으면 비용 절감 주장이 과대해질 수 있습니다.

**분석/의견 — 리스크.** (1) 프레스 100k vs HF 106,094, simready 2,369 vs 2,334처럼 **공개 숫자 불일치**가 이미 있음 → 논문·계약·마케팅 인용 시 HF 표를 우선. (2) 관절 36,000은 프레스/마케팅 — HF 블로그 표에는 관절 총합이 없음. (3) Three.js “네이티브 지원”이 아니라 **GLB가 three.js에서 열리는 경로**. (4) 저장소가 2026-11-03 생성이라 API·데이터셋 스키마 변동 여지를 제품 리스크로 잡는 편이 안전합니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·수사·출처가 다름 / ❌ 1차 자료와 어긋남

원본 X([@tokufxug](https://x.com/tokufxug/status/2118518008478085477)) 요지를 HF 블로그·공식 docs·PyPI·프레스·마케팅과 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 3D 모델 10만 점 이상을 코드로 공개(Sand3D) | ✅ | HF 표 합계 **106,094**. 프레스/마케팅은 “100,000” 반올림 수사 — 규모 주장은 성립, 정확 인용은 HF. |
| 각 모델을 sand3d Python 코드로 표현 | ✅ | HF: 객체마다 program(+ OpenUSD + render). docs: 짧은 프로그램으로 작성. |
| 부품마다 함수화, 치수는 파라미터로 편집 | ✅ | bracket 공식 예제(`w`, `hole_d`, `pitch` 등). 세탁기 예도 파트·조인트 이름 단위. |
| 가동 모델 1만 점 초과 · 관절 3.6만 개 | ⚠️ | articulated **10,456**(HF) → “1만 초” ✅. **36,000 joints**는 프레스·마케팅([sandflow.ai/sand3d](https://sandflow.ai/sand3d/)) — HF 블로그 표에는 관절 총합 없음. |
| 전 모델에 메쉬 포함, Blender·Three.js·glTF로 이용 가능 | ⚠️ | 프로그램+OpenUSD+render; export는 **GLB(glTF)·USD·URDF·OBJ·STL**. Blender는 `bpy` 위 실행. Three.js는 docs 1급 export 이름이 아니라 **GLB 경로**로 쓰는 뉘앙스. |
| 개발: Sandflow | ✅ | GitHub Sandflow-ai, HF Sandflow, 프레스(리옹, 옛 Chat3D). |
| (부가) LLM Blender 대비 토큰이 약 4배 적다 | ⚠️ | docs median **4.0×**(30 CAD). HF 관련 서술 **3.8×** — 같은 방향, 수치·정의가 완전 동일하진 않음. |
| (부가) SimReady 재작성 개수 | ⚠️ | HF 표 **2,334** vs 프레스 **2,369**. |
| (부가) 스타 수·채택 규모가 이미 업계 표준급 | ❌ | 주장하지 말 것. API 기준 star 606(2026-11-06)은 초기 관심 신호일 뿐. |

**총평:** “10만+ 객체를 sand3d 코드로 공개했고, 파라미트릭·어티큘레이션 표현이 가능하다”는 X의 핵심은 HF·docs와 맞습니다. 관절 3.6만·Three.js·토큰 배수·SimReady 개수는 **출처를 가려 읽어야** 하고, 정확 인용은 Hugging Face 표와 sand3d 문서 홈을 우선하세요.

## 참고 자료

- sand3d docs — [sand3d.sandflow.ai](https://sand3d.sandflow.ai/) (Version 1.6.3 citation; API ~3643 tokens; token 비교 표)
- PyPI — [sand3d 1.6.3](https://pypi.org/project/sand3d/) (업로드 2026-11-06Z; Python/bpy 제약)
- GitHub — [Sandflow-ai/sand3d](https://github.com/Sandflow-ai/sand3d) (Apache-2.0; authors Neveu & Loy; API 2026-11-06: ★606 / forks 73 / issues 4 / created 2026-11-03)
- Hugging Face blog — [Sand3D: 106,094 3D Objects in One Code Substrate…](https://huggingface.co/blog/Sandflow/sand3d-106094-3d-objects-in-one-code-substrate-for) (2026-11-05)
- HF collection · explorer — [collections/Sandflow/sand3d](https://huggingface.co/collections/Sandflow/sand3d) · [spaces/Sandflow/sand3d-explorer](https://huggingface.co/spaces/Sandflow/sand3d-explorer)
- Press — [Sandflow: 3D-as-code dataset](https://sandflow.ai/press/3d-as-code-dataset/) (2026-11-05, Lyon; 100k / 36k joints / SimReady 2,369 / mid-December FM claim)
- Marketing — [sandflow.ai/sand3d](https://sandflow.ai/sand3d/) (“10K+ articulated … 36K joints”)
- 원본 X 포스트 — [@tokufxug](https://x.com/tokufxug/status/2118518008478085477) (bookmark id `2118518008478085477`)
