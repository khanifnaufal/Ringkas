"use client"

import { Navbar } from "@/components/layout/Navbar"
import { HistoryPage } from "@/components/history/HistoryPage"

export default function HistoryRoute() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 lg:py-20 w-full">
        <HistoryPage />
      </main>
    </>
  )
}
