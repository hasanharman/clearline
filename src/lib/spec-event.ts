const SPEC_EVENT = "clearline:spec"

export const sendSpec = (spec: string) => window.dispatchEvent(new CustomEvent(SPEC_EVENT, { detail: spec }))

export function onSpec(cb: (spec: string) => void) {
  const listener = (e: Event) => cb((e as CustomEvent<string>).detail)
  window.addEventListener(SPEC_EVENT, listener)
  return () => window.removeEventListener(SPEC_EVENT, listener)
}
