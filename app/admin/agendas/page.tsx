'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { getAgendas, createAgenda } from '@/lib/db'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Agenda {
  id: string
  title: string
  description: string
  category: string
  priority: number
  created_at: string
}

const CATEGORIES = [
  'Economy',
  'Healthcare',
  'Education',
  'Environment',
  'Infrastructure',
  'Agriculture',
  'Technology',
  'Justice',
  'Social',
  'Culture',
]

export default function AgendasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Economy',
    priority: 100,
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

      // Fetch agendas
      const agendasData = await getAgendas()
      setAgendas(agendasData as Agenda[])

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const result = await createAgenda(
      formData.title,
      formData.description,
      formData.category,
      formData.priority
    )

    if (result) {
      setAgendas([...agendas, result as Agenda])
      setFormData({
        title: '',
        description: '',
        category: 'Economy',
        priority: 100,
      })
      setShowForm(false)
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading agendas...</div>
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

      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
                <span className="text-primary">Party Demands</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage party agendas and demands ({agendas.length} total)
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
          {/* Add New Agenda Form */}
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="mb-8">
              <Plus className="w-4 h-4 mr-2" />
              Add New Demand
            </Button>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Party Demand</CardTitle>
                <CardDescription>Create a new agenda item for the party platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      type="text"
                      name="title"
                      placeholder="e.g., Universal Healthcare for All"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      placeholder="Detailed description of this demand..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      rows={4}
                      className="w-full px-4 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full px-4 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority (1-1000)</label>
                      <Input
                        type="number"
                        name="priority"
                        min="1"
                        max="1000"
                        value={formData.priority}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Demand'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Agendas List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : agendas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">No demands created yet.</p>
                <p className="text-muted-foreground text-sm mt-2">Add your first party demand above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {agendas.map((agenda) => (
                <Card key={agenda.id} className="hover:border-primary/50 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{agenda.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                            {agenda.category}
                          </span>
                          {' • '}
                          <span className="text-muted-foreground">Priority: {agenda.priority}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 line-clamp-3 mb-4">{agenda.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(agenda.created_at).toLocaleDateString()}
                    </p>
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
            Manage party platform demands. These will appear on the Demands page for all members.
          </p>
        </div>
      </footer>
    </div>
  )
}
