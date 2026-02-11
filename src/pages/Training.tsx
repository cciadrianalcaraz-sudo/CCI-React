import { courses } from "../data/courses";
import CourseCard from "../components/training/CourseCard";
import NewsSection from "../components/training/NewsSection";

export default function Training() {
    return (
        <div className="pt-32 pb-20 px-[8vw]">
            <div className="max-w-[720px] mb-16">
                <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-xs mb-4">Capacitaciones</p>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-heading text-primary leading-[1.1] mb-6">
                    Potenciamos tu conocimiento para un mejor control.
                </h1>
                <p className="text-xl text-muted">
                    Accede a cursos especializados y mantente informado con las últimas novedades del mundo contable y fiscal.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-heading text-primary mb-8 border-b border-[#efe7d8] pb-4">Nuestros Cursos</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>

                <aside>
                    <NewsSection />
                </aside>
            </div>
        </div>
    );
}
