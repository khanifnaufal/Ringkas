"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SummaryResult } from "@/types/summary"
import { SENTIMENT_COLORS } from "@/lib/constants"
import { FileText, MessageCircle, Share2 } from "lucide-react"
import { AskPanel } from "@/components/history/AskPanel"
import { useTypewriter } from "@/hooks/useTypewriter"
import { ShareDialog } from "./ShareDialog"
import { SaveDropdown } from "./SaveDropdown"

interface ResultCardProps {
  data: SummaryResult & { _id?: string; collectionId?: string; originalText?: string }
  className?: string
  skipTypewriter?: boolean
}

export function ResultCard({ data, className, skipTypewriter = false }: ResultCardProps) {
  const isFromCollection = !!data._id
  const shouldSkipTypewriter = isFromCollection || skipTypewriter
  const { displayed: typedText, isDone: typewriteDone } = useTypewriter(data.summary, { speed: 14 })

  const displayed = shouldSkipTypewriter ? data.summary : typedText
  const isDone = shouldSkipTypewriter ? true : typewriteDone

  const [askOpen, setAskOpen] = useState(false)
  const [revealCount, setRevealCount] = useState(shouldSkipTypewriter ? data.keyPoints.length : 0)

  // Reset key-point reveal counter whenever new data arrives
  useEffect(() => {
    setRevealCount(shouldSkipTypewriter ? data.keyPoints.length : 0)
  }, [data.summary, shouldSkipTypewriter, data.keyPoints.length])

  // Stagger-reveal key points one by one after typewriter finishes (only if not from collection)
  useEffect(() => {
    if (shouldSkipTypewriter || !isDone) return
    const timers = data.keyPoints.map((_, i) =>
      setTimeout(() => setRevealCount(i + 1), i * 160)
    )
    return () => timers.forEach(clearTimeout)
  }, [isDone, data.keyPoints, shouldSkipTypewriter])

  const isFullyRevealed = isDone && revealCount >= data.keyPoints.length
  const summaryId = data._id

  return (
    <div className={`border rounded-xl p-5 flex flex-col gap-4 h-full ${className ?? ""}`}>
      {/* Metadata badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {data.pdfMeta && (
          <Badge variant="secondary" className="gap-1 font-medium">
            <FileText className="w-3.5 h-3.5" />
            PDF · {data.pdfMeta.pages}p
          </Badge>
        )}
        <Badge variant="outline">{data.category}</Badge>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[data.sentiment]}`}
        >
          {data.sentiment}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          ~{data.readingTime} mnt baca
        </span>
      </div>

      {/* Typewriter summary */}
      <p className="text-sm leading-relaxed min-h-[3rem]">
        {displayed}
        {!isDone && (
          <span className="ml-0.5 inline-block w-[2px] h-[1em] bg-primary align-middle animate-pulse" />
        )}
      </p>

      {/* Key points — reveal one by one */}
      {isDone && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Key points</p>
          <ul className="space-y-1">
            {data.keyPoints.slice(0, revealCount).map((point, i) => (
              <li
                key={i}
                className="text-sm flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                <span className="text-primary mt-0.5 shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons — only appear after everything is revealed */}
      {isFullyRevealed && (
        <div className="flex gap-2 pt-2 mt-auto animate-in fade-in duration-500">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAskOpen(true)}
            className="flex-1 text-xs transition-all hover:text-teal-600 hover:border-teal-500/30 hover:bg-teal-500/10 px-2.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/80" />
            Tanya
          </Button>

          <ShareDialog
            summary={data.summary}
            keyPoints={data.keyPoints}
            trigger={
              <Button variant="outline" size="sm" className="flex-1 text-xs transition-all cursor-pointer">
                <Share2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/80" />
                Share
              </Button>
            }
          />

          <SaveDropdown data={data} />
        </div>
      )}

      {/* Ask dialog — rendered outside to sit at root level */}
      <AskPanel
        open={askOpen}
        onOpenChange={setAskOpen}
        summaryId={summaryId || data.summary.slice(0, 50)}
        context={data.originalText || data.summary}
        filename={data.pdfMeta?.filename}
      />
    </div>
  )
}
