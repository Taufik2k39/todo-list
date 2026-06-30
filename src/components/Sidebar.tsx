"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, User, LogOut, ClipboardList, Sun, Moon, Info } from "lucide-react"
import { useTheme } from "@/composable/useTheme"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"
import { Card } from "./ui/card"
import { Separator } from "./ui/separator"

type SidebarProps = {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      try {
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) {
          setUserId(null)
          return
        }
        const result = await response.json()
        setUserId(result?.data?.id ?? null)
      } catch {
        setUserId(null)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    void loadProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/auth/login")
      router.refresh()
    }
  }

  // Liquid glass style
  const glassButtonClass =
    "mt-6 h-14 w-full justify-start rounded-2xl px-5 text-lg font-semibold shadow-lg " +
    "backdrop-blur-md bg-gradient-to-br from-white/30 to-white/10 " +
    "border border-white/30 text-black dark:text-white " +
    "hover:from-white/40 hover:to-white/20 transition-all duration-300"

  const isTasksActive = pathname === "/"
  const isProfileActive = userId ? pathname.startsWith(`/auth/${userId}`) : pathname.startsWith("/auth")

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-white/20 bg-linear-to-tr from-orange-400/60 via-amber-400/60 to-yellow-400/60 " +
          "dark:from-lime-500/80 dark:via-green-500/80 dark:to-emerald-500/80 backdrop-blur-xl p-5",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center">
        <ClipboardList className="mr-2 h-6 w-6 text-black dark:text-white" />
        <span className="text-2xl font-bold text-black dark:text-white">Todo Play</span>
      </div>

      {/* Tasks */}
      <Button
        asChild
        variant="default"
        className={cn(
          glassButtonClass,
          isTasksActive ? "ring-2 ring-lime-400" : ""
        )}
      >
        <Link href="/">
          <Home className="mr-2 h-5 w-5" />
          Tasks
        </Link>
      </Button>

      {/* Profile */}
      <Button
        asChild
        variant="outline"
        disabled={isLoadingProfile}
        className={cn(
          glassButtonClass,
          isProfileActive ? "ring-2 ring-lime-400" : ""
        )}
      >
        <Link href={userId ? `/auth/${userId}` : "/auth/login"}>
          <User className="mr-2 h-5 w-5" />
          Profile
        </Link>
      </Button>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className={glassButtonClass}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>

      <Separator className="my-8 border-white/20" />
      <Card className="hidden border-white/20 bg-white/15 p-2 text-white md:mt-3 md:block">
        <Calendar className="w-full rounded-xl bg-white/10" />
      </Card>

      {/*about*/}
      <Button
        asChild
        variant="outline"
        className={cn(glassButtonClass, "mt-4")}
      >
        <Link href="/about">
          <Info className="mr-2 h-5 w-5" />
          About
        </Link>
      </Button>

      {/* Theme toggle */}
      <Button
        type="button"
        variant="outline"
        onClick={toggleTheme}
        className={cn(glassButtonClass, "mt-auto")}
      >
        {theme === "dark" ? <Moon className="mr-2 h-5 w-5" /> : <Sun className="mr-2 h-5 w-5" />}
        Theme: {theme === "dark" ? "Dark" : "Light"}
      </Button>
    </aside>
  )
}
