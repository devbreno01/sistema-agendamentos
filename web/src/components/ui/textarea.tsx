import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn('min-h-24 w-full resize-y rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-[#141414] outline-none transition placeholder:text-black/35 focus:border-[#141414] focus:ring-2 focus:ring-[#FBE509]/50', className)} {...props} />
}

export { Textarea }
