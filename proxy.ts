import { clerkMiddleware } from "@clerk/nextjs/server";

// In Next.js 16, middleware.ts was renamed to proxy.ts.
// The exported function must be named `proxy` instead of `middleware`.
// clerkMiddleware() returns a NextMiddleware-compatible function.
export const proxy = clerkMiddleware();

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
