'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  state: string | null
  occupation: string | null
  membership_status: string | null
  membership_date: string | null
}

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('membership_date', { ascending: false })

      if (usersData) {
        setUsers(usersData as User[])
        setFilteredUsers(usersData as User[])
      }

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  // Filter users based on search and status
  useEffect(() => {
    let filtered = users

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.membership_status === statusFilter)
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.state?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [search, statusFilter, users])

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from('users').update({ membership_status: newStatus }).eq('id', userId)

    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, membership_status: newStatus } : u)))
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge className="bg-green-500/20 text-green-600 flex items-center gap-1">
            <CheckCircle size={14} />
            Verified
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 flex items-center gap-1">
            <CheckCircle size={14} />
            Approved
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 flex items-center gap-1">
            <Clock size={14} />
            Pending
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/20 text-red-600 flex items-center gap-1">
            <XCircle size={14} />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const pendingCount = users.filter((u) => u.membership_status === 'PENDING').length
  const verifiedCount = users.filter((u) => u.membership_status === 'VERIFIED').length
  const approvedCount = users.filter((u) => u.membership_status === 'APPROVED').length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading members...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Member Management</h1>
          <p className="text-muted-foreground mt-2">Manage and approve memberships</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{verifiedCount + approvedCount}</div>
              <p className="text-sm text-muted-foreground">Verified/Approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PENDING')}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'VERIFIED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('VERIFIED')}
              size="sm"
            >
              Verified
            </Button>
          </div>
        </div>

        {/* Members Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold hidden md:table-cell">State</th>
                  <th className="px-6 py-3 text-left font-semibold hidden lg:table-cell">Occupation</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition">
                      <td className="px-6 py-4 font-medium">{user.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                        {user.state || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                        {user.occupation || 'N/A'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.membership_status)}</td>
                      <td className="px-6 py-4">
                        {user.membership_status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateStatus(user.id, 'VERIFIED')}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {user.membership_status !== 'PENDING' && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

