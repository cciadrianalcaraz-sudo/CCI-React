import { supabase } from '../src/lib/supabase'; // Importa el cliente ya configurado

async function debugCompanySync() {
    console.log("--- Diagnóstico de Sincronización de Empresa ---");
    
    // 1. Ver perfiles actuales
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
    
    if (pError) {
    
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
