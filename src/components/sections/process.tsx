"use client"

import { motion, useReducedMotion, type Transition } from "motion/react"
import { useId, type ReactNode } from "react"

import { fitBoxes, HatchDef, IsoBox, IsoLine } from "@/components/iso/iso-box"
import { isoText, points, project, projectPoints, tint, type V3 } from "@/lib/iso"
import { process } from "@/lib/site"
import { Section, SectionHeader } from "./section"

const loop: Transition = { duration: 2.4, repeat: Infinity, repeatType: "mirror", repeatDelay: 0.9, ease: [0.65, 0, 0.35, 1] }

/** Screen-space offset for a world-space move. */
const shift = (d: V3) => {
  const [x, y] = project(d)
  return { x, y }
}

function Scene({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className="size-full overflow-visible">
      {children}
    </svg>
  )
}

function Mover({ to, children, delay = 0 }: { to: V3; children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.g
      initial={{ x: 0, y: 0 }}
      whileInView={reduce ? undefined : shift(to)}
      viewport={{ amount: 0.5 }}
      transition={{ ...loop, delay }}
    >
      {children}
    </motion.g>
  )
}

function CutScene() {
  const reduce = useReducedMotion()
  return (
    <Scene viewBox={fitBoxes([[[0, -8, -18], [100, 72, 31]]])} label="Glass sheet on a cutting table">
      <IsoBox a={[44, -8, -18]} b={[52, -4, 26]} mat="steel" />
      {[[94, 2], [2, 56], [94, 56]].map(([x, y]) => (
        <IsoBox key={`${x}${y}`} a={[x, y, -18]} b={[x + 4, y + 4, 0]} mat="steel" />
      ))}
      <IsoBox a={[0, 0, 0]} b={[100, 64, 6]} />
      <IsoBox a={[10, 8, 6]} b={[88, 56, 7.2]} mat="glass" />
      <motion.polyline
        points={points([project([48, 8, 7.3]), project([48, 56, 7.3])])}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduce ? 1 : 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ amount: 0.5 }}
        transition={loop}
      />
      <Mover to={[0, 40, 0]}>
        <IsoLine pts={[[48, 8, 7.2], [48, 8, 12]]} />
        <IsoBox a={[45, 4, 12]} b={[51, 12, 26]} mat="dark" />
      </Mover>
      <IsoBox a={[43, -8, 26]} b={[53, 72, 31]} mat="steel" />
      <IsoBox a={[44, 68, -18]} b={[52, 72, 26]} mat="steel" />
    </Scene>
  )
}

function cylinder(c: V3, r: number, h: number) {
  const ring = (z: number, from: number, to: number) => {
    const out = []
    for (let i = 0; i <= 16; i++) {
      const a = from + ((to - from) * i) / 16
      out.push(project([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), z]))
    }
    return out
  }
  const q = Math.PI / 4
  return {
    side: points([...ring(c[2], -q, 3 * q), ...ring(c[2] + h, 3 * q, -q)]),
    top: points(ring(c[2] + h, 0, Math.PI * 2)),
  }
}

function EdgeScene() {
  const reduce = useReducedMotion()
  const wheel = cylinder([68, 14.6, 26], 8, 6)
  const spark = (d: V3) => [project([60, 14.6, 29]), project([60 + d[0], 14.6 + d[1], 29 + d[2]])]
  return (
    <Scene viewBox={fitBoxes([[[0, 0, 0], [110, 34, 62]]])} label="Edge grinding wheel polishing a glass panel">
      <IsoBox a={[0, 0, 0]} b={[110, 34, 10]} />
      <IsoBox a={[86, 2, 10]} b={[96, 10, 62]} mat="steel" />
      <Mover to={[6, 0, 0]}>
        <IsoBox a={[6, 14, 10]} b={[54, 15.2, 56]} mat="glass" />
      </Mover>
      <polygon points={wheel.side} fill={tint("var(--rubber)", 0.8)} stroke="var(--ink)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <polygon points={wheel.top} fill={tint("var(--steel)", 0.9)} stroke="var(--ink)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <IsoLine pts={[[68, 14.6, 32], [68, 14.6, 40]]} />
      <IsoBox a={[62, 8.6, 40]} b={[74, 20.6, 52]} mat="dark" />
      <IsoBox a={[70, 4, 52]} b={[96, 10, 57]} mat="steel" />
      <motion.g
        initial={{ opacity: reduce ? 1 : 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ amount: 0.5 }}
        transition={{ ...loop, ease: [1, 0, 1, 0] }}
        stroke="var(--signal)"
        strokeWidth={1.2}
        strokeLinecap="round"
      >
        {([[-2, 10, 6], [0, 12, 1], [2, 9, -4], [-4, 8, 10], [1, 14, -2]] as V3[]).map((d, i) => (
          <polyline key={i} points={points(spark(d))} fill="none" vectorEffect="non-scaling-stroke" />
        ))}
      </motion.g>
    </Scene>
  )
}

