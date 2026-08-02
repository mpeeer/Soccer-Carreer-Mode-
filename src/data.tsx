import type { Position, Player, PlayerSkills, Fixture, ClubOffer, Prospect, TrainingSession, TransferApproach, View, CareerProfile, OnboardingSave, DynamicRating, FormationSlot, FormationId, Formation, Tactics } from './types'

// ── Storage keys ──
export const SAVE_KEY = 'northstar-career-save'
export const PROFILE_KEY = 'northstar-career-profile'
export const ONBOARDING_KEY = 'northstar-career-onboarding'
export const LEGACY_SAVE_BACKUP_KEY = 'northstar-career-save-legacy-backup'
export const CURRENT_SAVE_VERSION = 2

// ── Valid positions ──
export const validPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

// ── Skill generator ──
export function randomSkillsForPosition(pos: Position, baseRating: number): PlayerSkills {
  const r = baseRating
  return pos === 'GK' ? { pace: r - 12, shooting: r - 30, passing: r - 8, dribbling: r - 22, physical: r - 4 } :
    pos === 'CB' ? { pace: r - 5, shooting: r - 22, passing: r - 10, dribbling: r - 18, physical: r } :
    pos === 'LB' || pos === 'RB' ? { pace: r, shooting: r - 14, passing: r - 5, dribbling: r - 6, physical: r - 5 } :
    pos === 'DM' ? { pace: r - 10, shooting: r - 14, passing: r - 2, dribbling: r - 8, physical: r - 2 } :
    pos === 'CM' ? { pace: r - 8, shooting: r - 6, passing: r, dribbling: r - 4, physical: r - 5 } :
    pos === 'AM' ? { pace: r - 4, shooting: r - 2, passing: r, dribbling: r, physical: r - 10 } :
    pos === 'LW' || pos === 'RW' ? { pace: r, shooting: r - 5, passing: r - 5, dribbling: r, physical: r - 12 } :
    { pace: r - 2, shooting: r, passing: r - 6, dribbling: r - 2, physical: r - 4 } // ST
}

