import { headline } from "@/lib/aggregations";
import { dataset } from "@/lib/data";
import type { Filters } from "@/lib/types";

export function Headline({ filters }: { filters: Filters }) {
  const story = headline(dataset, filters);
  const tone =
    story.tone === "bad"
      ? "border-bad/30 bg-bad/8"
      : story.tone === "warn"
        ? "border-warn/30 bg-warn/8"
        : "border-good/30 bg-good/8";
  const mark = story.tone === "bad" ? "bg-bad" : story.tone === "warn" ? "bg-warn" : "bg-good";

  return (
    <section className={`card relative overflow-hidden p-4 sm:p-5 ${tone}`}>
      <span className={`absolute bottom-0 left-0 top-0 w-1 ${mark}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        What matters right now
      </p>
      <h1 className="mt-2 max-w-4xl text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {story.title}
      </h1>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">{story.detail}</p>
    </section>
  );
}
