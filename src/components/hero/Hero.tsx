
import HeroMetrics from "./HeroMetrics";
import HeroCard from "./HeroCard";
import Button from "../ui/Button";

export default function Hero() {
    return (
        <header className="relative bg-gradient-to-br from-[#f3f1ee] via-white to-[#fbf2df] px-[6vw] md:px-[8vw] pt-32 pb-16 md:pt-44 md:pb-24">
            <section className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center max-w-[1400px] mx-auto">
                <div className="text-center lg:text-left">
                    <p className="uppercase tracking-[0.2rem] text-[0.65rem] md:text-xs font-semibold text-neutral-500 mb-4 md:mb-6">
                        CCICONTABLE.COM
                    </p>

                    <h1 className="text-[clamp(2rem,8vw,3.5rem)] font-bold mb-6 leading-[1.15] text-primary-dark">
                        Estrategia fiscal, financiera y de control interno para tomar mejores decisiones.
                    </h1>

                    <p className="text-neutral-600 text-base md:text-lg mb-8 md:mb-10 max-w-[600px] mx-auto lg:mx-0">
                        Transformamos la contabilidad en una ventaja competitiva para tu negocio o carrera profesional.
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10 md:mb-12 justify-center lg:justify-start">
                        <Button primary className="w-full sm:w-auto px-8 py-4">Agenda tu diagnóstico</Button>
                        <Button outline className="w-full sm:w-auto px-8 py-4">Conoce la metodología</Button>
                    </div>

                    <div className="pt-2 border-t border-light-beige lg:border-none">
                        <HeroMetrics />
                    </div>
                </div>

                <div className="relative">
                    <HeroCard />
                </div>
            </section>
        </header>
    );
}

