import {
  boxFaces,
  circle,
  clamp01,
  emptyBounds,
  facesViewer,
  grow,
  IDENTITY,
  lerp,
  light,
  place,
  project,
  range,
  rotateNormal,
  type Bounds,
  type Placement,
  type V2,
  type V3,
} from "@/lib/iso"

/** Panel width, glass thickness and glass height in drawing units. */
export const W = 60
const T = 1.2
const H = 120
/** One drawing unit in millimetres (60 units → 720 mm panel). */
const MM = 12
export const PANEL_MM = W * MM

export type PartKind =
  | "topTrack"
  | "upperProfile"
  | "handle"
  | "glass"
  | "seal"
  | "lowerProfile"
  | "roller"
  | "bottomTrack"
  | "jamb"
  | "parapet"

type PartMeta = {
  no: string
  name: string
  spec: string
  side: "left" | "right"
  explode: V3
}

export const PART_ORDER: PartKind[] = [
  "topTrack",
  "upperProfile",
  "handle",
  "glass",
  "seal",
  "lowerProfile",
  "roller",
  "bottomTrack",
  "jamb",
  "parapet",
]

export const PARTS: Record<PartKind, PartMeta> = {
  topTrack: {
    no: "01",
    name: "Top track",
    spec: "Extruded 6063-T5 aluminium, anchored to the ceiling slab every 40 cm.",
    side: "right",
    explode: [0, 0, 46],
  },
  upperProfile: {
    no: "02",
    name: "Upper glass profile",
    spec: "Clamps the panel's top edge and carries the pivot pin. Powder coated to any RAL colour.",
    side: "left",
    explode: [0, 0, 24],
  },
  handle: {
    no: "03",
    name: "Handle & lock",
    spec: "Key-lockable handle on the lead panel. Locks the whole run with one turn.",
    side: "right",
    explode: [0, 26, 0],
  },
  glass: {
    no: "04",
    name: "10 mm tempered glass",
    spec: "Cut, edged and toughened in our own workshop. Polished edges, no frame between panels.",
    side: "left",
    explode: [0, 0, 0],
  },
  seal: {
    no: "05",
    name: "Panel seal",
    spec: "Clear polycarbonate and EPDM seals between panels keep out wind and rain.",
    side: "right",
    explode: [0, 18, 0],
  },
  lowerProfile: {
    no: "06",
    name: "Lower glass profile",
    spec: "Matching aluminium profile that carries the roller carriage and seats the glass.",
    side: "left",
    explode: [0, 0, -20],
  },
  roller: {
    no: "07",
    name: "Roller carriage",
    spec: "Sealed stainless bearings, so panels glide with one finger and fold flat.",
    side: "right",
    explode: [0, 0, -32],
  },
  bottomTrack: {
    no: "08",
    name: "Bottom track",
    spec: "Low-profile track with built-in drainage channel. Water goes out, never in.",
    side: "right",
    explode: [0, 0, -48],
  },
  jamb: {
    no: "09",
    name: "Wall jamb",
    spec: "U-profile fixed to the side wall. Absorbs uneven walls and closes the gap.",
    side: "left",
    explode: [-28, 0, 0],
  },
  parapet: {
    no: "10",
    name: "Existing parapet",
    spec: "Your balcony's own wall or railing. We level the track on it to the millimetre.",
    side: "left",
    explode: [0, 0, -70],
  },
}

const STAGGER_START = 0.04
const STAGGER_STEP = 0.07
/** A part takes the stage once it's a third of the way out and labelled. */
const STAGE_DELAY = 0.1

/** Staggered scroll window for each part (top first). */
export function staggered(kind: PartKind, t: number) {
  const start = STAGGER_START + PART_ORDER.indexOf(kind) * STAGGER_STEP
  return range(t, start, start + 0.3)
}

/** Which part is "on stage" for a given scroll progress. */
export function activeAt(t: number): PartKind | null {
  const u = t - STAGGER_START - STAGE_DELAY
  if (u < 0) return null
  return PART_ORDER[Math.min(PART_ORDER.length - 1, Math.floor(u / STAGGER_STEP))]
}

