

export default function WhatsAppFloat() {
    return (
        <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition z-50"
            aria-label="Contactar por WhatsApp"
        >
            {/* Simple WhatsApp Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382C17.11 14.362 14.655 13.455 14.2 13.09C13.745 12.725 13.545 12.635 13 13.455C12.455 14.275 11.545 15.64 11.182 16.005C10.818 16.37 10.09 16.37 9.182 16.005C8.273 15.64 5.364 14.64 3.91 12.635C2.455 10.63 2.545 10.265 4 8.445C4.545 7.715 5.09 6.985 5.09 6.255C5.09 5.525 3.636 2.065 3.09 1.155C2.545 0.245 1.818 0.425 1.455 0.425H0C0 0.425 -0.545 3.155 0.909 5.525C2.364 7.895 6.364 13.175 12.182 15.36C18 17.545 18 16.635 18.545 16.005C19.09 15.375 20.364 13.55 20.364 12.635C20.364 11.725 18.91 14.455 17.472 14.382Z" />
            </svg>
        </a>
    );
}
