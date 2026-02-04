
// import logo from "../../assets/ccicontable-logo.png";

// Placeholder for logic if image is missing, or just assume it is there.
// For now, I will comment out the image import and use a text fallback or a placeholder URL to avoid build errors if the user hasn't put the image yet.
// However, the user said "Te dejo estructura... assets/...", implies I should use it.
// I will use a public placeholder for now so it works out of the box.
const logo = "https://placehold.co/260x80?text=CCI+Contable";

export default function Navbar() {
    return (
        <nav className="flex flex-col md:flex-row md:justify-between gap-6 px-[8vw] py-10 items-center">
            <div className="flex flex-col gap-2 font-semibold">
                <img src={logo} alt="CCI Contable" className="w-[260px]" />
                <span className="text-xs uppercase tracking-widest text-neutral-500 text-center md:text-left">
                    Consultoría Contable Integral
                </span>
            </div>

            <div className="flex gap-6 font-semibold text-neutral-800">
                <a href="#servicios" className="hover:text-[#b28a45] transition">Servicios</a>
                <a href="#valor" className="hover:text-[#b28a45] transition">Propuesta de valor</a>
                <a href="#contacto" className="hover:text-[#b28a45] transition">Contacto</a>
            </div>
        </nav>
    );
}
