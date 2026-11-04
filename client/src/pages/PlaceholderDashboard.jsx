import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PlaceholderDashboard({ role }) {
  const { user, logout } = useAuth()

  return (
    <div className="page auth-page">
      <header className="topbar">
        <Link className="brand" to="/">
          QuickCare
        </Link>
        <div className="topbar-actions">
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="auth-card">
        <h1>{role === 'donor' ? 'Donor' : 'Seeker'} dashboard</h1>
        <p className="auth-lead">
          Signed in as {user?.name}. Profile and match screens come next.
        </p>
        <Link className="btn btn-secondary" to="/">
          Back to home
        </Link>
      </main>
    </div>
  )
}
