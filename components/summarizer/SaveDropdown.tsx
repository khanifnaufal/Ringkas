"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useConvexAuth, useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bookmark, Check, Loader2, Inbox, Lock } from "lucide-react"
import { SummaryResult } from "@/types/summary"

interface SaveDropdownProps {
  data: SummaryResult & { _id?: string; collectionId?: string; originalText?: string }
}

export function SaveDropdown({ data }: SaveDropdownProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections = useQuery(api.collections.list)
  const saveSummary = useMutation(api.summaries.save)
  const moveSummary = useMutation(api.summaries.move)

  const isFromCollection = !!data._id
  const [savedId, setSavedId] = useState<string | null>(null)
  const [localSavedCollectionId, setLocalSavedCollectionId] = useState<string | null | undefined>(undefined)
  const [saveLoading, setSaveLoading] = useState(false)

  // Reset local state when data changes
  useEffect(() => {
    setSavedId(null)
    setLocalSavedCollectionId(undefined)
  }, [data.summary])

  const summaryId = data._id || savedId
  const isSaved = !!summaryId

  const currentCollectionId = localSavedCollectionId !== undefined
    ? localSavedCollectionId
    : data.collectionId

  const currentCollection = collections?.find(c => c._id === currentCollectionId)
  const folderName = currentCollectionId === "uncategorized" || !currentCollectionId
    ? "Tanpa Kategori"
    : currentCollection?.name || "Folder"

  const handleSave = async (colId: string) => {
    setSaveLoading(true)
    const targetCollection = collections?.find(c => c._id === colId)
    const targetFolderName = colId === "uncategorized"
      ? "Tanpa Kategori"
      : targetCollection?.name || "Folder"

    try {
      const selectedColId = colId === "uncategorized" ? undefined : (colId as any)

      if (isSaved && summaryId) {
        // Move existing summary
        await moveSummary({
          id: summaryId as any,
          collectionId: selectedColId,
        })
        setLocalSavedCollectionId(colId)
        toast.success(`Ringkasan dipindahkan ke "${targetFolderName}"`)
      } else {
        // Save new summary
        const newId = await saveSummary({
          collectionId: selectedColId,
          originalText: data.originalText || "",
          summary: data.summary,
          keyPoints: data.keyPoints,
          category: data.category,
          sentiment: data.sentiment,
          readingTime: data.readingTime,
          pdfMeta: data.pdfMeta,
        })
        setSavedId(newId)
        setLocalSavedCollectionId(colId)
        toast.success(`Ringkasan berhasil disimpan ke "${targetFolderName}"`)
      }
    } catch (err) {
      toast.error(`Gagal menyimpan: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
      console.error("Gagal menyimpan ringkasan:", err)
    } finally {
      setSaveLoading(false)
    }
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="flex-1 text-xs transition-all hover:bg-muted cursor-pointer"
      >
        <Link href="/sign-in">
          <Lock className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/75" />
          Simpan
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isSaved ? "secondary" : "outline"}
          size="sm"
          disabled={saveLoading || isLoading}
          className={`flex-1 text-xs transition-all truncate cursor-pointer ${
            isSaved
              ? "border border-teal-500/20 bg-teal-500/10 text-teal-800 dark:text-teal-400 hover:bg-teal-500/20"
              : ""
          }`}
        >
          {saveLoading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin shrink-0" />
          ) : isSaved ? (
            <Check className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400 shrink-0" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/75 shrink-0" />
          )}
          <span className="truncate">
            {isSaved ? folderName : "Simpan"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-muted-foreground">
          {isSaved ? "Pindahkan ke" : "Simpan ke"}
        </div>
        <DropdownMenuItem
          onClick={() => handleSave("uncategorized")}
          className={`cursor-pointer text-xs ${
            currentCollectionId === "uncategorized" || !currentCollectionId ? "bg-muted font-medium" : ""
          }`}
        >
          <Inbox className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          Tanpa Kategori
        </DropdownMenuItem>
        {collections && collections.length > 0 && (
          <>
            <div className="h-px bg-border my-1" />
            {collections.map((col) => (
              <DropdownMenuItem
                key={col._id}
                onClick={() => handleSave(col._id)}
                className={`cursor-pointer text-xs ${currentCollectionId === col._id ? "bg-muted font-medium" : ""}`}
              >
                <span className="mr-2 text-sm shrink-0">{col.emoji}</span>
                <span className="truncate">{col.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
