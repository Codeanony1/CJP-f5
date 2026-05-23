import { createClient } from '@/lib/supabase/server'

// Agendas/Demands functions
export async function getAgendas() {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('agendas')
    .select('*')
    .order('priority', { ascending: false })

  if (error) {
    console.error('Error fetching agendas:', error)
    return []
  }
  return data || []
}

export async function getAgendaById(id: string) {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase.from('agendas').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching agenda:', error)
    return null
  }
  return data
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
      user:users(id, full_name, email),
      comments:voice_comments(count),
      upvotes:voice_upvotes(count)
    `
    )
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching voices:', error)
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
      comments:voice_comments(count),
      upvotes:voice_upvotes(count)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user voices:', error)
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
    console.error('Error submitting voice:', error)
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
      user:users(id, full_name, email)
    `
    )
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending voices:', error)
    return []
  }
  return data || []
}

export async function approveVoice(voiceId: string) {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('youth_voices')
    .update({ status: 'APPROVED' })
    .eq('id', voiceId)

  if (error) {
    console.error('Error approving voice:', error)
    return false
  }
  return true
}

export async function rejectVoice(voiceId: string) {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('youth_voices')
    .update({ status: 'REJECTED' })
    .eq('id', voiceId)

  if (error) {
    console.error('Error rejecting voice:', error)
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
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
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
    console.error('Error creating agenda:', error)
    return null
  }
  return data?.[0] || null
}
