"use client"

import { useSummarizer } from "@/hooks/useSummarizer"
import { AppHeader } from "@/components/layout/AppHeader"
import { InputPanel } from "@/components/summarizer/InputPanel"
import { ResultPanel } from "@/components/summarizer/ResultPanel"
import { Navbar } from "@/components/layout/Navbar"

export default function Home() {
  const summarizer = useSummarizer()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 lg:py-24 w-full">
        <AppHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start w-full">
          {/* min-w-0 mencegah grid column collapse karena intrinsic content width */}
          <div className="w-full min-w-0">
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
              length={summarizer.length}
              onLengthChange={summarizer.setLength}
              loading={summarizer.loading}
              canSubmit={summarizer.canSubmit}
              error={summarizer.error}
              onSubmit={summarizer.handleSubmit}
            />
          </div>

          <div className="w-full min-w-0">
            <ResultPanel result={summarizer.result} loading={summarizer.loading} />
          </div>
        </div>
      </main>
    </>
  )
}