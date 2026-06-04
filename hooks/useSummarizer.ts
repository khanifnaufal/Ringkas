"use client"

import { useState } from "react"
import { SummaryLength, SummaryResult, SummaryMode, PdfMeta, UrlSummaryResult } from "@/types/summary"
import { MIN_TEXT_LENGTH, MAX_URLS } from "@/lib/constants"
import { toast } from "sonner"

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

  // --- URL mode ---
  urls: string[]
  setUrls: (v: string[]) => void
  addUrl: () => void
  removeUrl: (index: number) => void
  updateUrl: (index: number, val: string) => void
  urlResults: UrlSummaryResult[] | null
  setUrlResults: (v: UrlSummaryResult[] | null) => void

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

  // URL mode
  const [urls, setUrls] = useState<string[]>([""])
  const [urlResults, setUrlResults] = useState<UrlSummaryResult[] | null>(null)

  function addUrl() {
    if (urls.length >= MAX_URLS) return
    setUrls((prev) => [...prev, ""])
  }

  function removeUrl(index: number) {
    setUrls((prev) => {
      const filtered = prev.filter((_, i) => i !== index)
      return filtered.length ? filtered : [""]
    })
  }

  function updateUrl(index: number, val: string) {
    setUrls((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  // Shared
  const [length, setLength]   = useState<SummaryLength>("sedang")
  const [result, setResult]   = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  const canSubmit = !loading && (
    mode === "text"
      ? text.trim().length >= MIN_TEXT_LENGTH
      : mode === "pdf"
        ? pdfText.trim().length >= MIN_TEXT_LENGTH
        : urls.some((url) => url.trim().length > 0)
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
    setUrlResults(null)

    try {
      if (mode === "url") {
        const activeUrls = urls.filter((url) => url.trim() !== "")
        const res = await fetch("/api/summarize-urls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: activeUrls, length }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (res.status === 429) {
            toast.error(body.message || "Batas kuota terlampaui.", {
              duration: 6000,
              action: body.isGuest ? {
                label: "Login",
                onClick: () => window.location.href = "/sign-in"
              } : undefined
            })
          }
          throw new Error(body.error ?? body.message ?? "Gagal meringkas URL")
        }
        const data = await res.json()
        setUrlResults(data.results)
      } else {
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

        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (res.status === 429) {
            toast.error(body.message || "Batas kuota terlampaui.", {
              duration: 6000,
              action: body.isGuest ? {
                label: "Login",
                onClick: () => window.location.href = "/sign-in"
              } : undefined
            })
          }
          throw new Error(body.error ?? body.message ?? "Terjadi error, coba lagi")
        }

        const data = await res.json()

        setResult({
          ...data,
          originalText: mode === "pdf" ? pdfText : text,
          pdfMeta: mode === "pdf" ? pdfMeta ?? undefined : undefined,
        })
      }
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
    urls, setUrls, addUrl, removeUrl, updateUrl, urlResults, setUrlResults,
    length, setLength,
    result, setResult, loading, error,
    canSubmit, handleSubmit,
  }
}
