/**
 * State storage helper (tanpa data dummy bawaan).
 */

const STORAGE_KEYS = {
  ITEMS: 'gm_items',
  TRANSACTIONS: 'gm_transactions',
  OPNAMES: 'gm_opnames',
  USERS: 'gm_users',
  RAKS: 'gm_raks',
  LOGS: 'gm_logs',
}

function getStored(key, defaultVal = []) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch {
    return defaultVal
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (err) {
    console.error('Storage error:', err)
  }
}

export const Store = {
  getItems() {
    return getStored(STORAGE_KEYS.ITEMS, [])
  },
  saveItems(items) {
    setStored(STORAGE_KEYS.ITEMS, items)
  },
  getTransactions() {
    return getStored(STORAGE_KEYS.TRANSACTIONS, [])
  },
  getOpnames() {
    return getStored(STORAGE_KEYS.OPNAMES, [])
  },
  getUsers() {
    return getStored(STORAGE_KEYS.USERS, [])
  },
}
