'use server'

import { and, desc, eq, ilike, inArray, sql } from 'drizzle-orm'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { db } from '@/lib/db'
import { entities } from '@/lib/db/schema'

export async function getEntities(params: {
  search?: string
  minRevenue?: number
  maxRevenue?: number
  minGrowth?: number
  maxGrowth?: number
  industries?: string[]
  locations?: string[]
}) {
  const userId = await getCurrentUserId()
  
  if (!userId && process.env.ENABLE_AUTH !== 'false') {
    throw new Error('Unauthorized')
  }

  const conditions = []
  if (params.search) {
    conditions.push(ilike(entities.name, `%${params.search}%`))
  }

  if (params.industries && params.industries.length > 0) {
    conditions.push(inArray(entities.industry, params.industries))
  }

  if (params.locations && params.locations.length > 0) {
    conditions.push(inArray(entities.location, params.locations))
  }
  
  if (params.minRevenue !== undefined) {
    conditions.push(sql`(entities.kpis->>'revenue')::numeric >= ${params.minRevenue}`)
  }
  if (params.maxRevenue !== undefined) {
    conditions.push(sql`(entities.kpis->>'revenue')::numeric <= ${params.maxRevenue}`)
  }
  if (params.minGrowth !== undefined) {
    conditions.push(sql`(entities.kpis->>'growthRate')::numeric >= ${params.minGrowth}`)
  }
  if (params.maxGrowth !== undefined) {
    conditions.push(sql`(entities.kpis->>'growthRate')::numeric <= ${params.maxGrowth}`)
  }
  
  const results = await db.select()
    .from(entities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(entities.createdAt))
  
  return results.map(e => ({
    id: e.id,
    name: e.name,
    logo: e.logo || '',
    description: e.description || '',
    revenue: e.kpis?.revenue || 0,
    growth: e.kpis?.growthRate || 0,
    marketShare: e.kpis?.marketShare || 0,
    industry: e.industry || 'Uncategorized',
    location: e.location || 'Unknown'
  }))
}

export async function getEntityById(id: string) {
  if (!id) return null
  
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') {
    throw new Error('Unauthorized')
  }

  const results = await db.select().from(entities).where(eq(entities.id, id))
  return results[0] || null
}
