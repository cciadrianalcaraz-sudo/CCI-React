/* eslint-disable @typescript-eslint/no-explicit-any */
// El cliente ahora llama al proxy seguro en /api/ai
// Esto evita exponer la API KEY en el navegador.

export const extractDataFromReceipt = async (base64Image: string) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extractDataFromReceipt', payload: { base64Image } })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en el proxy de IA (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en Gemini OCR:", error);
    throw new Error("No se pudo procesar el ticket. Reintenta en un momento.");
  }
};

export const chatWithFinances = async (records: { date: string, concept: string, income: number, expense: number, expense_type: string, provider: string }[], message: string) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chatWithFinances', payload: { records, message } })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en el proxy de IA (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en Gemini Chat:", error);
    return "Lo siento, tuve un problema al analizar tus finanzas. Por favor intenta de nuevo en un momento.";
  }
};

export const generateAIBriefing = async (stats: { 
  currentMonth: string,
  current: { income: number, expense: number, topCategories: {name: string, amount: number}[] },
  previous: { income: number, expense: number, topCategories: {name: string, amount: number}[] },
  goals: unknown[],
  credits: unknown[]
}) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generateAIBriefing', payload: { stats } })
    });

    if (!response.ok) throw new Error('Error en el proxy de IA');
    return await response.json();
  } catch (error) {
    console.error("Error en AI Briefing:", error);
    return null;
  }
};
