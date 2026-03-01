'use client'

import React, { useState } from 'react'

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
  Trash2} from 'lucide-react'

import { cn } from '@/lib/utils'

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
  name: string
  logo: string
  sector: string
}

interface FavoriteList {
  id: string
  name: string
  entities: FavoriteEntity[]
}

const DUMMY_FAVORITES: FavoriteList[] = [
  {
    id: 'list-1',
    name: 'Top Tech Italia',
    entities: [
      { id: '1', name: 'TechFlow', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF', sector: 'SaaS' },
      { id: '2', name: 'CloudScale', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS', sector: 'Infrastructure' }
    ]
  },
  {
    id: 'list-2',
    name: 'Green Energy Assets',
    entities: [
      { id: '3', name: 'GreenDrive', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GD', sector: 'Energy' }
    ]
  }
]

export function FavoritesView() {
  const [lists, setLists] = useState(DUMMY_FAVORITES)
  const [activeListId, setActiveListId] = useState(lists[0].id)

  const activeList = lists.find(l => l.id === activeListId) || lists[0]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLists((items) => {
        const listIndex = items.findIndex(l => l.id === activeListId)
        const oldIndex = items[listIndex].entities.findIndex(e => e.id === active.id)
        const newIndex = items[listIndex].entities.findIndex(e => e.id === over.id)

        const newItems = [...items]
        newItems[listIndex] = {
          ...newItems[listIndex],
          entities: arrayMove(newItems[listIndex].entities, oldIndex, newIndex)
        }
        return newItems
      })
    }
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
          <Button variant="ghost" size="icon" className="size-8 rounded-full">
            <FolderPlus className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                activeListId === list.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <span className="truncate">{list.name}</span>
              <Badge variant="secondary" className="bg-muted text-[10px] rounded-md px-1.5 ml-2">
                {list.entities.length}
              </Badge>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main: Drag & Drop List */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <h1 className="text-2xl font-bold tracking-tight">{activeList.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9">
              <Share2 className="size-4 mr-2" /> Share
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 text-destructive hover:bg-destructive/5 border-destructive/20">
              <Trash2 className="size-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={activeList.entities.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {activeList.entities.map((entity) => (
                  <SortableEntityItem key={entity.id} entity={entity} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {activeList.entities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-border/50">
              <p>This list is empty. Add entities from the search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SortableEntityItem({ entity }: { entity: FavoriteEntity }) {
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
            {entity.sector}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <ExternalLink className="size-3.5 text-muted-foreground" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="rounded-lg">Move to List</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-destructive">Remove from Watchlist</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
