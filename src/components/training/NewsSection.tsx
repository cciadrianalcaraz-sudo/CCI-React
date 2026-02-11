import { news } from "../../data/courses";

export default function NewsSection() {
    return (
        <section className="bg-[#faf7f2] rounded-3xl p-8 border border-[#efe7d8]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-heading text-primary">Novedades y Actualizaciones</h2>
                    <p className="text-muted text-sm">Mantente al día con lo último en fiscal y finanzas.</p>
                </div>
                <button className="text-accent font-semibold hover:underline text-sm">Ver todas</button>
            </div>

            <div className="grid gap-6">
                {news.map((item) => (
                    <article key={item.id} className="bg-white p-6 rounded-2xl border border-[#efe7d8] transition-all hover:border-accent/40">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 block border-l-2 border-accent pl-2">
                            {item.date}
                        </span>
                        <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                        <p className="text-muted text-sm leading-relaxed">{item.summary}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
