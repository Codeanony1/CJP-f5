'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSetupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('admin@admin.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!supabase) {
        setMessage({ type: 'error', text: 'Supabase client not available' })
        setLoading(false)
        return
      }

      // Step 1: Sign up the new admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setMessage({ type: 'error', text: `Auth error: ${authError.message}` })
        setLoading(false)
        return
      }

      if (!authData.user) {
        setMessage({ type: 'error', text: 'Failed to create user' })
        setLoading(false)
        return
      }

      // Step 2: Add to admin_users table
      const { error: adminError } = await supabase.from('admin_users').insert({
        id: authData.user.id,
        email,
      })

      if (adminError) {
        setMessage({ type: 'error', text: `Admin table error: ${adminError.message}` })
        setLoading(false)
        return
      }

      // Step 3: Set is_admin flag on users table
      const { error: userError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', authData.user.id)

      if (userError) {
        console.log('[v0] User table update skipped (may not exist yet):', userError)
      }

      setMessage({
        type: 'success',
        text: `Admin user created successfully! Email: ${email}. Please check your email for verification link.`,
      })

      setEmail('')
      setPassword('')
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                    : 'bg-red-500/10 text-red-600 border border-red-500/30'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Admin User'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This will create a new admin account with the provided credentials.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
