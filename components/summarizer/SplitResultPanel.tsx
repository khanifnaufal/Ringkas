"use client"

import React from "react"
import { UrlSummaryResult } from "@/types/summary"
import { Button } from "@/components/ui/button"
import { ArticleListItem } from "./ArticleListItem"
import { ResultCard } from "./ResultCard"
import { getArticleTitle } from "@/lib/utils"
import { Plus, ArrowLeft, ExternalLink, AlertTriangle, BookOpen, Sparkles, BarChart2 } from "lucide-react"
import { SENTIMENT_COLORS } from "@/lib/constants"
import { motion } from "motion/react"

interface SplitResultPanelProps {
  urlResults: UrlSummaryResult[]
  selectedUrl: string | null
  setSelectedUrl: (url: string | null) => void
  activeTab: "list" | "detail" | "compare"
  setActiveTab: (tab: "list" | "detail" | "compare") => void
  successCount: number
  failCount: number
  selectedResult: UrlSummaryResult | null
  onNewSummary: () => void
}

export const SplitResultPanel = ({
  urlResults,
  selectedUrl,
  setSelectedUrl,
  activeTab,
  setActiveTab,
  successCount,
  failCount,
  selectedResult,
  onNewSummary,
}: SplitResultPanelProps) => {
  const successfulResults = React.useMemo(() => {
    return urlResults.filter((r) => r.success && r.data)
  }, [urlResults])

  const [selectedCompareUrls, setSelectedCompareUrls] = React.useState<string[]>([])
  const [showStats, setShowStats] = React.useState<boolean>(false)

  // Auto-select first two successful results when the component mounts or urlResults change
  React.useEffect(() => {
    if (successfulResults.length >= 2 && selectedCompareUrls.length === 0) {
      setSelectedCompareUrls([successfulResults[0].url, successfulResults[1].url])
    }
  }, [successfulResults, selectedCompareUrls])

  const handleToggleCompareUrl = (url: string) => {
    setSelectedCompareUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url)
      }
      if (prev.length < 2) {
        return [...prev, url]
      }
      return prev
    })
  }

  return (
    <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
      {/* Sliding Tab Switcher (Slider) for Desktop and Mobile */}
      <div className="flex border rounded-xl overflow-hidden bg-muted/50 p-1 relative">
        <button
          onClick={() => setActiveTab("list")}
          className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer z-10 ${
            activeTab === "list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "list" && (
            <motion.div
              layoutId="active-result-tab"
              className="absolute inset-0 bg-background rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">Daftar Artikel ({urlResults.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("detail")}
          className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer z-10 ${
            activeTab === "detail" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "detail" && (
            <motion.div
              layoutId="active-result-tab"
              className="absolute inset-0 bg-background rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">Detail Ringkasan</span>
        </button>
        {successCount >= 2 && (
          <button
            onClick={() => setActiveTab("compare")}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer z-10 ${
              activeTab === "compare" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "compare" && (
              <motion.div
                layoutId="active-result-tab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Bandingkan</span>
          </button>
        )}
      </div>

      {/* Main Single-Column Panel Content */}
      <div className="w-full min-h-[400px]">
        {activeTab === "list" ? (
          /* LEFT PANEL — Article List */
          <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Hasil ({successCount} berhasil / {failCount} gagal)
              </h3>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1.5 scrollbar-thin">
              {urlResults.map((res, i) => (
                <ArticleListItem
                  key={i}
                  res={res}
                  isSelected={res.url === selectedUrl}
                  onClick={() => {
                    setSelectedUrl(res.url)
                    setActiveTab("detail")
                  }}
                />
              ))}
            </div>

            <Button
              onClick={onNewSummary}
              variant="outline"
              className="w-full text-xs font-semibold h-10 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-sm mt-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mulai Ringkasan Baru
            </Button>
          </div>
        ) : activeTab === "detail" ? (
          /* RIGHT PANEL — Article Detail */
          <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Back Button to List */}
            <button
              onClick={() => setActiveTab("list")}
              className="flex items-center gap-1.5 text-xs font-bold text-primary mb-3.5 hover:underline text-left self-start cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Artikel
            </button>

            {selectedResult ? (
              <div className="flex flex-col h-full bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
                {/* Sticky Detail Header */}
                <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border/80 px-5 py-4.5 z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug">
                      {getArticleTitle(selectedResult.url)}
                    </h3>
                    <a
                      href={selectedResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 hover:bg-muted rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <a
                    href={selectedResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary truncate hover:underline block max-w-[90%]"
                  >
                    {selectedResult.url}
                  </a>
                </div>

                {/* Detailed Summary Content */}
                <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
                  {selectedResult.success && selectedResult.data ? (
                    <ResultCard
                      data={selectedResult.data}
                      className="border-none p-0 shadow-none bg-transparent h-auto"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-destructive gap-3 my-4">
                      <AlertTriangle className="w-9 h-9 text-destructive/80" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Gagal Meringkas Artikel</h4>
                        <p className="text-xs text-destructive/85 max-w-sm leading-relaxed mx-auto">
                          {selectedResult.error ||
                            "Terjadi kesalahan saat mencoba memuat atau memproses halaman web ini."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm min-h-[350px] bg-muted/10 h-full">
                <BookOpen className="mb-3.5 text-muted-foreground/35 w-10 h-10" />
                <p className="text-center font-medium">Pilih artikel dari daftar untuk melihat detail</p>
              </div>
            )}
          </div>
        ) : (
          /* COMPARE PANEL — Side-by-Side Comparison */
          <div className="flex flex-col gap-5 w-full animate-in fade-in duration-300">
            {/* Checkbox selector panel */}
            <div className="border border-border/60 rounded-xl p-4 bg-muted/20 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Pilih 2 Artikel untuk Dibandingkan
                </h4>
                {selectedCompareUrls.length === 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className="h-8 text-xs font-medium border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer shadow-sm animate-in fade-in duration-200"
                  >
                    <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                    {showStats ? "Tampilkan Konten Ringkas" : "Visualisasi Perbedaan"}
                  </Button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                {successfulResults.map((res) => {
                  const isChecked = selectedCompareUrls.includes(res.url)
                  const isDisabled = !isChecked && selectedCompareUrls.length >= 2
                  const title = getArticleTitle(res.url)

                  return (
                    <label
                      key={res.url}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium cursor-pointer transition-all select-none ${
                        isChecked
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : isDisabled
                            ? "opacity-50 border-border bg-muted/40 cursor-not-allowed"
                            : "border-border hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleToggleCompareUrl(res.url)}
                        className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 accent-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="truncate max-w-[200px]" title={title}>
                        {title}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Comparison Content */}
            {selectedCompareUrls.length === 2 ? (
              showStats ? (
                /* Stats visualization table */
                <div className="border border-border/80 rounded-xl bg-card shadow-sm p-5 flex flex-col gap-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b pb-2.5">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Statistik Perbandingan Metadata
                  </h3>
                  <div className="divide-y divide-border/60">
                    {/* Title Row */}
                    <div className="grid grid-cols-3 py-3 items-start gap-4">
                      <div className="text-xs font-semibold text-muted-foreground">Parameter</div>
                      <div className="text-xs font-bold text-foreground break-words line-clamp-2">
                        {getArticleTitle(selectedCompareUrls[0])}
                      </div>
                      <div className="text-xs font-bold text-foreground break-words line-clamp-2">
                        {getArticleTitle(selectedCompareUrls[1])}
                      </div>
                    </div>

                    {/* Kategori */}
                    <div className="grid grid-cols-3 py-3 items-center gap-4">
                      <div className="text-xs font-semibold text-muted-foreground">Kategori</div>
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-background font-medium">
                          {successfulResults.find((r) => r.url === selectedCompareUrls[0])?.data?.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-background font-medium">
                          {successfulResults.find((r) => r.url === selectedCompareUrls[1])?.data?.category}
                        </span>
                      </div>
                    </div>

                    {/* Sentimen */}
                    <div className="grid grid-cols-3 py-3 items-center gap-4">
                      <div className="text-xs font-semibold text-muted-foreground">Sentimen</div>
                      <div>
                        {(() => {
                          const sentiment = successfulResults.find((r) => r.url === selectedCompareUrls[0])?.data?.sentiment
                          return sentiment ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[sentiment] || ""}`}>
                              {sentiment}
                            </span>
                          ) : null
                        })()}
                      </div>
                      <div>
                        {(() => {
                          const sentiment = successfulResults.find((r) => r.url === selectedCompareUrls[1])?.data?.sentiment
                          return sentiment ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[sentiment] || ""}`}>
                              {sentiment}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>

                    {/* Waktu Baca */}
                    <div className="grid grid-cols-3 py-3 items-center gap-4">
                      <div className="text-xs font-semibold text-muted-foreground">Waktu Baca</div>
                      <div className="text-xs font-medium text-foreground">
                        ~{successfulResults.find((r) => r.url === selectedCompareUrls[0])?.data?.readingTime} menit
                      </div>
                      <div className="text-xs font-medium text-foreground">
                        ~{successfulResults.find((r) => r.url === selectedCompareUrls[1])?.data?.readingTime} menit
                      </div>
                    </div>

                    {/* Jumlah Poin Penting */}
                    <div className="grid grid-cols-3 py-3 items-center gap-4">
                      <div className="text-xs font-semibold text-muted-foreground">Jumlah Poin Penting</div>
                      <div className="text-xs font-medium text-foreground">
                        {successfulResults.find((r) => r.url === selectedCompareUrls[0])?.data?.keyPoints.length || 0} poin
                      </div>
                      <div className="text-xs font-medium text-foreground">
                        {successfulResults.find((r) => r.url === selectedCompareUrls[1])?.data?.keyPoints.length || 0} poin
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard side-by-side detail cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {selectedCompareUrls.map((url, index) => {
                    const res = successfulResults.find((r) => r.url === url)
                    if (!res || !res.data) return null
                    const title = getArticleTitle(res.url)

                    return (
                      <div
                        key={url}
                        className="flex flex-col bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden min-h-[350px] animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        {/* Column Header */}
                        <div className="bg-muted/30 border-b border-border/80 px-4 py-3 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              Kolom {index + 1}
                            </span>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 hover:bg-muted rounded-lg"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                            {title}
                          </h4>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary truncate hover:underline block max-w-full"
                          >
                            {res.url}
                          </a>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
                          <ResultCard
                            data={res.data}
                            skipTypewriter={true}
                            className="border-none p-0 shadow-none bg-transparent h-auto"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="border border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm min-h-[300px] bg-muted/10 h-full">
                <BookOpen className="mb-3.5 text-muted-foreground/35 w-10 h-10" />
                <p className="text-center font-medium">
                  Silakan pilih {2 - selectedCompareUrls.length} artikel lagi dari daftar di atas untuk mulai membandingkan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