function TemperScene() {
  const glow = [[52, 56, 14], [96, 56, 14], [96, 56, 22], [52, 56, 22]] as V3[]
  return (
    <Scene viewBox={fitBoxes([[[0, -2, 0], [104, 56, 42]]], [[74, 28, 58]])} label="Glass panel entering a tempering furnace">
      <IsoBox a={[0, 2, 0]} b={[44, 5, 10]} />
      {[2, 10, 18, 26, 34].map((x) => (
        <IsoBox key={x} a={[x, 5, 8]} b={[x + 3, 49, 11]} mat="steel" />
      ))}
      <Mover to={[42, 0, 0]}>
        <IsoBox a={[4, 9, 11]} b={[34, 45, 12]} mat="glass" />
      </Mover>
      <IsoBox a={[0, 49, 0]} b={[44, 52, 10]} />
      <IsoBox a={[44, -2, 0]} b={[104, 56, 42]} mat="dark" />
      <polygon points={projectPoints(glow)} fill="var(--signal)" fillOpacity={0.9} stroke="var(--ink)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <text
        transform={isoText("xz", project([74, 56, 30]))}
        fontSize={6}
        textAnchor="middle"
        fill="var(--face)"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        ≈ 620 °C
      </text>
      {[0, 1, 2].map((i) => {
        const [x, y] = project([60 + i * 14, 26, 46])
        return (
          <path
            key={i}
            d={`M${x} ${y} q 3 -4 0 -8 t 0 -8`}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1.2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ animation: `heat-rise 2.2s ${i * 0.5}s ease-out infinite` }}
          />
        )
      })}
    </Scene>
  )
}

function FitScene() {
  const reduce = useReducedMotion()
  const hatch = `hatch-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const panel = (i: number) => {
    const x0 = 2 + 32 * i
    const x1 = x0 + 31.6
    return (
      <g key={i}>
        <IsoBox a={[x0, 6.6, 19]} b={[x1, 9.4, 22]} mat="frame" />
        <IsoBox a={[x0 + 0.2, 7.4, 22]} b={[x1 - 0.2, 8.6, 76]} mat="glass" />
        <IsoBox a={[x0, 6.6, 76]} b={[x1, 9.4, 79]} mat="frame" />
      </g>
    )
  }
  return (
    <Scene viewBox={fitBoxes([[[0, -8, 0], [100, 18, 104]]])} label="Glass panel being lowered into its track">
      <HatchDef id={hatch} />
      <IsoBox a={[0, -8, 0]} b={[100, 18, 16]} mat="concrete" dashed hatch={hatch} />
      <IsoBox a={[2, 4, 16]} b={[98, 12, 19]} mat="frame" />
      {panel(0)}
      {panel(1)}
      <motion.g
        initial={shift([0, 0, reduce ? 0 : 24])}
        whileInView={shift([0, 0, 0])}
        viewport={{ amount: 0.5 }}
        transition={reduce ? { duration: 0 } : loop}
      >
        {panel(2)}
      </motion.g>
      <IsoBox a={[2, 4, 82]} b={[98, 12, 86]} mat="frame" />
      <IsoLine pts={[[100, 8, 104], [100, 8, 86]]} signal dashed />
      <IsoLine pts={[[98.5, 8, 89], [100, 8, 86], [101.5, 8, 89]]} signal />
    </Scene>
  )
}

const scenes = [CutScene, EdgeScene, TemperScene, FitScene]

export function Process() {
  return (
    <Section id="process">
      <SectionHeader
        index="02"
        eyebrow="Process"
        title="From raw sheet to your balcony,"
        accent="made locally."
        lede="Most installers order finished panels and wait. We buy the glass as raw sheet and do every step ourselves, in a workshop you can drive to."
      />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {process.map((step, i) => {
          const Art = scenes[i]
          return (
            <li key={step.no} className="flex flex-col bg-background p-5 sm:p-6">
              <div className="bg-drafting relative aspect-[5/4] rounded-md border">
                <div className="absolute inset-0 p-8">
                  <Art />
                </div>
                <span className="text-label absolute top-2.5 left-3 text-muted-foreground">Fig. {step.no}</span>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <span className="text-label text-signal">{step.no}</span>
                <span className="text-label text-muted-foreground">{step.note}</span>
              </div>
              <h3 className="mt-2 text-2xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{step.body}</p>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
