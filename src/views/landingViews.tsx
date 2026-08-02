import { Icon } from '../utils'
export function LandingPage({ onEnter, onDocs, hasSavedCareer, onContinue }: { onEnter: () => void; onDocs: () => void; hasSavedCareer: boolean; onContinue: () => void }) {
  return <div className="landing-shell">
    <div className="landing-orbs">
      <div className="landing-orb" />
      <div className="landing-orb" />
      <div className="landing-orb" />
    </div>
    <nav className="landing-nav">
      <div className="landing-nav-links">
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
        <button className="btn-secondary" onClick={onDocs}>LEARN MORE</button>
      </div>
    </main>
  </div>
}

export function DocsPage({ onBack }: { onBack: () => void }) {
  return <div className="docs-shell"><nav className="docs-nav"><button onClick={onBack}><Icon>←</Icon> Back</button></nav><div className="docs-content">
    <h1>About Northstar FC</h1>
    <p>Northstar FC is a deep football career simulation that puts you at the centre of the beautiful game. Choose your path and live every moment — from the training ground to the floodlit stadium.</p>

    <h2>The Experience</h2>
    <p>Every decision carries weight. Your tactical adjustments shift the balance of a match. Your transfer calls shape the squad for seasons to come. Your training sessions determine which players break through and which ones fade. There are no shortcuts — only the work, the results, and the legacy you leave behind.</p>

    <h2>Manager Career</h2>
    <p>Take the touchline. You control the formation, mentality, pressing intensity, defensive line, and attacking width. Make substitutions mid-match based on fatigue and form. Manage the budget, negotiate contracts, and build a squad that reflects your philosophy. Every fixture is a test — the league table doesn't lie.</p>

    <h2>Player Career</h2>
    <p>Start as a prospect and earn your place. Train daily to develop pace, shooting, passing, dribbling, and physical attributes. Perform on matchday to build trust with the manager and rivalry with opponents. When bigger clubs come calling, decide whether to stay loyal or chase glory elsewhere.</p>

    <h2>Transfer Market</h2>
    <p>Scout talent from across the leagues. Build a shortlist, file reports, and enter negotiations. Every prospect has strengths, weaknesses, and a price. Agents work the phones. Counter-offers shift the deal. The window waits for no one.</p>

    <h2>Built for the Web</h2>
    <p>Northstar FC runs entirely in your browser. No accounts, no servers, no subscriptions. Your career is saved locally and persists across sessions. Built with React, TypeScript, and Vite — fast, responsive, and ready whenever you are.</p>
  </div></div>
}

