import type { View } from '../types'
import { Icon } from '../utils'

export function AcademyView({ openModal, setActiveView }: { openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Club · Youth Academy</span>
          <h1>Academy</h1>
          <p>6 youth players · Ranked 4th of 18 · 3 prospects ready for senior training.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost"><Icon>⌕</Icon> Recruiting scouts</button>
          <button className="btn btn-primary" onClick={() => openModal('Youth tournament')}>Enter tournament <Icon>→</Icon></button>
        </div>
      </header>

      <div className="grid-3" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="metric">
          <span className="m-label">Players in system</span>
          <span className="m-value">6</span>
          <span className="m-delta positive">+1 this week</span>
        </div>
        <div className="metric">
          <span className="m-label">Academy rank</span>
          <span className="m-value">4</span>
          <span className="m-delta">of 18 clubs</span>
        </div>
        <div className="metric">
          <span className="m-label">Next intake</span>
          <span className="m-value accent">Mar</span>
          <span className="m-delta">Opening in 26 days</span>
        </div>
      </div>

      <section className="panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 240px', gap: 'var(--s-6)', padding: 'var(--s-6)', marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker accent">Top prospect</span>
          <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, letterSpacing: '-0.01em', marginTop: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>Imani Sol</h2>
          <p className="muted" style={{ fontSize: 'var(--t-md)', lineHeight: 1.6, maxWidth: 460 }}>
            17-year-old central attacking midfielder. Strong dribbling, vision, and creativity. Currently ranked #3 on the academy prospect list with 88 development pace.
          </p>
          <div style={{ marginTop: 'var(--s-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="kicker">Development progress</span>
              <b className="mono" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>88%</b>
            </div>
            <div className="bar thick"><i style={{ width: '88%' }} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-2)' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: '#df7e68', color: '#fff', fontWeight: 800, fontSize: 32,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 6px rgba(255,255,255,0.05)'
          }}>IS</div>
          <b className="accent mono" style={{ fontSize: 'var(--t-2xl)', fontWeight: 800 }}>68 <small style={{ fontSize: 11, color: 'var(--text-muted)' }}>OVR</small></b>
          <span className="kicker">U18 · CAM</span>
          <span className="pill good">Breakthrough ready</span>
        </div>
      </section>

      <div className="grid-2" style={{ gap: 'var(--s-5)' }}>
        <section className="panel flush">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Youth pipeline</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Players to watch</h3>
            </div>
            <div className="tac-tabs">
              <button className="tac-tabview active">By potential</button>
              <button className="tac-tabview">By progress</button>
              <button className="tac-tabview">By age</button>
            </div>
          </div>
          <table className="fm-table">
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Player</th>
                <th>Position</th>
                <th>Age</th>
                <th>OVR</th>
                <th>Status</th>
                <th>Progress</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Imani Sol', pos: 'CAM', age: 17, color: '#df7e68', initials: 'IS', ovr: 68, status: 'Breakthrough', progress: 88 },
                { name: 'Luca Neri', pos: 'LB', age: 16, color: '#769ddc', initials: 'LN', ovr: 62, status: 'Building', progress: 61 },
                { name: 'Sami Okafor', pos: 'ST', age: 15, color: '#5eb59c', initials: 'SO', ovr: 55, status: 'Early dev', progress: 34 },
                { name: 'Theo Vasquez', pos: 'CM', age: 17, color: '#a395e8', initials: 'TV', ovr: 64, status: 'Building', progress: 55 },
                { name: 'Mimi Fox', pos: 'GK', age: 16, color: '#e8b74c', initials: 'MF', ovr: 58, status: 'Early dev', progress: 41 },
                { name: 'Dario Lesnik', pos: 'RB', age: 15, color: '#f07f5e', initials: 'DL', ovr: 52, status: 'Trial', progress: 22 },
              ].map((p, i) => (
                <tr key={p.name}>
                  <td className="rank">{i + 1}</td>
                  <td className="name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 4, background: p.color, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 9 }}>{p.initials}</span>
                      {p.name}
                    </div>
                  </td>
                  <td><span className="chip">{p.pos}</span></td>
                  <td className="num">{p.age}</td>
                  <td><span className={`rating ${p.ovr >= 80 ? 'good' : p.ovr >= 65 ? 'avg' : 'below'}`}>{p.ovr}</span></td>
                  <td>{<span className={`pill ${p.status === 'Breakthrough' ? 'good' : p.status === 'Building' ? 'warn' : ''}`}>{p.status}</span>}</td>
                  <td>
                    <div className="bar thin" style={{ width: 80 }}>
                      <i style={{ width: `${p.progress}%` }} />
                    </div>
                  </td>
                  <td><button className="btn btn-link" onClick={() => setActiveView('playerProfile')}>Profile →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Programs</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Shape the future</h3>
            </div>
          </div>
          <div className="panel-rows">
            <button className="panel" style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 'var(--s-3) var(--s-4)', textAlign: 'left', cursor: 'pointer' }} onClick={() => openModal('Academy coaching')}>
              <span className="row-icon accent">♙</span>
              <div className="row-text"><b>Coach assignments</b><small>3 staff available · 2 open roles</small></div>
              <Icon>→</Icon>
            </button>
            <button className="panel" style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 'var(--s-3) var(--s-4)', textAlign: 'left', cursor: 'pointer' }} onClick={() => openModal('Youth recruitment')}>
              <span className="row-icon" style={{ background: 'rgba(249,115,22,0.16)', color: 'var(--r-below)' }}>⌕</span>
              <div className="row-text"><b>Expand recruitment</b><small>Explore a new regional network</small></div>
              <Icon>→</Icon>
            </button>
            <button className="panel" style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 'var(--s-3) var(--s-4)', textAlign: 'left', cursor: 'pointer' }} onClick={() => setActiveView('squad')}>
              <span className="row-icon accent">↗</span>
              <div className="row-text"><b>Promote a player</b><small>Move a prospect to senior training</small></div>
              <Icon>→</Icon>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
