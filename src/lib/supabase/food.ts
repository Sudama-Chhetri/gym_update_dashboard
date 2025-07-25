// lib/supabase/food.ts
import { supabase } from '@/lib/supabase/supabaseClient';

export async function getFoodItems() {
  const { data, error } = await supabase
    .from('food')
    .select('*')
    .order('food_id', { ascending: true });

  if (error) {
    console.error('Error fetching food items:', error);
    return [];
  }
  return data;
}

export async function addFoodItem(item) {
  const { data, error } = await supabase.from('food').insert([item]);
  if (error) {
    console.error('Error adding food item:', error);
  }
  return data;
}

export async function updateFoodItem(food_id, item) {
  const { data, error } = await supabase
    .from('food')
    .update(item)
    .eq('food_id', food_id);
  if (error) {
    console.error('Error updating food item:', error);
  }
  return data;
}

export async function deleteFoodItem(food_id) {
  const { error } = await supabase.from('food').delete().eq('food_id', food_id);
  if (error) {
    console.error('Error deleting food item:', error);
  }
}
