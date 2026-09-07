import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/auth'

export function Login() {
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      const user = await login(email, password)
      toast.success('Welcome back!')
      navigate(user.role === 'admin' ? '/admin' : location.state?.from?.pathname || '/')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="container-narrow py-20">
      <div className="mx-auto max-w-sm">
        <p className="eyebrow text-center">Welcome Back</p>
        <h1 className="section-title mt-2 text-center">Sign In</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input required type="email" className="input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Don't have an account? <Link to="/register" className="font-semibold text-clay">Create one</Link>
        </p>
      </div>
    </div>
  )
}
