"use client"

import { Button } from "@/components/ui/button"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { SummaryLength } from "@/types/summary"
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { MAX_URLS } from "@/lib/constants"

import { useLanguage } from "@/components/providers/LanguageProvider"

interface UrlInputPanelProps {
  urls: string[]
  onAddUrl: () => void
  onRemoveUrl: (index: number) => void
  onUpdateUrl: (index: number, val: string) => void
  length: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  loading: boolean
  canSubmit: boolean
  error: string
  onSubmit: () => void
}

export function UrlInputPanel({
  urls,
  onAddUrl,
  onRemoveUrl,
  onUpdateUrl,
  length,
  onLengthChange,
  loading,
  canSubmit,
  error,
  onSubmit,
}: UrlInputPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("url.label").replace("{max}", String(MAX_URLS))}
        </label>
        
        <AnimatePresence initial={false}>
          {urls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden flex items-center gap-2"
            >
              <input
                type="url"
                required
                placeholder={t("url.placeholder")}
                value={url}
                onChange={(e) => onUpdateUrl(index, e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/60 transition-colors"
              />
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveUrl(index)}
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddUrl}
          disabled={urls.length >= MAX_URLS}
          className="text-xs h-8 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {t("url.add")}
        </Button>
      </div>

      <LengthSelector value={length} onChange={onLengthChange} wordCount={0} />

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
