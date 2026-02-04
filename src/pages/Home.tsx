
import Navbar from "../components/layout/Navbar";
import Hero from "../components/hero/Hero";
import Services from "../components/sections/Services";
import ValueProposition from "../components/sections/ValueProposition";
import Sectors from "../components/sections/Sectors";
import Contact from "../components/sections/Contact";
import Footer from "../components/layout/Footer";
import WhatsAppFloat from "../components/layout/WhatsAppFloat";

export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Services />
            <ValueProposition />
            <Sectors />
            <Contact />
            <Footer />
            <WhatsAppFloat />
        </>
    );
}
