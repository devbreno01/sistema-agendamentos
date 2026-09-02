import { ArrowRight, CalendarCheck, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api'
import { auth } from '@/lib/auth'

interface LoginResponse { token: string }

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  if (auth.isAuthenticated()) return <Navigate to="/appointments" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      auth.setToken(response.token)
      const destination = (location.state as { from?: string } | null)?.from ?? '/appointments'
      navigate(destination, { replace: true })
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Não foi possível conectar à API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#141414] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-28 -top-28 size-96 rounded-full border-[70px] border-[#FBE509]/10" />
        <div className="absolute -bottom-48 -left-32 size-[520px] rounded-full bg-[#FBE509]" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#FBE509] text-lg font-bold text-[#141414]">H</span>
          <div><p className="font-semibold leading-none">Horizon</p><p className="mt-1 text-xs text-white/45">Gestão de consultas</p></div>
        </div>
        <div className="relative z-10 max-w-xl pb-12">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/65"><CalendarCheck className="size-4 text-[#FBE509]" /> Organização que cuida</span>
          <h1 className="text-4xl font-semibold leading-[1.18] tracking-[-0.04em] xl:text-5xl">Sua agenda clínica,<br /><span className="text-[#FBE509]">simples e eficiente.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/55">Gerencie consultas, acompanhe pacientes e mantenha sua rotina organizada em um só lugar.</p>
        </div>
        <p className="relative text-xs text-[#141414]/55">© 2026 Horizon. Todos os direitos reservados.</p>
      </section>

      <section className="flex items-center justify-center bg-[#F7F7F7] px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-[#FBE509] font-bold">H</span><span className="font-semibold">Horizon</span></div>
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-black/40">Bem-vindo de volta</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#141414]">Acesse sua conta</h2>
            <p className="mt-3 text-sm leading-6 text-black/50">Use seus dados de acesso para entrar no sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="voce@clinica.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" className="pr-12" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-black/40 hover:bg-black/5" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            </div>
            <Button variant="yellow" className="mt-2 w-full" disabled={loading}>{loading ? 'Entrando...' : <>Entrar <ArrowRight className="size-4" /></>}</Button>
          </form>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-black/40"><ShieldCheck className="size-4" /> Seus dados estão protegidos</p>
        </div>
      </section>
    </main>
  )
}
