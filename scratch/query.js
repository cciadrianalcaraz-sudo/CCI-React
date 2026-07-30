const supabaseUrl = 'https://xfiwzwrgpfjwbysrgopp.supabase.co';
const supabaseKey = 'sb_publishable_I3lZMm3b1R9HPCadXJ14Mw_UD31Oqbd';

async function getRecords() {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/finance_records?date=gte.2026-06-01&date=lte.2026-06-30&select=*&order=date.asc,created_at.asc`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const data = await response.json();
        console.log('RECORDS FOR JUNE 2026:');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

getRecords();
