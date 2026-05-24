'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { getAgendas, createAgenda, updateAgenda, deleteAgenda, toggleAgendaStatus } from '@/lib/db'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

interface Agenda {
  id: string
  title: string
  description: string
  category: string
  priority: number
  created_at: string
  is_active?: boolean
}

const CATEGORIES = [
  'Core Political & Constitutional Reforms',
  'Electoral & Funding Reforms',
  'Anti-Corruption & Institutional Reforms',
  'Judicial & Law Enforcement Reforms',
  'Economic & Financial Reforms',
  'Healthcare & Social Security',
  'Education & Skill Development',
  'Environment & Climate',
  'Infrastructure & Technology',
  'Other',
]

export default function AgendasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Core Political & Constitutional Reforms',
    priority: 100,
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
    setMessage(null)

    if (editingId) {
      // Update existing agenda
      const result = await updateAgenda(
        editingId,
        formData.title,
        formData.description,
        formData.category,
        formData.priority
      )

      if (result.error) {
        setMessage({ type: 'error', text: `Failed to update: ${result.error}` })
        console.error('[v0] Update error:', result.error)
      } else {
        setMessage({ type: 'success', text: 'Demand updated successfully!' })
        setAgendas(agendas.map((a) => (a.id === editingId ? { ...a, ...formData } : a)))
        resetForm()
      }
    } else {
      // Create new agenda
      const result = await createAgenda(
        formData.title,
        formData.description,
        formData.category,
        formData.priority
      )

      if (result.error) {
        setMessage({ type: 'error', text: `Failed to create: ${result.error}` })
        console.error('[v0] Create error:', result.error)
      } else if (result.data) {
        setMessage({ type: 'success', text: 'Demand created successfully!' })
        setAgendas([...agendas, result.data as Agenda])
        resetForm()
      }
    }

    setSubmitting(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Core Political & Constitutional Reforms',
      priority: 100,
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (agenda: Agenda) => {
    setFormData({
      title: agenda.title,
      description: agenda.description,
      category: agenda.category,
      priority: agenda.priority,
    })
    setEditingId(agenda.id)
    setShowForm(true)
  }

  const handleDelete = async (agendaId: string) => {
    if (!confirm('Are you sure you want to delete this demand?')) return

    setActionLoading(agendaId)
    const result = await deleteAgenda(agendaId)

    if (result.error) {
      setMessage({ type: 'error', text: `Failed to delete: ${result.error}` })
    } else {
      setMessage({ type: 'success', text: 'Demand deleted successfully!' })
      setAgendas(agendas.filter((a) => a.id !== agendaId))
    }
    setActionLoading(null)
  }

  const handleToggleStatus = async (agenda: Agenda) => {
    setActionLoading(agenda.id)
    const result = await toggleAgendaStatus(agenda.id, !(agenda.is_active ?? true))

    if (result.error) {
      setMessage({ type: 'error', text: `Failed to update status: ${result.error}` })
    } else {
      setMessage({ type: 'success', text: `Demand ${result.data?.is_active ? 'activated' : 'deactivated'}!` })
      setAgendas(
        agendas.map((a) => (a.id === agenda.id ? { ...a, is_active: !(agenda.is_active ?? true) } : a))
      )
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading agendas...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Party Demands</h1>
            <p className="text-muted-foreground mt-2">Manage party platform and agendas</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <Plus size={18} />
            Add Demand
          </Button>
        </div>

        {/* Add New Agenda Form */}
        {showForm && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Party Demand' : 'Add New Party Demand'}</CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-600'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600'
                  }`}
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="e.g., Comprehensive Political System Reform"
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

                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Processing...' : editingId ? 'Update Demand' : 'Create Demand'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{agendas.length}</div>
              <p className="text-sm text-muted-foreground">Total Demands</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg text-muted-foreground">Last updated</div>
              <p className="text-sm text-muted-foreground">
                {agendas.length > 0
                  ? new Date(agendas[0].created_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agendas List */}
        {agendas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText size={32} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No demands created yet</p>
              <p className="text-muted-foreground text-sm mt-2">Add your first party demand above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-600'
                    : 'bg-red-500/10 border border-red-500/30 text-red-600'
                }`}
              >
                {message.text}
              </div>
            )}
            {agendas
              .sort((a, b) => b.priority - a.priority)
              .map((agenda, index) => (
                <Card key={agenda.id} className={`hover:border-primary/50 transition ${!agenda.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 text-3xl font-bold text-muted-foreground/30 min-w-fit">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 break-words">{agenda.title}</h3>
                        <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{agenda.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary">{agenda.category}</span>
                          <span>Priority: {agenda.priority}</span>
                          <span>•</span>
                          <span>{new Date(agenda.created_at).toLocaleDateString()}</span>
                          {!agenda.is_active && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-1 rounded bg-red-500/10 text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(agenda)}
                          disabled={actionLoading === agenda.id}
                          className="flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={agenda.is_active ?? true ? 'outline' : 'default'}
                          onClick={() => handleToggleStatus(agenda)}
                          disabled={actionLoading === agenda.id}
                          className="flex items-center gap-2"
                        >
                          {(agenda.is_active ?? true) ? <EyeOff size={16} /> : <Eye size={16} />}
                          {(agenda.is_active ?? true) ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(agenda.id)}
                          disabled={actionLoading === agenda.id}
                          className="flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
