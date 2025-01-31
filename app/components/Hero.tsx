"use client"

import { Button } from "@/components/ui/button"

export default function Hero() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Sua Agência de Marketing Digital</h1>
        <p className="text-xl mb-8">Conectando Clientes e Agências de Forma Eficiente</p>
        <Button
          onClick={scrollToPricing}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Comece Agora
        </Button>
      </div>
    </section>
  )
}

