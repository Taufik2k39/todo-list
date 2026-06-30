"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type AppShellProps = {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const hideSidebar =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/page/auth/login" ||
    pathname === "/page/auth/register"

  return (
    <div className="flex h-screen w-full overflow-hidden bg-linear-to-tr from-orange-200 via-amber-200 to-yellow-200 dark:bg-linear-to-tr dark:from-lime-800 dark:via-green-800 dark:to-emerald-800">
      {hideSidebar ? null : (
        <div className="fixed inset-y-0 left-0 z-30 hidden md:block">
          <Sidebar className="h-screen w-56" />
        </div>
      )}

      <div className={`flex h-full w-full flex-col ${hideSidebar ? "" : "md:pl-56"}`}>
        {hideSidebar ? null : (
          <header className="flex items-center justify-between border-b-4 border-black bg-linear-to-tr from-orange-200 via-amber-200 to-yellow-200 dark:bg-linear-to-tr dark:from-lime-800 dark:via-green-800 dark:to-emerald-800 px-4 py-3 md:hidden">
            <h1 className="text-xl font-bold text-black dark:text-white">Todo list</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-2 border-black bg-yellow-200 text-black hover:bg-yellow-100 dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-600"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-56 max-w-[85vw] border-0 bg-transparent p-0 shadow-none"
                showCloseButton={false}
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Open the app navigation links
                </SheetDescription>
                <Sidebar className="h-full w-full" />
              </SheetContent>
            </Sheet>
          </header>
        )}

        <main className="flex-1 overflow-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}