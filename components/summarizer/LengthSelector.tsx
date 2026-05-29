"use client"

import { SummaryLength } from "@/types/summary"
import { LENGTH_OPTIONS } from "@/lib/constants"

interface LengthSelectorProps {
  value: SummaryLength
  onChange: (value: SummaryLength) => void
  wordCount: number
}

export function LengthSelector({ value, onChange, wordCount }: LengthSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-3 rounded-xl border border-border/50">
      <div className="flex items-center flex-wrap gap-2">
        {LENGTH_OPTIONS.map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-200 font-medium
              ${value === l
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground font-medium bg-background px-3 py-1.5 rounded-full border border-border/50 shadow-sm whitespace-nowrap">
        {wordCount} words
      </span>
    </div>
  )
}
