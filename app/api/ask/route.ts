import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import type { UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const { messages, context, filename } = body as {
    messages: UIMessage[]
    context?: string
    filename?: string
  }

  const systemPrompt = `Kamu adalah asisten tanya-jawab yang HANYA menjawab berdasarkan teks/konteks yang diberikan di bawah.

${filename ? `Dokumen: "${filename}"` : ""}

ATURAN PENTING:
- Jawab HANYA dari informasi yang ada di dalam KONTEKS berikut.
- Jika pertanyaan tidak bisa dijawab dari konteks, katakan: "Informasi tidak tersedia di teks ini."
- Gunakan Bahasa Indonesia yang jelas dan natural.
- Beri jawaban maksimal 3-4 kalimat. Langsung ke inti.
- Jangan mengarang atau menambah informasi di luar konteks.
- Jangan sebutkan bahwa kamu membaca "konteks" — cukup jawab langsung.

KONTEKS:
${context?.slice(0, 10000) ?? "(tidak ada konteks)"}`

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
