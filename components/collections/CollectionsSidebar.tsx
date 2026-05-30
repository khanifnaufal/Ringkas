"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SignInButton } from "@clerk/nextjs"
import { useConvexAuth } from "convex/react"
import {
  Folder,
  FolderOpen,
  Lock,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
  Type,
  Inbox,
  Sparkles,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
  onNewSummary: () => void
  activeSummaryId?: string
}

export function CollectionsSidebar({
  onSelectSummary,
  onNewSummary,
  activeSummaryId
}: CollectionsSidebarProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const collections = useQuery(api.collections.list)
  const createCollection = useMutation(api.collections.create)
  const removeCollection = useMutation(api.collections.remove)

  // Creation State
  const [isCreating, setIsCreating] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("📁")
  const [createLoading, setCreateLoading] = useState(false)

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
      setNewColName("")
      setIsCreating(false)
    } catch (err) {
      console.error("Gagal membuat koleksi:", err)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleRemoveCollection = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (confirm(`Apakah Anda yakin ingin menghapus koleksi "${name}"? Semua ringkasan di dalamnya juga akan dihapus.`)) {
      try {
        await removeCollection({ id: id as any })
      } catch (err) {
        console.error("Gagal menghapus koleksi:", err)
      }
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
          <SignInButton mode="modal">
            <Button size="sm" className="font-medium shadow-md w-full max-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
              Masuk Sekarang
            </Button>
          </SignInButton>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSummary}
          title="Tulis Ringkasan Baru"
          className="h-7 w-7 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* New Summary CTA */}
      <Button
        onClick={onNewSummary}
        className="w-full mt-3 justify-start font-medium text-xs h-9 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-none transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ringkas Baru
      </Button>

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
              activeSummaryId={activeSummaryId}
            />
          ))
        )}
      </div>
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
  activeSummaryId
}: FolderItemProps) {
  // Query summaries inside this folder
  const summaries = useQuery(
    api.summaries.listByCollection,
    collectionId === "uncategorized" ? {} : { collectionId: collectionId as any }
  )
  const removeSummary = useMutation(api.summaries.remove)

  const handleDeleteSummary = async (e: React.MouseEvent, summaryId: string, title: string) => {
    e.stopPropagation()
    if (confirm(`Apakah Anda yakin ingin menghapus ringkasan "${title}"?`)) {
      try {
        await removeSummary({ id: summaryId as any })
      } catch (err) {
        console.error("Gagal menghapus ringkasan:", err)
      }
    }
  }

  const count = summaries ? summaries.length : 0

  return (
    <div className="flex flex-col">
      {/* Folder Header Row */}
      <div
        onClick={onToggle}
        className={`group flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
          isExpanded ? "bg-muted/50 text-foreground" : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
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
              <Loader2 className="w-3 h-3 animate-spin" />
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
                  className={`group/item flex items-center justify-between p-1.5 rounded-md text-[11px] cursor-pointer transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary font-medium border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
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
