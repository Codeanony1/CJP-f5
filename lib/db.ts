import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Agendas/Demands functions
export async function getAgendas() {
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
  const { data, error } = await supabase.from('agendas').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching agenda:', error)
    return null
  }
  return data
}

// Youth Voices functions
export async function getApprovedVoices() {
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: 'User not authenticated', data: null }
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
        is_active: true,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating agenda:', error)
    return { error: error.message, data: null }
  }
  return { error: null, data: data?.[0] || null }
}

export async function updateAgenda(
  id: string,
  title: string,
  description: string,
  category: string,
  priority: number
) {
  const { data, error } = await supabase
    .from('agendas')
    .update({
      title,
      description,
      category,
      priority,
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating agenda:', error)
    return { error: error.message, data: null }
  }
  return { error: null, data: data?.[0] || null }
}

export async function deleteAgenda(id: string) {
  const { error } = await supabase
    .from('agendas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting agenda:', error)
    return { error: error.message, success: false }
  }
  return { error: null, success: true }
}

export async function toggleAgendaStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase
    .from('agendas')
    .update({ is_active })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error toggling agenda status:', error)
    return { error: error.message, data: null }
  }
  return { error: null, data: data?.[0] || null }
}
