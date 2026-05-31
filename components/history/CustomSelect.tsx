"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronDown } from "lucide-react"

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  widthClass?: string
  placeholder?: string
}

export function CustomSelect({ value, onChange, options, widthClass = "w-[140px]", placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-8 px-3 py-1.5 text-xs rounded-md border border-border bg-card text-foreground shadow-xs hover:bg-muted/50 transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      >
        <span className="truncate capitalize">{selectedOption ? selectedOption.label : (placeholder ?? "Pilih")}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0 ml-1.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-full rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in duration-100">
          <div className="max-h-60 overflow-y-auto scrollbar-thin flex flex-col">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer capitalize ${
                  value === opt.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
