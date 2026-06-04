import React from "react"

export const LoadingSkeleton = () => (
  <div className="border rounded-xl p-5 space-y-5 shadow-md bg-card min-h-[250px] md:min-h-[300px]">
    {/* Badge row */}
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
      <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
      <div className="h-5 w-16 rounded-full bg-muted animate-pulse ml-auto" />
    </div>

    {/* Summary lines */}
    <div className="space-y-2">
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="h-4 w-[92%] rounded bg-muted animate-pulse" />
      <div className="h-4 w-[85%] rounded bg-muted animate-pulse" />
      <div className="h-4 w-[78%] rounded bg-muted animate-pulse" />
    </div>

    {/* Key points label */}
    <div className="h-3 w-16 rounded bg-muted animate-pulse" />

    {/* Key point items */}
    <div className="space-y-2">
      {[90, 82, 70].map((w, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="h-3 w-3 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="h-3 rounded bg-muted animate-pulse" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>

    {/* AI working indicator */}
    <div className="flex items-center gap-2 pt-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <span className="text-xs text-muted-foreground">AI sedang meringkas...</span>
    </div>
  </div>
)
