import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { CareerMode, Position, CareerProfile, ClubOffer, OnboardingSave } from '../types'
import { formatMoney, createLegacyClubOffer, Icon } from '../utils'

export function ClubOffersView({ onboarding, onAccept }: { onboarding: OnboardingSave; onAccept: (offer: ClubOffer) => void }) {
  return (
    <div className="center-shell">
      <header className="brand-row" style={{ position: 'absolute', top: 'var(--s-7)', left: 0, right: 0, padding: '0 var(--s-7)' }}>
        <div className="brand-mark">NS</div>
        <div><b>NORTHSTAR FC</b><small className="kicker" style={{ display: 'block' }}>Career mode</small></div>
      </header>
      <main className="center-card" style={{ maxWidth: 980 }}>
        <div>
          <span className="pill live" style={{ marginBottom: 'var(--s-3)' }}><i /> Club offers</span>
          <span className="kicker" style={{ display: 'block' }}>Season 01 · Your first appointment</span>
          <h1>Choose your club</h1>
          <p className="muted" style={{ lineHeight: 1.6 }}>{onboarding.name}, three clubs have submitted offers for your appointment. Review each one before deciding.</p>
        </div>
        <div className="offer-grid">
          {onboarding.offers.map((offer, index) => (
            <article
              className="offer"
              key={offer.id}
              style={{ '--offer-primary': offer.primaryColor, '--offer-secondary': offer.secondaryColor } as CSSProperties}
            >
              <div className="offer-head">
                <span className="kicker">0{index + 1}</span>
                <span className="kicker">{offer.league}</span>
              </div>
              <div className="offer-crest" style={{ background: `linear-gradient(135deg, ${offer.primaryColor}, ${offer.secondaryColor})` }}>{offer.clubShort}</div>
              <div className="offer-body">
                <span className="kicker">{offer.identity}</span>
                <h2>{offer.clubName}</h2>
                <p className="desc">{offer.description}</p>
                <div className="offer-meta">
                  <div><span>Style</span><b>{offer.philosophy}</b></div>
                  <div><span>{onboarding.mode === 'manager' ? 'Budget' : 'Pathway'}</span><b>{onboarding.mode === 'manager' ? formatMoney(offer.managerBudget) : offer.playerRole}</b></div>
                </div>
                <div className="offer-tradeoffs">
                  <div><b>Advantages</b>{offer.pros.map((item) => <span key={item}>+ {item}</span>)}</div>
                  <div><b>Trade-offs</b>{offer.cons.map((item) => <span key={item}>− {item}</span>)}</div>
                </div>
              </div>
              <div className="offer-foot">
                <button className="btn btn-primary btn-block" onClick={() => onAccept(offer)}>
                  {onboarding.acceptedOffer?.id === offer.id ? 'Continue with this club' : `Accept ${offer.clubName}`} <Icon>→</Icon>
                </button>
              </div>
            </article>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-7)', fontSize: 'var(--t-xs)' }} className="muted">
          <span>Offers are locked to this career and saved locally.</span>
          <span>{onboarding.mode === 'manager' ? 'Manager appointment' : 'Player contract'} · Season 1</span>
        </div>
      </main>
    </div>
  )
}

export function IntroductionView({ profile, offer, onContinue }: { profile: CareerProfile; offer: ClubOffer | null; onContinue: () => void }) {
  const acceptedOffer = offer ?? createLegacyClubOffer(profile)
  const isManager = profile.mode === 'manager'
  return (
    <div className="center-shell">
      <header className="brand-row" style={{ position: 'absolute', top: 'var(--s-7)', left: 0, right: 0, padding: '0 var(--s-7)' }}>
        <div className="brand-mark">NS</div>
        <div><b>NORTHSTAR FC</b><small className="kicker" style={{ display: 'block' }}>Career mode</small></div>
      </header>
      <main className="center-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-5)', padding: 'var(--s-2) 0', borderBottom: '1px solid var(--line)', marginBottom: 'var(--s-7)' }}>
          <span className="kicker">Season 01 · Week 01 · {acceptedOffer.league.toUpperCase()}</span>
        </div>
        <div>
          <span className="pill live" style={{ marginBottom: 'var(--s-3)' }}><i /> Appointment confirmed</span>
          <span className="kicker" style={{ display: 'block', marginTop: 'var(--s-3)' }}>The opening briefing</span>
          <h1>{acceptedOffer.clubName}</h1>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            {isManager
              ? `You are now the manager of ${acceptedOffer.clubName}. Board mandate: ${acceptedOffer.pros[0] ?? 'Establish an identity'}.`
              : `Contract signed at ${acceptedOffer.clubName}. Role: ${acceptedOffer.playerRole}.`}
          </p>
        </div>
        <div className="intro-grid">
          <div
            className="intro-card"
            style={{ background: `linear-gradient(135deg, ${acceptedOffer.primaryColor}, ${acceptedOffer.secondaryColor})` }}
          >
            <span className="brand-mark" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>{acceptedOffer.clubShort}</span>
            <div>
              <b>{acceptedOffer.clubName}</b>
              <small style={{ opacity: 0.85 }}>{acceptedOffer.identity} · {acceptedOffer.philosophy}</small>
            </div>
          </div>
          <div className="intro-brief">
            <span className="kicker">{isManager ? 'Summary' : 'Summary'}</span>
            <b>{isManager ? `Budget ${formatMoney(acceptedOffer.managerBudget)} · Trust ${acceptedOffer.managerTrust}%` : `Wage ${formatMoney(acceptedOffer.playerWage)}/wk · Training ${acceptedOffer.playerTraining}`}</b>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'var(--s-2)' }}>
              <span className="pill good">{acceptedOffer.pros[0]}</span>
              <span className="pill warn">{acceptedOffer.cons[0]}</span>
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--s-6)', width: '100%' }} onClick={onContinue}>
          Enter {acceptedOffer.clubName} <Icon>→</Icon>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-5)', fontSize: 'var(--t-xs)' }} className="muted">
          <span>Season 1 · Week 1 · Day 1</span>
          <span>Career state saves automatically</span>
        </div>
      </main>
    </div>
  )
}

