import { SummaryResult } from "@/types/summary"
import { ResultCard } from "@/components/summarizer/ResultCard"

interface ResultPanelProps {
  result: SummaryResult | null
  loading: boolean
}

const EmptyState = () => (
  <div className="border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm min-h-[250px] md:min-h-[300px] bg-muted/10 h-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mb-4 text-muted-foreground/50 w-12 h-12"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
    <p className="text-center">Your summary will appear here</p>
  </div>
)

const LoadingSkeleton = () => (
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
          <div className={`h-3 rounded bg-muted animate-pulse`} style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>

    {/* AI working indicator */}
    <div className="flex items-center gap-2 pt-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <span className="text-xs text-muted-foreground">AI is summarizing...</span>
    </div>
  </div>
)

export function ResultPanel({ result, loading }: ResultPanelProps) {
  return (
    <div className="flex flex-col w-full h-full lg:sticky lg:top-8">
      {loading ? (
        <LoadingSkeleton />
      ) : result ? (
        <ResultCard data={result} className="shadow-md bg-card" />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
