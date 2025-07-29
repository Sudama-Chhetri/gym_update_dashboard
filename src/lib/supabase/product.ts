import { supabase } from '@/lib/supabase/supabaseClient';

export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data;
}

interface ProductPayload {
  name: string;
  cost_price: number;
  selling_price: number;
  mrp: number;
  stock: number;
  tax: number;
  img_url?: string;
}

export async function addProduct(product: ProductPayload) {
  const { data: last } = await supabase
    .from('products')
    .select('product_id')
    .order('product_id', { ascending: false })
    .limit(1);

  let newId = 'PR001';
  if (last && last.length > 0) {
    const lastNum = parseInt(last[0].product_id.replace('PR', ''));
    newId = `PR${(lastNum + 1).toString().padStart(3, '0')}`;
  }

  const { error } = await supabase.from('products').insert({
    product_id: newId,
    ...product,
  });
  if (error) throw error;
}

export async function updateProduct(product_id: string, product: ProductPayload) {
  const { error } = await supabase.from('products').update(product).eq('product_id', product_id);
  if (error) throw error;
}

export async function deleteProduct(product_id: string) {
  const { error } = await supabase.from('products').delete().eq('product_id', product_id);
  if (error) throw error;
}
