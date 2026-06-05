"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { usePdfExtractor } from "@/hooks/usePdfExtractor"
import { PdfMeta, SummaryLength } from "@/types/summary"
import { LengthSelector } from "@/components/summarizer/LengthSelector"
import { MAX_PDF_CHARS, MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB } from "@/lib/constants"
import { FileText, Upload, X, AlertCircle, Loader2 } from "lucide-react"

import { useLanguage } from "@/components/providers/LanguageProvider"

interface PdfUploadPanelProps {
  pdfFile: File | null
  pdfMeta: PdfMeta | null
  length: SummaryLength
  onLengthChange: (v: SummaryLength) => void
  loading: boolean
  canSubmit: boolean
  error: string
  onPdfReady: (file: File, meta: PdfMeta, text: string) => void
  onClear: () => void
  onSubmit: () => void
}

export function PdfUploadPanel({
  pdfFile,
  pdfMeta,
  length,
  onLengthChange,
  loading,
  canSubmit,
  error,
  onPdfReady,
  onClear,
  onSubmit,
}: PdfUploadPanelProps) {
  const { t, uiLanguage } = useLanguage()
  const inputRef                  = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]   = useState(false)
  const [sizeError, setSizeError] = useState("")
  const { extracting, extractError, extractText } = usePdfExtractor()

  const processFile = useCallback(async (file: File) => {
    setSizeError("")
    if (file.type !== "application/pdf") {
      setSizeError(t("pdf.errorFormat"))
      return
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      setSizeError(t("pdf.errorSize").replace("{max}", String(MAX_PDF_SIZE_MB)))
      return
    }
    const result = await extractText(file)
    if (!result) return

    const truncated = result.text.slice(0, MAX_PDF_CHARS)
    onPdfReady(file, { filename: result.filename, pages: result.pages, chars: truncated.length }, truncated)
  }, [extractText, onPdfReady, t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }, [processFile])

  const displayError  = sizeError || extractError || error
  const isProcessing  = extracting || loading

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Area utama — sama tinggi persis dengan Textarea ─────────── */}
      {pdfFile ? (
        /* ── File sudah dipilih ─────────────────────────────────────── */
        <div className="flex flex-col gap-3 min-h-[250px] md:min-h-[300px] w-full rounded-xl border border-border/60 bg-muted/10 p-4">
          {/* Header file */}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-background border-border/50 shadow-sm">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground" title={pdfMeta?.filename}>
                {pdfMeta?.filename}
              </p>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="text-xs text-muted-foreground">📄 {pdfMeta?.pages} {t("pdf.pages")}</span>
                <span className="text-xs text-muted-foreground">
                  🔤 {pdfMeta?.chars?.toLocaleString(uiLanguage === "id" ? "id-ID" : "en-US")} / {MAX_PDF_CHARS.toLocaleString(uiLanguage === "id" ? "id-ID" : "en-US")} {t("pdf.chars")}
                </span>
                {pdfMeta && pdfMeta.chars >= MAX_PDF_CHARS && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ {t("pdf.charTruncated").replace("{max}", MAX_PDF_CHARS.toLocaleString(uiLanguage === "id" ? "id-ID" : "en-US"))}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              disabled={isProcessing}
              aria-label={t("pdf.changeFile")}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Progress bar karakter */}
          {pdfMeta && (
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("pdf.charCount")}</span>
                <span>{Math.min(100, Math.round((pdfMeta.chars / MAX_PDF_CHARS) * 100))}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pdfMeta.chars >= MAX_PDF_CHARS ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, (pdfMeta.chars / MAX_PDF_CHARS) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Belum ada file — drop zone setinggi Textarea ───────────── */
        <>
          <div
            role="button"
            tabIndex={extracting ? -1 : 0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            aria-label="Upload PDF"
            aria-disabled={extracting}
            className={`
              group flex flex-col items-center justify-center gap-4 w-full
              min-h-[250px] md:min-h-[300px] rounded-xl border-2 border-dashed
              transition-all duration-200 cursor-pointer select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
              ${dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/60 bg-muted/10 hover:border-primary/50 hover:bg-muted/20"
              }
              ${extracting ? "opacity-60 pointer-events-none" : ""}
            `}
          >
            {extracting ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">{t("pdf.readingPdf")}</p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-4">
                  <p className="text-sm font-semibold text-foreground">
                    {dragging ? t("pdf.dragActive") : t("pdf.dragPlaceholder")}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("pdf.subText")}
                  </p>
                </div>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            aria-hidden="true"
          />
        </>
      )}

      {/* ── LengthSelector — selalu tampil ──────────────────────────── */}
      <LengthSelector value={length} onChange={onLengthChange} wordCount={0} isPdf />

      {/* ── Tombol submit — selalu tampil ───────────────────────────── */}
      <Button
        size="lg"
        onClick={pdfFile ? onSubmit : () => inputRef.current?.click()}
        disabled={pdfFile ? !canSubmit : false}
        className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg"
      >
        {extracting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("pdf.readingPdf")}</>
        ) : loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("pdf.analyzing")}</>
        ) : pdfFile ? (
          t("pdf.btnAnalyze")
        ) : (
          t("pdf.btnSelect")
        )}
      </Button>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {displayError && (
        <div role="alert" aria-live="assertive" className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {displayError}
        </div>
      )}
    </div>
  )
}
