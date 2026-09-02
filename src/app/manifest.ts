import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Glow OS',
    short_name: 'Glow',
    description: 'Your life, held in light.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#050712',
    theme_color: '#f3e6d7',
    orientation: 'any',
  };
}
