import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { SummarySchema } from "../summarize/route"
import { MAX_URLS, FETCH_TIMEOUT_MS, MAX_FETCH_SIZE_BYTES } from "@/lib/constants"

export const maxDuration = 60

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

function parseIPv4(ipStr: string): number[] | null {
  const parts = ipStr.split(".")
  if (parts.length === 0 || parts.length > 4) return null

  const parsedParts: number[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed === "") return null

    let val = 0
    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      val = parseInt(trimmed, 16)
    } else if (trimmed.startsWith("0") && trimmed.length > 1) {
      if (!/^[0-7]+$/.test(trimmed.slice(1))) {
        return null
      }
      val = parseInt(trimmed, 8)
    } else {
      if (!/^\d+$/.test(trimmed)) {
        return null
      }
      val = parseInt(trimmed, 10)
    }

    if (isNaN(val) || val < 0) return null
    parsedParts.push(val)
  }

  let ipv4Int = 0
  if (parsedParts.length === 4) {
    if (parsedParts.some(p => p > 255)) return null
    ipv4Int = (parsedParts[0] << 24) | (parsedParts[1] << 16) | (parsedParts[2] << 8) | parsedParts[3]
  } else if (parsedParts.length === 3) {
    if (parsedParts[0] > 255 || parsedParts[1] > 255 || parsedParts[2] > 65535) return null
    ipv4Int = (parsedParts[0] << 24) | (parsedParts[1] << 16) | parsedParts[2]
  } else if (parsedParts.length === 2) {
    if (parsedParts[0] > 255 || parsedParts[1] > 16777215) return null
    ipv4Int = (parsedParts[0] << 24) | parsedParts[1]
  } else if (parsedParts.length === 1) {
    if (parsedParts[0] > 4294967295) return null
    ipv4Int = parsedParts[0]
  }

  const o1 = (ipv4Int >>> 24) & 255
  const o2 = (ipv4Int >>> 16) & 255
  const o3 = (ipv4Int >>> 8) & 255
  const o4 = ipv4Int & 255

  return [o1, o2, o3, o4]
}

function parseIPv6(ip: string): number[] | null {
  const cleanIp = ip.toLowerCase().trim()
  const doubleColonParts = cleanIp.split("::")
  if (doubleColonParts.length > 2) return null

  const parseSegments = (segmentStr: string): number[] | null => {
    if (segmentStr === "") return []
    const parts = segmentStr.split(":")
    const res: number[] = []
    for (const p of parts) {
      if (p === "") return null
      const val = parseInt(p, 16)
      if (isNaN(val) || val < 0 || val > 0xffff || p.length > 4) return null
      res.push(val)
    }
    return res
  }

  let left: number[] | null = []
  let right: number[] | null = []

  if (doubleColonParts.length === 2) {
    left = parseSegments(doubleColonParts[0])
    let rightStr = doubleColonParts[1]
    let ipv4Part: number[] | null = null
    const lastColon = rightStr.lastIndexOf(":")
    const potentialIpv4 = lastColon === -1 ? rightStr : rightStr.substring(lastColon + 1)

    if (potentialIpv4.includes(".")) {
      ipv4Part = parseIPv4(potentialIpv4)
      if (!ipv4Part) return null
      rightStr = lastColon === -1 ? "" : rightStr.substring(0, lastColon)
    }

    right = parseSegments(rightStr)
    if (!left || !right) return null

    if (ipv4Part) {
      right.push((ipv4Part[0] << 8) + ipv4Part[1])
      right.push((ipv4Part[2] << 8) + ipv4Part[3])
    }

    const totalLen = left.length + right.length
    if (totalLen > 8) return null

    const zerosNeeded = 8 - totalLen
    const middle = Array(zerosNeeded).fill(0)
    return [...left, ...middle, ...right]
  } else {
    let mainStr = doubleColonParts[0]
    let ipv4Part: number[] | null = null
    const lastColon = mainStr.lastIndexOf(":")
    const potentialIpv4 = lastColon === -1 ? mainStr : mainStr.substring(lastColon + 1)

    if (potentialIpv4.includes(".")) {
      ipv4Part = parseIPv4(potentialIpv4)
      if (!ipv4Part) return null
      mainStr = lastColon === -1 ? "" : mainStr.substring(0, lastColon)
    }

    const segments = parseSegments(mainStr)
    if (!segments) return null

    if (ipv4Part) {
      segments.push((ipv4Part[0] << 8) + ipv4Part[1])
      segments.push((ipv4Part[2] << 8) + ipv4Part[3])
    }

    if (segments.length !== 8) return null
    return segments
  }
}

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().trim()
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".lan") ||
    h.endsWith(".test")
  ) {
    return true
  }

  let ipStr = h
  if (ipStr.startsWith("[") && ipStr.endsWith("]")) {
    ipStr = ipStr.slice(1, -1)
  }

  const ipv4 = parseIPv4(ipStr)
  if (ipv4) {
    const [o1, o2] = ipv4
    if (o1 === 127) return true
    if (o1 === 10) return true
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true
    if (o1 === 192 && o2 === 168) return true
    if (o1 === 169 && o2 === 254) return true
    if (o1 === 0) return true
    return false
  }

  const ipv6 = parseIPv6(ipStr)
  if (ipv6) {
    const isLoopback = ipv6.every((val, idx) => idx === 7 ? val === 1 : val === 0)
    if (isLoopback) return true

    const firstGroup = ipv6[0]
    if ((firstGroup & 0xffc0) === 0xfe80) return true
    if ((firstGroup & 0xfe00) === 0xfc00) return true

    const isIpv4Mapped = ipv6[0] === 0 && ipv6[1] === 0 && ipv6[2] === 0 && ipv6[3] === 0 && ipv6[4] === 0 && ipv6[5] === 0xffff
    if (isIpv4Mapped) {
      const o1 = (ipv6[6] >>> 8) & 255
      const o2 = ipv6[6] & 255

      if (o1 === 127) return true
      if (o1 === 10) return true
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true
      if (o1 === 192 && o2 === 168) return true
      if (o1 === 169 && o2 === 254) return true
      if (o1 === 0) return true
    }

    return false
  }

  return false
}

