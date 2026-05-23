'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('admin@admin.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      console.log('[v0] Creating admin user:', email)
      
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[v0] Error response:', data)
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create admin user',
        })
      } else {
        console.log('[v0] Success:', data)
        setMessage({
          type: 'success',
          text: `Admin user created! You can now log in with email: ${email}. Go to /admin/login`,
        })
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      console.error('[v0] Error creating admin:', err)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      })
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
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {message && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-red-500/10 text-red-600'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Admin User'}
            </Button>

            <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Create Admin User" above</li>
                <li>Go to <code className="bg-muted px-2 py-1 rounded">/admin/login</code></li>
                <li>Log in with the credentials above</li>
              </ol>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
