import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Player, Tactics, View, Mentality, Width, DefensiveLine, Pressure, PlayStyle, FormationId } from '../types'
import { formations, positionColors } from '../data'
import { Icon } from '../utils'

interface TacticsViewProps {
  players: Player[]
  tactics: Tactics
  onUpdateTactics: (next: Tactics) => void
  setActiveView: (v: View) => void
  onShowToast: (m: string) => void
}

const MENTALITIES: Mentality[] = ['Ultra Defensive', 'Defensive', 'Balanced', 'Attacking', 'Ultra Attacking']
const WIDTHS: Width[] = ['Narrow', 'Normal', 'Wide']
const LINES: DefensiveLine[] = ['Low', 'Medium', 'High']
const PRESSURES: Pressure[] = ['Low', 'Medium', 'High']
const PLAY_STYLES: PlayStyle[] = ['Possession', 'Quick Transitions', 'Counter Attack', 'High Press', 'Wing Play']
const FORMATION_IDS: FormationId[] = ['fourThreeThree', 'fourFourTwo', 'threeFiveTwo']

export function TacticsView({ players, tactics, onUpdateTactics, setActiveView, onShowToast }: TacticsViewProps) {
  const [draft, setDraft] = useState<Tactics>(tactics)
  const set = <K extends keyof Tactics>(k: K, v: Tactics[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const formation = formations[draft.formation]
  const starters = players.filter((p) => p.role !== 'Prospect').slice(0, formation.slots.length)

  const commit = () => {
    onUpdateTactics(draft)
    onShowToast(`${formation.label} · ${draft.mentality} applied`)
  }

  const presetsPermissive = () => setDraft({ ...draft, formation: 'fourFourTwo' as FormationId, mentality: 'Ultra Defensive' as Mentality, pressure: 'Low' as Pressure, defensiveLine: 'Low' as DefensiveLine, width: 'Narrow' as Width, playStyle: 'Counter Attack' as PlayStyle })
  const presetsAggressive = () => setDraft({ ...draft, formation: 'threeFiveTwo' as FormationId, mentality: 'Attacking' as Mentality, pressure: 'High' as Pressure, defensiveLine: 'High' as DefensiveLine, width: 'Wide' as Width, playStyle: 'Wing Play' as PlayStyle })
  const presetsBalanced = () => setDraft({ ...draft, formation: 'fourThreeThree' as FormationId, mentality: 'Balanced' as Mentality, pressure: 'Medium' as Pressure, defensiveLine: 'Medium' as DefensiveLine, width: 'Normal' as Width, playStyle: 'Possession' as PlayStyle })

  return (
    <div className="ea-fc-theme ea-tactics-view" style={{ '--tac-accent': 'var(--accent)' } as CSSProperties}>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Match Day · Tactics</span>
          <h1>{formation.label} {presetTitle(draft)}</h1>
          <p>Balance mentality, width, pressure and play style. Apply when you&apos;re happy.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost" onClick={() => setDraft(tactics)}>Discard</button>
          <button className="btn btn-primary" onClick={commit}><Icon>✓</Icon> Apply tactics</button>
        </div>
      </header>

      {/* Top row: formation picker */}
      <section className="panel" style={{ marginBottom: 'var(--s-3)' }}>
        <div className="panel-head">
          <div>
            <span className="kicker accent">Formation</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Pick your shape</h3>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onShowToast('Set pieces editor opened')}>Set pieces</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onShowToast('Penalties editor opened')}>Penalties</button>
          </div>
        </div>
        <div className="grid-3" style={{ marginTop: 'var(--s-3)' }}>
          {FORMATION_IDS.map((id) => {
            const f = formations[id]
            const active = draft.formation === id
            return (
              <button
                key={id}
                className={`panel ${active ? 'purple' : ''}`}
                onClick={() => set('formation', id)}
                style={{ padding: 'var(--s-5)', textAlign: 'left', transition: '0.15s', background: active ? 'var(--accent-dim)' : 'var(--surface-1)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <b className={active ? 'accent' : ''} style={{ fontSize: 'var(--t-lg)', fontWeight: 800 }}>{f.label}</b>
                  <span className="kicker">{active ? 'SELECTED' : 'TAP TO PICK'}</span>
                </div>
                <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{f.description}</small>
                <div style={{ marginTop: 'var(--s-3)', position: 'relative', aspectRatio: '4/3', background: 'radial-gradient(ellipse at 50% 50%, #1d8a52 0%, #0e4a2c 100%)', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  {f.slots.map((s, i) => (
                    <span key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, background: active ? 'var(--accent)' : '#fff', borderRadius: '50%', opacity: 0.95 }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="tac-grid">
        {/* Left: dual pitches */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Team shape</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>In & out of possession</h3>
            </div>
            <div className="tac-tabs">
              <button className="tac-tabview active">Combined</button>
              <button className="tac-tabview">In Possession</button>
              <button className="tac-tabview">Out of Possession</button>
              <button className="tac-tabview">Both</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
            <PitchView label="In possession" subtitle="Attack the space" formation={formation} starters={starters} />
            <PitchView label="Out of possession" subtitle="Compact block" formation={formation} starters={starters} />
          </div>
          {/* Below the pitches: Assignments */}
          <div className="panel-head" style={{ marginTop: 'var(--s-4)', background: 'var(--surface-2)' }}>
            <div>
              <span className="kicker accent">Assignments</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Set pieces, captain, PK taker</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-3)' }}>
            <PickRow title="Captain" icon="©" players={players} value={draft.captain} onChange={(id) => set('captain', id)} />
            <PickRow title="Free kicks" icon="⌯" players={players} value={draft.setPieces} onChange={(id) => set('setPieces', id)} />
            <PickRow title="Penalties" icon="▮" players={players} value={draft.penaltyTaker} onChange={(id) => set('penaltyTaker', id)} />
          </div>
        </section>

        {/* Right rail: dials */}
        <aside className="tac-side">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker accent">Team Instructions</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Dials</h3>
              </div>
              <span className="kicker">Success: 0 / 3</span>
            </div>
            <div className="stack">
              <Dial label="Mentality" value={draft.mentality} options={MENTALITIES} onChange={(v) => set('mentality', v)} />
              <Dial label="Width" value={draft.width} options={WIDTHS} onChange={(v) => set('width', v)} />
              <Dial label="Defensive line" value={draft.defensiveLine} options={LINES} onChange={(v) => set('defensiveLine', v)} />
              <Dial label="Pressure" value={draft.pressure} options={PRESSURES} onChange={(v) => set('pressure', v)} />
            </div>
            <div className="panel-head" style={{ marginTop: 'var(--s-3)', borderTop: '1px solid var(--line)' }}>
              <div>
                <span className="kicker">Play style</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Choose your identity</h3>
              </div>
            </div>
            <div className="grid-2" style={{ gap: 'var(--s-2)' }}>
              {PLAY_STYLES.map((s) => {
                const active = draft.playStyle === s
                return (
                  <button
                    key={s}
                    className="btn"
                    onClick={() => set('playStyle', s)}
                    style={{ background: active ? 'var(--accent)' : 'var(--surface-2)', color: active ? '#fff' : 'var(--text-muted)', height: 36, borderRadius: 'var(--r-sm)', border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line)'), fontWeight: 700, fontSize: 'var(--t-xs)' }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Quick presets</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>One-tap setups</h3>
              </div>
            </div>
            <div className="grid-2" style={{ gap: 'var(--s-2)' }}>
              <button className="btn btn-ghost" onClick={presetsPermissive} style={{ height: 40, flexDirection: 'column', padding: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--t-xs)' }}>Low block</b>
                <small className="muted">4-4-2 · Defensive</small>
              </button>
              <button className="btn btn-ghost" onClick={presetsAggressive} style={{ height: 40, flexDirection: 'column', padding: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--t-xs)' }}>Wing overload</b>
                <small className="muted">3-5-2 · Attacking</small>
              </button>
              <button className="btn btn-ghost" onClick={presetsBalanced} style={{ height: 40, flexDirection: 'column', padding: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--t-xs)' }}>Balanced</b>
                <small className="muted">4-3-3 · Possession</small>
              </button>
              <button className="btn btn-ghost" onClick={() => onShowToast('High press preset')} style={{ height: 40, flexDirection: 'column', padding: 'var(--s-2)' }}>
                <b style={{ fontSize: 'var(--t-xs)' }}>High press</b>
                <small className="muted">4-3-3 · Ultra Attacking</small>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function presetTitle(t: Tactics) {
  const tag = t.mentality === 'Ultra Attacking' ? 'All-Out Attack' : t.mentality === 'Ultra Defensive' ? 'Parking the Bus' : ''
  return `${t.playStyle}${tag ? ' · ' + tag : ''}`
}

function PitchView({ label, subtitle, formation, starters }: { label: string; subtitle: string; formation: typeof formations.fourThreeThree; starters: Player[] }) {
  // Out-of-possession pitches shift players down a bit
  const downshift = label.toLowerCase().includes('out') ? 5 : 0
  const upshift = label.toLowerCase().includes('in') ? -5 : 0
  return (
    <div className="fm-pitch" style={{ aspectRatio: '5 / 7 ' }}>
      <div className="pitch-lines">
        <div className="center-line" />
        <div className="center-circle" />
        <div className="center-spot" />
        <div className="pen-area-top" />
        <div className="pen-area-bottom" />
        <div className="goal-area-top" />
        <div className="goal-area-bottom" />
      </div>
      <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>{label.toUpperCase()}</span>
      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>{subtitle}</span>
      {formation.slots.map((slot, i) => {
        const player = starters[i]
        return (
          <button
            key={i}
            className="pitch-chip"
            style={{ left: `${slot.x}%`, top: `${Math.max(8, Math.min(92, slot.y + downshift + upshift))}%`, '--chip-accent': positionColors[slot.position] } as CSSProperties}
            title={player?.name}
          >
            <span className="pc-rating">{player?.rating ?? '—'}</span>
            <span className="pc-name">{slot.position}</span>
          </button>
        )
      })}
    </div>
  )
}

function Dial<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tac-dial">
      <span>{label}</span>
      <div className="tac-rhythm">
        {options.map((opt, i, arr) => {
          const idx = arr.indexOf(value)
          const active = i === idx
          return (
            <button key={opt} className={`${active ? 'active' : ''}`} onClick={() => onChange(opt)}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PickRow({ title, icon, players, value, onChange }: { title: string; icon: string; players: Player[]; value: number | null; onChange: (id: number) => void }) {
  return (
    <div style={{ padding: 'var(--s-3)', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
        <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-dim)', color: 'var(--accent-hot)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>{icon}</span>
        <b style={{ fontSize: 'var(--t-sm)' }}>{title}</b>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {players.slice(0, 8).map((p) => {
          const active = value === p.id
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={`squad-tab ${active ? 'active' : ''}`}
              style={{ height: 26, padding: '0 8px', gap: 4 }}
              title={`${p.name} · ${p.position}`}
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, background: p.color, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 9 }}>{p.initials}</span>
              <span style={{ fontSize: 10 }}>{p.rating}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
