import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialRole = useMemo(() => {
    const role = params.get('role')
    return role === 'seeker' ? 'seeker' : 'donor'
  }, [params])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initialRole)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await register({ name, email, phone, password, role })
      navigate(user.role === 'donor' ? '/donor' : '/seeker')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <header className="topbar">
        <Link className="brand" to="/">
          QuickCare
        </Link>
      </header>

      <main className="auth-card">
        <h1>Create account</h1>
        <p className="auth-lead">Join as a donor volunteer or as someone seeking blood.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional for now"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <fieldset className="role-fieldset">
            <legend>I am a</legend>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="donor"
                checked={role === 'donor'}
                onChange={() => setRole('donor')}
              />
              Donor
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="seeker"
                checked={role === 'seeker'}
                onChange={() => setRole('seeker')}
              />
              Seeker
            </label>
          </fieldset>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </main>
    </div>
  )
}
