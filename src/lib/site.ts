// Everything a human might want to change lives here: name, contact, copy.
export const site = {
  name: "Clearline",
  tagline: "Frameless glass balconies",
  system: "CL-10",
  city: "Your City",
  phone: "+00 000 000 00 00",
  email: "hello@example.com",
  address: "Workshop · Industrial Zone, Your City",
  hours: "Mon–Sat · 08:30–18:30",
  year: 2026,
  url: "https://clearline-balcony.vercel.app",
  repo: "https://github.com/hasanharman/clearline",
}

export const nav = [
  { href: "#top", label: "System" },
  { href: "#process", label: "Process" },
  { href: "#configure", label: "Configure" },
  { href: "#faq", label: "FAQ" },
]

export const process = [
  {
    no: "01",
    title: "Cut",
    body: "Float glass is scored and snapped to your exact opening, measured on site. No catalogue sizes.",
    note: "± 1 mm",
  },
  {
    no: "02",
    title: "Edge",
    body: "Every edge is ground and polished before tempering, so nothing sharp is left and the panel stays strong.",
    note: "Polished C-edge",
  },
  {
    no: "03",
    title: "Temper",
    body: "Panels are heated to around 620 °C and quenched with air. The result is toughened safety glass.",
    note: "≈ 620 °C",
  },
  {
    no: "04",
    title: "Fit",
    body: "The same team that made your glass installs it. Tracks are levelled, panels are hung, seals go in.",
    note: "One team",
  },
] as const

export const reasons = [
  {
    title: "Made to the millimetre",
    body: "Every balcony is measured on site and every panel is cut for that opening. Nothing is cut to a catalogue size.",
  },
  {
    title: "Shorter waits",
    body: "There's no overseas order or import queue. The glass is produced locally, so the wait is the work itself.",
  },
  {
    title: "One team, start to finish",
    body: "The people who temper your glass are the people who fit it. If you have a question, you call one number.",
  },
  {
    title: "Aftercare next door",
    body: "A roller to adjust, a seal to swap, a panel to replace. We're close by, so you won't wait weeks for a visit.",
  },
] as const

export const faqs = [
  {
    q: "Is tempered glass actually safe on a balcony?",
    a: "Tempered (toughened) glass is several times stronger than ordinary float glass. If it ever breaks, it shatters into small blunt pieces instead of sharp shards. That's why it's the standard for balcony systems.",
  },
  {
    q: "Can the panels open all the way?",
    a: "Yes. The panels slide along the track and fold flat against the side, so the balcony can be fully open in summer and fully closed in winter.",
  },
  {
    q: "How do I clean the outside?",
    a: "Each panel folds inward, so you can reach both faces from inside the balcony. You never need to lean over the railing.",
  },
  {
    q: "How long does it take?",
    a: "After the site measurement, the glass is cut, edged and tempered locally, then fitted. Most installs take a single day once the panels are ready. Ask us for the current lead time.",
  },
  {
    q: "Do I need permission from my building?",
    a: "Rules differ between buildings and municipalities. We'll tell you what's usually needed and can match the profile colour to your facade.",
  },
] as const
