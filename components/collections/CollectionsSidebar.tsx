"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { useConvexAuth } from "convex/react"
import {
  Folder,
  Lock,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
  Type,
  Inbox,
  Layers,
  GripVertical
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
import { toast } from "sonner"

const EMOJIS = ["📚", "🎓", "💼", "🔬", "📰", "💡", "💻", "🎯", "✍️", "📁"]

interface Summary {
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

interface CollectionsSidebarProps {
  onSelectSummary: (summary: Summary) => void
  activeSummaryId?: string
}

export function CollectionsSidebar({
  onSelectSummary,
  activeSummaryId
}: CollectionsSidebarProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections = useQuery(api.collections.list)
  const createCollection = useMutation(api.collections.create)
  const removeCollection = useMutation(api.collections.remove)
  const removeSummary = useMutation(api.summaries.remove)
  const moveSummary = useMutation(api.summaries.move)

  // Creation State
  const [isCreating, setIsCreating] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("📁")
  const [createLoading, setCreateLoading] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "collection" | "summary"
    id: string
    name: string
  } | null>(null)

  // Expanded folders state (record of collectionId -> boolean)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    uncategorized: false
  })

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return

    setCreateLoading(true)
    try {
      await createCollection({
        name: newColName.trim(),
        emoji: selectedEmoji
      })
      toast.success(`Koleksi "${newColName.trim()}" berhasil dibuat`)
      setNewColName("")
      setIsCreating(false)
    } catch (err) {
      console.error("Gagal membuat koleksi:", err)
      toast.error(`Gagal membuat koleksi: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleRemoveCollection = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setDeleteTarget({ type: "collection", id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { type, id, name } = deleteTarget
    setDeleteTarget(null)

    try {
      if (type === "collection") {
        await removeCollection({ id: id as any })
        toast.success(`Koleksi "${name}" berhasil dihapus beserta semua ringkasannya`)
      } else {
        await removeSummary({ id: id as any })
        toast.success(`Ringkasan "${name}" berhasil dihapus`)
      }
    } catch (err) {
      toast.error(`Gagal menghapus: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
    }
  }

  const handleMoveSummary = async (summaryId: string, targetCollectionId: string) => {
    const selectedColId = targetCollectionId === "uncategorized" ? undefined : (targetCollectionId as any)

    const targetCollection = collections?.find(c => c._id === targetCollectionId)
    const targetFolderName = targetCollectionId === "uncategorized"
      ? "Tanpa Kategori"
      : targetCollection?.name || "Folder"

    try {
      await moveSummary({
        id: summaryId as any,
        collectionId: selectedColId,
      })
      toast.success(`Ringkasan dipindahkan ke "${targetFolderName}"`)
    } catch (err) {
      toast.error(`Gagal memindahkan: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`)
      console.error("Gagal memindahkan ringkasan:", err)
    }
  }

  // ── 1. LOBBY/LOCKED STATE (BELUM LOGIN) ───────────────────────────────────
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="relative border border-border/50 rounded-2xl bg-card/40 backdrop-blur-md p-6 flex flex-col min-h-[450px] lg:h-[calc(100vh-12rem)] justify-between overflow-hidden shadow-inner w-full">
        {/* Blurred decorative background elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Faux Collections List */}
        <div className="opacity-15 space-y-4 select-none pointer-events-none w-full">
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <span className="font-semibold text-xs tracking-wider uppercase">Koleksi Saya</span>
            <div className="w-5 h-5 bg-foreground rounded" />
          </div>
          <div className="space-y-2">
            {[
              { label: "Riset Kuliah", emoji: "📚" },
              { label: "Pekerjaan Kantor", emoji: "💼" },
              { label: "Artikel Menarik", emoji: "📰" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/60">
                <span>{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lock Overlay */}
        <div className="flex flex-col items-center justify-center text-center px-4 py-8 z-10 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary animate-pulse shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Fitur Koleksi Terkunci</h3>
          <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed mb-5">
            Masuk untuk menyimpan ringkasan Anda secara permanen dan mengaturnya ke dalam berbagai kategori.
          </p>
          <Button asChild size="sm" className="font-medium shadow-md w-full max-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
            <Link href="/sign-in">Masuk Sekarang</Link>
          </Button>
        </div>

        <div className="text-[10px] text-center text-muted-foreground/60">
          Ringkas © 2026
        </div>
      </div>
    )
  }

  // ── 2. LOADING STATE ──────────────────────────────────────────────────────
  if (isLoading || !collections) {
    return (
      <div className="border border-border/50 rounded-2xl bg-card p-6 flex flex-col justify-center items-center h-[350px] lg:h-[calc(100vh-12rem)] w-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <span className="text-xs text-muted-foreground">Memuat koleksi...</span>
      </div>
    )
  }

  // ── 3. UNLOCKED STATE (SUDAH LOGIN) ───────────────────────────────────────
  return (
    <div className="border border-border/50 rounded-2xl bg-card p-5 flex flex-col h-[450px] lg:h-[calc(100vh-12rem)] w-full shadow-sm">
      {/* Sidebar Header & Create Action */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm tracking-tight text-foreground">Koleksi Saya</span>
        </div>
      </div>

      {/* Inline Form to Create Collection */}
      {isCreating ? (
        <form onSubmit={handleCreateCollection} className="mt-3 p-3 border border-primary/20 rounded-xl bg-muted/20 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Nama Koleksi</label>
            <input
              type="text"
              required
              placeholder="Contoh: Skripsi, Riset AI..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Pilih Ikon</label>
            <div className="grid grid-cols-5 gap-1">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                    selectedEmoji === emoji ? "bg-primary/20 border border-primary/40" : "hover:bg-muted"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(false)}
              className="h-7 px-2.5 text-[11px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createLoading || !newColName.trim()}
              className="h-7 px-2.5 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Buat"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground text-xs h-8"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Koleksi Baru...
        </Button>
      )}

      {/* Folders List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1.5 scrollbar-thin">
        {/* ── Uncategorized Collection ──────────────────────────────────────── */}
        <FolderItem
          collectionId="uncategorized"
          name="Tanpa Kategori"
          emoji="📥"
          isExpanded={!!expandedFolders.uncategorized}
          onToggle={() => toggleFolder("uncategorized")}
          onSelectSummary={onSelectSummary}
          onDeleteSummary={(id, name) => setDeleteTarget({ type: "summary", id, name })}
          onMoveSummary={handleMoveSummary}
          activeSummaryId={activeSummaryId}
        />

        {/* ── User Collections ─────────────────────────────────────────────── */}
        {collections.length === 0 ? (
          <div className="py-8 px-4 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/5 mt-2">
            <Folder className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground">Belum ada folder koleksi.</p>
          </div>
        ) : (
          collections.map(col => (
            <FolderItem
              key={col._id}
              collectionId={col._id}
              name={col.name}
              emoji={col.emoji}
              isExpanded={!!expandedFolders[col._id]}
              onToggle={() => toggleFolder(col._id)}
              onDelete={(e) => handleRemoveCollection(e, col._id, col.name)}
              onSelectSummary={onSelectSummary}
              onDeleteSummary={(id, name) => setDeleteTarget({ type: "summary", id, name })}
              onMoveSummary={handleMoveSummary}
              activeSummaryId={activeSummaryId}
            />
          ))
        )}
      </div>

      {/* ── Confirmation AlertDialog ────────────────────────────────────── */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data?</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang sudah dihapus tidak dapat dikembalikan.
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
    </div>
  )
}

// ── SUB-COMPONENT: FOLDER ITEM ──────────────────────────────────────────────
interface FolderItemProps {
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

function FolderItem({
  collectionId,
  name,
  emoji,
  isExpanded,
  onToggle,
  onDelete,
  onSelectSummary,
  onDeleteSummary,
  onMoveSummary,
  activeSummaryId
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
    setDragCounter(prev => prev + 1)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => Math.max(0, prev - 1))
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
            className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded hover:bg-muted text-muted-foreground/50 transition-all shrink-0"
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
                    className="opacity-0 group-hover/item:opacity-100 hover:text-destructive p-0.5 rounded hover:bg-muted text-muted-foreground/50 transition-all shrink-0"
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
