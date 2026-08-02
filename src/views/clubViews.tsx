import type { Player, CareerProfile } from '../types'
import { formatMoney, Icon } from '../utils'

export function PlayerClubView({ profile, player, openModal }: { profile: CareerProfile; player: Player; openModal: (title: string) => void }) {
  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Player · {profile.clubShort}</span>
          <h1>{profile.clubName}</h1>
          <p>{profile.playerPosition} · Contract {player.contract} years · {player.role}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost" onClick={() => openModal('Contract discussion')}><Icon>◎</Icon> Contract</button>
          <button className="btn btn-primary">Renew <Icon>→</Icon></button>
        </div>
      </header>

      <div className="grid-3" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="metric">
          <span className="m-label">Wage / wk</span>
          <span className="m-value">{formatMoney(player.wage)}</span>
          <span className="m-delta">+€12k this season</span>
        </div>
        <div className="metric">
          <span className="m-label">Release clause</span>
          <span className="m-value">{formatMoney(player.releaseClause ?? player.value)}</span>
          <span className="m-delta">Standard contract</span>
        </div>
        <div className="metric">
          <span className="m-label">Market value</span>
          <span className="m-value">{formatMoney(player.value)}</span>
          <span className="m-delta positive">+€1.2m this month</span>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Contract</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Player contract</h3>
            </div>
            <span className="pill good">Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 12,
              background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
              color: '#fff', fontWeight: 800, fontSize: 16,
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              {profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 'var(--t-md)' }}>{profile.name}</b>
              <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{profile.playerPosition} · {profile.clubName}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <b className="accent mono" style={{ fontSize: 'var(--t-xl)', fontWeight: 700 }}>{formatMoney(player.wage)}</b>
              <span className="kicker" style={{ display: 'block' }}>Per week</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3) var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--line)' }}>
            <div><span className="kicker">Contract</span><b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{player.contract} years</b></div>
            <div><span className="kicker">Role</span><b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{player.role}</b></div>
            <div><span className="kicker">Release clause</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{formatMoney(player.releaseClause ?? player.value)}</b></div>
            <div><span className="kicker">Market value</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{formatMoney(player.value)}</b></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 'var(--s-4)', width: '100%' }} onClick={() => openModal('Renew contract')}>
            Discuss role with the manager <Icon>→</Icon>
          </button>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Dressing room</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Relationships</h3>
            </div>
          </div>
          <div className="panel-rows">
            {[
              { name: 'Nico Bellori', role: 'Training partner · CM', rating: 86, color: '#f07f5e', side: 'positive' },
              { name: 'Rayan Kessler', role: 'Rival · CB', rating: 63, color: '#8a7dff', side: 'medium' },
              { name: 'Lio Santoro', role: 'Senior mentor · AM', rating: 79, color: '#e8b74c', side: 'positive' },
              { name: 'Adam Webster', role: 'Defensive partner · CB', rating: 72, color: '#1f8a5f', side: 'positive' },
            ].map((row) => (
              <div className="panel-row" key={row.name}>
                <span className="row-icon" style={{ background: row.color, color: '#fff', fontWeight: 700, fontSize: 11 }}>{row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                <div className="row-text"><b>{row.name}</b><small>{row.role}</small></div>
                <span className={`pill ${row.side === 'positive' ? 'good' : row.side === 'medium' ? 'warn' : 'bad'}`}>{row.rating}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 'var(--s-5)' }}>
        <div className="panel-head">
          <div>
            <span className="kicker">Standing</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Path to first team</h3>
          </div>
          <span className="kicker">68%</span>
        </div>
        <p className="muted" style={{ marginBottom: 'var(--s-4)' }}>You are competing for a first-team place. Complete 3 strong training sessions before next selection.</p>
        <div className="bar thick"><i style={{ width: '68%' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--s-3)' }}>
          <span className="kicker">Rotation player</span>
          <b className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>68%</b>
        </div>
      </section>
    </>
  )
}

export function ClubView({ budget, requestInvestment, openModal }: { budget: number; requestInvestment: () => void; openModal: (title: string) => void }) {
  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Club · 2026—2030 plan</span>
          <h1>Club vision</h1>
          <p>Board confidence: 86% · Financial health: Healthy · Strategy: Possession-based youth development.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost" onClick={() => openModal('5-year roadmap')}><Icon>▦</Icon> Roadmap</button>
          <button className="btn btn-primary" onClick={requestInvestment}>Request investment <Icon>→</Icon></button>
        </div>
      </header>

      <div className="grid-3" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="metric">
          <span className="m-label">Board confidence</span>
          <span className="m-value">86%</span>
          <span className="m-delta positive">+12 this season</span>
        </div>
        <div className="metric">
          <span className="m-label">Transfer balance</span>
          <span className="m-value accent">{formatMoney(budget)}</span>
          <span className="m-delta positive">+€4.2M this window</span>
        </div>
        <div className="metric">
          <span className="m-label">Wage bill</span>
          <span className="m-value">€186k</span>
          <span className="m-delta">per week</span>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Board mandate · 01</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Strategic objective</h3>
            </div>
            <span className="pill good">On track</span>
          </div>
          <p className="muted" style={{ lineHeight: 1.6, marginBottom: 'var(--s-5)' }}>Qualify for continental competition while maintaining youth development standards. The board supports the current strategy.</p>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="kicker">Board confidence</span>
              <b className="accent mono" style={{ fontSize: 'var(--t-lg)' }}>86%</b>
            </div>
            <div className="bar thick"><i style={{ width: '86%' }} /></div>
            <small className="muted" style={{ display: 'block', marginTop: 6, fontSize: 'var(--t-xs)' }}>+12 since the start of the season</small>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Financial control</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Budget breakdown</h3>
            </div>
            <span className="pill good">Healthy</span>
          </div>
          <div style={{ margin: 'var(--s-3) 0' }}>
            <span className="kicker">Transfer balance</span>
            <b className="accent mono" style={{ display: 'block', fontSize: 'var(--t-3xl)', fontWeight: 800, marginTop: 4 }}>{formatMoney(budget)}</b>
            <small className="muted" style={{ display: 'block', fontSize: 'var(--t-xs)', marginTop: 4 }}>Updated after last window activity</small>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', margin: 'var(--s-3) 0' }}>
            <FinanceBar label="Squad wages" value="€1.84M" percent={64} />
            <FinanceBar label="Scouting network" value="€420K" percent={28} />
            <FinanceBar label="Facilities" value="€680K" percent={42} />
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--s-3)' }} onClick={requestInvestment}>
            Request board investment <Icon>→</Icon>
          </button>
        </section>

        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div>
              <span className="kicker">Club DNA</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>What we stand for</h3>
            </div>
            <span className="kicker">SCORE: A−</span>
          </div>
          <div className="grid-3">
            {[
              { name: 'Brave football', desc: 'Possession with purpose', rating: 92, accent: 'accent' },
              { name: 'Grow our own', desc: 'Academy pathway first', rating: 87, accent: '' },
              { name: 'One city, one club', desc: 'Community always', rating: 95, accent: '' },
            ].map((dna) => (
              <div key={dna.name} className="metric" style={{ minHeight: 110 }}>
                <span className="m-icon" style={{ background: dna.accent === 'accent' ? 'var(--accent-dim)' : 'var(--surface-2)', color: dna.accent === 'accent' ? 'var(--accent-hot)' : 'var(--text-muted)' }}>✦</span>
                <span className="m-label">{dna.name}</span>
                <span className="m-value" style={{ fontSize: 'var(--t-2xl)' }}>{dna.rating}</span>
                <small className="muted">{dna.desc}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export function FinanceBar({ label, value, percent }: { label: string; value: string; percent: number; color?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>{label}</span>
        <b className="mono" style={{ fontSize: 'var(--t-xs)' }}>{value}</b>
      </div>
      <div className="bar"><i style={{ width: `${percent}%`, background: 'var(--accent)' }} /></div>
    </div>
  )
}
