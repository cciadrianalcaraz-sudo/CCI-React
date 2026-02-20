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
        { name: "Inicio", path: "/" },
        { name: "Servicios", path: "/#servicios" },
        { name: "Propuesta de valor", path: "/#valor" },
        { name: "Asesorías", path: "/asesorias" },
        { name: "Paquetes", path: "/paquetes" },
        { name: "Capacitaciones", path: "/capacitaciones" },
        { name: "Contacto", path: "/#contacto" },
    ];

    const LinkComponent = ({ link, className }: { link: typeof navLinks[0], className?: string }) => {
        const isExternal = link.path.startsWith("/#");
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md px-[6vw] md:px-[8vw] py-4 shadow-sm border-b border-light-beige/50">
            <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                <Link to="/" className="flex flex-col gap-0.5 font-semibold group z-50">
                    <img
                        className="w-[180px] md:w-[220px] h-auto object-contain transition-transform group-hover:scale-[1.02]"
                        src={logo}
                        alt="CCI Consultoría Contable Integral" />
                    <span className="text-[0.55rem] md:text-[0.6rem] text-muted uppercase tracking-[0.1rem]">Consultoría Contable Integral</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex gap-8 font-semibold text-primary-dark text-sm">
                    {navLinks.map((link) => (
                        <LinkComponent
                            key={link.path}
                            link={link}
                            className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
                        />
                    ))}
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
                    fixed inset-0 bg-white/98 backdrop-blur-xl transition-all duration-500 lg:hidden z-[45]
                    ${isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
                `}>
                    <div className="flex flex-col h-full pt-32 pb-12 px-[10vw]">
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link, index) => (
                                <div
                                    key={link.path}
                                    className={`transition-all duration-700 transform ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
                                    style={{ transitionDelay: `${index * 70}ms` }}
                                >
                                    <LinkComponent
                                        link={link}
                                        className="text-3xl font-bold text-primary-dark hover:text-accent transition-colors block border-b border-light-beige/30 pb-4"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={`mt-auto transition-all duration-700 delay-500 transform ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
                            <p className="text-muted text-sm mb-4 font-medium italic">¿Necesitas ayuda personalizada?</p>
                            <a
                                href="https://wa.me/5213121682366"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full bg-accent text-[#2c2210] py-5 px-8 rounded-2xl font-bold text-center shadow-xl shadow-accent/20 active:scale-95 transition-transform text-lg"
                            >
                                Agendar vía WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10 -mr-32 -mt-32"></div>
                </div>
            </div>
        </nav>
    );
}
