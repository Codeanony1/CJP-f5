'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Volume2, Settings } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalVerifiedUsers: number
  totalPendingUsers: number
  totalVoices: number
  pendingVoices: number
  approvedVoices: number
  totalAgendas: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVerifiedUsers: 0,
    totalPendingUsers: 0,
    totalVoices: 0,
    pendingVoices: 0,
    approvedVoices: 0,
    totalAgendas: 0,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      if (!supabase) {
        router.push('/auth/login')
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single()

      if (adminError || !adminUser) {
        router.push('/')
        return
      }

      setUser(user)
      setIsAdmin(true)

      // Fetch stats
      const [usersData, voicesData, agendasData] = await Promise.all([
        supabase.from('users').select('id, membership_status'),
        supabase.from('youth_voices').select('id, status'),
        supabase.from('agendas').select('id'),
      ])

      const users = usersData.data || []
      const voices = voicesData.data || []
      
      setStats({
        totalUsers: users.length,
        totalVerifiedUsers: users.filter((u: any) => u.membership_status === 'VERIFIED').length,
        totalPendingUsers: users.filter((u: any) => u.membership_status === 'PENDING').length,
        totalVoices: voices.length,
        pendingVoices: voices.filter((v: any) => v.status === 'PENDING').length,
        approvedVoices: voices.filter((v: any) => v.status === 'APPROVED').length,
        totalAgendas: agendasData.data?.length || 0,
      })

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading admin dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Redirecting...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of CJP platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalVerifiedUsers} verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.totalPendingUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">members awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Youth Voices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalVoices}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pendingVoices} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Party Demands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAgendas}</div>
              <p className="text-xs text-muted-foreground mt-1">agendas published</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Management */}
          <Card className="hover:border-primary/50 transition">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <CardTitle>Member Management</CardTitle>
                  <CardDescription>Approve and manage memberships</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90">
                {stats.totalPendingUsers} pending verification · {stats.totalVerifiedUsers} verified
              </p>
              <Link href="/admin/users" className="block">
                <Button className="w-full">Manage Members</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Voice Moderation */}
          <Card className="hover:border-primary/50 transition">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Volume2 className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <CardTitle>Voice Moderation</CardTitle>
                  <CardDescription>Review youth voices and stories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90">
                {stats.pendingVoices} pending · {stats.approvedVoices} approved
              </p>
              <Link href="/admin/voices" className="block">
                <Button className="w-full">Review Voices</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Agenda Management */}
          <Card className="hover:border-primary/50 transition">
            <CardHeader>
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <CardTitle>Party Demands</CardTitle>
                  <CardDescription>Manage party agendas and demands</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90">
                {stats.totalAgendas} total demands
              </p>
              <Link href="/admin/agendas" className="block">
                <Button className="w-full">Manage Demands</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:border-primary/50 transition">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Settings className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Platform configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90">
                Manage platform settings and policies
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

