import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/auth'

export function AdminLogin() {
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      const user = await login(email, password)
      if (user.role !== 'admin') {
        toast.error('This account does not have admin access')
        return
      }
      navigate('/admin')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm bg-paper p-8">
        <p className="font-display text-center text-2xl">Stylish Trends</p>
        <p className="eyebrow mt-1 text-center">Admin Panel</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input required type="email" className="input" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}
