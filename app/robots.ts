import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://germanvirtualschool.com'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/student/',
          '/teacher/',
          '/settings/',
          '/messages/',
          '/notifications/',
          '/profile/',
          '/classroom/',
          '/calendar/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/student/',
          '/teacher/',
          '/settings/',
          '/messages/',
          '/notifications/',
          '/profile/',
          '/classroom/',
          '/calendar/',
        ],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/student/',
          '/teacher/',
          '/settings/',
          '/messages/',
          '/notifications/',
          '/profile/',
          '/classroom/',
          '/calendar/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
