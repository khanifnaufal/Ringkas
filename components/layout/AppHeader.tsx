import Image from "next/image"

import { useLanguage } from "@/components/providers/LanguageProvider"

export function AppHeader() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16">
      <div className="flex items-center gap-3 mb-4">
        <Image
          src="/logo.svg"
          alt="Ringkas Logo"
          width={48}
          height={48}
          className="w-10 h-10 md:w-12 md:h-12"
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          {t("header.title")}
        </h1>
      </div>
      <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
        {t("header.subtitle")}
      </p>
    </div>
  )
}
