export type SummaryLength = "pendek" | "sedang" | "detail"

export type SentimentType = "positif" | "negatif" | "netral"

export type CategoryType =
  // teks umum
  | "teknologi"
  | "bisnis"
  | "kesehatan"
  | "politik"
  | "sains"
  | "olahraga"
  | "hiburan"
  | "lainnya"
  // khusus PDF
  | "laporan"
  | "makalah"
  | "kontrak"
  | "presentasi"
  | "manual"
  | "penelitian"

export type SummaryMode = "text" | "pdf"

export interface PdfMeta {
  filename: string
  pages: number
  chars: number
}

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  category: CategoryType
  sentiment: SentimentType
  readingTime: number
  /** Tersedia saat mode PDF */
  pdfMeta?: PdfMeta
  originalText?: string
}

export interface SummarizeRequest {
  text: string
  length: SummaryLength
  mode?: SummaryMode
  filename?: string
  pages?: number
  chars?: number
}
