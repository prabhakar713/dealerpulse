# DealerPulse

Performance dashboard for a 5-branch Toyota group. Built for the Forward Deployed Engineer take-home.

- **Overview** — company vital signs, worst-first branch table, named action queue
- **Branch** — `/branch/[id]` scorecard (funnel, reps, lost/delay reasons)
- **Rep** — `/rep/[id]` book (managers with no leads get an empty state)
- **As of 31 Dec 2025** — latest timestamp in `data/dealership_data.json`

See `DECISIONS.md` for product choices and the patterns in the data.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Deploy with `vercel --prod`.
