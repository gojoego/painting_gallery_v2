import 'server-only';
import { configured, supabase } from './supabase';
import type { Painting } from './painting';
export async function publishedPaintings():Promise<Painting[]> {
  if (!configured()) return [];
  const db = await supabase();
  const {data,error} = await db.from('paintings').select('id,title,medium,description,width,height,depth,price_cents,availability,visibility,photo_path').eq('visibility','published').order('created_at',{ascending:false});
  if(error) throw new Error('The gallery is temporarily unavailable. Please try again.');
  return data || [];
}
