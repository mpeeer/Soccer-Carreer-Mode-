import type { CSSProperties } from 'react'
import { Icon } from '../utils'

/* ──────────────────────────────────────────────────────────────
   NORTHSTAR FC — Landing page (flat · sharp · minimal)
   ────────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: '▦', title: 'Manager career', desc: 'Formations, mentality, substitutions, budgets and board pressure — run the club your way.' },
  { icon: '◎', title: 'Player career', desc: 'Train daily, perform on matchday and grow from prospect to star under the floodlights.' },
  { icon: '↔', title: 'Transfer market', desc: 'Scout talent, build a shortlist and negotiate deals that arrive with real storylines.' },
  { icon: '▲', title: 'Academy', desc: 'Develop youth prospects with individual pathways and promote them into the first team.' },
  { icon: '⚡', title: 'Live matchday', desc: 'An auto-advancing match clock with an event feed, player ratings and substitutions.' },
  { icon: '✦', title: 'Saves & sim clock', desc: 'Day/night cycle with adjustable speed. Your career persists automatically in the browser.' },
]

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ProductMock() {
  return (
    <div className="lp-art" aria-hidden="true">
      <div className="lp-art-top">
        <span className="lp-art-tab active">Hub</span>
        <span className="lp-art-tab">Squad</span>
        <span className="lp-art-tab">Market</span>
        <span className="lp-art-tab">Matchday</span>
      </div>
      <div className="lp-art-panel">
        <div className="lp-art-head">
          <span className="lp-art-label">Next match · Away</span>
          <span className="lp-art-badge">Medium test</span>
        </div>
        <div className="lp-art-match">
          <div className="lp-art-club">
            <span className="lp-art-crest" style={{ background: '#047857' }}>NS</span>
            <b>Northstar FC</b>
          </div>
          <div className="lp-art-score">2<span>–</span>1</div>
          <div className="lp-art-club">
            <b>Redhaven Utd</b>
            <span className="lp-art-crest" style={{ background: '#0e7490' }}>RU</span>
          </div>
        </div>
        <div className="lp-art-rows">
          <div className="lp-art-row"><span>Possession</span><div className="lp-art-bar"><i style={{ width: '62%' }} /></div><b>62%</b></div>
          <div className="lp-art-row"><span>Squad form</span><div className="lp-art-bar"><i style={{ width: '78%' }} /></div><b>78</b></div>
        </div>
        <div className="lp-art-foot">
          <span>68' · Riverside Ground</span>
          <span className="lp-art-live">LIVE</span>
        </div>
      </div>
    </div>
  )
}

export function LandingPage({ onEnter, onDocs, hasSavedCareer, onContinue, onNewCareer }: { onEnter: () => void; onDocs: () => void; hasSavedCareer: boolean; onContinue: () => void; onNewCareer: () => void }) {
  return (
    <div className="lp">
      {/* Flat top bar */}
      <header className="lp-topbar">
        <button className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <span className="lp-mark">NS</span>
          <span className="lp-brand-text">
            <b>NORTHSTAR FC</b>
            <small>CAREER MODE</small>
          </span>
        </button>
        <nav className="lp-links">
          <button className="lp-link" onClick={() => scrollToId('features')}>Features</button>
          <button className="lp-link" onClick={() => scrollToId('modes')}>Modes</button>
          <button className="lp-link" onClick={onDocs}>About</button>
        </nav>
        <div className="lp-nav-cta">
          {hasSavedCareer ? (
            <>
              <button className="btn btn-ghost" onClick={onNewCareer}>New career</button>
              <button className="btn btn-primary" onClick={onContinue}>Continue career <Icon>→</Icon></button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onEnter}>Start career <Icon>→</Icon></button>
          )}
        </div>
      </header>

      {/* Split hero */}
      <main className="lp-hero">
        <div>
          <span className="lp-kicker">Northstar FC · Career mode</span>
          <h1 className="lp-title">
            Build your <span className="lp-accent">legacy.</span>
          </h1>
          <p className="lp-sub">
            A deep football career simulation that puts you at the centre of the game. Manage a club or live a
            player's journey — transfers, tactics, training and matchdays in one living world.
          </p>
          <div className="lp-cta">
            {hasSavedCareer ? (
              <>
                <button className="btn btn-primary btn-lg" onClick={onContinue}>Continue career <Icon>→</Icon></button>
                <button className="btn btn-ghost btn-lg lp-ghost" onClick={onNewCareer}>Create new career</button>
              </>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={onEnter}>Start new career <Icon>→</Icon></button>
            )}
            <button className="btn btn-ghost btn-lg lp-ghost" onClick={onDocs}>How it works</button>
          </div>
          <div className="lp-stats">
            <div className="lp-stat"><b>2</b><span>Career modes</span></div>
            <div className="lp-stat"><b>38</b><span>Match season</span></div>
            <div className="lp-stat"><b>1</b><span>Living save file</span></div>
            <div className="lp-stat"><b>0</b><span>Servers required</span></div>
          </div>
        </div>
        <ProductMock />
      </main>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-section-head">
          <span className="lp-kicker">The experience</span>
          <h2>One game, two careers.</h2>
          <p>Every decision carries weight — on the touchline and on the pitch.</p>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <article className="lp-card" key={f.title}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="lp-section" id="modes">
        <div className="lp-section-head">
          <span className="lp-kicker">Choose your path</span>
          <h2>Manager or player.</h2>
          <p>Two ways to live the game — pick the role that fits how you play.</p>
        </div>
        <div className="lp-modes">
          <article className="lp-mode" style={{ '--mode-a': '#047857' } as CSSProperties}>
            <span className="lp-mode-tag">Manager</span>
            <h3>Take the touchline</h3>
            <p>Control formations, mentality and substitutions. Manage budgets, negotiate contracts and build a squad that reflects your philosophy.</p>
            <ul>
              <li>Live matchday simulation</li>
              <li>Transfer market &amp; academy</li>
              <li>Board objectives &amp; finances</li>
            </ul>
          </article>
          <article className="lp-mode" style={{ '--mode-a': '#0e7490' } as CSSProperties}>
            <span className="lp-mode-tag">Player</span>
            <h3>Earn your place</h3>
            <p>Train daily to develop pace, shooting and passing. Perform on matchday to build trust — and decide when the big clubs come calling.</p>
            <ul>
              <li>Five training disciplines</li>
              <li>Narrative matchday choices</li>
              <li>Rivalries &amp; manager trust</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Built for the web */}
      <div className="lp-strip">
        <p>Built for the web — no accounts, no servers, no subscriptions. Your career is saved locally and persists across sessions.</p>
        <div className="lp-strip-tech">
          <span>React</span>
          <span>TypeScript</span>
          <span>Vite</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-foot">
        <div className="lp-brand">
          <span className="lp-mark">NS</span>
          <span className="lp-brand-text">
            <b>NORTHSTAR FC</b>
            <small>CAREER MODE</small>
          </span>
        </div>
        <p>© 2026 Northstar FC · A fictional football career simulation. All clubs, players and competitions are fictional and separate from licensed properties.</p>
        <button className="btn btn-ghost btn-sm" onClick={onDocs}>Read the docs <Icon>→</Icon></button>
      </footer>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Docs — kept from the original experience
   ────────────────────────────────────────────────────────────── */
