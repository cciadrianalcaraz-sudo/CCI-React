/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: { method: string, body: any }, res: { status: (c: number) => { json: (d: any) => void } }) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, payload } = req.body;

    try {
        switch (action) {
            case 'extractDataFromReceipt':
                return res.status(200).json(await handleExtractData(payload));
            case 'chatWithFinances':
                return res.status(200).json(await handleChat(payload));
            case 'generateAIBriefing':
                return res.status(200).json(await handleBriefing(payload));
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error(`Error in action ${action}:`, error);
        return res.status(500).json({ error: message });
    }
}

async function handleExtractData({ base64Image }: { base64Image: string }) {
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
    const imageData = base64Image.split(',')[1] || base64Image;
    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageData,
                mimeType: "image/jpeg"
            }
        }
    ]);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
}

async function handleChat({ records, message }: { records: { date: string, concept: string, income: number, expense: number, expense_type: string, provider: string }[], message: string }) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
}

async function handleBriefing({ stats }: { stats: { currentMonth: string, current: unknown, previous: unknown, goals: unknown[], credits: unknown[] } }) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Eres un Coach Financiero Privado experto y motivador de nivel Premium. 
      Analiza el desempeño del usuario (Adrian) en el mes actual (${stats.currentMonth}) comparado con el mes anterior.
      
      MES ACTUAL:
      - Ingresos: $${stats.current.income.toLocaleString()}
      - Gastos: $${stats.current.expense.toLocaleString()}
      - Top Categorías de Gasto: ${stats.current.topCategories.map((c: { name: string, amount: number }) => `${c.name} ($${c.amount})`).join(', ')}
      
      MES ANTERIOR:
      - Ingresos: $${stats.previous.income.toLocaleString()}
      - Gastos: $${stats.previous.expense.toLocaleString()}
      
      METAS ACTIVAS:
      ${stats.goals.length > 0 ? stats.goals.map((g: { name: string, current_amount: number, target_amount: number }) => `- ${g.name} (Progreso: ${Math.round((g.current_amount/g.target_amount)*100)}%)`).join('\n') : 'Sin metas activas.'}

      DEUDAS/CRÉDITOS ACTIVOS:
      ${stats.credits.length > 0 ? stats.credits.map((c: { name: string, initial_balance: number }) => `- ${c.name} (Saldo Original: $${c.initial_balance})`).join('\n') : 'Sin deudas registradas.'}

      INSTRUCCIONES DE RESPUESTA (Devuelve un texto estructurado en Markdown):
      1. Da un saludo personalizado y ejecutivo.
      2. **Resumen Rápido:** Analiza si su liquidez (Ingresos - Gastos) mejoró o empeoró.
      3. **Alerta de Fugas:** Detecta si alguna categoría top está muy alta y dale un regaño *amigable y constructivo*.
      4. **Estrategia para Metas y Deudas:** Cruza la información. (Ej: "Si reduces tu gasto en X, podrías liquidar Y más rápido o alcanzar tu meta Z en menos tiempo").
      5. Termina con un Bullet de 2 "Pasos a seguir esta semana".
      6. MANTÉN LA RESPUESTA CONCISA, ELEGANTE Y FÁCIL DE LEER.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
