import { z } from 'zod';
export const artistName = 'Jane Doe';
export const pickup = 'Local pickup only in Lewisville, Texas.';
export type Painting = { id:string; title:string|null; medium:string|null; description:string|null; width:number|null; height:number|null; depth:number|null; price_cents:number|null; availability:'available'|'sold'; visibility:'draft'|'published'|'hidden'; photo_path:string|null };
export const titleOf = (p: Pick<Painting,'title'>) => p.title?.trim() || 'Untitled';
export const dimensions = (p:Painting) => p.width && p.height ? `${p.width} × ${p.height}${p.depth ? ` × ${p.depth}` : ''} in` : null;
export const priceOf = (p:Painting) => p.price_cents === null ? null : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.price_cents/100);
const optionalText = (max:number) => z.string().trim().max(max).transform(v=>v||null);
const dimension = z.string().trim().transform(v=>v===''?null:Number(v)).pipe(z.number().positive().max(10000).finite().nullable());
export const paintingSchema = z.object({title:optionalText(200),medium:optionalText(200),description:optionalText(5000),width:dimension,height:dimension,depth:dimension,price:z.string().trim().regex(/^(?:\d{1,7}(?:\.\d{1,2})?)?$/,'Use a USD amount with at most two decimal places.').transform(v=>v===''?null:Number(v.split('.')[0])*100+Number((v.split('.')[1]||'').padEnd(2,'0'))),availability:z.enum(['available','sold']),visibility:z.enum(['draft','published','hidden'])});
export function canPublish(p:{width:number|null;height:number|null;photo_path:string|null}) { return !!p.photo_path && !!p.width && p.width>0 && !!p.height && p.height>0; }
