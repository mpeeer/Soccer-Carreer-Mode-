import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { DefensiveLine, FormationId, Mentality, Player, PlayStyle, Pressure, Tactics, View, Width } from '../types'
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
  const starters = useMemo(() => players.filter((p) => p.role !== 'Prospect').slice(0, formation.slots.length), [players, formation])

  const commit = () => {
    onUpdateTactics(draft)
    onShowToast(`${formation.label} · ${draft.mentality} applied`)
  }

  return (
    <div className="ea-fc-theme ea-tactics-view" style={{ '--tac-accent': 'var(--accent)' } as CSSProperties}>
      <header className="ea-top-tabs">
        <div className="ea-brand-mark"><span>NS</span></div>
        <nav className="ea-tab-nav">
          <button className="ea-tab" onClick={() => setActiveView('squad')}>Squad</button>
          <button className="ea-tab" onClick={() => setActiveView('teamManagement')}>Team</button>
          <button className="ea-tab ea-tab-primary">Tactics</button>
          <div className="ea-tab-divider" />
          <button className="ea-tab">Set pieces</button>
        </nav>
      </header>

      <div className="ea-tac-body">
        {/* Left: formation picker + pitch */}
        <section className="ea-tac-preview">
          <div>
            <h3>Formation</h3>
            <div className="ea-tac-formation-picker">
              {FORMATION_IDS.map((id) => {
                const f = formations[id]
                const active = draft.formation === id
                return (
                  <button key={id} className={`ea-tac-fc-card${active ? ' active' : ''}`} onClick={() => set('formation', id)}>
                    <span className="ea-tac-fc-label">{f.label}</span>
                    <small>{f.description}</small>
                    <MiniFormationPreview id={id} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="ea-tac-preview-h">Live preview</h3>
            <div className="ea-tac-pitch ea-pitch">
              <div className="ea-pitch-line center-circle" />
              <div className="ea-pitch-line center-line" />
              <div className="ea-pitch-line penalty-area-top" />
              <div className="ea-pitch-line penalty-area-bottom" />
              {formation.slots.map((slot, i) => {
                const player = starters[i]
                return (
                  <div
                    key={i}
                    className="ea-player-chip"
                    style={{ left: `${slot.x}%`, top: `${slot.y}%`, '--chip-accent': positionColors[slot.position] } as CSSProperties}
                  >
                    <span className="ea-chip-rating">{player?.rating ?? '—'}</span>
                    <span className="ea-chip-name">{slot.position}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Middle: dials */}
        <section className="ea-tac-dials">
          <Dial label="Mentality" options={MENTALITIES} value={draft.mentality} onChange={(v) => set('mentality', v)} accent="cyan" />
          <Dial label="Width" options={WIDTHS} value={draft.width} onChange={(v) => set('width', v)} accent="cyan" />
          <Dial label="Defensive line" options={LINES} value={draft.defensiveLine} onChange={(v) => set('defensiveLine', v)} accent="cyan" />
          <Dial label="Pressure" options={PRESSURES} value={draft.pressure} onChange={(v) => set('pressure', v)} accent="cyan" />
          <div className="ea-tac-playstyle">
            <span>Play style</span>
            <div className="ea-tac-style-grid">
              {PLAY_STYLES.map((s) => {
                const active = draft.playStyle === s
                return <button key={s} className={`ea-tac-style-card${active ? ' active' : ''}`} onClick={() => set('playStyle', s)}>{s}</button>
              })}
            </div>
          </div>
        </section>

        {/* Right: assignments */}
        <section className="ea-tac-assignments">
          <h3>Assignments</h3>
          <div className="ea-tac-assign-row">
            <span>Captain</span>
            <PlayerPicker players={players} value={draft.captain} onChange={(id) => set('captain', id)} />
          </div>
          <div className="ea-tac-assign-row">
            <span>Set pieces</span>
            <PlayerPicker players={players} value={draft.setPieces} onChange={(id) => set('setPieces', id)} />
          </div>
          <div className="ea-tac-assign-row">
            <span>Penalty taker</span>
            <PlayerPicker players={players} value={draft.penaltyTaker} onChange={(id) => set('penaltyTaker', id)} />
          </div>
          <div className="ea-tac-presets">
            <span>Quick presets</span>
            <div className="ea-tac-preset-grid">
              <button onClick={() => setDraft({ ...draft, formation: 'fourFourTwo', mentality: 'Defensive', pressure: 'High', defensiveLine: 'Low', width: 'Narrow', playStyle: 'Counter Attack' })}>Low block</button>
              <button onClick={() => setDraft({ ...draft, formation: 'threeFiveTwo', mentality: 'Attacking', pressure: 'High', defensiveLine: 'High', width: 'Wide', playStyle: 'Wing Play' })}>Wing overload</button>
              <button onClick={() => setDraft({ ...draft, formation: 'fourThreeThree', mentality: 'Balanced', pressure: 'Medium', defensiveLine: 'Medium', width: 'Normal', playStyle: 'Possession' })}>Balanced</button>
              <button onClick={() => setDraft({ ...draft, formation: 'fourThreeThree', mentality: 'Ultra Attacking', pressure: 'High', defensiveLine: 'High', width: 'Wide', playStyle: 'High Press' })}>High press</button>
            </div>
          </div>
          <div className="ea-tac-actions">
            <button className="ea-tac-discard" onClick={() => setDraft(tactics)}>Discard</button>
            <button className="ea-tac-apply" onClick={commit}><Icon>✓</Icon> Apply tactics</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Dial<T extends string>({ label, options, value, onChange, accent }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; accent: 'cyan' | 'green' | 'red' }) {
  const idx = options.indexOf(value)
  const accentColor = accent === 'green' ? 'var(--good)' : accent === 'red' ? 'var(--bad)' : 'var(--accent)'
  return (
    <div className="ea-tac-dial" style={{ '--dial-accent': accentColor } as CSSProperties}>
      <span>{label}</span>
      <div className="ea-tac-dial-track">
        {options.map((opt, i) => (
          <button key={opt} className={`ea-tac-dial-step${i <= idx ? ' on' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
      <div className="ea-tac-dial-bar"><i style={{ width: `${(idx / Math.max(1, options.length - 1)) * 100}%`, background: accentColor }} /></div>
    </div>
  )
}

function PlayerPicker({ players, value, onChange }: { players: Player[]; value: number | null; onChange: (id: number) => void }) {
  return (
    <div className="ea-tac-picker">
      {players.slice(0, 6).map((p) => {
        const active = value === p.id
        return (
          <button key={p.id} className={`ea-tac-pick-card${active ? ' active' : ''}`} onClick={() => onChange(p.id)}>
            <span className="ea-tac-pick-rating">{p.rating}</span>
            <span className="ea-tac-pick-name">{p.name.split(' ').slice(-1).join('').toUpperCase()}</span>
          </button>
        )
      })}
    </div>
  )
}

function MiniFormationPreview({ id }: { id: FormationId }) {
  const slots = formations[id].slots
  return (
    <div className="ea-tac-mini-pitch">
      <span className="ea-tac-mini-line" />
      {slots.map((s, i) => (
        <span key={i} style={{ left: `${s.x}%`, top: `${s.y}%` }} className="ea-tac-mini-dot" />
      ))}
    </div>
  )
}
