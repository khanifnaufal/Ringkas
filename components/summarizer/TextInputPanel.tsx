"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { SummaryLength } from "@/types/summary"
import { AlertCircle, Loader2 } from "lucide-react"

import { useLanguage } from "@/components/providers/LanguageProvider"

interface TextInputPanelProps {
  text: string
  onTextChange: (v: string) => void
  wordCount: number
  length: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  loading: boolean
  canSubmit: boolean
  error: string
  onSubmit: () => void
}

export function TextInputPanel({
  text,
  onTextChange,
  wordCount,
  length,
  onLengthChange,
  loading,
  canSubmit,
  error,
  onSubmit,
}: TextInputPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-4 w-full">
      <Textarea
        placeholder={t("text.placeholder")}
        className="min-h-[250px] md:min-h-[300px] resize-y text-base focus-visible:ring-primary/50"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />

      <LengthSelector value={length} onChange={onLengthChange} wordCount={wordCount} />

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("text.buttonLoading")}
          </>
        ) : (
          t("text.button")
        )}
      </Button>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
