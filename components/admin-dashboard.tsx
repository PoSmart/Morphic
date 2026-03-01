'use client'

import React, { useState } from 'react'

import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle2,
  CreditCard,
  Database, 
  FileUp,
  Search,
  Settings, 
  ShieldCheck,
  TrendingUp, 
  Users, 
  Workflow,
  XCircle} from 'lucide-react'
import { 
Area,
AreaChart, Bar,   BarChart, CartesianGrid, Line,   LineChart, ResponsiveContainer,
Tooltip, XAxis, YAxis} from 'recharts'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const REVENUE_DATA = [
  { date: '2024-02-22', amount: 1240 },
  { date: '2024-02-23', amount: 1580 },
  { date: '2024-02-24', amount: 1100 },
  { date: '2024-02-25', amount: 1890 },
  { date: '2024-02-26', amount: 2300 },
  { date: '2024-02-27', amount: 2100 },
  { date: '2024-02-28', amount: 2850 },
]

const USER_GROWTH = [
  { name: 'Starter', value: 450, color: 'hsl(var(--primary))' },
  { name: 'Pro', value: 180, color: 'hsl(var(--secondary))' },
  { name: 'Enterprise', value: 45, color: 'hsl(var(--accent))' },
]

export function AdminDashboard() {
  return (
    <div className="flex flex-col h-full w-full gap-8 p-6 pt-20 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="size-8 text-primary" />
            Admin Console
          </h1>
          <p className="text-muted-foreground">Morphic SaaS Global Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-10">
            <Settings className="size-4 mr-2" /> Global Config
          </Button>
          <Button className="rounded-xl h-10 shadow-lg shadow-primary/20">
            <Workflow className="size-4 mr-2" /> Morphic Builder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-muted/30 p-1 rounded-2xl border border-border/50 h-12 w-fit">
          <TabsTrigger value="analytics" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="size-4 mr-2" /> Stripe Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="size-4 mr-2" /> User Management
          </TabsTrigger>
          <TabsTrigger value="kb" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Database className="size-4 mr-2" /> Knowledge Base (RAG)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="MRR" value="€24,850" trend="+18.2%" icon={CreditCard} />
            <StatCard title="Active Subs" value="675" trend="+42" icon={Users} />
            <StatCard title="Usage Vol" value="1.2M req" trend="+12%" icon={TrendingUp} />
            <StatCard title="System Load" value="22%" trend="Stable" icon={AlertCircle} color="text-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Daily Revenue (EUR)</CardTitle>
                <CardDescription>Consolidated payments across all plans (IVA 22% included)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#adminRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Subscription Mix</CardTitle>
                <CardDescription>User distribution by plan</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col items-center pt-8">
                <div className="w-full space-y-4">
                  {USER_GROWTH.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                      <Progress value={(item.value / 675) * 100} className="h-2 bg-muted" style={{ "--progress-foreground": item.color } as any} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in">
           <Card className="border-border/50 rounded-3xl overflow-hidden shadow-none bg-card/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Manage Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search users/emails..." className="pl-10 h-9 rounded-xl bg-muted/30 border-border/50" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {[
                  { id: '1', name: 'Mario Rossi', email: 'mario@rossi.it', plan: 'Enterprise', status: 'active', usage: '82%' },
                  { id: '2', name: 'John Doe', email: 'john@doe.com', plan: 'Pro', status: 'active', usage: '45%' },
                  { id: '3', name: 'Alice Smith', email: 'alice@web.com', plan: 'Starter', status: 'past_due', usage: '12%' },
                ].map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-10 rounded-xl border border-border/30">
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-right pr-4">
                       <Badge variant="secondary" className={cn(
                        "text-[9px] font-bold px-2 rounded-md uppercase",
                        u.plan === 'Enterprise' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>{u.plan}</Badge>
                      <div className="w-16">
                        <p className="text-[9px] uppercase text-muted-foreground font-semibold">Usage</p>
                        <p className="text-xs font-medium">{u.usage}</p>
                      </div>
                      {u.status === 'active' ? <CheckCircle2 className="size-4 text-green-500" /> : <XCircle className="size-4 text-destructive" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kb" className="animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border/50 rounded-3xl shadow-none bg-card/50">
               <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Global Knowledge Base</CardTitle>
                <CardDescription>Managed documents for RAG indexing</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {[
                    { name: 'Market_Report_2024.pdf', size: '2.4MB', indexed: true, date: '2h ago' },
                    { name: 'Competitor_Analysis_Q4.docx', size: '1.1MB', indexed: true, date: '1d ago' },
                    { name: 'Internal_Wiki_Dump.json', size: '15.8MB', indexed: false, date: 'Just now' },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-muted/50 flex items-center justify-center">
                          <Database className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] rounded-md px-1.5",
                          doc.indexed ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20"
                        )}>
                          {doc.indexed ? 'INDEXED' : 'PROCESSING'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="size-8 rounded-full">
                          <AlertCircle className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 rounded-3xl shadow-none border-dashed flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                <FileUp className="size-8 text-primary" />
              </div>
              <div>
                <CardTitle>Ingest Data</CardTitle>
                <CardDescription className="max-w-[180px] mx-auto">Upload PDF, DOCX or JSON to index in the global RAG vector store.</CardDescription>
              </div>
              <Button className="rounded-2xl w-full h-11 shadow-lg shadow-primary/10">Select Files</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, trend, icon: Icon, color = "text-primary" }: any) {
  return (
    <Card className="border-border/50 rounded-3xl shadow-none bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
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

function Progress({ value, className, style }: any) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div 
        className="h-full w-full flex-1 transition-all" 
        style={{ ...style, transform: `translateX(-${100 - (value || 0)}%)`, backgroundColor: (style as any)?.["--progress-foreground"] || "hsl(var(--primary))" }} 
      />
    </div>
  )
}
