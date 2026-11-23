import { PERIODS, FIGURES, FACTS, QUOTES } from "./data/content.js";
import { MCQS } from "./data/mcqs.js";
import { AUTHORS } from "./data/authors.js";

/* ============================================================ helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = {
  get(k, d) {
    try { const v = localStorage.getItem("lit." + k); return v === null ? d : JSON.parse(v); }
    catch { return d; }
  },
  set(k, v) { try { localStorage.setItem("lit." + k, JSON.stringify(v)); } catch {} },
};
const P = Object.fromEntries(PERIODS.map((p) => [p.id, p]));
const INK = {
  crimson: "#c8442c", ochre: "#b5822c", ultramarine: "#2f4bc4", green: "#2e7d51",
  violet: "#6d4bb4", amber: "#c98a12", teal: "#177d84", rose: "#b8437a",
};
const inkOf = (id) => INK[P[id]?.ink] || "var(--accent)";
const pName = (id) => (P[id] ? P[id].name.replace(/^The /, "") : id);

/* ============================================================ editions */
const EDITIONS = [
  { id: "kunsthalle", name: "Kunsthalle", sub: "gallery white · serif", sw: ["#f4f1ea", "#c8442c"] },
  { id: "numberwall", name: "Number Wall", sub: "dark · mono · grid", sw: ["#101010", "#ffd23f"] },
  { id: "cinquanta", name: "Cinquanta", sub: "Olivetti red · typewriter", sw: ["#e9e3d3", "#c1272d"] },
  { id: "videotape", name: "Videotape", sub: "VCR · magenta · scanlines", sw: ["#08080a", "#ff2ea6"] },
  { id: "pc", name: "Personal Computer", sub: "bootable terminal · green", sw: ["#050705", "#7dff9b"] },
  { id: "nineties", name: "90ies", sub: "Comic Sans · starfield", sw: ["#fdfcff", "#2b3fd4"] },
  { id: "chaos", name: "Chaos", sub: "damaged neon · a tilt", sw: ["#0b0a0c", "#ff5a3c"] },
  { id: "orbit", name: "Orbit", sub: "pastel circles · rounded", sw: ["#eceafc", "#7aa2ff"] },
];
function setEdition(id) {
  if (!EDITIONS.some((e) => e.id === id)) id = "kunsthalle";
  document.documentElement.dataset.edition = id;
  store.set("edition", id);
  $("#edname").textContent = EDITIONS.find((e) => e.id === id).name;
  $$("#edlist .ed").forEach((b) => b.classList.toggle("on", b.dataset.ed === id));
}
$("#edlist").innerHTML = EDITIONS.map(
  (e) => `<button class="ed" data-ed="${e.id}" type="button">
    <span class="sw" style="background:linear-gradient(135deg,${e.sw[0]} 0 60%,${e.sw[1]} 60% 100%)"></span>
    <span><span class="nm">${e.name}</span><br><span class="sub">${e.sub}</span></span></button>`
).join("");
$$("#edlist .ed").forEach((b) => b.addEventListener("click", () => setEdition(b.dataset.ed)));
$("#edbtn").addEventListener("click", () => { $("#edpanel").hidden = !$("#edpanel").hidden; });
$("#edpanel").addEventListener("click", (e) => { if (e.target.closest(".ed")) $("#edpanel").hidden = true; });
setEdition(store.get("edition", "kunsthalle"));

/* orbit: floating pastel discs, purely decorative */
if (1) {
  for (let i = 0; i < 6; i++) {
    const d = document.createElement("span");
    d.className = "orbit-deco";
    const s = 120 + Math.random() * 260;
    d.style.cssText =
      `width:${s}px;height:${s}px;left:${Math.random() * 92}vw;top:${8 + Math.random() * 150}vh;` +
      `background:${["#ffd6e8", "#cfe0ff", "#e2ffd8", "#fff0c2", "#e8dcff"][i % 5]}`;
    document.body.append(d);
  }
}

/* ============================================================ ticker */
{
  const items = FACTS.slice(0, 20).map((f) => `${esc(f.k)} <b>${esc(f.v)}</b>`);
  const one = items.join(" &nbsp;·&nbsp; ");
  $("#ticker").innerHTML = `<span>${one}</span><span>${one}</span>`;
}

/* ============================================================ stats */
$("#st-q").textContent = MCQS.length;
$("#st-a").textContent = AUTHORS.length;
$("#st-p").textContent = PERIODS.length;
$("#st-f").textContent = FIGURES.length;
$("#foot-count").textContent = MCQS.length;

