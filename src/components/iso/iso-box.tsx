import { boxFaces, emptyBounds, grow, IDENTITY, light, points, project, projectPoints, tint, type V2, type V3 } from "@/lib/iso"

type IsoMat = "face" | "glass" | "dark" | "steel" | "concrete" | "frame"

const base: Record<Exclude<IsoMat, "glass">, string> = {
  face: "var(--face)",
  frame: "var(--steel)",
  steel: "var(--steel)",
  dark: "var(--rubber)",
  concrete: "var(--concrete)",
}

const fill = (mat: IsoMat, l: number) =>
  mat === "glass" ? { fill: "oklch(0.82 0.08 205)", fillOpacity: 0.22 + (1 - l) * 0.25 } : { fill: tint(base[mat], l) }

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
              {...fill(mat, light(f.normal))}
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
      points={projectPoints(pts)}
      fill="none"
      stroke={signal ? "var(--signal)" : "var(--ink)"}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "3 3" : undefined}
      vectorEffect="non-scaling-stroke"
    />
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
