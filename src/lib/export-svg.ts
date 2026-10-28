// CSS variables mean nothing outside the page, so bake computed paint into attributes.
const PAINT = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-dasharray",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
] as const

function serializeSvg(svg: SVGSVGElement, caption?: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const from = svg.querySelectorAll<SVGElement>("*")
  const to = clone.querySelectorAll<SVGElement>("*")
  from.forEach((el, i) => {
    const cs = getComputedStyle(el)
    const target = to[i]
    for (const p of PAINT) {
      const v = cs.getPropertyValue(p)
      if (!v || v === "normal") continue
      // Web fonts don't load inside an exported image; fall back to a system mono.
      target.setAttribute(p, p === "font-family" ? `${v}, ui-monospace, Menlo, Consolas, monospace` : v)
    }
    target.removeAttribute("style")
    target.removeAttribute("class")
  })

  const vb = svg.viewBox.baseVal
  const scale = 3
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(Math.round(vb.width * scale)))
  clone.setAttribute("height", String(Math.round(vb.height * scale)))
  clone.removeAttribute("class")

  const ns = "http://www.w3.org/2000/svg"
  const bg = document.createElementNS(ns, "rect")
  bg.setAttribute("x", String(vb.x))
  bg.setAttribute("y", String(vb.y))
  bg.setAttribute("width", String(vb.width))
  bg.setAttribute("height", String(vb.height))
  bg.setAttribute("fill", getComputedStyle(document.body).backgroundColor)
  clone.insertBefore(bg, clone.firstChild?.nextSibling ?? null)

  if (caption) {
    const text = document.createElementNS(ns, "text")
    text.setAttribute("x", String(vb.x + 8))
    text.setAttribute("y", String(vb.y + vb.height - 8))
    text.setAttribute("font-size", "6")
    text.setAttribute("font-family", "ui-monospace, monospace")
    text.setAttribute("letter-spacing", "0.4")
    text.setAttribute("fill", getComputedStyle(document.body).color)
    text.textContent = caption.toUpperCase()
    clone.appendChild(text)
  }

  return {
    markup: new XMLSerializer().serializeToString(clone),
    width: vb.width * scale,
    height: vb.height * scale,
  }
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadSvg(svg: SVGSVGElement, filename: string, caption?: string) {
  const { markup } = serializeSvg(svg, caption)
  download(new Blob([markup], { type: "image/svg+xml" }), filename)
}

export function downloadPng(svg: SVGSVGElement, filename: string, caption?: string) {
  const { markup, width, height } = serializeSvg(svg, caption)
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }))
  return new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("PNG encoding failed"))
        download(blob, filename)
        resolve()
      }, "image/png")
    }
    img.onerror = () => reject(new Error("Could not render the drawing"))
    img.src = url
  })
}
