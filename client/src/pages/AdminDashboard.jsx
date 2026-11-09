import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user, token, logout } = useAuth()
  const [overview, setOverview] = useState(null)
  const [donors, setDonors] = useState([])
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const [ov, donorData, requestData] = await Promise.all([
      api.adminOverview(token),
      api.adminDonors(token),
      api.adminRequests(token),
    ])
    setOverview(ov)
    setDonors(donorData.donors || [])
    setRequests(requestData.requests || [])
  }

  useEffect(() => {
    let cancelled = false
    async function boot() {
      setLoading(true)
      setError('')
      try {
        await refresh()
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load admin board')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function deactivate(id) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.adminDeactivateDonor(token, id)
      setMessage('Donor deactivated.')
      await refresh()
    } catch (err) {
      setError(err.message || 'Deactivate failed')
    } finally {
      setBusy(false)
    }
  }

  async function cancel(id) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.adminCancelRequest(token, id)
      setMessage('Request cancelled.')
      await refresh()
    } catch (err) {
      setError(err.message || 'Cancel failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page dash-page">
      <header className="topbar">
        <Link className="brand" to="/">
          QuickCare
        </Link>
        <div className="topbar-actions">
          <span className="user-chip">{user?.name} · admin</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dash-layout">
        <section className="dash-panel">
          <h1>Admin overview</h1>
          <p className="auth-lead">Moderate donors and blood requests.</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-success" role="status">{message}</p> : null}
          {loading ? <p className="auth-lead">Loading…</p> : null}

          {overview ? (
            <div className="stat-grid">
              <div className="stat-box">
                <strong>{overview.users}</strong>
                <span>Users</span>
              </div>
              <div className="stat-box">
                <strong>{overview.donors}</strong>
                <span>Donor profiles</span>
              </div>
              <div className="stat-box">
                <strong>{overview.requests.open}</strong>
                <span>Open requests</span>
              </div>
              <div className="stat-box">
                <strong>{overview.requests.fulfilled}</strong>
                <span>Fulfilled</span>
              </div>
            </div>
          ) : null}
        </section>

        <section className="dash-panel">
          <h2>Donors</h2>
          {loading ? (
            <p className="auth-lead">Loading donors…</p>
          ) : donors.length === 0 ? (
            <p className="auth-lead">No donors yet.</p>
          ) : (
            <ul className="match-list">
            {donors.map((d) => (
              <li key={d.id} className="match-item">
                <div>
                  <strong>
                    {d.user?.name || 'Donor'} · {d.bloodGroup}
                  </strong>
                  <p>
                    {d.city} · {d.isAvailable ? 'available' : 'unavailable'}
                  </p>
                  <p>{d.user?.email}</p>
                </div>
                {d.isAvailable ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => deactivate(d.id)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <span className="urgency urgency-normal">off</span>
                )}
              </li>
            ))}
          </ul>
          )}
        </section>

        <section className="dash-panel dash-span">
          <h2>Requests</h2>
          {loading ? (
            <p className="auth-lead">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="auth-lead">No requests yet.</p>
          ) : (
            <ul className="match-list">
            {requests.map((r) => (
              <li key={r.id} className="match-item">
                <div>
                  <strong>
                    {r.bloodGroup} · {r.status} · {r.urgency}
                  </strong>
                  <p>
                    {r.hospitalName} — {r.locationText}
                  </p>
                  <p>{r.seeker?.name} · {r.seeker?.email}</p>
                </div>
                {r.status === 'open' ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => cancel(r.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <span className={`urgency urgency-${r.urgency}`}>{r.status}</span>
                )}
              </li>
            ))}
          </ul>
          )}
        </section>
      </main>
    </div>
  )
}
