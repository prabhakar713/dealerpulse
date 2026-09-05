# DealerPulse

A performance dashboard for a 5-branch Toyota group. Built for the Forward Deployed Engineer take-home.

The clock in this file is **31 Dec 2025** — the latest timestamp in `data/dealership_data.json`. There is no 2026 “today.”

Repo: [github.com/prabhakar713/dealerpulse](https://github.com/prabhakar713/dealerpulse)

## What it does

A CEO or branch manager can open one page and answer three questions: are we hitting the month, which branch is the problem, and who do I call today.

| Screen | Route | What you get |
|---|---|---|
| Company | `/` | Headline, KPIs, worst-first branch table, named action queue, funnel / aging / reasons |
| Branch | `/branch/[id]` | Same story scoped to one rooftop, plus a rep scoreboard |
| Rep | `/rep/[id]` | Period close rate, **open book** (live deals, not just this month’s intake), actions |

**Viewing as** jumps CEO ↔ branch. **Period** slices history (Dec, Oct–Dec, Jun–Dec, or a single month). Search (`Ctrl+K`) finds a branch, officer, or customer. **Copy link** shares the current view and period. **Light / Dark / Auto** follows the OS or a saved choice. Tables sort on click and export CSV. Print is in the header; `?` lists shortcuts.

Branch managers have no assigned leads in the file. `/rep/SR1` (and the other four managers) is an empty state on purpose, with a link to their branch.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

Deploy with `vercel --prod`. The assignment asks for a **live Vercel link** in the submission — that is the one remaining delivery item after this repo.

## Assignment coverage

Must-haves from `ASSIGNMENT.md`:

- [x] Overview — vital signs and a named headline
- [x] Drill-down — company → branch → rep
- [x] Actionable insight — named people, why, next step, `tel:` 
- [x] Time-range filter — Dec default, plus Q4 / YTD / each month
- [x] Desktop and tablet (~768 and ~1024)
- [x] Loading and empty states (managers, unknown ids, no intake in range)
- [x] `DECISIONS.md` — product choices, tradeoffs, next, real numbers
- [ ] Live Vercel URL (not deployed yet)

Open-ended work that is in the product: lead aging, intake funnel + lost/delay reasons, target pace, branch/rep comparison, header search, copy-link, Light/Dark/Auto, sortable tables, CSV, print. Skipped: forecast intervals, what-if sliders, LLM blurbs, fake account chrome.

## Data

`data/dealership_data.json` — 5 branches, 30 people, 510 leads, Jun–Dec 2025. Aggregations are pure functions in `src/lib/aggregations.ts`. Currency is ₹ L / Cr.

See `DECISIONS.md` for why the numbers are computed the way they are.
