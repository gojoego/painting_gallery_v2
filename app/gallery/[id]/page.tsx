/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publishedPaintings } from '@/lib/gallery';
import { dimensions, priceOf, titleOf, pickup } from '@/lib/painting';
export default async function PaintingPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=(await publishedPaintings()).find(p=>p.id===id);if(!p)notFound();return <section className="page-section"><Link className="text-link" href="/gallery">← Back to the gallery</Link><div className="detail"><div className="detail-canvas"><img src={`/artwork/${p.id}`} alt={titleOf(p)}/></div><div><p className="eyebrow">JANE DOE · ORIGINAL PAINTING</p><h1>{titleOf(p)}</h1><span className={`status ${p.availability==='sold'?'sold':''}`}>{p.availability==='sold'?'Sold':'Available'}</span><dl>{p.medium&&<><dt>Medium</dt><dd>{p.medium}</dd></>}{dimensions(p)&&<><dt>Dimensions (W × H × D)</dt><dd>{dimensions(p)}</dd></>}{priceOf(p)&&<><dt>Price · USD</dt><dd>{priceOf(p)}</dd></>}</dl>{p.description&&<p className="description">{p.description}</p>}<p className="pickup">{pickup}</p></div></div></section>;}
