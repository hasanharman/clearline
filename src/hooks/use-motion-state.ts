import { useMotionValueEvent, type MotionValue } from "motion/react"
import { useState } from "react"

export function useMotionState(mv: MotionValue<number>) {
  const [value, setValue] = useState(() => mv.get())
  useMotionValueEvent(mv, "change", setValue)
  return value
}
