import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/auth'

export function Register() {
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="container-narrow py-20">
      <div className="mx-auto max-w-sm">
        <p className="eyebrow text-center">Join Us</p>
        <h1 className="section-title mt-2 text-center">Create Account</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input required className="input" placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input required type="email" className="input" placeholder="Email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input required type="password" className="input" placeholder="Password (min. 8 characters)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <input required type="password" className="input" placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account? <Link to="/login" className="font-semibold text-clay">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
