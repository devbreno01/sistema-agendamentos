import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  description: string
  footerText: string
  footerLink: string
  footerLabel: string
  children: ReactNode
}

export function AuthLayout({ title, description, footerText, footerLink, footerLabel, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-5 py-10">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[#141414]">{title}</h1>
            <p className="mt-2 text-sm text-black/50">{description}</p>
          </header>
          {children}
        </section>

        <p className="mt-6 text-center text-sm text-black/50">
          {footerText}{' '}
          <Link className="font-semibold text-[#141414] underline decoration-[#FBE509] decoration-2 underline-offset-4" to={footerLink}>{footerLabel}</Link>
        </p>
      </div>
    </main>
  )
}
