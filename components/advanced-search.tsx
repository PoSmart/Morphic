'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { ArrowUpRight, Check, ChevronDown, Filter, Heart, LayoutGrid, List, Menu, Search, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'

import { FavoriteButton } from '@/components/favorite-button'
import { getAllFavoriteIds, isFavorite, toggleFavorite } from '@/lib/actions/favorites'
import { getEntities } from '@/lib/actions/entities'
import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'

interface Entity {
  id: string
  name: string
  logo: string
  description: string
  revenue: number
  growth: number
  marketShare: number
  industry: string
  location: string
}

const INDUSTRIES = ['Tech', 'Fintech', 'Healhtech', 'Sustainability', 'AI & Data', 'E-commerce']
const LOCATIONS = ['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze']

export function AdvancedSearch() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [revenueRange, setRevenueRange] = useState([0, 1000])
  const [growthRange, setGrowthRange] = useState([-10, 50])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true)
      try {
        const [data, favoriteIds] = await Promise.all([
          getEntities({
            search: searchQuery,
            minRevenue: revenueRange[0],
            maxRevenue: revenueRange[1],
            minGrowth: growthRange[0],
            maxGrowth: growthRange[1],
            industries: selectedIndustries,
            locations: selectedLocations
          }),
          getAllFavoriteIds()
        ])
        
        setEntities(data)
        
        const favStatus = data.reduce((acc, entity) => ({
          ...acc, [entity.id]: favoriteIds.includes(entity.id)
        }), {})
        setFavorites(favStatus)
      } catch (error) {
        console.error('Failed to fetch entities:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchEntities, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, revenueRange, growthRange, selectedIndustries, selectedLocations])

  const handleToggleFavorite = async (e: React.MouseEvent, entityId: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const isFav = await toggleFavorite(entityId)
      setFavorites(prev => ({ ...prev, [entityId]: isFav }))
      toast.success(isFav ? 'Added to favorites' : 'Removed from favorites')
    } catch (err) {
      toast.error('Failed to update favorites')
    }
  }

  const clearAllFilters = () => {
    setSelectedIndustries([])
    setSelectedLocations([])
    setRevenueRange([0, 1000])
    setGrowthRange([-10, 50])
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Search Header - Full Width */}
      <div className="w-full bg-background border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, description, or keywords..."
                className="pl-10 h-12 bg-muted/20 border-border/50 rounded-2xl focus-visible:ring-primary/20 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden sm:flex items-center bg-muted/30 p-1 rounded-xl border border-border/40">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg h-9 px-3"
              >
                <LayoutGrid className="size-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-lg h-9 px-3"
              >
                <List className="size-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Horizontal Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover 
              label="Industry" 
              options={INDUSTRIES} 
              selected={selectedIndustries} 
              onSelect={(val) => setSelectedIndustries(prev => 
                prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
              )}
              onClear={() => setSelectedIndustries([])}
            />
            <FilterPopover 
              label="Location" 
              options={LOCATIONS} 
              selected={selectedLocations} 
              onSelect={(val) => setSelectedLocations(prev => 
                prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
              )}
              onClear={() => setSelectedLocations([])}
            />
            
            <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />

            <RangePopover 
              label="Revenue" 
              value={revenueRange} 
              min={0} 
              max={1000} 
              step={50} 
              unit="M€"
              onChange={setRevenueRange} 
            />
            <RangePopover 
              label="Growth" 
              value={growthRange} 
              min={-20} 
              max={100} 
              step={5} 
              unit="%"
              onChange={setGrowthRange} 
            />

            {(selectedIndustries.length > 0 || selectedLocations.length > 0 || revenueRange[0] !== 0 || revenueRange[1] !== 1000 || growthRange[0] !== -10 || growthRange[1] !== 50) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors h-8"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filter Tags */}
          {(selectedIndustries.length > 0 || selectedLocations.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {selectedIndustries.map(industry => (
                <Badge key={`ind-${industry}`} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-primary/5 text-primary border-primary/20 rounded-lg text-[11px]">
                  {industry}
                  <button 
                    onClick={() => setSelectedIndustries(prev => prev.filter(i => i !== industry))}
                    className="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              {selectedLocations.map(loc => (
                <Badge key={`loc-${loc}`} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-blue-500/5 text-blue-600 border-blue-500/20 rounded-lg text-[11px]">
                  {loc}
                  <button 
                    onClick={() => setSelectedLocations(prev => prev.filter(i => i !== loc))}
                    className="hover:bg-blue-500/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Main Results Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/5 p-6 space-y-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading && entities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                <div className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse">Analyzing market data...</p>
              </div>
            ) : entities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-card/30 rounded-[2rem] border-2 border-dashed border-border/40">
                <Search className="size-12 mb-4 opacity-20" />
                <p className="text-lg font-semibold">No entities match your criteria</p>
                <p className="text-sm opacity-60">Try adjusting your filters or search keywords</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                {entities.map((entity) => (
                  <EntityCard 
                    key={entity.id} 
                    entity={entity} 
                    isFavorite={favorites[entity.id]}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-12">
                {entities.map((entity) => (
                  <EntityListItem 
                    key={entity.id} 
                    entity={entity} 
                    isFavorite={favorites[entity.id]}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function FilterPopover({ 
  label, 
  options, 
  selected, 
  onSelect, 
  onClear 
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onSelect: (val: string) => void,
  onClear: () => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-9 rounded-xl border-border/50 gap-2 px-4 transition-all",
            selected.length > 0 && "border-primary/50 bg-primary/5 text-primary"
          )}
        >
          <span className="text-xs font-semibold">{label}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] rounded-md bg-primary text-primary-foreground border-none text-[10px]">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className={cn("size-3.5 transition-transform opacity-50", "group-data-[state=open]:rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 rounded-2xl border-border/40 shadow-2xl" align="start">
        <Command className="rounded-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}s</span>
            {selected.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="h-6 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/5 px-2"
              >
                Clear
              </Button>
            )}
          </div>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="h-9" />
          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => onSelect(option)}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-primary transition-all",
                    selected.includes(option)
                      ? "bg-primary text-primary-foreground"
                      : "opacity-40"
                  )}>
                    {selected.includes(option) && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function RangePopover({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit,
  onChange 
}: { 
  label: string, 
  value: number[], 
  min: number, 
  max: number, 
  step: number,
  unit: string,
  onChange: (val: number[]) => void 
}) {
  const isModified = value[0] !== min || value[1] !== max;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-9 rounded-xl border-border/50 gap-2 px-4 transition-all",
            isModified && "border-primary/50 bg-primary/5 text-primary"
          )}
        >
          <span className="text-xs font-semibold">{label}</span>
          {isModified && (
            <span className="text-[10px] font-bold opacity-80">
              {value[0]}-{value[1]}{unit}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-6 rounded-2xl border-border/40 shadow-2xl" align="start">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label} Range</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onChange([min, max])}
              className="h-6 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/5 px-2"
            >
              Reset
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl">
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Min</p>
                <p className="text-sm font-bold">{value[0]}{unit}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Max</p>
                <p className="text-sm font-bold">{value[1]}{unit}</p>
              </div>
            </div>

            <Slider
              min={min}
              max={max}
              step={step}
              value={value}
              onValueChange={onChange}
              className="py-4"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function EntityCard({ 
  entity, 
  isFavorite, 
  onToggleFavorite 
}: { 
  entity: Entity, 
  isFavorite: boolean, 
  onToggleFavorite: (e: React.MouseEvent, id: string) => void 
}) {
  return (
    <Link href={`/search/${entity.id}`}>
      <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border-border/40 rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm h-full flex flex-col">
        <CardContent className="p-7 space-y-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Avatar className="size-14 rounded-2xl border-2 border-background shadow-sm relative z-10">
                <AvatarImage src={entity.logo} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{entity.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-full size-10 transition-all duration-300",
                  isFavorite ? "text-red-500 bg-red-500/10" : "bg-muted/50 opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => onToggleFavorite(e, entity.id)}
              >
                <Heart className={cn("size-5", isFavorite && "fill-current")} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-1">{entity.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase tracking-wider font-black px-2 py-0.5">
                {entity.industry}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-blue-500/20 text-blue-600 bg-blue-500/5 px-2 py-0.5">
                {entity.location}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed flex-1">
            {entity.description}
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/40">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Revenue</p>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-lg">{entity.revenue}</span>
                <span className="text-xs text-muted-foreground font-medium">M€</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Growth</p>
              <div className={cn(
                "flex items-center gap-1 font-bold text-lg",
                entity.growth >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {entity.growth >= 0 ? '+' : ''}{entity.growth}%
                <ArrowUpRight className={cn("size-4", entity.growth < 0 && "rotate-90")} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EntityListItem({ 
  entity, 
  isFavorite, 
  onToggleFavorite 
}: { 
  entity: Entity, 
  isFavorite: boolean, 
  onToggleFavorite: (e: React.MouseEvent, id: string) => void 
}) {
  return (
    <Link href={`/search/${entity.id}`}>
      <div className="group flex items-center gap-6 p-5 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-border/40 rounded-[1.5rem] bg-card/30 backdrop-blur-sm">
        <Avatar className="size-14 rounded-2xl border-2 border-background shadow-sm">
          <AvatarImage src={entity.logo} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">{entity.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{entity.name}</h3>
            <div className="flex gap-2 shrink-0">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase font-black px-1.5 py-0">
                {entity.industry}
              </Badge>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-blue-500/20 text-blue-600 bg-blue-500/5">
                {entity.location}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/80 truncate max-w-2xl">{entity.description}</p>
        </div>

        <div className="hidden md:flex gap-12 px-8 border-x border-border/40 shrink-0">
          <div className="w-24">
            <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1">Revenue</p>
            <p className="font-bold text-base">{entity.revenue} M€</p>
          </div>
          <div className="w-20">
            <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1">Growth</p>
            <p className={cn(
              "font-bold text-base flex items-center gap-1",
              entity.growth >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {entity.growth >= 0 ? '+' : ''}{entity.growth}%
            </p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full size-10",
              isFavorite ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-muted"
            )}
            onClick={(e) => onToggleFavorite(e, entity.id)}
          >
            <Heart className={cn("size-5", isFavorite && "fill-current")} />
          </Button>
          <div className="rounded-full bg-primary/5 p-2.5 opacity-0 group-hover:opacity-100 transition-all text-primary">
            <ArrowUpRight className="size-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
