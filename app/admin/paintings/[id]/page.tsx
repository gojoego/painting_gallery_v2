import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireArtist } from '@/lib/supabase';
import { titleOf } from '@/lib/painting';
import { PaintingForm } from './painting-form';
export const metadata={title:'Edit painting',robots:{index:false,follow:false}};
export default async function Edit({params}:{params:Promise<{id:string}>}){const db=await requireArtist();const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const {data,error}=await db.from('paintings').select('*').eq('id',id).single();if(error||!data)notFound();return <section className="page-section editor"><Link href="/admin" className="text-link">← Your paintings</Link><p className="eyebrow">PRIVATE STUDIO · {data.visibility}</p><h1>{titleOf(data)}</h1><PaintingForm painting={data}/></section>;}
