import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6FA] p-6 text-center">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-semibold text-[#111827]">
              Terjadi Kesalahan Memuat Halaman
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Halaman mengalami kendala saat dimuat. Hal ini biasanya terjadi jika modul belum selesai dikompilasi atau koneksi terputus.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-left font-mono text-xs text-red-700">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0037B0] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
            >
              <RotateCcw size={16} />
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

