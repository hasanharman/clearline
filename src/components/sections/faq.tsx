import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/lib/site"
import { pad } from "@/lib/utils"
import { Section, SectionHeader } from "./section"

export function Faq() {
  return (
    <Section id="faq" className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <SectionHeader index="05" eyebrow="Questions" title="Things people ask before they call." />
      </div>
      <Accordion className="border-t lg:col-span-6 lg:col-start-4" defaultValue={["0"]}>
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={String(i)} className="border-b">
            <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
              <span className="flex gap-4">
                <span className="text-label pt-1 text-signal">{pad(i + 1)}</span>
                {f.q}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pr-8 pb-5 pl-9 text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}
