"use client"

import { useState } from "react"
import { SummaryLength, SummaryResult } from "@/types/summary"
import { fetchSummary } from "@/services/summarize.service"
import { MIN_TEXT_LENGTH } from "@/lib/constants"

interface UseSummarizerReturn {
  text: string
  setText: (v: string) => void
  length: SummaryLength
  setLength: (v: SummaryLength) => void
  result: SummaryResult | null
  loading: boolean
  error: string
  wordCount: number
  canSubmit: boolean
  handleSubmit: () => Promise<void>
}

export function useSummarizer(): UseSummarizerReturn {
  const [text, setText]     = useState("")
  const [length, setLength] = useState<SummaryLength>("medium")
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = !loading && text.trim().length >= MIN_TEXT_LENGTH

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const data = await fetchSummary({ text, length })
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong, please try again")
    } finally {
      setLoading(false)
    }
  }

  return {
    text, setText,
    length, setLength,
    result,
    loading, error,
    wordCount, canSubmit,
    handleSubmit,
  }
}
