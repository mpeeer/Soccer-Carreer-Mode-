import type { DynamicRating } from '../types'

interface DynamicRatingsTickerProps {
  ratings: DynamicRating[]
}

export function DynamicRatingsTicker({ ratings }: DynamicRatingsTickerProps) {
  if (ratings.length === 0) return null
  return (
    <section className="panel" style={{ overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', padding: 'var(--s-6) 0', background: 'linear-gradient(180deg, rgba(200,255,0,0.04), transparent)', borderRadius: 'var(--r-md)' }}>
        <b style={{ fontSize: 'var(--t-xl)', fontWeight: 800, background: 'linear-gradient(90deg, var(--warn), var(--good))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Northstar FC</b>
      </div>
      <div style={{ textAlign: 'center', margin: 'var(--s-4) 0' }}>
        <b className="accent" style={{ fontSize: 'var(--t-xl)', fontWeight: 800, letterSpacing: '0.04em' }}>Dynamic ratings</b>
        <p className="muted" style={{ marginTop: 4, fontSize: 'var(--t-xs)' }}>Live rating movements, today</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)' }}>
        {ratings.slice(0, 3).map((r) => (
          <div key={r.id} className="panel" style={{ padding: 'var(--s-5)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', alignItems: 'center' }}>
            <span className="kicker">Today's DVR</span>
            <b className="mono" style={{ fontSize: 44, fontWeight: 800, lineHeight: 0.9 }}>{r.rating}</b>
            <span className="pill accent">{r.change > 0 ? '▲' : '▼'} {Math.abs(r.change)}</span>
            <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{r.playerName}</small>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px dashed var(--line)', borderRadius: 'var(--r-md)', padding: 'var(--s-5)', marginTop: 'var(--s-5)' }}>
        <p className="muted" style={{ fontSize: 'var(--t-sm)', lineHeight: 1.6 }}>
          Dynamic ratings reflect form and recent performances. Strong displays earn a rating bump; poor displays trigger a dip, applied to this week's fixture ratings.
        </p>
      </div>
    </section>
  )
}
