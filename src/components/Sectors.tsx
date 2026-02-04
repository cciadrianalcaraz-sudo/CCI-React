export default function Sectors() {
    return (
        <section className="px-[8vw] py-20">
            <div className="max-w-[720px] mb-12">
                <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">Sectors</p>
                <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] mb-3 font-heading leading-[1.2]">Soluciones para negocios en crecimiento.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Comercio</span>
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Servicios profesionales</span>
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Manufactura ligera</span>
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Tecnología y startups</span>
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Logística</span>
                <span className="bg-soft px-[18px] py-[10px] rounded-full font-semibold text-primary-dark">Salud y bienestar</span>
            </div>
        </section>
    );
}
