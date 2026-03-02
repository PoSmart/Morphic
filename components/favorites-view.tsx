'use client'

import React, { useEffect, useState } from 'react'

import { 
  closestCenter,
  DndContext, 
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  ExternalLink,
  FolderPlus, 
  GripVertical, 
  MoreVertical, 
  Share2,
  Star, 
  Trash2,
  Edit2} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { 
  getLists, 
  getEntitiesInList, 
  deleteList, 
  toggleEntityInList,
  createList,
  renameList
} from '@/lib/actions/favorites'
import { FavoriteButton } from '@/components/favorite-button'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface FavoriteEntity {
  id: string
  entityId?: string
  name: string
  logo: string
  industry: string
}

interface FavoriteList {
  id: string
  name: string
  entityCount: number
}

export function FavoritesView() {
  const [lists, setLists] = useState<FavoriteList[]>([])
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [entities, setEntities] = useState<FavoriteEntity[]>([])
  const [loading, setLoading] = useState(true)

  const activeList = lists.find(l => l.id === activeListId)

  useEffect(() => {
    fetchLists()
  }, [])

  useEffect(() => {
    if (activeListId) {
      fetchEntities(activeListId)
    }
  }, [activeListId])

  async function fetchLists() {
    try {
      const data = await getLists()
      setLists(data)
      if (data.length > 0 && !activeListId) {
        setActiveListId(data[0].id)
      }
    } catch (error) {
      toast.error('Failed to fetch watchlists')
    } finally {
      setLoading(false)
    }
  }

  async function fetchEntities(listId: string) {
    try {
      const data = await getEntitiesInList(listId)
      setEntities(data.map(e => ({
        id: e.id,
        entityId: e.id,
        name: e.name,
        logo: e.logo || '',
        industry: e.industry || 'Unknown'
      })))
    } catch (error) {
      toast.error('Failed to fetch entities')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = entities.findIndex(e => e.id === active.id)
      const newIndex = entities.findIndex(e => e.id === over.id)
      
      const newEntities = arrayMove(entities, oldIndex, newIndex)
      setEntities(newEntities)
      
      // Note: In a real app, you would also update the order in the database here
      // For now, we update the local state to maintain the UI feel
    }
  }

  async function handleDeleteList() {
    if (!activeListId) return
    if (!confirm('Are you sure you want to delete this watchlist?')) return

    try {
      await deleteList(activeListId)
      toast.success('Watchlist deleted')
      const remainingLists = lists.filter(l => l.id !== activeListId)
      setLists(remainingLists)
      if (remainingLists.length > 0) {
        setActiveListId(remainingLists[0].id)
      } else {
        setActiveListId(null)
        setEntities([])
      }
    } catch (error) {
      toast.error('Failed to delete watchlist')
    }
  }

  async function handleRenameList() {
    if (!activeListId || !activeList) return
    const newName = prompt('Enter new watchlist name:', activeList.name)
    if (!newName || newName === activeList.name) return

    try {
      await renameList(activeListId, newName)
      setLists(prev => prev.map(l => l.id === activeListId ? { ...l, name: newName } : l))
      toast.success('Watchlist renamed')
    } catch (error) {
      toast.error('Failed to rename watchlist')
    }
  }

  async function handleRemoveFromList(entityId: string) {
    if (!activeListId) return
    try {
      await toggleEntityInList(entityId, activeListId)
      setEntities(prev => prev.filter(e => e.id !== entityId))
      setLists(prev => prev.map(l => l.id === activeListId ? { ...l, entityCount: l.entityCount - 1 } : l))
      toast.success('Removed from watchlist')
    } catch (error) {
      toast.error('Failed to remove entity')
    }
  }

  async function handleCreateList() {
    const name = prompt('Enter watchlist name:')
    if (!name) return

    try {
      const newList = await createList(name)
      const newListWithCount = { ...newList, entityCount: 0 }
      setLists(prev => [...prev, newListWithCount])
      setActiveListId(newList.id)
      toast.success('Watchlist created')
    } catch (error) {
      toast.error('Failed to create watchlist')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full gap-6 p-6 pt-20 overflow-hidden">
      {/* Sidebar: Lists */}
      <aside className="w-64 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Star className="size-4 fill-primary text-primary" />
            Watchlists
          </h2>
          <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleCreateList}>
            <FolderPlus className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left group",
                activeListId === list.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="truncate">{list.name}</span>
                <Badge variant="secondary" className="bg-muted text-[10px] rounded-md px-1.5 shrink-0">
                  {list.entityCount}
                </Badge>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main: Drag & Drop List */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <h1 className="text-2xl font-bold tracking-tight">{activeList?.name || 'No Watchlist Selected'}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={handleRenameList} disabled={!activeListId}>
              <Edit2 className="size-4 mr-2" /> Rename
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9">
              <Share2 className="size-4 mr-2" /> Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-9 text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={handleDeleteList}
              disabled={!activeListId}
            >
              <Trash2 className="size-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activeListId && (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={entities.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {entities.map((entity) => (
                    <SortableEntityItem 
                      key={entity.id} 
                      entity={entity} 
                      onRemove={() => handleRemoveFromList(entity.id)}
                      onListUpdate={fetchLists}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {activeListId && entities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-border/50">
              <p>This list is empty. Add entities from the search.</p>
            </div>
          )}

          {!activeListId && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-border/50">
              <p>Create a watchlist to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SortableEntityItem({ 
  entity, 
  onRemove,
  onListUpdate
}: { 
  entity: FavoriteEntity,
  onRemove: () => void,
  onListUpdate: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: entity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: isDragging ? 'relative' : 'static' as any,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-2xl backdrop-blur-sm hover:border-primary/20 transition-all",
        isDragging && "opacity-50 border-primary scale-[1.02] shadow-xl"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors p-1">
        <GripVertical className="size-4" />
      </div>

      <Avatar className="size-10 rounded-xl border border-border/50">
        <AvatarImage src={entity.logo} />
        <AvatarFallback>{entity.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{entity.name}</h3>
          <Badge variant="secondary" className="bg-muted text-[9px] uppercase font-bold px-1.5 py-0">
            {entity.industry}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <FavoriteButton 
          entityId={entity.entityId || entity.id} 
          variant="icon" 
          onUpdate={onListUpdate}
          className="opacity-100 group-hover:opacity-100"
        />
        <Button variant="ghost" size="icon" className="size-8 rounded-full" asChild>
          <a href={`/search/${entity.id}`}>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="rounded-lg text-destructive" onClick={onRemove}>
              Remove from Watchlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
