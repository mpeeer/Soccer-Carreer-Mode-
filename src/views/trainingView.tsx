import { PageHeader } from './pageHeader'
import type { CareerProfile, Player, PlayerSkills, TrainingSession } from '../types'
import { trainingSessions } from '../data'
import { Icon } from '../utils'

export function TrainingView({ profile, players, trainingEnergy, lastTrainingDay, simDay, doTrainingSession }: { profile: CareerProfile; players: Player[]; trainingEnergy: number; lastTrainingDay: number; simDay: number; doTrainingSession: (s: TrainingSession) => void }) {
  const myPlayer = players.find((p) => p.id === 900) ?? players[0]
  const skills = myPlayer.skills ?? { pace: 60, shooting: 60, passing: 60, dribbling: 60, physical: 60 }
  const skillList: { key: keyof PlayerSkills; label: string; icon: string }[] = [
    { key: 'pace', label: 'Pace', icon: '⚡' },
    { key: 'shooting', label: 'Shooting', icon: '◎' },
    { key: 'passing', label: 'Passing', icon: '↗' },
    { key: 'dribbling', label: 'Dribbling', icon: '◈' },
    { key: 'physical', label: 'Physical', icon: '▦' },
  ]
  const avgSkills = Math.round((skills.pace + skills.shooting + skills.passing + skills.dribbling + skills.physical) / 5)
  const canTrain = lastTrainingDay !== simDay && trainingEnergy >= 22

  return (
    <>
      <PageHeader
        eyebrow={`Training · Day ${simDay}`}
        title="Training ground"
        description={`${profile.name} · ${profile.clubName}`}
        action={
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4, padding: 'var(--s-3) var(--s-4)',
            border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
            minWidth: 120,
          }}>
            <span className="kicker">Energy</span>
            <b className="mono" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>{trainingEnergy}%</b>
            <div className="bar thin"><i style={{ width: `${trainingEnergy}%`, background: trainingEnergy >= 50 ? 'var(--accent)' : 'var(--warn)' }} /></div>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Player skills</span>
              <h3>{profile.name}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <b className="accent mono" style={{ fontSize: 'var(--t-3xl)', fontWeight: 800, lineHeight: 1 }}>{avgSkills}</b>
              <span className="kicker" style={{ display: 'block' }}>Average</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {skillList.map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="kicker">{s.label}</span>
                    <b className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{skills[s.key as keyof PlayerSkills]}</b>
                  </div>
                  <div className="bar"><i style={{ width: `${skills[s.key as keyof PlayerSkills]}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">{canTrain ? 'Sessions available' : lastTrainingDay === simDay ? 'Session complete' : 'Low energy'}</span>
              <h3>Today's drills</h3>
            </div>
          </div>
          {trainingSessions.map((session) => {
            const disabled = !canTrain || trainingEnergy < session.energyCost
            return (
              <button
                key={session.id}
                className="panel"
                onClick={() => doTrainingSession(session)}
                disabled={disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--s-4)',
                  padding: 'var(--s-4) var(--s-5)', marginTop: 'var(--s-3)',
                  textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1, transition: 'border-color 0.15s',
                }}
              >
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>{session.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{session.label}</b>
                  <small className="muted" style={{ fontSize: 'var(--t-xs)', lineHeight: 1.5 }}>{session.description}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="pill">{session.skill.toUpperCase()}</span>
                  <small className="muted" style={{ display: 'block', fontSize: 'var(--t-xs)', marginTop: 6 }}>−{session.energyCost}%</small>
                </div>
              </button>
            )
          })}
          {!canTrain && (
            <div style={{ textAlign: 'center', padding: 'var(--s-6) 0', marginTop: 'var(--s-4)' }}>
              <b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>Rest & recover</b>
              <p className="muted" style={{ marginTop: 6, fontSize: 'var(--t-sm)' }}>
                {lastTrainingDay === simDay ? 'Come back tomorrow for your next session.' : 'Energy too low. Rest overnight to recharge.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
