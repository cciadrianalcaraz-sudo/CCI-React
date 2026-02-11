import type { Course } from "../../data/courses";

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-[#efe7d8] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${course.type === 'free' ? 'bg-green-100 text-green-700' : 'bg-primary text-white'
                        }`}>
                        {course.type === 'free' ? 'Gratis' : 'Paga'}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted tracking-wide uppercase">
                        {course.duration}
                    </span>
                </div>
                <h3 className="text-xl font-heading text-primary mb-2 line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-muted text-sm mb-6 line-clamp-3">
                    {course.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                        {course.type === 'free' ? '$0' : `$${course.price} MXN`}
                    </span>
                    <button className="bg-accent text-[#2c2210] px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:bg-[#a67d3d]">
                        {course.type === 'free' ? 'Acceder ahora' : 'Ver detalles'}
                    </button>
                </div>
            </div>
        </div>
    );
}
