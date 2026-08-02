import { PageHeader } from './pageHeader'
import type { View } from '../types'
import { Icon } from '../utils'

export function AcademyView({ openModal, setActiveView }: { openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return (
    <>
      <PageHeader
        eyebrow={`Academy · 6 players`}
        title="Academy"
        description="6 youth players · Ranked 4th of 18"
        action={<button className="btn btn-primary" onClick={() => openModal('Youth tournament')}>Enter tournament <Icon>→</Icon></button>}
      />

      <section className="panel" style={{ display: 'flex', gap: 'var(--s-6)', padding: 'var(--s-7)', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <span className="pill accent" style={{ marginBottom: 'var(--s-3)' }}>✦ Academy spotlight</span>
          <h2 style={{ fontSize: 'var(--t-2xl)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 'var(--s-3)', marginTop: 'var(--s-2)' }}>Top prospects in the pipeline</h2>
          <p className="muted" style={{ fontSize: 'var(--t-md)', lineHeight: 1.6, maxWidth: 460 }}>Performance data updates weekly. Top 3 earn an invite to the National Youth Series.</p>
          <div style={{ marginTop: 'var(--s-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="kicker">Academy ranking</span>
              <b className="mono" style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>4 <span style={{ color: 'var(--text-muted)', fontSize: 'var(--t-sm)' }}>of 18</span></b>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-2)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#df7e68', color: '#fff', fontWeight: 800, fontSize: 28,
            display: 'grid', placeItems: 'center',
          }}>IS</div>
          <b className="accent mono" style={{ fontSize: 'var(--t-2xl)', fontWeight: 800 }}>68 <small style={{ fontSize: 11, color: 'var(--text-muted)' }}>OVR</small></b>
          <div style={{ textAlign: 'center' }}>
            <span className="kicker">U18 · CAM</span>
            <b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>Imani Sol</b>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.9fr)', gap: 'var(--s-5)', marginTop: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div><span className="kicker">Youth pipeline</span><h3>Players to watch</h3></div>
            <button className="btn btn-link" onClick={() => openModal('Full academy list')}>View all <Icon>→</Icon></button>
          </div>
          <div className="panel-rows">
            <YouthRow name="Imani Sol" detail="CAM · 17 yrs" rating="68" status="Breakthrough ready" color="#df7e68" progress={88} />
            <YouthRow name="Luca Neri" detail="LB · 16 yrs" rating="62" status="Building momentum" color="#769ddc" progress={61} />
            <YouthRow name="Sami Okafor" detail="ST · 15 yrs" rating="55" status="Early development" color="#5eb59c" progress={34} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><span className="kicker">Programs</span><h3>Shape the future</h3></div>
          </div>
          <button className="panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginTop: 'var(--s-3)', textAlign: 'left', padding: 'var(--s-4) var(--s-5)' }} onClick={() => openModal('Academy coaching')}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>♙</span>
            <div style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 'var(--t-md)' }}>Coach assignments</b><small className="muted" style={{ fontSize: 'var(--t-xs)' }}>3 staff available · 2 open roles</small></div>
            <Icon>→</Icon>
          </button>
          <button className="panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginTop: 'var(--s-3)', textAlign: 'left', padding: 'var(--s-4) var(--s-5)' }} onClick={() => openModal('Youth recruitment')}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(240,160,64,0.12)', color: 'var(--warn)', display: 'grid', placeItems: 'center' }}>⌕</span>
            <div style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 'var(--t-md)' }}>Expand recruitment</b><small className="muted" style={{ fontSize: 'var(--t-xs)' }}>Explore a new regional network</small></div>
            <Icon>→</Icon>
          </button>
          <button className="panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginTop: 'var(--s-3)', textAlign: 'left', padding: 'var(--s-4) var(--s-5)' }} onClick={() => setActiveView('squad')}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>↗</span>
            <div style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 'var(--t-md)' }}>Promote a player</b><small className="muted" style={{ fontSize: 'var(--t-xs)' }}>Move a prospect to senior training</small></div>
            <Icon>→</Icon>
          </button>
        </section>
      </div>
    </>
  )
}

export function YouthRow({ name, detail, rating, status, color, progress }: { name: string; detail: string; rating: string; status: string; color: string; progress: number }) {
  return (
    <div className="panel-row">
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: color, color: '#fff', fontWeight: 700, fontSize: 13,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>{name.split(' ').map((word) => word[0]).join('')}</div>
      <div className="row-text"><b>{name}</b><small>{detail}</small></div>
      <b className="accent mono" style={{ fontSize: 'var(--t-md)' }}>{rating}</b>
      <div style={{ width: 100 }}>
        <small className="kicker" style={{ fontSize: 10 }}>{status}</small>
        <div className="bar thin" style={{ marginTop: 4 }}><i style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  )
}
