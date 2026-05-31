"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SENTIMENT_COLORS } from "@/lib/constants"
import {
  FileText,
  Type,
  Clock,
  Calendar,
  ExternalLink,
  Trash2,
  FolderOpen,
} from "lucide-react"

interface HistoryItem {
  _id: string
  originalText: string
  summary: string
  keyPoints: string[]
  category: string
  sentiment: string
  readingTime: number
  createdAt: number
  collectionId?: string
  pdfMeta?: {
    filename: string
    pages: number
    chars: number
  }
}

interface HistoryCardProps {
  item: HistoryItem
  collectionName?: string
  onOpen: (item: HistoryItem) => void
  onDelete: (id: string, title: string) => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function HistoryCard({ item, collectionName, onOpen, onDelete }: HistoryCardProps) {
  const isPdf  = !!item.pdfMeta
  const title  = isPdf
    ? item.pdfMeta!.filename
    : item.originalText.slice(0, 60).trim() + (item.originalText.length > 60 ? "…" : "")

  const sentimentClass = SENTIMENT_COLORS[item.sentiment as keyof typeof SENTIMENT_COLORS]
    ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {/* Top row: icon + title + badges */}
      <div className="flex items-start gap-3">
        {/* File type icon */}
        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isPdf ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
        }`}>
          {isPdf ? <FileText className="w-4 h-4" /> : <Type className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug truncate" title={title}>
            {title}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize font-normal">
              {item.category}
            </Badge>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${sentimentClass}`}>
              {item.sentiment}
            </span>
            {isPdf && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium">
                {item.pdfMeta!.pages}p
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto">
              <Clock className="w-2.5 h-2.5" />
              ~{item.readingTime} mnt
            </span>
          </div>
        </div>
      </div>

      {/* Summary preview */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {item.summary}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
        {/* Left: date + folder */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(item.createdAt)}
          </span>
          {collectionName && (
            <span className="flex items-center gap-1">
              <FolderOpen className="w-2.5 h-2.5" />
              {collectionName}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          {/* Delete */}
          <button
            id={`history-delete-${item._id}`}
            onClick={() => onDelete(item._id, title)}
            title="Hapus ringkasan"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Open detailed dialog */}
          <Button
            id={`history-open-${item._id}`}
            size="sm"
            variant="outline"
            onClick={() => onOpen(item)}
            className="h-7 px-2.5 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            Buka
          </Button>
        </div>
      </div>
    </div>
  )
}
