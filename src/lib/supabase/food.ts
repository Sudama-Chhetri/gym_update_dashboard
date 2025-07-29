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

interface FoodItemPayload {
  name: string;
  cost: number;
  tax: number;
  img_url?: string;
}

export async function addFoodItem(item: FoodItemPayload) {
  const { data, error } = await supabase.from('food').insert([item]);
  if (error) {
    console.error('Error adding food item:', error);
  }
  return data;
}

export async function updateFoodItem(food_id: string, item: FoodItemPayload) {
  const { data, error } = await supabase
    .from('food')
    .update(item)
    .eq('food_id', food_id);
  if (error) {
    console.error('Error updating food item:', error);
  }
  return data;
}

export async function deleteFoodItem(food_id: string) {
  const { error } = await supabase.from('food').delete().eq('food_id', food_id);
  if (error) {
    console.error('Error deleting food item:', error);
  }
}
