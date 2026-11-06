import type { Metadata } from 'next';
import Link from 'next/link';
import { artistName, pickup } from '@/lib/painting';
import './globals.css';
export const metadata:Metadata={title:{default:`${artistName} — Original paintings`,template:`%s | ${artistName}`},description:'Original paintings by Jane Doe. Explore the collection in Lewisville, Texas.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><header><Link className="wordmark" href="/">{artistName}<span>ORIGINAL PAINTINGS</span></Link><nav aria-label="Main navigation"><Link href="/gallery">The gallery</Link><Link href="/about">The artist</Link></nav></header><main id="main">{children}</main><footer><div className="wordmark">{artistName}</div><p>{pickup}</p><Link href="/admin">Artist sign in ↗</Link><small>© {new Date().getFullYear()} {artistName}</small></footer></body></html>;}
