import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getArticleTitle(url: string): string {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace("www.", "")
    const pathParts = parsed.pathname.split("/").filter(Boolean)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1]
      const cleanTitle = lastPart
        .replace(/[-_]/g, " ")
        .replace(/\.[a-zA-Z0-9]+$/, "")
      
      if (cleanTitle.length > 2) {
        return cleanTitle
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }
    }
    return hostname
  } catch {
    return url
  }
}
