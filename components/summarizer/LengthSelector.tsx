"use client"

import { SummaryLength } from "@/types/summary"
import { LENGTH_OPTIONS, LENGTH_LABELS } from "@/lib/constants"

interface LengthSelectorProps {
  value: SummaryLength
  onChange: (value: SummaryLength) => void
  wordCount: number
  isPdf?: boolean
}

export function LengthSelector({ value, onChange, wordCount, isPdf }: LengthSelectorProps) {
  const showWordCount = !isPdf && wordCount > 0

  return (
    <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-xl border border-border/50 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Panjang Ringkasan
        </span>
        {showWordCount && (
          <span className="text-xs text-muted-foreground font-medium bg-background px-2.5 py-1 rounded-full border border-border/50 shadow-sm whitespace-nowrap">
            {wordCount} kata
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 w-full">
        {LENGTH_OPTIONS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-pressed={value === l}
            className={`flex-1 text-center text-xs py-2 px-1 rounded-lg border transition-all duration-200 font-semibold cursor-pointer
              ${value === l
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {LENGTH_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  )
}
