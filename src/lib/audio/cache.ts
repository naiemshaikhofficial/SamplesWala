/**
 * 🛰️ STUDIO_VAULT_CACHE (Local Signal Storage)
 * Securely caches watermarked previews in IndexedDB to minimize redundant fetches.
 */

const DB_NAME = 'StudioAudioVault'
const STORE_NAME = 'audio_cache'
const DB_VERSION = 1

export async function getCachedAudio(id: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = (event: any) => {
            const db = event.target.result
            const transaction = db.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)
            const getReq = store.get(id)

            getReq.onsuccess = () => resolve(getReq.result || null)
            getReq.onerror = () => resolve(null)
        }

        request.onerror = () => resolve(null)
    })
}

export async function cacheAudio(id: string, blob: Blob) {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onsuccess = (event: any) => {
        const db = event.target.result
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        store.put(blob, id)
    }
}

export function clearAudioCache() {
    indexedDB.deleteDatabase(DB_NAME)
}
