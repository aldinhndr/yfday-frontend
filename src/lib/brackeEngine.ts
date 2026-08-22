export interface BracketData {
  rounds: { name?: string }[];
  matches: {
    roundIndex: number;
    order: number;
    sides: { title?: string; isWinner?: boolean }[];
  }[];
}

export const BRACKET_OPTIONS = {
  connectionLinesWidth: 2,
  connectionLinesColor: 'rgba(167,139,250,0.5)',
  rootBgColor: 'transparent',
  rootBorderColor: 'rgba(167,139,250,0.18)',
  matchTextColor: '#EDE9FE',
  matchFontSize: 13,
  roundTitleColor: '#38BDF8',
  roundTitlesFontFamily: "'JetBrains Mono', monospace",
  roundTitlesFontSize: 11,
  playerTitleFontFamily: "'Sora', sans-serif",
  mainVerticalPadding: 20,
  matchMinVerticalGap: 14,
  matchHorMargin: 8,
};

export function nextPow2(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return Math.max(p, 2);
}

export function roundName(idx: number, total: number) {
  const fromEnd = total - 1 - idx;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Perempat Final';
  const size = Math.pow(2, fromEnd + 1);
  return 'Babak ' + size + ' Besar';
}

export function buildHalfData(filled: Record<number, { name: string }>, halfSize: number): BracketData {
  const padded = nextPow2(halfSize);
  const numRounds = Math.log2(padded);
  const rounds = Array.from({ length: numRounds }, (_, i) => ({ name: roundName(i, numRounds) }));

  const slots: (string | null)[] = [];
  for (let i = 1; i <= padded; i++) {
    if (i <= halfSize && filled[i]) slots.push(filled[i].name);
    else if (i <= halfSize) slots.push(null);
    else slots.push('BYE');
  }

  const matches = [];
  for (let m = 0; m < padded / 2; m++) {
    const a = slots[2 * m];
    const b = slots[2 * m + 1];
    matches.push({
      roundIndex: 0,
      order: m,
      sides: [a ? { title: a } : {}, b ? { title: b } : {}],
    });
  }
  for (let r = 1; r < numRounds; r++) {
    const count = padded / Math.pow(2, r + 1);
    for (let m = 0; m < count; m++) {
      matches.push({ roundIndex: r, order: m, sides: [{}, {}] });
    }
  }
  return { rounds, matches };
}