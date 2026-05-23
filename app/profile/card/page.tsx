'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import html2canvas from 'html2canvas'

interface UserData {
  id: string
  email: string
  full_name: string | null
  membership_status: string | null
  membership_date: string | null
}

export default function MemberCardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setUserData(profileData as UserData)
      }

      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const downloadCard = async () => {
    if (!cardRef.current) return

    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f0f0f',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `CJP-Member-Card-${userData?.id || 'card'}.png`
      link.click()
    } catch (err) {
      console.error('Error generating card:', err)
      alert('Failed to generate card. Please try again.')
    } finally {
      setDownloading(false)
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

  // Check if user's membership status is VERIFIED
  if (userData?.membership_status !== 'VERIFIED') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <CardHeader>
                <CardTitle className="text-yellow-600">Member Card Not Available</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Your membership card will be available once your account is verified by an admin.
                </p>
                <p className="text-sm text-muted-foreground">
                  Current Status: <span className="font-semibold text-yellow-600">{userData?.membership_status || 'PENDING'}</span>
                </p>
                <div className="pt-4">
                  <Link href="/profile">
                    <Button variant="outline">Back to Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-primary">Member Card</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your official CJP membership card. Download and share with pride.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Membership Card</CardTitle>
              <CardDescription>
                A digital representation of your commitment to the CJP movement
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {/* Card uses inline styles for html2canvas compatibility */}
              <div
                ref={cardRef}
                style={{
                  width: '100%',
                  maxWidth: '384px',
                  background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 107, 53, 0.2) 100%)',
                  border: '2px solid #ff9500',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: '#1a1a1a',
                }}
              >
                {/* Card Header with Logo */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 149, 0, 0.3)', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2022%2C%202026%2C%2003_06_58%20PM-photoaidcom-cropped-7VuOCUAx0hHA4wh6Hb2tjBFcyKNAgn.png"
                    alt="CJP Logo"
                    style={{ width: '112px', height: '112px', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9500', marginBottom: '4px' }}>CJP</h2>
                  <p style={{ fontSize: '14px', color: '#138808', fontWeight: '600' }}>Cockroach Janta Party</p>
                </div>

                {/* Member Info */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>MEMBER NAME</p>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f5f5f5' }}>
                      {userData?.full_name || 'CJP Member'}
                    </h3>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>MEMBERSHIP ID</p>
                    <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#ff6b35' }}>
                      {userData?.id?.substring(0, 12).toUpperCase() || 'XXXXXXXXXXXXX'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>JOINED</p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#f5f5f5' }}>
                        {userData?.membership_date
                          ? new Date(userData.membership_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>STATUS</p>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: userData?.membership_status === 'APPROVED' ? '#4ade80' : '#facc15',
                        }}
                      >
                        {userData?.membership_status || 'PENDING'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div style={{ borderTop: '1px solid rgba(255, 149, 0, 0.3)', paddingTop: '24px' }}>
                  <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>OUR MISSION</p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#f5f5f5', lineHeight: '1.5' }}>
                    Revolution and Youth Demand
                  </p>
                  <p style={{ fontSize: '12px', color: '#138808', marginTop: '8px' }}>
                    United Voice • Equal Rights • Strong Nation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={downloadCard} disabled={downloading} size="lg" className="sm:w-auto">
              {downloading ? 'Generating...' : 'Download Card (PNG)'}
            </Button>
            <Button onClick={() => window.print()} variant="outline" size="lg" className="sm:w-auto">
              Print Card
            </Button>
          </div>

          <Card className="mt-8 bg-accent/10 border-accent/30">
            <CardHeader>
              <CardTitle className="text-accent">How to Use Your Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/90">
              <p>✓ Download and save your card as a digital ID</p>
              <p>✓ Print it out and carry it with you</p>
              <p>✓ Share it on social media to show your support</p>
              <p>✓ Use it as proof of your CJP membership</p>
              <p>✓ Inspire others to join the movement</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Be proud of your commitment to the CJP movement. Share your card and spread the word!
          </p>
        </div>
      </footer>
    </div>
  )
}