/* ============================================================ filter bus */
const filters = { period: store.get("period", "all"), topic: store.get("topic", "all") };
const listeners = [];
function chipRow(el, opts, active, onPick) {
  el.innerHTML = opts
    .map(
      (o) =>
        `<button data-v="${o.v}" class="${o.v === active ? "on" : ""}" type="button">${esc(o.label)}${
          o.n != null ? ` <em style="opacity:.55;font-style:normal">${o.n}</em>` : ""
        }</button>`
    )
    .join("");
  $$("button", el).forEach((b) => b.addEventListener("click", () => onPick(b.dataset.v)));
  return (v) => $$("button", el).forEach((b) => b.classList.toggle("on", b.dataset.v === v));
}

/* ============================================================ periods */
$("#periodgrid").innerHTML = PERIODS.map(
  (p) => `<article class="pcard" style="--pc:${inkOf(p.id)}">
    <span class="pn">${String(p.n).padStart(2, "0")}</span>
    <div class="ptop">
      <h3>${esc(p.name)}</h3>
      <span class="dates">${p.from} → ${p.to}</span>
    </div>
    ${p.aka?.length ? `<p class="aka">${p.aka.map(esc).join(" · ")}</p>` : ""}
    <p class="blurb">${esc(p.blurb)}</p>
    <ul>${p.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    <div class="sub">${(p.sub || []).map((s) => `<span><b>${esc(s.label)}</b> ${esc(s.text)}</span>`).join("")}</div>
    <div class="pf">
      <button class="pill" data-flt="${p.id}" type="button">Filter the wall by this age →</button>
      <span class="dates" style="align-self:center;color:var(--dim)">${
        AUTHORS.filter((a) => a.p === p.id).length
      } names · ${MCQS.filter((m) => m.t.includes(p.id)).length} questions</span>
    </div>
  </article>`
).join("");
$$("#periodgrid [data-flt]").forEach((b) =>
  b.addEventListener("click", () => {
    setPeriod(b.dataset.flt);
    document.getElementById("wall").scrollIntoView({ behavior: "smooth", block: "start" });
  })
);

/* ============================================================ the wall */
const wall = AUTHORS.map((a, i) => ({ ...a, i }));
const syncWallChips = chipRow(
  $("#wallchips"),
  [{ v: "all", label: "everything", n: AUTHORS.length }].concat(
    PERIODS.map((p) => ({ v: p.id, label: p.name.replace(/^The /, ""), n: wall.filter((a) => a.p === p.id).length }))
  ),
  filters.period,
  (v) => setPeriod(v)
);
let starOnly = store.get("starOnly", false);
$("#staronly").classList.toggle("on", starOnly);
$("#staronly").addEventListener("click", () => {
  starOnly = !starOnly;
  store.set("starOnly", starOnly);
  $("#staronly").classList.toggle("on", starOnly);
  applyFilters();
});
$("#wallgrid").innerHTML = wall
  .map(
    (a) => `<button class="sq ${a.star === 5 ? "star5" : ""}" data-i="${a.i}" type="button"
      title="${esc(a.name)}">${String(a.i + 1).padStart(3, "0")}<i>${"★".repeat(a.star)}</i></button>`
  )
  .join("");

function applyFilters() {
  if (!booted) return;
  $$("#wallgrid .sq").forEach((b) => {
    const a = wall[+b.dataset.i];
    const okP = filters.period === "all" || a.p === filters.period;
    const okS = !starOnly || a.star === 5;
    b.classList.toggle("hide", !(okP && okS));
  });
  $$("#factgrid .fact").forEach((el) => {
    const f = FACTS[+el.dataset.i];
    el.classList.toggle("hide", !(filters.period === "all" || f.p === filters.period));
  });
  $$("#quotegrid .qt").forEach((el) => {
    const q = QUOTES[+el.dataset.i];
    el.classList.toggle("hide", !(filters.period === "all" || q.p === filters.period));
  });
  syncWallChips(filters.period);
  syncFactChips(filters.period);
  syncQuoteChips(filters.period);
  renderQuiz();
}
function setPeriod(v) {
  filters.period = v;
  store.set("period", v);
  applyFilters();
}

