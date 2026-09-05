export function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl animate-pulse space-y-4">
        <div className="h-20 rounded-2xl bg-elev" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-elev" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="h-80 rounded-2xl bg-elev lg:col-span-3" />
          <div className="h-80 rounded-2xl bg-elev lg:col-span-2" />
        </div>
        <div className="h-72 rounded-2xl bg-elev" />
      </div>
    </div>
  );
}
