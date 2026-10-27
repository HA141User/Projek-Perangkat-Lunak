
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router'

import LoginPage from './pages/LoginPage'
import StaffDashboard from './pages/StaffDashboard'
import WarehouseDashboard from './pages/WarehouseDashboard'
import AdminDashboard from './pages/AdminDashboard'

function Placeholder({ title }) {
  return (
    <main className="min-h-screen bg-page p-8 text-ink">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        Halaman ini akan dibuat pada tahap berikutnya.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/kepala-gudang" element={<WarehouseDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Halaman modul yang belum dibuat */}
        <Route
          path="/staff/*"
          element={<Placeholder title="Modul Staf Gudang" />}
        />
        <Route
          path="/kepala-gudang/*"
          element={<Placeholder title="Modul Kepala Gudang" />}
        />
        <Route
          path="/admin/*"
          element={<Placeholder title="Modul Administrasi" />}
        />

        <Route
          path="*"
          element={<Placeholder title="Halaman Tidak Ditemukan" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
