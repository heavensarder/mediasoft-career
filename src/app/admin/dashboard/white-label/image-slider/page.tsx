import { getSliderImages } from "@/lib/slider-actions";
import ImageSliderManager from "@/components/admin/ImageSliderManager";

export default async function ImageSliderPage() {
    const images = await getSliderImages();

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Image Slider</h1>
                <p className="text-slate-500">Manage the images displayed on the homepage ticker.</p>
            </div>

            <ImageSliderManager initialImages={images} />
        </div>
    );
}

