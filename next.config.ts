import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  async redirects() {
    return [
      { source: '/command', destination: '/search', permanent: false },
      { source: '/add-anything', destination: '/intake', permanent: false },
      { source: '/medications', destination: '/maintenance', permanent: false },
      { source: '/sleep', destination: '/wellness?view=sleep', permanent: false },
      { source: '/symptoms', destination: '/wellness?view=symptoms', permanent: false },
      { source: '/applications', destination: '/work?view=applications', permanent: false },
      { source: '/interviews', destination: '/work?view=interviews', permanent: false },
      { source: '/interview-prep', destination: '/work?mode=interview-prep', permanent: false },
      { source: '/workout-studio', destination: '/fitness?mode=workout-studio', permanent: false },
      { source: '/ambient', destination: '/focus?mode=ambient', permanent: false },
      { source: '/travel', destination: '/world?room=travel', permanent: false },
      { source: '/brain-connection', destination: '/connections?view=brain', permanent: false },
      { source: '/system-overview', destination: '/settings?section=system', permanent: false },
    ];
  },
};

export default nextConfig;
