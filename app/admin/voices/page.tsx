'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getPendingVoices, approveVoice, rejectVoice } from '@/lib/db'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

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

interface EditingState {
  voiceId: string | null
  title: string
  content: string
}

export default function VoiceModerationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingState>({
    voiceId: null,
    title: '',
    content: '',
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

      // Fetch all pending voices with user data
      const { data: voicesData, error } = await supabase
        .from('youth_voices')
        .select('*, users(full_name, email)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })

      if (voicesData) {
        setVoices(voicesData as Voice[])
      }

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  const handleApprove = async (voiceId: string) => {
    setActionLoading(voiceId)
    const success = await approveVoice(voiceId)

    if (success) {
      setVoices(voices.filter((v) => v.id !== voiceId))
    }

    setActionLoading(null)
  }

  const handleReject = async (voiceId: string) => {
    setActionLoading(voiceId)
    const success = await rejectVoice(voiceId)

    if (success) {
      setVoices(voices.filter((v) => v.id !== voiceId))
    }

    setActionLoading(null)
  }

  const startEditing = (voice: Voice) => {
    setEditing({
      voiceId: voice.id,
      title: voice.title,
      content: voice.content,
    })
  }

  const saveEdit = async () => {
    if (!editing.voiceId) return

    setActionLoading(editing.voiceId)
    try {
      const { error } = await supabase
        .from('youth_voices')
        .update({
          title: editing.title,
          content: editing.content,
        })
        .eq('id', editing.voiceId)

      if (!error) {
        setVoices(
          voices.map((v) =>
            v.id === editing.voiceId
              ? { ...v, title: editing.title, content: editing.content }
              : v
          )
        )
        setEditing({ voiceId: null, title: '', content: '' })
      }
    } catch (err) {
      console.error('[v0] Edit error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading pending voices...</div>
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

      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
                <span className="text-secondary">Voice Moderation</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Review and approve member voices {voices.length > 0 && `(${voices.length} pending)`}
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : voices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">No pending voices to review!</p>
                <p className="text-muted-foreground text-sm mt-2">All voices have been moderated.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {voices.map((voice) => (
                <Card key={voice.id} className="hover:border-primary/50 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">
                          {editing.voiceId === voice.id ? (
                            <input
                              type="text"
                              value={editing.title}
                              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                              className="w-full px-2 py-1 bg-input border border-border rounded text-foreground"
                            />
                          ) : (
                            voice.title
                          )}
                        </CardTitle>
                        <CardDescription>
                          Submitted by{' '}
                          <span className="font-semibold text-foreground">
                            {voice.users?.full_name || voice.is_anonymous ? 'Anonymous' : 'Unknown'}
                          </span>
                          {' • '}
                          {voice.state && <span>{voice.state}</span>}
                          {voice.district && <span>, {voice.district}</span>}
                          {' • '}
                          {new Date(voice.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                          PENDING
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-card/50 border border-border p-4 rounded">
                      {editing.voiceId === voice.id ? (
                        <textarea
                          value={editing.content}
                          onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                          className="w-full px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          rows={6}
                        />
                      ) : (
                        <p className="text-foreground/90">{voice.content}</p>
                      )}
                    </div>

                    {editing.voiceId === voice.id && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={saveEdit}
                          disabled={actionLoading === voice.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {actionLoading === voice.id ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          onClick={() => setEditing({ voiceId: null, title: '', content: '' })}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {editing.voiceId !== voice.id && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={() => handleApprove(voice.id)}
                          disabled={actionLoading === voice.id}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading === voice.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(voice.id)}
                          disabled={actionLoading === voice.id}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          {actionLoading === voice.id ? 'Processing...' : 'Reject'}
                        </Button>
                        <Button
                          onClick={() => startEditing(voice)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Review voices carefully. Approved voices will be visible to all members.
          </p>
        </div>
      </footer>
    </div>
  )
}
