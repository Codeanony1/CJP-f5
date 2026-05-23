'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `CJP-Member-Card-${userData?.id || 'card'}.png`
      link.click()
    } catch (err) {
      console.error('Error generating card:', err)
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
              <div
                ref={cardRef}
                className="w-full max-w-sm bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary rounded-2xl p-8 text-center"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
                }}
              >
                {/* Card Header with Logo */}
                <div className="mb-8 pb-6 border-b border-primary/30 flex justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2022%2C%202026%2C%2003_06_58%20PM-photoaidcom-cropped-7VuOCUAx0hHA4wh6Hb2tjBFcyKNAgn.png"
                    alt="CJP Logo"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-1">CJP</h2>
                  <p className="text-sm text-secondary font-semibold">Cockroach Janta Party</p>
                </div>

                {/* Member Info */}
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">MEMBER NAME</p>
                    <h3 className="text-xl font-bold text-foreground">
                      {userData?.full_name || 'CJP Member'}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">MEMBERSHIP ID</p>
                    <p className="text-sm font-mono text-accent">
                      {userData?.id?.substring(0, 12).toUpperCase() || 'XXXXXXXXXXXXX'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">JOINED</p>
                      <p className="text-sm font-semibold text-foreground">
                        {userData?.membership_date
                          ? new Date(userData.membership_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">STATUS</p>
                      <p
                        className={`text-sm font-semibold ${
                          userData?.membership_status === 'APPROVED'
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {userData?.membership_status || 'PENDING'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div className="border-t border-primary/30 pt-6">
                  <p className="text-xs text-muted-foreground mb-2">OUR MISSION</p>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    Revolution and Youth Demand
                  </p>
                  <p className="text-xs text-secondary mt-2">
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