export function DocsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="docs-shell">
      <div className="docs">
        <button className="docs-back" onClick={onBack}><Icon>←</Icon> Back</button>
        <h1>About Northstar FC</h1>
        <p>Northstar FC is a deep football career simulation that puts you at the centre of the beautiful game. Choose your path and live every moment — from the training ground to the floodlit stadium.</p>

        <h2>The experience</h2>
        <p>Every decision carries weight. Your tactical adjustments shift the balance of a match. Your transfer calls shape the squad for seasons to come. Your training sessions determine which players break through and which ones fade.</p>

        <h2>Manager career</h2>
        <p>Take the touchline. You control the formation, mentality, pressing intensity, defensive line, and attacking width. Make substitutions mid-match based on fatigue and form. Manage the budget, negotiate contracts, and build a squad that reflects your philosophy.</p>

        <h2>Player career</h2>
        <p>Start as a prospect and earn your place. Train daily to develop pace, shooting, passing, dribbling, and physical attributes. Perform on matchday to build trust with the manager. When bigger clubs come calling, decide whether to stay or chase glory elsewhere.</p>

        <h2>Transfer market</h2>
        <p>Scout talent from across the leagues. Build a shortlist, file reports, and enter negotiations. Every prospect has strengths, weaknesses, and a price.</p>

        <h2>Built for the web</h2>
        <p>Northstar FC runs entirely in your browser. No accounts, no servers, no subscriptions. Your career is saved locally and persists across sessions. Built with React, TypeScript, and Vite.</p>
      </div>
    </div>
  )
}
