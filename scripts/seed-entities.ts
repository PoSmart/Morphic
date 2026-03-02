import { createId } from '@paralleldrive/cuid2'

import { db } from '../lib/db'
import { entities } from '../lib/db/schema'

const industries = ['Tech', 'Fintech', 'Healhtech', 'Sustainability', 'AI & Data', 'E-commerce']
const locations = ['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze']

async function seed() {
  console.log('Seeding 20 entities...')

  const dummyEntities = Array.from({ length: 20 }).map((_, i) => {
    const revenue = Math.floor(Math.random() * 900) + 100 // 100M - 1000M
    const growthRate = Math.floor(Math.random() * 50) - 10 // -10% to 40%
    const industry = industries[Math.floor(Math.random() * industries.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const profit = Math.floor(revenue * (Math.random() * 0.3)) // 0-30% of revenue
    const margin = (profit / revenue) * 100

    return {
      id: createId(),
      name: `Entity ${i + 1} SpA`,
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=E${i+1}`,
      description: `Leading provider of ${industry} solutions with a focus on innovation and scalability.`,
      industry,
      location,
      kpis: {
        revenue,
        growthRate,
        marketShare: Math.floor(Math.random() * 15) + 1,
        churn: Math.floor(Math.random() * 5) + 1,
        profit,
        margin
      },
      metrics: {
        revenueHistory: [
          { year: 2021, value: Math.floor(revenue * 0.8) },
          { year: 2022, value: Math.floor(revenue * 0.9) },
          { year: 2023, value: revenue }
        ],
        profitHistory: [
          { year: 2021, value: Math.floor(profit * 0.7) },
          { year: 2022, value: Math.floor(profit * 0.85) },
          { year: 2023, value: profit }
        ],
        characteristics: [
          { trait: 'Innovation', value: Math.floor(Math.random() * 100) },
          { trait: 'Stability', value: Math.floor(Math.random() * 100) },
          { trait: 'Efficiency', value: Math.floor(Math.random() * 100) },
          { trait: 'Growth', value: Math.floor(Math.random() * 100) },
          { trait: 'Market Fit', value: Math.floor(Math.random() * 100) }
        ]
      }
    }
  })

  await db.delete(entities) // Clear existing
  await db.insert(entities).values(dummyEntities)

  console.log('Done!')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
