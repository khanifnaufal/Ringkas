"use client"

import React from "react"
import { UrlSummaryResult } from "@/types/summary"
import { Button } from "@/components/ui/button"
import { ArticleListItem } from "./ArticleListItem"
import { ResultCard } from "./ResultCard"
import { getArticleTitle } from "@/lib/utils"
import { Plus, ArrowLeft, ExternalLink, AlertTriangle, BookOpen, Sparkles } from "lucide-react"
import { motion } from "motion/react"

interface SplitResultPanelProps {
  urlResults: UrlSummaryResult[]
  selectedUrl: string | null
  setSelectedUrl: (url: string | null) => void
  activeTab: "list" | "detail"
  setActiveTab: (tab: "list" | "detail") => void
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
        ) : (
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
        )}
      </div>
    </div>
  )
}
