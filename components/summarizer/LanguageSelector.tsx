"use client"

import { useLanguage } from "@/components/providers/LanguageProvider"

export function LanguageSelector() {
  const { summaryLanguage, setSummaryLanguage, t } = useLanguage()

  return (
    <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-xl border border-border/50 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("lang.summaryLang")}
        </span>
      </div>

      <div className="flex items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={() => setSummaryLanguage("id")}
          aria-pressed={summaryLanguage === "id"}
          className={`flex-1 text-center text-xs py-2 px-1 rounded-lg border transition-all duration-200 font-semibold cursor-pointer
            ${summaryLanguage === "id"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          🇮🇩 {t("lang.indonesia")}
        </button>
        <button
          type="button"
          onClick={() => setSummaryLanguage("en")}
          aria-pressed={summaryLanguage === "en"}
          className={`flex-1 text-center text-xs py-2 px-1 rounded-lg border transition-all duration-200 font-semibold cursor-pointer
            ${summaryLanguage === "en"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          🇬🇧 {t("lang.english")}
        </button>
      </div>
    </div>
  )
}
