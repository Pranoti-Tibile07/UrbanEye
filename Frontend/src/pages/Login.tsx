import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Field, Input } from '../components/ui/Field'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-6 py-24">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-950">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue to UrbanEye.</p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Button type="submit" loading={submitting} full>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to UrbanEye?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  )
}
