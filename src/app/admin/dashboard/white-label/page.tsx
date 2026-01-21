import { getBrandingSettings } from '@/lib/settings-actions';
import BrandingForm from './BrandingForm';

export default async function WhiteLabelPage() {
    const settings = await getBrandingSettings();

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">White Label Branding</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Customize the admin experience with your brand.</p>
            </div>

            <BrandingForm initialSettings={settings} />
        </div>
    );
}
