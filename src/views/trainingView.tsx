import type { CareerProfile, Player, PlayerSkills, TrainingSession } from '../types'
import { trainingSessions } from '../data'
import { Icon } from '../utils'

export function TrainingView({ profile, players, trainingEnergy, lastTrainingDay, simDay, doTrainingSession }: { profile: CareerProfile; players: Player[]; trainingEnergy: number; lastTrainingDay: number; simDay: number; doTrainingSession: (s: TrainingSession) => void }) {
  const myPlayer = players.find((p) => p.id === 900) ?? players[0]
  const skills = myPlayer.skills
  const skillList: { key: keyof PlayerSkills; label: string; icon: string }[] = [
    { key: 'pace', label: 'Pace', icon: '⚡' },
    { key: 'shooting', label: 'Shooting', icon: '◎' },
    { key: 'passing', label: 'Passing', icon: '↗' },
    { key: 'dribbling', label: 'Dribbling', icon: '◈' },
    { key: 'physical', label: 'Physical', icon: '▦' },
  ]
  const avgSkills = Math.round((skills.pace + skills.shooting + skills.passing + skills.dribbling + skills.physical) / 5)
  const canTrain = lastTrainingDay !== simDay && trainingEnergy >= 22
  const weekDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const weekDays = (Array.from({ length: 7 }, (_, i) => {
    const dayNum = simDay + i
    const completed = dayNum <= simDay
    const weekend = i >= 5
    return { label: weekDayLabels[i], num: dayNum, completed, weekend }
  }))

  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Club · Training</span>
          <h1>Player Development</h1>
          <p>{profile.name} · {profile.clubName}. Plan daily sessions to climb attributes.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost"><Icon>⌯</Icon> Set pieces</button>
          <button className="btn btn-primary">Apply training <Icon>→</Icon></button>
        </div>
      </header>

      {/* Top metrics row */}
      <div className="grid-4">
        <div className="metric">
          <span className="m-label">Energy</span>
          <span className="m-value">{trainingEnergy}%</span>
          <div className="bar"><i style={{ width: `${trainingEnergy}%`, background: trainingEnergy >= 50 ? 'var(--accent)' : 'var(--warn)' }} /></div>
          <span className="m-delta">recover {(100 - trainingEnergy).toString().padStart(2, '0')}% to peak</span>
        </div>
        <div className="metric">
          <span className="m-label">Form</span>
          <span className="m-value">{myPlayer.form}</span>
          <div className="bar"><i style={{ width: `${myPlayer.form}%`, background: myPlayer.form >= 80 ? 'var(--r-exc)' : 'var(--accent)' }} /></div>
          <span className="m-delta">{myPlayer.form >= 85 ? 'Sharp' : 'Stable'}</span>
        </div>
        <div className="metric">
          <span className="m-label">Avg Skills</span>
          <span className="m-value">{avgSkills}</span>
          <div className="bar"><i style={{ width: `${avgSkills}%` }} /></div>
          <span className="m-delta">+{avgSkills - 67} from season start</span>
        </div>
        <div className="metric">
          <span className="m-label">Sessions Today</span>
          <span className="m-value">{lastTrainingDay === simDay ? '1 / 1' : '0 / 1'}</span>
          <span className="m-delta">{canTrain ? 'Ready' : lastTrainingDay === simDay ? 'Already trained' : 'Low energy'}</span>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 'var(--s-5)', gap: 'var(--s-3)' }}>
        {/* Left: skill breakdown + sessions */}
        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div>
              <span className="kicker accent">Player skills</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Attribute snapshot</h3>
            </div>
            <span className="kicker">DAY {simDay} · {profile.clubShort}</span>
          </div>

          <div className="grid-2" style={{ marginTop: 'var(--s-3)' }}>
            {skillList.map((s) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent-hot)', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 800 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="kicker">{s.label}</span>
                    <b className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{skills[s.key as keyof PlayerSkills]}</b>
                  </div>
                  <div className={`attr-bar ${valueAttrClass(skills[s.key as keyof PlayerSkills])}`}>
                    <i style={{ width: `${Math.min(100, skills[s.key as keyof PlayerSkills] * 1.4)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-head" style={{ marginTop: 'var(--s-5)', background: 'var(--surface-2)' }}>
            <div>
              <span className="kicker accent">{canTrain ? 'Today&apos;s programme' : lastTrainingDay === simDay ? 'Rest day' : 'Low energy'}</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Available drills</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-3)', marginTop: 'var(--s-3)' }}>
            {trainingSessions.map((session) => {
              const disabled = !canTrain || trainingEnergy < session.energyCost
              return (
                <button
                  key={session.id}
                  className="panel"
                  onClick={() => doTrainingSession(session)}
                  disabled={disabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
                    padding: 'var(--s-4)', textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: '0.15s',
                  }}
                >
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-dim)', color: 'var(--accent-hot)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800 }}>{session.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{session.label}</b>
                    <small className="muted" style={{ fontSize: 'var(--t-xs)', lineHeight: 1.5 }}>{session.description}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="kicker">COST</span>
                    <b className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700, color: 'var(--accent-hot)' }}>{session.energyCost}</b>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Right: weekly intensity card */}
        <section className="panel" style={{ background: 'var(--surface-2)' }}>
          <div className="panel-head">
            <div>
              <span className="kicker accent">Weekly intensity</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Recover & adapt</h3>
            </div>
          </div>
          <div style={{ padding: 'var(--s-3) var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <div>
              <span className="kicker">Energy reserve</span>
              <div className="bar thick" style={{ marginTop: 8 }}>
                <i style={{ width: `${trainingEnergy}%`, background: trainingEnergy >= 70 ? 'var(--good)' : trainingEnergy >= 35 ? 'var(--warn)' : 'var(--bad)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <small className="muted">0%</small>
                <small className="muted">{trainingEnergy}%</small>
                <small className="muted">100%</small>
              </div>
            </div>
            <div>
              <span className="kicker">Sessions completed</span>
              <div className="bar thick" style={{ marginTop: 8 }}>
                <i style={{ width: `${lastTrainingDay === simDay ? 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <span className="kicker">Recommended focus</span>
              <div className="grid-2" style={{ gap: 'var(--s-2)', marginTop: 8 }}>
                <span className="pill accent">{profile.playerPosition} IQ</span>
                <span className="pill">+ Pace</span>
                <span className="pill">+ Vision</span>
                <span className="pill">+ Finishing</span>
              </div>
            </div>
          </div>
          <div className="panel-foot" style={{ background: 'var(--surface-1)' }}>
            <span className="kicker">Next regeneration in {Math.max(0, 1 - Math.max(0, simDay - lastTrainingDay))} day(s)</span>
            <button className="btn btn-link">Recovery module →</button>
          </div>
        </section>
      </div>

      {/* Calendar-strip below — weekly training lineup */}
      <section className="panel flush" style={{ marginTop: 'var(--s-5)' }}>
        <div className="panel-head">
          <div>
            <span className="kicker accent">Loyalty & FMPedigree</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>This week&apos;s training schedule</h3>
          </div>
          <span className="kicker">7 days · {trainingSessions.length} sessions queued</span>
        </div>
        <div className="training-week" style={{ borderTop: '1px solid var(--line)', padding: 'var(--s-3)' }}>
          {weekDays.map((day) => (
            <div key={day.label} className={`training-day${day.completed ? ' match' : ''}`}>
              <span className="day">{day.label} <strong>{day.num}</strong></span>
              {day.weekend ? (
                <span className="pill" style={{ marginTop: 4 }}>Matchday</span>
              ) : (
                <span className={`pill ${day.completed ? 'accent' : ''}`} style={{ marginTop: 4 }}>{day.completed ? '✓ Trained' : 'Drill idx'}</span>
              )}
              <div style={{ marginTop: 'auto' }}>
                <small className="muted" style={{ fontSize: 10 }}>{day.completed ? 'Recovery' : '—'}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function valueAttrClass(v: number) {
  if (v >= 80) return 'exc'
  if (v >= 70) return 'good'
  if (v >= 60) return 'avg'
  return 'below'
}
