'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { 
  ArrowLeft, 
  ArrowUpRight, 
  BarChart3, 
  Building2, 
  Calendar, 
  ExternalLink,
  Globe, 
  Heart, 
  Layers, 
  Mail,
  MapPin,
  Phone,
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users} from 'lucide-react'
import { 
  Area,
  AreaChart,
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  PolarAngleAxis, 
  PolarGrid, 
  PolarRadiusAxis, 
  Radar,
  RadarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis} from 'recharts'
import { toast } from 'sonner'

import { toggleFavorite } from '@/lib/actions/favorites'
import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EntityDetail({ entity, isInitialFavorite }: { entity: any, isInitialFavorite: boolean }) {
  const [isFav, setIsFav] = useState(isInitialFavorite)

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite(entity.id)
      setIsFav(result)
      toast.success(result ? 'Added to favorites' : 'Removed from favorites')
    } catch (err) {
      toast.error('Failed to update favorites')
    }
  }

  const revenueData = entity.metrics?.revenueHistory || []
  const profitData = entity.metrics?.profitHistory || []
  const radarData = entity.metrics?.characteristics || []
  
  const pieData = [
    { name: 'Profit', value: entity.kpis?.profit || 0 },
    { name: 'Costs', value: (entity.kpis?.revenue || 0) - (entity.kpis?.profit || 0) }
  ]

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-6">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <Avatar className="size-20 rounded-3xl border-2 border-border shadow-xl">
            <AvatarImage src={entity.logo} />
            <AvatarFallback>{entity.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{entity.name}</h1>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider px-3 py-1">
                {entity.industry}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="size-4" /> Milan, Italy
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="size-4" /> 500-1000 Employees
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium underline cursor-pointer">
                <Globe className="size-4" /> website.com
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={isFav ? "secondary" : "outline"} 
            className={cn("rounded-2xl gap-2", isFav && "text-red-500 bg-red-500/10 border-red-500/20")}
            onClick={handleToggleFavorite}
          >
            <Heart className={cn("size-4", isFav && "fill-current")} />
            {isFav ? "In Favorites" : "Add to Favorites"}
          </Button>
          <Button className="rounded-2xl gap-2 bg-primary hover:bg-primary/90">
            <ExternalLink className="size-4" />
            Full Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description & Charts */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {entity.description}
                Founded in 2015, {entity.name} has consistently redefined the landscape of {entity.industry}. 
                With a robust portfolio of solutions and a commitment to excellence, the company continues 
                to lead market innovation and sustainable growth in the EMEA region.
              </p>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-border/50 bg-card/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="size-4 text-blue-500" />
                  Revenue History (M€)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  Profit Growth (M€)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChartIcon className="size-4 text-amber-500" />
                  Profit Margin Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-500" /> Profit</span>
                  <span className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-blue-500" /> Costs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="size-4 text-purple-500" />
                  Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#88888840" />
                    <PolarAngleAxis dataKey="trait" tick={{fontSize: 10}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={entity.name}
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Datasheet */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-border/50 bg-card/50 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                Technical Datasheet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-4" /> Founded
                  </span>
                  <span className="text-sm font-semibold">2015</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="size-4" /> Series
                  </span>
                  <span className="text-sm font-semibold">Series C</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="size-4" /> Headquarters
                  </span>
                  <span className="text-sm font-semibold text-right">Milan, Italy</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="size-4" /> Last Funding
                  </span>
                  <span className="text-sm font-semibold">45 M€</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm group cursor-pointer">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Mail className="size-4" />
                    </div>
                    <span>contact@{entity.name.toLowerCase().replace(/\s/g, '')}.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group cursor-pointer">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Phone className="size-4" />
                    </div>
                    <span>+39 02 123 4567</span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 rounded-2xl h-12 gap-2" variant="secondary">
                <ArrowUpRight className="size-4" />
                Download PDF Report
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/50 bg-primary/5 shadow-none border-dashed">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Morphic AI Insight
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Based on our analysis, {entity.name} shows high resilience in the {entity.industry} sector. 
                Strong innovation metrics suggest a potential 15% growth in the next 18 months.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary font-bold">
                View detailed AI research →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
