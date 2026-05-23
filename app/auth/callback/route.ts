import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle error from Supabase (e.g., expired link)
  if (error) {
    const errorMessage = error_description || error
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorMessage)}`)
  }

  if (code) {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('Supabase not configured')}`)
    }
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Successfully verified - redirect to profile or specified next URL
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    // Handle specific exchange errors
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`)
  }

  // No code provided - redirect to error
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('No verification code provided')}`)
}
