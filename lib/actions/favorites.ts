'use server'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { db } from '@/lib/db'
import { entities, favoriteEntities, favoriteLists } from '@/lib/db/schema'
import { and, eq, sql, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Lists Management
 */
export async function getLists() {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') return []

  const effectiveUserId = userId || 'anonymous-user'
  
  const lists = await db.query.favoriteLists.findMany({
    where: eq(favoriteLists.userId, effectiveUserId),
    with: {
      entities: true
    }
  })

  return lists.map(list => ({
    ...list,
    entityCount: list.entities.length
  }))
}

export async function createList(name: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') throw new Error('Unauthorized')

  const effectiveUserId = userId || 'anonymous-user'
  const [newList] = await db.insert(favoriteLists).values({
    userId: effectiveUserId,
    name
  }).returning()

  revalidatePath('/favorites')
  return newList
}

export async function renameList(id: string, name: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') throw new Error('Unauthorized')

  await db.update(favoriteLists).set({ name }).where(eq(favoriteLists.id, id))
  revalidatePath('/favorites')
}

export async function deleteList(id: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') throw new Error('Unauthorized')

  await db.delete(favoriteLists).where(eq(favoriteLists.id, id))
  revalidatePath('/favorites')
  revalidatePath('/search')
}

/**
 * Entity Association
 */
export async function getEntityLists(entityId: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') return []

  const userLists = await getLists()
  if (userLists.length === 0) return []

  const listIds = userLists.map(l => l.id)
  
  const associations = await db.select()
    .from(favoriteEntities)
    .where(and(
      inArray(favoriteEntities.listId, listIds),
      eq(favoriteEntities.entityId, entityId)
    ))

  return associations.map(a => a.listId)
}

export async function toggleEntityInList(entityId: string, listId: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') throw new Error('Unauthorized')

  const [existing] = await db.select()
    .from(favoriteEntities)
    .where(and(eq(favoriteEntities.listId, listId), eq(favoriteEntities.entityId, entityId)))

  if (existing) {
    await db.delete(favoriteEntities)
      .where(and(eq(favoriteEntities.listId, listId), eq(favoriteEntities.entityId, entityId)))
  } else {
    const [maxOrder] = await db.select({
      max: sql<number>`max(${favoriteEntities.order})`
    }).from(favoriteEntities).where(eq(favoriteEntities.listId, listId))
    
    await db.insert(favoriteEntities).values({
      listId,
      entityId,
      order: (maxOrder?.max ?? 0) + 1
    })
  }

  revalidatePath('/search')
  revalidatePath('/favorites')
  return !existing
}

export async function getEntitiesInList(listId: string) {
  const results = await db.select({
    id: entities.id,
    name: entities.name,
    logo: entities.logo,
    industry: entities.industry,
    description: entities.description
  })
  .from(favoriteEntities)
  .innerJoin(entities, eq(favoriteEntities.entityId, entities.id))
  .where(eq(favoriteEntities.listId, listId))
  .orderBy(favoriteEntities.order)

  return results
}

export async function isFavorite(entityId: string) {
  const lists = await getEntityLists(entityId)
  return lists.length > 0
}

export async function getAllFavoriteIds() {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') return []

  const effectiveUserId = userId || 'anonymous-user'
  
  const userLists = await db.select()
    .from(favoriteLists)
    .where(eq(favoriteLists.userId, effectiveUserId))
  
  if (userLists.length === 0) return []
  
  const listIds = userLists.map(l => l.id)
  
  const associations = await db.select({ entityId: favoriteEntities.entityId })
    .from(favoriteEntities)
    .where(inArray(favoriteEntities.listId, listIds))
  
  return [...new Set(associations.map(a => a.entityId))]
}

export async function toggleFavorite(entityId: string) {
  const userId = await getCurrentUserId()
  if (!userId && process.env.ENABLE_AUTH !== 'false') throw new Error('Unauthorized')

  const effectiveUserId = userId || 'anonymous-user'
  
  // Find or create the "Default" list for the user
  let [defaultList] = await db.select()
    .from(favoriteLists)
    .where(and(eq(favoriteLists.userId, effectiveUserId), eq(favoriteLists.name, 'Default')))
  
  if (!defaultList) {
    [defaultList] = await db.insert(favoriteLists).values({
      userId: effectiveUserId,
      name: 'Default'
    }).returning()
  }

  return await toggleEntityInList(entityId, defaultList.id)
}
