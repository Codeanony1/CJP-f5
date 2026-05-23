'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.user_metadata?.is_admin

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2022%2C%202026%2C%2003_06_58%20PM-photoaidcom-cropped-7VuOCUAx0hHA4wh6Hb2tjBFcyKNAgn.png"
              alt="CJP"
              className="h-10 w-10 object-contain"
            />
            <span>CJP</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm hover:text-primary transition">
              Home
            </Link>
            <Link href="/about" className="text-sm hover:text-primary transition">
              About
            </Link>
            <Link href="/demands" className="text-sm hover:text-primary transition">
              Our Demands
            </Link>
            <Link href="/voices" className="text-sm hover:text-primary transition">
              Youth Voices
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm hover:text-accent transition">
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-4 bg-muted rounded animate-pulse" />
            ) : user ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Join</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block text-sm hover:text-primary transition py-2">
              Home
            </Link>
            <Link href="/about" className="block text-sm hover:text-primary transition py-2">
              About
            </Link>
            <Link href="/demands" className="block text-sm hover:text-primary transition py-2">
              Our Demands
            </Link>
            <Link href="/voices" className="block text-sm hover:text-primary transition py-2">
              Youth Voices
            </Link>
            {isAdmin && (
              <Link href="/admin" className="block text-sm hover:text-accent transition py-2">
                Admin
              </Link>
            )}
            <div className="flex gap-2 pt-4">
              {user ? (
                <>
                  <Link href="/profile" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Profile
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="flex-1">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" className="flex-1">
                    <Button size="sm" className="w-full">
                      Join
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
