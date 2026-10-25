"use client"

import { useId, useMemo, type Ref } from "react"

import { clamp01, COS30, grow, isoText, lerp, points, SIN30, type Bounds } from "@/lib/iso"
import { cn } from "@/lib/utils"
import { buildScene, PARTS, type Material, type PartKind, type Shape } from "./scene"

export type GlassKey = "clear" | "smoke" | "bronze" | "frosted"
export type FrameKey = "auto" | "silver" | "graphite" | "bronze" | "white"

export const GLASS: Record<GlassKey, { label: string; color: string; opacity: number; glint: number }> = {
  clear: { label: "Clear", color: "oklch(0.82 0.08 205)", opacity: 0.26, glint: 0.6 },
  smoke: { label: "Smoke", color: "oklch(0.4 0.02 250)", opacity: 0.5, glint: 0.42 },
  bronze: { label: "Bronze", color: "oklch(0.58 0.08 60)", opacity: 0.46, glint: 0.45 },
  frosted: { label: "Frosted", color: "oklch(0.97 0.006 220)", opacity: 0.8, glint: 0 },
}

export const FRAME: Record<Exclude<FrameKey, "auto">, { label: string; color: string }> = {
  silver: { label: "Anodised", color: "oklch(0.86 0.006 250)" },
  graphite: { label: "Graphite", color: "oklch(0.38 0.008 255)" },
  bronze: { label: "Bronze", color: "oklch(0.55 0.06 62)" },
  white: { label: "White", color: "oklch(0.975 0.004 85)" },
}

type Props = {
  panels?: number
  glass?: GlassKey
  frame?: FrameKey
  explode?: number
  open?: number
  shine?: number
  /** Parts separate one after another instead of all at once. */
  stagger?: boolean
  labels?: "text" | "number" | "none"
  labelOpacity?: (kind: PartKind) => number
  active?: PartKind | null
  dims?: boolean
  /** Zoom to fit the current geometry instead of the fully exploded frame. */
  camera?: boolean
  svgRef?: Ref<SVGSVGElement>
  className?: string
  title?: string
}

const FONT = 7
const LABEL_GAP = 13

const COLUMN = 16
const widest = (side: "left" | "right") =>
  Math.max(...Object.values(PARTS).filter((p) => p.side === side).map((p) => textWidth(`${p.no}  ${p.name}`)))
const pad = (b: Bounds, p: number): Bounds => ({ minX: b.minX - p, minY: b.minY - p, maxX: b.maxX + p, maxY: b.maxY + p })
const textWidth = (s: string, size = FONT) => s.length * size * 0.62
const LEFT_TEXT = widest("left")
const RIGHT_TEXT = widest("right")

