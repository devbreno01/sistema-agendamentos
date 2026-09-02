import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn('h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-[#141414] outline-none transition placeholder:text-black/35 focus:border-[#141414] focus:ring-2 focus:ring-[#FBE509]/50 disabled:opacity-50', className)} {...props} />
}

export { Input }
