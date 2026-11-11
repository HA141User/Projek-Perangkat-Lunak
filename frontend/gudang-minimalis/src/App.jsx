import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import { getAuth } from './lib/auth'

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

const HOME_BY_ROLE = {
  ADMIN: '/admin',
  KEPALA_GUDANG: '/kepala-gudang',
  STAF_GUDANG: '/staff',
}

function RequireRole({ allowed, children }) {
  const { token, user } = getAuth()
  if (!token || !user?.role) {
    return <Navigate to="/login" replace />
  }
  if (!allowed.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />
  }
  return children
}

function RootRedirect() {
  const { token, user } = getAuth()
  if (token && user?.role && HOME_BY_ROLE[user.role]) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  }
  return <Navigate to="/login" replace />
}

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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Staff Routes */}
          <Route path="/staff" element={<RequireRole allowed={['STAF_GUDANG']}><StaffDashboard /></RequireRole>} />
          <Route path="/staff/masuk" element={<RequireRole allowed={['STAF_GUDANG']}><TransaksiMasuk /></RequireRole>} />
          <Route path="/staff/keluar" element={<RequireRole allowed={['STAF_GUDANG']}><TransaksiKeluar /></RequireRole>} />
          <Route path="/staff/opname" element={<RequireRole allowed={['STAF_GUDANG']}><AuditOpname /></RequireRole>} />
          <Route path="/staff/barang" element={<RequireRole allowed={['STAF_GUDANG']}><StaffBarang /></RequireRole>} />
          <Route path="/staff/riwayat" element={<RequireRole allowed={['STAF_GUDANG']}><LaporanInventaris /></RequireRole>} />
          <Route path="/staff/*" element={<RequireRole allowed={['STAF_GUDANG']}><Placeholder title="Modul Staf Gudang" /></RequireRole>} />

          {/* Kepala Gudang Routes */}
          <Route path="/kepala-gudang" element={<RequireRole allowed={['KEPALA_GUDANG']}><WarehouseDashboard /></RequireRole>} />
          <Route path="/kepala-gudang/persetujuan" element={<RequireRole allowed={['KEPALA_GUDANG']}><PersetujuanOpname /></RequireRole>} />
          <Route path="/kepala-gudang/laporan" element={<RequireRole allowed={['KEPALA_GUDANG']}><LaporanInventaris /></RequireRole>} />
          <Route path="/kepala-gudang/notifikasi" element={<RequireRole allowed={['KEPALA_GUDANG']}><NotifikasiKepala /></RequireRole>} />
          <Route path="/kepala-gudang/*" element={<RequireRole allowed={['KEPALA_GUDANG']}><Placeholder title="Modul Kepala Gudang" /></RequireRole>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireRole allowed={['ADMIN']}><AdminDashboard /></RequireRole>} />
          <Route path="/admin/pengguna" element={<RequireRole allowed={['ADMIN']}><AdminPengguna /></RequireRole>} />
          <Route path="/admin/barang" element={<RequireRole allowed={['ADMIN']}><AdminBarang /></RequireRole>} />
          <Route path="/admin/rak" element={<RequireRole allowed={['ADMIN']}><AdminRak /></RequireRole>} />
          <Route path="/admin/persetujuan" element={<RequireRole allowed={['ADMIN', 'KEPALA_GUDANG']}><PersetujuanOpname /></RequireRole>} />
          <Route path="/admin/laporan" element={<RequireRole allowed={['ADMIN']}><LaporanInventaris /></RequireRole>} />
          <Route path="/admin/laporan-otomatis" element={<RequireRole allowed={['ADMIN']}><AdminLaporanOtomatis /></RequireRole>} />
          <Route path="/admin/log" element={<RequireRole allowed={['ADMIN']}><AdminLog /></RequireRole>} />
          <Route path="/admin/*" element={<RequireRole allowed={['ADMIN']}><Placeholder title="Modul Administrasi" /></RequireRole>} />

          <Route path="*" element={<Placeholder title="Halaman Tidak Ditemukan (404)" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
