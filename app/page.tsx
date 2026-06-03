"use client"

import { useState, useEffect } from "react"
import { useSummarizer } from "@/hooks/useSummarizer"
import { AppHeader } from "@/components/layout/AppHeader"
import { InputPanel } from "@/components/summarizer/InputPanel"
import { ResultPanel } from "@/components/summarizer/ResultPanel"
import { Navbar } from "@/components/layout/Navbar"
import { CollectionsSidebar } from "@/components/collections/CollectionsSidebar"

export default function Home() {
  const summarizer = useSummarizer()
  const [activeSummaryId, setActiveSummaryId] = useState<string | undefined>(undefined)

  const handleSelectSummary = (summary: any) => {
    setActiveSummaryId(summary._id)
    summarizer.setResult(summary)
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("ringkas_open_summary")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          handleSelectSummary(parsed)
        } catch (err) {
          console.error("Gagal memuat ringkasan dari history:", err)
        } finally {
          sessionStorage.removeItem("ringkas_open_summary")
        }
      }
    }
  }, [])

  const handleNewSummary = () => {
    setActiveSummaryId(undefined)
    summarizer.setResult(null)
    summarizer.setText("")
    summarizer.clearPdf()
    summarizer.setUrls([""])
    summarizer.setUrlResults(null)
  };

  const handleSubmit = async () => {
    setActiveSummaryId(undefined)
    await summarizer.handleSubmit()
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 lg:py-20 w-full">
        <AppHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">
          {/* ── 1. Collections Sidebar (3/12 columns) ──────────────────────── */}
          <div className="lg:col-span-3 w-full">
            <CollectionsSidebar
              onSelectSummary={handleSelectSummary}
              activeSummaryId={activeSummaryId}
            />
          </div>

          {/* ── 2. Input Panel (4/12 columns) ──────────────────────────────── */}
          <div className="lg:col-span-4 w-full min-w-0">
            <InputPanel
              mode={summarizer.mode}
              onModeChange={summarizer.setMode}
              text={summarizer.text}
              onTextChange={summarizer.setText}
              wordCount={summarizer.wordCount}
              pdfFile={summarizer.pdfFile}
              pdfMeta={summarizer.pdfMeta}
              onPdfReady={summarizer.setPdfData}
              onClearPdf={summarizer.clearPdf}
              urls={summarizer.urls}
              onAddUrl={summarizer.addUrl}
              onRemoveUrl={summarizer.removeUrl}
              onUpdateUrl={summarizer.updateUrl}
              length={summarizer.length}
              onLengthChange={summarizer.setLength}
              loading={summarizer.loading}
              canSubmit={summarizer.canSubmit}
              error={summarizer.error}
              onSubmit={handleSubmit}
            />
          </div>

          {/* ── 3. Result Panel (5/12 columns) ─────────────────────────────── */}
          <div className="lg:col-span-5 w-full min-w-0">
            <ResultPanel
              result={summarizer.result}
              loading={summarizer.loading}
              onNewSummary={handleNewSummary}
              mode={summarizer.mode}
              urlResults={summarizer.urlResults}
            />
          </div>
        </div>
      </main>
    </>
  )
}