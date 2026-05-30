"use client"

import { useState, useCallback } from "react"
import type { PdfMeta } from "@/types/summary"

interface ExtractResult extends PdfMeta {
  text: string
}

interface UsePdfExtractorReturn {
  extracting: boolean
  extractError: string
  extractText: (file: File) => Promise<ExtractResult | null>
}

export function usePdfExtractor(): UsePdfExtractorReturn {
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState("")

  const extractText = useCallback(async (file: File): Promise<ExtractResult | null> => {
    setExtracting(true)
    setExtractError("")

    try {
      // Dynamic import agar pdfjs-dist hanya diload di browser (tidak saat SSR)
      const pdfjsLib = await import("pdfjs-dist")
      // Gunakan worker lokal dari /public agar tidak bergantung CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const totalPages = pdf.numPages
      const textParts: string[] = []

      for (let i = 1; i <= totalPages; i++) {
        const page    = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
        textParts.push(pageText)
      }

      const fullText = textParts.join("\n\n")
      return {
        text:     fullText,
        filename: file.name,
        pages:    totalPages,
        chars:    fullText.length,
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal membaca PDF"
      setExtractError(msg)
      return null
    } finally {
      setExtracting(false)
    }
  }, [])

  return { extracting, extractError, extractText }
}

