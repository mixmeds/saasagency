import Header from "./components/Header"
import Hero from "./components/Hero"
import About from "./components/About"
import Pricing from "./components/Pricing"

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <Hero />
      <About />
      <Pricing />
    </main>
  )
}

