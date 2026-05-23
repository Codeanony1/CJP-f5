'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name: string | null
  membership_status: string | null
  membership_date: string | null
}

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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

      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*').order('membership_date', {
        ascending: false,
      })

      if (usersData) {
        setUsers(usersData as User[])
      }

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ membership_status: 'APPROVED' })
      .eq('id', userId)

    if (!error) {
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, membership_status: 'APPROVED' } : u
        )
      )
    }
  }

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ membership_status: 'REJECTED' })
      .eq('id', userId)

    if (!error) {
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, membership_status: 'REJECTED' } : u
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading members...</div>
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

  const pendingUsers = users.filter((u) => u.membership_status === 'PENDING')
  const approvedUsers = users.filter((u) => u.membership_status === 'APPROVED')
  const rejectedUsers = users.filter((u) => u.membership_status === 'REJECTED')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-accent/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
                <span className="text-accent">Member Management</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage CJP memberships ({users.length} total members)
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Pending Members */}
          {pendingUsers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                Pending Approval ({pendingUsers.length})
              </h2>
              <div className="grid gap-4">
                {pendingUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {user.full_name || 'Unknown'}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied{' '}
                            {user.membership_date
                              ? new Date(user.membership_date).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(user.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(user.id)}
                            size="sm"
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Approved Members */}
          {approvedUsers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">
                Approved Members ({approvedUsers.length})
              </h2>
              <div className="grid gap-4">
                {approvedUsers.map((user) => (
                  <Card key={user.id} className="border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {user.full_name || 'Unknown'}
                          </h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500/20 text-green-400">
                          APPROVED
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Members */}
          {rejectedUsers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">
                Rejected Members ({rejectedUsers.length})
              </h2>
              <div className="grid gap-4">
                {rejectedUsers.map((user) => (
                  <Card key={user.id} className="border-red-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {user.full_name || 'Unknown'}
                          </h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-red-500/20 text-red-400">
                          REJECTED
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {users.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">No members yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Approve or reject membership requests. Approved members can fully participate in the CJP community.
          </p>
        </div>
      </footer>
    </div>
  )
}
