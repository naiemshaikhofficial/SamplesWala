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

  const isAdminFromDb = !!adminRecord // True if record exists

  // 📡 AGGREGATE SYSTEM DATA
  const [
    { count: packsCount },
    { count: samplesCount },
    { count: unprocessedAiCount },
    { data: recentPurchases }
  ] = await Promise.all([
    supabase.from('sample_packs').select('*', { count: 'exact', head: true }),
    supabase.from('samples').select('*', { count: 'exact', head: true }),
    supabase.from('samples').select('*', { count: 'exact', head: true }).eq('ai_is_processed', false),
    supabase.from('purchases').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <AdminDashboardClient 
        packsCount={packsCount || 0}
        samplesCount={samplesCount || 0}
        unprocessedAiCount={unprocessedAiCount || 0}
        recentPurchases={recentPurchases || []}
        userEmail={user?.email || ''}
        isAdminFromDb={isAdminFromDb}
    />
  )
}
