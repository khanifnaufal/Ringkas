"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { PdfUploadPanel } from "@/components/summarizer/PdfUploadPanel"
import { SummaryLength, SummaryMode, PdfMeta } from "@/types/summary"
import { FileText, Type, AlertCircle, Loader2, Link2, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { MAX_URLS } from "@/lib/constants"

interface InputPanelProps {
  // Mode
  mode: SummaryMode
  onModeChange: (v: SummaryMode) => void

  // Text
  text: string
  onTextChange: (v: string) => void
  wordCount: number

  // PDF
  pdfFile: File | null
  pdfMeta: PdfMeta | null
  onPdfReady: (file: File, meta: PdfMeta, text: string) => void
  onClearPdf: () => void

  // URL
  urls: string[]
  onAddUrl: () => void
  onRemoveUrl: (index: number) => void
  onUpdateUrl: (index: number, val: string) => void

  // Shared
  length: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  loading: boolean
  canSubmit: boolean
  error: string
  onSubmit: () => void
}

const TABS: { value: SummaryMode; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Teks",  icon: <Type  className="w-4 h-4" /> },
  { value: "pdf",  label: "PDF",   icon: <FileText className="w-4 h-4" /> },
  { value: "url",  label: "URL",   icon: <Link2 className="w-4 h-4" /> },
]

export function InputPanel({
  mode, onModeChange,
  text, onTextChange, wordCount,
  pdfFile, pdfMeta, onPdfReady, onClearPdf,
  urls, onAddUrl, onRemoveUrl, onUpdateUrl,
  length, onLengthChange,
  loading, canSubmit, error,
  onSubmit,
}: InputPanelProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Mode tab switcher ─────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Mode input"
        className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border/40"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={mode === tab.value}
            id={`tab-${tab.value}`}
            aria-controls={`panel-${tab.value}`}
            type="button"
            onClick={() => onModeChange(tab.value)}
            className={`
              relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium
              transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
              ${mode === tab.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {mode === tab.value && (
              <motion.div
                layoutId="active-mode-tab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "text" && (
          <motion.div
            key="text-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="tabpanel"
            id="panel-text"
            aria-labelledby="tab-text"
            className="flex flex-col gap-4 w-full"
          >
            <Textarea
              placeholder="Paste teks di sini — artikel, email, laporan, atau apapun yang ingin diringkas…"
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
                  Meringkas…
                </>
              ) : (
                "Ringkas Sekarang"
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
          </motion.div>
        )}

        {mode === "pdf" && (
          <motion.div
            key="pdf-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="tabpanel"
            id="panel-pdf"
            aria-labelledby="tab-pdf"
            className="w-full"
          >
            <PdfUploadPanel
              pdfFile={pdfFile}
              pdfMeta={pdfMeta}
              length={length}
              onLengthChange={onLengthChange}
              loading={loading}
              canSubmit={canSubmit}
              error={error}
              onPdfReady={onPdfReady}
              onClear={onClearPdf}
              onSubmit={onSubmit}
            />
          </motion.div>
        )}

        {mode === "url" && (
          <motion.div
            key="url-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="tabpanel"
            id="panel-url"
            aria-labelledby="tab-url"
            className="flex flex-col gap-4 w-full"
          >
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Masukkan URL Artikel/Web (Maks. {MAX_URLS})
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
                      placeholder="https://example.com/artikel-menarik"
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
                Tambah URL
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
                  Meringkas…
                </>
              ) : (
                "Ringkas URL Sekarang"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
