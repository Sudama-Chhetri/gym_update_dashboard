import { supabase } from '@/lib/supabase/supabaseClient';

export async function getTrainers() {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('trainer_id', { ascending: true });

  if (error) {
    console.error('Error fetching trainers:', error);
    return [];
  }
  return data;
}

interface TrainerPayload {
  name: string;
  contact: string;
  email: string;
  age: number;
  cost: number;
}

export async function addTrainer(trainer: TrainerPayload) {
  const { data, error } = await supabase.from('trainers').insert([trainer]);
  if (error) {
    console.error('Error adding trainer:', error);
  }
  return data;
}

export async function updateTrainer(trainer_id: string, trainer: TrainerPayload) {
  const { data, error } = await supabase
    .from('trainers')
    .update(trainer)
    .eq('trainer_id', trainer_id);
  if (error) {
    console.error('Error updating trainer:', error);
  }
  return data;
}

export async function deleteTrainer(trainer_id: string) {
  const { error } = await supabase.from('trainers').delete().eq('trainer_id', trainer_id);
  if (error) {
    console.error('Error deleting trainer:', error);
  }
}

export async function getMembersByTrainer(trainerId: string): Promise<{ member_id: string; name: string; }[]> {
  const { data, error } = await supabase
    .from("members")
    .select("member_id, name")
    .eq("trainer_assigned", trainerId)

  if (error) {
    console.error("Error fetching members for trainer:", error)
    return []
  }

  return data
}
