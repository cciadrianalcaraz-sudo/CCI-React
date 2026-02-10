
import HeroMetrics from "./HeroMetrics";
import HeroCard from "./HeroCard";
import Button from "../ui/Button";

export default function Hero() {
    return (
        <header className="relative bg-gradient-to-br from-[#f3f1ee] via-white to-[#fbf2df] px-[8vw] pt-32 pb-24 md:pt-40">
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <p className="uppercase tracking-[0.2rem] text-xs font-semibold text-neutral-500 mb-4">
                        CCICONTABLE.COM
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Estrategia fiscal, financiera y de control interno para tomar mejores decisiones.
                    </h1>

                    <p className="text-neutral-600 text-lg mb-6">
                        Transformamos la contabilidad en una ventaja competitiva.
                    </p>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <Button primary>Agenda tu diagnóstico</Button>
                        <Button outline>Conoce la metodología</Button>
                    </div>

                    <HeroMetrics />
                </div>

                <HeroCard />
            </section>
        </header>
    );
}
