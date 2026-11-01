#!/usr/bin/env python3
"""초간단 정적 블로그 생성기: content/posts/*.md -> public/"""
import re, shutil, html
from pathlib import Path
import markdown
from pygments.formatters import HtmlFormatter

ROOT = Path(__file__).parent
SRC, OUT = ROOT / "content" / "posts", ROOT / "public"
SITE = {"title": "Betel의 개발 노트", "desc": "읽고, 검증하고, 정리하는 개발 블로그", "author": "@BetelY89300"}

def parse(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    meta, body = {}, text
    if m:
        body = m.group(2)
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            v = v.strip().strip('"')
            if v.startswith("[") and v.endswith("]"):
                v = [t.strip() for t in v[1:-1].split(",") if t.strip()]
            meta[k.strip()] = v
    md = markdown.Markdown(extensions=["fenced_code", "tables", "toc", "codehilite", "sane_lists"],
                           extension_configs={"codehilite": {"guess_lang": False, "css_class": "highlight"},
                                              "toc": {"toc_depth": "2-3"}})
    meta["html"] = md.convert(body)
    meta["toc"] = md.toc
    meta.setdefault("slug", path.stem)
    return meta

def page(title, content, depth):
    up = "../" * depth
    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="{up}assets/style.css">
<link rel="stylesheet" href="{up}assets/code.css">
</head><body>
<header class="site"><a class="brand" href="{up}index.html">{SITE['title']}</a><span class="tag">{SITE['desc']}</span></header>
<main>{content}</main>
<footer class="site">© 2026 {SITE['author']} · 정적 HTML로 생성됨</footer>
</body></html>"""

def build():
    if OUT.exists(): shutil.rmtree(OUT)
    (OUT / "assets").mkdir(parents=True)
    shutil.copy(ROOT / "assets" / "style.css", OUT / "assets" / "style.css")
    (OUT / "assets" / "code.css").write_text(
        HtmlFormatter(style="github-dark").get_style_defs(".highlight"), encoding="utf-8")
    if (ROOT / "static").exists(): shutil.copytree(ROOT / "static", OUT / "static")
    posts = sorted((parse(p) for p in SRC.glob("*.md")), key=lambda p: p["date"], reverse=True)
    for p in posts:
        d = OUT / "posts" / p["slug"]; d.mkdir(parents=True)
        tags = "".join(f'<span class="chip">#{html.escape(t)}</span>' for t in p.get("tags", []))
        body = f"""<article class="post">
<p class="meta">{p['date']} · {tags}</p>
<h1 class="title">{html.escape(p['title'])}</h1>
<details class="toc"><summary>목차</summary>{p['toc']}</details>
{p['html']}
<p class="back"><a href="../../index.html">← 글 목록</a></p></article>"""
        (d / "index.html").write_text(page(p["title"], body, 2), encoding="utf-8")
    items = "".join(f"""<li class="card"><a href="posts/{p['slug']}/index.html">
<p class="meta">{p['date']}</p><h2>{html.escape(p['title'])}</h2><p>{html.escape(p.get('summary',''))}</p></a></li>"""
                    for p in posts)
    (OUT / "index.html").write_text(page(SITE["title"], f'<h1 class="title">글 목록</h1><ul class="list">{items}</ul>', 0), encoding="utf-8")
    (OUT / ".nojekyll").write_text("")
    print(f"built {len(posts)} post(s) -> {OUT}")

if __name__ == "__main__":
    build()
