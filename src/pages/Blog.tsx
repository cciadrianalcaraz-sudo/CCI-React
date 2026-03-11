import { Link } from "react-router-dom";
import { blogPosts } from "../data/blog";
import type { BlogPost } from "../data/blog";

export default function Blog() {
    const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
    const otherPosts = blogPosts.filter(post => post.id !== featuredPost.id);

    return (
        <div className="pt-32 pb-16 md:pt-44 md:pb-24 px-[6vw] md:px-[8vw] min-h-screen bg-[#faf7f2]">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-12 md:mb-16">
                    <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4">Blog & Estrategia</p>
                    <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-heading text-primary leading-[1.1] mb-6 font-bold">
                        Perspectivas que transforman negocios.
                    </h1>
                    <p className="text-lg md:text-xl text-muted max-w-[600px] leading-relaxed">
                        Análisis profundos sobre temas fiscales, financieros y de control para mantenerte un paso adelante.
                    </p>
                </div>

                {/* Featured Post */}
                <Link to={`/blog/${featuredPost.id}`} className="group block relative mb-16 md:mb-24">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center bg-white rounded-[2.5rem] overflow-hidden border border-[#efe7d8] transition-all hover:border-accent/40 hover:shadow-2xl">
                        <div className="h-[300px] md:h-[450px] overflow-hidden">
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
                                    {featuredPost.category}
                                </span>
                                <span className="text-muted text-sm font-medium">{featuredPost.date}</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-heading text-primary font-bold mb-6 group-hover:text-accent transition-colors leading-tight">
                                {featuredPost.title}
                            </h2>
                            <p className="text-muted text-lg mb-8 line-clamp-3 leading-relaxed">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center gap-3 text-accent font-bold group/link">
                                Leer artículo completo
                                <span className="text-xl transition-transform group-hover/link:translate-x-2">→</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Grid of Other Posts */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-12">
                    {otherPosts.map((post: BlogPost) => (
                        <Link key={post.id} to={`/blog/${post.id}`} className="group block">
                            <article className="h-full flex flex-col">
                                <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 border border-[#efe7d8] relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-accent text-[0.65rem] font-bold rounded-full uppercase tracking-wider shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-4 text-xs font-medium text-muted">
                                    <span>{post.date}</span>
                                    <span className="w-1 h-1 bg-accent rounded-full"></span>
                                    <span>{post.readTime} de lectura</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading text-primary font-bold mb-4 group-hover:text-accent transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-muted text-sm md:text-base mb-6 line-clamp-2 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-accent font-bold text-sm">
                                    Leer más
                                    <span className="transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
