import { SentimentType, SummaryLength } from "@/types/summary"

export const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positif: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  negatif: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  netral:  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

export const LENGTH_OPTIONS: SummaryLength[] = ["pendek", "sedang", "detail"]

export const LENGTH_LABELS: Record<SummaryLength, string> = {
  pendek: "Pendek",
  sedang: "Sedang",
  detail: "Detail",
}

export const MIN_TEXT_LENGTH = 50
export const MAX_PDF_CHARS   = 7_500
export const MAX_PDF_SIZE_MB = 3
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024

export const MAX_URLS = 5
export const FETCH_TIMEOUT_MS = 8000
export const MAX_FETCH_SIZE_BYTES = 1024 * 1024 // 1MB

