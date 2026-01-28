import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://germanvirtualschool.com'
  const currentDate = new Date()

  // Define routes with their specific SEO configurations
  const staticRoutes: Array<{
    path: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }> = [
    // Homepage - highest priority
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    
    // Course pages - high priority for conversions
    { path: '/courses', changeFrequency: 'daily', priority: 0.95 },
    
    // Forum - community engagement
    { path: '/forum', changeFrequency: 'hourly', priority: 0.8 },
    
    // About page - trust building
    { path: '/about', changeFrequency: 'monthly', priority: 0.85 },
    
    // Auth pages - moderate priority
    { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/register', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/forgot-password', changeFrequency: 'yearly', priority: 0.3 },
    
    // Legal pages - low priority but necessary
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
  ]

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        en: `${baseUrl}${route.path}`,
        de: `${baseUrl}${route.path}`,
      },
    },
  }))

  return sitemapEntries
}
