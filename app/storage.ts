function serialize(data: unknown): string {
  return JSON.stringify(data)
}

function deserialize<T>(str: string | null, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}

export async function loadData<T>(key: string, fallback: T): Promise<T> {
  // Try idb-keyval first
  try {
    const { get } = await import('idb-keyval')
    const val = await get<T>(key)
    if (val !== undefined && val !== null) return val
  } catch {}
  // Fallback to localStorage
  try {
    const s = window.localStorage.getItem(key)
    if (s) return deserialize<T>(s, fallback)
  } catch {}
  // Fallback to sessionStorage
  try {
    const s = window.sessionStorage.getItem(key)
    if (s) return deserialize<T>(s, fallback)
  } catch {}
  return fallback
}

export async function saveData<T>(key: string, data: T): Promise<void> {
  const str = serialize(data)
  // Try all storage methods
  try {
    const { set } = await import('idb-keyval')
    await set(key, data)
  } catch {}
  try { window.localStorage.setItem(key, str) } catch {}
  try { window.sessionStorage.setItem(key, str) } catch {}
}