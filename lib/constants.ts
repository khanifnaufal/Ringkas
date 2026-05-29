import { SentimentType, SummaryLength } from "@/types/summary"

export const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positive: "bg-green-50 text-green-800",
  negative: "bg-red-50 text-red-800",
  neutral:  "bg-gray-100 text-gray-700",
}

export const LENGTH_OPTIONS: SummaryLength[] = ["short", "medium", "detailed"]

export const MIN_TEXT_LENGTH = 50
