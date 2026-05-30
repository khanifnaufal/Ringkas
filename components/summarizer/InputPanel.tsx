"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { PdfUploadPanel } from "@/components/summarizer/PdfUploadPanel"
import { SummaryLength, SummaryMode, PdfMeta } from "@/types/summary"
import { FileText, Type, AlertCircle, Loader2 } from "lucide-react"

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
]

export function InputPanel({
  mode, onModeChange,
  text, onTextChange, wordCount,
  pdfFile, pdfMeta, onPdfReady, onClearPdf,
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
              flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium
              transition-all duration-200
              ${mode === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Text mode ─────────────────────────────────────────────── */}
      {mode === "text" && (
        <div
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
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Meringkas…</>
              : "Ringkas Sekarang"
            }
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
      )}

      {/* ── PDF mode ──────────────────────────────────────────────── */}
      {mode === "pdf" && (
        <div
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
        </div>
      )}
    </div>
  )
}
