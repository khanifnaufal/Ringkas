"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SummaryResult } from "@/types/summary"
import { SENTIMENT_COLORS } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Share2,
  Copy,
  FileText,
  Bookmark,
  Check,
  Lock,
  Inbox,
  Loader2,
  FolderOpen
} from "lucide-react"
import { useTypewriter } from "@/hooks/useTypewriter"
import { useConvexAuth, useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ResultCardProps {
  data: SummaryResult & { _id?: string; collectionId?: string; originalText?: string }
  className?: string
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.46.93-4.12 2.73-.39.27-.74.4-1.06.39-.35-.01-1.02-.2-1.52-.36-.61-.2-1.09-.31-1.05-.66.02-.18.27-.37.75-.56 2.94-1.28 4.9-2.12 5.88-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.11.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
  </svg>
)

export function ResultCard({ data, className }: ResultCardProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections = useQuery(api.collections.list)
  const saveSummary = useMutation(api.summaries.save)
  const moveSummary = useMutation(api.summaries.move)

  const isFromCollection = !!data._id
  const { displayed: typedText, isDone: typewriteDone } = useTypewriter(data.summary, { speed: 14 })

  const displayed = isFromCollection ? data.summary : typedText
  const isDone = isFromCollection ? true : typewriteDone

  const [copied, setCopied] = useState(false)
  const [revealCount, setRevealCount] = useState(isFromCollection ? data.keyPoints.length : 0)

  // Saving states
  const [savedId, setSavedId] = useState<string | null>(null)
  const [localSavedCollectionId, setLocalSavedCollectionId] = useState<string | null | undefined>(undefined)
  const [saveLoading, setSaveLoading] = useState(false)

  // Reset key-point reveal counter and save states whenever new data arrives
  useEffect(() => {
    setRevealCount(isFromCollection ? data.keyPoints.length : 0)
    setSavedId(null)
    setLocalSavedCollectionId(undefined)
  }, [data.summary, isFromCollection, data.keyPoints.length])

  // Stagger-reveal key points one by one after typewriter finishes (only if not from collection)
  useEffect(() => {
    if (isFromCollection || !isDone) return
    const timers = data.keyPoints.map((_, i) =>
      setTimeout(() => setRevealCount(i + 1), i * 160)
    )
    return () => timers.forEach(clearTimeout)
  }, [isDone, data.keyPoints, isFromCollection])

  const isFullyRevealed = isDone && revealCount >= data.keyPoints.length

  const textToShare = [
    data.summary,
    "",
    "Key points:",
    ...data.keyPoints.map((p) => `• ${p}`),
  ].join("\n")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToShare)
      setCopied(true)
      toast.success("Rangkuman berhasil disalin ke clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      toast.error("Gagal menyalin rangkuman.")
    }
  }


  function handleShare(platform: string) {
    const encodedText = encodeURIComponent(textToShare)
    const currentUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""
    let url = ""
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`
        break
      case "telegram":
        url = `https://t.me/share/url?url=${currentUrl}&text=${encodedText}`
        break
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

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
            onClick={handleCopy}
            className="flex-1 text-xs transition-all px-2.5"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/80" />
            {copied ? "Copied!" : "Copy"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-xs transition-all">
                <Share2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/80" />
                Share
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  Bagikan Rangkuman
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left">
                  Pilih platform untuk membagikan ringkasan teks ini atau salin langsung ke clipboard Anda.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-3 py-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center justify-start gap-2 h-10 w-full hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                  className="flex items-center justify-start gap-2 h-10 w-full hover:bg-foreground/10 hover:border-foreground/30 hover:text-foreground"
                >
                  <XIcon />
                  Twitter / X
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("telegram")}
                  className="flex items-center justify-start gap-2 h-10 w-full hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  <TelegramIcon />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center justify-start gap-2 h-10 w-full hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  <Copy className="w-4 h-4 text-muted-foreground/85" />
                  Salin Teks
                </Button>
              </div>
              <AlertDialogFooter className="sm:justify-end mt-2">
                <AlertDialogCancel>Tutup</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* ── Save to Collection Button ──────────────────────────────────── */}
          {!isLoading && !isAuthenticated ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 text-xs transition-all hover:bg-muted"
            >
              <Link href="/sign-in">
                <Lock className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground/75" />
                Simpan
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSaved ? "secondary" : "outline"}
                  size="sm"
                  disabled={saveLoading || isLoading}
                  className={`flex-1 text-xs transition-all truncate ${isSaved
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
                  className={`cursor-pointer text-xs ${currentCollectionId === "uncategorized" || !currentCollectionId ? "bg-muted font-medium" : ""}`}
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
          )}
        </div>
      )}
    </div>
  )
}
