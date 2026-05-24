'use server'

import { createClient } from '@/lib/supabase/server'

// Agendas/Demands functions
export async function getAgendas() {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('agendas')
    .select('*')
    .order('priority', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching agendas:', error)
    return []
  }
  return data || []
}

export async function getAgendaById(id: string) {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase.from('agendas').select('*').eq('id', id).single()

  if (error) {
    console.error('[v0] Error fetching agenda:', error)
    return null
  }
  return data
}

export async function updateAgenda(
  id: string,
  title: string,
  description: string,
  category: string,
  priority: number
) {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('agendas')
    .update({
      title,
      description,
      category,
      priority,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('[v0] Error updating agenda:', error)
    return null
  }
  return data?.[0] || null
}

export async function deleteAgenda(id: string) {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase.from('agendas').delete().eq('id', id)

  if (error) {
    console.error('[v0] Error deleting agenda:', error)
    return false
  }
  return true
}

// Youth Voices functions
export async function getApprovedVoices() {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('youth_voices')
    .select(
      `
      *,
      users(id, full_name, email),
      voice_comments(count),
      voice_upvotes(count)
    `
    )
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching voices:', error)
    return []
  }
  return data || []
}

export async function getUserVoices(userId: string) {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('youth_voices')
    .select(
      `
      *,
      voice_comments(count),
      voice_upvotes(count)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching user voices:', error)
    return []
  }
  return data || []
}

export async function submitVoice(
  userId: string,
  title: string,
  content: string,
  isAnonymous: boolean
) {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('youth_voices')
    .insert([
      {
        user_id: userId,
        title,
        content,
        is_anonymous: isAnonymous,
        status: 'PENDING',
      },
    ])
    .select()

  if (error) {
    console.error('[v0] Error submitting voice:', error)
    return null
  }
  return data?.[0] || null
}

// Admin functions
export async function getPendingVoices() {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('youth_voices')
    .select(
      `
      *,
      users(id, full_name, email)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching pending voices:', error)
    return []
  }
  return data || []
}

export async function approveVoice(voiceId: string) {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('youth_voices')
    .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
    .eq('id', voiceId)

  if (error) {
    console.error('[v0] Error approving voice:', error)
    return false
  }
  return true
}

export async function rejectVoice(voiceId: string) {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('youth_voices')
    .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
    .eq('id', voiceId)

  if (error) {
    console.error('[v0] Error rejecting voice:', error)
    return false
  }
  return true
}

export async function createAgenda(
  title: string,
  description: string,
  category: string,
  priority: number = 100
) {
  const supabase = await createClient()
  if (!supabase) {
    console.error('[v0] Supabase client not available')
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[v0] User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('agendas')
    .insert([
      {
        title,
        description,
        category,
        priority,
        created_by: user.id,
      },
    ])
    .select()

  if (error) {
    console.error('[v0] Error creating agenda:', error)
    return null
  }
  return data?.[0] || null
}
