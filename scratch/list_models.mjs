import { readFileSync } from 'fs';
import { join } from 'path';

async function listModels() {
    let apiKey = '';
    try {
        const envContent = readFileSync('.env', 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    } catch (e) {
        console.error("No se pudo leer .env");
    }

    if (!apiKey) {
        console.error("API Key no encontrada");
        return;
    }

    try {
        console.log("Consultando modelos disponibles...");
        
        const responseBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const dataBeta = await responseBeta.json();
        
        if (dataBeta.models) {
            console.log("Modelos v1beta encontrados:", dataBeta.models.length);
            dataBeta.models.forEach(m => {
                if (m.name.includes('flash') || m.name.includes('pro')) {
                    console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log("No se encontraron modelos en v1beta o error:", JSON.stringify(dataBeta));
        }

        const responseV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const dataV1 = await responseV1.json();
        
        if (dataV1.models) {
            console.log("\nModelos v1 encontrados:", dataV1.models.length);
            dataV1.models.forEach(m => {
                if (m.name.includes('flash') || m.name.includes('pro')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("\nNo se encontraron modelos en v1.");
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
