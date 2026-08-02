import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Prospect, TransferTab } from '../types'
import { positionColors, positionTints } from '../data'
import { Icon } from '../utils'
import { PlayerPortrait } from '../portraits/playerPortrait'

interface TransferHubProps {
  prospects: Prospect[]
  shortlist: number[]
  transferList: number[]
  loanList: number[]
  blockedList: number[]
  budget: number
  transferComments: Record<number, { from: string; text: string; at: number }[]>
  transferReports: Record<number, { match: string; result: string; minutes: number; goals: number; assists: number; rating: number }[]>
  onToggleShortlist: (id: number) => void
  onMoveTab: (id: number, target: Exclude<TransferTab, 'shortlist'>) => void
  onSendComment: (id: number, text: string) => void
  onShowToast: (msg: string) => void
}

const formatMoney = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

export function TransferHub({ prospects, shortlist, transferList, loanList, blockedList, budget, transferComments, onToggleShortlist, onMoveTab, onSendComment, onShowToast }: TransferHubProps) {
  const [activeTab, setActiveTab] = useState<TransferTab>('shortlist')
  const [selectedId, setSelectedId] = useState<number>(110)
  const [draftComment, setDraftComment] = useState('')

  const tabLists: Record<TransferTab, number[]> = { shortlist, transferList, loanList, blockedList }
  const filteredProspects = useMemo(() => prospects.filter((p) => tabLists[activeTab].includes(p.id)), [activeTab, prospects, shortlist])
  const selected = prospects.find((p) => p.id === selectedId) ?? filteredProspects[0] ?? prospects[0]

  const numericValue = useMemo(() => {
    const match = selected.value.match(/\d[\d.]*/)
    if (!match) return 65000000
    return Number(match[0].replace('.', '')) * 1_000_000
  }, [selected])
  const transferFee = Math.round(numericValue)
  const paidNow = Math.round(transferFee * 0.7)
  const futurePayments = transferFee - paidNow
  const budgetRemaining = budget - transferFee

  return (
    <div className="ea-fc-theme ea-transfer-hub">
      <header className="ea-top-tabs">
        <div className="ea-brand-mark"><span>NS</span></div>
        <nav className="ea-tab-nav">
          <button className="ea-tab ea-tab-primary">Lists</button>
          <div className="ea-tab-divider" />
          <button className={`ea-tab${activeTab === 'shortlist' ? ' ea-tab-active' : ''}`} onClick={() => setActiveTab('shortlist')}>Shortlist ({shortlist.length})</button>
          <button className="ea-tab" onClick={() => setActiveTab('transferList')}>Transfer list</button>
          <button className="ea-tab" onClick={() => setActiveTab('loanList')}>Loan list</button>
          <button className="ea-tab" onClick={() => setActiveTab('blockedList')}>Blocked</button>
        </nav>
      </header>

      <div className="ea-hub-body">
        {/* Left: table */}
        <section className="ea-table-panel">
          <div className="ea-table-head">
            <span>Pos</span>
            <span>Club</span>
            <span>Name</span>
            <span>OVR</span>
            <span>Age</span>
            <span>Value</span>
            <span>Status</span>
          </div>
          <div className="ea-table-rows">
            {filteredProspects.length === 0 && (
              <div className="ea-empty-rows">
                <span>No players in this list yet.</span>
                <small>Add targets from the Market view to populate this list.</small>
              </div>
            )}
            {filteredProspects.map((p) => {
              const active = selected.id === p.id
              const tint = positionTints[p.position] ?? 'rgba(148,163,184,.1)'
              const accent = positionColors[p.position] ?? '#94a3b8'
              return (
                <button
                  key={p.id}
                  className={`ea-row${active ? ' ea-row-selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                  style={{ '--row-accent': accent, '--row-tint': tint } as CSSProperties}
                >
                  <span className="ea-cell-pos"><b>{p.position}</b></span>
                  <span className="ea-cell-team"><span className="ea-flag">{p.flag}</span></span>
                  <span className="ea-cell-name"><b>{p.name}</b></span>
                  <span className="ea-cell-ovr"><strong>{p.rating}</strong></span>
                  <span className="ea-cell-age">{p.age}</span>
                  <span className="ea-cell-value">{p.value}</span>
                  <span className="ea-cell-status">
                    {p.interest === 'Very high' && <span className="ea-status-icon ea-status-up">↗</span>}
                    {(p.interest === 'High' || p.interest === 'Medium') && <span className="ea-status-icon ea-status-mid">→</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Right: detail + form */}
        <section className="ea-detail-panel" style={{ '--detail-primary': positionColors[selected.position] ?? '#1f8a5f' } as CSSProperties}>
          {/* Hero */}
          <div className="ea-detail-hero">
            <div className="ea-detail-placeholder">
              <PlayerPortrait
                initials={selected.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                accent={positionColors[selected.position] ?? '#1f8a5f'}
                shirt={posNumberFor(selected.position)}
                size="xl"
                className="ea-detail-portrait"
              />
              <div className="ea-detail-overlay">
                <span className="ea-detail-shirt">{posNumberFor(selected.position)}</span>
              </div>
            </div>

            <div className="ea-detail-meta">
              <div className="ea-detail-meta-row top">
                <span className="ea-detail-flags">
                  <span className="ea-detail-flag">{selected.flag}</span>
                  <span className="ea-detail-position">{selected.position}</span>
                </span>
                <span className="ea-detail-rating">{selected.rating}</span>
              </div>
              <div className="ea-detail-meta-row center">
                <span className="ea-detail-name">{selected.name.toUpperCase()}</span>
              </div>
              <div className="ea-detail-meta-row contract">
                <div className="ea-contract-bar">
                  <span className="ea-contract-money">{selected.value}</span>
                  <span className="ea-contract-fee">Age {selected.age}</span>
                </div>
                <div className="ea-detail-substats">
                  <span><i>OVR</i><b>{selected.rating}</b></span>
                  <span><i>POS</i><b>{selected.position}</b></span>
                  <span><i>POT</i><b>{selected.potential.split('–')[1] ?? selected.potential}</b></span>
                  <span><i>AGE</i><b>{selected.age}</b></span>
                </div>
                <div className="ea-interest-row">
                  <span>Interest</span>
                  <strong className={selected.interest === 'Very high' ? 'interest-very-high' : 'interest-medium'}>{selected.interest.toUpperCase()}</strong>
                </div>
              </div>
              <div className="ea-detail-meta-row bottom">
                <table className="ea-detail-table">
                  <tbody>
                    <tr><th>Club</th><td>{selected.club}</td></tr>
                    <tr><th>Value</th><td><b>{selected.value}</b></td></tr>
                    <tr><th>Contract</th><td><b>4 yrs</b></td></tr>
                    <tr><th>Release clause</th><td><b>None</b></td></tr>
                  </tbody>
                </table>
                <table className="ea-detail-table second">
                  <tbody>
                    <tr><th>PAC</th><td><b>{selected.rating - 8}</b></td></tr>
                    <tr><th>SHO</th><td><b>{selected.rating - 4}</b></td></tr>
                    <tr><th>PAS</th><td><b>{selected.rating - 6}</b></td></tr>
                    <tr><th>DRI</th><td><b>{selected.rating}</b></td></tr>
                    <tr><th>DEF</th><td><b>{Math.max(30, selected.rating - 30)}</b></td></tr>
                    <tr><th>PHY</th><td><b>{selected.rating - 12}</b></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comments + Match Report */}
          <div className="ea-comments-panel">
            <div className="ea-comments-section">
              <h4>Negotiation thread</h4>
              <div className="ea-comments-list">
                {(transferComments[selected.id] ?? defaultComments).map((c: { from: string; text: string; at: number }, i: number) => (
                  <div key={i} className="ea-comment-item">
                    <span className="ea-comment-from">{c.from}</span>
                    <p>{c.text}</p>
                    <small>{new Date(c.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                ))}
              </div>
              <form
                className="ea-comment-input-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (draftComment.trim()) {
                    onSendComment(selected.id, draftComment.trim())
                    setDraftComment('')
                    onShowToast('Message sent')
                  }
                }}
              >
                <input
                  value={draftComment}
                  onChange={(e) => setDraftComment(e.target.value)}
                  placeholder={`Message agent for ${selected.name.split(' ').slice(-1).join('')}`}
                />
                <button type="submit" aria-label="Send"><Icon>→</Icon></button>
              </form>
            </div>
            <div className="ea-comments-section">
              <h4>Recent matches</h4>
              <div className="ea-match-report-list">
                {defaultReports.map((m, i) => (
                  <div className="ea-match-report-row" key={i}>
                    <span className="ea-match-report-opp">{m.match}</span>
                    <span className="ea-match-report-score">{m.result}</span>
                    <span className="ea-match-report-meta">{m.minutes}' · {m.goals}G · {m.assists}A</span>
                    <span className="ea-match-report-rating">{m.rating.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transfer form */}
          <div className="ea-transfer-form">
            <div className="ea-transfer-form-head">
              <h3>Submit offer</h3>
              <p>SCOPE WITH SELLING CLUB · {selected.name.toUpperCase()}</p>
            </div>
            <div className="ea-transfer-grid">
              <div className="ea-transfer-row">
                <span>Start date</span>
                <button className="ea-pill active">‹ Immediate ›</button>
              </div>
              <div className="ea-transfer-row"><span>Transfer fee</span><b>{formatMoney(transferFee)}</b></div>
              <div className="ea-transfer-row"><span>Installments</span><b>None</b></div>
              <div className="ea-transfer-row"><span>Exchange player</span><b>None</b></div>
              <div className="ea-transfer-row"><span>Achievement bonus</span><b>None</b></div>
              <div className="ea-transfer-row"><span>Other clauses</span><b>Included</b></div>
              <div className="ea-divider" />
              <div className="ea-transfer-row"><span>Paid now</span><b>{formatMoney(paidNow)}</b></div>
              <div className="ea-transfer-row"><span>Future payments</span><b>{formatMoney(futurePayments)}</b></div>
              <div className="ea-transfer-row"><span>Budget remaining</span><b>{formatMoney(budgetRemaining)}</b></div>
              <div className="ea-make-offer-row">
                <button
                  className="ea-make-offer"
                  onClick={() => onShowToast(`Offer of ${formatMoney(transferFee)} submitted for ${selected.name}`)}
                >
                  Make offer
                </button>
              </div>
            </div>
            <div className="ea-call-controls">
              <button className="ea-end-call" onClick={() => onShowToast('Negotiation ended')} aria-label="End negotiation">
                <span className="ea-end-call-icon">⏸</span>
              </button>
              <span>Hold to end</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="ea-hub-actions">
        <button className="ea-action-btn" onClick={() => onToggleShortlist(selected.id)}>
          <Icon>★</Icon>{shortlist.includes(selected.id) ? 'Remove from shortlist' : 'Add to shortlist'}
        </button>
        <button className="ea-action-btn" onClick={() => onMoveTab(selected.id, 'transferList')}>
          <Icon>↗</Icon>Move to transfer list
        </button>
        <button className="ea-action-btn" onClick={() => onMoveTab(selected.id, 'loanList')}>
          <Icon>↔</Icon>Move to loan list
        </button>
        <button className="ea-action-btn danger" onClick={() => onMoveTab(selected.id, 'blockedList')}>
          <Icon>✕</Icon>Move to blocked
        </button>
      </footer>
    </div>
  )
}

function posNumberFor(p: Prospect['position']): string {
  const map: Record<Prospect['position'], string> = { GK: '1', CB: '5', LB: '3', RB: '2', DM: '6', CDM: '6', CM: '8', CAM: '10', AM: '10', LW: '11', LM: '11', RM: '7', RW: '7', ST: '9' }
  return map[p] ?? ''
}

const defaultComments = [
  { from: 'Selling club', text: 'Final figure is firm. If you want flexibility, we should split the agent fee.', at: Date.now() - 1000 * 60 * 22 },
  { from: 'You', text: 'We can move on wage structure but not on fee. Add 12% to sell-on and we close.', at: Date.now() - 1000 * 60 * 11 },
  { from: 'Selling club', text: 'Approved. Send the contract for signature by tomorrow.', at: Date.now() - 1000 * 60 * 4 },
]
const defaultReports = [
  { match: 'vs Sporting CP', result: 'W 3-1', minutes: 84, goals: 1, assists: 1, rating: 8.4 },
  { match: 'vs Lyon', result: 'D 1-1', minutes: 90, goals: 0, assists: 1, rating: 7.6 },
  { match: 'vs Marseille', result: 'W 4-0', minutes: 78, goals: 2, assists: 0, rating: 8.9 },
  { match: 'vs Benfica', result: 'L 1-2', minutes: 90, goals: 0, assists: 0, rating: 6.4 },
]
