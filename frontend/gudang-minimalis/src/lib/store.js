/**
 * Unified Local State & Storage Manager for Gudang Minimalis
 * Provides realistic offline persistence across all modules and pages.
 */

const STORAGE_KEYS = {
  ITEMS: 'gm_items',
  TRANSACTIONS: 'gm_transactions',
  OPNAMES: 'gm_opnames',
  USERS: 'gm_users',
  RAKS: 'gm_raks',
  LOGS: 'gm_logs',
}

const DEFAULT_ITEMS = [
  { id: 1, sku: 'CBL-CAT6-100M', nama: 'Kabel UTP Cat6 100m', kategori: 'Elektronik', rak: 'A-01', satuan: 'Roll', stok: 18, minStok: 5, status: 'Aman' },
  { id: 2, sku: 'SWT-GB-016', nama: 'Switch Hub 16-Port Gigabit', kategori: 'Elektronik', rak: 'A-02', satuan: 'Unit', stok: 3, minStok: 5, status: 'Kritis' },
  { id: 3, sku: 'KRD-DW-A03', nama: 'Kardus Double Wall A3', kategori: 'Logistik', rak: 'B-01', satuan: 'Pcs', stok: 120, minStok: 50, status: 'Aman' },
  { id: 4, sku: 'LKB-HD-050', nama: 'Lakban Bening Heavy Duty', kategori: 'Logistik', rak: 'B-02', satuan: 'Roll', stok: 4, minStok: 10, status: 'Kritis' },
  { id: 5, sku: 'KRT-TH-150', nama: 'Kertas Thermal Stiker 100x150', kategori: 'ATK', rak: 'C-01', satuan: 'Roll', stok: 45, minStok: 15, status: 'Aman' },
  { id: 6, sku: 'SCN-2D-HND', nama: 'Barcode Scanner Handheld 2D', kategori: 'ATK', rak: 'C-02', satuan: 'Unit', stok: 0, minStok: 2, status: 'Habis' },
  { id: 7, sku: 'RMP-SF-HIV', nama: 'Rompi Keselamatan High-Vis', kategori: 'Safety', rak: 'D-01', satuan: 'Pcs', stok: 22, minStok: 10, status: 'Aman' },
  { id: 8, sku: 'GLV-SF-GRP', nama: 'Sarung Tangan Karet Grip', kategori: 'Safety', rak: 'D-02', satuan: 'Pasang', stok: 2, minStok: 12, status: 'Kritis' },
]

const DEFAULT_TRANSACTIONS = [
  { id: 1, waktu: '09:14:02', rak: 'A-01', barang: 'Kabel UTP Cat6 100m', tipe: 'IN', jumlah: 24, catatan: 'Surat Jalan SJ-881' },
  { id: 2, waktu: '09:02:47', rak: 'B-02', barang: 'Lakban Bening Heavy Duty', tipe: 'OUT', jumlah: 6, catatan: 'Pengeluaran Packing' },
  { id: 3, waktu: '08:55:30', rak: 'C-01', barang: 'Kertas Thermal Stiker 100x150', tipe: 'IN', jumlah: 48, catatan: 'Restok Supplier' },
  { id: 4, waktu: '08:40:12', rak: 'A-02', barang: 'Switch Hub 16-Port Gigabit', tipe: 'OUT', jumlah: 2, catatan: 'Instalasi Kantor Cabang' },
  { id: 5, waktu: '08:22:58', rak: 'B-01', barang: 'Kardus Double Wall A3', tipe: 'IN', jumlah: 100, catatan: 'Penerimaan Palet' },
]

