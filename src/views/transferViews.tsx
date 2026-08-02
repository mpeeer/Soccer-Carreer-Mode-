import { PageHeader } from './pageHeader'
import type { CSSProperties } from 'react'
import type { CareerProfile, ClubOffer, TransferApproach } from '../types'
import { formatMoney, Icon } from '../utils'

export function TransferApproachModal({ approach, profile, onAccept, onDecline, onConsider, onClose }: { approach: TransferApproach; profile: CareerProfile; onAccept: (a: TransferApproach) => void; onDecline: (a: TransferApproach) => void; onConsider: (a: TransferApproach) => void; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ padding: 0, maxWidth: 520, '--offer-primary': approach.primaryColor, '--offer-secondary': approach.secondaryColor } as CSSProperties}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div style={{
          padding: 'var(--s-7)', color: '#fff',
          background: `linear-gradient(135deg, ${approach.primaryColor}, ${approach.secondaryColor})`,
          position: 'relative',
        }}>
          <span className="pill" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Official approach</span>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-md)',
            background: 'rgba(0,0,0,0.25)', color: '#fff',
            fontWeight: 800, fontSize: 18,
            display: 'grid', placeItems: 'center',
            marginTop: 'var(--s-4)',
          }}>{approach.clubShort}</div>
          <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, margin: 'var(--s-3) 0 var(--s-2)' }}>{approach.clubName}</h2>
          <small style={{ fontSize: 'var(--t-sm)', opacity: 0.85 }}>{approach.identity}</small>
        </div>
        <div style={{ padding: 'var(--s-6)' }}>
          <div style={{ marginBottom: 'var(--s-5)' }}>
            <span className="kicker">Brief</span>
            <p className="muted" style={{ marginTop: 6, fontSize: 'var(--t-sm)', lineHeight: 1.6 }}>{approach.storyline}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
            <div>
              <span className="kicker accent">Perks</span>
              <div style={{ marginTop: 'var(--s-2)' }}>
                {approach.perks.map((p) => (
                  <div key={p} style={{ fontSize: 'var(--t-sm)', color: 'var(--good)', padding: '4px 0' }}>+ {p}</div>
                ))}
              </div>
            </div>
            <div>
              <span className="kicker" style={{ color: 'var(--warn)' }}>Trade-offs</span>
              <div style={{ marginTop: 'var(--s-2)' }}>
                {approach.risks.map((r) => (
                  <div key={r} style={{ fontSize: 'var(--t-sm)', color: 'var(--warn)', padding: '4px 0' }}>− {r}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)', padding: 'var(--s-4) 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ textAlign: 'center' }}>
              <span className="kicker">{profile.clubShort}</span>
              <small className="muted" style={{ display: 'block', fontSize: 'var(--t-xs)' }}>Current · {profile.league}</small>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <span className="kicker accent">{approach.clubShort}</span>
              <small className="muted" style={{ display: 'block', fontSize: 'var(--t-xs)' }}>Target · {approach.league}</small>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', marginTop: 'var(--s-5)' }}>
            <div><span className="kicker">{profile.mode === 'manager' ? 'Budget' : 'Wage'}</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{profile.mode === 'manager' ? formatMoney(approach.managerBudget) : formatMoney(approach.playerWage) + '/wk'}</b></div>
            <div><span className="kicker">Role</span><b style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.playerRole}</b></div>
            <div><span className="kicker">Training</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.playerTraining}</b></div>
            <div><span className="kicker">Trust</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.managerTrust}%</b></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-6)' }}>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onAccept(approach)}>
              Accept &amp; join {approach.clubShort} <Icon>→</Icon>
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onConsider(approach)}>Consider later</button>
          </div>
          <button className="btn btn-link" style={{ marginTop: 'var(--s-3)' }} onClick={() => onDecline(approach)}>Decline</button>
        </div>
      </div>
    </div>
  )
}

