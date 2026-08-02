import { Icon } from '../utils'
export function LandingPage({ onEnter, onDocs, hasSavedCareer, onContinue }: { onEnter: () => void; onDocs: () => void; hasSavedCareer: boolean; onContinue: () => void }) {
  return <div className="landing-shell">
    <div className="landing-orbs">
      <div className="landing-orb" />
      <div className="landing-orb" />
      <div className="landing-orb" />
    </div>
    <nav className="landing-nav">
      <div className="landing-logo">
        <div className="landing-logo-icon">NS</div>
        <div className="landing-logo-text">NORTHSTAR<span> FC</span></div>
      </div>
      <div className="landing-nav-links">
        <button onClick={onDocs}>Features</button>
        <button onClick={onDocs}>About</button>
        {hasSavedCareer ? (
          <button className="primary-pill" onClick={onContinue}>CONTINUE CAREER</button>
        ) : (
          <button className="primary-pill" onClick={onEnter}>NEW CAREER</button>
        )}
      </div>
    </nav>
    <main className="landing-hero">
      <div className="eyebrow"><i /> NORTHSTAR FC · CAREER MODE</div>
      <h1>BUILD YOUR<br /><span>LEGACY</span></h1>
      <p>Take control as a manager or player. Navigate transfers, tactics, training, and matchdays in a living, breathing football world.</p>
      <div className="landing-ctas">
        {hasSavedCareer ? (
          <button className="btn-primary" onClick={onContinue}>CONTINUE CAREER <Icon>→</Icon></button>
        ) : (
          <button className="btn-primary" onClick={onEnter}>NEW CAREER <Icon>→</Icon></button>
        )}
        <button className="btn-secondary" onClick={onDocs}>VIEW FEATURES</button>
      </div>
    </main>
    <div className="landing-features">
      <div className="landing-feature">
        <div className="feat-icon">⚑</div>
        <h3>Manager Mode</h3>
        <p>Full tactical control, transfer negotiations, squad management, and live match simulation.</p>
      </div>
      <div className="landing-feature">
        <div className="feat-icon">★</div>
        <h3>Player Career</h3>
        <p>Train, develop, negotiate contracts, and perform on the pitch. Your choices shape your path.</p>
      </div>
      <div className="landing-feature">
        <div className="feat-icon">↔</div>
        <h3>Transfer Hub</h3>
        <p>Scout talent, negotiate deals, and manage your shortlist with real-time feedback from agents.</p>
      </div>
    </div>
  </div>
}

export function DocsPage({ onBack }: { onBack: () => void }) {
  return <div className="docs-shell"><nav className="docs-nav"><button onClick={onBack}><Icon>←</Icon> Back</button></nav><div className="docs-content">    <h1>Northstar FC Career Mode</h1><p>A full-featured football career simulation built for the web. Manage your club or control a single player through a living, breathing football world.</p><h2>Features</h2><ul><li><b>Manager Career:</b> Tactics editor, squad rotation, contract management, live match simulation with tactical influence.</li><li><b>Player Career:</b> Training progress, form tracking, transfer approaches, matchday decision-making.</li><li><b>Transfer Hub:</b> Market scouting, agent negotiations, shortlist management, detailed player profiles.</li><li><b>Dynamic Ratings:</b> Player OVR fluctuates based on performance, form, and recent results.</li><li><b>Calendar & Fixtures:</b> Full 38-week season with fixture tracking and result history.</li><li><b>Team Management:</b> Formation editor, substitution system, tactics assignments.</li></ul><h2>Getting Started</h2><p>Choose <b>Manager</b> or <b>Player</b> career mode. Select a club from three offers tailored to your preferences. The game auto-saves after every action.</p><h2>Tech Stack</h2><p>Built with React, TypeScript, and Vite. All data stored locally in your browser. No servers, no accounts — just football.</p></div></div>
}

