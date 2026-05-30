import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    return ctx.db
      .query("collections")
      .withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .collect()
  },
})

export const create = mutation({
  args: {
    name:   v.string(),
    emoji:  v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }
    return ctx.db.insert("collections", {
      userId: identity.tokenIdentifier,
      name: args.name,
      emoji: args.emoji,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const collection = await ctx.db.get("collections", id)
    if (!collection || collection.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized")
    }

    // hapus semua summary di collection ini dulu
    const summaries = await ctx.db
      .query("summaries")
      .withIndex("by_collection", q => q.eq("collectionId", id))
      .collect()
    await Promise.all(summaries.map(s => ctx.db.delete(s._id)))
    await ctx.db.delete(id)
  },
})