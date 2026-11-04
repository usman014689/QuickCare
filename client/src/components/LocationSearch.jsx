import { useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LocationSearch({ onSelect, placeholder = 'Search place or hospital' }) {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)

  async function onSearch(event) {
    event.preventDefault()
    setError('')
    setSearching(true)
    try {
      const data = await api.searchGeo(token, query.trim())
      setResults(data.results || [])
      if (!data.results?.length) setError('No places found')
    } catch (err) {
      setError(err.message || 'Geocoding failed')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="location-search">
      <form className="location-search-row" onSubmit={onSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          minLength={2}
          required
        />
        <button type="submit" className="btn btn-secondary" disabled={searching}>
          {searching ? '…' : 'Find'}
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
      {results.length > 0 ? (
        <ul className="location-results">
          {results.map((item) => (
            <li key={`${item.latitude}-${item.longitude}-${item.displayName}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item)
                  setResults([])
                  setQuery(item.displayName)
                }}
              >
                {item.displayName}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
