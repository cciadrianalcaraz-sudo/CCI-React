import { useState } from 'react';
import { faqItems } from '../../data/faq';

export default function FAQ() {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section id="faq" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-heading text-primary mb-4">Preguntas Frecuentes</h2>
                    <p className="text-muted text-lg">
                        Resolvemos tus dudas más comunes sobre impuestos, contabilidad y trámites ante el SAT.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqItems.map((item) => (
                        <div
                            key={item.id}
                            className="border border-[#efe7d8] rounded-2xl overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleAccordion(item.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#faf7f2] transition-colors cursor-pointer"
                            >
                                <span className="font-bold text-primary text-lg pr-4">
                                    {item.question}
                                </span>
                                <span className={`text-accent font-bold text-3xl transition-transform duration-300 ${openId === item.id ? 'rotate-45' : ''}`}>
                                    +
                                </span>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${openId === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 pt-0 text-neutral-600 leading-relaxed border-t border-[#efe7d8]/50 bg-[#faf7f2]/50">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-muted mb-6">¿Aún tienes dudas?</p>
                    <a
                        href="#contact"
                        className="inline-block bg-accent text-primary px-8 py-4 rounded-xl font-bold hover:bg-accent/90 transition-all hover:scale-105"
                    >
                        Contáctanos ahora
                    </a>
                </div>
            </div>
        </section>
    );
}
