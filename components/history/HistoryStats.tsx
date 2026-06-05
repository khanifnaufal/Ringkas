"use client"

import { BookOpen, Clock, FileText, Type, Tag } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { animate } from "motion/react"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface HistorySummaryItem {
  _id: string
  category: string
  sentiment: string
  readingTime: number
  pdfMeta?: { filename: string; pages: number; chars: number }
}

interface HistoryStatsProps {
  summaries: HistorySummaryItem[]
  filtered: HistorySummaryItem[]
}

interface AnimatedNumberProps {
  value: number
  className?: string
}

function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const displayValueRef = useRef(0)

  useEffect(() => {
    const controls = animate(displayValueRef.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate(val) {
        const rounded = Math.round(val)
        displayValueRef.current = rounded
        setDisplayValue(rounded)
      },
    })

    return () => controls.stop()
  }, [value])

  return <span className={className}>{displayValue}</span>
}

export function HistoryStats({ summaries, filtered }: HistoryStatsProps) {
  const { t } = useLanguage()
  const totalTime = filtered.reduce((acc, s) => acc + s.readingTime, 0)
  const pdfCount  = filtered.filter(s => !!s.pdfMeta).length
  const textCount = filtered.filter(s => !s.pdfMeta).length

  // top 3 categories from filtered list
  const catMap: Record<string, number> = {}
  filtered.forEach(s => { catMap[s.category] = (catMap[s.category] ?? 0) + 1 })
  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const isFiltered = filtered.length !== summaries.length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Total */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{t("history.stats.saved")}</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {isFiltered ? (
              <>
                <AnimatedNumber value={filtered.length} className="text-primary" />
                <span className="text-sm font-normal text-muted-foreground">
                  {" / "}
                  <AnimatedNumber value={summaries.length} />
                </span>
              </>
            ) : (
              <AnimatedNumber value={summaries.length} />
            )}
          </p>
        </div>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{t("history.stats.totalRead")}</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            <AnimatedNumber value={totalTime} />
            <span className="text-sm font-normal text-muted-foreground"> {t("history.minutesText")}</span>
          </p>
        </div>
      </div>

      {/* PDF vs Text */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{t("history.stats.pdfVsText")}</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            <AnimatedNumber value={pdfCount} />
            <span className="text-sm font-normal text-muted-foreground">
              {" / "}
              <AnimatedNumber value={textCount} />
            </span>
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{t("history.stats.categories")}</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {topCats.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : topCats.map(([cat]) => (
              <span
                key={cat}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
              >
                {t("cat." + cat.toLowerCase()) || cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
