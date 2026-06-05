"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SENTIMENT_COLORS } from "@/lib/constants"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { AskPanel } from "./AskPanel"
import {
  FileText,
  Type,
  Clock,
  Calendar,
  ExternalLink,
  Trash2,
  FolderOpen,
  MessageCircle,
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

function formatDate(ts: number, lang: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function HistoryCard({ item, collectionName, onOpen, onDelete }: HistoryCardProps) {
  const [askOpen, setAskOpen] = useState(false)
  const { t, uiLanguage } = useLanguage()

  // Fetch full document only when the dialog is opened ("skip" pattern)
  const summaryDoc = useQuery(
    api.summaries.getById,
    askOpen ? { id: item._id as Id<"summaries"> } : "skip"
  )

  const isPdf  = !!item.pdfMeta
  const title  = isPdf
    ? item.pdfMeta!.filename
    : item.originalText.slice(0, 60).trim() + (item.originalText.length > 60 ? "…" : "")

  const sentimentClass = SENTIMENT_COLORS[item.sentiment as keyof typeof SENTIMENT_COLORS]
    ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"

  // Prefer freshly-fetched doc, fall back to item prop
  const context = summaryDoc?.originalText ?? item.originalText

  return (
    <>
      <div className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        {/* Top row: icon + title + badges */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isPdf ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
          }`}>
            {isPdf ? <FileText className="w-4 h-4" /> : <Type className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug truncate" title={title}>
              {title}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant="outline" className="text-xs h-5 px-2 capitalize font-normal">
                {t("cat." + item.category.toLowerCase()) || item.category}
              </Badge>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sentimentClass}`}>
                {t("result.sentiment." + item.sentiment.toLowerCase()) || item.sentiment}
              </span>
              {isPdf && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium">
                  {item.pdfMeta!.pages} {t("pdf.pages").charAt(0).toUpperCase() + t("pdf.pages").slice(1)}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground ml-auto">
                <Clock className="w-3 h-3" />
                ~{item.readingTime} {t("history.minutesText")}
              </span>
            </div>
          </div>
        </div>

        {/* Summary preview */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {item.summary}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
          {/* Left: date + folder */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.createdAt, uiLanguage)}
            </span>
            {collectionName && (
              <span className="flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                {collectionName}
              </span>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {/* Ask button */}
            <Button
              id={`history-ask-${item._id}`}
              size="sm"
              variant="ghost"
              onClick={() => setAskOpen(true)}
              className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10"
            >
              <MessageCircle className="w-3 h-3" />
              {t("result.ask")}
            </Button>

            {/* Delete */}
            <button
              id={`history-delete-${item._id}`}
              onClick={() => onDelete(item._id, title)}
              title={t("history.delete")}
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
              {t("history.open")}
            </Button>
          </div>
        </div>
      </div>

      {/* Ask dialog — rendered outside the card so it sits at root level */}
      <AskPanel
        open={askOpen}
        onOpenChange={setAskOpen}
        summaryId={item._id}
        context={context}
        filename={item.pdfMeta?.filename}
      />
    </>
  )
}
