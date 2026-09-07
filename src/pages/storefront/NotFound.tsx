import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="container-narrow py-24 text-center">
      <p className="font-display text-6xl">404</p>
      <p className="mt-3 text-ink-soft">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back Home</Link>
    </div>
  )
}
