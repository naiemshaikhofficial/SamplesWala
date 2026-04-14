
import { getAdminClient } from './src/lib/supabase/admin'

async function checkCategories() {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.from('categories').select('*').limit(1)
    console.log('Category Fields:', data ? Object.keys(data[0]) : 'No data')
}

checkCategories()
