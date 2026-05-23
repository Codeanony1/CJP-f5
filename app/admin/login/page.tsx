'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Login via Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if user exists in admin_users table
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', data.user.email)
          .single()

        if (adminError || !adminUser) {
          setError('This account does not have admin privileges. Please use an admin account.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        // Admin exists in admin_users table, proceed to admin dashboard
        console.log('[v0] Admin login successful for:', data.user.email)
        router.push('/admin')
      } else {
        console.error('[v0] No user data returned from login')
        setError('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Access the CJP administration panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@cjp.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs">
              <strong>Demo Credentials:</strong> Email: admin@cjp.in | Password: AdminCJP@2026
            </div>

            {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <p>
              <Link href="/auth/login" className="text-primary hover:underline">
                User login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
