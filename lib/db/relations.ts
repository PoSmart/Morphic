import { relations } from 'drizzle-orm'

import {
  chats,
  entities,
  favoriteEntities,
  favoriteLists,
  knowledgeBase,
  messages,
  parts,
  teamMembers,
  teams,
  usersMetadata
} from './schema'

export const usersMetadataRelations = relations(usersMetadata, ({ many }) => ({
  teams: many(teams),
  teamMemberships: many(teamMembers),
  favoriteLists: many(favoriteLists),
  knowledgeBaseEntries: many(knowledgeBase)
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(usersMetadata, {
    fields: [teams.ownerId],
    references: [usersMetadata.id]
  }),
  members: many(teamMembers),
  favoriteLists: many(favoriteLists),
  knowledgeBaseEntries: many(knowledgeBase)
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  }),
  user: one(usersMetadata, {
    fields: [teamMembers.userId],
    references: [usersMetadata.id]
  })
}))

export const favoriteListsRelations = relations(
  favoriteLists,
  ({ one, many }) => ({
    user: one(usersMetadata, {
      fields: [favoriteLists.userId],
      references: [usersMetadata.id]
    }),
    team: one(teams, {
      fields: [favoriteLists.teamId],
      references: [teams.id]
    }),
    entities: many(favoriteEntities)
  })
)

export const favoriteEntitiesRelations = relations(
  favoriteEntities,
  ({ one }) => ({
    list: one(favoriteLists, {
      fields: [favoriteEntities.listId],
      references: [favoriteLists.id]
    }),
    entity: one(entities, {
      fields: [favoriteEntities.entityId],
      references: [entities.id]
    })
  })
)

export const entitiesRelations = relations(entities, ({ many }) => ({
  favoritedBy: many(favoriteEntities)
}))

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  user: one(usersMetadata, {
    fields: [knowledgeBase.userId],
    references: [usersMetadata.id]
  }),
  team: one(teams, {
    fields: [knowledgeBase.teamId],
    references: [teams.id]
  })
}))

export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages)
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  }),
  parts: many(parts)
}))

export const partsRelations = relations(parts, ({ one }) => ({
  message: one(messages, {
    fields: [parts.messageId],
    references: [messages.id]
  })
}))
