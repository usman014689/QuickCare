  const results = response?.results || []
  const status = response?.error || (canSearch && !response
    ? 'Searching for places…'
    : response && results.length === 0 ? 'No matching places found.' : '')

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
            setLookup(null)
            setSelectedName('')
            setQuery(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault()
          }}
        />
      </div>
      <p role="status">{status}</p>
      {results.length > 0 && (
        <>
          <ul className="location-results" aria-label="Location suggestions">
            {results.map((item) => (
              <li key={`${item.latitude}-${item.longitude}-${item.displayName}`}>
                <button type="button" onClick={() => {
                  onSelect(item)
                  setSelectedName(item.displayName)
                  setQuery(item.displayName)
                  setLookup(null)
                }}>
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

