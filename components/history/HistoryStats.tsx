"use client"

import { BookOpen, Clock, FileText, Type, Tag } from "lucide-react"

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

export function HistoryStats({ summaries, filtered }: HistoryStatsProps) {
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
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Tersimpan</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {isFiltered ? (
              <><span className="text-primary">{filtered.length}</span><span className="text-sm font-normal text-muted-foreground"> / {summaries.length}</span></>
            ) : summaries.length}
          </p>
        </div>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Total Baca</p>
          <p className="text-lg font-bold text-foreground leading-tight">{totalTime}<span className="text-sm font-normal text-muted-foreground"> mnt</span></p>
        </div>
      </div>

      {/* PDF vs Text */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">PDF / Teks</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {pdfCount}<span className="text-sm font-normal text-muted-foreground"> / {textCount}</span>
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Kategori</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {topCats.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : topCats.map(([cat]) => (
              <span
                key={cat}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
