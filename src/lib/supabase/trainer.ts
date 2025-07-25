// lib/supabase/trainer.ts
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

export async function addTrainer(trainer) {
  const { data, error } = await supabase.from('trainers').insert([trainer]);
  if (error) {
    console.error('Error adding trainer:', error);
  }
  return data;
}

export async function updateTrainer(trainer_id, trainer) {
  const { data, error } = await supabase
    .from('trainers')
    .update(trainer)
    .eq('trainer_id', trainer_id);
  if (error) {
    console.error('Error updating trainer:', error);
  }
  return data;
}

export async function deleteTrainer(trainer_id) {
  const { error } = await supabase.from('trainers').delete().eq('trainer_id', trainer_id);
  if (error) {
    console.error('Error deleting trainer:', error);
  }
}
