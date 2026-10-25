"use client"

import { DraftingCompassIcon, ScrollTextIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { nav, site } from "@/lib/site"

const subscribe = () => () => {}

export function Nav() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const blueprint = mounted && resolvedTheme === "dark"

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
          <Logo />
          <span className="text-[0.95rem] font-semibold tracking-tight">{site.name}</span>
          <span className="text-label hidden text-muted-foreground sm:inline">{site.system}</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" render={<a href={item.href} />} nativeButton={false}>
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={blueprint ? "Switch to paper" : "Switch to blueprint"}
                  onClick={() => setTheme(blueprint ? "light" : "dark")}
                />
              }
            >
              {blueprint ? <ScrollTextIcon /> : <DraftingCompassIcon />}
            </TooltipTrigger>
            <TooltipContent>{blueprint ? "Paper" : "Blueprint"} mode</TooltipContent>
          </Tooltip>
          <Button size="sm" render={<a href="#contact" />} nativeButton={false}>
            Get a quote
          </Button>
        </div>
      </div>
    </header>
  )
}
