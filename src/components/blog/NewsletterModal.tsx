import { useState } from "react";

interface NewsletterModalProps {
    onClose: () => void;
}

export default function NewsletterModal({ onClose }: NewsletterModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-muted hover:text-primary transition-colors cursor-pointer z-10 text-xl"
                >
                    ✕
                </button>

                <div className="p-10">
                    {isSuccess ? (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                ✓
                            </div>
                            <h2 className="text-2xl font-heading text-primary mb-4 font-bold">¡Bienvenido a la comunidad!</h2>
                            <p className="text-muted mb-8 leading-relaxed">
                                Ya eres parte de nuestra lista exclusiva. Pronto recibirás nuestras actualizaciones y estrategias directamente en tu bandeja de entrada.
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
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                                    ✉️
                                </div>
                                <h2 className="text-3xl font-heading text-primary mb-3 font-bold">Suscríbete al Blog</h2>
                                <p className="text-muted leading-relaxed">
                                    Recibe los mejores análisis fiscales y financieros antes que nadie.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-primary uppercase mb-2 ml-1 tracking-wider">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#faf7f2] border border-[#efe7d8] rounded-xl px-4 py-3.5 outline-none focus:border-accent transition-colors"
                                        placeholder="Tu nombre completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-primary uppercase mb-2 ml-1 tracking-wider">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#faf7f2] border border-[#efe7d8] rounded-xl px-4 py-3.5 outline-none focus:border-accent transition-colors"
                                        placeholder="tu@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                            Suscribiendo...
                                        </>
                                    ) : (
                                        'Unirme ahora'
                                    )}
                                </button>
                            </form>

                            <p className="text-[10px] text-center text-muted mt-8 uppercase tracking-widest leading-loose">
                                Sin spam • Solo contenido de valor • Cancela cuando quieras
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
