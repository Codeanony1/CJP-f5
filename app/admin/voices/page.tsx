'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { approveVoice, rejectVoice } from '@/lib/db'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Voice {
  id: string
  title: string
  content: string
  user_id: string
  status: string
  occupation?: string
  state?: string
  district?: string
  age?: number
  is_anonymous?: boolean
  created_at: string
  users?: {
    full_name: string
    email: string
  }
}

export default function VoiceModerationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [voices, setVoices] = useState<Voice[]>([])
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')

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

      // Fetch voices
      const { data: voicesData } = await supabase
        .from('youth_voices')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false })

      if (voicesData) {
        setVoices(voicesData as Voice[])
        setFilteredVoices(voicesData as Voice[])
      }

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  // Filter voices based on search and status
  useEffect(() => {
    let filtered = voices

    if (statusFilter !== 'all') {
      filtered = filtered.filter((v) => v.status === statusFilter)
    }

    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.content.toLowerCase().includes(search.toLowerCase()) ||
          v.users?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredVoices(filtered)
  }, [search, statusFilter, voices])

  const handleApprove = async (voiceId: string) => {
    setActionLoading(voiceId)
    const success = await approveVoice(voiceId)

    if (success) {
      setVoices(voices.map((v) => (v.id === voiceId ? { ...v, status: 'APPROVED' } : v)))
    }

    setActionLoading(null)
  }

  const handleReject = async (voiceId: string) => {
    setActionLoading(voiceId)
    const success = await rejectVoice(voiceId)

    if (success) {
      setVoices(voices.map((v) => (v.id === voiceId ? { ...v, status: 'REJECTED' } : v)))
    }

    setActionLoading(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500/20 text-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-600">Rejected</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>
    }
  }

  const pendingCount = voices.filter((v) => v.status === 'PENDING').length
  const approvedCount = voices.filter((v) => v.status === 'APPROVED').length
  const rejectedCount = voices.filter((v) => v.status === 'REJECTED').length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading voices...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Youth Voices</h1>
          <p className="text-muted-foreground mt-2">Review and approve member voices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
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
              variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('APPROVED')}
              size="sm"
            >
              Approved
            </Button>
          </div>
        </div>

        {/* Voices List */}
        {filteredVoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare size={32} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No voices to review</p>
              <p className="text-muted-foreground text-sm mt-2">Check back later for new submissions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVoices.map((voice) => (
              <Card key={voice.id} className="hover:border-primary/50 transition">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 break-words">{voice.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">
                          {voice.users?.full_name || (voice.is_anonymous ? 'Anonymous' : 'Unknown')}
                        </span>
                        {voice.state && <span>•</span>}
                        {voice.state && <span>{voice.state}</span>}
                        {voice.district && <span>, {voice.district}</span>}
                        <span>•</span>
                        <span>{new Date(voice.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(voice.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 border border-border p-4 rounded text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto">
                    {voice.content}
                  </div>

                  {voice.status === 'PENDING' && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleApprove(voice.id)}
                        disabled={actionLoading === voice.id}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={16} />
                        {actionLoading === voice.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReject(voice.id)}
                        disabled={actionLoading === voice.id}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        {actionLoading === voice.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

