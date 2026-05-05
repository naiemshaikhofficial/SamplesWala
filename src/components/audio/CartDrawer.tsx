'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingCart, ArrowRight, Zap, Monitor, Disc } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import Image from 'next/image'
import Link from 'next/link'
import { useCurrency } from '@/components/CurrencyProvider'

export function CartDrawer() {
    const { isCartOpen, setCartOpen, items, removeItem, clearCart, totalPriceINR, totalPriceUSD, totalItems } = useCart()
    const { currency } = useCurrency()

    const displayPrice = (inr: number, usd: number) => {
        return currency === 'INR' ? `₹${inr}` : `$${usd}`
    }

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* 🌫️ OVERLAY */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCartOpen(false)}
                        className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md"
                    />
                    
                    {/* 🛒 SHOPPING_CART_PANEL */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[3010] w-full max-w-md bg-[#0d0d0d] border-l-4 border-black flex flex-col h-full shadow-[-40px_0_100px_rgba(0,0,0,1)]"
                    >
                        {/* 🛠️ CART_HEADER */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#151515] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-studio-neon via-studio-neon/50 to-transparent opacity-50" />
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 bg-black border border-studio-neon/20 rounded-lg flex items-center justify-center shadow-[inset_0_0_10px_rgba(166,226,46,0.1)]">
                                    <ShoppingCart className="h-6 w-6 text-studio-neon animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white leading-none">Your Cart</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{totalItems} Items</span>
                                        {totalItems > 0 && (
                                            <button 
                                                onClick={() => clearCart()}
                                                className="text-[9px] font-black text-spider-red/60 hover:text-spider-red transition-colors ml-2 uppercase tracking-widest"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setCartOpen(false)} 
                                className="p-3 bg-white/5 rounded-full text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* 📦 ITEMS_LIST */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-[#0d0d0d]">
                            <div className="flex items-center gap-3 mb-6 opacity-20">
                                <div className="h-px flex-1 bg-white/20" />
                                <span className="text-[9px] font-mono uppercase tracking-[0.5em]">Order Review</span>
                                <div className="h-px flex-1 bg-white/20" />
                            </div>

                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <Disc className="h-24 w-24 text-white/5 animate-spin-slow" />
                                        <Monitor className="h-8 w-8 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white/10">Your cart is empty</p>
                                    <p className="text-[9px] font-mono mt-3 text-white/10 max-w-[200px]">Browse our library to add some sounds!</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="group relative flex gap-5 p-5 bg-[#151515] border-l-2 border-white/5 hover:border-l-studio-neon hover:bg-[#1a1a1a] transition-all duration-300 rounded-r-xl shadow-lg"
                                    >
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden shadow-2xl border border-black flex-shrink-0">
                                            <Image 
                                                src={item.cover_url} 
                                                alt={item.name} 
                                                fill 
                                                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-sm font-black text-white uppercase tracking-wider truncate pr-4 group-hover:text-studio-neon transition-colors">{item.name}</h3>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-white/10 hover:text-spider-red transition-colors p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest italic">{item.type}</span>
                                                <div className="h-1 w-1 rounded-full bg-white/10" />
                                                <span className="text-sm font-black text-studio-neon font-mono">
                                                    {displayPrice(item.price_inr, item.price_usd)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 🛠️ INDUSTRIAL_DETAIL */}
                                        <div className="absolute right-2 top-2 flex gap-1 opacity-10 group-hover:opacity-30 transition-opacity">
                                            {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-white" />)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 💳 CART_FOOTER */}
                        <div className="p-8 bg-[#151515] border-t-4 border-black relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-neon/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-end mb-8 relative">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-studio-neon/60 uppercase tracking-[0.4em] mb-1">Total Price</span>
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">VAT Inclusive</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {displayPrice(totalPriceINR, totalPriceUSD)}
                                    </span>
                                </div>
                            </div>

                            <Link 
                                href="/checkout?mode=cart" 
                                onClick={() => setCartOpen(false)}
                                className={`group relative w-full h-16 flex items-center justify-center gap-4 bg-studio-neon text-black font-black uppercase tracking-[0.3em] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(166,226,46,0.2)] hover:shadow-[0_0_50px_rgba(166,226,46,0.4)] transition-all active:scale-[0.98] ${items.length === 0 ? 'pointer-events-none grayscale opacity-30' : ''}`}
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                                <span className="text-xs z-10">Checkout Now</span>
                                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform z-10" />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                                    <Zap size={14} />
                                </div>
                            </Link>

                            <p className="text-[8px] text-center mt-6 text-white/10 font-mono uppercase tracking-[0.3em]">Secure Checkout Protocol_v2.4</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
