import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const maxDuration = 60

export const SummarySchema = z.object({
  summary:     z.string().describe("Ringkasan padat dalam Bahasa Indonesia"),
  keyPoints:   z.array(z.string()).describe("3-5 poin utama dari teks"),
  category:    z.enum([
    // teks umum
    "teknologi", "bisnis", "kesehatan", "politik",
    "sains", "olahraga", "hiburan", "lainnya",
    // khusus PDF
    "laporan", "makalah", "kontrak", "presentasi",
    "manual", "penelitian",
  ]),
  sentiment:   z.enum(["positif", "negatif", "netral"]),
  readingTime: z.number().describe("Estimasi menit baca teks asli"),
})

const LENGTH_MAP: Record<string, string> = {
  pendek:  "2-3 kalimat yang sangat ringkas dan padat",
  sedang:  "4-5 kalimat yang informatif dan mudah dipahami",
  detail:  "6-8 kalimat yang komprehensif dan menyeluruh",
}

export async function POST(req: Request) {
  const { text, length, mode, filename, pages, chars } = await req.json()

  if (!text || text.trim().length < 50) {
    return Response.json(
      { error: "Teks terlalu pendek (min. 50 karakter)" },
      { status: 400 }
    )
  }

  if (text.length > 50000) {
    return Response.json(
      { error: "Teks terlalu panjang (maksimum 50.000 karakter)" },
      { status: 400 }
    )
  }

  const lengthGuide = LENGTH_MAP[length] ?? LENGTH_MAP["sedang"]

  const prompt = mode === "pdf"
    ? `Kamu adalah asisten analisis dokumen profesional yang menulis dalam Bahasa Indonesia.

Kamu sedang menganalisis dokumen PDF berjudul "${filename}" (${pages} halaman).

INSTRUKSI:
- Ringkasan: tulis ${lengthGuide} yang mencakup tujuan, isi utama, dan kesimpulan dokumen
- Key points: ekstrak 3-5 poin paling penting dari seluruh dokumen
- Kategori: tentukan jenis dokumen (laporan, makalah, kontrak, presentasi, dll)
- Sentimen: analisis nada dokumen — informatif-positif, kritis-negatif, atau netral-objektif
- Waktu baca: estimasi berdasarkan 200 kata per menit dari total teks

ATURAN:
- Gunakan Bahasa Indonesia yang baku dan profesional
- Perhatikan struktur dokumen (pendahuluan, isi, kesimpulan) dalam membuat ringkasan
- Jangan tambahkan opini atau informasi di luar dokumen
- Jika dokumen dalam bahasa lain, tetap buat ringkasan dalam Bahasa Indonesia

KONTEKS DOKUMEN:
Nama file    : ${filename}
Jumlah halaman: ${pages} halaman
Total karakter: ${chars} karakter

ISI DOKUMEN:
${text.slice(0, 7500)}`

    : `Kamu adalah asisten ringkasan teks profesional yang menulis dalam Bahasa Indonesia.

INSTRUKSI:
- Ringkasan: tulis ${lengthGuide} yang padat dan mudah dipahami
- Key points: ekstrak 3-5 poin paling penting, masing-masing 1 kalimat
- Kategori: pilih kategori yang paling sesuai dengan konten
- Sentimen: analisis nada keseluruhan teks
- Waktu baca: estimasi berdasarkan 200 kata per menit

ATURAN:
- Gunakan Bahasa Indonesia yang baku namun mudah dipahami
- Jangan tambahkan opini di luar teks asli
- Fokus pada inti informasi, bukan gaya penulisan
- Jika teks dalam bahasa lain, tetap buat ringkasan dalam Bahasa Indonesia

TEKS:
${text.slice(0, 8000)}`

  const { object } = await generateObject({
    model:  google("gemini-2.5-flash"),
    schema: SummarySchema,
    prompt,
  })

  return Response.json(object)
}