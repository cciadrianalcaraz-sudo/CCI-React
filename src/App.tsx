import Header from './components/Header';
import About from './components/sections/About';
import Services from './components/Services';
import ValueProposition from './components/ValueProposition';
import Sectors from './components/Sectors';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <About />
        <Services />
        <ValueProposition />
        <Sectors />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
