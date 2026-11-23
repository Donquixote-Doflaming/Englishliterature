# Deploy to GitHub Pages

The site is static (no build step, no bundler). Every asset is referenced relatively
(`./styles.css`, `./app.js`, `./data/*.js`), so it works at
`https://<you>.github.io/<repo>/` with no base-path config. Verified by serving the
folder under a sub-path and resolving every `href`/`src`/`import`: all 200.

You need exactly these 7 files in the repo root:

```
index.html  styles.css  app.js  README.md
data/content.js  data/authors.js  data/mcqs.js  (data/mcqs.json optional)

plus, if you want them, the two dotfiles — but neither is required for Pages, and
the web uploader will not accept them: .nojekyll, .gitignore
```

Keep the `data/` folder name — `app.js` imports `./data/…`.

Prefer one repo for several projects? Put the same files in a `docs/` folder at the repo
root and pick folder `/docs` in Settings → Pages — nothing else changes, because no path
in this site is absolute.

---

## A. No terminal: upload + one toggle

1. GitHub → **New repository** → name it `english-literature` → **Public** → *do not*
   tick "Add a README" (you already have one) → **Create**.
2. On the empty repo page: **uploading an existing file** → drag in
   `index.html`, `styles.css`, `app.js`, `README.md` and the whole `data/`
   folder → **Commit changes**.
   - **Dotfiles cannot be dragged in.** GitHub's uploader (and the browser file picker
     behind it) silently skips hidden files, so `.nojekyll` and `.gitignore` vanish from
     the list. Add it by name instead: repo → **Add file → Create new file** → type
     `.nojekyll` as the filename → leave the body empty → **Commit changes**. Or open
     `https://github.com/<you>/<repo>/new/main?filename=.nojekyll` directly.
   - **You can also skip it here.** `.nojekyll` only stops Jekyll from ignoring paths that
     begin with `_`, and this site has none (`index.html`, `styles.css`, `app.js`,
     `data/*.js`) — so an empty repo works without it. Keep it anyway if you later add
     `_sass/`, `_includes/` or an underscore-prefixed file.
3. **Settings → Pages** → Source: **Deploy from a branch** → branch `main`, folder
   `/ (root)` → **Save**.
4. Wait ~60 s, reload. Your URL is printed there: `https://<you>.github.io/english-literature/`.

## B. Terminal

```bash
cd site
git init -b main
git add index.html styles.css app.js README.md .nojekyll .gitignore data
git commit -m "English Literature study wall — 8 periods, 202 names, 298 past questions"
git branch -M main
git remote add origin https://github.com/<you>/english-literature.git
git push -u origin main
gh api repos/<you>/english-literature/pages -X POST \
  -f 'build_type=workflow' 2>/dev/null || true   # or just use Settings → Pages (option A step 3)
```

Without the `gh` CLI, enable Pages from **Settings → Pages** as in A.3.

Repos this folder: the `tools/` extraction scripts and `uploads/` (the PDF + its markdown)
stay outside the repo — they are the source, not the site.

## C. Continuous deploys (optional)

`.github/workflows/pages.yml`, then set Pages source to **GitHub Actions**:

```yaml
name: Pages
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  deploy:
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: . }
      - id: deployment
        uses: actions/deploy-pages@v4
```

## After it is live

- **HTTPS**: Settings → Pages → tick **Enforce HTTPS** (certificate takes a few minutes).
- **Quiz progress**: score/streak/best-`%` live in `localStorage`, keyed to the origin —
  so the numbers you saw in the sandbox do not follow you to GitHub, and the two do not
  mix. Nothing is uploaded anywhere; there is no backend.
- **Cache**: after a push, hard-reload (`cmd+shift+R`) if you still see the old version.
- **Custom domain**: add a `CNAME` file (or Settings → Pages → Custom domain), then
  `A` records `185.199.108.153 / 109.153.110.153 / 110.153.111.153 / 111.153.112.153`
  at your DNS provider.
- **Private repo?** Free accounts get Pages on public repos only; a private repo needs
  GitHub Pro, or make the repo public (the content is a study aid, nothing sensitive).

## If it 404s

| symptom | cause |
| --- | --- |
| whole site 404 | Pages source not set to `main` `/ (root)`, or repo empty |
| HTML loads, styles/JS 404 | the files went into a `site/` subfolder instead of the repo root — check the path shown in the repo's file list |
| `.nojekyll` / `.gitignore` missing after an upload | normal: the uploader skips dotfiles. Create them in the web editor by name (see A.2), or push with git |
| blank page, console says `Failed to resolve module specifier` | `data/` folder renamed, or the repo was opened as a single `.html` (ES modules need the real folder layout over http) |
| quiz empty | open via `https://`, not by double-clicking the file — `file://` blocks ES modules |
