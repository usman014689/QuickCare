import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import LocationSearch from '../components/LocationSearch'
import { useAuth } from '../context/AuthContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const emptyForm = {
  bloodGroup: 'O+',
  city: '',
  addressText: '',
  notes: '',
  isAvailable: true,
  latitude: null,
  longitude: null,
}

export default function DonorDashboard() {
  const { user, token, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        let donor = null
        try {
          const data = await api.getMyDonor(token)
          donor = data.donor
        } catch (err) {
          if (err.status !== 404) throw err
        }

        if (cancelled) return

        if (donor) {
          setProfile(donor)
          setForm({
            bloodGroup: donor.bloodGroup,
            city: donor.city || '',
            addressText: donor.addressText || '',
            notes: donor.notes || '',
            isAvailable: donor.isAvailable,
            latitude: donor.latitude ?? null,
            longitude: donor.longitude ?? null,
          })
          const match = await api.matchRequests(token)
          if (!cancelled) setRequests(match.requests || [])
        } else {
          setProfile(null)
          setRequests([])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load donor dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token])

  function onChange(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function onSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        bloodGroup: form.bloodGroup,
        city: form.city.trim(),
        addressText: form.addressText.trim(),
        notes: form.notes.trim(),
        isAvailable: form.isAvailable,
        latitude: form.latitude,
        longitude: form.longitude,
      }

      const data = profile
        ? await api.updateDonor(token, profile.id, payload)
        : await api.createDonor(token, payload)

      setProfile(data.donor)
      setMessage(profile ? 'Profile updated.' : 'Profile created.')
      const match = await api.matchRequests(token)
      setRequests(match.requests || [])
    } catch (err) {
      setError(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailability() {
    if (!profile) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const next = !profile.isAvailable
      const data = await api.patchDonorAvailability(token, profile.id, next)
      setProfile(data.donor)
      setForm((prev) => ({ ...prev, isAvailable: data.donor.isAvailable }))
      setMessage(next ? 'You are marked available.' : 'You are marked unavailable.')
    } catch (err) {
      setError(err.message || 'Could not update availability')
    } finally {
      setSaving(false)
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

      <main className="dash-layout">
        <section className="dash-panel">
          <h1>Donor profile</h1>
          <p className="auth-lead">
            Set your blood group and city so seekers can match with you.
          </p>

          {loading ? <p>Loading…</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-success" role="status">{message}</p> : null}

          {!loading ? (
            <form className="auth-form" onSubmit={onSave}>
              <label>
                Blood group
                <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} required>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="field-label">Find location</p>
                <LocationSearch
                  placeholder="Search city or area"
                  onSelect={(place) => {
                    setForm((prev) => ({
                      ...prev,
                      city: place.city || prev.city || place.displayName.split(',')[0],
                      addressText: place.displayName,
                      latitude: place.latitude,
                      longitude: place.longitude,
                    }))
                  }}
                />
              </div>
              <label>
                City
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={onChange}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Area / address
                <input
                  name="addressText"
                  type="text"
                  value={form.addressText}
                  onChange={onChange}
                  maxLength={250}
                />
              </label>
              {form.latitude != null && form.longitude != null ? (
                <p className="auth-lead">
                  Coords: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              ) : null}
              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  rows={3}
                  maxLength={500}
                />
              </label>
              <label className="role-option">
                <input
                  name="isAvailable"
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={onChange}
                />
                Available to donate
              </label>

              <div className="cta-row">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : profile ? 'Update profile' : 'Create profile'}
                </button>
                {profile ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={toggleAvailability}
                    disabled={saving}
                  >
                    {profile.isAvailable ? 'Go unavailable' : 'Go available'}
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}
        </section>

        <section className="dash-panel">
          <h2>Open requests you can help</h2>
          {!profile ? (
            <p className="auth-lead">Create your profile to see compatible blood requests.</p>
          ) : requests.length === 0 ? (
            <p className="auth-lead">No open compatible requests right now.</p>
          ) : (
            <ul className="match-list">
              {requests.map((req) => (
                <li key={req.id} className="match-item">
                  <div>
                    <strong>
                      {req.bloodGroup} · {req.unitsNeeded} unit{req.unitsNeeded === 1 ? '' : 's'}
                    </strong>
                    <p>
                      {req.hospitalName} — {req.locationText}
                    </p>
                  </div>
                  <span className={`urgency urgency-${req.urgency}`}>{req.urgency}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
