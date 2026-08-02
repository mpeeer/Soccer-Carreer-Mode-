import type { DynamicRating } from '../types'

interface DynamicRatingsTickerProps {
  ratings: DynamicRating[]
}

export function DynamicRatingsTicker({ ratings }: DynamicRatingsTickerProps) {
  if (ratings.length === 0) {
    return null
  }
  return (
    <div className="ea-fc-theme ea-dvr-ticker">
      <div className="ea-dvr-stage">
        <span className="ea-dvr-fc27-mark">NORTHSTAR FC</span>
      </div>
      <div className="ea-dvr-title">
        <h3>DYNAMIC RATINGS</h3>
      </div>
      <div className="ea-dvr-cards">
        {ratings.slice(0, 3).map((r) => (
          <div className={`ea-dvr-card ${r.change > 0 ? 'ea-dvr-up' : 'ea-dvr-down'}`} key={r.id}>
            <span className="ea-dvr-label">TODAY'S DVR</span>
            <strong className="ea-dvr-value">{r.rating}</strong>
            <span className={`ea-dvr-delta ${r.change > 0 ? 'up' : 'down'}`}>
              {r.change > 0 ? '▲' : '▼'}{Math.abs(r.change)}
            </span>
          </div>
        ))}
      </div>
      <div className="ea-dvr-info">
        <p>
          After Dynamic Potential, Career Mode is expected to introduce Dynamic Ratings.
          <br/><br/>
          A player's overall rating will change based on their form and performances,
          with strong or poor displays having an immediate impact.
        </p>
      </div>
    </div>
  )
}
