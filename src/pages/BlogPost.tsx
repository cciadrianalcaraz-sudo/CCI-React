import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { blogPosts } from "../data/blog";
import NewsletterModal from "../components/blog/NewsletterModal";

export default function BlogPost() {
    const { id } = useParams();
    const [showNewsletter, setShowNewsletter] = useState(false);
    const post = blogPosts.find(p => p.id === id);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    return (
        <div className="pt-32 pb-16 md:pt-44 md:pb-24 bg-white">
            {/* Header / Hero */}
            <article className="max-w-[800px] mx-auto px-6">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span className="px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-widest">
                            {post.category}
                        </span>
                        <span className="text-muted text-sm font-medium">{post.date}</span>
                    </div>
                    <h1 className="text-[clamp(1.8rem,5vw,3.2rem)] font-heading text-primary font-bold leading-[1.1] mb-8">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-3 text-sm text-neutral-500">
                        <div className="w-10 h-10 rounded-full bg-light-beige flex items-center justify-center text-accent font-bold">
                            {post.author.charAt(0)}
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-primary leading-tight">{post.author}</p>
                            <p className="text-xs font-medium uppercase tracking-tighter">Colaborador CCI</p>
                        </div>
                    </div>
                </div>

                <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-[#efe7d8]">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none text-neutral-700 leading-[1.8] font-serif
                    prose-headings:font-heading prose-headings:text-primary prose-headings:font-bold
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-p:mb-6 prose-p:text-lg
                    prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-accent prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:my-10
                    prose-strong:text-primary prose-strong:font-bold"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-16 pt-12 border-t border-light-beige">
                    <div className="bg-[#faf7f2] p-8 rounded-[2.5rem] border border-[#efe7d8] flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-primary mb-2 font-heading">¿Te resultó útil este análisis?</h3>
                            <p className="text-muted">Suscríbete para recibir nuestras actualizaciones estratégicas directamente en tu correo.</p>
                        </div>
                        <button
                            onClick={() => setShowNewsletter(true)}
                            className="bg-accent text-[#2c2210] px-8 py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:bg-[#a67d3d] transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                            Suscribirme ahora
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
                        ← Volver al blog
                    </Link>
                </div>
            </article>

            {showNewsletter && (
                <NewsletterModal onClose={() => setShowNewsletter(false)} />
            )}
        </div>
    );
}
