import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import LocationSearch from '../components/LocationSearch'
import { useAuth } from '../context/AuthContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY = ['normal', 'urgent', 'critical']

const emptyRequest = {
  bloodGroup: 'O+',
  unitsNeeded: 1,
  hospitalName: '',
  locationText: '',
  urgency: 'urgent',
  latitude: null,
  longitude: null,
}

export default function SeekerDashboard() {
  const { user, token, logout } = useAuth()
  const [form, setForm] = useState(emptyRequest)
  const [myRequests, setMyRequests] = useState([])
  const [searchGroup, setSearchGroup] = useState('O+')
  const [searchCity, setSearchCity] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function loadMine() {
    const data = await api.getMyRequests(token)
    setMyRequests(data.requests || [])
  }

  useEffect(() => {
    let cancelled = false
    async function boot() {
      setLoading(true)
      setError('')
      try {
        await loadMine()
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load requests')
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

  function onChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function onCreate(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.createRequest(token, {
        bloodGroup: form.bloodGroup,
        unitsNeeded: Number(form.unitsNeeded),
        hospitalName: form.hospitalName.trim(),
        locationText: form.locationText.trim(),
        urgency: form.urgency,
        latitude: form.latitude,
        longitude: form.longitude,
      })
      setMessage('Blood request created.')
      setForm(emptyRequest)
      await loadMine()
    } catch (err) {
      setError(err.message || 'Could not create request')
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus(id, status) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.patchRequest(token, id, { status })
      setMessage(`Request marked ${status}.`)
      await loadMine()
    } catch (err) {
      setError(err.message || 'Could not update request')
    } finally {
      setBusy(false)
    }
  }

  async function onSearch(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSelectedDonor(null)
    try {
      const data = await api.matchDonors(token, {
        bloodGroup: searchGroup,
        city: searchCity.trim() || undefined,
      })
      setMatches(data.donors || [])
      if (!data.donors?.length) {
        setMessage('No compatible available donors found.')
      } else {
        setMessage(`${data.donors.length} compatible donor(s) found.`)
      }
    } catch (err) {
      setError(err.message || 'Search failed')
    } finally {
      setBusy(false)
    }
  }

  async function openDonor(id) {
    setBusy(true)
    setError('')
    try {
      const data = await api.getDonor(token, id)
      setSelectedDonor(data.donor)
    } catch (err) {
      setError(err.message || 'Could not load donor contact')
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
          <span className="user-chip">{user?.name}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dash-layout dash-layout-3">
        <section className="dash-panel">
          <h1>Create request</h1>
          <p className="auth-lead">Post an urgent need by blood group and hospital.</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-success" role="status">{message}</p> : null}

          <form className="auth-form" onSubmit={onCreate}>
            <label>
              Blood group needed
              <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} required>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Units needed
              <input
                name="unitsNeeded"
                type="number"
                min="1"
                max="20"
                value={form.unitsNeeded}
                onChange={onChange}
                required
              />
            </label>
            <div>
              <p className="field-label">Find hospital / area</p>
              <LocationSearch
                placeholder="Search hospital or area"
                onSelect={(place) => {
                  setForm((prev) => ({
                    ...prev,
                    hospitalName: prev.hospitalName || place.displayName.split(',')[0],
                    locationText: place.displayName,
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }))
                }}
              />
            </div>
            <label>
              Hospital
              <input
                name="hospitalName"
                type="text"
                value={form.hospitalName}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Location
              <input
                name="locationText"
                type="text"
                value={form.locationText}
                onChange={onChange}
                required
              />
            </label>
            {form.latitude != null && form.longitude != null ? (
              <p className="auth-lead">
                Coords: {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
              </p>
            ) : null}
            <label>
              Urgency
              <select name="urgency" value={form.urgency} onChange={onChange}>
                {URGENCY.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Submit request'}
            </button>
          </form>
        </section>

        <section className="dash-panel">
          <h2>My requests</h2>
          {loading ? <p>Loading…</p> : null}
          {!loading && myRequests.length === 0 ? (
            <p className="auth-lead">No requests yet.</p>
          ) : (
            <ul className="match-list">
              {myRequests.map((req) => (
                <li key={req.id} className="match-item match-item-stack">
                  <div>
                    <strong>
                      {req.bloodGroup} · {req.unitsNeeded}u · {req.status}
                    </strong>
                    <p>
                      {req.hospitalName} — {req.locationText}
                    </p>
                  </div>
                  <div className="cta-row">
                    <span className={`urgency urgency-${req.urgency}`}>{req.urgency}</span>
                    {req.status === 'open' ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={busy}
                          onClick={() => updateStatus(req.id, 'fulfilled')}
                        >
                          Fulfilled
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => updateStatus(req.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-panel">
          <h2>Find donors</h2>
          <form className="auth-form" onSubmit={onSearch}>
            <label>
              Needed group
              <select value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)}>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              City (optional)
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Lahore"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Search compatible donors
            </button>
          </form>

          {matches.length === 0 ? (
            <p className="auth-lead">
              {busy ? 'Searching…' : 'No donors shown yet — run a search above.'}
            </p>
          ) : (
            <ul className="match-list">
              {matches.map((donor) => (
                <li key={donor.id} className="match-item">
                  <div>
                    <strong>
                      {donor.user?.name || 'Donor'} · {donor.bloodGroup}
                    </strong>
                    <p>
                      {donor.city}
                      {donor.addressText ? ` — ${donor.addressText}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => openDonor(donor.id)}
                  >
                    Contact
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedDonor ? (
            <div className="contact-box">
              <h3>Donor contact</h3>
              <p>
                <strong>{selectedDonor.user?.name}</strong> ({selectedDonor.bloodGroup})
              </p>
              <p>{selectedDonor.city}</p>
              <p>Email: {selectedDonor.user?.email || '—'}</p>
              <p>Phone: {selectedDonor.user?.phone || '—'}</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
