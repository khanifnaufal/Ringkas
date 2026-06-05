"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, translations } from "@/lib/i18n"

interface LanguageContextProps {
  uiLanguage: Language
  setUiLanguage: (lang: Language) => void
  summaryLanguage: Language
  setSummaryLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [uiLanguage, setUiLanguageState] = useState<Language>("id")
  const [summaryLanguage, setSummaryLanguageState] = useState<Language>("id")

  useEffect(() => {
    const savedUi = localStorage.getItem("ui_language") as Language
    if (savedUi === "id" || savedUi === "en") {
      setUiLanguageState(savedUi)
    }
    const savedSummary = localStorage.getItem("summary_language") as Language
    if (savedSummary === "id" || savedSummary === "en") {
      setSummaryLanguageState(savedSummary)
    }
  }, [])

  const setUiLanguage = (lang: Language) => {
    setUiLanguageState(lang)
    localStorage.setItem("ui_language", lang)
  }

  const setSummaryLanguage = (lang: Language) => {
    setSummaryLanguageState(lang)
    localStorage.setItem("summary_language", lang)
  }

  const t = (key: string): string => {
    const dict = translations[uiLanguage]
    return dict[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ uiLanguage, setUiLanguage, summaryLanguage, setSummaryLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
