"use client"

import { useState, useEffect } from "react"

interface UseTypewriterOptions {
  /** Milliseconds per character. Lower = faster. Default: 15 */
  speed?: number
}

interface UseTypewriterReturn {
  displayed: string
  isDone: boolean
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const { speed = 15 } = options
  const [displayed, setDisplayed] = useState("")
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayed("")
      setIsDone(false)
      return
    }

    // Reset on new text
    setDisplayed("")
    setIsDone(false)

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setIsDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, isDone }
}
