"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { SummaryResult } from "@/components/summary-result"

export default function Home() {
  const [text, setText]       = useState("")
  const [length, setLength]   = useState("sedang")
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message ?? "Terjadi error, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Image src="/logo.svg" alt="Ringkas Logo" width={32} height={32} />
        <h1 className="text-2xl font-semibold">Ringkas</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Paste teks apapun — artikel, email, laporan
      </p>

      <Textarea
        placeholder="Paste teks di sini..."
        className="min-h-[200px] mb-3"
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <div className="flex items-center gap-3 mb-6">
        {["pendek", "sedang", "detail"].map(l => (
          <button
            key={l}
            onClick={() => setLength(l)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors 
              ${length === l
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
              }`}
          >
            {l}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {text.trim().split(/\s+/).filter(Boolean).length} kata
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || text.trim().length < 50}
        className="w-full"
      >
        {loading ? "Memproses..." : "Summarize"}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-3">{error}</p>
      )}
      {result && <SummaryResult data={result} className="mt-8" />}
    </main>
  )
}