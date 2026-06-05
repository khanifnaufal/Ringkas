"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useMemo, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MessageCircle, Square, Trash2, Send, X } from "lucide-react"
import type { UIMessage } from "ai"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface AskPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summaryId: string
  context: string
  filename?: string
}

export function AskPanel({
  open,
  onOpenChange,
  summaryId,
  context,
  filename,
}: AskPanelProps) {
  const { t, uiLanguage } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef("")
  // Keep context up-to-date in a ref so transport always uses latest value
  const contextRef = useRef(context)
  contextRef.current = context

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ask",
        prepareSendMessagesRequest: async ({ body, messages, id, trigger, messageId, ...rest }) => ({
          ...rest,
          body: {
            ...body,
            messages,
            id,
            trigger,
            messageId,
            context: contextRef.current.slice(0, 10000),
            filename,
            language: uiLanguage,
          },
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summaryId, uiLanguage]
  )

  const { messages, sendMessage, stop, setMessages, status } = useChat({
    id: `ask-${summaryId}`,
    transport,
  })

  const isLoading = status === "submitted" || status === "streaming"

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 80)
  }, [open])

  const syncHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const handleSend = () => {
    const text = inputRef.current.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    inputRef.current = ""
    if (textareaRef.current) {
      textareaRef.current.value = ""
      syncHeight()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  const getMessageText = (msg: UIMessage): string => {
    for (const part of msg.parts) {
      if (part.type === "text") return part.text
    }
    return ""
  }

  const dialogTitle = filename ?? t("qa.title")
  const quickQuestions = [
    t("qa.q1"),
    t("qa.q2"),
    t("qa.q3"),
    t("qa.q4"),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* showCloseButton=false → kita buat sendiri agar tidak overlap */}
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* ── Header ─────────────────────────────────── */}
        <DialogHeader className="flex-row items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-teal-500/5">
          <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />

          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-semibold text-teal-700 dark:text-teal-300 truncate leading-none">
              {dialogTitle}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("qa.subtitle")}
            </p>
          </div>

          {/* Tombol Clear & Close — terpisah, tidak overlap */}
          <div className="flex items-center gap-0.5 shrink-0">
            {hasMessages && (
              <button
                title={t("qa.clearChat")}
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              title={t("qa.close")}
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </DialogHeader>

        {/* ── Messages ───────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex flex-col gap-3 px-4 py-4 min-h-[260px] max-h-[400px] overflow-y-auto scrollbar-custom"
        >
          <AnimatePresence>
            {!hasMessages && (
              <motion.div
                key="quick-questions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <p className="text-xs text-muted-foreground font-medium">
                  {t("qa.quickStart")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage({ text: q })}
                      disabled={isLoading}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-teal-500/40 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-muted/50 border border-border/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                  {t("qa.hint")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat bubbles */}
          {messages.map((msg) => {
            const text = getMessageText(msg)
            if (!text) return null
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {text}
                </div>
              </motion.div>
            )
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Input ──────────────────────────────────── */}
        <div className="px-4 pb-4 pt-2 border-t border-border/40 bg-background">
          <div className="flex items-end gap-2 border border-border/60 rounded-xl bg-muted/30 px-3.5 py-2.5 focus-within:border-teal-500/60 focus-within:bg-background transition-all">
            <textarea
              ref={textareaRef}
              defaultValue=""
              onChange={(e) => {
                inputRef.current = e.target.value
                syncHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("qa.placeholder")}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground leading-relaxed min-h-[22px]"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => stop()}
                title={t("qa.stop")}
                className="shrink-0 p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                title={t("qa.send")}
                className="shrink-0 p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            {t("qa.enter")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
