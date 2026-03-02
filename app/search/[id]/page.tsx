import { notFound } from 'next/navigation'

import { getEntityById } from '@/lib/actions/entities'
import { isFavorite } from '@/lib/actions/favorites'

import { EntityDetail } from '@/components/entity-detail'

export default async function EntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entity = await getEntityById(id)
  
  if (!entity) {
    notFound()
  }

  const favorite = await isFavorite(entity.id)

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-background">
      <EntityDetail entity={entity} isInitialFavorite={favorite} />
    </div>
  )
}