export function BalconyDrawing({
  panels = 4,
  glass = "clear",
  frame = "auto",
  explode = 0,
  open = 0,
  shine = 0,
  stagger = false,
  labels = "text",
  labelOpacity,
  active = null,
  dims = false,
  camera = false,
  svgRef,
  className,
  title = "Isometric exploded drawing of a frameless folding glass balcony",
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const g = GLASS[glass]
  const frameColor = frame === "auto" ? "var(--face)" : FRAME[frame].color

  // Fixed reference frame: fully exploded + fully folded, so the viewBox never jumps.
  const frameRef = useMemo(() => {
    const exploded = buildScene({ panels, explode: 1, open: 0, shine: 0, stagger: false, glint: false })
    const folded = buildScene({ panels, explode: 0, open: 1, shine: 0, stagger: false, glint: false })
    const assembled = buildScene({ panels, explode: 0, open: 0, shine: 0, stagger: false, glint: false })
    const b = { ...exploded.bounds }
    grow(b, [[folded.bounds.minX, folded.bounds.minY], [folded.bounds.maxX, folded.bounds.maxY]])
    const left = b.minX - COLUMN
    const right = b.maxX + COLUMN
    let vb = { ...b }
    if (labels === "text") {
      vb.minX = left - LEFT_TEXT - 6
      vb.maxX = right + RIGHT_TEXT + 6
    } else if (labels === "number") {
      vb = pad(vb, 20)
    }
    if (dims) for (const d of assembled.dims) grow(vb, [...d.line, ...d.ext.flat()].map(([x, y]) => [x + 10, y - 10] as const))
    return { vb: pad(vb, 10), left, right }
  }, [panels, labels, dims])

  const scene = buildScene({ panels, explode, open, shine, stagger, glint: g.glint > 0 })
  // Geometry without the fold, so the camera doesn't breathe while panels swing.
  const base = camera && open > 0 ? buildScene({ panels, explode, open: 0, shine: 0, stagger, glint: false }) : scene
  const { vb } = frameRef
  // With a camera the label columns hug the current geometry; otherwise they sit at the exploded extents.
  const left = camera ? base.bounds.minX - COLUMN : frameRef.left
  const right = camera ? base.bounds.maxX + COLUMN : frameRef.right

  // Labels: stacked per column so they never collide.
  const placed = (() => {
    if (labels === "none") return []
    const rows = scene.anchors
      .map((a) => ({ ...a, side: PARTS[a.kind].side, op: labelOpacity ? clamp01(labelOpacity(a.kind)) : 1 }))
      .filter((a) => a.op > 0.01)
    const out: ((typeof rows)[number] & { y: number })[] = []
    for (const side of ["left", "right"] as const) {
      let prev = -Infinity
      for (const r of rows.filter((r) => r.side === side).sort((a, b) => a.at[1] - b.at[1])) {
        const y = Math.max(r.at[1], prev + LABEL_GAP)
        prev = y
        out.push({ ...r, y })
      }
    }
    return out
  })()

  const dimsOpacity = dims ? 1 - clamp01(explode / 0.16) : 0

  let cameraTransform: string | undefined
  if (camera) {
    const cb: Bounds = { ...base.bounds }
    if (dimsOpacity > 0) for (const d of scene.dims) grow(cb, [...d.line, ...d.ext.flat()])
    if (labels !== "none") {
      // Pull the labels into frame as soon as any of them starts to appear.
      const reach = (side: "left" | "right") =>
        clamp01(4 * Math.max(0, ...placed.filter((p) => p.side === side).map((p) => p.op)))
      if (labels === "text") {
        cb.minX = lerp(cb.minX, left - LEFT_TEXT - 6, reach("left"))
        cb.maxX = lerp(cb.maxX, right + RIGHT_TEXT + 6, reach("right"))
      } else {
        cb.minX -= 22 * reach("left")
        cb.maxX += 22 * reach("right")
        cb.minY -= 16 * Math.max(reach("left"), reach("right"))
      }
      for (const p of placed) grow(cb, [[cb.minX, p.y - 6], [cb.minX, p.y + 6]])
    }
    const w = vb.maxX - vb.minX
    const h = vb.maxY - vb.minY
    const s = Math.min(2.1, Math.max(1, Math.min(w / (cb.maxX - cb.minX + 24), h / (cb.maxY - cb.minY + 24))))
    const cx = (cb.minX + cb.maxX) / 2
    const cy = (cb.minY + cb.maxY) / 2
    cameraTransform = `translate(${vb.minX + w / 2} ${vb.minY + h / 2}) scale(${s}) translate(${-cx} ${-cy})`
  }

  const fillFor = (s: Shape, isActive: boolean) => {
    const pct = Math.round((s.light ?? 0.8) * 100)
    const mix = (base: string, p = pct) => {
      const c = `color-mix(in oklab, ${base} ${p}%, var(--shade))`
      return isActive ? `color-mix(in oklab, ${c} 62%, var(--signal))` : c
    }
    const table: Record<Material, { fill: string; fillOpacity?: number }> = {
      frame: { fill: mix(frameColor) },
      handle: { fill: mix("var(--steel)", Math.round(pct * 0.8)) },
      concrete: { fill: mix("var(--concrete)") },
      rubber: { fill: mix("var(--rubber)", 92) },
      steel: { fill: mix("var(--steel)") },
      hole: { fill: "var(--shade)", fillOpacity: 0.55 },
      glass: {
        fill: isActive ? "var(--signal)" : g.color,
        fillOpacity: isActive ? 0.2 : g.opacity * (0.8 + (1 - (s.light ?? 0.8)) * 0.6),
      },
      glassEdge: { fill: "var(--glass-edge)", fillOpacity: 0.9 },
      glint: { fill: "var(--glint)", fillOpacity: g.glint * 0.7 },
      seal: { fill: mix("var(--steel)"), fillOpacity: 0.7 },
    }
    return table[s.mat]
  }

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={title}
      viewBox={`${vb.minX} ${vb.minY} ${vb.maxX - vb.minX} ${vb.maxY - vb.minY}`}
      className={cn("block size-full select-none", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`hatch-${uid}`} width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3.2" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="0.45" />
        </pattern>
      </defs>
      <g transform={cameraTransform}>
        {scene.shapes.map((s, i) => {
          const isActive = active === s.kind
          const stroke = isActive ? "var(--signal)" : "var(--ink)"
          if (s.line)
            return (
              <polyline
                key={i}
                points={points(s.pts)}
                fill="none"
                stroke={stroke}
                strokeOpacity={0.55}
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
              />
            )
          const { fill, fillOpacity } = fillFor(s, isActive)
          const p = points(s.pts)
          const hidesStroke = s.mat === "glint" || s.mat === "hole"
          return (
            <g key={i}>
              <polygon
                points={p}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={hidesStroke ? "none" : stroke}
                strokeOpacity={s.mat === "glass" || s.mat === "glassEdge" ? 0.8 : 1}
                strokeWidth={isActive ? 1.5 : 1}
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 3" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              {s.hatch && <polygon points={p} fill={`url(#hatch-${uid})`} stroke="none" />}
            </g>
          )
        })}

        {dimsOpacity > 0 &&
          scene.dims.map((d, i) => (
            <g key={i} opacity={dimsOpacity} stroke="var(--ink)" strokeWidth={0.75} fill="none" vectorEffect="non-scaling-stroke">
              {d.ext.map((e, j) => (
                <polyline key={j} points={points(e)} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" />
              ))}
              <polyline points={points(d.line)} vectorEffect="non-scaling-stroke" />
              {d.ticks.map((t, j) => (
                <polyline key={j} points={points(t)} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
              ))}
              <text
                transform={
                  d.plane === "top" ? isoText("xy-x", d.at) : `matrix(0 -1 ${COS30} ${-SIN30} ${d.at[0]} ${d.at[1]})`
                }
                textAnchor="middle"
                fontSize={6.5}
                fill="var(--ink)"
                stroke="none"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
              >
                {d.text}
              </text>
            </g>
          ))}

        {labels === "text" &&
          placed.map((l) => {
            const isLeft = l.side === "left"
            const col = isLeft ? left : right
            const [ax, ay] = l.at
            const elbowX = isLeft ? Math.max(col, ax - 8) : Math.min(col, ax + 8)
            const isActive = active === l.kind
            return (
              <g key={l.kind} opacity={l.op}>
                <circle cx={ax} cy={ay} r={1.4} fill={isActive ? "var(--signal)" : "var(--ink)"} />
                <polyline
                  points={`${ax},${ay} ${elbowX},${l.y} ${col},${l.y}`}
                  fill="none"
                  stroke={isActive ? "var(--signal)" : "var(--ink)"}
                  strokeWidth={0.75}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={isLeft ? col - 3 : col + 3}
                  y={l.y}
                  dominantBaseline="middle"
                  textAnchor={isLeft ? "end" : "start"}
                  fontSize={FONT}
                  fontWeight={isActive ? 600 : 400}
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
                >
                  <tspan fill="var(--signal)">{PARTS[l.kind].no}</tspan>
                  <tspan dx={4} fill="var(--ink)">
                    {PARTS[l.kind].name.toUpperCase()}
                  </tspan>
                </text>
              </g>
            )
          })}

        {labels === "number" &&
          placed.map((l) => {
            const isLeft = l.side === "left"
            const [ax, ay] = l.at
            const bx = ax + (isLeft ? -15 : 15)
            const by = l.y - 9
            const isActive = active === l.kind
            return (
              <g key={l.kind} opacity={l.op}>
                <circle cx={ax} cy={ay} r={1.3} fill="var(--ink)" />
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--ink)" strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
                <circle
                  cx={bx}
                  cy={by}
                  r={5.6}
                  fill={isActive ? "var(--signal)" : "var(--background)"}
                  stroke={isActive ? "var(--signal)" : "var(--ink)"}
                  strokeWidth={0.9}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={bx}
                  y={by}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fontSize={5.4}
                  fontWeight={600}
                  fill={isActive ? "var(--background)" : "var(--ink)"}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {PARTS[l.kind].no}
                </text>
              </g>
            )
          })}
      </g>
    </svg>
  )
}