const readout = $("#readout");
const readoutDefault = readout.innerHTML;
$("#wallgrid").addEventListener("pointerover", (e) => {
  const b = e.target.closest(".sq");
  if (!b) return;
  const a = wall[+b.dataset.i];
  readout.innerHTML = `<span class="ro-name">${esc(a.name)}</span>
    <span class="ro-meta"><b>${esc(pName(a.p))}</b> · ${esc(a.role)}${a.b || a.d ? ` · ${esc(a.b)}–${esc(a.d)}` : ""} · ${"★".repeat(a.star)}</span>`;
});
$("#wallgrid").addEventListener("pointerleave", () => (readout.innerHTML = readoutDefault));
$("#wallgrid").addEventListener("click", (e) => {
  const b = e.target.closest(".sq");
  if (b) openSheet(wall[+b.dataset.i]);
});

/* ============================================================ author sheet */
const sheet = $("#sheet");
function openSheet(a) {
  const qs = MCQS.filter(
    (m) => m.q.toLowerCase().includes(lastName(a.name).toLowerCase()) ||
           (a.w || []).some((w) => w.length > 4 && m.q.toLowerCase().includes(short(w)))
  ).slice(0, 6);
  $("#sheetbody").innerHTML = `
    <div class="sh-head">
      <h3>${esc(a.name)}</h3>
      <span class="sh-life">${esc(a.b || "?")} – ${esc(a.d || "?")}</span>
      <span class="sh-role">${esc(pName(a.p))}</span>
      <span class="sh-stars">${"★".repeat(a.star)}${"☆".repeat(5 - a.star)}</span>
    </div>
    <p class="sh-life" style="margin:.4em 0 0">${esc(a.role)}</p>
    ${a.t?.length ? `<ul class="sh-t">${a.t.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    <div class="sh-cols">
      <div>
        <h4>Works the book names</h4>
        <ol class="sh-w">${(a.w || []).map((w) => `<li>${esc(w)}</li>`).join("") || "<li>—</li>"}</ol>
      </div>
      <div>
        ${a.q ? `<h4>Say it out loud</h4><blockquote class="sh-q">${esc(a.q)}</blockquote>` : ""}
        <h4 style="${a.q ? "margin-top:22px" : ""}">Why the paper asks</h4>
        <p class="sh-f">${esc(a.f)}</p>
      </div>
    </div>
    ${qs.length ? `<h4 style="margin-top:26px">Questions that name ${esc(lastName(a.name))}</h4>
      <ul class="sh-w">${qs.map((m) => `<li>${esc(m.q)} <span style="color:var(--dim)">— ${esc(m.o[m.a])}</span>${m.src ? ` <span class="dates" style="color:var(--dim)">[${esc(m.src)}]</span>` : ""}</li>`).join("")}</ul>` : ""}
    <div class="sh-quiz"><button class="btn primary" id="sheetquiz" type="button">Ask me these in the quiz →</button></div>`;
  sheet.hidden = false;
  document.body.classList.add("sheetopen");
  $("#sheetquiz")?.addEventListener("click", () => {
    if (qs.length) {
      filters.topic = "all";
      deck = qs.map((m) => ({ ...m }));
      answered = correct = streak = 0;
      paint();
      renderDeck();
      $("#quizchips") && syncQuizChips("all");
    }
    closeSheet();
    document.getElementById("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  sheet.scrollTop = 0;
}
function closeSheet() {
  sheet.hidden = true;
  document.body.classList.remove("sheetopen");
}
$("#sheetclose").addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeSheet(); $("#edpanel").hidden = true; }
});
const lastName = (n) => n.replace(/^(Sir|Dr|King|Lord|The|Rev\.|Madame|Mme\.)\s+/i, "").trim().split(/\s+/).slice(-1)[0].replace(/[^A-Za-z-]/g, "");
const short = (w) => w.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase();

/* ============================================================ epithets */
let factOrder = FACTS.map((_, i) => i);
const syncFactChips = chipRow(
  $("#factchips"),
  [{ v: "all", label: "all ages", n: FACTS.length }].concat(PERIODS.map((p) => ({ v: p.id, label: p.name.replace(/^The /, "") }))),
  filters.period,
  (v) => setPeriod(v)
);
function renderFacts() {
  $("#factgrid").innerHTML = factOrder
    .map((i) => {
      const f = FACTS[i];
      return `<button class="fact" data-i="${i}" type="button" style="--pc:${inkOf(f.p)}">
        <span class="q">${esc(f.k)}</span><span class="a">${esc(f.v)}</span>
        ${f.note ? `<span class="note">${esc(f.note)} <b style="color:${inkOf(f.p)}">${esc(pName(f.p))}</b></span>` : ""}
      </button>`;
    })
    .join("");
  $$("#factgrid .fact").forEach((el) => el.addEventListener("click", () => el.classList.toggle("rev")));
  applyFilters();
}
$("#factshuffle").addEventListener("click", () => {
  factOrder.sort(() => Math.random() - 0.5);
  renderFacts();
});

/* ============================================================ figures flashcards */
let foIdx = 0;
let foOrder = FIGURES.map((_, i) => i);
const seen = new Set(store.get("foSeen", []));
function renderFo() {
  const f = FIGURES[foOrder[foIdx]];
  $("#focard").innerHTML = `<div class="inner">
    <div class="face front">
      <span class="fnum">figure ${String(f.n).padStart(2, "0")} / ${FIGURES.length}</span>
      <h3 class="fterm">${esc(f.term)}</h3>
      <p class="fhint">click, or press space — the definition is on the back</p>
    </div>
    <div class="face back">
      <span class="fnum">${esc(f.term)}</span>
      <p class="fdef">${esc(f.def)}</p>
      <ul class="fex">${(f.ex || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${f.note ? `<p class="fnote">${esc(f.note)}</p>` : ""}
    </div></div>`;
  $("#fopos").textContent = `${foIdx + 1} of ${foOrder.length} · ${seen.size} seen`;
  $("#fodots").innerHTML = foOrder
    .map((i, k) => `<button data-k="${k}" class="${k === foIdx ? "on" : seen.has(i) ? "seen" : ""}" title="${esc(FIGURES[i].term)}" type="button"></button>`)
    .join("");
  $$("#fodots button").forEach((b) => b.addEventListener("click", () => go(+b.dataset.k)));
}
function flip() { $("#focard").classList.toggle("flipped"); }
function go(k) {
  foIdx = (k + foOrder.length) % foOrder.length;
  seen.add(foOrder[foIdx]);
  store.set("foSeen", [...seen]);
  $("#focard").classList.remove("flipped");
  renderFo();
}
$("#focard").addEventListener("click", flip);
$("#foflip").addEventListener("click", flip);
$("#fonext").addEventListener("click", () => go(foIdx + 1));
$("#foprev").addEventListener("click", () => go(foIdx - 1));
$("#foshuf").addEventListener("click", () => {
  foOrder.sort(() => Math.random() - 0.5);
  go(0);
});

/* ============================================================ quotations */
const syncQuoteChips = chipRow(
  $("#quotechips"),
  [{ v: "all", label: "all " + QUOTES.length + " quotations" }].concat(PERIODS.map((p) => ({ v: p.id, label: p.name.replace(/^The /, "") }))),
  filters.period,
  (v) => setPeriod(v)
);
$("#quotegrid").innerHTML = QUOTES.map(
  (q, i) => `<article class="qt" data-i="${i}" ${q.p ? `style="--pc:${inkOf(q.p)}"` : ""}>
    <p>“${esc(q.text)}”</p>
    <span class="who">${esc(q.who)}</span>${q.p ? `<span class="age">${esc(pName(q.p))}</span>` : ""}
  </article>`
).join("");

/* ============================================================ quiz */
const TOPICS = [...new Set(MCQS.flatMap((m) => m.t))];
const TOPIC_LABEL = {
  old: "Old English", medieval: "Medieval", renaissance: "Renaissance", neoclassic: "Neo-Classical",
  romantic: "Romantic", victorian: "Victorian", modern: "Modern", postmodern: "Post-Modern",
  terms: "Terms & epithets", gk: "General knowledge", general: "General",
};
const counts = Object.fromEntries(TOPICS.map((t) => [t, MCQS.filter((m) => m.t.includes(t)).length]));
const syncQuizChips = chipRow(
  $("#quizchips"),
  [{ v: "all", label: "the whole bank", n: MCQS.length }].concat(
    TOPICS.filter((t) => counts[t] >= 4).sort((a, b) => counts[b] - counts[a]).map((t) => ({ v: t, label: TOPIC_LABEL[t] || t, n: counts[t] }))
  ),
  filters.topic,
  (v) => {
    filters.topic = v;
    store.set("topic", v);
    syncQuizChips(v);
    renderQuiz(true);
  }
);
let deck = [];        // queue of MCQ objects
let answered = 0, correct = 0, streak = 0;
let best = store.get("best", { pct: 0, run: 0 });
$("#qbest").textContent = best.pct + "%";

function renderQuiz(deal = false) {
  const pool = poolFor(filters.topic);
  if (deal || !deck.length) {
    const len = +$("#qlen").value || pool.length;
    deck = pool.slice().sort(() => Math.random() - 0.5).slice(0, len);
    answered = correct = streak = 0;
    paint();
  }
  if (!deck.length) { $("#qlist").innerHTML = `<li class="q empty"><p class="qt2">Nothing left in this topic. Deal another set.</p></li>`; }
  $("#qleft").textContent = deck.filter((d) => !d._done).length;
  renderDeck();
}
function poolFor(t) {
  return t === "all" ? MCQS : MCQS.filter((m) => m.t.includes(t));
}
function renderDeck() {
  $("#qempty").hidden = deck.length > 0;
  $("#qlist").innerHTML = deck
    .map(
      (m, i) => `<li class="q ${m._done ? "done" : ""}" data-i="${i}">
        <div class="qh">
          <span class="qn">${String(i + 1).padStart(2, "0")}</span>
          <p class="qt2">${esc(m.q)}</p>
          ${m.src ? `<span class="qsrc">${esc(m.src)}</span>` : ""}
        </div>
        <div class="tags">${m.t.map((t) => `<span>${esc(TOPIC_LABEL[t] || t)}</span>`).join("")}</div>
        <div class="opts">${m.o
          .map(
            (o, k) => `<button class="opt ${m._done ? (k === m.a ? "right" : k === m._pick ? "wrong" : "") : ""}" data-k="${k}" type="button" ${m._done ? "disabled" : ""}>
              <span class="k">${"abcd"[k]}</span><span class="t">${esc(o)}</span></button>`
          )
          .join("")}</div>
        <p class="why">${
          m._done
            ? (m._pick === m.a
                ? `<b style="color:var(--accent)">Right.</b> ${esc(m.o[m.a])}.`
                : `<b style="color:#c0392b">Not this one.</b> The book's key is <b>${"abcd"[m.a]}) ${esc(m.o[m.a])}</b> — you picked ${"abcd"[m._pick]}) ${esc(m.o[m._pick])}.`) +
              (m.src ? ` Asked in ${esc(m.src)}.` : "")
            : ""
        }</p>
      </li>`
    )
    .join("");
  $$("#qlist .opt").forEach((b) =>
    b.addEventListener("click", () => answer(+b.closest(".q").dataset.i, +b.dataset.k))
  );
}
function answer(i, k) {
  const m = deck[i];
  if (!m || m._done) return;
  m._done = true;
  m._pick = k;
  answered++;
  if (k === m.a) { correct++; streak++; } else { streak = 0; }
  paint();
  renderDeck();
  const li = $$("#qlist .q")[i];
  li?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function paint() {
  $("#qscore").textContent = correct;
  $("#qdone").textContent = answered;
  $("#qstreak").textContent = streak;
  $("#qleft").textContent = deck.filter((d) => !d._done).length;
  const pct = answered ? Math.round((correct / answered) * 100) : 0;
  $("#qfill").style.width = (deck.length ? (answered / deck.length) * 100 : 0) + "%";
  if (answered && answered === deck.length) {
    if (pct >= best.pct) {
      best = { pct, run: deck.length };
      store.set("best", best);
      $("#qbest").textContent = pct + "% ★";
    }
    $("#qfill").style.width = "100%";
  }
}
$("#qstart").addEventListener("click", () => {
  renderQuiz(true);
  $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#qreset").addEventListener("click", () => {
  deck = [];
  answered = correct = streak = 0;
  paint();
  $("#qfill").style.width = "0";
  $("#qlist").innerHTML = "";
  $("#qempty").hidden = false;
});
$("#qlen").addEventListener("change", () => renderQuiz(true));
/* keyboard: 1-4 answer the first unanswered question in view */
document.addEventListener("keydown", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches("input,select,textarea,button")) return;
  if (/^[1-4]$/.test(e.key) && deck.some((d) => !d._done)) {
    const li = $$("#qlist .q").find((x) => !x.classList.contains("done"));
    if (li) answer(+li.dataset.i, +e.key - 1);
  } else if (e.key === "ArrowRight" && document.getElementById("figures").getBoundingClientRect().top < innerHeight * .6) {
    go(foIdx + 1);
  } else if (e.key === "ArrowLeft" && document.getElementById("figures").getBoundingClientRect().top < innerHeight * .6) {
    go(foIdx - 1);
  } else if (e.key.toLowerCase() === "e" && !e.metaKey && !e.ctrlKey) {
    const cur = document.documentElement.dataset.edition;
    const next = EDITIONS[(EDITIONS.findIndex((x) => x.id === cur) + 1) % EDITIONS.length];
    setEdition(next.id);
  }
});

/* ============================================================ boot */
var booted = false;
renderFacts();
renderFo();
renderQuiz();
booted = true;
applyFilters();
