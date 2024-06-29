export const ranges = {
  subBass: { start: 20, end: 60 },
  bass: { start: 60, end: 250 },
  lowMids: { start: 250, end: 500 },
  mids: { start: 500, end: 2000 },
  highMids: { start: 2000, end: 4000 },
  lowerHighs: { start: 4000, end: 6000 },
  highs: { start: 6000, end: 20000 },
};

export const maxValues = [
  500, // Sub-bass
  1800, // Bass
  2500, // Low-mids
  10000, // Mids
  10000, // High-mids
  8000, // Lower highs
  20000, // Highs
];
