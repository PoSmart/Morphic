import { getEntities, getEntityById } from '../lib/actions/entities'

async function testDetailFlow() {
  process.env.ENABLE_AUTH = 'false'
  
  console.log('--- Step 1: Getting an entity ID ---')
  const entities = await getEntities({ search: 'Entity 1' })
  if (entities.length === 0) {
    console.error('No entities found to test!')
    return
  }
  
  const targetId = entities[0].id
  console.log('Testing with ID:', targetId)

  console.log('--- Step 2: Fetching by ID ---')
  const entity = await getEntityById(targetId)
  
  if (entity) {
    console.log('SUCCESS: Entity found!')
    console.log('Name:', entity.name)
    console.log('Industry:', entity.industry)
    console.log('Has KPIs:', !!entity.kpis)
    console.log('Has Metrics:', !!entity.metrics)
    
    if (entity.metrics && entity.metrics.revenueHistory) {
      console.log('Revenue History samples:', entity.metrics.revenueHistory.length)
    }
  } else {
    console.error('FAILED: Entity not found by ID!')
  }
}

testDetailFlow().catch(console.error)
