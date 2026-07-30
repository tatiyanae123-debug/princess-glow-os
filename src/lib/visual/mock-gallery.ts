export type GalleryItem = {
  id: string;
  label: string;
  /** CSS value for background (gradient or color) used as "image" */
  css: string;
  /** data-URL thumbnail for preview */
  thumb: string;
};

// Gradient-based gallery items — no external network calls needed
const GRADIENTS: { id: string; label: string; css: string }[] = [
  {
    id: 'blush-mist',
    label: 'Blush Mist',
    css: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #fce4ec 100%)',
  },
  {
    id: 'lavender-dawn',
    label: 'Lavender Dawn',
    css: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #ede7f6 100%)',
  },
  {
    id: 'morning-sky',
    label: 'Morning Sky',
    css: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 50%, #e1f5fe 100%)',
  },
  {
    id: 'sage-meadow',
    label: 'Sage Meadow',
    css: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #e8f5e9 100%)',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    css: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #fff8e1 100%)',
  },
  {
    id: 'twilight',
    label: 'Twilight',
    css: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #311b92 100%)',
  },
  {
    id: 'rose-gold',
    label: 'Rose Gold',
    css: 'linear-gradient(135deg, #fbe9e7 0%, #f8bbd0 35%, #fce4ec 65%, #fbe9e7 100%)',
  },
  {
    id: 'aurora-borealis',
    label: 'Aurora Borealis',
    css: 'linear-gradient(135deg, #1b5e20 0%, #00695c 40%, #4a148c 100%)',
  },
];

/** Build a tiny 40×20 thumbnail data-URL for the gallery item */
function buildThumb(css: string): string {
  // Use a tiny inline SVG with a foreignObject that renders the CSS gradient
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${extractFirstColor(css)}"/><stop offset="100%" stop-color="${extractLastColor(css)}"/></linearGradient></defs><rect width="40" height="20" fill="url(#g)"/></svg>`;
  const encoded = Buffer.from ? Buffer.from(svg).toString('base64') : btoa(svg);
  return `data:image/svg+xml;base64,${encoded}`;
}

function extractFirstColor(css: string): string {
  const match = css.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : '#f0f0f0';
}

function extractLastColor(css: string): string {
  const matches = css.match(/#[0-9a-fA-F]{6}/g);
  return matches && matches.length > 1 ? matches[matches.length - 1] : '#d0d0d0';
}

export const GALLERY_ITEMS: GalleryItem[] = GRADIENTS.map((g) => ({
  ...g,
  thumb: buildThumb(g.css),
}));
