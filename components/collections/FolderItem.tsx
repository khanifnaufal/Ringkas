"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  FileText,
  Type,
  GripVertical,
  Loader2,
} from "lucide-react"

export interface Summary {
  _id: string
  originalText: string
  summary: string
  keyPoints: string[]
  category: string
  sentiment: string
  readingTime: number
  pdfMeta?: {
    filename: string
    pages: number
    chars: number
  }
}

export interface FolderItemProps {
  collectionId: string
  name: string
  emoji: string
  isExpanded: boolean
  onToggle: () => void
  onDelete?: (e: React.MouseEvent) => void
  onSelectSummary: (summary: Summary) => void
  onDeleteSummary: (id: string, name: string) => void
  onMoveSummary: (summaryId: string, targetCollectionId: string) => void
  activeSummaryId?: string
}

export function FolderItem({
  collectionId,
  name,
  emoji,
  isExpanded,
  onToggle,
  onDelete,
  onSelectSummary,
  onDeleteSummary,
  onMoveSummary,
  activeSummaryId,
}: FolderItemProps) {
  // Query summaries inside this folder
  const summaries = useQuery(
    api.summaries.listByCollection,
    collectionId === "uncategorized" ? {} : { collectionId: collectionId as any }
  )

  const [dragCounter, setDragCounter] = useState(0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter((prev) => prev + 1)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter((prev) => Math.max(0, prev - 1))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(0)
    const summaryId = e.dataTransfer.getData("text/plain")
    if (summaryId) {
      onMoveSummary(summaryId, collectionId)
    }
  }

  const handleDeleteSummary = (e: React.MouseEvent, summaryId: string, title: string) => {
    e.stopPropagation()
    onDeleteSummary(summaryId, title)
  }

  const count = summaries ? summaries.length : 0
  const isDragOver = dragCounter > 0

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col"
    >
      {/* Folder Header Row */}
      <div
        onClick={onToggle}
        className={`group flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
          isDragOver
            ? "bg-primary/20 border border-dashed border-primary/50 text-primary animate-pulse"
            : isExpanded
            ? "bg-muted/50 text-foreground"
            : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 transition-transform">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
          <span className="shrink-0 text-sm">{emoji}</span>
          <span className="truncate font-medium">{name}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-muted rounded-full text-muted-foreground group-hover:bg-background shrink-0 font-normal">
            {count}
          </span>
        </div>

        {/* Delete Folder Button (only for user collections) */}
        {onDelete && (
          <button
            onClick={onDelete}
            title="Hapus Koleksi"
            className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded hover:bg-muted text-muted-foreground/50 transition-all shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expanded Summaries List */}
      {isExpanded && (
        <div className="pl-6 pr-1 py-1 space-y-1 border-l border-border/50 ml-3.5 mt-0.5 animate-in fade-in duration-200">
          {!summaries ? (
            <div className="flex items-center gap-1.5 py-1.5 px-2 text-[10px] text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Memuat...
            </div>
          ) : count === 0 ? (
            <div className="py-2 px-2 text-[10px] text-muted-foreground/70 italic">
              Kosong
            </div>
          ) : (
            summaries.map((summary: any) => {
              const isPdf = !!summary.pdfMeta
              const title = summary.pdfMeta?.filename || summary.originalText.slice(0, 24) || "Ringkasan Teks"
              const isActive = activeSummaryId === summary._id

              return (
                <div
                  key={summary._id}
                  onClick={() => onSelectSummary(summary)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", summary._id)
                    e.dataTransfer.effectAllowed = "move"
                  }}
                  className={`group/item flex items-center justify-between p-1.5 rounded-md text-[11px] cursor-grab active:cursor-grabbing transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary font-medium border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing" />
                    <span className="shrink-0 text-muted-foreground/60">
                      {isPdf ? <FileText className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                    </span>
                    <span className="truncate" title={title}>
                      {title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSummary(e, summary._id, title)}
                    title="Hapus Ringkasan"
                    className="opacity-0 group-hover/item:opacity-100 hover:text-destructive p-0.5 rounded hover:bg-muted text-muted-foreground/50 transition-all shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
