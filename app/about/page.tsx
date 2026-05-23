'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            About <span className="text-primary">Cockroach Janta Party</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Understanding our mission, vision, and values
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">
                The Cockroach Janta Party exists to amplify the voices of youth and citizens demanding systemic
                change. We believe in the power of collective action to create a more equitable, just, and prosperous
                society. Through unified demands and collaborative governance, we strive to build a nation that serves
                all its people equally.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">
                We envision a strong nation built on the pillars of equal rights, economic justice, quality education,
                accessible healthcare, environmental sustainability, and transparent governance. A future where every
                young voice is heard, valued, and has a real impact on the decisions that shape our collective future.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Core Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Revolution',
                  description: 'We catalyze meaningful change through innovation and bold action',
                },
                {
                  title: 'Youth Empowerment',
                  description: 'We believe young people are the agents of change and deserve a seat at the table',
                },
                {
                  title: 'Unity & Collective Demand',
                  description: 'We channel diverse voices into unified, powerful demands for systemic change',
                },
                {
                  title: 'Equality & Justice',
                  description:
                    'We fight for equal rights, equal opportunities, and fair treatment for all citizens',
                },
                {
                  title: 'Transparency',
                  description:
                    'We operate with complete transparency, accountability, and respect for democratic principles',
                },
                {
                  title: 'Inclusive Participation',
                  description: 'We welcome all voices, perspectives, and ideas to strengthen our movement',
                },
              ].map((value, idx) => (
                <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                  <h4 className="font-semibold text-primary mb-1">{value.title}</h4>
                  <p className="text-foreground/90">{value.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Join the Movement</h5>
                    <p className="text-foreground/90">Create an account and become part of our growing community</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-secondary text-secondary-foreground font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Share Your Voice</h5>
                    <p className="text-foreground/90">Submit your demands, ideas, and vision for change</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-accent text-accent-foreground font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Engage & Collaborate</h5>
                    <p className="text-foreground/90">
                      Comment, upvote, and collaborate with other members on shared demands
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Create Change</h5>
                    <p className="text-foreground/90">
                      Together, we push for systemic change through unified, collective action
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Join Us Today</CardTitle>
              <CardDescription>
                Be part of a movement that&apos;s reshaping the future of our nation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 mb-4">
                Your voice matters. Your demands matter. Together, we can create the change we want to see.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Learn more about our movement and join thousands of citizens demanding change.
          </p>
        </div>
      </footer>
    </div>
  )
}
