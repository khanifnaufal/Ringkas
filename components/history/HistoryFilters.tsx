"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Search, X, ArrowUpDown, Tag, FileText, Smile } from "lucide-react"

export type SortOption = "newest" | "oldest" | "az" | "za"
export type TypeFilter = "all" | "pdf" | "text"

interface HistoryFiltersProps {
  sort: SortOption
  onSortChange: (v: SortOption) => void
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  sentiment: string
  onSentimentChange: (v: string) => void
  typeFilter: TypeFilter
  onTypeFilterChange: (v: TypeFilter) => void
  categories: string[]     // daftar kategori dinamis
  sentiments: string[]     // daftar sentimen dinamis
  resultCount: number
  totalCount: number
  onReset: () => void
}

export function HistoryFilters({
  sort, onSortChange,
  search, onSearchChange,
  category, onCategoryChange,
  sentiment, onSentimentChange,
  typeFilter, onTypeFilterChange,
  categories, sentiments,
  resultCount, totalCount,
  onReset,
}: HistoryFiltersProps) {
  // Debounce pencarian lokal
  const [localSearch, setLocalSearch] = useState(search)
  useEffect(() => {
    const id = setTimeout(() => onSearchChange(localSearch), 300)
    return () => clearTimeout(id)
  }, [localSearch, onSearchChange])

  const hasActiveFilter =
    search !== "" ||
    category !== "" ||
    sentiment !== "" ||
    typeFilter !== "all" ||
    sort !== "newest"

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value)
  }

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortOption)
  }

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onCategoryChange(val === "all" ? "" : val)
  }

  const handleSentimentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onSentimentChange(val === "all" ? "" : val)
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            id="history-search"
            type="text"
            placeholder="Cari judul atau isi ringkasan..."
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-8 h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onSearchChange("") }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            id="history-sort"
            value={sort}
            onChange={handleSortChange}
            className="h-9 rounded-md border border-border bg-background px-2.5 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/50 transition-colors w-[150px]"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      {/* Row 2: Category + Sentiment + Type buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              id="history-category"
              value={category || "all"}
              onChange={handleCategoryChange}
              className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/50 transition-colors w-[130px] capitalize"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sentiment filter */}
        {sentiments.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              id="history-sentiment"
              value={sentiment || "all"}
              onChange={handleSentimentChange}
              className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/50 transition-colors w-[130px] capitalize"
            >
              <option value="all">Semua Sentimen</option>
              {sentiments.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Type toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-muted/30">
          {(["all", "text", "pdf"] as TypeFilter[]).map(t => (
            <button
              key={t}
              id={`history-type-${t}`}
              onClick={() => onTypeFilterChange(t)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                typeFilter === t
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "pdf" && <FileText className="w-3 h-3" />}
              {t === "all" ? "Semua" : t === "pdf" ? "PDF" : "Teks"}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasActiveFilter && (
          <Button
            id="history-reset-filters"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            Reset
          </Button>
        )}

        {/* Result count */}
        <span className={`text-xs text-muted-foreground ${hasActiveFilter ? "" : "ml-auto"}`}>
          {resultCount !== totalCount
            ? <><span className="font-medium text-foreground">{resultCount}</span> dari {totalCount} ringkasan</>
            : <><span className="font-medium text-foreground">{totalCount}</span> ringkasan</>
          }
        </span>
      </div>
    </div>
  )
}
