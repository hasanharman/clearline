"use client"

import { DraftingCompassIcon, ScrollTextIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { nav, site } from "@/lib/site"

const subscribe = () => () => {}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

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
                  aria-label="Source on GitHub"
                  render={<a href={site.repo} target="_blank" rel="noreferrer" />}
                  nativeButton={false}
                />
              }
            >
              <GithubIcon />
            </TooltipTrigger>
            <TooltipContent>Source on GitHub</TooltipContent>
          </Tooltip>
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
