"use client"

import { useState } from "react"
import { SummaryLength, SummaryResult, SummaryMode, PdfMeta } from "@/types/summary"
import { fetchSummary } from "@/services/summarize.service"
import { MIN_TEXT_LENGTH } from "@/lib/constants"

interface UseSummarizerReturn {
  // --- Mode ---
  mode: SummaryMode
  setMode: (v: SummaryMode) => void

  // --- Text mode ---
  text: string
  setText: (v: string) => void
  wordCount: number

  // --- PDF mode ---
  pdfFile: File | null
  pdfMeta: PdfMeta | null
  pdfText: string
  setPdfData: (file: File, meta: PdfMeta, text: string) => void
  clearPdf: () => void

  // --- Shared ---
  length: SummaryLength
  setLength: (v: SummaryLength) => void
  result: SummaryResult | null
  setResult: (v: SummaryResult | null) => void
  loading: boolean
  error: string
  canSubmit: boolean
  handleSubmit: () => Promise<void>
}

export function useSummarizer(): UseSummarizerReturn {
  const [mode, setMode]       = useState<SummaryMode>("text")

  // Text mode
  const [text, setText]       = useState("")

  // PDF mode
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null)
  const [pdfText, setPdfText] = useState("")

  // Shared
  const [length, setLength]   = useState<SummaryLength>("sedang")
  const [result, setResult]   = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  const canSubmit = !loading && (
    mode === "text"
      ? text.trim().length >= MIN_TEXT_LENGTH
      : pdfText.trim().length >= MIN_TEXT_LENGTH
  )

  function setPdfData(file: File, meta: PdfMeta, extractedText: string) {
    setPdfFile(file)
    setPdfMeta(meta)
    setPdfText(extractedText)
  }

  function clearPdf() {
    setPdfFile(null)
    setPdfMeta(null)
    setPdfText("")
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const payload =
        mode === "pdf" && pdfMeta
          ? {
              text:     pdfText,
              length,
              mode:     "pdf" as const,
              filename: pdfMeta.filename,
              pages:    pdfMeta.pages,
              chars:    pdfMeta.chars,
            }
          : { text, length, mode: "text" as const }

      const data = await fetchSummary(payload)

      setResult({
        ...data,
        originalText: mode === "pdf" ? pdfText : text,
        pdfMeta: mode === "pdf" ? pdfMeta ?? undefined : undefined,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return {
    mode, setMode,
    text, setText, wordCount,
    pdfFile, pdfMeta, pdfText, setPdfData, clearPdf,
    length, setLength,
    result, setResult, loading, error,
    canSubmit, handleSubmit,
  }
}
