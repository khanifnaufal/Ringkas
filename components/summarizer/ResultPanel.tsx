"use client"

import { useState, useEffect, useMemo } from "react"
import { SummaryResult, SummaryMode, UrlSummaryResult } from "@/types/summary"
import { ResultCard } from "@/components/summarizer/ResultCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { EmptyState } from "./EmptyState"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { SplitResultPanel } from "./SplitResultPanel"

interface ResultPanelProps {
  result: SummaryResult | null
  loading: boolean
  onNewSummary: () => void
  mode?: SummaryMode
  urlResults?: UrlSummaryResult[] | null
}

export function ResultPanel({
  result,
  loading,
  onNewSummary,
  mode,
  urlResults,
}: ResultPanelProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "detail" | "compare">("list")

  const hasUrlResults = mode === "url" && urlResults && urlResults.length > 0
  const isSplitLayout = mode === "url" && urlResults && urlResults.length > 1

  // Handle auto-selection & tab reset on data change / loading
  useEffect(() => {
    if (loading) {
      setSelectedUrl(null)
      setActiveTab("list")
      return
    }
    if (isSplitLayout && urlResults) {
      // Find the first successful URL
      const firstSuccess = urlResults.find((res) => res.success)
      if (firstSuccess) {
        setSelectedUrl(firstSuccess.url)
      } else if (urlResults.length > 0) {
        setSelectedUrl(urlResults[0].url)
      }
    }
  }, [urlResults, loading, isSplitLayout])

  // Count successes and failures
  const { successCount, failCount } = useMemo(() => {
    if (!urlResults) return { successCount: 0, failCount: 0 }
    let successes = 0
    let failures = 0
    for (const r of urlResults) {
      if (r.success) successes++
      else failures++
    }
    return { successCount: successes, failCount: failures }
  }, [urlResults])

  // Get active result details
  const selectedResult = useMemo(() => {
    if (!selectedUrl || !urlResults) return null
    return urlResults.find((r) => r.url === selectedUrl) || null
  }, [selectedUrl, urlResults])

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full lg:sticky lg:top-8 gap-4 animate-in fade-in duration-300">
        <LoadingSkeleton />
      </div>
    )
  }

  // Render Split Panel Layout if there are more than 1 URLs
  if (isSplitLayout && urlResults) {
    return (
      <SplitResultPanel
        urlResults={urlResults}
        selectedUrl={selectedUrl}
        setSelectedUrl={setSelectedUrl}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        successCount={successCount}
        failCount={failCount}
        selectedResult={selectedResult}
        onNewSummary={onNewSummary}
      />
    )
  }

  // Render normal layout for single url result, text mode, or pdf mode
  return (
    <div className="flex flex-col w-full h-full lg:sticky lg:top-8 gap-4 animate-in fade-in duration-300">
      {hasUrlResults ? (
        <div className="flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-6 w-full max-h-[70vh] overflow-y-auto pr-1.5 scrollbar-thin">
            {urlResults!.map((res, i) => (
              <div
                key={i}
                className="flex flex-col gap-2.5 w-full border-b border-border/40 pb-5 last:border-b-0 last:pb-0"
              >
                <div className="text-xs font-semibold truncate text-muted-foreground bg-muted/30 border border-border/30 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                  <span className="truncate">
                    Sumber:{" "}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {res.url}
                    </a>
                  </span>
                </div>
                {res.success && res.data ? (
                  <ResultCard data={res.data} className="shadow-md bg-card" />
                ) : (
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed">
                    Gagal meringkas URL: {res.error || "Terjadi kesalahan"}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={onNewSummary}
            variant="outline"
            className="w-full text-xs font-semibold h-10 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mulai Ringkasan Baru
          </Button>
        </div>
      ) : result ? (
        <div className="flex flex-col gap-3.5 w-full">
          <ResultCard data={result} className="shadow-md bg-card" />
          <Button
            onClick={onNewSummary}
            variant="outline"
            className="w-full text-xs font-semibold h-10 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mulai Ringkasan Baru
          </Button>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
