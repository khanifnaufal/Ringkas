"use client"

import { SignUp, useUser } from "@clerk/nextjs"
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
      "p-0 gap-0 shadow-none w-full",
    ].join(" "),
    scrollBox: "w-full overflow-visible",

    // Header — hidden, we use our own
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    header: "hidden",

    // Social OAuth buttons
    socialButtonsRoot: "gap-2",
    socialButtonsBlockButton: [
      "border border-border bg-background text-foreground",
      "hover:bg-muted transition-all duration-200 rounded-xl h-10",
      "text-sm font-medium shadow-sm",
    ].join(" "),
    socialButtonsBlockButtonText: "font-medium text-foreground",

    // Divider
    dividerRow: "my-3",
    dividerText: "text-muted-foreground text-xs",
    dividerLine: "bg-border",

    // Form fields
    formFieldLabel: "text-sm font-medium text-foreground mb-1",
    formFieldInput: [
      "h-10 rounded-xl border border-border bg-background px-4 text-sm",
      "text-foreground placeholder:text-muted-foreground",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      "transition-all duration-200",
    ].join(" "),
    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",

    // Primary button
    formButtonPrimary: [
      "h-10 rounded-xl bg-primary text-primary-foreground",
      "hover:bg-primary/90 active:scale-[0.98]",
      "font-medium text-sm transition-all duration-200 shadow-sm",
      "w-full mt-1",
    ].join(" "),

    // Footer — hide Clerk's default, we use custom below
    footer: "hidden",
    footerActionText: "hidden",
    footerActionLink: "hidden",

    // Error states
    formFieldErrorText: "text-destructive text-xs mt-1",
    formGlobalErrorText: "text-destructive text-sm",
    alertText: "text-sm",
    alert: "rounded-xl border-destructive/30 bg-destructive/10 text-destructive",

    // Loading spinner
    spinner: "text-primary",

    // Internal card wrapper
    cardBox: "p-6 rounded-2xl w-full",
  },
}

export default function SignUpPage() {
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
    <div className="h-screen bg-background flex overflow-y-auto lg:overflow-hidden">
      {/* Right: Auth form (on the left side for sign-up — variation) */}
      <div className="flex flex-1 flex-col items-center p-4 sm:p-6 overflow-y-auto no-scrollbar h-full">
        <div className="w-full max-w-md my-auto py-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <Image src="/logo.svg" alt="Ringkas" width={32} height={32} />
            <span className="text-xl font-bold text-foreground">Ringkas</span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-foreground mb-2">Buat akun baru</h1>
            <p className="text-muted-foreground text-sm">
              Daftar gratis dan mulai merangkum teks dengan AI
            </p>
          </div>

          {/* Clerk Sign Up — fully custom-styled */}
          <SignUp
            appearance={clerkAppearance}
            routing="hash"
          />

          {/* Custom footer */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-bl from-primary/10 via-primary/5 to-background flex-col items-center justify-center p-12">
        {/* Background blobs */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-52 h-52 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Ringkas" width={52} height={52} />
            <span className="text-4xl font-bold tracking-tight text-foreground">Ringkas</span>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Bergabunglah dan hemat waktu membaca dengan ringkasan AI yang cerdas dan akurat.
          </p>

          {/* Stats / social proof */}
          <div className="grid grid-cols-3 gap-6 w-full">
            {[
              { value: "10x", label: "Lebih cepat baca" },
              { value: "AI", label: "Powered" },
              { value: "100%", label: "Gratis" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-primary/10 border border-primary/20"
              >
                <span className="text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
