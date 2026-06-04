import React from "react"

export const EmptyState = () => (
  <div className="border border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm min-h-[250px] md:min-h-[300px] bg-muted/10 h-full animate-in fade-in duration-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mb-4 text-muted-foreground/50 w-12 h-12"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
    <p className="text-center">Hasil ringkasan Anda akan muncul di sini</p>
  </div>
)
