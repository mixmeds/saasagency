"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Básico",
    price: "R$ 99/mês",
    features: ["5 projetos", "Suporte por email", "Relatórios mensais"],
  },
  {
    name: "Pro",
    price: "R$ 199/mês",
    features: ["15 projetos", "Suporte prioritário", "Relatórios semanais", "Integração com Google Analytics"],
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    features: [
      "Projetos ilimitados",
      "Suporte 24/7",
      "Relatórios personalizados",
      "Integração com APIs personalizadas",
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Planos</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <ul className="mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center mb-2">
                    <Check className="text-green-500 mr-2" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                Escolher Plano
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

