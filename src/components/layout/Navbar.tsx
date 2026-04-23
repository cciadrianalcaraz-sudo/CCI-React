import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/ccicontable-logo.png";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const navLinks = [
        { name: "Inicio", path: "/#top" },
        { name: "Servicios", path: "/#servicios" },
        { name: "Propuesta de valor", path: "/#valor" },
        { name: "Asesorías", path: "/asesorias" },
        { name: "Paquetes", path: "/paquetes" },
        { name: "Capacitaciones", path: "/capacitaciones" },
        { name: "Blog", path: "/blog" },
        { name: "Contacto", path: "/#contacto" },
    ];

    const LinkComponent = ({ link, className }: { link: typeof navLinks[0], className?: string }) => {
        const isExternal = link.path.startsWith("/#") || link.path === "/";
        if (isExternal) {
            return (
                <a
                    className={className}
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                >
                    {link.name}
                </a>
            );
        }
        return (
            <Link
                className={className}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
            >
                {link.name}
            </Link>
        );
    };

    const isPortal = location.pathname === '/portal';

    return (
        <nav className={`
            fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] transition-all duration-300
            ${isPortal ? 'py-2 bg-white/70 backdrop-blur-lg border-b border-light-beige/30' : 'py-4 bg-white/90 backdrop-blur-md border-b border-light-beige/50'}
            ${isMenuOpen ? "bg-transparent shadow-none border-transparent" : "shadow-sm"}
        `}>
            <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                <Link to="/#top" className="flex flex-col gap-0 font-semibold group z-50">
                    <img
                        className={`transition-all group-hover:scale-[1.02] object-contain ${isPortal ? 'w-[100px] md:w-[160px]' : 'w-[160px] md:w-[220px]'}`}
                        src={logo}
                        alt="CCI Consultoría Contable Integral" />
                    {!isPortal && <span className="text-[0.5rem] md:text-[0.6rem] text-muted uppercase tracking-[0.1rem]">Consultoría Contable Integral</span>}
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    <div className="flex gap-8 font-semibold text-primary-dark text-sm">
                        {navLinks.map((link) => (
                            <LinkComponent
                                key={link.path}
                                link={link}
                                className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
                            />
                        ))}
                    </div>
                    {!isPortal && (
                        <Link to="/portal" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark hover:scale-[1.02] transition-all">
                            Portal Clientes
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden z-50 p-2 text-primary-dark hover:bg-light-beige/20 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Navigation Overlay */}
                <div className={`
                    fixed inset-0 bg-white transition-all duration-500 lg:hidden z-[45]
                    ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
                `}>
                    <div className="flex flex-col h-full pt-32 pb-12 px-[8vw]">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link, index) => (
                                <div
                                    key={link.path}
                                    className={`transition-all duration-500 transform ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
                                    style={{ transitionDelay: `${index * 60}ms` }}
                                >
                                    <LinkComponent
                                        link={link}
                                        className="text-2xl font-bold text-primary-dark hover:text-accent transition-colors block py-3 border-b border-light-beige/30"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={`mt-auto transition-all duration-700 delay-500 transform ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 flex flex-col gap-3"}`}>
                            <p className="text-muted text-xs mb-3 font-medium uppercase tracking-wider text-center">Acceso Rápido</p>
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/portal"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="inline-block w-full bg-white text-primary-dark border-2 border-primary py-4 px-8 rounded-2xl font-bold text-center active:scale-95 transition-transform"
                                >
                                    Portal Clientes
                                </Link>
                                <a
                                    href="https://wa.me/5213121682366"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-full bg-accent text-[#2c2210] py-4 px-8 rounded-2xl font-bold text-center shadow-lg shadow-accent/20 active:scale-95 transition-transform"
                                >
                                    Agendar vía WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
