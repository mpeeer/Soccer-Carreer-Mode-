import { PageHeader } from './pageHeader'
import type { Player, CareerProfile } from '../types'
import { formatMoney, Icon } from '../utils'

export function PlayerClubView({ profile, player, openModal }: { profile: CareerProfile; player: Player; openModal: (title: string) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Player · Club"
        title="Club life"
        description={`${profile.clubName} · ${profile.playerPosition} · Contract ${player.contract} years`}
        action={<button className="btn btn-ghost" onClick={() => openModal('Contract conversation')}><Icon>◎</Icon> Contract talk</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Your deal</span>
              <h3>Contract details</h3>
            </div>
            <span className="pill good">Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 12,
              background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
              color: '#0a0b10', fontWeight: 800, fontSize: 16,
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              {profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </div>
            <div style={{ minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 'var(--t-md)' }}>{profile.name}</b>
              <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{profile.playerPosition} · {profile.clubName}</small>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
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
          <button className="btn btn-primary" style={{ marginTop: 'var(--s-5)', width: '100%' }} onClick={() => openModal('Contract conversation')}>
            Discuss your role <Icon>→</Icon>
          </button>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Dressing room</span>
              <h3>Relationships</h3>
            </div>
          </div>
          <div className="panel-rows">
            <div className="panel-row">
              <div className="row-icon" style={{ background: '#f07f5e', color: '#fff', fontWeight: 700, fontSize: 11 }}>NB</div>
              <div className="row-text"><b>Nico Bellori</b><small>Training partner · CM</small></div>
              <span className="accent mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>86</span>
            </div>
            <div className="panel-row">
              <div className="row-icon" style={{ background: '#8a7dff', color: '#fff', fontWeight: 700, fontSize: 11 }}>RK</div>
              <div className="row-text"><b>Rayan Kessler</b><small>Rival · CB</small></div>
              <span className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--warn)' }}>63</span>
            </div>
            <div className="panel-row">
              <div className="row-icon" style={{ background: '#e8b74c', color: '#0a0b10', fontWeight: 700, fontSize: 11 }}>LS</div>
              <div className="row-text"><b>Lio Santoro</b><small>Senior mentor · AM</small></div>
              <span className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--good)' }}>79</span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 'var(--s-5)' }}>
        <div className="panel-head">
          <div>
            <span className="kicker">Standing</span>
            <h3>Path to first team</h3>
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
      <PageHeader
        eyebrow="Club · 2026—2030"
        title="Club vision"
        description={`Board confidence 86% · Financial status: healthy`}
        action={<button className="btn btn-ghost" onClick={() => openModal('Club roadmap')}><Icon>▦</Icon> Roadmap</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Board mandate · 01</span>
              <h3>Strategic objective</h3>
            </div>
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
              <h3>Budget</h3>
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

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Club DNA</span>
              <h3>What we stand for</h3>
            </div>
          </div>
          <div className="panel-rows">
            <div className="panel-row">
              <span className="row-icon accent">✦</span>
              <div className="row-text"><b>Brave football</b><small>Possession with purpose</small></div>
              <b className="accent mono" style={{ fontSize: 'var(--t-md)' }}>92</b>
            </div>
            <div className="panel-row">
              <span className="row-icon">♙</span>
              <div className="row-text"><b>Grow our own</b><small>Academy pathway first</small></div>
              <b className="mono" style={{ fontSize: 'var(--t-md)' }}>87</b>
            </div>
            <div className="panel-row">
              <span className="row-icon">◈</span>
              <div className="row-text"><b>One city, one club</b><small>Community always</small></div>
              <b className="mono" style={{ fontSize: 'var(--t-md)' }}>95</b>
            </div>
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
