'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { z } from 'zod';
import { configured, requireArtist, supabase } from '@/lib/supabase';
import { paintingSchema, canPublish } from '@/lib/painting';
export type ActionState={error?:string;success?:string};
export async function signIn(_:ActionState,form:FormData):Promise<ActionState>{
 if(!configured())return {error:'Supabase is not configured. Follow the setup instructions in README.md.'};
 const email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');
 if(!z.email().safeParse(email).success || !password || password.length>200)return {error:'Enter a valid email and password.'};
 const db=await supabase();const {error}=await db.auth.signInWithPassword({email,password});
 if(error)return {error:'Unable to sign in. Check your email and password.'};
 const {data}=await db.rpc('is_artist');
 if(!data){await db.auth.signOut();return {error:'This account is not authorized to manage the gallery.'};}
 redirect('/admin');
}
export async function signOut(){const db=await requireArtist();await db.auth.signOut();redirect('/admin/login');}
export async function createDraft(){const db=await requireArtist();const {data,error}=await db.from('paintings').insert({}).select('id').single();if(error)throw new Error('Unable to create a draft. Please try again.');redirect(`/admin/paintings/${data.id}`);}
export async function savePainting(id:string,_:ActionState,form:FormData):Promise<ActionState>{
 const db=await requireArtist();
 if(!z.uuid().safeParse(id).success)return {error:'Invalid painting.'};
 const parsed=paintingSchema.safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join(' ')};
 const {data:existing,error:readError}=await db.from('paintings').select('photo_path').eq('id',id).single();
 if(readError || !existing)return {error:'Painting not found.'};
 const file=form.get('photo');let photoPath:string|null=existing.photo_path;let uploaded:string|null=null;
 try {
 if(file instanceof File && file.size>0){
  if(file.size>3*1024*1024) return {error:'Choose a photo under 3 MB.'};
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return {error:'Use a JPEG, PNG, or WebP photo.'};
  const input=Buffer.from(await file.arrayBuffer());
  const image=sharp(input,{limitInputPixels:40000000,animated:false});const meta=await image.metadata();
  if(!['jpeg','png','webp'].includes(meta.format||'') || (meta.pages||1)>1)return {error:'Use a single JPEG, PNG, or WebP image.'};
  const bytes=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();
  if(bytes.length>3*1024*1024)return {error:'This photo is too large after processing. Choose a smaller image.'};
  uploaded=`${id}/${crypto.randomUUID()}.webp`;
  const {error}=await db.storage.from('paintings').upload(uploaded,bytes,{contentType:'image/webp',upsert:false});
  if(error)return {error:'Photo upload failed. Please try again.'};
  photoPath=uploaded;
 }
 const {price,...values}=parsed.data;
 if(values.visibility==='published' && !canPublish({...values,photo_path:photoPath})){
  if(uploaded)await db.storage.from('paintings').remove([uploaded]);
  return {error:'Publishing requires a photo and positive width and height in inches. Save a draft to keep incomplete work.'};
 }
 const {error}=await db.from('paintings').update({...values,price_cents:price,photo_path:photoPath}).eq('id',id).select('id').single();
 if(error){if(uploaded)await db.storage.from('paintings').remove([uploaded]);return {error:'Unable to save the painting. Your previous version is unchanged. Please try again.'};}
 if(uploaded && existing.photo_path)await db.storage.from('paintings').remove([existing.photo_path]);
 }catch {if(uploaded)await db.storage.from('paintings').remove([uploaded]);return {error:'Unable to process the photo. Choose a valid JPEG, PNG, or WebP and try again.'};}
 revalidatePath('/','layout');
 return {success:parsed.data.visibility==='published'?'Painting published. It is now visible in the gallery.':parsed.data.visibility==='hidden'?'Painting hidden. It is no longer publicly accessible.':'Draft saved privately.'};
}
