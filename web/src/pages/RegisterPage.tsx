import { type FormEvent, type ReactNode, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api'
import { auth } from '@/lib/auth'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const navigate = useNavigate()

  if (auth.isAuthenticated()) return <Navigate to="/appointments" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: ['As senhas não coincidem.'] })
      return
    }

    setLoading(true)
    try {
      await api('/user', { method: 'POST', body: JSON.stringify({ name, email, password }) })
      navigate('/login', { replace: true, state: { success: 'Conta criada. Agora você pode entrar.' } })
    } catch (exception) {
      if (exception instanceof ApiError) setErrors(Object.keys(exception.errors).length ? exception.errors : { general: [exception.message] })
      else setErrors({ general: ['Não foi possível conectar à API.'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Criar uma conta" description="Preencha seus dados para começar." footerText="Já tem uma conta?" footerLink="/login" footerLabel="Entrar">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.general[0]}</div>}
        <Field label="Nome" id="name" error={errors.name?.[0]}><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" autoComplete="name" required /></Field>
        <Field label="E-mail" id="register-email" error={errors.email?.[0]}><Input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@clinica.com" autoComplete="email" required /></Field>
        <Field label="Senha" id="register-password" error={errors.password?.[0]}><Input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" minLength={6} required /></Field>
        <Field label="Confirmar senha" id="password-confirmation" error={errors.password_confirmation?.[0]}><Input id="password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Digite a senha novamente" autoComplete="new-password" minLength={6} required /></Field>
        <Button variant="yellow" className="w-full" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</Button>
      </form>
    </AuthLayout>
  )
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error && <p className="text-xs text-red-600">{error}</p>}</div>
}
