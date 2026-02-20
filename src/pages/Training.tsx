import { useState } from "react";
import { courses, calculationTools } from "../data/courses";
import type { Course, NewsItem } from "../data/courses";
import CourseCard from "../components/training/CourseCard";
import NewsSection from "../components/training/NewsSection";
import PaymentModal from "../components/training/PaymentModal";
import WebinarRegistrationModal from "../components/training/WebinarRegistrationModal";

export default function Training() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedWebinar, setSelectedWebinar] = useState<NewsItem | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleBuyCourse = (course: Course) => {
        if (course.type === 'free') {
            alert("¡Genial! Este curso es gratuito. Te redirigiremos al material.");
            return;
        }
        setSelectedCourse(course);
    };

    const handleRegisterWebinar = (newsItem: NewsItem) => {
        setSelectedWebinar(newsItem);
    };

    const handlePaymentSuccess = (details: any) => {
        console.log("Pago exitoso:", details);
        setSelectedCourse(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    return (
        <div className="pt-24 pb-16 md:pt-40 md:pb-24 px-[6vw] md:px-[8vw] relative min-h-screen">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-24 right-6 md:right-8 z-[100] bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold">¡Pago Exitoso!</p>
                        <p className="text-sm opacity-90">Te hemos enviado los accesos por correo.</p>
                    </div>
                </div>
            )}

            <div className="max-w-[800px] mb-12 md:mb-20 text-center md:text-left">
                <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4 md:mb-6">Capacitaciones</p>
                <h1 className="text-[clamp(2.2rem,8vw,3.5rem)] font-heading text-primary leading-[1.15] mb-6 font-bold">
                    Potenciamos tu conocimiento para un mejor control.
                </h1>
                <p className="text-lg md:text-xl text-muted max-w-[650px] mx-auto md:mx-0 leading-relaxed">
                    Accede a cursos especializados y mantente informado con las últimas novedades del mundo contable y fiscal.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center md:justify-start">
                    <a
                        href="#herramientas"
                        className="inline-flex items-center justify-center px-10 py-5 bg-accent text-white font-bold rounded-2xl shadow-xl shadow-accent/20 hover:bg-[#a67d3d] transition-all active:scale-95 group"
                    >
                        Ver Herramientas
                        <span className="ml-2 group-hover:translate-y-1 transition-transform">↓</span>
                    </a>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 md:gap-16 mb-20 md:mb-32">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl md:text-3xl font-heading text-primary mb-10 border-b border-light-beige pb-4 font-bold">Nuestros Cursos</h2>
                    <div className="grid sm:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onBuy={handleBuyCourse}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:pt-20">
                    <NewsSection onRegister={handleRegisterWebinar} />
                </div>
            </div>

            {/* Herramientas de Cálculo Section */}
            <section id="herramientas" className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 border border-[#efe7d8] shadow-custom scroll-mt-28 md:scroll-mt-32">
                <div className="mb-12 md:mb-16">
                    <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-3 md:mb-4">Recursos Gratuitos</p>
                    <h2 className="text-3xl md:text-4xl font-heading text-primary mb-4 font-bold">Herramientas Empresariales Gratuitas</h2>
                    <p className="text-muted text-lg leading-relaxed max-w-[600px]">Descarga plantillas estratégicas y herramientas automatizadas para potenciar tu negocio.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {calculationTools.map((tool) => (
                        <div key={tool.id} className="bg-[#faf7f2] p-8 md:p-10 rounded-3xl border border-[#efe7d8] flex flex-col items-start transition-all hover:border-accent/40 group hover:shadow-lg">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">{tool.title}</h3>
                            <p className="text-muted text-sm md:text-base mb-6 leading-relaxed">
                                {tool.description}
                            </p>

                            {tool.features && (
                                <ul className="mb-8 space-y-3">
                                    {tool.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-neutral-600">
                                            <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <a
                                href={tool.downloadUrl}
                                download={tool.fileName}
                                className="mt-auto inline-flex items-center gap-2 font-bold text-accent hover:text-[#a67d3d] transition-all cursor-pointer group/link"
                            >
                                Descargar herramienta
                                <span className="text-xl group-hover:translate-y-1 transition-transform">↓</span>
                            </a>
                        </div>
                    ))}
                </div>
            </section>


            {selectedCourse && (
                <PaymentModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {selectedWebinar && (
                <WebinarRegistrationModal
                    newsItem={selectedWebinar}
                    onClose={() => setSelectedWebinar(null)}
                />
            )}
        </div>
    );
}
