import { GoogleGenerativeAI } from "@google/generative-ai";

// El usuario deberá añadir VITE_GEMINI_API_KEY en su archivo .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const extractDataFromReceipt = async (base64Image: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analiza esta imagen de un ticket de compra o factura. 
      Extrae la siguiente información en formato JSON puro (sin markdown, sin bloques de código):
      {
        "amount": número (el total final),
        "date": "YYYY-MM-DD" (la fecha de compra),
        "provider": "Nombre del Comercio",
        "concept": "Breve descripción de lo comprado",
        "category": "Una de: Alimentación, Transporte, Servicios, Entretenimiento, Salud, Educación, Otros"
      }
      Si no puedes encontrar un campo, deja el valor como null o string vacío.
      Responde SOLO el objeto JSON.
    `;

    // Eliminar el prefijo base64 si existe
    const imageData = base64Image.split(',')[1] || base64Image;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg" // Asumimos jpeg por defecto, se puede mejorar luego
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Limpiar posibles etiquetas de markdown que Gemini a veces añade a pesar del prompt
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error en Gemini OCR:", error);
    throw new Error("No se pudo procesar el ticket. Verifica tu API Key o conexión.");
  }
};

export const chatWithFinances = async (records: any[], message: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Resumir los datos para no exceder límites y dar contexto útil
    // Solo enviamos los datos esenciales de los últimos meses si son muchos
    const summary = records.slice(0, 100).map(r => ({
      fecha: r.date,
      concepto: r.concept,
      monto: r.income > 0 ? r.income : -r.expense,
      tipo: r.expense_type,
      proveedor: r.provider
    }));

    const prompt = `
      Eres un Asistente Financiero Inteligente para una plataforma de control de gastos.
      Tienes acceso a los siguientes movimientos financieros del usuario:
      ${JSON.stringify(summary)}

      Responde a la siguiente pregunta del usuario de forma breve, profesional y útil en español:
      "${message}"

      Si te preguntan por totales o cálculos, usa los datos proporcionados.
      Si no tienes suficiente información, admítelo y sugiere cómo el usuario puede registrar mejor sus datos.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en Gemini Chat:", error);
    return "Lo siento, tuve un problema al analizar tus finanzas. Por favor intenta de nuevo en un momento.";
  }
};
