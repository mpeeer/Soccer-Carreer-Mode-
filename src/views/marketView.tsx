import { PageHeader } from './pageHeader'
import { formatMoney } from '../utils'
import type { Prospect } from '../types'
import { Icon } from '../utils'

/* ──────────────────────────────────────────────────────────────
   MARKET — discover, shortlist, scout
   ────────────────────────────────────────────────────────────── */
export function MarketView({ filteredProspects, search, setSearch, marketFilter, setMarketFilter, shortlist, scouted, negotiations, toggleShortlist, scoutProspect, startNegotiation, budget, openModal }: { filteredProspects: Prospect[]; search: string; setSearch: (value: string) => void; marketFilter: 'All' | 'Shortlist' | 'Scouted'; setMarketFilter: (value: 'All' | 'Shortlist' | 'Scouted') => void; shortlist: number[]; scouted: number[]; negotiations: number[]; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void; budget: number; openModal: (title: string) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Transfer market · Window open"
        title="Market"
        description={`Budget ${formatMoney(budget)} · Window closes in 14 days`}
        action={
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4, padding: 'var(--s-3) var(--s-4)',
            border: '1px solid var(--accent-line)', background: 'var(--accent-dim)',
            borderRadius: 'var(--r-sm)', alignItems: 'flex-start',
          }}>
            <span className="kicker accent">Budget available</span>
            <b className="accent mono" style={{ fontSize: 'var(--t-lg)' }}>{formatMoney(budget)}</b>
          </div>
        }
      />

      <section className="panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-4) var(--s-5)' }}>
        <div className="market-tabs" style={{ display: 'flex', gap: 4 }}>
          <button className={`btn btn-sm ${marketFilter === 'All' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMarketFilter('All')}>Discover <span className="muted">{filteredProspects.length}</span></button>
          <button className={`btn btn-sm ${marketFilter === 'Shortlist' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMarketFilter('Shortlist')}>Shortlist <span className="muted">{shortlist.length}</span></button>
          <button className={`btn btn-sm ${marketFilter === 'Scouted' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMarketFilter('Scouted')}>Reports <span className="muted">{scouted.length}</span></button>
        </div>
        <label style={{
          height: 36, padding: '0 var(--s-3)', display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--line-strong)', borderRadius: 'var(--r-sm)',
          background: 'var(--surface-2)', color: 'var(--text-muted)', minWidth: 240, marginLeft: 'auto',
        }}>
          <Icon>⌕</Icon>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search player, position or club"
            style={{ background: 'transparent', border: 0, outline: 0, color: 'var(--text)', flex: 1, minWidth: 0, fontSize: 'var(--t-sm)' }}
          />
        </label>
        <button className="btn btn-ghost btn-sm" onClick={() => openModal('Advanced filters')}>
          <Icon>≡</Icon> Filters
        </button>
      </section>

      <section className="panel" style={{ padding: 'var(--s-4) var(--s-5)', marginTop: 'var(--s-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
          <div>
            <b className="accent mono" style={{ fontSize: 'var(--t-2xl)', fontWeight: 700 }}>{filteredProspects.length}</b>
            <span className="muted" style={{ display: 'block', fontSize: 'var(--t-xs)' }}>targets in view</span>
          </div>
          <div style={{ height: 36, width: 1, background: 'var(--line)' }} />
          <div>
            <span className="kicker">Brief</span>
            <b style={{ display: 'block', fontSize: 'var(--t-sm)' }}>U21 · High potential · Attack</b>
          </div>
          <button className="btn btn-link" onClick={() => openModal('Recruitment brief')} style={{ marginLeft: 'auto' }}>
            Edit brief <Icon>→</Icon>
          </button>
        </div>
      </section>

      {filteredProspects.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 'var(--s-9)' }}>
          <div style={{ fontSize: 32, marginBottom: 'var(--s-3)' }}>⌕</div>
          <h3 style={{ fontSize: 'var(--t-lg)', fontWeight: 700 }}>No targets found</h3>
          <p className="muted" style={{ marginTop: 6 }}>Try a wider search or switch back to Discover.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--s-4)', marginTop: 'var(--s-5)' }}>
          {filteredProspects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              isShortlisted={shortlist.includes(prospect.id)}
              isScouted={scouted.includes(prospect.id)}
              isNegotiating={negotiations.includes(prospect.id)}
              toggleShortlist={toggleShortlist}
              scoutProspect={scoutProspect}
              startNegotiation={startNegotiation}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   PROSPECT CARD — single tile
   ────────────────────────────────────────────────────────────── */
export function ProspectCard({ prospect, isShortlisted, isScouted, isNegotiating, toggleShortlist, scoutProspect, startNegotiation }: { prospect: Prospect; isShortlisted: boolean; isScouted: boolean; isNegotiating: boolean; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void }) {
  return (
    <article className="panel flush" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: 'var(--s-3) var(--s-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
      }}>
        <span className="kicker">SCOUT 0{prospect.id - 100}</span>
        <button
          onClick={() => toggleShortlist(prospect.id)}
          aria-label="Toggle shortlist"
          style={{ color: isShortlisted ? 'var(--warn)' : 'var(--text-dim)', fontSize: 18, background: 'transparent', border: 0, cursor: 'pointer' }}
        >
          ★
        </button>
      </div>
      <div style={{
        position: 'relative', height: 120,
        background: `linear-gradient(140deg, ${prospect.color}, #0e1428)`,
        display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          fontWeight: 700, fontSize: 18,
          display: 'grid', placeItems: 'center',
          marginBottom: -10,
        }}>{prospect.name.split(' ').map((word) => word[0]).join('')}</div>
        <div style={{
          position: 'absolute', right: 10, bottom: 10,
          padding: '2px 8px', background: 'rgba(0,0,0,0.55)',
          borderRadius: 'var(--r-xs)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        }}>{prospect.flag}</div>
      </div>
      <div style={{ padding: 'var(--s-4) var(--s-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <b style={{ display: 'block', fontSize: 'var(--t-md)', fontWeight: 700 }}>{prospect.name}</b>
            <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{prospect.club} · {prospect.age} yrs</small>
          </div>
          <b className="accent mono" style={{ fontSize: 'var(--t-3xl)', fontWeight: 800, lineHeight: 1 }}>{prospect.rating}</b>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-4)', marginTop: 'var(--s-4)' }}>
          <div>
            <small className="kicker">Position</small>
            <div style={{ marginTop: 4 }}><span className="chip">{prospect.position}</span></div>
          </div>
          <div>
            <small className="kicker">Potential</small>
            <b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)' }}>{prospect.potential}</b>
          </div>
          <div>
            <small className="kicker">Value</small>
            <b className="mono" style={{ display: 'block', fontSize: 'var(--t-sm)' }}>{prospect.value}</b>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'var(--s-3)' }}>
          {prospect.tags.map((tag) => (
            <span key={tag} className="pill">{tag}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--s-4)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--line)' }}>
          <span className="kicker">Player interest</span>
          <b style={{
            fontSize: 'var(--t-sm)', fontWeight: 700,
            color: prospect.interest === 'Very high' ? 'var(--good)' : prospect.interest === 'High' ? 'var(--accent)' : 'var(--text-muted)',
          }}>{prospect.interest}</b>
        </div>
      </div>
      <div style={{ padding: 'var(--s-3) var(--s-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => scoutProspect(prospect.id)}>
          {isScouted ? 'Report ready' : 'Request report'}
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => startNegotiation(prospect.id)}>
          {isNegotiating ? 'Negotiating' : 'Enquire'}
        </button>
      </div>
    </article>
  )
}
