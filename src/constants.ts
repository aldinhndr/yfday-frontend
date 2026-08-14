export const REKENING = {
  bank: 'DANA',
  nomor: '082181550454',
  atasNama: 'AUDIVE EIFRIL HUTABARAT',
}

export const GPIN_CHURCHES = [
  'GPIN Eklesia Mesuji',
  'GPIN Eben Haezer Natar',
  'GPIN Bukit Zaitun Panjang',
  'GPIN Betlehem Sidomulyo',
  'GPIN Filipi Way Halim',
  'GPIN Gloria Kotabaru Itera', 
  'GPIN Filadelfia Polresta',
  'GPIN Hosanna Langkapura',
  'GPIN Haleluya Bergen',
  'GPIN Elshadday Karanganyar', 
  'GPIN Perintisan Srimukti',
] as const

export type GpinChurchName = (typeof GPIN_CHURCHES)[number]

export const GPIN_PASTOR_ANSWERS: Record<GpinChurchName, string[]> = {
  'GPIN Eklesia Mesuji': ['Pdt. Samuel Toro'],
  'GPIN Eben Haezer Natar': ['natar'],
  'GPIN Bukit Zaitun Panjang': ['panjang'],
  'GPIN Betlehem Sidomulyo': ['Pdt. Giono'],
  'GPIN Filipi Way Halim': ['Pdt. Yakob', 'Pak Yakob'],
  'GPIN Gloria Kotabaru Itera': ['itera', 'kotabaru'],
  'GPIN Filadelfia Polresta': ['Pdt. Mardi Utomo', 'Pdt. Mardi', 'Pak Mardi'],
  'GPIN Hosanna Langkapura': ['langkapura', 'hosanna'],
  'GPIN Haleluya Bergen': ['bergen'],
  'GPIN Elshadday Karanganyar': ['karanganyar', 'elshadday'],
  'GPIN Perintisan Srimukti': ['srimukti'],
}