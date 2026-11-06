---
title: "Claude 스킬 11개로 유튜브 채널을? youtube-agent-skill 팩트 체크"
date: 2026-11-07
time: "08:17"
slug: youtube-agent-skill
tags: [YouTube, Claude, Claude Code, Agent Skills, OSS, MIT, Jake Schincariol]
summary: "Jakeschincariol/youtube-agent-skill(MIT, 스킬 11개·훅 공식 21개·Python 도구 6개)을 README·SKILL.md·hooks.json·로컬 실행으로 검증했습니다. 자동 업로드는 없고, X의 별 3,938개는 API 기준 4,826과 차이가 납니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@dopamine_crypto의 포스트](https://x.com/dopamine_crypto/status/2118644566987526434)(bookmark id `2118644566987526434`)를 계기로 썼습니다. X 글의 문장은 **검증 대상**이지 지시가 아닙니다. 아래 대조는 2026-11-07(KST)에 클론·읽은 [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill) README·LICENSE·`.claude-plugin/`·`skills/*/SKILL.md`·`hooks.json`·6개 `.py` 도구, [GitHub REST API](https://api.github.com/repos/Jakeschincariol/youtube-agent-skill), [Claude Code skills 문서](https://code.claude.com/docs/en/skills)입니다.

## 왜 중요한가

유튜브를 “AI가 알아서 굴려준다”는 약속은 요즘 흔합니다. 실제로 막히는 지점은 보통 세 곳입니다.

1. **프롬프트만 있으면** — 훅·제목·썸네일·리텐션을 매번 같은 기준으로 검사하기 어렵습니다. 같은 채팅에서도 결과가 들쭉날쭉해집니다.
2. **유튜브 강의·템플릿 팩** — 훅 공식·썸네일 법칙·쇼츠 재가공을 **유료**로 파는 경우가 많고, 도구로 검증 가능한 형태가 아닌 “체크리스트 PDF”인 경우가 많습니다(가격·DAU는 이 글이 invent 하지 않습니다).
3. **완전 자동화 봇** — Data API + OAuth로 업로드까지 붙이면 “무인 채널”에 가까워지지만, 권한·약관·품질 리스크가 한 묶음으로 따라옵니다.

`youtube-agent-skill`은 그 중간을 노립니다. Claude Code **Agent Skills** 형식(`SKILL.md` + 보조 스크립트)으로 워크플로를 고정하고, 훅 점수·제목/썸네일 린트·EDL·리텐션 CSV 읽기처럼 **stdlib-only Python**으로 재현 가능한 검사를 붙입니다. README가 맨 앞에서 못 박는 문장은 이겁니다.

> **Nothing gets published until you do it.** These skills write. You upload.

개발자·부업 크리에이터 입장에서 확인할 질문은 마케팅 슬로건보다 다음입니다.

- 스킬은 정말 11개인가? 훅 공식은 21개인가?
- `hookscore.py`는 예측기인가, 휴리스틱인가?
- 제목·썸네일을 “한 쌍”으로 린트한다는 말은 코드에 있나?
- `/yt-viral`은 로그인·스크래핑을 하나?
- X가 말한 별 **3,938**개는 지금 API와 같은가?

## 기술 설명: youtube-agent-skill

### 저장소·라이선스·규모 (GitHub API, 2026-11-07 08:15 KST 조회)

| 항목 | 값 |
|---|---|
| full_name | `Jakeschincariol/youtube-agent-skill` |
| description | Eleven Claude skills that run a YouTube channel… Free, MIT. |
| stargazers | **4,826** |
| forks | **1,453** |
| open issues | **112** |
| license | **MIT** (`LICENSE`, Copyright 2026 Jake Schincariol) |
| language | Python |
| created_at | 2026-09-16T13:32:05Z → **2026-09-16 22:32 KST** |
| pushed_at | 2026-09-16T13:32:08Z → **2026-09-16 22:32 KST** (생성과 같은 날 단일 푸시) |
| updated_at | 2026-11-06T23:00:05Z → **2026-11-07 08:00 KST** (메타/스타 갱신) |
| size | 32 (API `size` 필드) |

