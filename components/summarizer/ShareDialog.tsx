"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Share2, Copy } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ShareDialogProps {
  summary: string
  keyPoints: string[]
  trigger: React.ReactNode
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 shrink-0" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.46.93-4.12 2.73-.39.27-.74.4-1.06.39-.35-.01-1.02-.2-1.52-.36-.61-.2-1.09-.31-1.05-.66.02-.18.27-.37.75-.56 2.94-1.28 4.9-2.12 5.88-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.11.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
  </svg>
)

export function ShareDialog({ summary, keyPoints, trigger }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const textToShare = [
    summary,
    "",
    "Key points:",
    ...keyPoints.map((p) => `• ${p}`),
  ].join("\n")

  async function handleCopy() {
    if (!navigator.clipboard) {
      toast.error("Clipboard API tidak tersedia di browser ini.")
      return
    }
    try {
      await navigator.clipboard.writeText(textToShare)
      setCopied(true)
      toast.success("Rangkuman berhasil disalin ke clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      toast.error("Gagal menyalin rangkuman.")
    }
  }

  function handleShare(platform: string) {
    const encodedText = encodeURIComponent(textToShare)
    const currentUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""
    let url = ""
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`
        break
      case "telegram":
        url = `https://t.me/share/url?url=${currentUrl}&text=${encodedText}`
        break
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Bagikan Rangkuman
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Pilih platform untuk membagikan ringkasan teks ini atau salin langsung ke clipboard Anda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-3 py-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("whatsapp")}
            className="flex items-center justify-start gap-2 h-10 w-full hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <WhatsAppIcon />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
            className="flex items-center justify-start gap-2 h-10 w-full hover:bg-foreground/10 hover:border-foreground/30 hover:text-foreground"
          >
            <XIcon />
            Twitter / X
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("telegram")}
            className="flex items-center justify-start gap-2 h-10 w-full hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <TelegramIcon />
            Telegram
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center justify-start gap-2 h-10 w-full hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
          >
            <Copy className="w-4 h-4 text-muted-foreground/85" />
            Salin Teks
          </Button>
        </div>
        <AlertDialogFooter className="sm:justify-end mt-2">
          <AlertDialogCancel>Tutup</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
