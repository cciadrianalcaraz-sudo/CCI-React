export default function Contact() {
    return (
        <section id="contacto" className="px-[8vw] py-20 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-10 items-start">
            <div>
                <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">Contacto</p>
                <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] mb-3 font-heading leading-[1.2]">Conversemos sobre tu empresa.</h2>
                <p className="text-muted">
                    Construyamos juntos una operación más rentable, ordenada y preparada para crecer.
                </p>
                <div className="mt-6 grid gap-4">
                    <div>
                        <h4 className="mb-1 font-heading leading-[1.2]">Correo</h4>
                        <p>cci.adrianalcaraz@gmail.com</p>
                    </div>
                    <div>
                        <h4 className="mb-1 font-heading leading-[1.2]">Horario</h4>
                        <p>Lunes a viernes · 9:00 - 18:00</p>
                    </div>
                    <div>
                        <h4 className="mb-1 font-heading leading-[1.2]">Ubicación</h4>
                        <p>Atención remota en toda México</p>
                    </div>
                </div>
            </div>
            <form className="bg-white p-8 rounded-3xl shadow-custom grid gap-4 border border-[#efe7d8]" action="https://formspree.io/f/xeeljjag" method="POST">
                <label className="grid gap-2 font-semibold text-primary-dark">
                    Nombre o Razón Social
                    <input
                        className="p-3 px-4 rounded-xl border border-[#d9dfe7] text-[1rem] font-inherit"
                        type="text"
                        name="nombre"
                        placeholder="Tu nombre y empresa"
                        required
                    />
                </label>

                <label className="grid gap-2 font-semibold text-primary-dark">
                    Correo
                    <input
                        className="p-3 px-4 rounded-xl border border-[#d9dfe7] text-[1rem] font-inherit"
                        type="email"
                        name="email"
                        placeholder="tucorreo@empresa.com"
                        required
                    />
                </label>

<label className="grid gap-2 font-semibold text-primary-dark">
  Teléfono
  <input
    type="tel"
    name="telefono"
    placeholder="Ej. 312 123 4567"
    pattern="[0-9]{10}"
    className="p-3 px-4 rounded-xl border border-[#d9dfe7] text-[1rem] font-inter focus:outline-none focus:ring-2 focus:ring-primary/40"
    required
  />
</label>        
                <label className="grid gap-2 font-semibold text-primary-dark">
                    ¿Qué necesitas?
                    <textarea
                        className="p-3 px-4 rounded-xl border border-[#d9dfe7] text-[1rem] font-inherit"
                        name="mensaje"
                        rows={4}
                        placeholder="Cuéntanos tu reto actual"
                        required
                    ></textarea>
                </label>

                <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold border border-transparent transition-transform duration-200 shadow-none hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,55,95,0.15)] bg-primary text-white" type="submit">
                    Solicitar contacto
                </button>

                <p className="text-sm text-muted">
                    Respondemos en menos de 24 horas hábiles.
                </p>
            </form>
        </section>
    );
}
