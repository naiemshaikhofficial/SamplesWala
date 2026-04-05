import { Hero } from "@/components/home/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero />
      
      {/* Featured Packs Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Featured Packs</h2>
          <Link href="/browse" className="text-xs font-bold uppercase tracking-widest border-b border-white/20 pb-1 hover:border-white transition-all">View all collections</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="group flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer">
              <div className="aspect-square relative overflow-hidden rounded-xl bg-white/5 mb-4 group-hover:shadow-2xl transition-all">
                 <div className="absolute inset-0 flex items-center justify-center text-white/5 font-black italic text-3xl uppercase tracking-tighter mix-blend-overlay">
                    WALA
                </div>
              </div>
              <h3 className="font-bold text-lg leading-tight mb-4 uppercase tracking-tight">New Wave Vol. {i}</h3>
              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-sm font-black italic text-white/60 group-hover:text-white transition-colors">₹1,499 / $19.99</span>
                <div className="h-2 w-2 rounded-full bg-white/20"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="bg-white/5 p-12 md:p-20 rounded-[3rem] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-center mb-16 relative">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 relative">
            {['Drums', 'Vocals', 'FX', 'Synths', 'Bass', 'Bollywood'].map((cat) => (
                <Link key={cat} href={`/browse?category=${cat.toLowerCase()}`} className="group aspect-square rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4 transition-all hover:bg-white active:scale-95">
                    <span className="text-sm font-black uppercase tracking-tighter group-hover:text-black">{cat}</span>
                </Link>
            ))}
            </div>
        </div>
      </section>
    </div>
  );
}
