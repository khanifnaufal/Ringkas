"use client"

import { useMemo, useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { SENTIMENT_COLORS } from "@/lib/constants"
import {
  Loader2,
  Lock,
  History,
  ArrowLeft,
  BookOpen,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  FolderOpen,
  FileText,
  Type,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { HistoryStats } from "./HistoryStats"
import { HistoryFilters, SortOption, TypeFilter } from "./HistoryFilters"
import { HistoryCard } from "./HistoryCard"

// ── Types ─────────────────────────────────────────────────────────────────────
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
  pdfMeta?: { filename: string; pages: number; chars: number }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTitleKey(item: HistoryItem): string {
  return item.pdfMeta?.filename ?? item.originalText.slice(0, 60)
}

function sortItems(items: HistoryItem[], sort: SortOption): HistoryItem[] {
  const copy = [...items]
  switch (sort) {
    case "newest":  return copy.sort((a, b) => b.createdAt - a.createdAt)
    case "oldest":  return copy.sort((a, b) => a.createdAt - b.createdAt)
    case "az":      return copy.sort((a, b) => getTitleKey(a).localeCompare(getTitleKey(b), "id"))
    case "za":      return copy.sort((a, b) => getTitleKey(b).localeCompare(getTitleKey(a), "id"))
    default:        return copy
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export function HistoryPage() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections  = useQuery(api.collections.list)
  const allSummaries = useQuery(api.summaries.listAll, {})
  const removeSummary = useMutation(api.summaries.remove)
  const router = useRouter()

  // ── Filter state ──────────────────────────────────────────────────────────
  const [sort,       setSort]       = useState<SortOption>("newest")
  const [search,     setSearch]     = useState("")
  const [category,   setCategory]   = useState("")
  const [sentiment,  setSentiment]  = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")

  // ── Detail Modal state ────────────────────────────────────────────────────
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Delete dialog ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const handleReset = useCallback(() => {
    setSort("newest"); setSearch(""); setCategory(""); setSentiment(""); setTypeFilter("all")
  }, [])

  // ── Derived: unique categories & sentiments from raw data ─────────────────
  const { uniqueCategories, uniqueSentiments } = useMemo(() => {
    if (!allSummaries) return { uniqueCategories: [], uniqueSentiments: [] }
    const cats = [...new Set(allSummaries.map(s => s.category))]
    const sents = [...new Set(allSummaries.map(s => s.sentiment))]
    return { uniqueCategories: cats, uniqueSentiments: sents }
  }, [allSummaries])

  // ── Derived: filtered + sorted list (client-side for search) ─────────────
  const filtered = useMemo(() => {
    if (!allSummaries) return []
    let items = allSummaries as HistoryItem[]

    if (category)                items = items.filter(s => s.category  === category)
    if (sentiment)               items = items.filter(s => s.sentiment === sentiment)
    if (typeFilter === "pdf")    items = items.filter(s => !!s.pdfMeta)
    if (typeFilter === "text")   items = items.filter(s => !s.pdfMeta)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(s =>
        s.summary.toLowerCase().includes(q) ||
        s.originalText.toLowerCase().includes(q) ||
        (s.pdfMeta?.filename ?? "").toLowerCase().includes(q)
      )
    }

    return sortItems(items, sort)
  }, [allSummaries, category, sentiment, typeFilter, search, sort])

  // ── Collection name lookup ────────────────────────────────────────────────
  const collectionMap = useMemo(() => {
    const m: Record<string, string> = {}
    collections?.forEach(c => { m[c._id] = `${c.emoji} ${c.name}` })
    return m
  }, [collections])

  // ── Open in home result panel ─────────────────────────────────────────────
  const handleOpen = useCallback((item: HistoryItem) => {
    // Store in sessionStorage so home page can pick it up
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ringkas_open_summary", JSON.stringify(item))
    }
    router.push("/")
  }, [router])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { id, title } = deleteTarget
    setDeleteTarget(null)
    try {
      await removeSummary({ id: id as any })
      toast.success(`Ringkasan "${title}" berhasil dihapus`)
      // Close preview modal if deleting currently opened item
      if (previewItem?._id === id) {
        setPreviewItem(null)
      }
    } catch (err) {
      toast.error(`Gagal menghapus: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
    }
  }

  // Handle open modal trigger
  const triggerPreview = useCallback((item: HistoryItem) => {
    setPreviewItem(item)
    setShowOriginal(false)
    setCopied(false)
  }, [])

  // ── States ────────────────────────────────────────────────────────────────
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold">History Terkunci</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Masuk terlebih dahulu untuk melihat semua ringkasan yang pernah kamu simpan.
        </p>
        <Button asChild size="sm" className="mt-2">
          <Link href="/sign-in">Masuk Sekarang</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !allSummaries) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Button asChild variant="ghost" size="icon" className="rounded-full shrink-0" id="history-back-btn">
          <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Riwayat Ringkasan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Semua ringkasan yang pernah kamu simpan, di satu tempat.
          </p>
        </div>
      </div>

      {/* Stats */}
      {allSummaries.length > 0 && (
        <HistoryStats
          summaries={allSummaries as HistoryItem[]}
          filtered={filtered}
        />
      )}

      {/* Filters */}
      {allSummaries.length > 0 && (
        <HistoryFilters
          sort={sort}             onSortChange={setSort}
          search={search}         onSearchChange={setSearch}
          category={category}     onCategoryChange={setCategory}
          sentiment={sentiment}   onSentimentChange={setSentiment}
          typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
          categories={uniqueCategories}
          sentiments={uniqueSentiments}
          resultCount={filtered.length}
          totalCount={allSummaries.length}
          onReset={handleReset}
        />
      )}

      {/* Grid or empty states */}
      {allSummaries.length === 0 ? (
        /* Never saved anything */
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/10 p-10">
          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
          <h3 className="font-semibold text-muted-foreground">Belum ada ringkasan tersimpan</h3>
          <p className="text-sm text-muted-foreground/70 max-w-xs leading-relaxed">
            Buat ringkasan pertamamu dan simpan ke koleksi. Semua ringkasan tersimpan akan muncul di sini.
          </p>
          <Button asChild size="sm" className="mt-2" id="history-goto-home">
            <Link href="/">Buat Ringkasan</Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        /* Saved items exist but filter returned nothing */
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/10 p-10">
          <BookOpen className="w-8 h-8 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Tidak ada hasil yang cocok</p>
          <p className="text-xs text-muted-foreground/60">Coba ubah kata kunci atau filter</p>
          <Button variant="ghost" size="sm" onClick={handleReset} className="mt-1 text-xs" id="history-reset-empty">
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <HistoryCard
              key={item._id}
              item={item as HistoryItem}
              collectionName={item.collectionId ? collectionMap[item.collectionId] : "📥 Tanpa Kategori"}
              onOpen={triggerPreview}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus ringkasan?</AlertDialogTitle>
            <AlertDialogDescription>
              "<strong>{deleteTarget?.title}</strong>" akan dihapus secara permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detailed Preview Dialog */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-2xl sm:max-w-3xl max-h-[85vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-1 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  previewItem.pdfMeta ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                }`}>
                  {previewItem.pdfMeta ? <FileText className="w-5 h-5" /> : <Type className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug break-words">
                    {previewItem.pdfMeta?.filename ?? previewItem.originalText.slice(0, 80) + (previewItem.originalText.length > 80 ? "…" : "")}
                  </h2>
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[10px] capitalize px-2 py-0.5">
                      {previewItem.category}
                    </Badge>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      SENTIMENT_COLORS[previewItem.sentiment as keyof typeof SENTIMENT_COLORS] ?? "bg-gray-100 text-gray-700"
                    }`}>
                      {previewItem.sentiment}
                    </span>
                    {previewItem.pdfMeta && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium">
                        {previewItem.pdfMeta.pages} Halaman
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{previewItem.readingTime} mnt
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-4 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {/* Summary */}
              <div>
                <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Ringkasan</h3>
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 text-sm leading-relaxed text-foreground select-text whitespace-pre-wrap">
                  {previewItem.summary}
                </div>
              </div>

              {/* Key points */}
              {previewItem.keyPoints && previewItem.keyPoints.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Poin-poin Penting</h3>
                  <ul className="space-y-2">
                    {previewItem.keyPoints.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground select-text">
                        <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Original Text Collapsible */}
              <div className="pt-2 border-t border-border/40">
                <button
                  onClick={() => setShowOriginal(p => !p)}
                  className="flex items-center justify-between w-full py-2 text-xs uppercase font-bold text-muted-foreground hover:text-foreground tracking-wider transition-colors cursor-pointer"
                >
                  <span>Teks Asli</span>
                  {showOriginal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showOriginal && (
                  <div className="mt-2 max-h-48 overflow-y-auto p-3 text-xs bg-muted/40 border border-border/40 rounded-lg text-muted-foreground font-sans whitespace-pre-wrap select-text leading-relaxed">
                    {previewItem.originalText || "Teks asli tidak tersedia."}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-border/60 bg-muted/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Disimpan pada {new Date(previewItem.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Delete in details */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget({ id: previewItem._id, title: previewItem.pdfMeta?.filename ?? previewItem.originalText.slice(0, 40) })}
                  className="text-xs h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </Button>

                {/* Copy */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const textToCopy = [
                        previewItem.summary,
                        "",
                        "Poin Penting:",
                        ...previewItem.keyPoints.map(p => `• ${p}`)
                      ].join("\n")
                      await navigator.clipboard.writeText(textToCopy)
                      setCopied(true)
                      toast.success("Ringkasan disalin ke clipboard")
                      setTimeout(() => setCopied(false), 2000)
                    } catch {
                      toast.error("Gagal menyalin ringkasan")
                    }
                  }}
                  className="flex-1 sm:flex-initial text-xs h-9 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copied ? "Copied" : "Salin Teks"}
                </Button>

                {/* Open in main dashboard */}
                <Button
                  size="sm"
                  onClick={() => {
                    setPreviewItem(null)
                    handleOpen(previewItem)
                  }}
                  className="flex-1 sm:flex-initial text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
