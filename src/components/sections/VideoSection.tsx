import { useState } from "react";
import { Play, X } from "lucide-react";

export default function VideoSection() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="py-20 bg-white px-[6vw] md:px-[8vw]">
            <div className="max-w-[1400px] mx-auto">
                <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl aspect-video bg-neutral-900 flex items-center justify-center">
                    {/* Placeholder Background / Thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=2000"
                        alt="CCI Presentation Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Content Overlay */}
                    <div className="relative z-20 text-center px-6">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-20 h-20 md:w-28 md:h-28 bg-accent rounded-full flex items-center justify-center text-primary-dark shadow-2xl shadow-accent/40 mb-8 transition-all hover:scale-110 active:scale-95 group-hover:bg-white"
                        >
                            <Play fill="currentColor" size={32} className="ml-1" />
                        </button>
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4 px-4">
                            ¿Por qué elegir CCI Contable?
                        </h2>
                        <p className="text-white/80 text-lg md:text-xl font-medium max-w-[600px] mx-auto">
                            Conoce nuestra metodología y equipo en menos de 60 segundos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Video Modal Placeholder */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div
                        className="absolute inset-0 bg-primary/90 backdrop-blur-xl transition-opacity animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-[1000px] aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Embebed Video Placeholder (YouTube/Vimeo) */}
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white p-8">
                                <Play size={64} className="mx-auto mb-6 text-accent opacity-50" />
                                <h3 className="text-2xl font-bold mb-2">Espacio para tu Video</h3>
                                <p className="text-white/60">Aquí embeberemos tu video de presentación de YouTube o Vimeo.</p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="mt-8 px-8 py-3 bg-accent text-primary-dark rounded-xl font-bold"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
