import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/lib/site"
import { SectionHeader } from "./section-header"

export function Faq() {
  return (
    <section id="faq" className="border-t">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:px-10 lg:py-32">
        <div className="lg:col-span-12">
          <SectionHeader index="05" eyebrow="Questions" title="Things people ask before they call." />
        </div>
        <Accordion className="border-t lg:col-span-6 lg:col-start-4" defaultValue={["0"]}>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={String(i)} className="border-b">
              <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
                <span className="flex gap-4">
                  <span className="text-label pt-1 text-signal">{String(i + 1).padStart(2, "0")}</span>
                  {f.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-8 pb-5 pl-9 text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
