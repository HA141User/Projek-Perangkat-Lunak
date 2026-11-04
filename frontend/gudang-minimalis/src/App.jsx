import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

// Eager — always needed
import LoginPage from './pages/LoginPage'
import StaffDashboard from './pages/StaffDashboard'
import DataBarang from './pages/DataBarang'
import AuditOpname from './pages/AuditOpname'
import WarehouseDashboard from './pages/WarehouseDashboard'
import PersetujuanOpname from './pages/PersetujuanOpname'
import NotificationSettings from './pages/NotificationSettings'
import LaporanInventaris from './pages/LaporanInventaris'
import AdminDashboard from './pages/AdminDashboard'

// Lazy — loaded on demand
const TransaksiMasuk       = lazy(() => import('./pages/TransaksiMasuk'))
const TransaksiKeluar      = lazy(() => import('./pages/TransaksiKeluar'))
const AuditOpname          = lazy(() => import('./pages/AuditOpname'))
const StaffBarang          = lazy(() => import('./pages/StaffBarang'))
const PersetujuanOpname    = lazy(() => import('./pages/PersetujuanOpname'))
const LaporanInventaris    = lazy(() => import('./pages/LaporanInventaris'))
const NotifikasiKepala     = lazy(() => import('./pages/NotifikasiKepala'))
const AdminPengguna        = lazy(() => import('./pages/AdminPengguna'))
const AdminBarang          = lazy(() => import('./pages/AdminBarang'))
const AdminRak             = lazy(() => import('./pages/AdminRak'))
const AdminLaporanOtomatis = lazy(() => import('./pages/AdminLaporanOtomatis'))
const AdminLog             = lazy(() => import('./pages/AdminLog'))

function Placeholder({ title }) {
  return (
    <main className="min-h-screen bg-page p-8 text-ink">
      <p className="font-mono text-[9px] tracking-widest text-muted">DALAM PENGEMBANGAN</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-dark">Halaman ini sedang dibangun.</p>
    </main>
  )
}

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <span className="inline-block size-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  )
}

function SafeLazy({ component: Component }) {
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/masuk"   element={<SafeLazy component={TransaksiMasuk} />} />
        <Route path="/staff/keluar"  element={<SafeLazy component={TransaksiKeluar} />} />
        <Route path="/staff/opname"  element={<SafeLazy component={AuditOpname} />} />
        <Route path="/staff/barang"  element={<SafeLazy component={StaffBarang} />} />
        <Route path="/staff/riwayat" element={<SafeLazy component={LaporanInventaris} />} />
        <Route path="/staff/*"       element={<Placeholder title="Modul Staf Gudang" />} />

        {/* Kepala Gudang Routes */}
        <Route path="/kepala-gudang" element={<WarehouseDashboard />} />
        <Route path="/kepala-gudang/persetujuan" element={<SafeLazy component={PersetujuanOpname} />} />
        <Route path="/kepala-gudang/laporan"     element={<SafeLazy component={LaporanInventaris} />} />
        <Route path="/kepala-gudang/notifikasi"  element={<SafeLazy component={NotifikasiKepala} />} />
        <Route path="/kepala-gudang/*"           element={<Placeholder title="Modul Kepala Gudang" />} />

        {/* Admin Routes */}
        <Route path="/staff/barang" element={<DataBarang />} />
        <Route path="/staff/opname" element={<AuditOpname />} />
        <Route path="/kepala-gudang" element={<WarehouseDashboard />} />
        <Route path="/kepala-gudang/persetujuan" element={<PersetujuanOpname />} />
        <Route path="/kepala-gudang/notifikasi" element={<NotificationSettings />} />
        <Route path="/kepala-gudang/laporan" element={<LaporanInventaris />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pengguna"        element={<SafeLazy component={AdminPengguna} />} />
        <Route path="/admin/barang"          element={<SafeLazy component={AdminBarang} />} />
        <Route path="/admin/rak"             element={<SafeLazy component={AdminRak} />} />
        <Route path="/admin/persetujuan"     element={<SafeLazy component={PersetujuanOpname} />} />
        <Route path="/admin/laporan"         element={<SafeLazy component={LaporanInventaris} />} />
        <Route path="/admin/laporan-otomatis" element={<SafeLazy component={AdminLaporanOtomatis} />} />
        <Route path="/admin/log"             element={<SafeLazy component={AdminLog} />} />
        <Route path="/admin/*"               element={<Placeholder title="Modul Administrasi" />} />

        <Route path="*" element={<Placeholder title="Halaman Tidak Ditemukan (404)" />} />
      </Routes>
    </BrowserRouter>
  )
}
