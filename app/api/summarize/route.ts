import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const maxDuration = 60

export const SummarySchema = z.object({
  summary:     z.string().describe("Concise summary in the requested language"),
  keyPoints:   z.array(z.string()).describe("3-5 key points from the text in the requested language"),
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

const LENGTH_MAP_EN: Record<string, string> = {
  pendek:  "2-3 very short and concise sentences",
  sedang:  "4-5 informative and easy to understand sentences",
  detail:  "6-8 comprehensive and thorough sentences",
}

export async function POST(req: Request) {
  const { text, length, mode, filename, pages, chars, language } = await req.json()

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

  const lang = language === "en" ? "en" : "id"
  const lengthGuide = lang === "en"
    ? (LENGTH_MAP_EN[length] ?? LENGTH_MAP_EN["sedang"])
    : (LENGTH_MAP[length] ?? LENGTH_MAP["sedang"])

  const prompt = lang === "en"
    ? (mode === "pdf"
        ? `You are a professional document analysis assistant writing in English.

You are analyzing a PDF document titled "${filename}" (${pages} pages).

INSTRUCTIONS:
- Summary: write a ${lengthGuide} summary covering the objective, main content, and conclusion of the document
- Key points: extract 3-5 of the most important points from the entire document
- Category: determine the document type (laporan, makalah, kontrak, presentasi, manual, penelitian, or lainnya - choose from the strict category list)
- Sentiment: analyze the tone of the document (positif, negatif, or netral)
- Reading time: estimate based on 200 words per minute of the total text

RULES:
- Use clear, professional, and natural English
- Pay attention to the document structure (introduction, body, conclusion) when creating the summary
- Do not add opinions or information outside the document
- Regardless of the document's original language, always write the summary and key points in English

DOCUMENT CONTEXT:
File name: ${filename}
Total pages: ${pages} pages
Total characters: ${chars} characters

DOCUMENT CONTENT:
${text.slice(0, 7500)}`
        : `You are a professional text summarization assistant writing in English.

INSTRUCTIONS:
- Summary: write a ${lengthGuide} summary that is concise and easy to understand
- Key points: extract 3-5 of the most important points, 1 sentence each
- Category: choose the most suitable category for the content (teknologi, bisnis, kesehatan, politik, sains, olahraga, hiburan, or lainnya)
- Sentiment: analyze the overall tone of the text (positif, negatif, or netral)
- Reading time: estimate based on 200 words per minute

RULES:
- Use clear, professional, and natural English
- Do not add opinions outside the original text
- Focus on the core information, not the writing style
- Regardless of the text's original language, always write the summary and key points in English

TEXT:
${text.slice(0, 8000)}`)
    : (mode === "pdf"
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
${text.slice(0, 8000)}`)

  const { object } = await generateObject({
    model:  google("gemini-2.5-flash"),
    schema: SummarySchema,
    prompt,
  })

  return Response.json(object)
}