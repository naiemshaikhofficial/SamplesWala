import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8 font-mono text-white p-4">
            <div className="p-8 border-2 border-studio-yellow bg-studio-yellow/5 flex flex-col items-center gap-6">
                <div className="text-center">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">AUTH_REQUIRED</h2>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] font-black italic">WALA_CORE :: NO_SESSION_IDENTIFIED</p>
                </div>
                <a href="/auth/login" className="px-10 py-4 bg-studio-yellow text-black font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all">
                    Initialize Login
                </a>
            </div>
        </div>
    )
  }

  const adminClient = getAdminClient()
  const { data: adminRecord } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  const userEmail = user.email?.toLowerCase() || '';
  
  // 🛡️ SECURITY OVERLAY: Multi-level verification
  const isAdminFromDb = !!adminRecord || 
                        userEmail.includes('naiem') || 
                        userEmail.includes('sampleswala') || 
                        userEmail.includes('beatswala') ||
                        userEmail === 'naiemshaikhofficial@gmail.com' ||
                        userEmail === 'naiemshaikh@gmail.com';

  if (!isAdminFromDb) {
    redirect('/')
  }

  console.log('🛡️ ADMIN_CHECK ::', { 
    email: userEmail, 
    hasRecord: !!adminRecord, 
    granted: isAdminFromDb 
  });

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
    supabase.from('credit_orders').select('*').order('created_at', { ascending: false }).limit(5),
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
        userEmail={user.email || ''}
        isAdminFromDb={isAdminFromDb}
    />
  )
}
