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
  'GPIN Eklesia Mesuji': ['Ev. Samuel Toro'],
  'GPIN Eben Haezer Natar': ['Pdt. Untung', '[Pdt. Untung Basuki', 'Pak Basuki'],
  'GPIN Bukit Zaitun Panjang': ['Pdt. Ricardono Lubis', 'Pdt. Rikardono Lubis', 'Pdt. Ricardono', 'Pdt. Ricardono'],
  'GPIN Betlehem Sidomulyo': ['Pdt. Giono', 'Pak Giono'],
  'GPIN Filipi Way Halim': ['Pdt. Yakob', 'Pak Yakob'],
  'GPIN Gloria Kotabaru Itera': ['Valen Gea', 'Tante Valen'],
  'GPIN Filadelfia Polresta': ['Pdt. Mardi Utomo', 'Pdt. Mardi', 'Pak Mardi'],
  'GPIN Hosanna Langkapura': ['Pdt. Ingati Zega', 'Pdt. Ingati', 'Pak Ingati'],
  'GPIN Haleluya Bergen': ['Ev. Darwis', 'Om Darwis'],
  'GPIN Elshadday Karanganyar': ['Ev. Yunus', 'Om Yunus'],
  'GPIN Perintisan Srimukti': ['srimukti'],
}