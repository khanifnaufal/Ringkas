import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { SummarySchema } from "../summarize/route"

export const maxDuration = 60

const LENGTH_MAP: Record<string, string> = {
  pendek:  "2-3 kalimat yang sangat ringkas dan padat",
  sedang:  "4-5 kalimat yang informatif dan mudah dipahami",
  detail:  "6-8 kalimat yang komprehensif dan menyeluruh",
}

function extractCleanText(html: string): string {
  let clean = html
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")

  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    clean = bodyMatch[1]
  }

  return clean
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function POST(req: Request) {
  try {
    const { urls, length } = await req.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return Response.json(
        { error: "Daftar URL tidak boleh kosong" },
        { status: 400 }
      )
    }

    const lengthGuide = LENGTH_MAP[length] ?? LENGTH_MAP["sedang"]

    const results = await Promise.all(
      urls.map(async (url: string) => {
        const trimmedUrl = url.trim()
        if (!trimmedUrl) {
          return {
            url: "",
            success: false,
            error: "URL tidak valid",
          }
        }

        try {
          const response = await fetch(trimmedUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          })

          if (!response.ok) {
            throw new Error(`Gagal memuat URL (HTTP ${response.status})`)
          }

          const html = await response.text()
          const cleanText = extractCleanText(html)

          if (cleanText.length < 50) {
            throw new Error("Konten teks dari URL terlalu pendek untuk diringkas")
          }

          const prompt = `Kamu adalah asisten analisis web profesional yang menulis dalam Bahasa Indonesia.

Kamu sedang meringkas artikel dari halaman web berikut: "${trimmedUrl}".

INSTRUKSI:
- Ringkasan: tulis ${lengthGuide} yang mencakup inti tulisan dari artikel web tersebut
- Key points: ekstrak 3-5 poin paling penting dari artikel tersebut
- Kategori: tentukan jenis isi tulisan (teknologi, bisnis, sains, hiburan, dll)
- Sentimen: analisis nada keseluruhan artikel — positif, negatif, atau netral
- Waktu baca: estimasi berdasarkan 200 kata per menit dari total teks

ATURAN:
- Gunakan Bahasa Indonesia yang baku, profesional, dan mudah dipahami
- Jangan tambahkan opini di luar artikel asli
- Jika artikel dalam bahasa asing, tetap buat ringkasan dalam Bahasa Indonesia

ISI DOKUMEN WEB:
${cleanText.slice(0, 8000)}`

          const { object } = await generateObject({
            model:  google("gemini-2.5-flash"),
            schema: SummarySchema,
            prompt,
          })

          return {
            url: trimmedUrl,
            success: true,
            data: object,
          }
        } catch (error) {
          return {
            url: trimmedUrl,
            success: false,
            error: error instanceof Error ? error.message : "Terjadi kesalahan saat meringkas",
          }
        }
      })
    )

    return Response.json({ results })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Gagal memproses permintaan" },
      { status: 500 }
    )
  }
}
