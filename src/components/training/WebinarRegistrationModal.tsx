import { useState } from "react";
import type { NewsItem } from "../../data/courses";

interface WebinarRegistrationModalProps {
    newsItem: NewsItem;
    onClose: () => void;
}

export default function WebinarRegistrationModal({ newsItem, onClose }: WebinarRegistrationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors cursor-pointer z-10"
                >
                    ✕
                </button>

                <div className="p-8">
                    {isSuccess ? (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                ✓
                            </div>
                            <h2 className="text-2xl font-heading text-primary mb-4">¡Registro Exitoso!</h2>
                            <p className="text-muted mb-8">
                                Te hemos enviado los detalles de acceso al webinar a tu correo electrónico. ¡Nos vemos pronto!
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold transition-all hover:bg-primary/90 cursor-pointer"
                            >
                                Entendido
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                    Registro al Webinar
                                </span>
                                <h2 className="text-2xl font-heading text-primary mb-2">{newsItem.title}</h2>
                                <p className="text-muted text-sm">Completa tus datos para recibir el enlace de acceso.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold text-primary uppercase mb-2 ml-1">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="w-full bg-[#faf7f2] border border-[#efe7d8] rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                                        placeholder="Ej. Juan Pérez"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-primary uppercase mb-2 ml-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full bg-[#faf7f2] border border-[#efe7d8] rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                                        placeholder="tu@correo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="whatsapp" className="block text-xs font-bold text-primary uppercase mb-2 ml-1">
                                        WhatsApp (Opcional)
                                    </label>
                                    <input
                                        type="tel"
                                        id="whatsapp"
                                        className="w-full bg-[#faf7f2] border border-[#efe7d8] rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                                        placeholder="Ej. +52 33..."
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-accent text-[#2c2210] py-4 rounded-xl font-bold mt-4 transition-all hover:bg-[#a67d3d] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#2c2210] border-t-transparent rounded-full animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Registrarse ahora'
                                    )}
                                </button>
                            </form>

                            <p className="text-[10px] text-center text-muted mt-6 uppercase tracking-wider">
                                Acceso gratuito • Cupos limitados
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
