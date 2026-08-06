import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ql-form-container p-4 space-y-4 animate-in fade-in duration-150">
      {/* Form Header Skeleton */}
      <div className="ql-form-header-line flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>

      {/* Main Section Skeleton */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Fields Grid Skeleton */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="col-span-4 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="col-span-4 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>

          <div className="col-span-6 space-y-1.5 mt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="col-span-6 space-y-1.5 mt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>

          <div className="col-span-12 space-y-1.5 mt-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
