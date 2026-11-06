import * as React from 'react';
import { cn } from '@/lib/utils';
export function Input({className,...props}:React.ComponentProps<'input'>){return <input data-slot="input" className={cn('flex min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base shadow-xs focus-visible:outline-2 focus-visible:outline-stone-700 disabled:opacity-50',className)} {...props}/>;}
