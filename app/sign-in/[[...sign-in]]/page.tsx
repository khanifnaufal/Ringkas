"use client"

import { SignIn, useUser } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const clerkAppearance = {
  layout: {
    logoPlacement: "none" as const,
    showOptionalFields: true,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "iconButton" as const,
  },
  elements: {
    // Root card
    rootBox: "w-full",
    card: [
      "bg-card border border-border shadow-xl rounded-2xl",
      "p-0 gap-0 shadow-none",
    ].join(" "),

    // Header
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    header: "hidden",

    // Social OAuth buttons
    socialButtonsRoot: "gap-3",
    socialButtonsBlockButton: [
      "border border-border bg-background text-foreground",
      "hover:bg-muted transition-all duration-200 rounded-xl h-11",
      "text-sm font-medium shadow-sm",
    ].join(" "),
    socialButtonsBlockButtonText: "font-medium text-foreground",

    // Divider
    dividerRow: "my-5",
    dividerText: "text-muted-foreground text-xs",
    dividerLine: "bg-border",

    // Form fields
    formFieldLabel: "text-sm font-medium text-foreground mb-1.5",
    formFieldInput: [
      "h-11 rounded-xl border border-border bg-background px-4 text-sm",
      "text-foreground placeholder:text-muted-foreground",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      "transition-all duration-200",
    ].join(" "),
    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",

    // Primary button
    formButtonPrimary: [
      "h-11 rounded-xl bg-primary text-primary-foreground",
      "hover:bg-primary/90 active:scale-[0.98]",
      "font-medium text-sm transition-all duration-200 shadow-sm",
      "w-full mt-1",
    ].join(" "),

    // Footer
    footer: "hidden",
    footerActionText: "hidden",
    footerActionLink: "hidden",

    // Error
    formFieldErrorText: "text-destructive text-xs mt-1",
    formGlobalErrorText: "text-destructive text-sm",
    alertText: "text-sm",
    alert: "rounded-xl border-destructive/30 bg-destructive/10 text-destructive",

    // Loading spinner
    spinner: "text-primary",

    // Internal card wrapper
    cardBox: "p-8 rounded-2xl",
  },
}

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col items-center justify-center p-12">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Ringkas" width={52} height={52} />
            <span className="text-4xl font-bold tracking-tight text-foreground">Ringkas</span>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Tempel teks atau URL apa pun — artikel, email, laporan —
            dan biarkan AI merangkumnya secara instan.
          </p>

          {/* Feature bullets */}
          <div className="flex flex-col gap-4 w-full text-left">
            {[
              { icon: "⚡", text: "Rangkuman instan dengan AI mutakhir" },
              { icon: "🎯", text: "Pilih panjang ringkasan sesuai kebutuhan" },
              { icon: "🔗", text: "Langsung dari URL atau tempel teks" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="text-xl">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <Image src="/logo.svg" alt="Ringkas" width={32} height={32} />
            <span className="text-xl font-bold text-foreground">Ringkas</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Selamat datang kembali</h1>
            <p className="text-muted-foreground text-sm">
              Masuk untuk melanjutkan merangkum teks dengan AI
            </p>
          </div>

          {/* Clerk Sign In — fully custom-styled */}
          <SignIn
            appearance={clerkAppearance}
            routing="hash"
          />

          {/* Custom footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
