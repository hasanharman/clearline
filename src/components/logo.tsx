import { boxFaces, IDENTITY, light, points, type V3 } from "@/lib/iso"
import { cn } from "@/lib/utils"

// Two glass panes between a top and bottom track, drawn once at module load.
const parts: { a: V3; b: V3; glass?: boolean }[] = [
  { a: [0, 0, 0], b: [22, 3, 2] },
  { a: [1, 1, 2], b: [10.8, 2, 16], glass: true },
  { a: [11.2, 1, 2], b: [21, 2, 16], glass: true },
  { a: [0, 0, 16], b: [22, 3, 18] },
]
const faces = parts.flatMap((p) =>
  boxFaces(p.a, p.b, IDENTITY).map((f) => ({ pts: points(f.pts), l: light(f.normal), glass: p.glass }))
)

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="-4 -20 24 34" className={cn("h-7 w-auto", className)} aria-hidden>
      {faces.map((f, i) => (
        <polygon
          key={i}
          points={f.pts}
          fill={f.glass ? "var(--signal)" : `color-mix(in oklab, var(--face) ${Math.round(f.l * 100)}%, var(--shade))`}
          fillOpacity={f.glass ? 0.35 : 1}
          stroke="var(--ink)"
          strokeWidth={1}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
