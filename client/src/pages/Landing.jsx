import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
      <header className="topbar">
        <Link className="brand" to="/">
          QuickCare
        </Link>
        <div className="topbar-actions">
          {user ? (
            <>
              <span className="user-chip">{user.name}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
              <Link className="btn btn-primary" to={user.role === 'donor' ? '/donor' : '/seeker'}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Log in
              </Link>
              <Link className="btn btn-primary" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="hero">
        <div className="hero-copy">
          <h1>Blood help, matched with care.</h1>
          <p>
            Donors volunteer by blood group and location. People in need find
            compatible volunteers and reach out when it matters.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/register?role=donor">
              I can donate
            </Link>
            <Link className="btn btn-secondary" to="/register?role=seeker">
              I need blood
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="pulse-ring" />
          <div className="pulse-ring delay" />
          <svg className="drop" viewBox="0 0 64 88" role="presentation">
            <path d="M32 4C32 4 8 34 8 52a24 24 0 0 0 48 0C56 34 32 4 32 4Z" />
          </svg>
          <p className="visual-caption">Match by blood group · Connect with donors</p>
        </div>
      </main>

      <p className="footer-note">B9IS130 coursework · MERN stack in progress</p>
    </div>
  )
}
