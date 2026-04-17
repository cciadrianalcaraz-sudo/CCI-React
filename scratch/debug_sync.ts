import { supabase } from '../src/lib/supabase';

async function debugCompanySync() {
    console.log("--- Diagnóstico de Sincronización de Empresa ---");
    
    // 1. Obtener perfiles para verificar visibilidad
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);
    
    if (pError) {
        console.error("❌ Error al obtener perfiles:", pError.message);
        return;
    }

    console.log(`✅ Se encontraron ${profiles?.length || 0} perfiles visibles.`);

    // 2. Agrupar usuarios por nombre de empresa (full_name)
    const companyGroups = (profiles || []).reduce((acc: any, p: any) => {
        const name = (p.full_name || 'SIN_NOMBRE').trim();
        if (!acc[name]) acc[name] = [];
        acc[name].push({ id: p.id, email: p.email });
        return acc;
    }, {});
    
    console.log("📊 Grupos de Empresa detectados:", JSON.stringify(companyGroups, null, 2));

    // 3. Verificar específicamente la empresa "GRUPO ALCA"
    const grupoAlca = companyGroups["GRUPO ALCA"];
    if (grupoAlca) {
        console.log(`✨ GRUPO ALCA tiene ${grupoAlca.length} usuarios vinculados correctamente.`);
    } else {
        console.log("⚠️ No se encontró la empresa 'GRUPO ALCA' en los perfiles visibles.");
    }
}

debugCompanySync();
