import { Logo } from "@/components/logo"
import { site } from "@/lib/site"

const block = [
  ["Project", site.tagline],
  ["System", site.system],
  ["Scale", "1 : 12"],
  ["Sheet", "06 / 06"],
  ["Rev.", `A · ${site.year}`],
]

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-6 lg:px-10">
        {/* Drawing title block */}
        <div className="grid overflow-hidden rounded-lg border sm:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div className="flex items-center gap-3 border-b p-4 sm:border-r sm:border-b-0">
            <Logo className="h-8" />
            <div>
              <p className="font-semibold tracking-tight">{site.name}</p>
              <p className="text-label text-muted-foreground">{site.city}</p>
            </div>
          </div>
          {block.map(([k, v], i) => (
            <div
              key={k}
              className={`flex flex-col gap-1 p-4 ${i < block.length - 1 ? "border-b sm:border-r sm:border-b-0" : ""}`}
            >
              <span className="text-label text-muted-foreground">{k}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>

        <p
          aria-hidden
          className="mt-10 overflow-hidden text-[19vw] leading-[0.8] font-medium tracking-[-0.07em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_var(--color-border)] lg:text-[17.5rem]"
        >
          {site.name}
        </p>

        <div className="flex flex-col gap-2 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.year} {site.name}. Glass cut, edged and tempered locally.
          </p>
          <p className="text-label">Drawn to scale · Not for construction</p>
        </div>
      </div>
    </footer>
  )
}
