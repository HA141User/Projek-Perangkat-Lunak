import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PackagePlus, Search, Filter, Edit2, Trash2, Package } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

const MENU_ADMIN = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log Aktivitas', to: '/admin/log' },
]

const INITIAL_BARANG = [
  { id: 1, sku: 'BRG-ELK-001', nama: 'Kabel UTP Cat6 305m', kategori: 'Elektronik', rak: 'RAK A-01', satuan: 'Roll', stok: 18, minStok: 5, status: 'Aman' },
  { id: 2, sku: 'BRG-ELK-002', nama: 'Switch Hub 16-Port Gigabit', kategori: 'Elektronik', rak: 'RAK A-02', satuan: 'Unit', stok: 3, minStok: 5, status: 'Kritis' },
  { id: 3, sku: 'BRG-LOG-003', nama: 'Kardus Double Wall A3', kategori: 'Logistik', rak: 'RAK B-01', satuan: 'Pcs', stok: 120, minStok: 50, status: 'Aman' },
  { id: 4, sku: 'BRG-LOG-004', nama: 'Lakban Bening Heavy Duty', kategori: 'Logistik', rak: 'RAK B-02', satuan: 'Roll', stok: 4, minStok: 10, status: 'Kritis' },
  { id: 5, sku: 'BRG-ATK-005', nama: 'Kertas Thermal Stiker 100x150', kategori: 'ATK', rak: 'RAK C-01', satuan: 'Roll', stok: 45, minStok: 15, status: 'Aman' },
  { id: 6, sku: 'BRG-ATK-006', nama: 'Barcode Scanner Handheld 2D', kategori: 'ATK', rak: 'RAK C-02', satuan: 'Unit', stok: 0, minStok: 2, status: 'Habis' },
  { id: 7, sku: 'BRG-SAF-007', nama: 'Rompi Keselamatan High-Vis', kategori: 'Safety', rak: 'RAK D-01', satuan: 'Pcs', stok: 22, minStok: 10, status: 'Aman' },
  { id: 8, sku: 'BRG-SAF-008', nama: 'Sarung Tangan Karet Grip', kategori: 'Safety', rak: 'RAK D-02', satuan: 'Pasang', stok: 2, minStok: 12, status: 'Kritis' },
]

export default function AdminBarang() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [items, setItems] = useState(INITIAL_BARANG)
  const [search, setSearch] = useState('')
  const [selectedKategori, setSelectedKategori] = useState('Semua')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    sku: '',
    nama: '',
    kategori: 'Elektronik',
    rak: 'RAK A-01',
    satuan: 'Pcs',
    stok: 0,
    minStok: 5,
  })

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.rak.toLowerCase().includes(search.toLowerCase())
    const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori
    return matchSearch && matchKategori
  })

  function handleOpenCreate() {
    setEditingItem(null)
    setFormData({
      sku: `BRG-${Date.now().toString().slice(-4)}`,
      nama: '',
      kategori: 'Elektronik',
      rak: 'RAK A-01',
      satuan: 'Pcs',
      stok: 10,
      minStok: 5,
    })
    setIsModalOpen(true)
  }

  function handleOpenEdit(item) {
    setEditingItem(item)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  function handleDelete(id) {
    if (confirm('Yakin ingin menghapus master data barang ini?')) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const status = Number(formData.stok) === 0 ? 'Habis' : Number(formData.stok) <= Number(formData.minStok) ? 'Kritis' : 'Aman'
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...formData, stok: Number(formData.stok), minStok: Number(formData.minStok), status } : i))
      )
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        stok: Number(formData.stok),
        minStok: Number(formData.minStok),
        status,
      }
      setItems((prev) => [newItem, ...prev])
    }
    setIsModalOpen(false)
  }

  function statusVariant(status) {
    if (status === 'Aman') return 'success'
    if (status === 'Kritis') return 'warning'
    return 'danger'
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Data Barang"
      actions={
        <Btn variant="primary" size="lg" icon={PackagePlus} onClick={handleOpenCreate}>
          Tambah Barang
        </Btn>
      }
    >
      {/* Search + Filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex h-9 flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 transition-colors">
          <Search size={15} className="shrink-0 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Cari SKU, nama barang, rak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>

        <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] focus-within:border-[#1D4ED8] transition-colors">
          <Filter size={14} className="shrink-0 text-[#6B7280]" />
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-transparent text-[13.5px] text-[#111827] outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Logistik">Logistik</option>
            <option value="ATK">ATK</option>
            <option value="Safety">Safety</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader title={`${filteredItems.length} item ditemukan`} description="Kelola daftar seluruh barang gudang, ambang batas minimum, dan alokasi rak." />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">SKU</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Nama Barang</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kategori</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Stok</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-[#0037B0]">{item.sku}</td>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-[#111827]">{item.nama}</td>
                  <td className="px-4 py-3 text-[13.5px] text-[#6B7280]">{item.kategori}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-[#374151]">{item.rak}</td>
                  <td className={`px-4 py-3 text-right font-mono text-[13.5px] font-semibold ${item.status !== 'Aman' ? 'text-red-600' : 'text-[#111827]'}`}>
                    {item.stok} <span className="text-[12px] font-normal text-[#6B7280]">{item.satuan}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariant(item.status)} dot>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <Btn variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEdit(item)} />
                      <Btn variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(item.id)} />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada barang yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah / Edit Barang */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Master Barang' : 'Tambah Barang / SKU Baru'}
        subtitle="Lengkapi data informasi inventaris"
        icon={Package}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Btn>
            <Btn variant="primary" onClick={handleSubmit}>
              {editingItem ? 'Simpan Perubahan' : 'Daftarkan Barang'}
            </Btn>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Kode SKU / Barcode" required>
              <Input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </Field>

            <Field label="Nama Barang" required>
              <Input
                type="text"
                required
                placeholder="Contoh: Kabel UTP Cat6 305m"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Kategori">
                <Select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Logistik">Logistik</option>
                  <option value="ATK">ATK</option>
                  <option value="Safety">Safety</option>
                </Select>
              </Field>
              <Field label="Satuan" required>
                <Input
                  type="text"
                  required
                  placeholder="Pcs / Dus / Roll / Unit"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Alokasi Rak">
                <Select
                  value={formData.rak}
                  onChange={(e) => setFormData({ ...formData, rak: e.target.value })}
                >
                  <option value="RAK A-01">RAK A-01</option>
                  <option value="RAK A-02">RAK A-02</option>
                  <option value="RAK B-01">RAK B-01</option>
                  <option value="RAK B-02">RAK B-02</option>
                  <option value="RAK C-01">RAK C-01</option>
                  <option value="RAK D-01">RAK D-01</option>
                </Select>
              </Field>
              <Field label="Batas Minimum Stok" required>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.minStok}
                  onChange={(e) => setFormData({ ...formData, minStok: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Stok Awal" required>
              <Input
                type="number"
                min="0"
                required
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
