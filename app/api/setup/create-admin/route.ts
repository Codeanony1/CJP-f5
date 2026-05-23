import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create a Supabase client with service role (admin)
    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // User exists, just add them to admin_users if not already there
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({ email }, { onConflict: 'email' })

      if (adminError) {
        console.error('[v0] Error adding to admin_users:', adminError)
        return NextResponse.json(
          { error: 'Failed to add user to admin table' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'User added to admin table. You can now log in.',
      })
    }

    // Try signing up with email/password
    // The auth.signUp will handle creating the Supabase auth user
    console.log('[v0] Creating auth user for admin...')

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: 'Admin User',
          },
        }),
      }
    )

    const authData = await response.json()

    if (!response.ok) {
      console.error('[v0] Auth error:', authData)
      return NextResponse.json(
        { error: authData.message || 'Failed to create auth user' },
        { status: 400 }
      )
    }

    const userId = authData.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID returned from auth' },
        { status: 400 }
      )
    }

    console.log('[v0] Auth user created:', userId)

    // Add to admin_users table
    const { error: adminError } = await supabase.from('admin_users').insert({
      email,
    })

    if (adminError) {
      console.error('[v0] Admin error:', adminError)
      return NextResponse.json(
        { error: 'Failed to add user to admin table: ' + adminError.message },
        { status: 400 }
      )
    }

    // Update users table to set is_admin and membership_status
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        full_name: 'Admin User',
        is_admin: true,
        membership_status: 'VERIFIED',
      }, { onConflict: 'id' })

    if (userError) {
      console.error('[v0] User update error:', userError)
    }

    return NextResponse.json({
      success: true,
      message: `Admin user created successfully. Email: ${email}. You can now log in.`,
    })
  } catch (error) {
    console.error('[v0] Unexpected error in create-admin:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
