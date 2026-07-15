import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-primary/5 bg-primary/5">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-4 text-start">
                <Skeleton className="h-4 w-20 bg-primary/10" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 py-4">
                  <Skeleton className="h-5 w-full max-w-[140px] bg-primary/5" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 end-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -me-10 -mt-10" />
      <Skeleton className="h-5 w-24 mb-4 bg-primary/10" />
      <Skeleton className="h-10 w-16 bg-primary/10" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 bg-primary/10" />
        <Skeleton className="h-5 w-96 bg-primary/5" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64 bg-primary/10" />
          <Skeleton className="h-10 w-32 bg-primary/10" />
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    </div>
  );
}
