import { Link } from "react-router-dom";
import logo from "../../assets/ccicontable-logo.png";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-[8vw] py-4 shadow-sm">
            <div className="flex items-center justify-between gap-6 flex-col md:flex-row md:items-center items-start">
                <Link to="/" className="flex flex-col gap-1 font-semibold group">
                    <img
                        className="w-[min(220px,40vw)] h-auto object-contain transition-transform group-hover:scale-[1.02]"
                        src={logo}
                        alt="CCI Consultoría Contable Integral" />
                    <span className="text-[0.6rem] text-muted uppercase tracking-[0.1rem]">Consultoría Contable Integral</span>
                </Link>
                <div className="flex gap-6 font-semibold text-primary-dark flex-wrap text-sm">
                    <Link className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" to="/">Inicio</Link>
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="/#servicios">Servicios</a>
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="/#valor">Propuesta de valor</a>
                    <Link className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" to="/asesorias">Asesorías</Link>
                    <Link className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" to="/planes">Planes</Link>
                    <Link className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" to="/capacitaciones">Capacitaciones</Link>
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[4px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="/#contacto">Contacto</a>
                </div>
            </div>
        </nav>
    );
}
