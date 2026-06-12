export async function loadData<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback
  try {
    const s = window.localStorage.getItem(key)
    if (!s) return fallback
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

export async function saveData<T>(key: string, data: T): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('saveData error:', e)
  }
}