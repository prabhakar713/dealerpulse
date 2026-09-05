export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start rounded-xl border border-dashed border-line bg-soft/40 px-4 py-8">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-md text-xs leading-5 text-muted">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
