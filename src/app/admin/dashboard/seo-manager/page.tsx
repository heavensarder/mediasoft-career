'use server';

import { getAllSeoSettings, initDefaultSeo } from '@/lib/seo-actions';
import SeoManagerClient from './SeoManagerClient';

export default async function SeoManagerPage() {
    // Ensure defaults exist
    await initDefaultSeo();
    
    // Fetch settings
    const seoSettings = await getAllSeoSettings();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">SEO Manager</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Optimize your site's search engine presence.</p>
            </div>

            <SeoManagerClient initialSettings={seoSettings} />
        </div>
    );
}
