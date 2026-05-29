"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { SummaryLength } from "@/types/summary"

interface InputPanelProps {
  text: string
  onTextChange: (v: string) => void
  length: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  wordCount: number
  loading: boolean
  canSubmit: boolean
  error: string
  onSubmit: () => void
}

export function InputPanel({
  text,
  onTextChange,
  length,
  onLengthChange,
  wordCount,
  loading,
  canSubmit,
  error,
  onSubmit,
}: InputPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        placeholder="Paste your content here — text, article, or anything you want summarized..."
        className="min-h-[250px] md:min-h-[300px] resize-y text-base focus-visible:ring-primary/50"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />

      <LengthSelector
        value={length}
        onChange={onLengthChange}
        wordCount={wordCount}
      />

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg"
      >
        {loading ? "Summarizing..." : "Summarize Now"}
      </Button>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
