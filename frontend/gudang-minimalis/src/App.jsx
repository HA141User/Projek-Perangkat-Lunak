import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import LoginPage from './pages/LoginPage'
import StaffDashboard from './pages/StaffDashboard'
import TransaksiMasuk from './pages/TransaksiMasuk'
import TransaksiKeluar from './pages/TransaksiKeluar'
import AuditOpname from './pages/AuditOpname'
import StaffBarang from './pages/StaffBarang'
import LaporanInventaris from './pages/LaporanInventaris'
import WarehouseDashboard from './pages/WarehouseDashboard'
import PersetujuanOpname from './pages/PersetujuanOpname'
import NotifikasiKepala from './pages/NotifikasiKepala'
import AdminDashboard from './pages/AdminDashboard'
import AdminPengguna from './pages/AdminPengguna'
import AdminBarang from './pages/AdminBarang'
import AdminRak from './pages/AdminRak'
import AdminLaporanOtomatis from './pages/AdminLaporanOtomatis'
import AdminLog from './pages/AdminLog'

function Placeholder({ title }) {
  return (
    <main className="min-h-screen bg-page p-8 text-ink">
      <p className="font-mono text-[9px] tracking-widest text-muted">DALAM PENGEMBANGAN</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-dark">Halaman ini sedang dibangun.</p>
    </main>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/masuk" element={<TransaksiMasuk />} />
          <Route path="/staff/keluar" element={<TransaksiKeluar />} />
          <Route path="/staff/opname" element={<AuditOpname />} />
          <Route path="/staff/barang" element={<StaffBarang />} />
          <Route path="/staff/riwayat" element={<LaporanInventaris />} />
          <Route path="/staff/*" element={<Placeholder title="Modul Staf Gudang" />} />

          {/* Kepala Gudang Routes */}
          <Route path="/kepala-gudang" element={<WarehouseDashboard />} />
          <Route path="/kepala-gudang/persetujuan" element={<PersetujuanOpname />} />
          <Route path="/kepala-gudang/laporan" element={<LaporanInventaris />} />
          <Route path="/kepala-gudang/notifikasi" element={<NotifikasiKepala />} />
          <Route path="/kepala-gudang/*" element={<Placeholder title="Modul Kepala Gudang" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pengguna" element={<AdminPengguna />} />
          <Route path="/admin/barang" element={<AdminBarang />} />
          <Route path="/admin/rak" element={<AdminRak />} />
          <Route path="/admin/persetujuan" element={<PersetujuanOpname />} />
          <Route path="/admin/laporan" element={<LaporanInventaris />} />
          <Route path="/admin/laporan-otomatis" element={<AdminLaporanOtomatis />} />
          <Route path="/admin/log" element={<AdminLog />} />
          <Route path="/admin/*" element={<Placeholder title="Modul Administrasi" />} />

          <Route path="*" element={<Placeholder title="Halaman Tidak Ditemukan (404)" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
