# Betel의 개발 노트 (정적 블로그)

읽고, 검증하고, 정리하는 개발 블로그입니다. 글은 Markdown이고 `build.py`가 정적 HTML을 만듭니다.

공개 주소: https://betelg15.github.io/

## 글 추가하기

1. `content/posts/YYYY-MM-DD-slug.md` 파일을 만듭니다. 주소는 파일 이름이 아니라 front matter의 `slug`로 정해집니다. `slug: my-note`이면 글 주소는 `https://betelg15.github.io/posts/my-note/` 입니다.

   ```markdown
   ---
   title: "글 제목"
   date: 2026-11-02
   time: "09:30"
   slug: my-note
   tags: [태그1, 태그2]
   summary: "목록에 보일 한 줄 요약"
   ---

   본문을 Markdown으로 작성합니다.
   ```

   `time`은 선택 front matter입니다. 형식은 `"HH:MM"`(24시간, KST)이고, `date:` 바로 다음 줄에 둡니다. 같은 날짜의 글을 목록에서 정렬할 때 쓰며, 없으면 `00:00`으로 취급합니다. 새 글에는 넣습니다.

2. 로컬에서 빌드하고 확인합니다. `.venv/`는 git에 포함하지 않습니다.

   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   .venv/bin/python build.py
   python3 -m http.server 8765 --directory public
   ```

   브라우저에서 http://127.0.0.1:8765/ 를 엽니다. 의존성은 `markdown`과 `pygments`입니다 (`requirements.txt`).

3. `main`에 push합니다.

## 배포

`main`에 push할 때마다 `.github/workflows/pages.yml`(이름: Deploy GitHub Pages)이 실행됩니다.

1. Python 3.12에서 `requirements.txt`의 `markdown`과 `pygments`를 설치합니다.
2. `python build.py`로 `public/`을 만듭니다.
3. `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`로 `public/`만 GitHub Pages에 배포합니다.

사이트 루트는 `public/`의 내용입니다. 목록 페이지의 `assets/style.css`와 글 페이지의 `../../assets/style.css`는 모두 `https://betelg15.github.io/assets/style.css`로 이어집니다.

이 워크플로 배포가 현재 라이브 사이트입니다. `public/`에 없는 파일(`build.py` 등)은 사이트에서 404입니다.

### 브랜치 루트에 올려 둔 정적 파일

이 저장소는 `betelg15.github.io` 사용자 사이트입니다. Pages는 이미 켜져 있었고, 이 환경의 토큰으로는 소스를 바꾸는 API가 403이었습니다. API 기준 소스는 아직 다음입니다.

- **Settings → Pages → Build and deployment → Source:** Deploy from a branch
- **Branch:** main
- **Folder:** / (root)

그래서 설정 없이 루트 배포만으로도 같은 사이트가 나가도록, 빌드 결과를 저장소 루트에도 두었습니다 (`index.html`, `posts/`, `assets/`, `static/`, `.nojekyll`). `.nojekyll`은 Jekyll이 HTML을 다시 가공하지 않게 합니다.

그 Source가 남아 있으면 push마다 GitHub 기본 워크플로 `pages-build-deployment`도 루트를 배포합니다. 커스텀 워크플로와 둘 다 성공하면 나중에 끝난 배포가 라이브가 됩니다. 글만 바꾸고 루트 HTML을 갱신하지 않은 채 기본 워크플로가 나중에 끝나면, 이전 HTML로 덮일 수 있습니다.

### 남아 있는 수동 설정

그 경쟁을 없애려면 저장소 설정에서 한 가지만 바꾸면 됩니다.

**Settings → Pages → Build and deployment → Source** 를 **Deploy from a branch** 에서 **GitHub Actions** 로 변경

바꾼 뒤에는 Markdown만 push하면 됩니다. 바꾸기 전에는, 글을 올릴 때 루트 정적 파일도 같이 커밋하면 어느 배포가 이겨도 같은 내용이 나갑니다.

```bash
.venv/bin/python build.py
cp public/index.html public/.nojekyll .
rm -rf posts && cp -a public/posts posts
cp public/assets/code.css assets/code.css
```

`assets/style.css`와 `static/`은 원본이 곧 배포 파일입니다. `public/`도 같이 커밋합니다.