export function SetupView({ onComplete }: { onComplete: (onboarding: OnboardingSave) => void }) {
  const [mode, setMode] = useState<CareerMode>('manager')
  const [name, setName] = useState('Jules Park')
  const [league, setLeague] = useState('Premier Division')
  const [difficulty, setDifficulty] = useState('Authentic')
  const [playerPosition, setPlayerPosition] = useState<Position>('AM')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onComplete({ mode, name: name.trim() || 'Jules Park', leaguePreference: league, difficulty, playerPosition, offers: [] })
  }

  return (
    <div className="center-shell">
      <header className="brand-row" style={{ position: 'absolute', top: 'var(--s-7)', left: 0, right: 0, padding: '0 var(--s-7)' }}>
        <div className="brand-mark">NS</div>
        <div><b>NORTHSTAR FC</b><small className="kicker" style={{ display: 'block' }}>Career mode</small></div>
      </header>
      <main className="center-card">
        <div>
          <span className="pill live" style={{ marginBottom: 'var(--s-3)' }}><i /> New career</span>
          <span className="kicker" style={{ display: 'block', marginTop: 'var(--s-3)' }}>Season 01 · Fresh appointment</span>
          <h1>Start your career</h1>
          <p className="muted" style={{ lineHeight: 1.6 }}>Choose your path, name, and starting conditions. Every decision shapes your story.</p>
        </div>
        <form onSubmit={submit}>
          <div className="fields-grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Career mode</span>
              <div className="mode-grid">
                <button type="button" className={`mode-card${mode === 'manager' ? ' active' : ''}`} onClick={() => setMode('manager')}>
                  <span className="mode-card-icon">⚑</span>
                  <span><b>Manager career</b><small className="muted">Lead the club from the touchline</small></span>
                </button>
                <button type="button" className={`mode-card${mode === 'player' ? ' active' : ''}`} onClick={() => setMode('player')}>
                  <span className="mode-card-icon">★</span>
                  <span><b>Player career</b><small className="muted">Control your own destiny</small></span>
                </button>
              </div>
            </div>
            <div className="field">
              <span>Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" maxLength={40} />
            </div>
            <div className="field">
              <span>Preferred league</span>
              <select value={league} onChange={(e) => setLeague(e.target.value)}>
                <option>Premier Division</option>
                <option>Continental League</option>
                <option>Coastal Championship</option>
                <option>Alpine League</option>
              </select>
            </div>
            <div className="field">
              <span>Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Authentic</option>
                <option>Challenging</option>
                <option>Standard</option>
              </select>
            </div>
            <div className="field">
              <span>Player position</span>
              <select value={playerPosition} onChange={(e) => setPlayerPosition(e.target.value as Position)}>
                {(mode === 'player' ? ['AM', 'ST', 'LW', 'RW', 'CM', 'DM', 'CB', 'LB', 'RB', 'GK'] : ['AM', 'ST', 'LW', 'RW', 'CM', 'CB']).map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-3)', marginTop: 'var(--s-5)', padding: 'var(--s-4) 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div>
              <small className="kicker">Club style</small>
              <b style={{ display: 'block', fontSize: 'var(--t-md)' }}>Generated from league selection</b>
            </div>
            <div style={{ width: 44, height: 28, borderRadius: 'var(--r-xs)', background: 'linear-gradient(135deg, #0ea5e9, #1f8a5f)', color: '#fff', fontWeight: 800, fontSize: 10, display: 'grid', placeItems: 'center' }}>NS</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 'var(--s-5)' }}>
            Generate club offers <Icon>→</Icon>
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-5)', fontSize: 'var(--t-xs)' }} className="muted">
          <span>All progress saves automatically</span>
          <span>Season 1 · Aug 2026</span>
        </div>
      </main>
    </div>
  )
}
