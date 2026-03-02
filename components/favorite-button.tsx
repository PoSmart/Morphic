'use client'

import React, { useEffect, useState } from 'react'
import { Check, Heart, Plus, Loader2 } from 'lucide-react'
import { 
  getLists, 
  getEntityLists, 
  toggleEntityInList, 
  createList 
} from '@/lib/actions/favorites'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  entityId: string
  variant?: 'icon' | 'full'
  className?: string
  onUpdate?: () => void
}

export function FavoriteButton({ entityId, variant = 'icon', className, onUpdate }: FavoriteButtonProps) {
  const [lists, setLists] = useState<any[]>([])
  const [activeListIds, setActiveListIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchData = async () => {
    try {
      const [allLists, entityLists] = await Promise.all([
        getLists(),
        getEntityLists(entityId)
      ])
      setLists(allLists)
      setActiveListIds(entityLists)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = async (listId: string) => {
    try {
      const isAdded = await toggleEntityInList(entityId, listId)
      setActiveListIds(prev => 
        isAdded ? [...prev, listId] : prev.filter(id => id !== listId)
      )
      toast.success(isAdded ? 'Added to list' : 'Removed from list')
      onUpdate?.()
    } catch (err) {
      toast.error('Failed to update list')
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    setIsCreating(true)
    try {
      const newList = await createList(newListName)
      setLists(prev => [...prev, newList])
      setNewListName('')
      toast.success('List created')
      // Automatically add entity to the new list
      await handleToggle(newList.id)
    } catch (err) {
      toast.error('Failed to create list')
    } finally {
      setIsCreating(false)
    }
  }

  const isFavorite = activeListIds.length > 0

  return (
    <Popover onOpenChange={(open) => open && fetchData()}>
      <PopoverTrigger asChild>
        {variant === 'icon' ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full transition-all duration-300",
              isFavorite ? "text-red-500 bg-red-500/10 opacity-100" : "opacity-0 group-hover:opacity-100",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className={cn("size-4", isFavorite && "fill-current")} />
          </Button>
        ) : (
          <Button 
            variant={isFavorite ? "secondary" : "outline"} 
            className={cn("rounded-2xl gap-2", isFavorite && "text-red-500 bg-red-500/10 border-red-500/20", className)}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className={cn("size-4", isFavorite && "fill-current")} />
            {isFavorite ? "In Favorites" : "Add to Favorites"}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 rounded-2xl" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <h4 className="font-bold text-sm px-1">Add to Watchlist</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {lists.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-2">No lists found. Create one below.</p>
            ) : (
              lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleToggle(list.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-xl text-sm transition-colors text-left"
                >
                  <span className="truncate">{list.name}</span>
                  {activeListIds.includes(list.id) && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                placeholder="New list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="h-8 text-xs rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              />
              <Button 
                size="icon" 
                className="size-8 rounded-lg shrink-0" 
                onClick={handleCreateList}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
