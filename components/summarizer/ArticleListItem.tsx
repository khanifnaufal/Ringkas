"use client"

import React from "react"
import { UrlSummaryResult } from "@/types/summary"
import { getArticleTitle } from "@/lib/utils"
import { SENTIMENT_COLORS } from "@/lib/constants"

interface ArticleListItemProps {
  res: UrlSummaryResult
  isSelected: boolean
  onClick: () => void
}

export const ArticleListItem = ({ res, isSelected, onClick }: ArticleListItemProps) => {
  const title = getArticleTitle(res.url)

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-primary border-l-4 bg-muted shadow-sm"
          : "border-border/60 hover:bg-muted/40 bg-card hover:border-border"
      } ${!res.success ? "bg-destructive/5 border-destructive/10 dark:bg-destructive/10" : ""}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
          {title}
        </h4>
        {!res.success && (
          <span className="text-[9px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded font-bold shrink-0 uppercase tracking-wide">
            Gagal
          </span>
        )}
      </div>

      <span className="text-[11px] text-muted-foreground truncate max-w-full block">
        {res.url}
      </span>

      {res.success && res.data && (
        <>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-background font-medium">
              {res.data.category}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                SENTIMENT_COLORS[res.data.sentiment] || ""
              }`}
            >
              {res.data.sentiment}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              ~{res.data.readingTime} mnt
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1.5 pt-1.5 border-t border-dashed border-border/40">
            {res.data.summary}
          </p>
        </>
      )}

      {!res.success && (
        <p className="text-xs text-destructive/80 line-clamp-2 leading-relaxed mt-1.5 pt-1.5 border-t border-dashed border-destructive/10">
          {res.error || "Gagal memproses URL"}
        </p>
      )}
    </div>
  )
}
