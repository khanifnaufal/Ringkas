import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rate limit structures
// Logged in: UserId -> array of request timestamps (last 1 minute)
const userRateLimitMap = new Map<string, number[]>()
const USER_LIMIT = 20
const USER_WINDOW = 60 * 1000 // 1 minute

// Guest: IP -> array of request timestamps (last 1 hour)
const guestRateLimitMap = new Map<string, number[]>()
const GUEST_LIMIT = 3
const GUEST_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited(key: string, isGuest: boolean): boolean {
  const now = Date.now()
  const map = isGuest ? guestRateLimitMap : userRateLimitMap
  const limit = isGuest ? GUEST_LIMIT : USER_LIMIT
  const window = isGuest ? GUEST_WINDOW : USER_WINDOW

  const timestamps = map.get(key) || []
  const activeTimestamps = timestamps.filter(ts => now - ts < window)

  if (activeTimestamps.length >= limit) {
    return true
  }

  activeTimestamps.push(now)
  map.set(key, activeTimestamps)
  return false
}

function isOriginAllowed(origin: string | null, host: string | null): boolean {
  if (!origin) return true
  try {
    const originUrl = new URL(origin)
    if (host && originUrl.host !== host) {
      // Allow localhost in development
      if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
        return process.env.NODE_ENV === "development" || process.env.ALLOW_LOCALHOST_DEV === "true"
      }
      return false
    }
  } catch {
    return false
  }
  return true
}

export const proxy = clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname
  const origin = req.headers.get("origin")
  const host = req.headers.get("host")

  // 1. CORS origin check
  if (origin && !isOriginAllowed(origin, host)) {
    return new Response(
      JSON.stringify({ error: "Akses ditolak: Asal permintaan (Origin) tidak sah." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  // 2. Rate limit API routes
  if (path.startsWith("/api/")) {
    const { userId } = await auth()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1"

    const isGuest = !userId
    const rateLimitKey = isGuest ? ip : userId

    if (isRateLimited(rateLimitKey, isGuest)) {
      const message = isGuest
        ? "Batas kuota gratis Anda telah habis (maks. 3 per jam). Silakan login untuk mendapatkan kuota lebih banyak."
        : "Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi."

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          isGuest,
          message,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": isGuest ? "3600" : "60",
          },
        }
      )
    }
  }

  return NextResponse.next()
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk auto-proxy path
    "/__clerk/(.*)",
  ],
};
