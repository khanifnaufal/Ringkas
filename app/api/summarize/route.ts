import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

const SummarySchema = z.object({
  summary:    z.string().describe("Ringkasan 3-5 kalimat padat"),
  keyPoints:  z.array(z.string()).describe("3-5 poin utama"),
  category:   z.enum(["teknologi", "bisnis", "kesehatan",
                      "politik", "sains", "olahraga", "hiburan", "lainnya"]),
  sentiment:  z.enum(["positif", "negatif", "netral"]),
  readingTime: z.number().describe("Estimasi menit baca teks asli"),
})

export async function POST(req: Request) {
  const { text, length } = await req.json()

  if (!text || text.trim().length < 50) {
    return Response.json(
      { error: "Teks terlalu pendek (min. 50 karakter)" },
      { status: 400 }
    )
  }

  const lengthMap: Record<string, string> = {
    pendek:  "2-3 kalimat sangat ringkas",
    sedang:  "4-5 kalimat informatif",
    detail:  "6-8 kalimat komprehensif",
  }
  const lengthGuide = lengthMap[length as string] ?? lengthMap["sedang"]

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: SummarySchema,
    prompt: `Analisis teks berikut dan berikan:
- Ringkasan: ${lengthGuide}
- Key points: poin-poin terpenting
- Kategori topik yang paling sesuai
- Sentimen keseluruhan teks
- Estimasi waktu baca (asumsikan 200 kata/menit)

Teks:
${text.slice(0, 8000)}`,
  })

  return Response.json(object)
}