'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getApprovedVoices } from '@/lib/db'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, MessageCircle } from 'lucide-react'

interface Voice {
  id: string
  title: string
  content: string
  is_anonymous: boolean
  created_at: string
  user?: {
    id: string
    full_name: string
    email: string
  }
  comments?: Array<{ count: number }>
  upvotes?: Array<{ count: number }>
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVoices = async () => {
      const data = await getApprovedVoices()
      setVoices(data as Voice[])
      setLoading(false)
    }
    fetchVoices()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-secondary">Youth Voices</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Hear from members of our movement. Share your demands, ideas, and vision for the future.
          </p>
          <Link href="/voices/submit">
            <Button size="lg">Share Your Voice</Button>
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-card border border-border p-6 rounded-lg animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : voices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">No approved voices yet.</p>
                <Link href="/voices/submit">
                  <Button>Be the first to share</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {voices.map((voice) => (
                <Card key={voice.id} className="hover:border-primary/50 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{voice.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {voice.is_anonymous ? (
                            <span className="text-muted-foreground">Anonymous Member</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {voice.user?.full_name || 'Unknown'}
                            </span>
                          )}
                          {' • '}
                          <span className="text-muted-foreground">
                            {new Date(voice.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 line-clamp-3 mb-4">{voice.content}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">
                          {voice.upvotes?.[0]?.count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">
                          {voice.comments?.[0]?.count || 0}
                        </span>
                      </div>
                      <Link href={`/voices/${voice.id}`} className="ml-auto">
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Full Voice
                        </Button>
                      </Link>
                    </div>
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
            Your voice matters. Share your vision and help shape the future of our movement.
          </p>
        </div>
      </footer>
    </div>
  )
}
