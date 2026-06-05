import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import type { UIMessage } from "ai"

export const maxDuration = 30

const askRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().max(100),
        role: z.enum(["system", "user", "assistant"]),
        parts: z
          .array(
            z
              .object({
                type: z.string(),
                text: z.string().max(5000, "Teks pesan terlalu panjang").optional(),
              })
              .passthrough()
          )
          .max(10, "Terlalu banyak bagian pesan"),
      })
    )
    .min(1, "Harus ada minimal 1 pesan")
    .max(30, "Terlalu banyak riwayat pesan"),
  context: z.string().max(15000, "Konteks terlalu besar").optional(),
  filename: z
    .string()
    .max(255, "Nama file terlalu panjang")
    .regex(/^[^/\\:\*\?"<>\|]+$/, "Nama file mengandung karakter tidak valid")
    .optional(),
  language: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()
    const parsed = askRequestSchema.safeParse(rawBody)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request payload",
          details: parsed.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { messages, context, filename, language } = parsed.data
    const trimmedFilename = filename?.trim()
    const trimmedContext = context?.trim()
    const lang = language === "en" ? "en" : "id"

    const systemPrompt = lang === "en"
      ? `You are a Q&A assistant that ONLY answers based on the text/context provided below.

${trimmedFilename ? `Document: "${trimmedFilename}"` : ""}

IMPORTANT RULES:
- Answer ONLY using the information in the following CONTEXT.
- If the question cannot be answered from the context, say: "Information is not available in this text."
- Use clear and natural English.
- Provide a response of at most 3-4 sentences. Go straight to the point.
- Do not make up or add information outside the context.
- Do not mention that you read the "context" — just answer directly.

CONTEXT:
${trimmedContext?.slice(0, 10000) ?? "(no context)"}`
      : `Kamu adalah asisten tanya-jawab yang HANYA menjawab berdasarkan teks/konteks yang diberikan di bawah.

${trimmedFilename ? `Dokumen: "${trimmedFilename}"` : ""}

ATURAN PENTING:
- Jawab HANYA dari informasi yang ada di dalam KONTEKS berikut.
- Jika pertanyaan tidak bisa dijawab dari konteks, katakan: "Informasi tidak tersedia di teks ini."
- Gunakan Bahasa Indonesia yang jelas dan natural.
- Beri jawaban maksimal 3-4 kalimat. Langsung ke inti.
- Jangan mengarang atau menambah informasi di luar konteks.
- Jangan sebutkan bahwa kamu membaca "konteks" — cukup jawab langsung.

KONTEKS:
${trimmedContext?.slice(0, 10000) ?? "(tidak ada konteks)"}`

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages as UIMessage[]),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
}
