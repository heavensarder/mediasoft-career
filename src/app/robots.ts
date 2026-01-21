import { MetadataRoute } from 'next';
import { getSystemSetting } from '@/lib/settings-actions';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrlVal = await getSystemSetting('site_base_url');
  const baseUrl = baseUrlVal || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
