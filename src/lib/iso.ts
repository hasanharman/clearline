// Isometric projection helpers. World axes: +x runs down-right, +y runs
// down-left, +z runs up. The viewer looks from (+1, +1, +1).

export type V3 = readonly [number, number, number]
export type V2 = readonly [number, number]

export const COS30 = Math.cos(Math.PI / 6)
export const SIN30 = 0.5

export function project([x, y, z]: V3): V2 {
  return [(x - y) * COS30, (x + y) * SIN30 - z]
}

export function points(ps: readonly V2[]) {
  let out = ""
  for (const [x, y] of ps) out += `${x.toFixed(2)},${y.toFixed(2)} `
  return out.trimEnd()
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
/** Eased progress of `t` through the window [a, b]. */
export const range = (t: number, a: number, b: number) =>
  easeInOut(clamp01((t - a) / (b - a)))

/** Rigid placement: rotate about z, then translate. */
export type Placement = { origin: V3; rot: number }
export const IDENTITY: Placement = { origin: [0, 0, 0], rot: 0 }

export function place(p: V3, pl: Placement, offset: V3 = [0, 0, 0]): V3 {
  const c = Math.cos(pl.rot)
  const s = Math.sin(pl.rot)
  return [
    c * p[0] - s * p[1] + pl.origin[0] + offset[0],
    s * p[0] + c * p[1] + pl.origin[1] + offset[1],
    p[2] + pl.origin[2] + offset[2],
  ]
}

export function rotateNormal(n: V3, rot: number): V3 {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return [c * n[0] - s * n[1], s * n[0] + c * n[1], n[2]]
}

/** A face is visible when its normal points toward the viewer. */
export const facesViewer = (n: V3) => n[0] + n[1] + n[2] > 1e-6

const LIGHT: V3 = (() => {
  const l: V3 = [-0.4, 0.65, 1]
  const m = Math.hypot(...l)
  return [l[0] / m, l[1] / m, l[2] / m]
})()

/** 0..1 lambert-ish brightness for a world-space normal. */
export function light(n: V3) {
  const d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]
  return clamp01(0.64 + 0.36 * d)
}

export type BoxFace = { pts: V2[]; normal: V3; side: "top" | "x" | "y" | "-x" | "-y" }

/** Visible faces of an axis-aligned box (in local space) after placement. */
export function boxFaces(a: V3, b: V3, pl: Placement, offset?: V3): BoxFace[] {
  const [x0, y0, z0] = a
  const [x1, y1, z1] = b
  const P = (x: number, y: number, z: number) => project(place([x, y, z], pl, offset))
  const faces: { side: BoxFace["side"]; n: V3; q: () => V2[] }[] = [
    { side: "-x", n: [-1, 0, 0], q: () => [P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)] },
    { side: "-y", n: [0, -1, 0], q: () => [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)] },
    { side: "x", n: [1, 0, 0], q: () => [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)] },
    { side: "y", n: [0, 1, 0], q: () => [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)] },
    { side: "top", n: [0, 0, 1], q: () => [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)] },
  ]
  const out: BoxFace[] = []
  for (const f of faces) {
    const n = rotateNormal(f.n, pl.rot)
    if (facesViewer(n)) out.push({ pts: f.q(), normal: n, side: f.side })
  }
  return out
}

/** Circle in a local plane, returned as projected points. */
export function circle(
  c: V3,
  r: number,
  plane: "xy" | "xz" | "yz",
  pl: Placement = IDENTITY,
  offset?: V3,
  segments = 24
): V2[] {
  const out: V2[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const u = Math.cos(a) * r
    const v = Math.sin(a) * r
    const p: V3 =
      plane === "xy"
        ? [c[0] + u, c[1] + v, c[2]]
        : plane === "xz"
          ? [c[0] + u, c[1], c[2] + v]
          : [c[0], c[1] + u, c[2] + v]
    out.push(project(place(p, pl, offset)))
  }
  return out
}

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }
export const emptyBounds = (): Bounds => ({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
export function grow(b: Bounds, pts: readonly V2[]) {
  for (const [x, y] of pts) {
    if (x < b.minX) b.minX = x
    if (x > b.maxX) b.maxX = x
    if (y < b.minY) b.minY = y
    if (y > b.maxY) b.maxY = y
  }
  return b
}

/** SVG matrix that lays text flat on an isometric plane. */
export function isoText(plane: "xz" | "yz" | "xy-x", at: V2) {
  const [e, f] = at
  if (plane === "xz") return `matrix(${COS30} ${SIN30} 0 1 ${e} ${f})`
  if (plane === "yz") return `matrix(${COS30} ${-SIN30} 0 1 ${e} ${f})`
  return `matrix(${COS30} ${SIN30} ${-COS30} ${SIN30} ${e} ${f})`
}
