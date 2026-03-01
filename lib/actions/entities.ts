'use server'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { db } from '@/lib/db'
import { entities } from '@/lib/db/schema'
import { desc, ilike, and, gte, lte } from 'drizzle-orm'

export async function getEntities(params: {
  search?: string
  minRevenue?: number
  maxRevenue?: number
  minGrowth?: number
  maxGrowth?: number
}) {
  console.log('[ACTION] getEntities called with params:', params)
  const userId = await getCurrentUserId()
  console.log('[ACTION] userId:', userId)
  
  // Allow if we have a userId OR if auth is disabled
  if (!userId && process.env.ENABLE_AUTH !== 'false') {
    throw new Error('Unauthorized')
  }

  // Note: RLS is enabled on entities table in schema.ts
  // but we are using drizzle here. If we want to respect RLS with drizzle,
  // we usually need to set the current_user_id in the session.
  // For now, let's just fetch them as it's a read operation that is allowed to 'public' in schema.ts:
  // pgPolicy('anyone_can_read_entities', { for: 'select', to: 'public', using: sql`true` })

  let query = db.select().from(entities)

  const conditions = []
  if (params.search) {
    conditions.push(ilike(entities.name, `%${params.search}%`))
  }
  
  // JSONB extraction for KPIs might be tricky with ilike/gte/lte in Drizzle
  // For simplicity, we could fetch all and filter in memory if the dataset is small,
  // or use sql`` for JSONB fields.
  
  const results = await db.select().from(entities).where(and(...conditions)).orderBy(desc(entities.createdAt))
  
  // Map back to the UI structure
  return results.map(e => ({
    id: e.id,
    name: e.name,
    logo: e.logo || '',
    description: e.description || '',
    revenue: e.kpis?.revenue || 0,
    growth: e.kpis?.growthRate || 0,
    marketShare: e.kpis?.marketShare || 0,
    sector: e.sector || 'Uncategorized'
  }))
}
