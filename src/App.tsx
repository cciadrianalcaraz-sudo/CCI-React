import { Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Training from "./pages/Training";

export default function App() {
  const initialOptions = {
    clientId: "Aazh1wUigvYWiSB1ZLFbYTxNwjIZET3EP9B8vmph333vqLfrMqxRCG4-47u6RasmiC05ilZgmbyfDWh0",
    currency: "MXN",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capacitaciones" element={<Training />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </PayPalScriptProvider>
  );
}
