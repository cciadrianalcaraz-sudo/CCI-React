import { useState } from "react";
import { news } from "../../data/courses";
import type { NewsItem } from "../../data/courses";

interface NewsSectionProps {
    onRegister: (newsItem: NewsItem) => void;
}

export default function NewsSection({ onRegister }: NewsSectionProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    return (
        <section className="bg-[#faf7f2] rounded-3xl p-8 border border-[#efe7d8]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-heading text-primary">Novedades y Actualizaciones</h2>
                    <p className="text-muted text-sm">Mantente al día con lo último en fiscal y finanzas.</p>
                </div>
                <button className="text-accent font-semibold hover:underline text-sm hidden sm:block">Ver todas</button>
            </div>

            <div className="grid gap-6">
                {news.map((item) => (
                    <article
                        key={item.id}
                        className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${expandedItem === item.id ? 'border-accent shadow-lg bg-white' : 'border-[#efe7d8] hover:border-accent/40'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-accent uppercase tracking-wider border-l-2 border-accent pl-2">
                                {item.date}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2 leading-tight">{item.title}</h3>
                        <p className={`text-muted text-sm leading-relaxed mb-4 ${expandedItem === item.id ? '' : 'line-clamp-2'}`}>
                            {item.summary}
                        </p>

                        {expandedItem === item.id && item.content && (
                            <div className="mt-4 pt-4 border-t border-[#efe7d8] animate-fade-in">
                                <ul className="space-y-3">
                                    {item.content.map((point, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-neutral-700">
                                            <span className="text-accent mt-1">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                                {item.isWebinar && (
                                    <button
                                        onClick={() => onRegister(item)}
                                        className="w-full bg-accent text-[#2c2210] py-3 rounded-xl font-bold mt-6 transition-all hover:bg-[#a67d3d] cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        Registrarse ahora <span className="text-lg">→</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                            className="mt-4 text-sm font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            {expandedItem === item.id ? 'Ver menos ↑' : 'Leer más ↓'}
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}
