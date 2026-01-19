export default function GlassBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Mesh Gradient Blobs */}
            <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-[20%] w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

            {/* Noise/Texture overlay -> Optional, adds premium feel */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
        </div>
    );
}
