import './App.css'

function App() {
  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="/">
          QuickCare
        </a>
        <div className="topbar-actions">
          <button type="button" className="btn btn-ghost" disabled title="Coming in Phase 3">
            Log in
          </button>
          <button type="button" className="btn btn-primary" disabled title="Coming in Phase 3">
            Get started
          </button>
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
            <button type="button" className="btn btn-primary" disabled title="Coming in Phase 3">
              I can donate
            </button>
            <button type="button" className="btn btn-secondary" disabled title="Coming in Phase 3">
              I need blood
            </button>
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

export default App