const DEFAULT_OPNAMES = [
  {
    id: 1,
    noSesi: 'OPN-2026-0044',
    rak: 'A-01',
    staf: 'Budi Santoso',
    tanggal: '28 Okt 2026, 14:20',
    itemCount: 4,
    selisihTotal: -2,
    status: 'MENUNGGU',
    items: [
      { sku: 'CBL-CAT6-100M', nama: 'Kabel UTP Cat6 100m', stokSistem: 20, stokFisik: 18, selisih: -2, keterangan: '2 Roll rusak packaging' },
      { sku: 'SWT-GB-016', nama: 'Switch Hub 16-Port Gigabit', stokSistem: 3, stokFisik: 3, selisih: 0, keterangan: 'Kondisi baik' },
    ],
  },
  {
    id: 2,
    noSesi: 'OPN-2026-0043',
    rak: 'B-01',
    staf: 'Siti Rahayu',
    tanggal: '28 Okt 2026, 11:15',
    itemCount: 3,
    selisihTotal: 5,
    status: 'DISETUJUI',
    items: [
      { sku: 'KRD-DW-A03', nama: 'Kardus Double Wall A3', stokSistem: 115, stokFisik: 120, selisih: 5, keterangan: 'Sisa packing belum tercatat' },
    ],
  },
]

const DEFAULT_USERS = [
  { id: 1, nama: 'Ahmad Fauzi', email: 'ahmad.fauzi@wh01.id', peran: 'Admin', aktif: true, login: '29 Okt 2026, 01:40' },
  { id: 2, nama: 'Budi Santoso', email: 'budi.santoso@wh01.id', peran: 'Kepala Gudang', aktif: true, login: '29 Okt 2026, 00:20' },
  { id: 3, nama: 'Siti Rahayu', email: 'siti.rahayu@wh01.id', peran: 'Staf Gudang', aktif: true, login: '28 Okt 2026, 16:30' },
  { id: 4, nama: 'Dewi Lestari', email: 'dewi.lestari@wh01.id', peran: 'Staf Gudang', aktif: true, login: '28 Okt 2026, 14:15' },
]

function getStored(key, defaultVal) {
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
  // Items
  getItems() {
    return getStored(STORAGE_KEYS.ITEMS, DEFAULT_ITEMS)
  },
  saveItems(items) {
    setStored(STORAGE_KEYS.ITEMS, items)
  },
  addItem(item) {
    const items = this.getItems()
    const updated = [item, ...items]
    this.saveItems(updated)
    return updated
  },
  updateStock(rakKode, deltaQuantity) {
    const items = this.getItems()
    const updated = items.map((item) => {
      if (item.rak.includes(rakKode) || item.sku.includes(rakKode)) {
        const newStok = Math.max(0, item.stok + deltaQuantity)
        const status = newStok === 0 ? 'Habis' : newStok <= item.minStok ? 'Kritis' : 'Aman'
        return { ...item, stok: newStok, status }
      }
      return item
    })
    this.saveItems(updated)
    return updated
  },

  // Transactions
  getTransactions() {
    return getStored(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS)
  },
  addTransaction(tx) {
    const list = this.getTransactions()
    const newTx = {
      id: Date.now(),
      waktu: new Date().toLocaleTimeString('id-ID'),
      ...tx,
    }
    const updated = [newTx, ...list]
    setStored(STORAGE_KEYS.TRANSACTIONS, updated)
    return updated
  },

  // Opnames
  getOpnames() {
    return getStored(STORAGE_KEYS.OPNAMES, DEFAULT_OPNAMES)
  },
  addOpname(opname) {
    const list = this.getOpnames()
    const newOp = {
      id: Date.now(),
      noSesi: `OPN-2026-${String(list.length + 45).padStart(4, '0')}`,
      status: 'MENUNGGU',
      ...opname,
    }
    const updated = [newOp, ...list]
    setStored(STORAGE_KEYS.OPNAMES, updated)
    return updated
  },
  setOpnameStatus(id, status, notes = '') {
    const list = this.getOpnames()
    const updated = list.map((op) => (op.id === id ? { ...op, status, notes } : op))
    setStored(STORAGE_KEYS.OPNAMES, updated)
    return updated
  },

  // Users
  getUsers() {
    return getStored(STORAGE_KEYS.USERS, DEFAULT_USERS)
  },
  addUser(user) {
    const list = this.getUsers()
    const updated = [{ id: Date.now(), ...user }, ...list]
    setStored(STORAGE_KEYS.USERS, updated)
    return updated
  },
  toggleUser(id) {
    const list = this.getUsers()
    const updated = list.map((u) => (u.id === id ? { ...u, aktif: !u.aktif } : u))
    setStored(STORAGE_KEYS.USERS, updated)
    return updated
  },
}

