'use client'

import React from 'react'

import { 
  ArrowUpRight, Download, FileText, PieChart as PieChartIcon, Presentation,
Share2, TrendingUp, Users, 
  Zap} from 'lucide-react'
import { 
Area, AreaChart, Bar, BarChart, CartesianGrid, 
Cell, Line,   LineChart, Pie,
PieChart, ResponsiveContainer,   Tooltip, XAxis, YAxis} from 'recharts'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '@/components/ui/card'

const REVENUE_DATA = [
  { month: 'Jan', revenue: 2.1, growth: 15 },
  { month: 'Feb', revenue: 2.4, growth: 18 },
  { month: 'Mar', revenue: 2.8, growth: 22 },
  { month: 'Apr', revenue: 3.2, growth: 25 },
  { month: 'May', revenue: 3.8, growth: 30 },
  { month: 'Jun', revenue: 4.5, growth: 28 },
]

const MARKET_SHARE_DATA = [
  { name: 'TechFlow', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Competitor A', value: 25, color: 'hsl(var(--muted-foreground))' },
  { name: 'Competitor B', value: 20, color: 'hsl(var(--muted-foreground) / 0.5)' },
  { name: 'Others', value: 20, color: 'hsl(var(--muted))' },
]

export function AnalyzeDashboard({ id }: { id: string }) {
  // In a real app, fetch entity data by ID
  const entity = {
    name: 'TechFlow',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
    sector: 'SaaS',
    description: 'Cloud infrastructure optimization and AI workflows for modern enterprise.',
    revenue: '45.2M€',
    growth: '28.4%',
    marketShare: '12.5%',
    churn: '2.1%'
  }

  return (
    <div className="flex flex-col h-full w-full gap-6 p-6 overflow-y-auto custom-scrollbar pt-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-2xl border-2 border-primary/20 p-1">
            <AvatarImage src={entity.logo} />
            <AvatarFallback>{entity.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{entity.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px] font-bold">
                {entity.sector}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl line-clamp-2">
              {entity.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-9">
            <Share2 className="size-4 mr-2" /> Share
          </Button>
          <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
            <Button variant="ghost" size="sm" className="rounded-lg h-7 px-3 text-xs">
              <FileText className="size-3.5 mr-2" /> PDF
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg h-7 px-3 text-xs">
              <Presentation className="size-3.5 mr-2" /> Slides
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Revenue" value={entity.revenue} trend="+12%" icon={Zap} />
        <KPICard title="Growth Rate" value={entity.growth} trend="+5.4%" icon={TrendingUp} />
        <KPICard title="Market Share" value={entity.marketShare} trend="+1.2%" icon={PieChartIcon} />
        <KPICard title="Churn Rate" value={entity.churn} trend="-0.4%" icon={Users} color="text-green-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Growth Chart */}
        <Card className="lg:col-span-2 border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Revenue Projection</CardTitle>
              <CardDescription>Monthly growth and revenue scaling</CardDescription>
            </div>
            <TrendingUp className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Share Pie */}
        <Card className="border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Market Distribution</CardTitle>
            <CardDescription>Relative market position</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={MARKET_SHARE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MARKET_SHARE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-2 px-4">
              {MARKET_SHARE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ title, value, trend, icon: Icon, color = "text-primary" }: any) {
  return (
    <Card className="border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Icon className={cn("size-5", color)} />
          </div>
          <Badge variant="outline" className="border-primary/10 text-primary rounded-lg text-[10px]">
            {trend}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