export function TransferOffersView({ profile, approaches, clubOffer, onConsider, onAccept, onDecline, onCounter }: { profile: CareerProfile; approaches: TransferApproach[]; clubOffer: ClubOffer | null; onConsider: (a: TransferApproach) => void; onAccept: (a: TransferApproach) => void; onDecline: (a: TransferApproach) => void; onCounter: (a: TransferApproach, demand: string) => void }) {
  const active = approaches.filter((a) => a.stage !== 'declined' && a.stage !== 'accepted')
  const decided = approaches.filter((a) => a.stage === 'declined' || a.stage === 'accepted')

  return (
    <>
      <PageHeader
        eyebrow={`Transfer desk · ${profile.clubName}`}
        title="Transfer desk"
        description={`Active approaches · ${profile.mode === 'manager' ? 'Manager' : 'Player'} market`}
        action={<button className="btn btn-ghost"><Icon>↔</Icon> Agent</button>}
      />

      {active.length === 0 ? (
        <section className="panel" style={{ textAlign: 'center', padding: 'var(--s-9)' }}>
          <div style={{ fontSize: 32, marginBottom: 'var(--s-3)' }}>↔</div>
          <h3 style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>No active approaches</h3>
          <p className="muted" style={{ marginTop: 6 }}>Clubs will make approaches as your reputation grows. Keep performing.</p>
        </section>
      ) : (
        <div className="stack-lg">
          {active.map((approach) => (
            <article
              key={approach.id}
              className="panel"
              style={{ '--offer-primary': approach.primaryColor, '--offer-secondary': approach.secondaryColor } as CSSProperties}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-md)',
                  background: `linear-gradient(135deg, ${approach.primaryColor}, ${approach.secondaryColor})`,
                  color: '#fff', fontWeight: 800, fontSize: 18,
                  display: 'grid', placeItems: 'center',
                }}>{approach.clubShort}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="kicker">{approach.stage.toUpperCase()}</span>
                  <b style={{ display: 'block', fontSize: 'var(--t-xl)', fontWeight: 800 }}>{approach.clubName}</b>
                  <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{approach.identity} · {approach.league}</small>
                </div>
                <span className={`pill ${approach.managerTrust > 75 ? 'good' : approach.managerTrust > 60 ? 'warn' : 'bad'}`}>
                  {approach.managerTrust > 75 ? 'Warm' : approach.managerTrust > 60 ? 'Formal' : 'Urgent'}
                </span>
              </div>

              <p className="muted" style={{ fontSize: 'var(--t-sm)', lineHeight: 1.6, marginBottom: 'var(--s-4)' }}>{approach.storyline}</p>

              <div style={{ marginBottom: 'var(--s-5)' }}>
                <span className="kicker">What they offer</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--s-2)' }}>
                  {approach.perks.map((p) => <span key={p} className="pill">{p}</span>)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', padding: 'var(--s-4) 0', borderTop: '1px solid var(--line)' }}>
                <div><span className="kicker">{profile.mode === 'manager' ? 'Budget' : 'Wage'}</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{profile.mode === 'manager' ? formatMoney(approach.managerBudget) : formatMoney(approach.playerWage) + '/wk'}</b></div>
                <div><span className="kicker">Role</span><b style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.playerRole}</b></div>
                <div><span className="kicker">Training</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.playerTraining}</b></div>
                <div><span className="kicker">Trust</span><b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)', fontWeight: 700 }}>{approach.managerTrust}%</b></div>
              </div>

              {approach.stage === 'negotiating' && approach.counterDemand && (
                <div style={{ marginTop: 'var(--s-4)', padding: 'var(--s-3)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                  <span className="kicker">Your demand</span>
                  <p className="muted" style={{ marginTop: 4, fontSize: 'var(--t-sm)' }}>{approach.counterDemand}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-5)' }}>
                <button className="btn btn-primary" onClick={() => onAccept(approach)}>Accept <Icon>→</Icon></button>
                <button className="btn btn-ghost" onClick={() => onCounter(approach, `Improved ${profile.mode === 'manager' ? 'budget by 15%' : 'wages and role'} requested`)}>
                  {approach.stage === 'negotiating' ? 'Re-counter' : 'Negotiate'} <Icon>↔</Icon>
                </button>
                <button className="btn btn-link" onClick={() => onDecline(approach)} style={{ color: 'var(--text-muted)' }}>Decline</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <section className="panel" style={{ marginTop: 'var(--s-5)' }}>
          <div className="panel-head">
            <div><span className="kicker">Archived</span><h3>Resolved approaches</h3></div>
          </div>
          <div className="panel-rows">
            {decided.map((approach) => (
              <div className="panel-row" key={approach.id}>
                <div className={`row-icon ${approach.stage === 'accepted' ? 'accent' : ''}`}>{approach.stage === 'accepted' ? '✓' : '✕'}</div>
                <div className="row-text"><b>{approach.clubName}</b><small>{approach.stage === 'accepted' ? 'Transfer completed' : 'Approach declined'} · Week {approach.arrivalWeek}</small></div>
                <span className="kicker">{approach.stage === 'accepted' ? 'DONE' : 'CLOSED'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
