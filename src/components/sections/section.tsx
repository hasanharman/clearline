import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t">
      <div className={cn("mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32", className)}>{children}</div>
    </section>
  )
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  accent,
  lede,
}: {
  index: string
  eyebrow: string
  title: string
  accent?: string
  lede?: string
}) {
  return (
    <header className="grid gap-5 lg:grid-cols-12 lg:gap-8">
      <p className="text-label flex items-center gap-3 text-muted-foreground lg:col-span-3 lg:pt-3">
        <span className="text-signal">{index}</span>
        <span className="h-px w-8 bg-border" />
        {eyebrow}
      </p>
      <h2 className="max-w-[18ch] text-4xl leading-[1.02] font-medium tracking-[-0.04em] text-balance sm:text-5xl lg:col-span-6 xl:text-6xl">
        {title}
        {accent && (
          <>
            {" "}
            <em className="font-serif font-normal tracking-[-0.02em]">{accent}</em>
          </>
        )}
      </h2>
      {lede && (
        <p className="max-w-[46ch] self-end text-[0.95rem] leading-relaxed text-pretty text-muted-foreground lg:col-span-3">
          {lede}
        </p>
      )}
    </header>
  )
}
