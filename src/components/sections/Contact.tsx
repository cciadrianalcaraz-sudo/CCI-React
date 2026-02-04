
import Button from "../ui/Button";

export default function Contact() {
    return (
        <section id="contacto" className="py-20 px-[8vw] bg-[#2c2210] text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Hablemos de tu empresa</h2>
            <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
                Agenda una llamada de diagnóstico gratuita y descubre cómo podemos ayudarte.
            </p>
            <Button secondary>Agendar llamada</Button>
        </section>
    );
}
