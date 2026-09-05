# DealerPulse — product decisions

As of **31 Dec 2025** (latest timestamp in the file). I treated that date as “now” and never invented a 2026 clock.

## What I built, and why

The audience is a CEO who has 30 seconds and a branch manager who has a Monday stand-up. The page is a narrative, not a chart wall:

1. **A headline that names the problem** — period attainment, the worst branch, and the two queues that are still callable today.
2. **Branch comparison with reasons** — target pace + conversion + “why they lose,” worst-first. Click through to the branch, then the rep.
3. **A named action queue** — overdue undelivered orders, stalled mid-funnel leads, uncontacted news, missed-target branches, and outlier reps. Each row has a person, a why, a next step, and a `tel:` button.
4. **Funnel, aging, lost/delay reasons, source split** — only because they answer a specific operating question.

I did three open-ended features in depth, not seven shallowly:

- **Lead aging & follow-up** (from `status_history` + `last_activity_at`)
- **Funnel + drop-off reasons** (ever-reached stages + `lost_reason` + last stage before lost)
- **Target pace** (monthly actuals vs `targets`)

I skipped AI summaries, what-if sliders, and export. They would look clever and hide the fact that December already closed and the live book is only 62 deals.

## Thresholds (not arbitrary)

| Rule | Cut | Why this number |
|---|---|---|
| Mid-funnel stall | 7 days idle | Median first-contact in this file is **1.9 days**. A week is one missed pipeline meeting. |
| Critical stall | 14 days | Two review cycles with no touch. |
| Overdue order | 18 days since `order_placed` | Dataset-wide average `days_to_deliver` is **18.3**. |
| New-lead SLA | 2 days | Same as the median first-contact. |
| Weak rep | conversion ≤ 45% of officer peer average, ≥ 8 leads | Avoids punishing tiny books. Branch managers have **zero** assigned leads and are excluded. |
| Branch miss | < 30% of unit target in the selected period | In this file that flag is not noisy — it catches real collapse, especially Lakeside. |

## Interesting patterns (computed, not guessed)

**The live book is tiny and expensive.** 510 leads → 288 lost (56%), 160 delivered (31%), **62 still open**. Of those 62, **39 have had no activity for 7+ days**. Most of the “open” book is not mid-funnel at all — it is `order_placed` sitting for months (Omkar Varma / Lakeside, 195 days, ₹50.5L). Delivery ops is the CEO’s today-list, not a bigger ad budget.

**Lakeside Toyota (Bangalore) is broken.** 79 leads, **6 delivered (8%)**, 69 lost. December: **2 of 42 units (5%)**. Three officers are in single-digit conversion: Venkat Mishra 1/22 (5%), Revathi Pandey 1/14 (7%), Kavitha Joshi 1/13 (8%). Top loss reason: “Not ready to purchase” (12). This is a people-and-process problem, not a city-demand problem — Eastside Mumbai took 127 leads and delivered 47 (37%).

**December closed at 24% of group unit target** (52 / 218). Downtown was the “best” miss at 40% (19/48). Highway 26%, Eastside 25%, Central 22%, Lakeside 5%. Revenue: ₹12.23 Cr vs a ₹48.14 Cr target.

**Targets look structurally inflated.** Monthly targets sit at 181–240 units; monthly actuals are 16–52. I still show attainment — that’s what the CEO asked for — but I did **not** build a “you’ll hit if run-rate continues” forecast. December is a closed month, and a pace line against a 4–10× target would imply false precision.

**The funnel leaks before the first conversation.** Of 288 losses, **114 never left `new`** (never contacted). Funnel ever-reached: 510 new → 391 contacted → 300 test drive → 235 negotiation → 198 order → 160 delivered.

**Source quality is not equal.** Walk-in converts at **46%** (64/140). Social media converts at **14%** (10/72). Website / phone / expo / referral sit around 28–30%.

**Lost reasons are a three-way tie**, not one villain: better offer (40), not ready (40), financing (38), unresponsive (38), budget (36). Downtown concentrates “unresponsive after follow-up” (10). Highway and Central concentrate financing (11 and 8). Eastside concentrates “better offer” (14) and unhappy test drives (11). Coaching should be local.

**Delivery is slow and often late.** 160 deliveries, **72 delayed (45%)**, average 18.3 days. Downtown is worst (19.3 days, 22/40 delayed).

**First-contact speed does not separate good reps from bad ones.** Almost everyone is ~1.9–2.1 days. Conversion and Lakeside’s loss rate do. I still show the metric so a manager can see it is *not* the story.

**Branch managers have no personal book.** Empty state on `/rep/SR1` (and the other four managers) is deliberate.

## Tradeoffs

- **JSON in the client bundle, not a database.** 510 rows. An API + DB would add latency and no insight.
- **Default period is Dec 2025, not YTD.** The assignment asked for “this month’s vital signs.” YTD / Oct–Dec are one control away.
- **Two clocks.** Period filters history (units vs target, lost reasons, intake funnel). The action queue, aging, and open pipeline always use the live book as of 31 Dec 2025. A June order sitting 195 days is still a December problem.
- **Close rate = won / (won + lost) in the period**, not “leads created this month that later delivered.” December intake converting at 1% next to “52 units delivered” would lie to the CEO.
- **No forecast intervals, no what-if, no LLM blurb.** The honest sentence is: the month is closed, Lakeside is at 5%, and 38 orders have not been delivered.
- **Recharts over custom D3.** Clarity and time. Every chart has a one-line “so what.”

## What I would build next

1. A write-back so a manager can log “called / not answering” and clear the queue.
2. A factory-allocation / RTO feed joined to the 38 undelivered orders — the dashboard can name them, it cannot unblock them.
3. A target-setting workshop. Publishing 218 units against a 52-unit month trains the org to ignore the red bar.
4. Kill or requalify social leads until they stop converting at 14%.

## Stack

Next.js App Router, TypeScript, Tailwind v4, Recharts. Aggregations are pure functions in `src/lib/aggregations.ts`. Presentation does not compute funnel/aging/pace inline.
