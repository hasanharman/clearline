import { Configurator } from "@/components/sections/configurator"
import { Contact } from "@/components/sections/contact"
import { Faq } from "@/components/sections/faq"
import { Footer } from "@/components/sections/footer"
import { HeroTeardown } from "@/components/sections/hero-teardown"
import { Nav } from "@/components/sections/nav"
import { Process } from "@/components/sections/process"
import { WhyLocal } from "@/components/sections/why-local"

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroTeardown />
        <Process />
        <WhyLocal />
        <Configurator />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
