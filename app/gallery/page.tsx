import { publishedPaintings } from '@/lib/gallery';
import { PaintingCard } from '@/components/painting-card';
import { pickup } from '@/lib/painting';
export const metadata={title:'The gallery'};
export default async function Gallery(){const paintings=await publishedPaintings();return <section className="collection page-section"><p className="eyebrow">THE COLLECTION</p><h1>Original paintings</h1><p className="intro">A work of art. A place in your everyday.</p><div className="gallery-meta"><span>{paintings.length} {paintings.length===1?'painting':'paintings'}</span><span>{pickup}</span></div>{paintings.length?<div className="gallery-grid">{paintings.map(p=><PaintingCard key={p.id} painting={p}/>)}</div>:<div className="empty-state"><h2>Fresh from the studio, soon.</h2><p>Published paintings will appear here.</p></div>}</section>;}
