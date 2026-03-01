'use client'

import React, { useState } from 'react'

import { 
  CheckCircle2,
  Clock,
  ExternalLink,
  Key, 
  Mail, 
  MessageSquare,
  MoreHorizontal, 
  Plus, 
  Shield, 
  Trash2,  Users, 
  Zap} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  apiQuota: number
  usage: number
  avatar: string
  status: 'active' | 'pending'
}

const DUMMY_TEAM: TeamMember[] = [
  {
    id: 'u1',
    name: 'Marco Rossi',
    email: 'marco@example.com',
    role: 'owner',
    apiQuota: 500,
    usage: 342,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Elena Bianchi',
    email: 'elena@example.com',
    role: 'admin',
    apiQuota: 200,
    usage: 125,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Luca Moretti',
    email: 'luca@example.com',
    role: 'member',
    apiQuota: 100,
    usage: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luca',
    status: 'pending'
  }
]

export function TeamDashboard() {
  const [members, setMembers] = useState(DUMMY_TEAM)
  const [inviteEmail, setInviteEmail] = useState('')

  const totalQuota = members.reduce((acc, m) => acc + m.apiQuota, 0)
  const totalUsage = members.reduce((acc, m) => acc + m.usage, 0)
  const usagePercent = (totalUsage / totalQuota) * 100

  return (
    <div className="flex flex-col h-full w-full gap-8 p-6 pt-20 overflow-y-auto custom-scrollbar">
      {/* Header: Team Info & Usage Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TechFlow Research Team</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] rounded-md px-1.5 py-0">PRO PLAN</Badge>
              3/20 Members used
            </p>
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-2 p-4 bg-card/50 border border-border/50 rounded-2xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium uppercase tracking-wider">TEAM API QUOTA</span>
            <span className="font-bold">{totalUsage} / {totalQuota}</span>
          </div>
          <Progress value={usagePercent} className="h-1.5 bg-muted" />
          <p className="text-[10px] text-muted-foreground text-right italic">Resetting in 12 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col: Member Management */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border/50 rounded-3xl overflow-hidden shadow-none bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Team Members</CardTitle>
                  <CardDescription>Manage your team and assign quotas</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Email address..." 
                    className="h-9 w-48 rounded-xl bg-muted/30 border-border/50"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button size="sm" className="rounded-xl h-9">
                    <Plus className="size-4 mr-2" /> Invite
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 group hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-10 rounded-xl border border-border/30">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{member.name}</p>
                          {member.status === 'pending' && (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[9px] rounded-md px-1.5 py-0 uppercase">Pending</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right pr-4">
                      <div className="hidden md:block w-24">
                        <p className="text-[9px] uppercase text-muted-foreground font-semibold">Usage</p>
                        <p className="text-xs font-medium">{member.usage} requests</p>
                      </div>
                      <div className="hidden md:block w-20">
                        <p className="text-[9px] uppercase text-muted-foreground font-semibold">Role</p>
                        <Badge variant="secondary" className="capitalize text-[10px] p-0 font-medium bg-transparent">{member.role}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-full">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="rounded-lg"><Key className="size-3.5 mr-2" /> Assign Quota</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg"><Shield className="size-3.5 mr-2" /> Change Role</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg text-destructive"><Trash2 className="size-3.5 mr-2" /> Remove Member</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Team Chat Placeholder & API Keys */}
        <div className="space-y-6">
          <Card className="border-border/50 rounded-3xl overflow-hidden shadow-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                Team Activity
              </CardTitle>
              <CardDescription>Collaborative thread</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 text-xs">
                  <Avatar className="size-6 rounded-md">
                    <AvatarImage src={DUMMY_TEAM[1].avatar} />
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-bold">Elena <span className="text-[10px] font-normal text-muted-foreground ml-2">2h ago</span></p>
                    <p className="text-muted-foreground p-2 bg-muted/50 rounded-xl rounded-tl-none border border-border/30">
                      Added &quot;CloudScale&quot; to Top Tech Italia list. Analyzing competitors now.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs justify-end text-right">
                  <div className="space-y-1">
                    <p className="font-bold"><span className="text-[10px] font-normal text-muted-foreground mr-2">1h ago</span> Marco</p>
                    <p className="text-primary-foreground p-2 bg-primary rounded-xl rounded-tr-none">
                      Great! Let&apos;s check the churn rate for TechFlow too.
                    </p>
                  </div>
                  <Avatar className="size-6 rounded-md">
                    <AvatarImage src={DUMMY_TEAM[0].avatar} />
                  </Avatar>
                </div>
              </div>
              <div className="mt-6 relative">
                <Input placeholder="Reply to team..." className="pr-12 rounded-2xl h-10 bg-muted/30" />
                <Button size="icon" className="absolute right-1.5 top-1.5 size-7 rounded-xl">
                  <Zap className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 rounded-3xl overflow-hidden shadow-none bg-card/50 backdrop-blur-sm border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Manage API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-2xl mb-4">
                <code className="text-[10px] font-mono text-muted-foreground truncate">sk_morphic_live_********************</code>
                <Button variant="ghost" size="icon" className="size-7">
                  <ExternalLink className="size-3" />
                </Button>
              </div>
              <Button variant="outline" className="w-full rounded-2xl border-border/50 h-10 text-xs">
                Generate New Team Key
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
