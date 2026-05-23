'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAgendas } from '@/lib/db'
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Agenda {
  id: string
  title: string
  description: string
  category: string
  priority: number
  created_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Economy: 'bg-blue-500/20 text-blue-400',
  Healthcare: 'bg-red-500/20 text-red-400',
  Education: 'bg-green-500/20 text-green-400',
  Environment: 'bg-emerald-500/20 text-emerald-400',
  Infrastructure: 'bg-yellow-500/20 text-yellow-400',
  Agriculture: 'bg-amber-500/20 text-amber-400',
  Technology: 'bg-purple-500/20 text-purple-400',
  Justice: 'bg-pink-500/20 text-pink-400',
}

export default function DemandsPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const data = await getAgendas()
        setAgendas(data as Agenda[])
      } catch (error) {
        console.error('Error fetching agendas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAgendas()
  }, [])

  const categories = Array.from(new Set(agendas.map((a) => a.category)))
  const filteredAgendas = selectedCategory
    ? agendas.filter((a) => a.category === selectedCategory)
    : agendas

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-secondary">Party Demands</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Our unified platform demands for a stronger, more equitable nation. Every demand represents the voice of our movement.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
              >
                All ({agendas.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                >
                  {category} ({agendas.filter((a) => a.category === category).length})
                </Button>
              ))}
            </div>
          </div>

          {/* Demands Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="bg-card border border-border p-6 rounded-lg animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredAgendas.map((agenda) => (
                <Card key={agenda.id} className="hover:border-primary/50 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{agenda.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              CATEGORY_COLORS[agenda.category] || 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {agenda.category}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Priority: {agenda.priority}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 line-clamp-3 mb-4">{agenda.description}</p>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-accent">
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredAgendas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No demands found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Join the movement and help us achieve these demands. Every voice counts.
          </p>
        </div>
      </footer>
    </div>
  )
}
