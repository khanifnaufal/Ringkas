export type SummaryLength = "short" | "medium" | "detailed"

export type SentimentType = "positive" | "negative" | "neutral"

export type CategoryType =
  | "technology"
  | "business"
  | "health"
  | "politics"
  | "science"
  | "sports"
  | "entertainment"
  | "other"

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  category: CategoryType
  sentiment: SentimentType
  readingTime: number
}

export interface SummarizeRequest {
  text: string
  length: SummaryLength
}
