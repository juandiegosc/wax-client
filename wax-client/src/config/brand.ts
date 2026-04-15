export const waxBrand = {
  name: 'WAX',
  essence: 'Lujo editorial para piezas 3D a medida',
  voice: {
    keywords: ['editorial', 'precise', 'bespoke', 'sculptural', 'controlled'],
    avoid: ['playful', 'startup', 'gadget', 'instant', 'generic marketplace'],
  },
  color: {
    bone: '#f2f1ed',
    porcelain: '#faf9f6',
    ink: '#0f0f10',
    graphite: '#27272a',
    smoke: '#71717a',
    stone: '#d4d4d8',
    waxAmber: '#8f7352',
    oxblood: '#4f2730',
    bronze: '#75624b',
    olive: '#4c4f45',
  },
  gradient: {
    canvas:
      'radial-gradient(circle at top, rgba(39, 39, 42, 0.08), transparent 26%), linear-gradient(180deg, #faf9f6 0%, #f2f1ed 100%)',
  },
  typography: {
    display: 'Georgia, "Times New Roman", serif',
    body: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  radius: {
    soft: '0.35rem',
    strong: '0.5rem',
    pill: '0.35rem',
  },
  shadow: {
    soft: '0 18px 40px rgba(15, 15, 16, 0.06)',
    elevated: '0 28px 72px rgba(15, 15, 16, 0.1)',
  },
} as const;