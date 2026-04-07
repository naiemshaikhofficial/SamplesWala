
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface RegistryCache {
  version: string
  data: Record<string, any>
  timestamp: number
}

const CACHE_KEY = 'SAMPLESWALA_REGISTRY_VAULT'

export async function getGlobalVersion() {
    // This is a fast-track server action to check the DB version
    const { getAdminClient } = await import('@/lib/supabase/admin');
    const admin = getAdminClient();
    const { data } = await admin.from('app_metadata').select('value').eq('key', 'catalog_version').single();
    return data?.value || '1';
}

export const useRegistryCache = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const getCached = (key: string) => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        try {
            const vault: RegistryCache = JSON.parse(raw);
            return vault.data[key] || null;
        } catch { return null; }
    }

    const setCached = (key: string, data: any, version: string) => {
        if (typeof window === 'undefined') return;
        const raw = localStorage.getItem(CACHE_KEY);
        let vault: RegistryCache = { version, data: {}, timestamp: Date.now() };
        try {
            if (raw) {
                const existing = JSON.parse(raw);
                if (existing.version === version) vault = existing;
            }
        } catch {}
        
        vault.data[key] = data;
        vault.version = version;
        vault.timestamp = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(vault));
    }

    const checkSync = async () => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null; // Force fresh fetch
        
        try {
            const vault: RegistryCache = JSON.parse(raw);
            // In a real app, we'd call a server action here to get the DB version
            // For now, return the cached version to compare later
            return vault.version;
        } catch { return null; }
    }

    return { getCached, setCached, checkSync, isSyncing };
}
