"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SummaryResult } from "@/types/summary"
import { SENTIMENT_COLORS } from "@/lib/constants"

interface ResultCardProps {
  data: SummaryResult
  className?: string
}

export function ResultCard({ data, className }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = [
      data.summary,
      "",
      "Key points:",
      ...data.keyPoints.map((p) => `• ${p}`),
    ].join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`border rounded-xl p-5 space-y-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{data.category}</Badge>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[data.sentiment]}`}
        >
          {data.sentiment}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          ~{data.readingTime} min read
        </span>
      </div>

      <p className="text-sm leading-relaxed">{data.summary}</p>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Key points</p>
        <ul className="space-y-1">
          {data.keyPoints.map((point, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-muted-foreground">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy result"}
      </Button>
    </div>
  )
}
