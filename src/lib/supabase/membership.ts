import { supabase } from '@/lib/supabase/supabaseClient'

export async function getMemberships() {
  const { data, error } = await supabase
    .from('membership')
    .select('*')
    .order('duration')
  if (error) throw error
  return data
}

export async function addMembership(duration: number, pricing: number, category: string) {
  const { error } = await supabase
    .from('membership')
    .insert({ duration, pricing, category })
  if (error) throw error
}

export async function updateMembership(id: number, duration: number, pricing: number, category: string) {
  const { error } = await supabase
    .from('membership')
    .update({ duration, pricing, category })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMembership(id: number) {
  const { error } = await supabase
    .from('membership')
    .delete()
    .eq('id', id)
  if (error) throw error
}
