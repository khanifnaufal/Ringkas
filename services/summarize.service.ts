import { SummarizeRequest, SummaryResult } from "@/types/summary"

/**
 * Mengirim request ke API /api/summarize dan mengembalikan hasil ringkasan.
 * API menggunakan generateObject sehingga respons adalah plain JSON.
 */
export async function fetchSummary(
  payload: SummarizeRequest
): Promise<SummaryResult> {
  const res = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? "Terjadi error, coba lagi")
  }

  return res.json() as Promise<SummaryResult>
}