/** Explode progress at the middle of a part's turn on stage. */
export function stageOf(kind: PartKind) {
  return STAGGER_START + STAGE_DELAY + (PART_ORDER.indexOf(kind) + 0.5) * STAGGER_STEP
}

type Material =
  | "frame"
  | "glass"
  | "glassEdge"
  | "glint"
  | "concrete"
  | "rubber"
  | "steel"
  | "hole"
  | "handle"
  | "seal"

export type Shape = {
  kind: PartKind
  mat: Material
  pts: V2[]
  light?: number
  /** Open polyline instead of a filled face. */
  line?: boolean
  dashed?: boolean
  hatch?: boolean
}

type Anchor = { kind: PartKind; at: V2 }

type Dim = {
  ext: V2[][]
  line: V2[]
  ticks: V2[][]
  text: string
  at: V2
  plane: "top" | "side"
}

export type Scene = {
  shapes: Shape[]
  anchors: Anchor[]
  dims: Dim[]
  bounds: Bounds
}

type SceneInput = {
  panels: number
  explode: number
  open: number
  shine: number
  stagger: boolean
  glint: boolean
}

const scale = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k]
export const formatMm = (n: number) => `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} mm`

/** Fold sequence: each panel slides to the stack, then swings 90° inward. */
function panelPlacement(i: number, n: number, open: number): Placement {
  const D = 0.42
  const g = n > 1 ? (1 - D) / (n - 1) : 0
  const local = clamp01((open - i * g) / D)
  const slide = range(local, 0, 0.62)
  const turn = range(local, 0.42, 1)
  const x = lerp(i * W, 4 + i * 4.4, slide)
  return { origin: [x, T / 2, 0], rot: (-turn * Math.PI) / 2 }
}

