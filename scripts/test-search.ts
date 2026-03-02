import { getEntities } from '../lib/actions/entities'

async function test() {
  process.env.ENABLE_AUTH = 'false' // Disable auth for testing
  
  console.log('--- Test 1: Empty search ---')
  const all = await getEntities({})
  console.log('Total entities found:', all.length)

  console.log('--- Test 2: Search by name ---')
  const search = await getEntities({ search: 'Entity 1' })
  console.log('Search "Entity 1" results:', search.length)

  console.log('--- Test 3: Filter by industry ---')
  const industry = await getEntities({ industries: ['Tech'] })
  console.log('Industry "Tech" results:', industry.length)

  console.log('--- Test 4: Filter by revenue ---')
  const revenue = await getEntities({ minRevenue: 500 })
  console.log('Revenue >= 500 results:', revenue.length)

  console.log('--- Test 5: Complex filter ---')
  const complex = await getEntities({ 
    minRevenue: 100, 
    maxRevenue: 800,
    minGrowth: 0,
    industries: ['Fintech', 'Tech']
  })
  console.log('Complex filter results:', complex.length)
}

test().catch(console.error)
