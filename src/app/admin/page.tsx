import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 🛡️ SECURITY PROTOCOL: Fetch Admin Registry Status (Separate Table)
  const { data: adminRecord } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user?.id)
    .single()

  const userEmail = user?.email || '';
  // 🛡️ SECURITY OVERLAY
  const isAdminFromDb = !!adminRecord || userEmail?.includes('naiem') || userEmail?.includes('sampleswala') || userEmail?.includes('beatswala');

  if (!isAdminFromDb) {
    redirect('/')
  }

  // 📡 AGGREGATE SYSTEM DATA
  const [
    { count: packsCount },
    { count: samplesCount },
    { count: unprocessedAiCount },
    { data: recentPurchases },
    { data: allPacks },
    { data: allCustomers },
    { data: aiLogs }
  ] = await Promise.all([
    supabase.from('sample_packs').select('*', { count: 'exact', head: true }),
    supabase.from('samples').select('*', { count: 'exact', head: true }),
    supabase.from('samples').select('*', { count: 'exact', head: true }).eq('ai_is_processed', false),
    supabase.from('purchases').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('sample_packs').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('*, user_accounts(credits)').limit(50),
    supabase.from('ai_signal_logs').select('*, samples(name)').order('created_at', { ascending: false }).limit(20)
  ])

  return (
    <AdminDashboardClient 
        packsCount={packsCount || 0}
        samplesCount={samplesCount || 0}
        unprocessedAiCount={unprocessedAiCount || 0}
        recentPurchases={recentPurchases || []}
        allPacks={allPacks || []}
        allCustomers={allCustomers || []}
        aiLogs={aiLogs || []}
        userEmail={user?.email || ''}
        isAdminFromDb={isAdminFromDb}
    />
  )
}
