import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const configured = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export async function supabase() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:values=>{try { values.forEach(({name,value,options})=>jar.set(name,value,options)); } catch { /* Proxy refreshes cookies during server rendering. */ }}}});
}
export async function requireArtist() {
  if (!configured()) redirect('/admin/login');
  const db = await supabase();
  const {data:{user}} = await db.auth.getUser();
  if (!user) redirect('/admin/login');
  const {data,error} = await db.rpc('is_artist');
  if (error || !data) redirect('/admin/login?denied=1');
  return db;
}
