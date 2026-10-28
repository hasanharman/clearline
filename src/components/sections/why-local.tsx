import { reasons } from "@/lib/site"
import { pad } from "@/lib/utils"
import { Section, SectionHeader } from "./section"

export function WhyLocal() {
  return (
    <Section id="why">
      <SectionHeader
        index="03"
        eyebrow="Why local"
        title="Made here. Measured twice."
        accent="Fitted once."
        lede="Making the glass ourselves isn't just about pride. It changes what you get and how fast you get it."
      />
      <dl className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r, i) => (
          <div key={r.title} className="flex flex-col gap-3 border-t py-6">
            <dt className="flex items-baseline gap-3">
              <span className="text-label text-signal">{pad(i + 1)}</span>
              <span className="text-lg font-medium tracking-tight">{r.title}</span>
            </dt>
            <dd className="text-sm leading-relaxed text-pretty text-muted-foreground">{r.body}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
