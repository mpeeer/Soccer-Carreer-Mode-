import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { CareerMode, Position, CareerProfile, ClubOffer, OnboardingSave } from '../types'
import { formatMoney, createLegacyClubOffer, Icon } from '../utils'

export function ClubOffersView({ onboarding, onAccept }: { onboarding: OnboardingSave; onAccept: (offer: ClubOffer) => void }) {
  const [selected, setSelected] = useState(0)
  const offers = onboarding.offers
  const current = offers[Math.min(selected, offers.length - 1)] ?? null
  const isManager = onboarding.mode === 'manager'
  return (
    <div className="center-shell">
      <header className="brand-row" style={{ position: 'absolute', top: 'var(--s-7)', left: 0, right: 0, padding: '0 var(--s-7)' }}>
        <div className="brand-mark">NS</div>
        <div><b>NORTHSTAR FC</b><small className="kicker" style={{ display: 'block' }}>Career mode</small></div>
      </header>

      <main className="co-shell">
        {/* Header */}
        <div className="co-head">
          <div>
            <span className="co-tag"><i /> Club offers</span>
            <span className="co-kicker">Season 01 · Your first appointment</span>
            <h1 className="co-title">Choose your club</h1>
            <p className="co-sub">{onboarding.name}, three clubs have submitted offers for your appointment. Review each one before deciding.</p>
          </div>
          <div className="co-progress" aria-hidden="true">
            <b className="mono">{offers.length > 0 ? String((selected % offers.length) + 1).padStart(2, '0') : '00'}</b>
            <span>/ {String(offers.length).padStart(2, '0')}</span>
          </div>
        </div>

        {!current ? (
          <div className="co-empty">
            <span className="co-kicker">No offers yet</span>
            <p className="muted">Club offers will appear here shortly.</p>
          </div>
        ) : (
          <div className="co-body">
            {/* Left rail — selectable club list */}
            <div className="co-list" role="tablist" aria-label="Club offers">
              {offers.map((offer, i) => (
                <button
                  key={offer.id}
                  role="tab"
                  aria-selected={i === selected}
                  className={`co-option${i === selected ? ' selected' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="co-index mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="co-avatar" style={{ background: `linear-gradient(135deg, ${offer.primaryColor}, ${offer.secondaryColor})` }}>{offer.clubShort}</span>
                  <span className="co-option-text">
                    <b>{offer.clubName}</b>
                    <small>{offer.league} · {offer.identity}</small>
                  </span>
                  <span className="co-chevron">→</span>
                </button>
              ))}
            </div>

            {/* Right rail — detail */}
            <section className="co-detail">
              <div
                className="co-detail-hero"
                style={{ background: `linear-gradient(135deg, ${current.primaryColor}, ${current.secondaryColor})` }}
              >
                <span className="co-detail-index mono">{String(offers.indexOf(current) + 1).padStart(2, '0')}</span>
                <span className="co-detail-crest">{current.clubShort}</span>
                <span className="co-detail-league">{current.league}</span>
              </div>
              <div className="co-detail-body">
                <span className="co-kicker">{current.identity}</span>
                <h2 className="co-detail-name">{current.clubName}</h2>
                <p className="co-detail-desc">{current.description}</p>

                <div className="co-stats">
                  <div className="co-stat"><span>Style</span><b>{current.philosophy}</b></div>
                  <div className="co-stat"><span>{isManager ? 'Budget' : 'Pathway'}</span><b>{isManager ? formatMoney(current.managerBudget) : current.playerRole}</b></div>
                  {isManager ? (
                    <div className="co-stat"><span>Board trust</span><b>{current.managerTrust}%</b></div>
                  ) : (
                    <div className="co-stat"><span>Wage</span><b>{formatMoney(current.playerWage)}/wk</b></div>
                  )}
                  <div className="co-stat"><span>League</span><b>{current.league}</b></div>
                </div>

                <div className="co-rows">
                  <div className="co-col">
                    <span className="co-col-head">Advantages</span>
                    {current.pros.map((item) => <span className="co-item good" key={item}>+ {item}</span>)}
                  </div>
                  <div className="co-col">
                    <span className="co-col-head">Trade-offs</span>
                    {current.cons.map((item) => <span className="co-item bad" key={item}>− {item}</span>)}
                  </div>
                </div>

                <button className="btn btn-primary btn-block co-accept" onClick={() => onAccept(current)}>
                  {onboarding.acceptedOffer?.id === current.id ? 'Continue with this club' : `Accept ${current.clubName}`} <Icon>→</Icon>
                </button>
              </div>
            </section>
          </div>
        )}

        <div className="co-foot">
          <span>Offers are locked to this career and saved locally.</span>
          <span>{isManager ? 'Manager appointment' : 'Player contract'} · Season 1</span>
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
