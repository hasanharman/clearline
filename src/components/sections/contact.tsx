"use client"

import { ArrowRightIcon } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { IsoBuilding } from "@/components/iso/iso-building"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { site } from "@/lib/site"
import { onSpec } from "@/lib/spec-event"
import { Section, SectionHeader } from "./section"

export function Contact() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [tried, setTried] = useState(false)

  useEffect(
    () =>
      onSpec((spec) => {
        setMessage((m) => (m.trim() ? `${m}\n\nSpec: ${spec}` : `Hi! I'd like a quote for this setup:\n${spec}`))
        toast("Spec added to your message")
      }),
    []
  )

  const nameOk = name.trim() !== ""
  const phoneOk = phone.replace(/\D/g, "").length >= 7
  const nameInvalid = tried && !nameOk
  const phoneInvalid = tried && !phoneOk

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!nameOk || !phoneOk) return
    const body = `${message}\n\n— ${name}\n${phone}`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Glass balcony quote — ${name}`)}&body=${encodeURIComponent(body)}`
    toast.success("Opening your email app…")
  }

  return (
    <Section id="contact">
      <SectionHeader
        index="06"
        eyebrow="Contact"
        title="Your balcony is"
        accent="next."
        lede="Tell us where it is and roughly how wide. We'll come and measure, then quote you for the exact size."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <form onSubmit={submit} noValidate className="flex flex-col gap-8 lg:col-span-5">
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={nameInvalid || undefined}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={nameInvalid || undefined}
                />
                {nameInvalid && <FieldError>Tell us who to ask for.</FieldError>}
              </Field>
              <Field data-invalid={phoneInvalid || undefined}>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={phoneInvalid || undefined}
                />
                {phoneInvalid && <FieldError>We need a number to call you back.</FieldError>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="message">About your balcony</FieldLabel>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Neighbourhood, floor, rough width, open or closed parapet…"
              />
              <FieldDescription>Tip: use “Quote this spec” in the configurator to drop your drawing in here.</FieldDescription>
            </Field>
          </FieldGroup>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg">
              Request a site visit
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <span className="text-label text-muted-foreground">Free measurement · No obligation</span>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6">
            {[
              ["Phone", site.phone, `tel:${site.phone.replace(/\s/g, "")}`],
              ["Email", site.email, `mailto:${site.email}`],
              ["Workshop", site.address],
              ["Hours", site.hours],
            ].map(([k, v, href]) => (
              <div key={k} className="flex flex-col gap-1">
                <dt className="text-label text-muted-foreground">{k}</dt>
                <dd className="text-sm">
                  {href ? (
                    <a href={href} className="underline-offset-4 hover:underline">
                      {v}
                    </a>
                  ) : (
                    v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </form>

        <div className="bg-drafting relative min-h-[420px] overflow-hidden rounded-lg border lg:col-span-7">
          <div className="absolute inset-0 p-6 pt-10 sm:p-10">
            <IsoBuilding />
          </div>
          <p className="text-label absolute top-3 left-4 text-muted-foreground">Fig. 06 — Hover a balcony</p>
        </div>
      </div>
    </Section>
  )
}