// ── Players (EA FC 27-style enriched roster) ──
export const initialPlayers: Player[] = [
  { id: 1, name: 'Milo Vardic', position: 'GK', rating: 78, potential: 80, age: 29, form: 88, morale: 90, fitness: 92, value: 18500000, wage: 42000, contract: 2, role: 'First team', initials: 'MV', color: '#1f8a5f', skills: randomSkillsForPosition('GK', 78), club: 'NORTHSTAR FC', flag: 'HQ', dob: '14 MAR 1997', height: '6\'2"', weight: '176 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 1, shirtNumber: 89, releaseClause: 22000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 2, name: 'Eliot Van Doren', position: 'CB', rating: 81, potential: 84, age: 27, form: 85, morale: 91, fitness: 88, value: 32000000, wage: 56000, contract: 3, role: 'Crucial', initials: 'EV', color: '#1f8a5f', skills: randomSkillsForPosition('CB', 81), club: 'NORTHSTAR FC', flag: 'HQ', dob: '02 NOV 1999', height: '6\'3"', weight: '185 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 2, shirtNumber: 4, releaseClause: 40000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 1 },
  { id: 3, name: 'Rayan Kessler', position: 'CB', rating: 76, potential: 82, age: 22, form: 80, morale: 82, fitness: 95, value: 16500000, wage: 24000, contract: 4, role: 'Rotation', initials: 'RK', color: '#1f8a5f', skills: randomSkillsForPosition('CB', 76), club: 'NORTHSTAR FC', flag: 'HQ', dob: '16 SEP 2004', height: '6\'1"', weight: '172 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 2, shirtNumber: 5, releaseClause: 18000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 4, name: 'Juno Marsetti', position: 'LB', rating: 80, potential: 85, age: 24, form: 86, morale: 89, fitness: 91, value: 28000000, wage: 38000, contract: 3, role: 'First team', initials: 'JM', color: '#1f8a5f', skills: randomSkillsForPosition('LB', 80), club: 'NORTHSTAR FC', flag: 'HQ', dob: '21 JUN 2002', height: '5\'9"', weight: '156 LBS', preferredFoot: 'Left', weakFoot: 4, skillMoves: 3, shirtNumber: 3, releaseClause: 35000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: -1 },
  { id: 5, name: 'Tomas Osei', position: 'RB', rating: 75, potential: 79, age: 26, form: 72, morale: 76, fitness: 79, value: 11000000, wage: 27000, contract: 1, role: 'Rotation', initials: 'TO', color: '#1f8a5f', skills: randomSkillsForPosition('RB', 75), club: 'NORTHSTAR FC', flag: 'HQ', dob: '11 APR 2000', height: '5\'10"', weight: '162 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 2, shirtNumber: 2, releaseClause: 14000000, matchFitness: 'Decent', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 6, name: 'Soren Halvik', position: 'DM', rating: 82, potential: 85, age: 25, form: 87, morale: 94, fitness: 90, value: 41000000, wage: 61000, contract: 4, role: 'Crucial', initials: 'SH', color: '#1f8a5f', skills: randomSkillsForPosition('DM', 82), club: 'NORTHSTAR FC', flag: 'HQ', dob: '07 JUL 2001', height: '6\'0"', weight: '172 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 3, shirtNumber: 6, releaseClause: 50000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 1 },
  { id: 7, name: 'Nico Bellori', position: 'CM', rating: 79, potential: 88, age: 21, form: 90, morale: 92, fitness: 87, value: 36500000, wage: 31000, contract: 5, role: 'First team', initials: 'NB', color: '#1f8a5f', skills: randomSkillsForPosition('CM', 79), club: 'NORTHSTAR FC', flag: 'HQ', dob: '03 FEB 2005', height: '5\'11"', weight: '165 LBS', preferredFoot: 'Right', weakFoot: 4, skillMoves: 4, shirtNumber: 8, releaseClause: 45000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: -2 },
  { id: 8, name: 'Arden Kova', position: 'CM', rating: 77, potential: 80, age: 28, form: 76, morale: 80, fitness: 93, value: 15000000, wage: 35000, contract: 2, role: 'Rotation', initials: 'AK', color: '#1f8a5f', skills: randomSkillsForPosition('CM', 77), club: 'NORTHSTAR FC', flag: 'HQ', dob: '30 SEP 1998', height: '5\'10"', weight: '161 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 3, shirtNumber: 14, releaseClause: 18000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 9, name: 'Lio Santoro', position: 'AM', rating: 84, potential: 89, age: 23, form: 92, morale: 96, fitness: 86, value: 59000000, wage: 77000, contract: 4, role: 'Crucial', initials: 'LS', color: '#1f8a5f', skills: randomSkillsForPosition('AM', 84), club: 'NORTHSTAR FC', flag: 'HQ', dob: '12 MAR 2003', height: '5\'9"', weight: '154 LBS', preferredFoot: 'Right', weakFoot: 4, skillMoves: 4, shirtNumber: 10, releaseClause: 80000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 4 },
  { id: 10, name: 'Jae Min-Ro', position: 'LW', rating: 80, potential: 87, age: 22, form: 83, morale: 90, fitness: 89, value: 33000000, wage: 44000, contract: 3, role: 'First team', initials: 'JR', color: '#1f8a5f', skills: randomSkillsForPosition('LW', 80), club: 'NORTHSTAR FC', flag: 'HQ', dob: '05 MAY 2004', height: '5\'8"', weight: '146 LBS', preferredFoot: 'Right', weakFoot: 4, skillMoves: 4, shirtNumber: 11, releaseClause: 42000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 11, name: 'Erlon Hyland', position: 'ST', rating: 86, potential: 91, age: 25, form: 90, morale: 95, fitness: 94, value: 78000000, wage: 105000, contract: 4, role: 'Crucial', initials: 'EH', color: '#1f8a5f', skills: randomSkillsForPosition('ST', 86), club: 'NORTHSTAR FC', flag: 'HQ', dob: '20 AUG 2001', height: '6\'1"', weight: '180 LBS', preferredFoot: 'Right', weakFoot: 3, skillMoves: 3, shirtNumber: 9, releaseClause: 95000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 2 },
  { id: 12, name: 'Dario Venn', position: 'RW', rating: 74, potential: 83, age: 19, form: 78, morale: 84, fitness: 97, value: 12500000, wage: 17000, contract: 5, role: 'Prospect', initials: 'DV', color: '#1f8a5f', skills: randomSkillsForPosition('RW', 74), club: 'NORTHSTAR FC', flag: 'HQ', dob: '08 OCT 2007', height: '5\'7"', weight: '138 LBS', preferredFoot: 'Right', weakFoot: 4, skillMoves: 4, shirtNumber: 7, releaseClause: 20000000, matchFitness: 'Sharp', condition: 'Ready to Play', dynamicChange: 0 },
  { id: 13, name: 'Cal Rook', position: 'CB', rating: 70, potential: 78, age: 20, form: 70, morale: 73, fitness: 100, value: 6000000, wage: 11000, contract: 3, role: 'Prospect', initials: 'CR', color: '#1f8a5f', skills: randomSkillsForPosition('CB', 70), club: 'NORTHSTAR FC', flag: 'HQ', dob: '14 JAN 2006', height: '6\'2"', weight: '170 LBS', preferredFoot: 'Right', weakFoot: 2, skillMoves: 1, shirtNumber: 17, releaseClause: 8000000, matchFitness: 'Decent', condition: 'Ready to Play', dynamicChange: 0 },
]

// ── Fixtures ──
export const baseFixtures: Fixture[] = [
  { opponent: 'Redhaven United', short: 'RU', date: 'SAT, AUG 16', competition: 'Premier Division', home: true, difficulty: 'Medium', crest: '#e96a59' },
  { opponent: 'Violet Town', short: 'VT', date: 'WED, AUG 20', competition: 'Continental Cup · Qualifier', home: false, difficulty: 'High', crest: '#8e73d4' },
  { opponent: 'Oldcastle Rovers', short: 'OR', date: 'SUN, AUG 24', competition: 'Premier Division', home: true, difficulty: 'Low', crest: '#56a98e' },
  { opponent: 'Kingsport Athletic', short: 'KA', date: 'SAT, AUG 30', competition: 'Premier Division', home: false, difficulty: 'High', crest: '#e6ae52' },
]

export function formatFixtureDate(index: number) {
  const date = new Date(Date.UTC(2026, 7, 15 + index * 7))
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase()}`
}

export const seasonFixtures: Fixture[] = Array.from({ length: 38 }, (_, index) => ({
  ...baseFixtures[index % baseFixtures.length],
  date: formatFixtureDate(index),
  home: index % 2 === 0,
}))

// ── Transfer market prospects (EA FC 27-style columns) ──
export const prospects: Prospect[] = [
  { id: 101, name: 'D. Udogie', position: 'LB', age: 23, rating: 80, potential: '85–88', value: '€49.0M', interest: 'High', club: 'Tottenham', flag: 'ENG', color: '#0f4d92', tags: ['Inverted FB'] },
  { id: 102, name: 'A. Gray', position: 'CDM', age: 20, rating: 75, potential: '86–89', value: '€47.0M', interest: 'High', club: 'Everton', flag: 'ENG', color: '#1a4d8f', tags: ['Box-to-box'] },
  { id: 103, name: 'A. Bouaddi', position: 'CDM', age: 18, rating: 73, potential: '84–91', value: '€20.0M', interest: 'Medium', club: 'LOSC Lille', flag: 'FRA', color: '#d40000', tags: ['Ball winner'] },
  { id: 104, name: 'A. Wharton', position: 'CM', age: 22, rating: 79, potential: '86–89', value: '€64.0M', interest: 'High', club: 'Crystal Palace', flag: 'ENG', color: '#1a4d8f', tags: ['Deep playmaker'] },
  { id: 110, name: 'J. Musiala', position: 'CAM', age: 23, rating: 88, potential: '92–95', value: '€177.0M', interest: 'Very high', club: 'Bayern München', flag: 'GER', color: '#dc052d', tags: ['Playmaker', 'Dribbler'] },
  { id: 106, name: 'K. Yıldız', position: 'CAM', age: 21, rating: 79, potential: '88–92', value: '€36.0M', interest: 'High', club: 'Juventus', flag: 'TUR', color: '#000000', tags: ['Inverted winger'] },
  { id: 107, name: 'M. Olise', position: 'RM', age: 24, rating: 86, potential: '89–92', value: '€107.0M', interest: 'Very high', club: 'Bayern München', flag: 'FRA', color: '#dc052d', tags: ['Flair', 'Playmaker'] },
  { id: 108, name: 'N. Williams', position: 'LB', age: 23, rating: 81, potential: '86–89', value: '€58.0M', interest: 'High', club: 'Athletic Club', flag: 'ESP', color: '#ee2523', tags: ['Wing-back'] },
  { id: 109, name: 'V. Gyökeres', position: 'ST', age: 27, rating: 87, potential: '88–90', value: '€120.0M', interest: 'Very high', club: 'Sporting CP', flag: 'SWE', color: '#008b5e', tags: ['Poacher', 'Press'] },
  { id: 105, name: 'N. Nanda', position: 'ST', age: 25, rating: 81, potential: '85–88', value: '€63.0M', interest: 'High', club: 'Marseille', flag: 'FRA', color: '#2faee0', tags: ['Target man'] },
  { id: 111, name: 'P. Foden', position: 'CM', age: 25, rating: 87, potential: '90–92', value: '€140.0M', interest: 'Very high', club: 'Man City', flag: 'ENG', color: '#6cabdd', tags: ['Creator'] },
  { id: 112, name: 'R. Cherki', position: 'CAM', age: 22, rating: 83, potential: '88–91', value: '€75.0M', interest: 'High', club: 'Lyon', flag: 'FRA', color: '#1a4d8f', tags: ['Dribbler'] },
]

// ── Club offer pool ──
export const clubOfferPool: ClubOffer[] = [
  { id: 'redhaven', clubName: 'Redhaven United', clubShort: 'RU', league: 'Premier Division', identity: 'The sleeping giant', philosophy: 'Immediate results', description: 'A proud club with a restless fanbase, a strong squad core, and no patience for a slow start.', primaryColor: '#e96a59', secondaryColor: '#f4c46d', pros: ['Experienced squad core', 'Strong home support'], cons: ['Board demands a top-six finish', 'Limited patience for experiments'], managerBudget: 54000000, managerTrust: 67, playerRating: 68, playerPotential: 84, playerWage: 7200, playerRole: 'Prospect', playerTraining: 46, managerResultBoost: 1, managerBudgetGrowth: 250000, playerTrainingBonus: -1, playerTrustModifier: -1 },
  { id: 'violet', clubName: 'Violet Town', clubShort: 'VT', league: 'Continental League', identity: 'The academy project', philosophy: 'Youth development', description: 'A technical club built around young players, patient coaching, and a clear pathway to the first team.', primaryColor: '#8e73d4', secondaryColor: '#b8a3ff', pros: ['Excellent training facilities', 'Young players get minutes'], cons: ['Small transfer budget', 'Results can take time'], managerBudget: 30500000, managerTrust: 81, playerRating: 67, playerPotential: 89, playerWage: 5800, playerRole: 'First team', playerTraining: 64, managerResultBoost: 0, managerBudgetGrowth: 100000, playerTrainingBonus: 3, playerTrustModifier: 2 },
  { id: 'oldcastle', clubName: 'Oldcastle Rovers', clubShort: 'OR', league: 'Premier Division', identity: 'The community club', philosophy: 'Stability first', description: 'A grounded club where trust is earned locally and every decision is measured against the supporters.', primaryColor: '#56a98e', secondaryColor: '#d9e6a3', pros: ['Supporters give time', 'Balanced finances'], cons: ['Modest facilities', 'Lower squad ceiling'], managerBudget: 39000000, managerTrust: 86, playerRating: 65, playerPotential: 82, playerWage: 6200, playerRole: 'Rotation', playerTraining: 52, managerResultBoost: 0, managerBudgetGrowth: 350000, playerTrainingBonus: 0, playerTrustModifier: 3 },
  { id: 'kingsport', clubName: 'Kingsport Athletic', clubShort: 'KA', league: 'Coastal Championship', identity: 'The promotion push', philosophy: 'Win now', description: 'A high-energy club that expects promotion and offers a fast route into the spotlight.', primaryColor: '#e6ae52', secondaryColor: '#274a68', pros: ['Clear promotion target', 'Big match exposure'], cons: ['Heavy pressure every week', 'Thin depth in the squad'], managerBudget: 47000000, managerTrust: 62, playerRating: 69, playerPotential: 83, playerWage: 6800, playerRole: 'First team', playerTraining: 48, managerResultBoost: 1, managerBudgetGrowth: 150000, playerTrainingBonus: -2, playerTrustModifier: -2 },
  { id: 'fjordholm', clubName: 'Fjordholm FK', clubShort: 'FFK', league: 'Alpine League', identity: 'The modern outpost', philosophy: 'Recruit and develop', description: 'A smart, ambitious club known for finding overlooked talent and giving it a platform.', primaryColor: '#4e9ed4', secondaryColor: '#d8f1ff', pros: ['Modern scouting network', 'High potential pathway'], cons: ['Remote travel schedule', 'Lower league prestige'], managerBudget: 34500000, managerTrust: 78, playerRating: 66, playerPotential: 91, playerWage: 6100, playerRole: 'Crucial', playerTraining: 70, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 5, playerTrustModifier: 1 },
  { id: 'montreux', clubName: 'AS Montreux', clubShort: 'ASM', league: 'Continental League', identity: 'The elegant challenger', philosophy: 'Possession football', description: 'A technical side with a clear playing style, demanding standards, and a chance to compete beyond the league.', primaryColor: '#6ab9a5', secondaryColor: '#f0d3a0', pros: ['Strong tactical identity', 'Continental competition'], cons: ['Strict role requirements', 'Less room for mistakes'], managerBudget: 51500000, managerTrust: 72, playerRating: 70, playerPotential: 87, playerWage: 7600, playerRole: 'Rotation', playerTraining: 58, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 1, playerTrustModifier: 0 },
]

export function createClubOffers(leaguePreference: string) {
  const shuffled = [...clubOfferPool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.sort((a, b) => Number(b.league === leaguePreference) - Number(a.league === leaguePreference)).slice(0, 3)
}

// ── Training ──
export const trainingSessions: TrainingSession[] = [
  { id: 'sprint', label: 'Sprint drills', skill: 'pace', description: 'Interval runs and acceleration work on the training ground.', energyCost: 28, icon: '⚡' },
  { id: 'finishing', label: 'Finishing practice', skill: 'shooting', description: 'One-touch finishes, volleys, and composed penalty work.', energyCost: 30, icon: '◎' },
  { id: 'rondo', label: 'Rondo & distribution', skill: 'passing', description: 'Tight-space passing sequences and long-range distribution.', energyCost: 22, icon: '↗' },
  { id: 'dribble', label: '1v1 duels', skill: 'dribbling', description: 'Close control through cones and competitive take-on drills.', energyCost: 26, icon: '◈' },
  { id: 'strength', label: 'Strength & recovery', skill: 'physical', description: 'Gym block, core stability, and controlled recovery cycling.', energyCost: 34, icon: '▦' },
]

// ── Transfer pool ──
export const transferClubPool: TransferApproach[] = [
  { id: 'tf-dynamo', clubName: 'Dynamo 1896', clubShort: 'DYN', league: 'Continental League', identity: 'The continental contender', storyline: 'Dynamo 1896 have been tracking your progress for months. Their sporting director flew in personally. "We build dynasties, not just seasons."', primaryColor: '#c44d6e', secondaryColor: '#f7d08a', perks: ['Regular continental football', 'Top-tier training facilities', 'Vocal home support'], risks: ['Intense media pressure', 'High board expectations', 'Cold winter schedule'], managerBudget: 51000000, managerTrust: 71, playerWage: 8200, playerRole: 'First team', playerTraining: 68, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-ironbank', clubName: 'Ironbank FC', clubShort: 'IB', league: 'Premier Division', identity: 'The ambitious upstart', storyline: 'Ironbank are not subtle — their chairman sent a handwritten note and a number. "Money talks. We want yours to sing."', primaryColor: '#2e7d6a', secondaryColor: '#d4e8c2', perks: ['Competitive wage structure', 'Modern stadium project', 'Young, hungry squad'], risks: ['Unproven in big matches', 'Board meddling in transfers', 'Limited scouting network'], managerBudget: 68000000, managerTrust: 58, playerWage: 9600, playerRole: 'Crucial', playerTraining: 54, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-santiverde', clubName: 'Santiverde', clubShort: 'SV', league: 'Coastal Championship', identity: 'The lifestyle club', storyline: 'Santiverde pitch the weather, the city, and the vision. "You can win anywhere. Why not win where the sun sets on the sea?"', primaryColor: '#d4853e', secondaryColor: '#f0d4b8', perks: ['Player-friendly city lifestyle', 'Strong youth pipeline', 'Relaxed media environment'], risks: ['Lower league prestige', 'Smaller transfer budget', 'Fewer derby fixtures'], managerBudget: 34000000, managerTrust: 84, playerWage: 7500, playerRole: 'First team', playerTraining: 60, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-northcroft', clubName: 'Northcroft Athletic', clubShort: 'NA', league: 'Alpine League', identity: 'The old guard', storyline: 'Northcroft are a name that carries weight. Their captain wants you in the dressing room. "We have the history. You could be part of the next chapter."', primaryColor: '#3d5e8c', secondaryColor: '#c8d9f0', perks: ['Rich club heritage', 'Loyal fanbase', 'Proven development pathway'], risks: ['Aging squad core', 'Rebuilding phase', 'Remote location'], managerBudget: 42000000, managerTrust: 76, playerWage: 7000, playerRole: 'Rotation', playerTraining: 72, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
]

// ── Formation (4-3-3 Attack) ──
export const fourThreeThreeFormation: FormationSlot[] = [
  { position: 'GK', row: 0, col: 0, x: 50, y: 92 },
  { position: 'LB', row: 1, col: 0, x: 14, y: 78 },
  { position: 'CB', row: 1, col: 1, x: 38, y: 82 },
  { position: 'CB', row: 1, col: 2, x: 62, y: 82 },
  { position: 'RB', row: 1, col: 3, x: 86, y: 78 },
  { position: 'CM', row: 2, col: 0, x: 28, y: 60 },
  { position: 'CM', row: 2, col: 1, x: 50, y: 54 },
  { position: 'CM', row: 2, col: 2, x: 72, y: 60 },
  { position: 'LW', row: 3, col: 0, x: 18, y: 28 },
  { position: 'ST', row: 3, col: 1, x: 50, y: 18 },
  { position: 'RW', row: 3, col: 2, x: 82, y: 28 },
]

// ── Dynamic Ratings seed (FC27 "TODAY'S DVR") ──
export const seedDynamicRatings: DynamicRating[] = [
  { id: 1, playerId: 11, playerName: 'Erlon Hyland', rating: 86, change: 2, reason: 'Man of the match vs Redhaven' },
  { id: 2, playerId: 7,  playerName: 'Nico Bellori', rating: 79, change: -2, reason: 'Drop in form after injury' },
  { id: 3, playerId: 9,  playerName: 'Lio Santoro', rating: 84, change: 4, reason: 'Hat-trick of assists vs Oldcastle' },
  { id: 4, playerId: 1,  playerName: 'Milo Vardic', rating: 78, change: 1, reason: 'Strong training block' },
  { id: 5, playerId: 6,  playerName: 'Soren Halvik', rating: 82, change: 1, reason: "Captain's run performance" },
  { id: 6, playerId: 4,  playerName: 'Juno Marsetti', rating: 80, change: -1, reason: 'Below average match rating' },
]

// ── Formations registry (4-3-3, 4-4-2 classic, 3-5-2 wing-backs) ──
export const defaultTactics: Tactics = {
  formation: 'fourThreeThree',
  mentality: 'Balanced',
  width: 'Normal',
  defensiveLine: 'Medium',
  pressure: 'Medium',
  playStyle: 'Possession',
  captain: 6,
  setPieces: 9,
  penaltyTaker: 11,
}

export const fourFourTwoFormation: FormationSlot[] = [
  { position: 'GK', row: 0, col: 0, x: 50, y: 8 },
  { position: 'LB', row: 1, col: 0, x: 14, y: 22 },
  { position: 'CB', row: 1, col: 1, x: 36, y: 18 },
  { position: 'CB', row: 1, col: 2, x: 64, y: 18 },
  { position: 'RB', row: 1, col: 3, x: 86, y: 22 },
  { position: 'LM', row: 2, col: 0, x: 12, y: 48 },
  { position: 'CM', row: 2, col: 1, x: 38, y: 46 },
  { position: 'CM', row: 2, col: 2, x: 62, y: 46 },
  { position: 'RM', row: 2, col: 3, x: 88, y: 48 },
  { position: 'ST', row: 3, col: 0, x: 40, y: 80 },
  { position: 'ST', row: 3, col: 1, x: 60, y: 80 },
]

export const threeFiveTwoFormation: FormationSlot[] = [
  { position: 'GK', row: 0, col: 0, x: 50, y: 8 },
  { position: 'CB', row: 1, col: 0, x: 26, y: 22 },
  { position: 'CB', row: 1, col: 1, x: 50, y: 18 },
  { position: 'CB', row: 1, col: 2, x: 74, y: 22 },
  { position: 'LM', row: 2, col: 0, x: 12, y: 44 },
  { position: 'CM', row: 2, col: 1, x: 32, y: 48 },
  { position: 'CDM', row: 2, col: 2, x: 50, y: 42 },
  { position: 'CM', row: 2, col: 3, x: 68, y: 48 },
  { position: 'RM', row: 2, col: 4, x: 88, y: 44 },
  { position: 'ST', row: 3, col: 0, x: 40, y: 80 },
  { position: 'ST', row: 3, col: 1, x: 60, y: 80 },
]

export const formations: Record<FormationId, Formation> = {
  fourThreeThree: { id: 'fourThreeThree', label: '4-3-3 Attack', description: 'Wing play with a single striker supported by three CMs. Balanced and direct.', slots: fourThreeThreeFormation },
  fourFourTwo: { id: 'fourFourTwo', label: '4-4-2 Classic', description: 'Twin strikers, solid shape, central control, easy to coach.', slots: fourFourTwoFormation },
  threeFiveTwo: { id: 'threeFiveTwo', label: '3-5-2 Wing-backs', description: 'Three CBs with wing-backs providing width, two strikers up top.', slots: threeFiveTwoFormation },
}

// ── Position color coding (EA FC 27 style chips & tints) ──
export const positionColors: Record<Position, string> = {
  GK: '#f59e0b',
  CB: '#0ea5e9',
  LB: '#2563eb',
  RB: '#2563eb',
  DM: '#14b8a6',
  CDM: '#0d9488',
  CM: '#14b8a6',
  CAM: '#84cc16',
  AM: '#a3e635',
  LW: '#22c55e',
  LM: '#fb923c',
  RM: '#16a34a',
  RW: '#22c55e',
  ST: '#ef4444',
}

export const positionTints: Record<Position, string> = {
  GK: 'rgba(245,158,11,0.18)',
  CB: 'rgba(14,165,233,0.18)',
  LB: 'rgba(37,99,235,0.18)',
  RB: 'rgba(37,99,235,0.18)',
  DM: 'rgba(20,184,166,0.18)',
  CDM: 'rgba(13,148,136,0.18)',
  CM: 'rgba(20,184,166,0.18)',
  CAM: 'rgba(132,204,22,0.18)',
  AM: 'rgba(163,230,53,0.18)',
  LW: 'rgba(34,197,94,0.18)',
  LM: 'rgba(251,146,60,0.18)',
  RM: 'rgba(22,163,74,0.18)',
  RW: 'rgba(34,197,94,0.18)',
  ST: 'rgba(239,68,68,0.18)',
}

// ── Navigation (EA FC 27 style) ──
export const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '♙' },
  { id: 'teamManagement', label: 'Team Mgmt', icon: '⊞' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transferHub', label: 'Transfers', icon: '↔' },
  { id: 'market', label: 'Market', icon: '↗' },
  { id: 'playerProfile', label: 'Profile', icon: '✦' },
  { id: 'club', label: 'Club vision', icon: '◈' },
]

export const playerNavItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'player', label: 'My player', icon: '♙' },
  { id: 'playerProfile', label: 'Profile', icon: '✦' },
  { id: 'teamManagement', label: 'Team Mgmt', icon: '⊞' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transferHub', label: 'Transfers', icon: '↔' },
  { id: 'training', label: 'Training', icon: '⚡' },
  { id: 'squad', label: 'Club team', icon: '◎' },
  { id: 'club', label: 'Club life', icon: '◈' },
]
