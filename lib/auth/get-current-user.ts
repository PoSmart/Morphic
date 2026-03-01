import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { usersMetadata } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { perfLog } from '@/lib/utils/perf-logging'
import { incrementAuthCallCount } from '@/lib/utils/perf-tracking'

export async function getOrCreateUserMetadata(userId: string) {
  const metadata = await db.query.usersMetadata.findFirst({
    where: eq(usersMetadata.id, userId)
  })

  if (metadata) {
    return metadata
  }

  // Create default metadata if it doesn't exist
  const [newMetadata] = await db
    .insert(usersMetadata)
    .values({
      id: userId,
      plan: 'anon',
      usageLimit: 5
    })
    .returning()

  return newMetadata
}

export async function getCurrentUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null // Supabase is not configured
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function getCurrentUserWithMetadata() {
  const user = await getCurrentUser()
  if (!user) {
    // Check if we are in anonymous mode
    if (process.env.ENABLE_AUTH === 'false') {
      const anonId = process.env.ANONYMOUS_USER_ID || 'anonymous-user'
      const metadata = await getOrCreateUserMetadata(anonId)
      return { id: anonId, email: 'anonymous@example.com', metadata }
    }
    return null
  }

  const metadata = await getOrCreateUserMetadata(user.id)
  return { ...user, metadata }
}

export async function getCurrentUserId() {
  const count = incrementAuthCallCount()
  perfLog(`getCurrentUserId called - count: ${count}`)

  // Skip authentication mode (for personal Docker deployments)
  if (process.env.ENABLE_AUTH === 'false') {
    // Guard: Prevent disabling auth in Morphic Cloud deployments
    if (process.env.MORPHIC_CLOUD_DEPLOYMENT === 'true') {
      throw new Error(
        'ENABLE_AUTH=false is not allowed in MORPHIC_CLOUD_DEPLOYMENT'
      )
    }

    // Always warn when authentication is disabled (except in tests)
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '⚠️  Authentication disabled. Running in anonymous mode.\n' +
          '   All users share the same user ID. For personal use only.'
      )
    }

    return process.env.ANONYMOUS_USER_ID || 'anonymous-user'
  }

  const user = await getCurrentUser()
  return user?.id
}
