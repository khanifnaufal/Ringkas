import Image from "next/image"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Show } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Ringkas Logo"
              width={28}
              height={28}
              className="w-6 h-6 md:w-7 md:h-7"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Ringkas
            </span>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-sm font-medium"
                id="navbar-sign-in-btn"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="default"
                size="sm"
                className="text-sm font-medium"
                id="navbar-sign-up-btn"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  id="navbar-history-link"
                >
                  <Link href="/history">Riwayat</Link>
                </Button>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  )
}
