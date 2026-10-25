"use client"

import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"

import { fitBoxes, IsoBox } from "@/components/iso/iso-box"
import { points, project, type V3 } from "@/lib/iso"

const BAYS = 5
const FLOORS = 5
const BAY = 40
const STOREY = 34
const DEPTH = 56
const WIDTH = BAYS * BAY
const HEIGHT = FLOORS * STOREY + 6

const quad = (ps: V3[]) => points(ps.map(project))
// Deterministic "lights on" pattern for the side windows.
const lit = (i: number) => (i * 7 + 3) % 5 === 0

function FacadeOpenings() {
  const out = []
  for (let f = 0; f < FLOORS; f++)
    for (let b = 0; b < BAYS; b++) {
      const z0 = f * STOREY + 4
      const x0 = b * BAY + (f === 0 && b === 2 ? 14 : 10)
      const x1 = b * BAY + (f === 0 && b === 2 ? 26 : 30)
      out.push(
        <polygon
          key={`${f}-${b}`}
          points={quad([[x0, DEPTH, z0], [x1, DEPTH, z0], [x1, DEPTH, z0 + 24], [x0, DEPTH, z0 + 24]])}
          fill="var(--shade)"
          fillOpacity={0.22}
          stroke="var(--ink)"
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      )
    }
  for (let f = 0; f < FLOORS; f++)
    for (let w = 0; w < 4; w++) {
      const y0 = 6 + w * 15
      const z0 = f * STOREY + 9
      out.push(
        <polygon
          key={`s-${f}-${w}`}
          points={quad([[WIDTH, y0, z0], [WIDTH, y0 + 8, z0], [WIDTH, y0 + 8, z0 + 16], [WIDTH, y0, z0 + 16]])}
          fill={lit(f * 4 + w) ? "var(--signal)" : "var(--shade)"}
          fillOpacity={lit(f * 4 + w) ? 0.55 : 0.22}
          stroke="var(--ink)"
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      )
    }
  return <>{out}</>
}

function Balcony({ f, b, hot, onHover }: { f: number; b: number; hot: boolean; onHover: (on: boolean) => void }) {
  const reduce = useReducedMotion()
  const x0 = b * BAY + 4
  const x1 = b * BAY + 36
  const z = f * STOREY
  const y1 = DEPTH + 13
  const g = 26
  const glass = hot ? "var(--signal)" : "oklch(0.82 0.08 205)"
  const pane = (ps: V3[], k: string) => (
    <polygon
      key={k}
      points={quad(ps)}
      fill={glass}
      fillOpacity={hot ? 0.45 : 0.3}
      stroke="var(--ink)"
      strokeWidth={0.8}
      vectorEffect="non-scaling-stroke"
      style={{ transition: "fill 200ms, fill-opacity 200ms" }}
    />
  )
  const [dx, dy] = project([0, 0, 10])
  return (
    <g onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)} className="cursor-crosshair">
      <IsoBox a={[x0 - 2, DEPTH, z]} b={[x1 + 2, y1 + 1, z + 3]} mat="concrete" />
      <motion.g
        initial={reduce ? false : { opacity: 0, x: dx, y: dy }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.25 + (FLOORS - f) * 0.16 + b * 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {pane([[x1, DEPTH, z + 3], [x1, y1, z + 3], [x1, y1, z + 3 + g], [x1, DEPTH, z + 3 + g]], "side")}
        {[0, 1, 2, 3].map((i) => {
          const a = x0 + ((x1 - x0) / 4) * i
          const c = a + (x1 - x0) / 4
          return pane([[a, y1, z + 3], [c, y1, z + 3], [c, y1, z + 3 + g], [a, y1, z + 3 + g]], `p${i}`)
        })}
        <IsoBox a={[x0 - 1, y1 - 1.5, z + 3 + g]} b={[x1 + 1, y1 + 1, z + 5 + g]} mat="frame" />
      </motion.g>
    </g>
  )
}

export function IsoBuilding() {
  const [hot, setHot] = useState<string | null>(null)
  const viewBox = fitBoxes([[[0, 0, 0], [WIDTH + 2, DEPTH + 14, HEIGHT]]], [], 8)
  const balconies = []
  for (let f = FLOORS - 1; f >= 1; f--)
    for (let b = 0; b < BAYS; b++) {
      const key = `${f}-${b}`
      balconies.push(
        <Balcony key={key} f={f} b={b} hot={hot === key} onHover={(on) => setHot(on ? key : null)} />
      )
    }
  return (
    <svg viewBox={viewBox} role="img" aria-label="Isometric apartment block with glass balconies" className="size-full overflow-visible">
      <IsoBox a={[0, 0, 0]} b={[WIDTH, DEPTH, HEIGHT]} />
      <IsoBox a={[-2, -2, HEIGHT]} b={[WIDTH + 2, DEPTH + 2, HEIGHT + 3]} mat="steel" />
      <FacadeOpenings />
      {balconies.reverse()}
    </svg>
  )
}
