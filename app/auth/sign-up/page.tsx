'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const INDIAN_STATES = [
  // States
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
]

const OCCUPATIONS = [
  'Student', 'Employed', 'Self-Employed', 'Farmer', 'Business Owner',
  'Homemaker', 'Retired', 'Looking for Work', 'Other'
]

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    occupation: '',
    state: '',
    district: '',
    phoneNumber: '',
    age: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.fullName || !formData.occupation || !formData.state || !formData.district) {
      setError('Please fill all required fields')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        setError('An account with this email already exists. Please log in instead.')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Disable email verification - auto confirm
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            occupation: formData.occupation,
            state: formData.state,
            district: formData.district,
            phone_number: formData.phoneNumber || null,
            age: formData.age ? parseInt(formData.age) : null,
          },
        },
      })

      if (signUpError) {
        // Handle specific Supabase auth errors
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please log in instead.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }
      
      if (data.user) {
        // Create or update user profile with demographic data using upsert
        console.log('[v0] Creating/updating user profile for:', data.user.id)
        
        const { error: profileError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          occupation: formData.occupation,
          state: formData.state,
          district: formData.district,
          phone_number: formData.phoneNumber || null,
          age: formData.age ? parseInt(formData.age) : null,
          membership_status: 'PENDING',
        }, { onConflict: 'id' })

        if (profileError) {
          console.error('[v0] Profile creation error:', profileError)
          // Don't block registration if profile fails - trigger should have created it
        } else {
          console.log('[v0] Profile created/updated successfully')
        }
        
        // Show success message and redirect to profile
        setSuccess('Registration successful! Welcome to the movement.')
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      }
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Join the CJP Movement</CardTitle>
          <CardDescription>Create your account to share your voice and shape our demands</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation *</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">District *</label>
                <Input
                  type="text"
                  name="district"
                  placeholder="Your district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="(Optional)"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {success && <div className="text-sm text-green-600 bg-green-500/10 border border-green-500/30 p-3 rounded">{success}</div>}
            {error && <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 p-3 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
            <p>
              Are you an admin?{' '}
              <Link href="/admin/login" className="text-primary hover:underline">
                Admin login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
