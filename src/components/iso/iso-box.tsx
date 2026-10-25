import { boxFaces, emptyBounds, grow, IDENTITY, isoText, light, points, project, type V2, type V3 } from "@/lib/iso"

export type IsoMat = "face" | "glass" | "dark" | "steel" | "concrete" | "signal" | "frame"

const fills: Record<IsoMat, (l: number) => { fill: string; fillOpacity?: number }> = {
  face: (l) => ({ fill: `color-mix(in oklab, var(--face) ${Math.round(l * 100)}%, var(--shade))` }),
  frame: (l) => ({ fill: `color-mix(in oklab, var(--steel) ${Math.round(l * 100)}%, var(--shade))` }),
  steel: (l) => ({ fill: `color-mix(in oklab, var(--steel) ${Math.round(l * 100)}%, var(--shade))` }),
  dark: (l) => ({ fill: `color-mix(in oklab, var(--rubber) ${Math.round(l * 100)}%, var(--shade))` }),
  concrete: (l) => ({ fill: `color-mix(in oklab, var(--concrete) ${Math.round(l * 100)}%, var(--shade))` }),
  glass: (l) => ({ fill: "oklch(0.82 0.08 205)", fillOpacity: 0.22 + (1 - l) * 0.25 }),
  signal: (l) => ({ fill: `color-mix(in oklab, var(--signal) ${Math.round(l * 100)}%, var(--shade))` }),
}

type BoxProps = { a: V3; b: V3; mat?: IsoMat; dashed?: boolean; hatch?: string }

export function IsoBox({ a, b, mat = "face", dashed, hatch }: BoxProps) {
  return (
    <g>
      {boxFaces(a, b, IDENTITY).map((f, i) => {
        const p = points(f.pts)
        return (
          <g key={i}>
            <polygon
              points={p}
              {...fills[mat](light(f.normal))}
              stroke="var(--ink)"
              strokeWidth={1}
              strokeLinejoin="round"
              strokeDasharray={dashed ? "4 3" : undefined}
              vectorEffect="non-scaling-stroke"
            />
            {hatch && f.side !== "top" && <polygon points={p} fill={`url(#${hatch})`} />}
          </g>
        )
      })}
    </g>
  )
}

export function IsoLine({ pts, signal, dashed, width = 1 }: { pts: V3[]; signal?: boolean; dashed?: boolean; width?: number }) {
  return (
    <polyline
      points={points(pts.map(project))}
      fill="none"
      stroke={signal ? "var(--signal)" : "var(--ink)"}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "3 3" : undefined}
      vectorEffect="non-scaling-stroke"
    />
  )
}

export function IsoText({ at, plane, children, size = 6 }: { at: V3; plane: "xz" | "yz" | "xy-x"; children: string; size?: number }) {
  return (
    <text
      transform={isoText(plane, project(at))}
      fontSize={size}
      fill="var(--ink)"
      textAnchor="middle"
      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
    >
      {children}
    </text>
  )
}

/** viewBox string that fits a set of boxes (and stray points). */
export function fitBoxes(boxes: [V3, V3][], extra: V3[] = [], pad = 6) {
  const b = emptyBounds()
  for (const [a, c] of boxes) {
    const corners: V2[] = []
    for (const x of [a[0], c[0]]) for (const y of [a[1], c[1]]) for (const z of [a[2], c[2]]) corners.push(project([x, y, z]))
    grow(b, corners)
  }
  grow(b, extra.map(project))
  return `${b.minX - pad} ${b.minY - pad} ${b.maxX - b.minX + pad * 2} ${b.maxY - b.minY + pad * 2}`
}

export function HatchDef({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="3" stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="0.45" />
      </pattern>
    </defs>
  )
}
