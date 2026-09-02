import { Eye, EyeOff } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
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

  const success = (location.state as { success?: string } | null)?.success

  return (
    <AuthLayout title="Acesse sua conta" description="Digite seu e-mail e sua senha." footerText="Ainda não tem uma conta?" footerLink="/register" footerLabel="Criar conta">
      <form onSubmit={handleSubmit} className="space-y-5">
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@clinica.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" className="pr-12" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-black/40 hover:bg-black/5" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
        </div>
        <Button variant="yellow" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
      </form>
    </AuthLayout>
  )
}
