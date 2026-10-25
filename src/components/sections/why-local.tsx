import { reasons } from "@/lib/site"
import { SectionHeader } from "./section-header"

export function WhyLocal() {
  return (
    <section id="why" className="border-t">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <SectionHeader
          index="03"
          eyebrow="Why local"
          title={
            <>
              Made here. Measured twice. <em className="font-serif font-normal tracking-[-0.02em]">Fitted once.</em>
            </>
          }
          lede="Making the glass ourselves isn't just about pride. It changes what you get and how fast you get it."
        />
        <dl className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <div key={r.title} className="flex flex-col gap-3 border-t py-6">
              <dt className="flex items-baseline gap-3">
                <span className="text-label text-signal">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg font-medium tracking-tight">{r.title}</span>
              </dt>
              <dd className="text-sm leading-relaxed text-pretty text-muted-foreground">{r.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
