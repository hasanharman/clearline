"use client"

import { ArrowRightIcon, DownloadIcon } from "lucide-react"
import { animate, useMotionValue, useMotionValueEvent } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { BalconyDrawing, FRAME, GLASS, type FrameKey, type GlassKey } from "@/components/balcony/balcony-drawing"
import { MM, W } from "@/components/balcony/scene"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMediaQuery } from "@/hooks/use-media-query"
import { downloadPng, downloadSvg } from "@/lib/export-svg"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHeader } from "./section-header"

export const SPEC_EVENT = "clearline:spec"

const frames = Object.keys(FRAME) as Exclude<FrameKey, "auto">[]
const glasses = Object.keys(GLASS) as GlassKey[]
const mm = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

function Swatch({ color, translucent }: { color: string; translucent?: boolean }) {
  return (
    <span
      aria-hidden
      className="size-3 shrink-0 rounded-full border border-foreground/25"
      style={{ background: color, opacity: translucent ? 0.85 : 1 }}
    />
  )
}

export function Configurator() {
  const [glass, setGlass] = useState<GlassKey>("clear")
  const [frame, setFrame] = useState<Exclude<FrameKey, "auto">>("graphite")
  const [panels, setPanels] = useState(4)
  const [folded, setFolded] = useState(false)
  const [explode, setExplode] = useState(0)
  const [labels, setLabels] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const wide = useMediaQuery("(min-width: 768px)")

  const openMv = useMotionValue(0)
  const [open, setOpen] = useState(0)
  useMotionValueEvent(openMv, "change", setOpen)
  useEffect(() => {
    const controls = animate(openMv, folded ? 1 : 0, { duration: 1.9, ease: [0.65, 0, 0.35, 1] })
    return () => controls.stop()
  }, [folded, openMv])

  const spec = `${site.system} · ${panels} panels · ${mm(panels * W * MM)} mm · ${GLASS[glass].label} glass · ${FRAME[frame].label} frame`
  const file = `${site.name.toLowerCase()}-${panels}-panel-${glass}-${frame}`

  const exportAs = async (kind: "svg" | "png") => {
    if (!svgRef.current) return
    try {
      if (kind === "svg") downloadSvg(svgRef.current, `${file}.svg`, spec)
      else await downloadPng(svgRef.current, `${file}.png`, spec)
      toast.success(`Drawing exported as ${kind.toUpperCase()}`)
    } catch {
      toast.error("Export failed. Try the other format.")
    }
  }

  const sendSpec = () => {
    window.dispatchEvent(new CustomEvent(SPEC_EVENT, { detail: spec }))
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="configure" className="border-t">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <SectionHeader
          index="04"
          eyebrow="Configure"
          title={
            <>
              Draw your balcony, <em className="font-serif font-normal tracking-[-0.02em]">then send it over.</em>
            </>
          }
          lede="Pick the glass, the frame colour and the number of panels. Fold it open, pull it apart, and export the drawing as SVG or PNG."
        />

        <div className="mt-14 grid overflow-hidden rounded-lg border bg-card lg:grid-cols-12">
          <aside className="flex flex-col gap-6 border-b p-5 sm:p-6 lg:col-span-4 lg:border-r lg:border-b-0 xl:col-span-3">
            <FieldGroup className="gap-6">
              <FieldSet className="gap-2.5">
                <FieldLegend variant="label">Glass</FieldLegend>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={1.5}
                  className="grid w-full grid-cols-2"
                  value={[glass]}
                  onValueChange={(v) => v[0] && setGlass(v[0] as GlassKey)}
                >
                  {glasses.map((k) => (
                    <ToggleGroupItem key={k} value={k} className="justify-start gap-2" aria-label={`${GLASS[k].label} glass`}>
                      <Swatch color={GLASS[k].color} translucent />
                      {GLASS[k].label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>

              <FieldSet className="gap-2.5">
                <FieldLegend variant="label">Frame</FieldLegend>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={1.5}
                  className="grid w-full grid-cols-2"
                  value={[frame]}
                  onValueChange={(v) => v[0] && setFrame(v[0] as Exclude<FrameKey, "auto">)}
                >
                  {frames.map((k) => (
                    <ToggleGroupItem key={k} value={k} className="justify-start gap-2" aria-label={`${FRAME[k].label} frame`}>
                      <Swatch color={FRAME[k].color} />
                      {FRAME[k].label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>

              <Field className="gap-3">
                <div className="flex items-baseline justify-between">
                  <FieldLabel id="panels-label">Panels</FieldLabel>
                  <span className="text-label text-muted-foreground tabular-nums">
                    {panels} × 720 = {mm(panels * W * MM)} mm
                  </span>
                </div>
                <Slider
                  aria-labelledby="panels-label"
                  min={3}
                  max={6}
                  step={1}
                  value={[panels]}
                  onValueChange={(v) => setPanels(Array.isArray(v) ? v[0] : v)}
                />
              </Field>

              <FieldSet className="gap-2.5">
                <FieldLegend variant="label">Position</FieldLegend>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={0}
                  className="w-full"
                  value={[folded ? "open" : "closed"]}
                  onValueChange={(v) => v[0] && setFolded(v[0] === "open")}
                >
                  <ToggleGroupItem value="closed" className="flex-1">
                    Closed
                  </ToggleGroupItem>
                  <ToggleGroupItem value="open" className="flex-1">
                    Folded open
                  </ToggleGroupItem>
                </ToggleGroup>
              </FieldSet>

              <Field className="gap-3">
                <div className="flex items-baseline justify-between">
                  <FieldLabel id="explode-label">Explode</FieldLabel>
                  <span className="text-label text-muted-foreground tabular-nums">{Math.round(explode * 100)}%</span>
                </div>
                <Slider
                  aria-labelledby="explode-label"
                  min={0}
                  max={100}
                  value={[explode * 100]}
                  onValueChange={(v) => setExplode((Array.isArray(v) ? v[0] : v) / 100)}
                />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="annotations">Annotations</FieldLabel>
                <Switch id="annotations" checked={labels} onCheckedChange={setLabels} />
              </Field>
            </FieldGroup>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => exportAs("svg")}>
                  <DownloadIcon data-icon="inline-start" />
                  SVG
                </Button>
                <Button variant="outline" onClick={() => exportAs("png")}>
                  <DownloadIcon data-icon="inline-start" />
                  PNG
                </Button>
              </div>
              <Button size="lg" onClick={sendSpec}>
                Quote this spec
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </aside>

          <div className="bg-drafting relative flex min-h-[440px] flex-col lg:col-span-8 xl:col-span-9">
            <Corners />
            <div className="relative h-[420px] flex-1 px-2 pt-8 sm:h-[520px] lg:h-auto lg:min-h-[640px]">
              <div className="absolute inset-0 px-3 pt-10 pb-4 sm:px-6">
                <BalconyDrawing
                  svgRef={svgRef}
                  panels={panels}
                  glass={glass}
                  frame={frame}
                  explode={explode}
                  open={open}
                  labels={labels ? (wide ? "text" : "number") : "none"}
                  dims
                  camera
                  title={`Drawing of a ${panels}-panel glass balcony with ${GLASS[glass].label.toLowerCase()} glass`}
                />
              </div>
              <p className="text-label absolute top-3 left-4 text-muted-foreground">Fig. 04 — Live drawing</p>
            </div>
            <dl className="relative grid grid-cols-2 border-t bg-background/80 backdrop-blur-sm sm:grid-cols-4">
              {[
                ["System", site.system],
                ["Panels", `${panels} × 720 mm`],
                ["Glass", `10 mm ${GLASS[glass].label}`],
                ["Frame", FRAME[frame].label],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={cn("px-4 py-3", i % 2 === 1 && "border-l", i >= 2 && "border-t sm:border-t-0", i === 2 && "sm:border-l")}
                >
                  <dt className="text-label text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Crop marks in the drawing's corners, like a printed sheet. */
function Corners() {
  const mark = "pointer-events-none absolute size-3 border-foreground/40"
  return (
    <>
      <span className={`${mark} top-2 left-2 border-t border-l`} />
      <span className={`${mark} top-2 right-2 border-t border-r`} />
    </>
  )
}
