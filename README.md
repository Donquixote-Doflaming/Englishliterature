# English Literature

[LINK](https://donquixote-doflaming.github.io/Englishliterature/)
## Run it

```sh
cd site
python3 -m http.server 8000 --bind 0.0.0.0
# open http://localhost:8000/
```

ES modules need a server — opening `index.html` straight from the disk (`file://`)
will not load the data.

## What is on the page

| Section | Data | Content |
| --- | --- | --- |
| Hero + ticker | — | counts, and a running strip of epithets |
| 01 The eight ages | `PERIODS` (8) | dates, sub-ages, 118 study facts, per-age accent colour |
| 02 The wall of names | `AUTHORS` (202) | numbered squares; hover to read, click for a card (dates, epithets, works, one quotation, why the paper asks, and the questions that name them). ★ = how often the book says to read that author |
| 03 "Who is called …?" | `FACTS` (48) | the father-of / first-of epithets, cover-and-check |
| 04 Figures of speech | `FIGURES` (35) | flip cards: definition, a real line, the usual trap |
| 05 Lines worth stealing | `QUOTES` (97) | quotations with speaker and age |
| 06 Past questions | `MCQS` (298) | topic chips, deal 10/20/40/all, instant marking against the book's key, exam-year badge, score + streak + best % in `localStorage` |

One period filter (wall chips, or a "filter the wall by this age" button on any period card)
drives the wall, the epithets and the quotations at once. `E` cycles the eight editions;
in the quiz `1`–`4` answer the first open question; `Esc` closes the author card.
Printing gets a stylesheet that flattens the flips and hides the chrome.

## Files

```
site/index.html      structure + section copy
site/styles.css      tokens, the eight editions, layout
site/app.js          rendering, filters, flashcards, quiz engine
site/data/content.js PERIODS, FIGURES, FACTS, QUOTES (curated)
site/data/authors.js AUTHORS (curated)
site/data/mcqs.js    MCQS (extracted from the book's "Previous Questions" blocks)
site/data/mcqs.json  the same bank as JSON
```

## Deploying

See `DEPLOY.md` — GitHub Pages, no build step (all paths are relative, so it works at `/<repo>/`).

## Notes on accuracy

* The PDF's Bengali columns came through the OCR corrupted, so the site carries the
  English matter only. Nothing here is machine-transcribed guesswork: quotations were
  checked line by line, and six invented or misattributed lines were deleted rather
  than shipped.
* Where the handbook itself is odd, the oddity is kept **and flagged** — e.g. Alfred
  "founding" Oxford in 872, the book's spelling "Monika Ali", its "The Bones of Greece"
  for Tahmima Anam's *The Bones of Grace*, and "Rebel Poet" meaning Byron in the English
  MCQ and Nazrul in the Bangladeshi GK item.
* Every MCQ answer is the book's printed key; 132 items carry the exam tag from the book
  ("38th BCS", "2011-12", …).

## Verified how

`tools/domtest/test.mjs` runs the real `app.js` against `index.html` in jsdom (bundle built
with esbuild): 51 checks covering boot, all six sections' counts, filters, the flip deck,
the quiz state machine (answer → mark → key highlight → counters), the author sheet, and
edition switching + persistence. `node --check` on each data file guards syntax.
