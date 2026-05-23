'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Initialize admin account on first load
    const initializeAdmin = async () => {
      try {
        const response = await fetch('/api/admin/setup', { method: 'POST' })
        if (response.ok) {
          console.log('[v0] Admin setup completed')
        }
      } catch (err) {
        console.error('[v0] Admin setup error:', err)
      }
    }

    initializeAdmin()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">
                  <span className="text-primary">Revolution</span> and{' '}
                  <span className="text-secondary">Youth Demand</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  A united voice for equal rights and a strong nation
                </p>
              </div>
              <p className="text-lg text-foreground/90">
                Join the Cockroach Janta Party movement. Share your voice, shape our demands, and
                build the future you believe in.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto">
                    Join Our Movement
                  </Button>
                </Link>
                <Link href="/demands">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Our Demands
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2022%2C%202026%2C%2003_06_58%20PM-photoaidcom-cropped-7VuOCUAx0hHA4wh6Hb2tjBFcyKNAgn.png"
                alt="Cockroach Janta Party Logo"
                className="w-full max-w-sm h-auto shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: 'Revolution',
                description: 'Catalyzing change through collective action and innovation',
              },
              {
                title: 'Youth Power',
                description: 'Empowering young voices to lead and shape decisions',
              },
              {
                title: 'Demand',
                description: 'Channeling unified demands for a better future',
              },
              {
                title: 'Equal Rights',
                description: 'Building a strong nation founded on equality',
              },
            ].map((value, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded-lg flex flex-col items-center text-center">
                <div className="mb-4 w-20 h-20">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2022%2C%202026%2C%2003_06_58%20PM-photoaidcom-cropped-7VuOCUAx0hHA4wh6Hb2tjBFcyKNAgn.png"
                    alt="CJP Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Share Your Voice</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Every youth voice matters. Share your demands, comment on party agendas, and help
              shape the future of our movement.
            </p>
            <Link href="/voices">
              <Button size="lg">Submit Your Voice</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Cockroach Janta Party © 2026. Revolution and Youth Demand.
            </p>
            <div className="flex gap-4">
              <Link href="/about" className="text-muted-foreground hover:text-primary transition">
                About
              </Link>
              <Link href="/demands" className="text-muted-foreground hover:text-primary transition">
                Demands
              </Link>
              <Link href="/voices" className="text-muted-foreground hover:text-primary transition">
                Voices
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
