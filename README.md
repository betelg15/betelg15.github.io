# Betel의 개발 노트 (정적 블로그)

읽고, 검증하고, 정리하는 개발 블로그입니다. 글은 Markdown이고 `build.py`가 정적 HTML을 만듭니다.

공개 주소: https://betelg15.github.io/

## 글 추가하기

1. `content/posts/YYYY-MM-DD-slug.md` 파일을 만듭니다. 주소는 파일 이름이 아니라 front matter의 `slug`로 정해집니다. 예를 들어 `slug: my-note`이면 글 주소는 `https://betelg15.github.io/posts/my-note/` 입니다.

   ```markdown
   ---
   title: "글 제목"
   date: 2026-11-02
   slug: my-note
   tags: [태그1, 태그2]
   summary: "목록에 보일 한 줄 요약"
   ---

   본문을 Markdown으로 작성합니다.
   ```

2. 로컬에서 빌드하고 확인합니다. `.venv/`는 git에 포함하지 않습니다.

   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   .venv/bin/python build.py
   python3 -m http.server 8765 --directory public
   ```

   브라우저에서 http://127.0.0.1:8765/ 를 엽니다. 의존성은 `markdown`과 `pygments`입니다 (`requirements.txt`).

3. `main` 브랜치에 push합니다.

## 배포가 어떻게 동작하는가

사이트는 GitHub Pages로 나갑니다. 배포 경로는 두 가지이고, 지금 실제로 사이트를 제공하는 쪽은 브랜치 루트입니다.

### GitHub Actions

`.github/workflows/pages.yml`은 `main`에 push될 때마다 다음을 합니다.

1. Python 3.12에서 `requirements.txt`의 `markdown`과 `pygments`를 설치합니다.
2. `python build.py`로 `public/`을 만듭니다.
3. `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`로 `public/`만 배포합니다.

Pages의 **Source**가 **GitHub Actions**이면 여기까지가 전부입니다. Markdown만 커밋하고 push하면 되고, 생성된 HTML은 커밋하지 않아도 됩니다. 배포되는 사이트 루트는 `public/`의 내용이라 `index.html`의 `assets/style.css` 같은 상대 경로가 `https://betelg15.github.io/assets/style.css`로 맞습니다.

### 브랜치 루트 (지금 켜져 있는 배포)

이 저장소는 `<user>.github.io` 사용자 사이트입니다. Pages는 이미 켜져 있고, 소스는 다음으로 되어 있습니다.

- **Settings → Pages → Build and deployment → Source:** Deploy from a branch
- **Branch:** main
- **Folder:** / (root)

이 환경에서는 Pages 설정을 바꾸는 API 권한이 없어 Source를 GitHub Actions로 바꾸지 못했습니다. 기본 브랜치 루트 배포가 그대로 사이트를 제공하도록, 빌드 결과를 저장소 루트에도 올려 두었습니다.

- `index.html`, `posts/`
- `assets/style.css`, `assets/code.css`
- `static/`
- `.nojekyll` (Jekyll이 HTML을 다시 가공하지 않게 함)

루트에 둔 `index.html`과 글 페이지의 CSS·글 목록 링크는 모두 상대 경로입니다. `main`에 push하면 GitHub의 기본 Pages 빌드가 이 파일들을 https://betelg15.github.io/ 에 올립니다.

이 방식으로 글을 갱신할 때는 생성 파일도 같이 커밋합니다.

```bash
.venv/bin/python build.py
cp public/index.html public/.nojekyll .
rm -rf posts && cp -a public/posts posts
cp public/assets/code.css assets/code.css
```

`assets/style.css`와 `static/`은 원본이 곧 배포 파일입니다. `public/` 디렉터리도 빌드 결과로 같이 커밋합니다.

### 남아 있는 수동 설정

Actions가 배포를 맡게 하려면 저장소 설정에서 한 가지만 바꾸면 됩니다.

**Settings → Pages → Build and deployment → Source** 를 **Deploy from a branch** 에서 **GitHub Actions** 로 변경

바꾸기 전에는 루트 정적 파일이 사이트를 제공합니다. 워크플로의 `deploy-pages` 단계는 Source가 GitHub Actions가 아니면 실패할 수 있지만, 그 실패가 브랜치 배포를 끄지는 않습니다. Source를 바꾼 뒤에는 Markdown만 push하면 됩니다.
