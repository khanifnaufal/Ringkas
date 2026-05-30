import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  collections: defineTable({
    userId:    v.string(),   // dari Clerk
    name:      v.string(),   // nama folder
    emoji:     v.string(),   // ikon folder
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  summaries: defineTable({
    userId:       v.string(),
    collectionId: v.optional(v.id("collections")), // null = uncategorized
    originalText: v.string(),
    summary:      v.string(),
    keyPoints:    v.array(v.string()),
    category:     v.string(),
    sentiment:    v.string(),
    readingTime:  v.number(),
    pdfMeta:      v.optional(
      v.object({
        filename: v.string(),
        pages:    v.number(),
        chars:    v.number(),
      })
    ),
    createdAt:    v.number(),
  })
    .index("by_user",       ["userId"])
    .index("by_collection", ["collectionId"]),
})