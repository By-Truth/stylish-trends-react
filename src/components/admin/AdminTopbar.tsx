import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'

export function AdminTopbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper px-5">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenu} aria-label="Toggle menu">
          ☰
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">{title}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-ink-soft sm:inline">{user?.name}</span>
        <button
          onClick={async () => {
            await logout()
            navigate('/admin/login')
          }}
          className="text-xs font-semibold uppercase tracking-wider text-clay hover:text-clay-dark"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
