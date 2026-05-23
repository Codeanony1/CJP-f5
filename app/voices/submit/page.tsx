'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
]

const OCCUPATIONS = [
  'Student', 'Employed', 'Self-Employed', 'Farmer', 'Business Owner',
  'Homemaker', 'Retired', 'Looking for Work', 'Other'
]

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
    full_name: '',
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
            full_name: profile.full_name || '',
            occupation: profile.occupation || '',
            state: profile.state || '',
            district: profile.district || '',
            age: profile.age?.toString() || '',
          }))
        } else {
          // Use auth metadata if no profile exists
          const metadata = user.user_metadata
          setFormData((prev) => ({
            ...prev,
            full_name: metadata?.full_name || '',
          }))
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const ensureUserProfile = async () => {
    // Check if user profile exists, if not create it
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: formData.full_name || user.user_metadata?.full_name || '',
          occupation: formData.occupation || '',
          state: formData.state || '',
          district: formData.district || '',
          age: formData.age ? parseInt(formData.age) : null,
          membership_status: 'PENDING',
        }])

      if (insertError) {
        console.error('[v0] Error creating user profile:', insertError)
        return false
      }
      console.log('[v0] User profile created successfully')
    }
    return true
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

    if (!formData.full_name.trim()) {
      setError('Your name is required')
      return
    }

    if (!formData.occupation) {
      setError('Please select your occupation')
      return
    }

    if (!formData.state) {
      setError('Please select your state')
      return
    }

    if (!formData.district.trim()) {
      setError('Please enter your district')
      return
    }

    setSubmitting(true)

    try {
      // Ensure user profile exists before submitting voice
      const profileCreated = await ensureUserProfile()
      if (!profileCreated) {
        setError('Failed to create user profile. Please try again.')
        setSubmitting(false)
        return
      }

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
                {/* User Information Section */}
                <div className="bg-secondary/10 border border-secondary/30 p-4 rounded-md">
                  <h3 className="text-sm font-semibold mb-3">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        type="text"
                        name="full_name"
                        placeholder="Your full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Occupation *</label>
                      <select
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="">Select occupation</option>
                        {OCCUPATIONS.map((occ) => (
                          <option key={occ} value={occ}>{occ}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Age</label>
                      <Input
                        type="number"
                        name="age"
                        placeholder="Your age"
                        value={formData.age}
                        onChange={handleChange}
                        min="13"
                        max="120"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">District *</label>
                      <Input
                        type="text"
                        name="district"
                        placeholder="Your district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
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
                  <label className="text-sm font-medium">Your Voice *</label>
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

                {error && <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 p-3 rounded">{error}</div>}

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
