import Link from 'next/link';
import { requireArtist } from '@/lib/supabase';
import { titleOf, type Painting } from '@/lib/painting';
import { createDraft, signOut } from './actions';
import { Button } from '@/components/ui/button';
export const metadata={title:'Artist studio',robots:{index:false,follow:false}};
export default async function Admin(){const db=await requireArtist();const {data,error}=await db.from('paintings').select('*').order('created_at',{ascending:false});if(error)throw new Error('Unable to load paintings. Please try again.');return <section className="page-section"><div className="section-heading"><div><p className="eyebrow">PRIVATE STUDIO</p><h1>Your paintings</h1></div><form action={signOut}><Button variant="outline">Sign out</Button></form></div><form action={createDraft}><Button>＋ Create a painting</Button></form><div className="admin-list">{data?.length?data.map((p:Painting)=><Link key={p.id} href={`/admin/paintings/${p.id}`}><strong>{titleOf(p)}</strong><span className="status">{p.visibility}</span><span>{p.availability==='sold'?'Sold':'Available'} ↗</span></Link>):<div className="empty-state"><h2>Your next painting starts here.</h2><p>Create a private draft. Add a photo and dimensions when you’re ready to publish.</p></div>}</div></section>;}
