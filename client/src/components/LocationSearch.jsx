import { useRef, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LocationSearch({ onSelect, placeholder = 'Search place or hospital' }) {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('')
  const [searching, setSearching] = useState(false)
  const searchId = useRef(0)

  async function findPlaces() {
    const term = query.trim()
    if (!token || term.length < 2 || searching) return

    const id = ++searchId.current
    setSearching(true)
    setResults([])
    setStatus('Searching for places…')
    try {
      const data = await api.searchGeo(token, term)
      if (id !== searchId.current) return
      const places = data.results || []
      setResults(places)
      setStatus(places.length ? '' : 'No matching places found. Try adding a city.')
    } catch {
      if (id === searchId.current) {
        setStatus('Location search unavailable. Try again or enter the location manually.')
      }
    } finally {
      if (id === searchId.current) setSearching(false)
    }
  }

  return (
    <div className="location-search">
      <div className="location-search-row">
        <input
          type="search"
          aria-label={placeholder}
          placeholder={placeholder}
          autoComplete="off"
          maxLength={200}
          value={query}
          onChange={(event) => {
            searchId.current += 1
            setQuery(event.target.value)
            setSearching(false)
            setResults([])
            setStatus('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              findPlaces()
            }
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={findPlaces}
          disabled={!token || query.trim().length < 2 || searching}
        >
          {searching ? 'Finding…' : 'Find'}
        </button>
      </div>
      <p role="status">{status}</p>
      {results.length > 0 && (
        <>
          <ul className="location-results" aria-label="Matching places">
            {results.map((item) => (
              <li key={`${item.latitude}-${item.longitude}-${item.displayName}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item)
                    setQuery(item.displayName)
                    setResults([])
                  }}
                >
                  {item.displayName}
                </button>
              </li>
            ))}
          </ul>
          <small>Place data © OpenStreetMap contributors</small>
        </>
      )}
    </div>
  )
}
