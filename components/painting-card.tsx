/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { dimensions, priceOf, titleOf, type Painting } from '@/lib/painting';
export function PaintingCard({painting:p}:{painting:Painting}) {return <Link className="art-card" href={`/gallery/${p.id}`}><div className="canvas"><img src={`/artwork/${p.id}`} alt={titleOf(p)} /></div><div className="card-caption"><div><h3>{titleOf(p)}</h3>{p.medium && <p>{p.medium}</p>}{dimensions(p)&&<p>{dimensions(p)}</p>}</div><div className="card-price"><span className={p.availability==='sold'?'sold':''}>{p.availability==='sold'?'Sold':'Available'}</span>{priceOf(p)&&<p>{priceOf(p)}</p>}</div></div></Link>;}
