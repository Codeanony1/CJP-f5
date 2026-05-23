import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    // Create admin user in auth.users with is_admin metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@cjp.in',
      password: 'AdminCJP@2026',
      email_confirm: true,
      user_metadata: {
        is_admin: true,
        full_name: 'CJP Admin',
      },
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      // If user already exists, that's okay
      if (!authError.message.includes('already exists')) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    // Try to create admin_users record
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@cjp.in',
        password_hash: 'AdminCJP@2026', // In production, use bcrypt
        full_name: 'CJP Administrator',
      })
      .select()

    if (adminError && !adminError.message.includes('duplicate')) {
      console.error('Admin user creation error:', adminError)
    }

    return NextResponse.json(
      { message: 'Admin setup completed. Use admin@cjp.in / AdminCJP@2026' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    )
  }
}
