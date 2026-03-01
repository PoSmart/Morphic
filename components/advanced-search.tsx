'use client'

import React, { useEffect, useState } from 'react'

import { ArrowUpRight,LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { getEntities } from '@/lib/actions/entities'

interface Entity {
  id: string
  name: string
  logo: string
  description: string
  revenue: number
  growth: number
  marketShare: number
  sector: string
}

export function AdvancedSearch() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [revenueRange, setRevenueRange] = useState([0, 200])
  const [growthRange, setGrowthRange] = useState([0, 100])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true)
      try {
        const data = await getEntities({
          search: searchQuery,
          minRevenue: revenueRange[0],
          maxRevenue: revenueRange[1],
          minGrowth: growthRange[0],
          maxGrowth: growthRange[1]
        })
        setEntities(data)
      } catch (error) {
        console.error('Failed to fetch entities:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchEntities, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, revenueRange, growthRange])

  const filteredEntities = entities.filter(e => {
    // Basic frontend filtering for responsiveness while waiting for search action
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRevenue = e.revenue >= revenueRange[0] && e.revenue <= revenueRange[1]
    const matchesGrowth = e.growth >= growthRange[0] && e.growth <= growthRange[1]
    return matchesSearch && matchesRevenue && matchesGrowth
  })

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-6 p-6 overflow-hidden">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 shrink-0 space-y-8 bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="size-5 text-muted-foreground" />
          <h2 className="font-semibold">KPI Filters</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <label className="text-muted-foreground">Revenue (M€)</label>
              <span className="font-medium">{revenueRange[0]} - {revenueRange[1]}+</span>
            </div>
            <Slider
              min={0}
              max={200}
              step={10}
              value={revenueRange}
              onValueChange={setRevenueRange}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <label className="text-muted-foreground">Growth Rate (%)</label>
              <span className="font-medium">{growthRange[0]} - {growthRange[1]}+</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={growthRange}
              onValueChange={setGrowthRange}
              className="py-4"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search companies, projects, assets..."
              className="pl-10 h-11 bg-muted/30 border-border/50 rounded-2xl focus-visible:ring-ring/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg h-8 w-10 p-0"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-lg h-8 w-10 p-0"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading && entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p>Loading entities...</p>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-border/50">
              <p>No entities match your filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEntities.map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredEntities.map((entity) => (
                <EntityListItem key={entity.id} entity={entity} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function EntityCard({ entity }: { entity: Entity }) {
  return (
    <Card className="group hover:bg-muted/30 transition-all duration-300 border-border/50 rounded-3xl overflow-hidden shadow-none">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <Avatar className="size-12 rounded-2xl border border-border/50">
            <AvatarImage src={entity.logo} />
            <AvatarFallback>{entity.name[0]}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{entity.name}</h3>
          <Badge variant="secondary" className="bg-muted text-[10px] uppercase tracking-wider font-bold">
            {entity.sector}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {entity.description}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Revenue</p>
            <p className="font-medium text-sm">{entity.revenue} M€</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Growth</p>
            <p className="font-medium text-sm text-green-500">+{entity.growth}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EntityListItem({ entity }: { entity: Entity }) {
  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-all duration-300 border border-border/50 rounded-2xl">
      <Avatar className="size-10 rounded-xl border border-border/50">
        <AvatarImage src={entity.logo} />
        <AvatarFallback>{entity.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{entity.name}</h3>
          <Badge variant="secondary" className="bg-muted text-[9px] uppercase font-bold px-1.5 py-0">
            {entity.sector}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{entity.description}</p>
      </div>

      <div className="hidden md:flex gap-8 px-6 border-x border-border/30 text-right shrink-0">
        <div className="w-20">
          <p className="text-[9px] uppercase text-muted-foreground font-semibold">Revenue</p>
          <p className="font-medium text-xs">{entity.revenue} M€</p>
        </div>
        <div className="w-16">
          <p className="text-[9px] uppercase text-muted-foreground font-semibold">Growth</p>
          <p className="font-medium text-xs text-green-500">+{entity.growth}%</p>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="rounded-full shrink-0">
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  )
}
