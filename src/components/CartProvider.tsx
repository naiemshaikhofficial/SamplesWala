'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
    id: string
    name: string
    cover_url: string
    price_inr: number
    price_usd: number
    slug: string
    type: 'pack' | 'sample' | 'preset'
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    isInCart: (id: string) => boolean
    totalItems: number
    totalPriceINR: number
    totalPriceUSD: number
    isCartOpen: boolean
    setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isCartOpen, setCartOpen] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('studio_cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
    }, [])

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('studio_cart', JSON.stringify(items))
    }, [items])

    const addItem = (item: CartItem) => {
        setItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev
            return [...prev, item]
        })
        setCartOpen(true) // Auto open cart when item added
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const clearCart = () => {
        setItems([])
    }

    const isInCart = (id: string) => {
        return items.some(i => i.id === id)
    }

    const totalItems = items.length
    const totalPriceINR = items.reduce((sum, item) => sum + item.price_inr, 0)
    const totalPriceUSD = items.reduce((sum, item) => sum + item.price_usd, 0)

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            clearCart,
            isInCart,
            totalItems,
            totalPriceINR,
            totalPriceUSD,
            isCartOpen,
            setCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
