import { z } from 'zod';
import { configured, supabase } from '@/lib/supabase';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const headers={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'};
 const {id}=await params;
 if(!configured()||!z.uuid().safeParse(id).success)return new Response(null,{status:404,headers});
 const db=await supabase();
 // RLS permits only published rows or the authorized artist; storage rechecks visibility.
 const {data:p,error}=await db.from('paintings').select('photo_path').eq('id',id).single();
 if(error||!p?.photo_path)return new Response(null,{status:404,headers});
 const {data,error:photoError}=await db.storage.from('paintings').download(p.photo_path);
 if(photoError||!data)return new Response(null,{status:404,headers});
 return new Response(data,{headers:{...headers,'Content-Type':'image/webp'}});
}
