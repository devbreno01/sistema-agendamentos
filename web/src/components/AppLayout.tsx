import { CalendarDays, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  function logout() {
    auth.clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#141414] text-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-7">
          <button className="rounded-lg p-2 text-white/60 lg:hidden" onClick={() => setSidebarOpen(false)}><X className="size-5" /></button>
        </div>

        <nav className="flex-1 p-4">
          <NavLink to="/appointments" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-[#FBE509] text-[#141414]' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}>
            <CalendarDays className="size-5" /> Agendamentos
          </NavLink>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
            <LogOut className="size-5" /> Sair da conta
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="flex h-20 items-center border-b border-black/5 bg-white px-5 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="size-5" /></Button>
          <span className="ml-3 font-semibold">Horizon</span>
        </header>
        <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10"><Outlet /></main>
      </div>
    </div>
  )
}
