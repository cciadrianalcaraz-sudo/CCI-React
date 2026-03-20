import { Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import Training from "./pages/Training";
import Asesorias from "./pages/Asesorias";
import Packages from "./pages/Packages";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

export default function App() {
  const initialOptions = {
    clientId: "Aazh1wUigvYWiSB1ZLFbYTxNwjIZET3EP9B8vmph333vqLfrMqxRCG4-47u6RasmiC05ilZgmbyfDWh0",
    currency: "MXN",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capacitaciones" element={<Training />} />
        <Route path="/asesorias" element={<Asesorias />} />
        <Route path="/paquetes" element={<Packages />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <Analytics />
    </PayPalScriptProvider>
  );
}
