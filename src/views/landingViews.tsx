import { Icon } from '../utils'

export function LandingPage({ onEnter, onDocs, hasSavedCareer, onContinue }: { onEnter: () => void; onDocs: () => void; hasSavedCareer: boolean; onContinue: () => void }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <button className="kicker" onClick={onDocs} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--r-sm)' }}>About</button>
        <div className="landing-nav-right">
          {hasSavedCareer ? (
            <button className="btn btn-primary" onClick={onContinue}>Continue career <Icon>→</Icon></button>
          ) : (
            <button className="btn btn-primary" onClick={onEnter}>New career <Icon>→</Icon></button>
          )}
        </div>
      </nav>
      <main className="landing-main">
        <span className="landing-kicker"><i /> Northstar FC · Career mode</span>
        <h1>
          Build your<br /><span className="accent">legacy.</span>
        </h1>
        <p>Take control as a manager or player. Navigate transfers, tactics, training, and matchdays in a living, breathing football world.</p>
        <div className="landing-cta">
          {hasSavedCareer ? (
            <button className="btn btn-primary btn-lg" onClick={onContinue}>Continue career <Icon>→</Icon></button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onEnter}>New career <Icon>→</Icon></button>
          )}
          <button className="btn btn-ghost btn-lg" onClick={onDocs}>Learn more</button>
        </div>
      </main>
    </div>
  )
}

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
