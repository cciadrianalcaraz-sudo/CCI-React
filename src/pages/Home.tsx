import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Services from "../components/Services";
import ValueProposition from "../components/ValueProposition";
import Sectors from "../components/Sectors";
import Contact from "../components/Contact";

export default function Home() {
    return (
        <main>
            <Hero />
            <Services />
            <About />
            <ValueProposition />
            <Sectors />
            <Contact />
        </main>
    );
}
