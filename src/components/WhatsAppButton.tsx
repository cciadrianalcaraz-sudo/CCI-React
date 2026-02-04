import whatsapp from '../assets/whatsapp.png';

export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/5213121682366?text=Hola,%20quiero%20información%20sobre%20sus%20servicios"
            className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-[#25d366] rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center z-[9999] transition-transform duration-200 hover:scale-105 overflow-hidden border-none outline-none"
            target="_blank"
            aria-label="WhatsApp"
        >
            <img className="w-8 h-8 block border-none outline-none rounded-full" src={whatsapp} alt="WhatsApp" />
        </a>
    );
}
