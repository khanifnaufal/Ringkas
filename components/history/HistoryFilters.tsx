"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, X, ArrowUpDown, Tag, FileText, Smile } from "lucide-react"
import { CustomSelect } from "./CustomSelect"

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

// ── MAIN FILTER COMPONENT ────────────────────────────────────────────────────
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

  // Options lists mapping
  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "az", label: "A → Z" },
    { value: "za", label: "Z → A" },
  ]

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map(c => ({ value: c, label: c })),
  ]

  const sentimentOptions = [
    { value: "all", label: "Semua Sentimen" },
    ...sentiments.map(s => ({ value: s, label: s })),
  ]

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
            onChange={e => setLocalSearch(e.target.value)}
            className="pl-8 h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onSearchChange("") }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <CustomSelect
            value={sort}
            onChange={v => onSortChange(v as SortOption)}
            options={sortOptions}
            widthClass="w-[140px]"
          />
        </div>
      </div>

      {/* Row 2: Category + Sentiment + Type buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <CustomSelect
              value={category || "all"}
              onChange={v => onCategoryChange(v === "all" ? "" : v)}
              options={categoryOptions}
              widthClass="w-[140px]"
              placeholder="Kategori"
            />
          </div>
        )}

        {/* Sentiment filter */}
        {sentiments.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <CustomSelect
              value={sentiment || "all"}
              onChange={v => onSentimentChange(v === "all" ? "" : v)}
              options={sentimentOptions}
              widthClass="w-[140px]"
              placeholder="Sentimen"
            />
          </div>
        )}

        {/* Type toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-muted/30">
          {(["all", "text", "pdf"] as TypeFilter[]).map(t => (
            <button
              key={t}
              id={`history-type-${t}`}
              onClick={() => onTypeFilterChange(t)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                typeFilter === t
                  ? "bg-background text-foreground shadow-xs border border-border"
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
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto cursor-pointer"
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
