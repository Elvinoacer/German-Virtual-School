import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'German Virtual School - Master the German Language',
    short_name: 'German Virtual School',
    description: 'The premier online platform for learning German. Live classes, expert teachers, and comprehensive resources for A1-C2 proficiency levels.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a5f',
    orientation: 'portrait-primary',
    categories: ['education', 'language', 'learning'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/images/gvs-marketing-banner.webp',
        sizes: '1200x1200',
        type: 'image/webp',
      },
    ],
  }
}
