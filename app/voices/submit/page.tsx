'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { submitVoice } from '@/lib/db'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubmitVoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false,
    occupation: '',
    state: '',
    district: '',
    age: '',
  })

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        // Fetch user profile data
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserData(profile)
          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            occupation: profile.occupation || '',
            state: profile.state || '',
            district: profile.district || '',
            age: profile.age?.toString() || '',
          }))
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.content.trim()) {
      setError('Your voice content is required')
      return
    }

    setSubmitting(true)

    try {
      const voiceData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        is_anonymous: formData.isAnonymous,
        occupation: formData.occupation || '',
        state: formData.state || '',
        district: formData.district || '',
        age: formData.age ? parseInt(formData.age) : null,
        status: 'PENDING',
      }

      console.log('[v0] Submitting voice:', voiceData)

      const { data, error: insertError } = await supabase
        .from('youth_voices')
        .insert([voiceData])
        .select()

      if (insertError) {
        console.error('[v0] Voice submission error:', insertError)
        setError(`Failed to submit your voice: ${insertError.message}`)
      } else if (!data || data.length === 0) {
        console.error('[v0] No data returned from insert')
        setError('Failed to submit your voice. Please try again.')
      } else {
        console.log('[v0] Voice submitted successfully:', data)
        router.push(`/voices?submitted=true`)
      }
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/10 to-transparent">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-secondary">Share Your Voice</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us your demands, ideas, and vision for a better future.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Voice</CardTitle>
              <CardDescription>
                Your submission will be reviewed and approved before appearing on our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Demographic Context Section */}
                <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-md">
                  <h3 className="text-sm font-semibold mb-3">Voice Context (From Your Profile)</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Occupation</p>
                      <p className="text-sm font-medium">{formData.occupation || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="text-sm font-medium">{formData.age || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">State</p>
                      <p className="text-sm font-medium">{formData.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="text-sm font-medium">{formData.district || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="What is your main demand or idea?"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground">A clear, concise title for your voice</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Voice</label>
                  <textarea
                    name="content"
                    placeholder="Share your demands, ideas, or vision in detail..."
                    value={formData.content}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    rows={10}
                    className="w-full px-4 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.content.length}/5000 characters
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-4 h-4"
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (your name won&apos;t be displayed publicly)
                  </label>
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Submitting...' : 'Submit Your Voice'}
                  </Button>
                  <Link href="/voices" className="flex-1">
                    <Button variant="outline" type="button" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
