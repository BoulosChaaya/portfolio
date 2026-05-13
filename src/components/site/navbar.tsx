"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const links = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      <Sun suppressHydrationWarning className="h-4 w-4 text-zinc-600 dark:text-zinc-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon suppressHydrationWarning className="absolute h-4 w-4 text-zinc-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#f5f2ee]/85 dark:bg-[#151412]/85 backdrop-blur-md border-b border-black/8 dark:border-white/8">
      <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white dark:text-zinc-900">BC</span>
          </div>
          <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 hidden sm:block">
            Boulos Chaaya
          </span>
        </Link>

        {/* Desktop links — absolutely centered */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3.5 py-1.5 text-[13px] rounded-lg transition-colors",
                pathname === l.href
                  ? "text-zinc-900 dark:text-zinc-100 bg-black/6 dark:bg-white/10 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 z-10">
          <ThemeToggle />

          {/* Mobile — shadcn Sheet slides from right */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 bg-[#f5f2ee] dark:bg-[#151412] border-l border-black/8 dark:border-white/8 p-0"
              >
                <VisuallyHidden>
                  <SheetTitle>Navigation</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col pt-14 px-6">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "py-4 text-[16px] border-b border-black/6 dark:border-white/6 last:border-0 transition-colors",
                        pathname === l.href
                          ? "text-zinc-900 dark:text-zinc-100 font-medium"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}