export function buildScene(input: SceneInput): Scene {
  const { panels: n, explode, open, shine, stagger, glint } = input
  const L = n * W
  const shapes: Shape[] = []
  const anchors: Anchor[] = []

  const prog = (k: PartKind) => (stagger ? staggered(k, explode) : range(explode, 0, 1))
  const off = (k: PartKind) => scale(PARTS[k].explode, prog(k))

  const box = (kind: PartKind, mat: Material, a: V3, b: V3, pl: Placement, o: V3, extra?: Partial<Shape>) => {
    const faces = boxFaces(a, b, pl, o)
    for (const f of faces) shapes.push({ kind, mat, pts: f.pts, light: light(f.normal), ...extra })
    return faces
  }
  const line = (kind: PartKind, ps: V3[], pl: Placement, o: V3, extra?: Partial<Shape>) =>
    shapes.push({ kind, mat: "frame", line: true, pts: ps.map((p) => project(place(p, pl, o))), ...extra })
  const poly = (kind: PartKind, mat: Material, ps: V3[], pl: Placement, o: V3) =>
    shapes.push({ kind, mat, pts: ps.map((p) => project(place(p, pl, o))) })
  const anchor = (kind: PartKind, p: V3, pl: Placement, o: V3) =>
    anchors.push({ kind, at: project(place(p, pl, o)) })

  // 10 — existing parapet (drawn dashed, hatched like a section cut)
  {
    const o = off("parapet")
    const faces = boxFaces([-8, -16, -42], [L + 8, T + 8, -16], IDENTITY, o)
    for (const f of faces)
      shapes.push({
        kind: "parapet",
        mat: "concrete",
        pts: f.pts,
        light: light(f.normal),
        dashed: true,
        hatch: f.side !== "top",
      })
    anchor("parapet", [2, T + 8, -29], IDENTITY, o)
  }

  // 08 — bottom track with drainage channel
  {
    const o = off("bottomTrack")
    box("bottomTrack", "frame", [-2, -4, -16], [L + 2, T + 4, -10], IDENTITY, o)
    poly("bottomTrack", "hole", [[-2, -2.2, -10], [L + 2, -2.2, -10], [L + 2, T + 2.2, -10], [-2, T + 2.2, -10]], IDENTITY, o)
    line("bottomTrack", [[L + 2, -2.2, -10], [L + 2, -2.2, -13.6], [L + 2, T + 2.2, -13.6], [L + 2, T + 2.2, -10]], IDENTITY, o)
    for (let x = 14; x < L - 6; x += 28)
      poly("bottomTrack", "hole", [[x, T + 4, -14.2], [x + 5, T + 4, -14.2], [x + 5, T + 4, -12.6], [x, T + 4, -12.6]], IDENTITY, o)
    anchor("bottomTrack", [L - 6, T + 4, -13], IDENTITY, o)
  }

  // 09 — wall jamb
  {
    const o = off("jamb")
    box("jamb", "frame", [-5, -4, -16], [-2, T + 4, H + 16], IDENTITY, o)
    line("jamb", [[-2, -1.4, -16], [-2, -1.4, H + 16]], IDENTITY, o)
    line("jamb", [[-2, T + 1.4, -16], [-2, T + 1.4, H + 16]], IDENTITY, o)
    for (let z = 4; z < H + 10; z += 30)
      shapes.push({ kind: "jamb", mat: "hole", pts: circle([-3.5, T + 4, z], 0.75, "xz", IDENTITY, o, 12) })
    anchor("jamb", [-3.5, T + 4, H * 0.32], IDENTITY, o)
  }

  // Panels: rollers → glass → seal → lower profile → upper profile → handle
  const oR = off("roller")
  const oG = off("glass")
  const oS = off("seal")
  const oL = off("lowerProfile")
  const oU = off("upperProfile")
  const oH = off("handle")
  const sh = shine * 10
  const cl = (x: number) => Math.min(W - 1.5, Math.max(1.5, x))

  for (let i = 0; i < n; i++) {
    const pl = panelPlacement(i, n, open)
    const front = facesViewer(rotateNormal([0, 1, 0], pl.rot)) ? 1 : -1
    const fy = front * (T / 2)
    const py = front * (T / 2 + 1.4)

    for (const lx of [9, W - 9]) {
      box("roller", "steel", [lx - 3, -1.6, -9.4], [lx + 3, 1.6, -7], pl, oR)
      shapes.push({ kind: "roller", mat: "rubber", pts: circle([lx, front * 1.7, -10.6], 2.8, "xz", pl, oR, 20), light: 0.5 })
      shapes.push({ kind: "roller", mat: "steel", pts: circle([lx, front * 1.75, -10.6], 1, "xz", pl, oR, 12), light: 0.9 })
    }

    const gFaces = boxFaces([0.3, -T / 2, -3], [W - 0.3, T / 2, H + 3], pl, oG)
    for (const f of gFaces) {
      const big = f.side === "y" || f.side === "-y"
      shapes.push({ kind: "glass", mat: big ? "glass" : "glassEdge", pts: f.pts, light: light(f.normal) })
    }
    if (glint) {
      const bands: [number, number][][] = [
        [[cl(0.5 * W + sh), H - 6], [cl(0.66 * W + sh), H - 6], [cl(0.3 * W + sh), 6], [cl(0.14 * W + sh), 6]],
        [[cl(0.72 * W + sh), H - 6], [cl(0.76 * W + sh), H - 6], [cl(0.4 * W + sh), 6], [cl(0.36 * W + sh), 6]],
      ]
      for (const band of bands)
        shapes.push({ kind: "glass", mat: "glint", pts: band.map(([x, z]) => project(place([x, fy, z], pl, oG))) })
    }

    // Drafting convention for glass: a few short parallel reflection strokes.
    for (const [x, z, len] of [[0.6 * W, 0.7 * H, 14], [0.68 * W, 0.66 * H, 20], [0.78 * W, 0.64 * H, 10]] as const)
      line("glass", [[x + sh, fy, z], [x + sh + len * 0.55, fy, z + len]], pl, oG)

    if (i < n - 1) box("seal", "seal", [W - 0.5, -T / 2 - 0.35, 2], [W + 0.3, T / 2 + 0.35, H - 2], pl, oS)

    box("lowerProfile", "frame", [0, -T / 2 - 1.4, -7], [W, T / 2 + 1.4, 0], pl, oL)
    line("lowerProfile", [[0.8, py, -3.5], [W - 0.8, py, -3.5]], pl, oL)
    box("upperProfile", "frame", [0, -T / 2 - 1.4, H], [W, T / 2 + 1.4, H + 7], pl, oU)
    line("upperProfile", [[0.8, py, H + 3.5], [W - 0.8, py, H + 3.5]], pl, oU)

    if (i === n - 1) {
      box("handle", "handle", [W - 8.2, T / 2, 44], [W - 4.6, T / 2 + 0.8, 66], pl, oH)
      box("handle", "handle", [W - 7.4, T / 2 + 0.8, 48], [W - 5.4, T / 2 + 3.4, 62], pl, oH)
      anchor("handle", [W - 6.4, T / 2 + 3.4, 55], pl, oH)
      anchor("roller", [W - 9, front * 1.7, -10.6], pl, oR)
    }
    if (i === 0) {
      anchor("upperProfile", [5, py, H + 3.5], pl, oU)
      anchor("glass", [8, fy, H * 0.62], pl, oG)
      anchor("lowerProfile", [5, py, -3.5], pl, oL)
    }
    if (i === n - 2) anchor("seal", [W, T / 2 + 0.6, H * 0.78], pl, oS)
  }

  // 01 — top track, drawn last so it caps everything
  const oT = off("topTrack")
  {
    box("topTrack", "frame", [-2, -4, H + 9], [L + 2, T + 4, H + 16], IDENTITY, oT)
    line("topTrack", [[-2, T + 4, H + 12.5], [L + 2, T + 4, H + 12.5]], IDENTITY, oT)
    line("topTrack", [[L + 2, -2.2, H + 9], [L + 2, -2.2, H + 12.8], [L + 2, T + 2.2, H + 12.8], [L + 2, T + 2.2, H + 9]], IDENTITY, oT)
    for (let x = 18; x < L; x += 40)
      shapes.push({ kind: "topTrack", mat: "hole", pts: circle([x, T / 2, H + 16], 1.2, "xy", IDENTITY, oT, 14) })
    anchor("topTrack", [L - 6, T + 4, H + 12.5], IDENTITY, oT)
  }

  // Dimension lines (only meaningful when assembled; the renderer fades them)
  const dims: Dim[] = []
  {
    const z = H + 16
    const yd = -17
    const P = (p: V3) => project(place(p, IDENTITY, oT))
    dims.push({
      ext: [
        [P([0, -5, z]), P([0, yd - 2.5, z])],
        [P([L, -5, z]), P([L, yd - 2.5, z])],
      ],
      line: [P([0, yd, z]), P([L, yd, z])],
      ticks: [0, L].map((x) => [P([x - 1.8, yd + 1.8, z]), P([x + 1.8, yd - 1.8, z])]),
      text: formatMm(L * MM),
      at: P([L / 2, yd - 2.4, z]),
      plane: "top",
    })
    const x = L + 2
    const yh = T + 17
    dims.push({
      ext: [
        [project([x, T + 5, -16]), project([x, yh + 2.5, -16])],
        [project([x, T + 5, H + 16]), project([x, yh + 2.5, H + 16])],
      ],
      line: [project([x, yh, -16]), project([x, yh, H + 16])],
      ticks: [-16, H + 16].map((zz) => [project([x, yh - 1.8, zz - 1.8]), project([x, yh + 1.8, zz + 1.8])]),
      text: formatMm((H + 32) * MM),
      at: project([x, yh + 2.4, H / 2]),
      plane: "side",
    })
  }

  const bounds = emptyBounds()
  for (const s of shapes) grow(bounds, s.pts)
  return { shapes, anchors, dims, bounds }
}
