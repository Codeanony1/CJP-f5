'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Volume2, Settings } from 'lucide-react'

interface Stats {
  totalUsers: number
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
    totalVoices: 0,
    pendingVoices: 0,
    approvedVoices: 0,
    totalAgendas: 0,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const isAdminUser = user.user_metadata?.is_admin === true

      if (!isAdminUser) {
        router.push('/')
        return
      }

      setUser(user)
      setIsAdmin(true)

      // Fetch stats
      const [usersData, voicesData, agendasData] = await Promise.all([
        supabase.from('users').select('id'),
        supabase.from('youth_voices').select('id, status'),
        supabase.from('agendas').select('id'),
      ])

      const voices = voicesData.data || []
      setStats({
        totalUsers: usersData.data?.length || 0,
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Redirecting...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-accent/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-accent">Admin Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">Manage the CJP platform and approve member content</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Voices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingVoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.approvedVoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Party Demands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalAgendas}</div>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Voice Moderation */}
            <Card className="hover:border-primary/50 transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <CardTitle>Voice Moderation</CardTitle>
                      <CardDescription>Review and approve member voices</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">
                  {stats.pendingVoices} voice{stats.pendingVoices !== 1 ? 's' : ''} awaiting review
                </p>
                <Link href="/admin/voices">
                  <Button className="w-full">Review Voices</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Agenda Management */}
            <Card className="hover:border-primary/50 transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <CardTitle>Party Demands</CardTitle>
                      <CardDescription>Manage party agendas and demands</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">
                  {stats.totalAgendas} demand{stats.totalAgendas !== 1 ? 's' : ''} published
                </p>
                <Link href="/admin/agendas">
                  <Button className="w-full">Manage Demands</Button>
                </Link>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="hover:border-primary/50 transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-accent mt-1" />
                    <div>
                      <CardTitle>Member Management</CardTitle>
                      <CardDescription>Manage user memberships</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">
                  {stats.totalUsers} member{stats.totalUsers !== 1 ? 's' : ''} registered
                </p>
                <Link href="/admin/users">
                  <Button className="w-full">Manage Members</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="hover:border-primary/50 transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-6 h-6 text-muted-foreground mt-1" />
                    <div>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>Platform configuration</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">Manage platform settings and policies</p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Admin tools to manage the CJP platform. Use responsibly to maintain community standards.
          </p>
        </div>
      </footer>
    </div>
  )
}
