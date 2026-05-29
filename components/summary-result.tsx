"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const sentimentColor: Record<string, string> = {
  positif: "bg-green-50 text-green-800",
  negatif: "bg-red-50 text-red-800",
  netral:  "bg-gray-100 text-gray-700",
}

export function SummaryResult({ data, className }: { data: any, className?: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = [
      data.summary,
      "",
      "Poin utama:",
      ...data.keyPoints.map((p: string) => `• ` + p),
    ].join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border rounded-xl p-5 space-y-4 ` + (className ?? "")}>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{data.category}</Badge>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ` + sentimentColor[data.sentiment]}>
          {data.sentiment}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          ~{data.readingTime} menit baca
        </span>
      </div>

      <p className="text-sm leading-relaxed">{data.summary}</p>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Poin utama</p>
        <ul className="space-y-1">
          {data.keyPoints.map((point: string, i: number) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-muted-foreground">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? "Tersalin!" : "Copy hasil"}
      </Button>
    </div>
  )
}