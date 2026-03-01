import { Redis } from '@upstash/redis'
import { eq, sql } from 'drizzle-orm'

import { getOrCreateUserMetadata } from '@/lib/auth/get-current-user'
import { db } from '@/lib/db'
import { usersMetadata } from '@/lib/db/schema'
import { perfLog } from '@/lib/utils/perf-logging'

/**
 * Get timestamp of next midnight UTC
 */
function getNextMidnightTimestamp(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setUTCHours(24, 0, 0, 0)
  return midnight.getTime()
}

async function checkOverallChatLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  // Get user metadata (which includes plan and usage limits)
  const metadata = await getOrCreateUserMetadata(userId)

  // Check if reset is needed (if lastResetAt is before today's midnight)
  const now = new Date()
  const lastReset = new Date(metadata.lastResetAt)
  const todayMidnight = new Date()
  todayMidnight.setUTCHours(0, 0, 0, 0)

  let currentUsage = metadata.usageCurrent

  if (lastReset < todayMidnight) {
    // Reset usage for the new day
    await db
      .update(usersMetadata)
      .set({
        usageCurrent: 1,
        lastResetAt: now
      })
      .where(eq(usersMetadata.id, userId))
    currentUsage = 1
  } else {
    // Increment usage
    const [updated] = await db
      .update(usersMetadata)
      .set({
        usageCurrent: sql`${usersMetadata.usageCurrent} + 1`
      })
      .where(eq(usersMetadata.id, userId))
      .returning()
    currentUsage = updated.usageCurrent
  }

  const remaining = Math.max(0, metadata.usageLimit - currentUsage)
  const resetAt = getNextMidnightTimestamp()

  return {
    allowed: currentUsage <= metadata.usageLimit,
    remaining,
    resetAt
  }
}

/**
 * Check and enforce chat rate limit
 * Returns a 429 Response if limit is exceeded, null if allowed
 */
export async function checkAndEnforceOverallChatLimit(
  userId: string
): Promise<Response | null> {
  // Get metadata for limit info
  const metadata = await getOrCreateUserMetadata(userId)
  const result = await checkOverallChatLimit(userId)

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Daily chat limit reached. Please try again tomorrow.',
        remaining: 0,
        resetAt: result.resetAt,
        limit: metadata.usageLimit
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(metadata.usageLimit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt)
        }
      }
    )
  }

  perfLog(
    `Chat usage: ${metadata.usageLimit - result.remaining}/${metadata.usageLimit}`
  )

  return null
}
