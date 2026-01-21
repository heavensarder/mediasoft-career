import { getSliderImages } from "@/lib/slider-actions";

export async function ImageSliderSection() {
    const images = await getSliderImages();

    if (images.length === 0) return null;

    // Duplicate images multiple times to ensure seamless infinite scroll
    // If we have few images, we duplicate more to fill the width
    const minImagesForSmoothScroll = 12; // Arbitrary number to fill screen width
    const factor = Math.ceil(minImagesForSmoothScroll / images.length) * 4; // *4 ensures plenty of buffer
    const scrollImages = Array(Math.max(2, factor)).fill(images).flat();

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-10 text-center">
               <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                    Trusted By Industry Leaders
               </h2>
            </div>
            
            <div className="space-y-8">
                {/* Row 1: Left to Right */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex animate-scroll-left gap-6 w-max">
                        {scrollImages.map((img, idx) => (
                            <div 
                                key={`row1-${img.id}-${idx}`}
                                className="relative w-48 h-32 md:w-64 md:h-40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white flex-shrink-0"
                            >
                                <img 
                                    src={img.url} 
                                    alt="Gallery Image" 
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: Right to Left (Reverse) */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex animate-scroll-right gap-6 w-max">
                        {scrollImages.map((img, idx) => (
                            <div 
                                key={`row2-${img.id}-${idx}`}
                                className="relative w-48 h-32 md:w-64 md:h-40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white flex-shrink-0"
                            >
                                <img 
                                    src={img.url} 
                                    alt="Gallery Image" 
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes scrollRight {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .animate-scroll-left {
                    animation: scrollLeft 60s linear infinite;
                }
                .animate-scroll-right {
                    animation: scrollRight 65s linear infinite;
                }
                .animate-scroll-left:hover, .animate-scroll-right:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