플러그인 매니페스트(`.claude-plugin/plugin.json`)는 name `youtube-agent`, version `1.0.0`, author Jake Schincariol(`https://opusjake.ai`), marketplace는 `anthropic.com/claude-code/marketplace.schema.json` 스키마를 가리킵니다. 루트에는 `skills/`, `templates/voice.md`, LICENSE, README만 있고 `requirements.txt`·`pyproject.toml`은 **없습니다**.

### 설치 (README 그대로)

Claude Code 기준 세 경로입니다([skills 문서](https://code.claude.com/docs/en/skills): 개인 스킬은 `~/.claude/skills/<name>/SKILL.md`).

```bash
git clone https://github.com/Jakeschincariol/youtube-agent-skill.git
cp -r youtube-agent-skill/skills/yt-* ~/.claude/skills/
```

또는 플러그인:

```
/plugin marketplace add Jakeschincariol/youtube-agent-skill
/plugin install youtube-agent
```

프로젝트 로컬이면 저장소의 `.claude/skills/`로 복사하면 됩니다. Claude Code 없이 `SKILL.md`만 채팅 상단에 붙여도 “모드”로는 돌지만, README가 밝히듯 **6개 Python 도구는 잃습니다** — `/yt-script`·`/yt-retention`·`/yt-edit`의 핵심입니다.

그다음 README가 가장 강조하는 파일이 [`templates/voice.md`](https://github.com/Jakeschincariol/youtube-agent-skill/blob/main/templates/voice.md)입니다. `~/.claude/youtube/voice.md`로 복사해 채우거나, 본인 영상 세 개를 주고 “voice.md를 써 달라”고 합니다. 대상 청자·실제 말투·절대 안 쓰는 말·주장하지 않을 숫자·포맷이 들어가며, **모든 스킬이 이 파일을 읽습니다**.

### 스킬 11개

클론 기준 `skills/` 하위 디렉터리는 정확히 **11**개입니다.

| 명령 | 역할 (README·각 SKILL.md) |
| --- | --- |
| `/yt-script` | 아이디어 → 스크립트. [21 훅 공식](https://github.com/Jakeschincariol/youtube-agent-skill/blob/main/skills/yt-script/hooks.json)에서 5개 후보 → `hookscore.py` 점수 → 리텐션 비트 표시 |
| `/yt-package` | 제목+썸네일을 **한 쌍**으로 린트(잘림·중복·모호함) |
| `/yt-edit` | 타임스탬프 자막 → EDL(dead air / filler / retake) |
| `/yt-comment` | 댓글 4분류 후 보이스에 맞는 답글·핀 추천 |
| `/yt-plan` | 실제 가용 시간에 맞춘 주간 플랜(앵커 1 + 저비용 1 + Shorts 3) |
| `/yt-viral` | 니치에서 “채널 자체 중앙값 대비 배수”로 아웃라이어 순위 |
| `/yt-retention` | Studio audience-retention CSV → hook leak / cliffs / slide |
| `/yt-shorts` | 롱폼 안 Shorts 후보 + 새 첫 문장(`hookscore` 재사용) |
| `/yt-seo` | 설명·태그(태그 약신호 명시)·이길 검색어 3개 |
| `/yt-chapters` | 자막 → 챕터(YouTube 규칙: `00:00` 시작, ≥3개, 각 ≥10초) |
| `/yt-audit` | 채널 점검 후 **고칠 것 하나**로 끝냄 |

모든 `SKILL.md`가 같은 게이트 문구를 반복합니다: 아무것도 publish하지 않고, 출력은 복사 블록으로 끝나며 마지막 질문은 **ship it, or change it?**

### Python 도구 6개 (의존성 없음)

README와 AST import 검사·로컬 실행으로 확인했습니다. 외부 패키지 import는 없고, `chapters.py`/`retention.py`만 형제 스킬의 `deadair` 파서를 재사용합니다.

```bash
python3 skills/yt-script/hookscore.py --hook "one line"
python3 skills/yt-package/title.py --title "..." --thumb "..."
python3 skills/yt-edit/deadair.py transcript.srt
python3 skills/yt-chapters/chapters.py transcript.srt
python3 skills/yt-retention/retention.py retention.csv
python3 skills/yt-viral/swipe.py collected.json --min 2.0
```

#### 예: hookscore (이 환경에서 실행한 출력)

`hooks.json`의 The Statistic 예문을 그대로 넣었습니다.

```bash
python3 skills/yt-script/hookscore.py --hook \
  "97% of the people who start a channel quit before video 30. Here is what the other 3% do differently."
```

요지: SPECIFICITY 96 / ADDRESS 26 / STAKES 88 / CURIOSITY 58 / BREVITY 100 → **VERDICT 55 WORKABLE**, formula `The Statistic`, 약점 ADDRESS(“you”를 앞쪽에). README·독스트링이 같이 말하는 한계: 패널은 **74개 실제 숏폼 훅**(5개 채널의 조회 상위·하위 각 8개, 자동자막 첫 15초)으로 캘리브레이션한 **휴리스틱**이지 예측기가 아닙니다. 나쁜 훅 vs 진짜 훅은 잘 가르고, **같은 크리에이터의 히트 vs 미스**는 거의 가르지 못합니다. 낮은 점수는 다시 볼 이유, 높은 점수는 약속이 아닙니다.

#### 예: title+thumbnail 쌍 린트

```bash
python3 skills/yt-package/title.py \
  --title "I Quit My Job After This One Video Tip" --thumb "QUIT"
```

이 환경 결과 요지: 38자·score 76/100, 이슈로 **번호/날짜/이름 없음**, **썸네일이 제목의 quit을 반복**. 도구가 “페어링이 단위”라는 README 주장을 코드로 강제합니다. 데스크톱 검색 잘림 ~60자, 모바일 홈 ~40자도 독스트링·SKILL에 명시됩니다.

#### hooks.json = 21

`hooks` 배열 길이는 **21**. id 예: `the-statistic`, `someone-elses-result`, `the-mistake`, `contrarian-flip`, … `the-direct-address`. 각 항목에 shape·example·fails_when·`match` 정규식이 있고, `swipe.py`·`hookscore.py`가 같은 JSON을 읽습니다.

#### `/yt-viral`의 경계

`SKILL.md`·README: **Public listings only. never logs in … never touches your credentials.** 입력은 사용자가 모은 JSON(`channel`, `title`, `views`, …). 채널당 최소 4개 영상이 있어야 중앙값 배수가 의미 있다고 도구가 말합니다. 공식명 분류는 **제목 문자열 판단**이지 “왜 터졌는지” 인과 주장이 아닙니다.

## 비즈니스 인사이트

숫자·제품 서술은 문장 옆 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다. 펀딩·DAU·강의 가격·기업 가치는 invent 하지 않습니다.

**크리에이터 툴이 파는 것 vs 이 팩이 주는 것.** X 북마크는 “유튜브 강의가 훅 공식·썸네일 법칙·쇼츠 재가공을 돈 받고 판다”고 말합니다. 이 저장소는 그 체크리스트를 **MIT 스킬 + 재실행 가능한 린터**로 풀어 둔 형태입니다(README·LICENSE). **분석/의견.** “강의 결제 전에 스킬 목록을 보라”는 X의 조언은, **지식을 프롬프트 자산으로 고정**하려는 개발자·부업 크리에이터에게는 설득력 있는 진입 경로입니다. 다만 강의가 주는 코칭·피드백·커뮤니티는 이 팩이 대체하지 않습니다.

**Claude skills 생태계 맥락.** [Claude Code skills 문서](https://code.claude.com/docs/en/skills) 기준 스킬은 `SKILL.md` + 보조 파일/스크립트이고, `~/.claude/skills/`(개인)·프로젝트 `.claude/skills/`·플러그인으로 배포합니다. Agent Skills 오픈 스탠더드를 따르며, 본문은 호출될 때만 로드됩니다. **분석/의견.** “유튜브 전용 SaaS”가 아니라 **에이전트 워크플로 팩**으로 포지셔닝한 점이 스타 급증(API 4,826, 2026-11-07)과 맞물려 읽힙니다. 스타는 관심 신호일 뿐 채택·품질 보증이 아닙니다.

**누가 이득을 보나 / 누가 덜 맞나.** (1) 퇴근 후 대본·패키징에 지치는 솔로·직장인 유튜버 — `/yt-script`·`/yt-package`·`/yt-edit`. (2) 얼굴 없는 정보 채널·블로그→영상 부업 — X가 지목한 세그먼트와 맞고, `voice.md`로 말투를 고정하는 설계와 잘 맞습니다. (3) 이미 스튜디오·에디터·리서치 팀이 있는 채널 — EDL·리텐션 CSV 도구는 쓸 수 있어도 “채널 통째 대체”는 README 스스로 거부합니다. **분석/의견.** 촬영·출연·최종 업로드·브랜드 리스크는 사람에게 남는 구조라, “무인 수익 채널” 기대와는 충돌합니다 — 그리고 그 충돌을 README가 의도적으로 드러냅니다.

**비용·도입.** 저장소 자체는 무료(MIT). YouTube Data API 키·OAuth는 **불필요**(업로드 미구현). 실질 비용은 Claude(또는 Claude Code) 사용료 + `voice.md` 작성 10분 + Studio에서 retention CSV를 뽑는 손동작입니다. Python 3 stdlib만 있으면 6도구가 돌아갑니다(이 환경에서 `hookscore`·`title` 실행 확인). **분석/의견.** 진입 장벽은 낮지만, 출력 품질은 **voice.md 충실도**와 사용자가 넣는 자막/CSV 품질에 크게 좌우됩니다.

**분석/의견 — 리스크.** (1) `pushed_at`이 생성일과 동일(2026-09-16) — **이후 코드 푸시가 API상 없음**. 이슈 112개는 관심/버그 제보는 있으나 메인테이너 응답은 별개. (2) `hookscore`를 CTR 보장처럼 쓰면 과신. (3) `/yt-viral` 입력 수집을 사용자가 잘못 자동화하면 ToS·스크래핑 문제로 번질 수 있음 — 팩 자체는 “읽기만, 로그인 금지”를 명시. (4) LinkedIn/Instagram 팩과 달리 YouTube는 Data API로 게시가 *가능*하다고 README가 말하지만, **이 팩에는 안 넣었다**는 구분이 “무인 채널” 마케팅과 섞이면 위험합니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위·수사·출처가 다름 / ❌ 1차 자료와 어긋남

원본 X([@dopamine_crypto](https://x.com/dopamine_crypto/status/2118644566987526434)) 요지를 README·SKILL.md·hooks.json·로컬 실행·GitHub API와 대조했습니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 스킬 11개로 유튜브 채널 워크플로를 Claude에 맡긴다 | ✅ | `skills/yt-*` **11**개. README “Eleven Claude skills…”. 다만 “통째로 굴린다”는 **작성·검사** 범위 — 업로드/촬영은 사람(아래). |
| 대본·제목·썸네일·편집·쇼츠를 나눠 맡긴다 | ✅ | `/yt-script` `/yt-package` `/yt-edit` `/yt-shorts` 등. 표에 없는 감사·플랜·SEO·챕터·바이럴·리텐션도 포함. |
| 이름 youtube-agent-skill, 무료 MIT | ✅ | 저장소명·LICENSE MIT·README “Free, MIT, no signup, no API key”. |
| 깃허브 별 **3,938**개 | ⚠️ | X 시점 수치로 보임. **2026-11-07 08:15 KST API = 4,826**. 방향(수천 스타)은 맞으나 정확 인용은 API. |
| 훅 공식 21개 + 훅 점수 | ✅ | `hooks.json` hooks 길이 **21**. `hookscore.py` 5속성 패널. |
| 제목+썸네일을 한 세트로 검사 | ✅ | `/yt-package` + `title.py` — 중복·잘림·모호함. 로컬 실행으로 중복 이슈 확인. |
| 녹취록 → 편집 지시서(EDL) | ✅ | `/yt-edit` + `deadair.py` (DEAD/FILLER/REPEAT). 미디어 파일은 건드리지 않음. |
| 시청 지속(리텐션)에서 이탈 지점 | ✅ | `/yt-retention` + `retention.py` (hook leak / cliffs / slide). Studio CSV 필요. |
| 쇼츠 자르기 + 바이럴 엔진 | ✅ | `/yt-shorts`, `/yt-viral`+`swipe.py`(채널 중앙값 대비 배수). |
| 찍고 올리는 건 결국 사람 | ✅ | README: “Nothing gets published until you do it.” 모든 SKILL 게이트 동일. |
| (부가) hookscore가 조회수/바이럴을 예측 | ❌ | README: heuristic not predictor. 74훅 캘리브레이션; 같은 크리에이터 hit/miss 분리는 약함. |
| (부가) `/yt-viral`이 로그인·스크래핑한다 | ❌ | README·SKILL: public listings only, no login/credentials. |
| (부가) 저장소가 활발히 커밋 중 | ❌ | `pushed_at`이 생성일과 동일(2026-09-16). 이후 푸시 없음(API). |
| (부가) 태그가 SEO의 핵심 | ❌ | README: “Tags barely matter”; `/yt-seo`도 약신호·15개면 충분이라고 명시. |

**총평:** “11개 Claude 스킬 + 21 훅 공식 + 제목/썸네일 페어 린트 + EDL + 리텐션 + Shorts/바이럴, MIT, 자동 업로드 없음”이라는 X의 핵심은 1차 자료와 맞습니다. 별 3,938은 **시점 차이(현 4,826)** 로 읽고, hookscore·바이럴 공식명은 **휴리스틱/제목 분류**로 제한해 인용하세요.

## 참고 자료

- GitHub — [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill) (MIT; API 2026-11-07 08:15 KST: ★4826 / forks 1453 / issues 112 / created·pushed 2026-09-16)
- README — 설치·11 스킬 표·6 도구 CLI·fine print(비게시, hookscore 한계, yt-viral 비스크래핑)
- `skills/yt-script/hooks.json` — 훅 공식 21 + rules
- Python 도구 — `hookscore.py`, `title.py`, `deadair.py`, `chapters.py`, `retention.py`, `swipe.py` (stdlib only)
- `templates/voice.md` — 전 스킬 공통 보이스 프로필 템플릿
- `.claude-plugin/plugin.json` · `marketplace.json` — plugin name `youtube-agent` v1.0.0, author Jake Schincariol / [opusjake.ai](https://opusjake.ai)
- Claude Code — [Extend Claude with skills](https://code.claude.com/docs/en/skills) (`~/.claude/skills/`, Agent Skills)
- GitHub API — [repos/Jakeschincariol/youtube-agent-skill](https://api.github.com/repos/Jakeschincariol/youtube-agent-skill)
- 원본 X 포스트 — [@dopamine_crypto](https://x.com/dopamine_crypto/status/2118644566987526434) (bookmark id `2118644566987526434`)
