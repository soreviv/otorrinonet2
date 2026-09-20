import '@testing-library/jest-dom'

// Node 22+ has an experimental localStorage on globalThis that is undefined without --localstorage-file.
// Provide an in-memory Storage implementation for test environments.
if (typeof window !== 'undefined') {
  const store = new Map<string, string>()
  const localStorageMock: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
}