export async function POST(req: Request) {
  try {
    const { urls, length, language } = await req.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return Response.json(
        { error: "Daftar URL tidak boleh kosong" },
        { status: 400 }
      )
    }

    if (urls.length > MAX_URLS) {
      return Response.json(
        { error: `Jumlah URL melebihi batas maksimal (${MAX_URLS} URL)` },
        { status: 400 }
      )
    }

    const lang = language === "en" ? "en" : "id"
    const lengthGuide = lang === "en"
      ? (LENGTH_MAP_EN[length] ?? LENGTH_MAP_EN["sedang"])
      : (LENGTH_MAP[length] ?? LENGTH_MAP["sedang"])

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
          const parsedUrl = new URL(trimmedUrl)
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            throw new Error("Protokol URL tidak valid (hanya http dan https yang diperbolehkan).")
          }
          if (isPrivateHostname(parsedUrl.hostname)) {
            throw new Error("URL merujuk pada alamat jaringan lokal yang dilarang.")
          }
        } catch (e) {
          return {
            url: trimmedUrl,
            success: false,
            error: e instanceof Error ? e.message : "Format URL tidak valid",
          }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          try {
            controller.abort()
          } catch {}
        }, FETCH_TIMEOUT_MS)

        try {
          const response = await fetch(trimmedUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`Gagal memuat URL (HTTP ${response.status})`)
          }

          let html = ""
          if (response.body && typeof response.body.getReader === "function") {
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let totalBytes = 0

            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                if (value) {
                  totalBytes += value.length
                  if (totalBytes > MAX_FETCH_SIZE_BYTES) {
                    const allowedLength = value.length - (totalBytes - MAX_FETCH_SIZE_BYTES)
                    if (allowedLength > 0) {
                      html += decoder.decode(value.subarray(0, allowedLength), { stream: true })
                    }
                    await reader.cancel("Response body size limit exceeded")
                    break
                  }
                  html += decoder.decode(value, { stream: true })
                }
              }
            } finally {
              reader.releaseLock()
            }
            html += decoder.decode()
          } else {
            html = await response.text()
            if (html.length > MAX_FETCH_SIZE_BYTES) {
              html = html.substring(0, MAX_FETCH_SIZE_BYTES)
            }
          }

          const cleanText = extractCleanText(html)

          if (cleanText.length < 50) {
            throw new Error("Konten teks dari URL terlalu pendek untuk diringkas")
          }

          const prompt = lang === "en"
            ? `You are a professional web analysis assistant writing in English.

You are summarizing an article from the following web page: "${trimmedUrl}".

INSTRUCTIONS:
- Summary: write a ${lengthGuide} summary covering the core points of the web article
- Key points: extract 3-5 of the most important points from the article
- Category: determine the content type (teknologi, bisnis, sains, hiburan, dll - choose from the strict category list)
- Sentiment: analyze the overall tone of the article (positif, negatif, or netral)
- Reading time: estimate based on 200 words per minute of the total text

RULES:
- Use clear, professional, and natural English
- Do not add opinions outside the original article
- Regardless of the article's original language, always write the summary and key points in English

WEB DOCUMENT CONTENT:
${cleanText.slice(0, 8000)}`
            : `Kamu adalah asisten analisis web profesional yang menulis dalam Bahasa Indonesia.

Kamu sedang meringkas artikel dari halaman web berikut: "${trimmedUrl}".

INSTRUKSI:
- Ringkasan: tulis ${lengthGuide} yang mencakup inti tulisan dari artikel web tersebut
- Key points: ekstrak 3-5 poin paling penting dari artikel tersebut
- Kategori: tentukan jenis isi tulisan (teknologi, bisnis, sains, hiburan, dll)
- Sentimen: analisis nada keseluruhan artikel — positif, negatif, atau netral
- Waktu baca: ekstrak estimasi berdasarkan 200 kata per menit dari total teks

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
          let errorMessage = "Terjadi kesalahan saat meringkas"
          if (error instanceof Error) {
            if (error.name === "AbortError") {
              errorMessage = "Koneksi timeout atau ukuran halaman terlalu besar"
            } else {
              errorMessage = error.message
            }
          }
          return {
            url: trimmedUrl,
            success: false,
            error: errorMessage,
          }
        } finally {
          clearTimeout(timeoutId)
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
