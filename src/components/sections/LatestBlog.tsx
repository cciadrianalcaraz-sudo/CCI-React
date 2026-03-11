import { Link } from "react-router-dom";
import { blogPosts } from "../../data/blog";
import type { BlogPost } from "../../data/blog";

export default function LatestBlog() {
    // Get the 3 most recent posts
    const latestPosts = blogPosts.slice(0, 3);

    return (
        <section className="py-24 md:py-32 px-[6vw] md:px-[8vw] bg-[#faf7f2]">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
                    <div>
                        <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4">Actualidad & Estrategia</p>
                        <h2 className="text-3xl md:text-5xl font-heading text-primary font-bold leading-tight">
                            Último en el Blog
                        </h2>
                    </div>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 font-bold text-accent hover:text-[#a67d3d] transition-colors group"
                    >
                        Ver todas las entradas
                        <span className="text-xl transition-transform group-hover:translate-x-2">→</span>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-10">
                    {latestPosts.map((post: BlogPost) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.id}`}
                            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#efe7d8] transition-all hover:shadow-xl hover:border-accent/40"
                        >
                            <div className="aspect-[16/10] overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[0.65rem] font-bold text-accent uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                    <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                    <span className="text-xs text-muted font-medium">{post.date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors leading-snug">
                                    {post.title}
                                </h3>
                                <p className="text-muted text-sm line-clamp-2 leading-relaxed mb-6">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                    Leer más
                                    <span className="transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
