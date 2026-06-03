import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const listAll = query({
  args: {
    category:  v.optional(v.string()),
    sentiment: v.optional(v.string()),
    type:      v.optional(v.union(v.literal("pdf"), v.literal("text"))),
  },
  handler: async (ctx, { category, sentiment, type }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    let q = ctx.db
      .query("summaries")
      .withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier))

    let results = await q.order("desc").collect()

    // Client-side filters (category, sentiment, type)
    if (category)  results = results.filter(s => s.category  === category)
    if (sentiment) results = results.filter(s => s.sentiment === sentiment)
    if (type === "pdf")  results = results.filter(s => !!s.pdfMeta)
    if (type === "text") results = results.filter(s => !s.pdfMeta)

    return results
  },
})

export const save = mutation({
  args: {
    collectionId: v.optional(v.id("collections")),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }

    if (args.collectionId) {
      const col = await ctx.db.get("collections", args.collectionId)
      if (!col || col.userId !== identity.tokenIdentifier) {
        throw new Error("Unauthorized")
      }
    }

    return ctx.db.insert("summaries", {
      ...args,
      userId: identity.tokenIdentifier,
      createdAt: Date.now(),
    })
  },
})

export const listByCollection = query({
  args: {
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, { collectionId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    if (collectionId) {
      const col = await ctx.db.get("collections", collectionId)
      if (!col || col.userId !== identity.tokenIdentifier) {
        return []
      }
      return ctx.db
        .query("summaries")
        .withIndex("by_collection", q => q.eq("collectionId", collectionId))
        .order("desc")
        .collect()
    }

    // uncategorized summaries belonging to this user
    return ctx.db
      .query("summaries")
      .withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier))
      .filter(q => q.eq(q.field("collectionId"), undefined))
      .order("desc")
      .collect()
  },
})

export const move = mutation({
  args: {
    id:           v.id("summaries"),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, { id, collectionId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const summary = await ctx.db.get("summaries", id)
    if (!summary || summary.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized")
    }

    if (collectionId) {
      const col = await ctx.db.get("collections", collectionId)
      if (!col || col.userId !== identity.tokenIdentifier) {
        throw new Error("Unauthorized")
      }
    }

    await ctx.db.patch(id, { collectionId })
  },
})

export const getById = query({
  args: { id: v.id("summaries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const summary = await ctx.db.get(id)
    if (!summary || summary.userId !== identity.tokenIdentifier) return null

    return summary
  },
})

export const remove = mutation({
  args: { id: v.id("summaries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const summary = await ctx.db.get("summaries", id)
    if (!summary || summary.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized")
    }

    await ctx.db.delete(id)
  },
})