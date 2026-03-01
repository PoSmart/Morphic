import { tool } from 'ai'
import { and, eq, or, sql } from 'drizzle-orm'
import { z } from 'zod'

import { generateEmbedding } from '@/lib/ai/embedding'
import { db } from '@/lib/db'
import { knowledgeBase } from '@/lib/db/schema'

export const ragSearchTool = tool({
  description: 'Search the local knowledge base for relevant documents.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    userId: z.string().optional().describe('The user ID to restrict search to'),
    teamId: z.string().optional().describe('The team ID to restrict search to')
  }),
  execute: async ({ query, userId, teamId }: { query: string; userId?: string; teamId?: string }) => {
    const embedding = await generateEmbedding(query)
    const embeddingString = `[${embedding.join(',')}]`

    // Similarity search using pgvector cosine distance (<=>)
    // 1 - distance = similarity
    const results = await db
      .select({
        id: knowledgeBase.id,
        content: knowledgeBase.content,
        similarity: sql<number>`1 - (embedding <=> ${embeddingString}::vector)`
      })
      .from(knowledgeBase)
      .where(
        and(
          or(
            userId ? eq(knowledgeBase.userId, userId) : undefined,
            teamId ? eq(knowledgeBase.teamId, teamId) : undefined
          ),
          sql`1 - (embedding <=> ${embeddingString}::vector) > 0.5` // Similarity threshold
        )
      )
      .orderBy(sql`embedding <=> ${embeddingString}::vector`)
      .limit(5)

    return {
      results: results.map(r => ({
        title: 'Local Knowledge Base',
        content: r.content,
        url: `#kb-${r.id}`,
        similarity: r.similarity
      }))
    }
  }
})
