
import * as dotenv from 'dotenv';

// Cargar variables de entorno si existen, o usar las del proyecto
// Nota: En este entorno, tendré que ver cómo obtener las keys.
// Miraré src\lib\supabase.ts
import { supabase } from './src/lib/supabase';

async function debugCompanySync() {
    console.log("--- Debugging Company Sync ---");
    
    // 1. Ver perfiles actuales
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(10);
    
    if (pError) {
        console.error("Error fetching profiles:", pError);
    } else {
        console.log("Profiles found:", profiles);
        
        // 2. Probar lógica de agrupación por full_name
        const companyGroups = profiles.reduce((acc, p) => {
            const name = p.full_name || 'NULL';
            if (!acc[name]) acc[name] = [];
            acc[name].push(p.id);
            return acc;
        }, {});
        
        console.log("Groups by full_name:", companyGroups);
    }
}

debugCompanySync();
