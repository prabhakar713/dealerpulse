export function Card({
  title,
  soWhat,
  children,
  className = "",
  action,
}: {
  title?: string;
  soWhat?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`card p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
            )}
            {soWhat && <p className="mt-1 text-xs leading-5 text-muted">{soWhat}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
