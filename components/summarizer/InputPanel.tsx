"use client"

import { PdfUploadPanel } from "@/components/summarizer/PdfUploadPanel"
import { TextInputPanel } from "@/components/summarizer/TextInputPanel"
import { UrlInputPanel } from "@/components/summarizer/UrlInputPanel"
import { SummaryLength, SummaryMode, PdfMeta } from "@/types/summary"
import { FileText, Type, Link2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

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

import { useLanguage } from "@/components/providers/LanguageProvider"

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

export function InputPanel({
  mode, onModeChange,
  text, onTextChange, wordCount,
  pdfFile, pdfMeta, onPdfReady, onClearPdf,
  urls, onAddUrl, onRemoveUrl, onUpdateUrl,
  length, onLengthChange,
  loading, canSubmit, error,
  onSubmit,
}: InputPanelProps) {
  const { t } = useLanguage()

  const tabs: { value: SummaryMode; label: string; icon: React.ReactNode }[] = [
    { value: "text", label: t("tab.text"),  icon: <Type  className="w-4 h-4" /> },
    { value: "pdf",  label: t("tab.pdf"),   icon: <FileText className="w-4 h-4" /> },
    { value: "url",  label: t("tab.url"),   icon: <Link2 className="w-4 h-4" /> },
  ]

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Mode tab switcher ─────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Mode input"
        className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border/40"
      >
        {tabs.map((tab) => (
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
            <TextInputPanel
              text={text}
              onTextChange={onTextChange}
              wordCount={wordCount}
              length={length}
              onLengthChange={onLengthChange}
              loading={loading}
              canSubmit={canSubmit}
              error={error}
              onSubmit={onSubmit}
            />
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
            <UrlInputPanel
              urls={urls}
              onAddUrl={onAddUrl}
              onRemoveUrl={onRemoveUrl}
              onUpdateUrl={onUpdateUrl}
              length={length}
              onLengthChange={onLengthChange}
              loading={loading}
              canSubmit={canSubmit}
              error={error}
              onSubmit={onSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
