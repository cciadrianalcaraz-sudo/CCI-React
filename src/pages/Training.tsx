import { useState } from "react";
import { courses, calculationTools } from "../data/courses";
import type { Course } from "../data/courses";
import CourseCard from "../components/training/CourseCard";
import NewsSection from "../components/training/NewsSection";
import PaymentModal from "../components/training/PaymentModal";

export default function Training() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleBuyCourse = (course: Course) => {
        if (course.type === 'free') {
            alert("¡Genial! Este curso es gratuito. Te redirigiremos al material.");
            return;
        }
        setSelectedCourse(course);
    };

    const handlePaymentSuccess = (details: any) => {
        console.log("Pago exitoso:", details);
        setSelectedCourse(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    return (
        <div className="pt-32 pb-20 px-[8vw] relative">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-24 right-8 z-[100] bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold">¡Pago Exitoso!</p>
                        <p className="text-sm opacity-90">Te hemos enviado los accesos por correo.</p>
                    </div>
                </div>
            )}

            <div className="max-w-[720px] mb-16">
                <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-xs mb-4">Capacitaciones</p>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-heading text-primary leading-[1.1] mb-6">
                    Potenciamos tu conocimiento para un mejor control.
                </h1>
                <p className="text-xl text-muted">
                    Accede a cursos especializados y mantente informado con las últimas novedades del mundo contable y fiscal.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 mb-20">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-heading text-primary mb-8 border-b border-[#efe7d8] pb-4">Nuestros Cursos</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onBuy={handleBuyCourse}
                            />
                        ))}
                    </div>
                </div>

                <aside>
                    <NewsSection />
                </aside>
            </div>

            {/* Herramientas de Cálculo Section */}
            <section className="bg-white rounded-3xl p-10 border border-[#efe7d8] shadow-custom">
                <div className="mb-8">
                    <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-xs mb-2">Recursos Premium</p>
                    <h2 className="text-3xl font-heading text-primary">Herramientas de Cálculo</h2>
                    <p className="text-muted">Descarga plantillas en Excel y herramientas de carga batch para optimizar tu trabajo diario.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {calculationTools.map((tool) => (
                        <div key={tool.id} className="bg-[#faf7f2] p-8 rounded-2xl border border-[#efe7d8] flex flex-col items-start transition-all hover:border-accent/40 group">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">{tool.title}</h3>
                            <p className="text-muted text-sm mb-6 leading-relaxed">
                                {tool.description}
                            </p>
                            <button
                                onClick={() => alert("Descargando: " + tool.title)}
                                className="mt-auto inline-flex items-center gap-2 font-bold text-accent hover:text-[#a67d3d] transition-colors"
                            >
                                Descargar herramienta <span className="text-lg">↓</span>
                            </button>
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
        </div>
    );
}
