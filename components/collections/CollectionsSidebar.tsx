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
  Inbox,
  Layers,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { FolderItem } from "./FolderItem"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
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
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function CollectionsSidebar({
  onSelectSummary,
  activeSummaryId,
  isCollapsed = false,
  onToggleCollapse
}: CollectionsSidebarProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections = useQuery(api.collections.list)
  const createCollection = useMutation(api.collections.create)
  const removeCollection = useMutation(api.collections.remove)
  const removeSummary = useMutation(api.summaries.remove)
  const moveSummary = useMutation(api.summaries.move)

  // Fetch all summaries for counts when authenticated
  const allSummaries = useQuery(
    api.summaries.listAll,
    isAuthenticated ? {} : "skip"
  )

  const uncategorizedCount = allSummaries
    ? allSummaries.filter((s: any) => !s.collectionId).length
    : 0

  const getCollectionCount = (collectionId: string) => {
    return allSummaries
      ? allSummaries.filter((s: any) => s.collectionId === collectionId).length
      : 0
  }

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
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative border border-border/50 rounded-2xl bg-card/40 backdrop-blur-md flex flex-col h-[450px] lg:h-[calc(100vh-12rem)] justify-between overflow-hidden shadow-inner w-full ${
          isCollapsed ? "py-6 px-2 items-center" : "p-6"
        }`}
      >
        {/* Blurred decorative background elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed-locked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-between h-full w-full z-10"
            >
              {/* Toggle Button */}
              <div className="w-full flex justify-center pb-3 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Buka Koleksi"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Lock Overlay Icon */}
              <div className="flex-1 flex flex-col items-center justify-center my-auto">
                <button
                  onClick={onToggleCollapse}
                  title="Fitur Koleksi Terkunci (Klik untuk masuk)"
                  className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:scale-105 transition-all shadow-md"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[10px] text-center text-muted-foreground/40 rotate-90 my-6 whitespace-nowrap select-none">
                Ringkas © 2026
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-locked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-between h-full w-full z-10"
            >
              {/* Toggle Button */}
              {onToggleCollapse && (
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Sembunyikan Koleksi"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}

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
              <div className="flex flex-col items-center justify-center text-center px-4 py-8 my-auto">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── 2. LOADING STATE ──────────────────────────────────────────────────────
  if (isLoading || !collections) {
    return (
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`border border-border/50 rounded-2xl bg-card flex flex-col justify-center items-center h-[350px] lg:h-[calc(100vh-12rem)] w-full ${
          isCollapsed ? "py-6 px-2 gap-4" : "p-6"
        }`}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        {!isCollapsed && (
          <span className="text-xs text-muted-foreground animate-pulse">Memuat koleksi...</span>
        )}
      </motion.div>
    )
  }

  // ── 3. UNLOCKED STATE (SUDAH LOGIN) ───────────────────────────────────────
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`border border-border/50 rounded-2xl bg-card flex flex-col h-[450px] lg:h-[calc(100vh-12rem)] w-full shadow-sm overflow-hidden ${
        isCollapsed ? "py-5 px-2 items-center" : "p-5"
      }`}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed-unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center w-full h-full"
          >
            {/* Toggle Button */}
            <div className="w-full flex justify-center pb-3 border-b border-border/60">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Buka Koleksi"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Create new collection trigger button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCreating(true)
                onToggleCollapse?.()
              }}
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted mt-2 shrink-0"
              title="Koleksi Baru..."
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* Emojis Folder List (Scrollable) */}
            <div className="flex-1 w-full overflow-y-auto mt-4 px-2 py-1 flex flex-col items-center gap-3 scrollbar-none">
              {/* Uncategorized Folder */}
              <button
                onClick={() => {
                  setExpandedFolders(prev => ({ ...prev, uncategorized: true }))
                  onToggleCollapse?.()
                }}
                className="group relative w-10 h-10 rounded-xl bg-muted/40 hover:bg-primary/10 border border-transparent hover:border-primary/20 flex items-center justify-center text-sm transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                title={`Tanpa Kategori (${uncategorizedCount} ringkasan)`}
              >
                📥
                {uncategorizedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full font-bold border border-background flex items-center justify-center shadow-sm">
                    {uncategorizedCount}
                  </span>
                )}
              </button>

              {/* User Folders */}
              {collections?.map(col => {
                const count = getCollectionCount(col._id)
                return (
                  <button
                    key={col._id}
                    onClick={() => {
                      setExpandedFolders(prev => ({ ...prev, [col._id]: true }))
                      onToggleCollapse?.()
                    }}
                    className="group relative w-10 h-10 rounded-xl bg-muted/45 hover:bg-primary/10 border border-transparent hover:border-primary/20 flex items-center justify-center text-sm transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                    title={`${col.name} (${count} ringkasan)`}
                  >
                    {col.emoji}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full font-bold border border-background flex items-center justify-center shadow-sm">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full h-full"
          >
            {/* Sidebar Header & Create Action */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm tracking-tight text-foreground">Koleksi Saya</span>
              </div>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Sembunyikan Koleksi"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
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
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}
