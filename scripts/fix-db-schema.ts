import { sql } from 'drizzle-orm'

import { db } from '../lib/db'

async function run() {
  console.log('Adding industry column...')
  try {
    await db.execute(sql`ALTER TABLE "entities" RENAME COLUMN "sector" TO "industry"`)
    console.log('Renamed sector to industry')
  } catch (e) {
    console.log('Renaming failed (maybe sector does not exist), adding industry column...')
    await db.execute(sql`ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "industry" text`)
  }

  console.log('Adding metrics column...')
  await db.execute(sql`ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "metrics" jsonb`)

  console.log('Updating kpis constraints...')
  // Drizzle schema changed kpis to include profit and margin.
  // PostgreSQL jsonb doesn't need column change if it's already jsonb, just the data structure.

  console.log('Done!')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
