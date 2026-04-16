import { supabase } from '../src/lib/supabase'; // Importa el cliente ya configurado

async function debugCompanySync() {
    console.log("--- Diagnóstico de Sincronización de Empresa ---");
    
    // 1. Ver qué perfiles son visibles para el cliente actual
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(50);
    
    if (pError) {
        console.error("Error al obtener perfiles:", pError.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.warn("No se encontraron perfiles. Verifica las políticas de RLS en Supabase.");
        return;
    }

    console.log(`Se encontraron ${profiles.length} perfiles visibles.`);
    
    // 2. Probar lógica de agrupación (robusta)
    const companyGroups = profiles.reduce((acc: any, p: any) => {
        // Normalizar: quitar espacios y pasar a mayúsculas
        const name = (p.full_name || 'SIN_NOMBRE').trim().toUpperCase();
        if (!acc[name]) acc[name] = [];
        acc[name].push({ id: p.id, email: p.email });
        return acc;
    }, {});
    
    console.log("Grupos de Empresa detectados:", JSON.stringify(companyGroups, null, 2));

    // 3. Verificar específicamente "GRUPO ALCA"
    const grupoAlca = companyGroups["GRUPO ALCA"];
    if (grupoAlca) {
        console.log(`✅ GRUPO ALCA tiene ${grupoAlca.length} usuarios vinculados.`);
    } else {
        console.log("❌ No se encontró ningún usuario bajo el nombre exacto 'GRUPO ALCA'.");
    }
}

debugCompanySync();
