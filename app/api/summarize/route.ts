import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const SummarySchema = z.object({
  summary:     z.string().describe("A concise summary of the text"),
  keyPoints:   z.array(z.string()).describe("3-5 key points from the text"),
  category:    z.enum(["technology", "business", "health",
                        "politics", "science", "sports", "entertainment", "other"]),
  sentiment:   z.enum(["positive", "negative", "neutral"]),
  readingTime: z.number().describe("Estimated reading time in minutes for the original text"),
})

const LENGTH_MAP: Record<string, string> = {
  short:    "2-3 very concise sentences",
  medium:   "4-5 informative sentences",
  detailed: "6-8 comprehensive sentences",
}

export async function POST(req: Request) {
  const { text, length } = await req.json()

  if (!text || text.trim().length < 50) {
    return Response.json(
      { error: "Text is too short (min. 50 characters)" },
      { status: 400 }
    )
  }

  const lengthGuide = LENGTH_MAP[length as string] ?? LENGTH_MAP["medium"]

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: SummarySchema,
    prompt: `Analyze the following text and provide:
- Summary: ${lengthGuide}
- Key points: the most important points
- The most fitting topic category
- Overall sentiment of the text
- Estimated reading time (assume 200 words/minute)

Text:
${text.slice(0, 8000)}`,
  })

  return Response.json(object)
}