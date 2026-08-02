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

export function TransferHub({ prospects, shortlist, transferList, loanList, blockedList, budget, transferComments, transferReports, onToggleShortlist, onMoveTab, onSendComment, onShowToast }: TransferHubProps) {
  const [activeTab, setActiveTab] = useState<TransferTab>('shortlist')
  const [selectedId, setSelectedId] = useState<number>(110)
  const [draftComment, setDraftComment] = useState('')

  const tabLists: Record<TransferTab, number[]> = {
    shortlist,
    transferList,
    loanList,
    blockedList,
  }
  const filteredProspects = useMemo(() => {
    const ids = tabLists[activeTab]
    return prospects.filter((p) => ids.includes(p.id))
  }, [activeTab, prospects, tabLists])

  const selected = prospects.find((p) => p.id === selectedId) ?? filteredProspects[0] ?? prospects[0]

  // Synthetic transfer fee/make-offer state
  const syntheticValue = useMemo(() => {
    const match = selected.value.match(/\d[\d.]*/)
    if (!match) return 65000000
    return Number(match[0].replace('.', '')) * 1_000_000
  }, [selected])
  const transferFee = Math.round(syntheticValue)
  const paidNow = Math.round(transferFee * 0.7)
  const futurePayments = transferFee - paidNow
  const addOns = 0
  const budgetRemaining = budget - transferFee

  return (
    <div className="ea-fc-theme ea-transfer-hub">
      {/* Top tab bar */}
      <header className="ea-top-tabs">
        <div className="ea-brand-mark" aria-label="My Career">
          <span>MC</span>
        </div>
        <nav className="ea-tab-nav">
          <button className="ea-tab ea-tab-primary">Transfers</button>
          <button className="ea-tab">Lists</button>
          <div className="ea-tab-divider" />
          <button className={`ea-tab ${activeTab === 'shortlist' ? 'ea-tab-active' : ''}`} onClick={() => setActiveTab('shortlist')}>Shortlist</button>
          <button className={`ea-tab ${activeTab === 'transferList' ? 'ea-tab-active' : ''}`} onClick={() => setActiveTab('transferList')}>Transfer List</button>
          <button className={`ea-tab ${activeTab === 'loanList' ? 'ea-tab-active' : ''}`} onClick={() => setActiveTab('loanList')}>Loan List</button>
          <button className={`ea-tab ${activeTab === 'blockedList' ? 'ea-tab-active' : ''}`} onClick={() => setActiveTab('blockedList')}>Blocked</button>
        </nav>
      </header>

      {/* Split: left list + right detail */}
      <div className="ea-hub-body">
        {/* Left: player table */}
        <section className="ea-table-panel">
          <div className="ea-table-head">
            <span>Pos</span>
            <span>World Team</span>
            <span>Name</span>
            <span>OVR</span>
            <span>Age</span>
            <span>Value (xTV)</span>
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
                <button key={p.id} className={`ea-row ${active ? 'ea-row-selected' : ''}`} onClick={() => setSelectedId(p.id)} style={{ '--row-accent': accent, '--row-tint': tint } as CSSProperties}>
                  <span className="ea-cell-pos">
                    <b>{p.position}</b>
                  </span>
                  <span className="ea-cell-team">
                    <span className="ea-flag" title={p.club}>{p.flag}</span>
                  </span>
                  <span className="ea-cell-name">
                    <b>{p.name}</b>
                  </span>
                  <span className="ea-cell-ovr"><strong>{p.rating}</strong></span>
                  <span className="ea-cell-age">{p.age}</span>
                  <span className="ea-cell-value">{p.value}</span>
                  <span className="ea-cell-status">
                    {p.interest === 'Very high' && <span className="ea-status-icon ea-status-up">↗</span>}
                    {p.interest === 'High' && <span className="ea-status-icon ea-status-mid">→</span>}
                    {p.interest === 'Medium' && <span className="ea-status-icon ea-status-mid">→</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Right: player detail */}
        <section className="ea-detail-panel" style={{ '--detail-primary': positionColors[selected.position] ?? '#1f8a5f' } as CSSProperties}>
          <div className="ea-detail-hero">
            <div className="ea-detail-placeholder">
              <PlayerPortrait initials={selected.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()} accent={positionColors[selected.position] ?? '#1f8a5f'} shirt={posNumberFor(selected.position)} size="xl" className="ea-detail-portrait" />
              <div className="ea-detail-overlay">
                <span className="ea-detail-shirt">{selected.name.split(' ').map((n) => n[0]).slice(0, 1).join('')}{posNumberFor(selected.position)}</span>
              </div>
            </div>

            <div className="ea-detail-meta">
              <div className="ea-detail-meta-row top">
                <span className="ea-detail-flags">
                  <span className="ea-detail-flag">{selected.flag}</span>
                  <span className="ea-detail-position">{selected.position}{selected.position === 'RM' ? ' · LM · ST · LW' : ` · LM · ST · LW`}</span>
                </span>
                <span className="ea-detail-rating">{selected.rating}</span>
              </div>
              <div className="ea-detail-meta-row center">
                <span className="ea-detail-name">{selected.name.toUpperCase()}</span>
              </div>
              <div className="ea-detail-meta-row contract">
                <div className="ea-contract-bar">
                  <span className="ea-contract-money">{formatMoney(selected.id * 88).slice(0, 4)} <i>M</i></span>
                  <span className="ea-contract-fee">{formatMoney(transferFee)}<i>0</i></span>
                </div>
                <div className="ea-detail-substats">
                  {['OVR','OVR','OVR','OVR'].map((l, i) => (
                    <span key={i}><i>{l}</i><b>{selected.rating - i}</b></span>
                  ))}
                </div>
                <div className="ea-interest-row">
                  <span>Player Interest</span>
                  <strong className={selected.interest === 'Very high' ? 'interest-very-high' : 'interest-medium'}>
                    {selected.interest.toUpperCase()}
                  </strong>
                </div>
              </div>
              <div className="ea-detail-meta-row bottom">
                <table className="ea-detail-table">
                  <tbody>
                    <tr><th>Age</th><td>{selected.age}</td></tr>
                    <tr><th>Expected Market Value (xTV)</th><td><b>{selected.value}</b></td></tr>
                    <tr><th>Weekly Wage</th><td><b>$480.8K</b></td></tr>
                    <tr><th>Release Clause</th><td><b>$150.0M</b></td></tr>
                  </tbody>
                </table>
                <table className="ea-detail-table second">
                  <tbody>
                    <tr><th>PAC</th><td><b>80</b></td></tr>
                    <tr><th>SHO</th><td><b>82</b></td></tr>
                    <tr><th>PAS</th><td><b>80</b></td></tr>
                    <tr><th>DRI</th><td><b>90</b></td></tr>
                    <tr><th>DEF</th><td><b>68</b></td></tr>
                    <tr><th>PHY</th><td><b>65</b></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="ea-detail-footer">
                <em>Enhanced by TransferRoom</em>
              </div>
            </div>
            <div className="ea-scout-side" style={{ '--scout-bg': positionColors[selected.position] ?? '#2563eb' } as CSSProperties}>
              <div className="ea-scout-callout">
                <span className="ea-scout-status">On call with</span>
                <strong className="ea-scout-name">Vincent Company</strong>
                <small>FC Bayern München Manager</small>
                <span className="ea-scout-avatar">VC</span>
              </div>
              <button className="ea-tension-button">Low Tension</button>
              <p className="ea-scout-message">Happy to see you. We would be willing to buy {selected.name.split(' ').slice(-1)} for a deal worth {formatMoney(syntheticValue)}.</p>
              <div className="ea-inner-player-card" style={{ '--inner-club': positionColors[selected.position] ?? '#2563eb' } as CSSProperties}>
                <span className="ea-inner-club">MASON</span>
                <span className="ea-inner-shield">{selected.flag}</span>
                <strong className="ea-inner-name">{selected.name.split(' ').slice(-1).join(' ').toUpperCase()}</strong>
                <span className="ea-inner-pos">ST</span>
                <span className="ea-inner-rating">{selected.rating}<i>OVR</i></span>
                <div className="ea-inner-meta">
                  <span><i>Age</i><b>{selected.age}</b></span>
                  <span><i>Pos</i><b>{selected.position}</b></span>
                  <span><i>OVR</i><b>{selected.rating}</b></span>
                </div>
                <span className="ea-inner-value">{selected.value}</span>
                <span className="ea-inner-wage">Weekly Wage · $140.0/0K</span>
                <em className="ea-inner-credit">Enhanced by TransferRoom</em>
              </div>
            </div>
          </div>

          {/* Comments + Match Report side panel */}
          <div className="ea-comments-panel">
            <div className="ea-comments-section">
              <h4>Negotiation thread</h4>
              <div className="ea-comments-list">
                {(transferComments[selected.id] ?? defaultComments).map((c, i) => (
                  <div key={i} className="ea-comment-item">
                    <span className="ea-comment-from">{c.from}</span>
                    <p>{c.text}</p>
                    <small>{new Date(c.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                ))}
              </div>
              <form
                className="ea-comment-input-row"
                onSubmit={(e) => { e.preventDefault(); if (draftComment.trim()) { onSendComment(selected.id, draftComment.trim()); setDraftComment(''); onShowToast('Message sent to agent') } }}
              >
                <input value={draftComment} onChange={(e) => setDraftComment(e.target.value)} placeholder={`Message ${selected.name.split(' ').slice(-1).join('')}\u2019s agent\u2026`} />
                <button type="submit" aria-label="Send message"><Icon>→</Icon></button>
              </form>
            </div>
            <div className="ea-comments-section">
              <h4>Match Report · recent</h4>
              <div className="ea-match-report-list">
                {(transferReports[selected.id] ?? defaultReports).map((m, i) => (
                  <div className="ea-match-report-row" key={i}>
                    <span className="ea-match-report-opp">{m.match}</span>
                    <span className="ea-match-report-score">{m.result}</span>
                    <span className="ea-match-report-meta">{m.minutes}\u2019 · {m.goals}G · {m.assists}A</span>
                    <span className="ea-match-report-rating">{m.rating.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRANSFER PLAYER form */}
          <div className="ea-transfer-form">
            <div className="ea-transfer-form-head">
              <h3>TRANSFER PLAYER</h3>
              <p>{selected.name.toUpperCase()} · YOUR CLUB · SCOPE WITH SELLING CLUB</p>
            </div>
            <div className="ea-transfer-grid">
              <div className="ea-transfer-row">
                <span>Start Date</span>
                <div className="ea-pill-row">
                  <button className="ea-pill active">‹ IMMEDIATE ›</button>
                </div>
              </div>
              {[
                { label: 'Transfer Fee', value: formatMoney(transferFee) },
                { label: 'Installments', value: 'NONE' },
                { label: 'Exchange Player', value: 'NONE' },
                { label: 'Achievement Bonus', value: 'NONE' },
                { label: 'Other Clauses', value: 'INCLUDED' },
              ].map((r) => (
                <div className="ea-transfer-row" key={r.label}>
                  <span>{r.label}</span>
                  <b>{r.value}</b>
                </div>
              ))}
              <div className="ea-divider" />
              <div className="ea-transfer-row"><span>Paid Now / Future Payments</span><b>{formatMoney(paidNow)} / {formatMoney(futurePayments)}.00K</b></div>
              <div className="ea-transfer-row"><span>Potential Add-Ons</span><b>$0.00K</b></div>
              <div className="ea-transfer-row"><span>Budget Remaining</span><b>{formatMoney(budgetRemaining).slice(0, 4)}M</b></div>
              <div className="ea-make-offer-row">
                <button className="ea-make-offer" onClick={() => onShowToast(`Offer of ${formatMoney(transferFee)} submitted for ${selected.name}`)}>
                  Make Offer
                </button>
              </div>
            </div>
            <div className="ea-call-controls">
              <button className="ea-end-call" onClick={() => onShowToast('Held to end negotiation')} aria-label="End negotiation">
                <span className="ea-end-call-icon">⏸</span>
              </button>
              <span>Hold to End Negotiation</span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom action footer */}
      <footer className="ea-hub-actions">
        <button className="ea-action-btn" onClick={() => onToggleShortlist(selected.id)}>
          <Icon>★</Icon>{shortlist.includes(selected.id) ? 'Remove from Shortlist' : 'Add to Shortlist'}
        </button>
        <button className="ea-action-btn" onClick={() => onMoveTab(selected.id, 'transferList')}>
          <Icon>↗</Icon>Move to Transfer List
        </button>
        <button className="ea-action-btn" onClick={() => onMoveTab(selected.id, 'loanList')}>
          <Icon>↔</Icon>Move to Loan List
        </button>
        <button className="ea-action-btn danger" onClick={() => onMoveTab(selected.id, 'blockedList')}>
          <Icon>✕</Icon>Move to Blocked
        </button>
      </footer>
    </div>
  )
}

function posNumberFor(p: Prospect['position']): string {
  const map: Record<Prospect['position'], string> = { GK: '1', CB: '5', LB: '3', RB: '2', DM: '6', CDM: '6', CM: '8', CAM: '10', AM: '10', LW: '11', LM: '11', RM: '7', RW: '7', ST: '9' }
  return map[p] ?? ''
}

// Default comments and reports used when none exist yet
const defaultComments = [
  { from: 'Vincent Company', text: 'Final figure is firm. If you want flexibility, we should split the agent fee.', at: Date.now() - 1000 * 60 * 22 },
  { from: 'You', text: 'We can move on wage structure but not on fee. Add 12% to sell-on and we close.', at: Date.now() - 1000 * 60 * 11 },
  { from: 'Vincent Company', text: 'Approved. Send the contract for signature by tomorrow.', at: Date.now() - 1000 * 60 * 4 },
]
const defaultReports = [
  { match: 'vs Sporting CP', result: 'W 3-1', minutes: 84, goals: 1, assists: 1, rating: 8.4 },
  { match: 'vs Lyon', result: 'D 1-1', minutes: 90, goals: 0, assists: 1, rating: 7.6 },
  { match: 'vs Marseille', result: 'W 4-0', minutes: 78, goals: 2, assists: 0, rating: 8.9 },
  { match: 'vs Benfica', result: 'L 1-2', minutes: 90, goals: 0, assists: 0, rating: 6.4 },
] // ── End transferHub defaults ──
