---
title: "주제만 넣으면 쇼츠가 나온다? MoneyPrinterTurbo 팩트 체크"
date: 2026-11-10
time: "15:24"
slug: moneyprinterturbo-auto-short-video
tags: [MoneyPrinterTurbo, 숏폼, TTS, Pexels, 오픈소스, 팩트체크]
summary: "2026-11-10 15:19 KST GitHub API의 스타는 141,712이고 라이선스는 MIT다. 기본 화면은 Pexels 영어 검색이고, 기본 BGM 29곡은 README가 YouTube 영상이라고 적는다. PyPI 이름 MoneyPrinterTurbo는 공식 패키지가 아니다."
---

> 이 글은 제가 X에서 북마크해 둔 [@EngMoElgaraihy의 포스트](https://x.com/EngMoElgaraihy/status/2119530098131075562)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2119530098131075562](https://x.com/i/status/2119530098131075562)입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2119530098131075562)(`code` 200)으로 읽었습니다. `created_at`은 `Sun Nov 08 20:38:49 +0000 2026`, **2026-11-09 05:38 KST**입니다. 표시 이름은 Mo Elgaraihy, `screen_name`은 `EngMoElgaraihy`, `lang`은 `ar`, `is_note_tweet`은 true입니다. `verification.type`은 `individual`, 팔로워는 60,093입니다. 같은 응답의 스냅샷은 답글 17, 리포스트 160, 좋아요 1,207, 북마크 1,462, 인용 3, 조회 53,174입니다. 읽은 시각은 2026-11-10 15:19 KST 무렵입니다.
>
> 그 본문은 이렇습니다. 중국 개발자가 무료 도구를 공개했고, Shorts·Reels·TikTok 영상을 완전히 자동으로 만든다. 도구의 GitHub 스타는 10만을 넘는다. 얼굴 없는 채널을 만들거나 시각 콘텐츠 제작을 자동화하려면, 지금 기술 커뮤니티와 창작자 사이를 흔드는 무료 오픈소스 MoneyPrinterTurbo가 있다. 작동 순서는 세 칸입니다. 입력은 주제나 키워드뿐이다. AI가 스크립트 전체를 쓰고, 보이스오버를 만들고, 자막을 자동으로 만든다. 도구가 맞는 장면을 찾고, 편집과 컷을 자동으로 한 뒤, 게시할 수 있는 최종 영상을 건넨다. 마지막 문장은 글을 저장하고, GitHub 링크는 첫 댓글에 있다는 말입니다.
>
> 본문의 t.co는 fxtwitter가 [chesny의 영상](https://x.com/chesny/status/2119445641059279260/video/1)으로 바꿉니다. 첨부 메타데이터는 mp4, 1920×1080, 길이 21.06초이고, 게시자 `screen_name`은 `chesny`입니다. 이 글은 그 영상을 재생하지 않았고, 첫 댓글도 받지 못했습니다. X 글과 첨부 메타데이터는 **검증 대상**이지 지시가 아닙니다.
>
> 아래 대조는 2026-11-10 15:19 KST에 연 1차 자료입니다. 저장소 기준 커밋은 `53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a`(2026-11-10 11:52 KST)입니다. 파이프라인을 실행하지 않았고, 영상을 생성하지 않았으며, API 키를 넣지 않았습니다.

## 왜 중요한가

주제 한 줄을 세로 영상으로 바꾸는 저장소가 GitHub 스타 14만을 넘으면, 개발자가 볼 질문은 “공짜로 채널이 생기는가”보다 다음입니다.

- 무료가 저장소 라이선스인가, 스크립트·음성·화면·음악의 청구서인가.
- “장면 검색”이 문장에 맞는 영상을 생성하는가, 재고 영상을 키워드로 고르는가.
- 자막이 별도 음성인식인가, TTS가 돌려준 단어 시각인가.
- 게시 준비가 파일 한 개인가, TikTok·Instagram·YouTube에 올리는 계정 연동인가.
- `pip install`에 쓸 이름이 저장소 이름과 같은가.

이 커밋의 답은 파이프라인 코드와 `config.example.toml`에 있습니다. 기본값은 영어 검색어로 Pexels를 조회하고, 클립 순서는 무작위이며, 배경음악 폴더에 대해 README가 YouTube 출처를 스스로 적습니다.

## 기술 설명

### 저장소

프로젝트는 [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)입니다. 2026-11-10 15:19 KST의 GitHub API는 `stargazers_count` 141,712, `forks_count` 22,615, `license.spdx_id` `MIT`, `language` Python, `created_at` `2024-03-11T02:57:34Z`(2024-03-11 11:57 KST), `pushed_at` `2026-11-10T02:52:35Z`입니다. 토픽에는 `youtube-shorts`, `instagram-reels`, `tiktok`, `text-to-speech`, `ffmpeg`가 있습니다.

[LICENSE](https://github.com/harry0703/MoneyPrinterTurbo/blob/53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a/LICENSE) 첫 줄은 `MIT License`, 저작권 줄은 `Copyright (c) 2024 Harry`입니다. [사용자 API](https://api.github.com/users/harry0703)의 `name`은 Harry, `type`은 User, `location`과 `bio`와 `twitter_username`은 null, `created_at`은 `2013-07-03T09:21:24Z`입니다. 국적 필드는 이 응답에 없습니다.

최신 릴리스는 [v1.3.10](https://github.com/harry0703/MoneyPrinterTurbo/releases/tag/v1.3.10), `published_at` `2026-11-07T00:43:54Z`(2026-11-07 09:43 KST)입니다. 그 릴리스의 자산 `MoneyPrinterTurbo-Portable-Windows-1.3.10.7z`는 555,234,896바이트이고 `download_count`는 4,303입니다. 이 숫자는 그 파일 하나의 횟수입니다. `pyproject.toml`의 패키지 버전도 `1.3.10`이고, 프로젝트 이름은 `mpt`입니다.

영문 README는 공식 PyPI 패키지가 `harry0703`이 유지하는 [mpt](https://pypi.org/project/mpt/)이고, PyPI의 `MoneyPrinterTurbo` 패키지는 제3자가 유지한다고 적습니다. 2026-11-10에 읽은 PyPI JSON은 그 문장과 같습니다. `mpt` 1.3.10의 `summary`는 “Official MoneyPrinterTurbo package with WebUI and CLI, maintained by harry0703.”이고 Homepage는 위 저장소입니다. `MoneyPrinterTurbo` 1.4.5의 author는 yanjlee, 휠 업로드 시각은 `2024-06-01T08:05:36.886458Z`입니다. [yanjlee/MoneyPrinterTurbo](https://github.com/yanjlee/MoneyPrinterTurbo)는 `fork: true`, `parent`가 `harry0703/MoneyPrinterTurbo`, 스타 1, `pushed_at` `2024-06-01T10:47:39Z`입니다. 버전 숫자 1.4.5는 공식 1.3.10보다 커 보입니다. 패키지 이름은 다릅니다.

### 여섯 단계

`cli.py`의 단계 순서는 `script`, `terms`, `audio`, `subtitle`, `materials`, `video`입니다. `app/services/task.py`의 `_run_pipeline`이 API, CLI, WebUI가 공유하는 순서입니다. 각 단계가 비면 그 단계에서 실패로 끝납니다.

1. 스크립트. `video_script`가 비어 있으면 LLM이 쓰고, 사용자가 전문을 넣으면 LLM 스크립트 호출을 건너뜁니다.
2. 검색어. `video_source`가 `local`이 아니면 LLM이 소재 검색어를 만듭니다. `match_materials_to_script`가 꺼져 있으면 5개, 켜져 있으면 8개입니다.
3. 음성. 사용자 오디오가 없으면 TTS입니다. CLI가 목소리를 따로 받지 않으면 `zh-CN-XiaoxiaoNeural-Female`입니다.
4. 자막. 기본 `subtitle_provider`는 `edge`입니다. Edge 실패가 Whisper 다운로드로 넘어가지 않습니다.
5. 소재. 기본 `video_source`는 `pexels`입니다. 음성 길이를 덮을 만큼 받아서 로컬 파일로 둡니다.
6. 합성. 클립을 이어 `combined-N.mp4`를 만들고, 내레이션·자막·배경음악을 섞어 `final-N.mp4`를 만듭니다. 업로드는 이 파일이 생긴 뒤의 별도 단계이고, 기본은 꺼져 있습니다.

`stop_at`으로 중간 단계에서 멈출 수 있습니다. `script`와 `terms`만 만들 때는 FFmpeg를 요구하지 않습니다. 그 다음 단계부터는 FFmpeg가 없으면 태스크가 실패합니다.

### 스크립트와 검색어는 다른 언어다

`app/services/llm.py`의 기본 시스템 프롬프트는 영상 주제의 언어로 스크립트를 쓰라고 합니다. 마크다운, 제목, “welcome to this video”, “voiceover” 같은 표시를 넣지 말라고도 합니다. 문단 수는 1에서 10이고, 스키마 기본은 1입니다.

검색어 프롬프트는 다릅니다. 반환은 문자열의 JSON 배열이고, 각 항은 1–3단어이며, **영어만** 받는다고 두 번 적습니다. “Chinese is not accepted.” `match_materials_to_script`가 켜지면 스크립트 순서를 따르는 검색어를 요구합니다. 기본값은 꺼져 있습니다.

레지스트리 `LLM_PROVIDER_REGISTRY`는 이 커밋에서 44개 id입니다. `config.example.toml`의 기본 `llm_provider`는 `moonshot`이고, `moonshot_api_key`는 빈 문자열입니다. 빈 모델명과 빈 base URL은 레지스트리 기본을 따릅니다. Moonshot의 기본 모델은 `kimi-k3`, 기본 엔드포인트 id는 `china`, 주소는 `https://api.moonshot.cn/v1`입니다. 같은 스펙에 Global 주소 `https://api.moonshot.ai/v1`도 있습니다. `ollama`와 `claude_code`, `openai_codex`, `kimi_code`는 `requires_api_key=False`입니다. 나머지 다수는 키를 요구합니다. 이 글은 각 업체의 토큰 단가를 조회하지 않았습니다.

### 기본 화면은 재고 영상 검색이다

`VideoParams.video_source`의 기본은 `"pexels"`입니다. Pexels 검색은 이 호출입니다.

```python
params = {"query": search_term, "per_page": 20}
if aspect != VideoAspect.square:
    params["orientation"] = aspect.name
query_url = f"https://api.pexels.com/v1/videos/search?{urlencode(params)}"
```

`orientation`에 들어가는 `aspect.name`은 `portrait` 또는 `landscape`입니다. 출력 기본은 `VideoAspect.portrait`, 해상도 함수는 9:16을 1080×1920, 16:9를 1920×1080, 1:1을 1080×1080으로 바꿉니다. 검색 결과에서는 그 캔버스를 채울 수 있는 렌디션 중 픽셀 수가 가장 작은 파일을 고릅니다. 길이가 `minimum_duration`보다 짧은 항목은 버립니다.

Pixabay는 `https://pixabay.com/api/videos/`, Coverr는 `https://api.coverr.co/videos`입니다. 셋 다 API 키 목록이 있고, 예제 설정은 빈 배열입니다. 키 로테이션은 설정 주석이 적습니다.

같은 파이프라인이 받는 소재 id는 14개입니다. `pexels`, `pixabay`, `coverr`, `local`, `wavespeed`, `volcengine_seedance`, `ofox`, `metaso_minimax`, `muapi`, `loomloom`, `openai_image`, `codex_image`, `infistar`, `jalapeno`. CLI가 공개한 선택지는 여기서 `loomloom`을 뺀 13개입니다. WaveSpeed, Seedance, OFox, Metaso MiniMax, MuAPI, Infistar, Jalapeno는 검색이 아니라 대본 키워드로 클립을 새로 만드는 경로이고, 설정 주석은 요청마다 과금된다고 적습니다. CLI는 그 중 여럿에 `--confirm-*-charge`가 있어야 `materials` 또는 `video`까지 갑니다. `openai_image`는 키워드마다 이미지를 만들어 줌 클립으로 바꿉니다. `local`은 사용자가 준 이미지와 영상입니다.

한 편의 기본 이어 붙이기는 `VideoConcatMode.random`입니다. `match_materials_to_script`가 켜져 있으면 합성 단계에서 순서를 `sequential`로 고정합니다. 클립 길이 기본은 5초, 맞추기 기본은 `cover`(채우고 가운데를 자름)입니다. 이미지 모션 기본은 `zoom`입니다.

### 음성, 자막, 음악, 합성

의존성 핀은 `edge-tts==7.3.1`, `moviepy==2.2.1`, `faster-whisper==1.1.0`, `imageio-ffmpeg==0.6.0`입니다. README는 Edge TTS를 키 없는 무료 음성으로 적고, WebUI의 Azure TTS V1이 그 경로라고 적습니다. CLI 상수 `DEFAULT_VOICE_NAME`은 `zh-CN-XiaoxiaoNeural-Female`입니다. `parse_voice_name`은 끝의 `-Female`을 떼고, 다른 공급자 접두사가 없으면 `azure_tts_v1`로 갑니다. 그 함수가 `edge_tts.Communicate`를 만듭니다. API 모델 `VideoParams.voice_name`의 기본은 빈 문자열입니다. `is_no_voice`는 빈 문자열을 무음으로 보지 않습니다. 그래서 README의 CLI 예와, `voice_name`을 생략한 API 본문은 같은 목소리가 아닙니다.

자막 기본은 `edge`입니다. TTS가 준 단어 경계로 SRT를 만듭니다. `whisper`로 바꾸면 로컬 `faster-whisper`가 오디오를 받아 적고, 문장 모드에서는 그 결과를 스크립트에 맞춰 고칩니다. 기본 모델 크기는 `large-v3`이고, README는 약 3GB라고 적습니다. `large-v3-turbo`는 약 1.6GB라는 같은 README의 문장입니다. 장치 기본은 CPU, `compute_type` 기본은 `int8`입니다.

배경음악 기본 `bgm_type`은 `random`, 볼륨 기본은 0.2입니다. 파일은 `resource/songs`입니다. 이 커밋의 트리는 `output000.mp3`부터 `output029.mp3`까지 29개이고 `output026.mp3`은 없습니다. 그 디렉터리에 라이선스 파일은 없습니다. 중국어 README의 문장은 “当前项目里面放了一些默认的音乐，来自于 YouTube 视频，如有侵权，请删除。”입니다. 영문 README는 “The current project includes some default music from YouTube videos. If there are copyright issues, please delete them.”입니다. 곡목과 원 영상 URL은 두 README에 없습니다. Sonilo와 ElevenLabs는 별도 유료 음악 공급자이고, 키가 없으면 전체 영상 태스크는 음악 단계에서 미리 실패합니다. 생성이 나중에 실패하면 영상은 음악을 빼고 남기며 경고를 붙입니다.

합성은 `video.combine_videos` 다음 `video.generate_video`입니다. 코덱 주석의 기본은 `libx264`이고, `h264_nvenc`, `h264_amf`, `h264_qsv`, `h264_mf`, `h264_videotoolbox`는 선택입니다. 지원되지 않으면 `libx264`로 돌아간다고 주석이 적습니다. GPU는 README의 최소 요구에 “Not required”입니다. 최소는 CPU 4코어, RAM 4GB입니다.

### 실행

README의 소스 설치는 Python 3.11 이상을 요구합니다. 예시는 이렇습니다.

```shell
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
uv python install 3.11
uv sync --frozen
sh webui.sh
```

첫 실행이 `config.example.toml`을 `config.toml`로 복사한다고 README가 적습니다. WebUI 기본 주소는 `http://127.0.0.1:8501`입니다. API는 저장소 루트에서 `uv run python main.py`이고, 예제 설정의 `listen_port`는 8080입니다. 문서 경로는 `http://127.0.0.1:8080/docs`입니다. `app.api_key`가 비어 있으면 `/api/v1`과 `/tasks`는 인증 없이 열리고, 시작 로그가 그 상태를 경고합니다.

CLI의 가장 짧은 생성 명령은 README에 있습니다.

```shell
uv run python cli.py --video-subject "How AI is changing everyday life"
```

이 명령은 위 기본값을 탑니다. Moonshot 키가 비어 있으면 스크립트 단계에서 멈춥니다. Pexels 키가 비어 있으면 소재 단계에서 멈춥니다. 목소리만은 키 없는 Edge 경로가 CLI 기본입니다. `--video-script`를 주면 스크립트 LLM을 건너뛰고, `--video-terms`를 주면 검색어 LLM을 건너뜁니다.

API 생성은 `POST /api/v1/videos`입니다. 형제 경로는 `/api/v1/scripts`, `/api/v1/terms`, `/api/v1/audio`, `/api/v1/subtitle`입니다. `TaskVideoRequest`는 `video_count`를 1–5, `video_clip_duration`을 1–15초로 제한합니다. 아래 본문은 그 필드의 이름만 맞춘 예이고, 이 글은 호출하지 않았습니다.

```bash
curl -X POST http://127.0.0.1:8080/api/v1/videos \
  -H 'Content-Type: application/json' \
  -d '{"video_subject":"How AI is changing everyday life","video_aspect":"9:16","video_source":"pexels","voice_name":"zh-CN-XiaoxiaoNeural-Female"}'
```

예제 설정의 최소 칸은 이렇습니다. 키는 빈 값으로 두었습니다.

```toml
[app]
llm_provider = "moonshot"
moonshot_api_key = ""
video_source = "pexels"
pexels_api_keys = []
subtitle_provider = "edge"
```

크로스 포스트는 [Upload-Post](https://upload-post.com/)입니다. 예제에서 `upload_post_enabled`와 `upload_post_auto_upload`는 false이고, `upload_post_platforms`의 기본 배열은 `tiktok`과 `instagram`입니다. 주석이 허용하는 값은 `tiktok`, `instagram`, `youtube`입니다. YouTube 공개 범위 기본 문자는 `public`이고, `upload_post_youtube_made_for_kids` 기본은 false입니다. 업로드 스레드는 프로세스 안에만 있고, 재시작 후 이어지지 않는다고 주석이 적습니다. 이 글은 Upload-Post의 요금표를 열지 않았습니다.

## 비즈니스 인사이트

숫자와 정책 문장 옆에는 출처를 붙입니다. **분석/의견**이라고 적은 문장만 이 글의 판단입니다. Moonshot, Pexels, ElevenLabs의 2026-11-10 단가표는 받지 않았으므로 편당 원화를 만들지 않습니다.

**같은 작업을 하는 공개 저장소가 이미 있습니다.** 2026-11-10 GitHub API에서 [FujiwaraChoki/MoneyPrinter](https://github.com/FujiwaraChoki/MoneyPrinter)는 스타 14,176, MIT, 생성 `2024-01-31T18:53:24Z`, 설명 “Automate Creation of YouTube Shorts using MoviePy.”입니다. [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT)는 스타 8,141, MIT, 생성 `2023-06-27T19:25:33Z`, 설명에 YouTube Shorts와 TikTok 채널 자동화가 들어 있습니다. 141,712 / 14,176 = 9.9966입니다. MoneyPrinterTurbo의 생성은 2024-03-11로, MoneyPrinter보다 늦습니다.

**분석/의견.** 이 셋이 겨루는 자리는 촬영 앱이 아니라, 대본·음성·재고 화면·자막을 한 프로세스에 묶는 로컬 파이프라인입니다. MoneyPrinterTurbo가 더 가진 것은 44개 LLM id, 14개 소재 소스, 키 없는 Edge 음성, API와 배치 CLI입니다. 스타 배수가 곧 영상 품질의 배수는 아닙니다. 이 글은 세 저장소의 출력물을 나란히 렌더하지 않았습니다.

**누가 이 저장소를 쓸 수 있나.** (1) 키를 이미 가진 팀이 주제에서 mp4까지의 순서를 자기 서버에 두려는 경우. 코드는 MIT입니다. (2) LLM만 로컬로 바꾸려는 경우. `ollama`는 레지스트리에서 키를 요구하지 않습니다. (3) 얼굴 출연 없이 보이스오버와 화면을 붙이는 실험을 하려는 경우. 그 출력 형식은 기본 해상도 1080×1920과 TTS로 만들 수 있습니다. 저장소는 그 형식을 “faceless channel”이라는 제품 기능으로 부르지 않습니다.

**소프트웨어 가격과 실행 가격은 다릅니다.** MIT는 코드 사용료가 없다고 적습니다. 기본 설정으로 README의 CLI 한 줄을 끝내려면 Moonshot 키와 Pexels 키가 필요합니다. Pexels 가입 페이지는 설정 주석의 링크이고, 영상 라이선스는 아래 Pexels 이용약관입니다. Edge 음성만 키가 없습니다. 텍스트-투-비디오 소스는 설정 주석이 클립마다 과금된다고 적고, CLI는 확인 플래그 없이 그 경로의 전체 영상을 시작하지 않습니다. **분석/의견.** “무료 도구”를 설치비로 읽으면 README와 라이선스가 맞습니다. 같은 말을 전기와 API 청구서가 0원이라는 뜻으로 읽으면, 기본 경로는 그 문장을 지키지 않습니다. 0원에 가깝게 가려면 LLM을 Ollama 같은 키 없는 공급자로 바꾸고, 음성은 Edge를 유지하고, 화면은 직접 가진 파일이나 키가 있는 무료 재고 API를 써야 합니다. 그 조합의 실제 청구서는 이 글이 측정하지 않았습니다.

**YouTube 수익 창출은 라이선스와 별도입니다.** [YouTube 채널 수익 창출 정책](https://support.google.com/youtube/answer/1311392)을 2026-11-10에 읽었습니다. 페이지 맨 위의 2025-07-15 문장은 “repetitious content”를 “inauthentic content”로 이름을 바꾸며, 반복적이거나 대량 생산된 콘텐츠가 여기에 들어간다고 밝힙니다. 같은 문장은 reused content 정책은 바꾸지 않는다고 적습니다. 이 날짜의 본문 소제목은 여전히 “Generic or Repetitive Content”입니다. 허용되지 않는 예의 한 줄은 “AI-generated content made with generic or unoriginal templates giving the impression of mass production without adding the creator’s original, authentic insights or perspective”입니다. 같은 목록에 “Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value”가 있습니다.

Reused content 절은, 이미 있는 온라인 소재를 중요한 해설이나 실질적 수정, 교육·오락 가치 없이 다시 올리는 채널을 말합니다. 원 제작자의 허락이 있어도 이 정책은 따로 본다고 적습니다. 저작권 클레임이 없어도 채널이 이 기준에 걸릴 수 있다는 문장도 있습니다. 정책은 Shorts를 포함한다고 페이지가 적습니다.

**분석/의견.** 기본 파이프라인의 산출은 같은 음성 이름, 같은 자막 위치, 무작위 재고 클립, 볼륨 0.2의 무작위 BGM입니다. 주제만 바꾸고 이 기본값을 반복하면, 위 도움말이 예시로 든 “템플릿으로 대량 생산된 인상을 주는 AI 콘텐츠”와 형태가 가깝습니다. 각 편의 대본이 서로 다르다는 사실만으로 그 예외가 된다고 이 도움말은 적지 않습니다. 수익 창출 여부는 채널 단위 심사입니다. 이 글은 특정 채널의 수익 창출 상태를 조회하지 않았습니다.

**재고 영상의 라이선스는 플랫폼 정책과 또 다릅니다.** [Pexels 이용약관](https://www.pexels.com/terms-of-service/)은 “Last updated: October 20th, 2026”입니다. CC0가 아닌 콘텐츠에 대해, 금지 용도를 지키면 상업·비상업 목적으로 수정해 쓸 수 있는 비독점 라이선스를 준다고 적습니다. Standalone, 즉 창작적 노력이 거의 없이 서비스에 있는 형태 그대로인 재판매는 금지입니다. 필터, 색, 크기, 자르기만 한 사용은 Standalone 예로 남습니다. 이미지·영상·오디오·텍스트와 편집이 합쳐져 새 작품이 되면 Standalone이 아니라고 적습니다. [Pexels 도움말](https://help.pexels.com/hc/en-us/articles/360042827333-Can-I-upload-Pexels-images-and-videos-to-YouTube)은 2026-11-08 01:32에 갱신됐고, YouTube에 올려도 된다고 하면서 “단순히 수정 없이 Pexels 콘텐츠를 채널에 올리는 것”은 허용되지 않는다고 적습니다. 식별 가능한 사람, 상표, 건물에 대한 별도 권리가 약관에 남아 있습니다.

[Pixabay 라이선스 요약](https://pixabay.com/service/license-summary/)도 무료 사용, 저작자 표시 불요, 수정 허용을 적고, 창작적 노력 없이 거의 같은 형태로 팔거나 배포하는 것을 금지합니다. [Coverr 라이선스](https://coverr.co/license)는 “Last updated November 4, 2026”입니다. 라이브러리 영상을 상업 프로젝트에 무료로 쓸 수 있다고 하면서, 원본 파일을 그대로 팔거나 다른 스톡 사이트에 올리는 것, 그리고 “claiming them through YouTube Content ID”를 금지합니다. Premium으로 표시된 9:16 영상은 Plus 이상에서 워터마크 없이 받을 수 있고, 워터마크가 있는 미리보기는 사용 라이선스가 없다고 적습니다. 스폰서 클립(Shutterstock, iStock, PremiumBeat)은 이 라이선스 밖입니다. MoneyPrinterTurbo의 Coverr 검색이 그 스폰서 항목을 거르는지 이 글은 확인하지 않았습니다.

**분석/의견.** Pexels 약관의 “새 작품” 예에는 오디오와 텍스트를 더하는 편집이 들어 있습니다. 보이스오버와 자막을 붙인 mp4는 그 문장에 더 가깝고, “수정 없이 재업로드”에는 덜 가깝습니다. 그 판단이 YouTube reused content 심사를 통과시킨다는 뜻은 아닙니다. 두 문서는 다른 주체가 다른 질문을 합니다. Pexels는 파일의 사용권이고, YouTube는 채널 수익 창출입니다.

**기본 음악은 재고 영상 라이선스에 들어 있지 않습니다.** 29개 mp3는 Pexels·Pixabay·Coverr 응답이 아닙니다. 출처로 확인할 수 있는 문장은 README의 “YouTube 영상에서 가져온 기본 음악”입니다. **분석/의견.** 얼굴 없는 채널을 기본 설정으로 양산하면, 화면 라이선스를 맞춰도 음악 트랙은 README가 이미 지목한 삭제 후보로 남습니다. 곡명과 라이선스 증빙이 폴더에 없으므로, 이 글은 각 파일이 어떤 영상의 오디오인지, Content ID에 걸리는지 확인하지 못했습니다. 확인 전에 기본 `random` BGM을 수익 영상에 넣는 선택은 README의 삭제 문장과 같이 읽어야 합니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다르거나, 확인한 자료가 그 문장까지 가지 않음 / ❌ 1차 자료와 어긋남

원본은 [@EngMoElgaraihy, 2026-11-09 05:38 KST](https://x.com/i/status/2119530098131075562)입니다.

| 주장 | 판정 | 근거 |
|---|---|---|
| 중국 개발자가 공개했다 | ⚠️ | 유지자는 GitHub 사용자 `harry0703`, API `name`은 Harry, `location`은 null입니다. LICENSE 저작권은 “Harry”입니다. 기본 README는 간체 중국어이고, 기본 LLM 엔드포인트는 `api.moonshot.cn`입니다. 국적을 적은 필드는 이 조회에 없습니다. |
| 무료다 | ⚠️ | 코드 라이선스는 MIT이고 PyPI `mpt`는 그 저장소를 Homepage로 둡니다. 기본 `moonshot_api_key`와 `pexels_api_keys`는 빈 값입니다. Edge TTS만 README가 키 없이 무료라고 적습니다. 텍스트-투-비디오 소스는 과금 확인이 있어야 CLI가 진행합니다. |
| Shorts·Reels·TikTok 영상을 만든다 | ✅ | 기본 화면비는 9:16, 1080×1920입니다. 16:9와 1:1도 있습니다. 저장소 토픽에 세 플랫폼 이름이 있습니다. 산출은 mp4 파일이고, 플랫폼 업로드는 기본으로 꺼져 있습니다. |
| 완전히 자동이다 | ⚠️ | `_run_pipeline`은 주제에서 `final-N.mp4`까지 여섯 단계를 한 태스크로 잇습니다. 기본 키로는 스크립트와 소재가 실패합니다. 클립 순서 기본은 `random`입니다. 검색어는 영어 JSON입니다. `stop_at`으로 중간 종료가 됩니다. |
| GitHub 스타가 10만을 넘는다 | ✅ | 2026-11-10 15:19 KST API `stargazers_count`는 141,712입니다. 포크는 22,615입니다. |
| 오픈소스다 | ✅ | GitHub `license.spdx_id`는 MIT이고, 커밋 `53c4ca3d`의 LICENSE 본문이 MIT입니다. |
| 얼굴 없는 채널을 만들 도구다 | ⚠️ | 카메라 입연 없이 TTS와 재고·생성 화면으로 1080×1920을 만드는 경로는 있습니다. README는 그 사업을 기능 이름으로 적지 않습니다. YouTube는 2025-07-15 이후 대량 생산 인상의 반복 콘텐츠를 수익 창출 불가 예로 둡니다. |
| 입력은 주제 또는 키워드뿐이다 | ⚠️ | `video_subject` 한 필드로 태스크를 시작할 수 있습니다. 끝나려면 LLM 키, 소재 키, FFmpeg, 그리고 CLI 기본이면 Edge 목소리가 필요합니다. 사용자가 스크립트와 검색어와 로컬 파일을 넣어 단계를 바꿀 수도 있습니다. |
| AI가 스크립트 전체를 쓴다 | ✅ | `video_script`가 비어 있으면 `llm.generate_script`가 씁니다. 기본 공급자는 Moonshot이고 키는 예제에서 비어 있습니다. 사용자가 전문을 주면 이 호출은 생략됩니다. |
| AI가 보이스오버를 만든다 | ⚠️ | 기본 음성은 생성 모델이 아니라 TTS입니다. CLI 기본 목소리는 `zh-CN-XiaoxiaoNeural-Female`이고 `edge_tts` 7.3.1로 갑니다. 다른 접두사(`elevenlabs:`, `gemini:`, `minimax:` 등)는 그 업체의 API입니다. |
| 자막을 자동으로 만든다 | ✅ | `subtitle_enabled` 기본은 true, `subtitle_provider` 기본은 `edge`입니다. 시간은 TTS 경계이고, Whisper는 설정했을 때만 씁니다. Edge가 파일을 못 만들면 자막 없이 진행하고 Whisper로 넘어가지 않습니다. |
| 맞는 장면을 찾아 자동 편집한다 | ⚠️ | 기본 검색은 Pexels `videos/search`에 영어 검색어를 넣는 호출입니다. 한 편의 이어 붙이기 기본은 무작위입니다. 문장 순서로 맞추려면 `match_materials_to_script`가 필요합니다. 편집은 길이 자르기, cover 맞춤, 자막, 음악 믹스입니다. |
| 게시할 수 있는 최종 영상을 건넨다 | ⚠️ | 성공 시 `final-N.mp4`가 태스크 디렉터리에 남습니다. TikTok·Instagram·YouTube로 올리는 코드는 Upload-Post이고 예제에서 꺼져 있습니다. 기본 플랫폼 배열에 `youtube`는 없습니다. |
| GitHub 링크가 첫 댓글에 있다 | ⚠️ | 본문은 그렇게 적습니다. 이 글은 답글을 받지 못했습니다. 도구 이름은 본문에 있습니다. 첨부 영상은 chesny의 1920×1080, 21.06초입니다. |
| 기술 커뮤니티와 창작자 사이를 흔든다 | ⚠️ | 측정치로 확인할 문장이 아닙니다. 2026-11-10의 스타 141,712, 포크 22,615, v1.3.10 Windows 자산 다운로드 4,303은 관심의 크기이고, 커뮤니티가 흔들렸다는 결론은 아닙니다. |

**총평:** 스타 10만 초과, MIT, 9:16 mp4, 주제에서 스크립트·TTS·자막·재고 화면·합성까지 한 태스크로 가는 코드는 저장소에 있습니다. “무료로 완전히 자동이며 바로 게시된다”는 문장은 기본 설정에서 닫히지 않습니다. 기본 LLM과 Pexels는 키가 필요하고, 장면 순서는 무작위이며, 업로드는 꺼져 있고, 기본 음악 29곡은 README가 YouTube 출처라고 적습니다. PyPI에서 저장소와 같은 이름을 설치하면 2024-06-01의 제3자 포크 1.4.5가 나오고, 공식 패키지 이름은 `mpt` 1.3.10입니다.

## 참고 자료

- 저장소 — [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo), 커밋 [`53c4ca3d`](https://github.com/harry0703/MoneyPrinterTurbo/commit/53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a) (2026-11-10 11:52 KST). API 2026-11-10 15:19 KST: 스타 141,712, 포크 22,615, MIT
- 계정 — [api.github.com/users/harry0703](https://api.github.com/users/harry0703). `name` Harry, `location` null
- 라이선스 — [LICENSE](https://github.com/harry0703/MoneyPrinterTurbo/blob/53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a/LICENSE)
- 설명서 — [README.md](https://github.com/harry0703/MoneyPrinterTurbo/blob/53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a/README.md), [README-en.md](https://github.com/harry0703/MoneyPrinterTurbo/blob/53c4ca3d85100eeb8660ec3d5e5f7c90bcc7849a/README-en.md). BGM 문장은 두 파일 모두에 있음
- 설정·코드 — `config.example.toml`, `app/models/llm_provider.py` (44 id), `app/services/llm.py`, `app/services/material.py`, `app/services/task.py`, `app/services/voice.py`, `app/models/schema.py`, `cli.py`
- 릴리스 — [v1.3.10](https://github.com/harry0703/MoneyPrinterTurbo/releases/tag/v1.3.10). Windows `.7z` 555,234,896바이트, 다운로드 4,303
- PyPI — [mpt 1.3.10](https://pypi.org/project/mpt/), [MoneyPrinterTurbo 1.4.5](https://pypi.org/project/MoneyPrinterTurbo/) (업로드 `2024-06-01T08:05:36Z`). 포크는 [yanjlee/MoneyPrinterTurbo](https://github.com/yanjlee/MoneyPrinterTurbo)
- 같은 갈래 — [FujiwaraChoki/MoneyPrinter](https://github.com/FujiwaraChoki/MoneyPrinter) 스타 14,176, [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT) 스타 8,141. 둘 다 2026-11-10 GitHub API, MIT
- YouTube — [채널 수익 창출 정책](https://support.google.com/youtube/answer/1311392). 2025-07-15 이름 변경 문장과 “Generic or Repetitive Content”, reused content 절. 2026-11-10에 읽음
- 소재 라이선스 — [Pexels 이용약관](https://www.pexels.com/terms-of-service/) (2026-10-20), [Pexels의 YouTube 업로드 도움말](https://help.pexels.com/hc/en-us/articles/360042827333-Can-I-upload-Pexels-images-and-videos-to-YouTube) (2026-11-08 01:32), [Pixabay 라이선스 요약](https://pixabay.com/service/license-summary/), [Coverr 라이선스](https://coverr.co/license) (2026-11-04)
- 업로드 연동 — 예제 설정의 Upload-Post 절, [upload-post.com](https://upload-post.com/), [docs.upload-post.com](https://docs.upload-post.com/). 요금은 조회하지 않음

## 원문 X 링크

- 북마크 — [@EngMoElgaraihy](https://x.com/EngMoElgaraihy/status/2119530098131075562) (id `2119530098131075562`, [x.com/i/status/2119530098131075562](https://x.com/i/status/2119530098131075562))
