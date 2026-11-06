'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="page-section"><h1>A brief pause.</h1><p>We couldn’t load this page. Please try again.</p><button className="text-link" onClick={reset}>Try again ↗</button></section>;}
