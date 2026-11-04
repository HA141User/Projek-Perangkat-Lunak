
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import KepalaGudangHeader from '../components/KepalaGudangHeader'
import { KEPALA_MENU } from '../data/kepalaGudang'

import logoutIcon from '../assets/kepala-gudang/logout.svg'
import breadcrumbChevronIcon from '../assets/kepala-gudang/breadcrumb-chevron.svg'
import prefBellIcon from '../assets/kepala-gudang/pref-bell.svg'
import mailIcon from '../assets/kepala-gudang/mail.svg'
import atIcon from '../assets/kepala-gudang/at.svg'
import chatIcon from '../assets/kepala-gudang/chat.svg'
import phoneIcon from '../assets/kepala-gudang/phone.svg'
import infoIcon from '../assets/staff/info.svg'
import checkSmallIcon from '../assets/staff/check-small.svg'

const INITIAL_PREFERENCES = {
  inApp: true,
  email: true,
  emailAddress: 'kepalagudang@perusahaan.com',
  whatsapp: false,
  whatsappNumber: '+62 812-4980-2210',
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition focus-visible:ring-2 focus-visible:ring-brand ${
        checked ? 'justify-end bg-brand-hover' : 'justify-start bg-[#C4C5D7]'
      }`}
    >
      <span className="size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />
    </button>
  )
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES)
  const [saved, setSaved] = useState(false)

  function update(patch) {
    setPreferences((current) => ({ ...current, ...patch }))
    setSaved(false)
  }

  function handleReset() {
    setPreferences(INITIAL_PREFERENCES)
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9FF] max-md:flex-col">
      <Sidebar
        items={KEPALA_MENU}
        wide
        activeStyle="solid"
        logoutIcon={logoutIcon}
        logoutLabel="Keluar"
        logoutShortcut="Esc"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <KepalaGudangHeader />

        <form onSubmit={handleSave}>
          <main className="mx-auto grid w-full max-w-[1152px] grid-cols-12 gap-x-8 gap-y-8 px-8 pb-16 pt-6">
            {/* Kolom kiri: pengaturan saluran (8 kolom) */}
            <div className="col-span-12 self-start lg:col-span-8">
              {/* Breadcrumb */}
              <p className="flex items-center gap-1 font-mono text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                SISTEM
                <img src={breadcrumbChevronIcon} alt="" className="h-[7px] w-auto" />
                <span className="text-brand">PREFERENSI NOTIFIKASI</span>
              </p>

              {/* Judul & chip tersimpan */}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold leading-8 tracking-[-0.6px] text-ink">
                  Pengaturan Notifikasi
                </h2>
                <span className="flex items-center gap-1.5 rounded bg-field px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-brand">
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                  Tersimpan Otomatis
                </span>
              </div>
              <p className="mt-1 text-sm leading-5 text-muted-dark">
                Pilih saluran distribusi dan jenis peringatan operasional inventaris yang ingin diterima.
              </p>

              {/* Section: Saluran Notifikasi */}
              <div className="mt-8 flex flex-col gap-3">
                <div className="pb-1">
                  <h3 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                    Saluran Notifikasi
                  </h3>
                  <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                    Tentukan rute penerimaan dispatch pesan real-time dan ringkasan terjadwal.
                  </p>
                </div>

                {/* Channel 1: Aplikasi (In-App) */}
                <div className="rounded-lg bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-field">
                        <img src={prefBellIcon} alt="" className="h-[16.667px] w-auto" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="flex flex-wrap items-center gap-1">
                          <span className="text-[13px] font-semibold leading-[18px] tracking-[0.13px] text-ink">
                            Aplikasi (In-App)
                          </span>
                          <span className="rounded bg-field px-1.5 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-brand">
                            REALTIME
                          </span>
                        </p>
                        <p className="text-sm leading-5 text-muted-dark">
                          Notifikasi real-time di bilah header dan pusat drawer aplikasi gudang.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={preferences.inApp}
                      onChange={() => update({ inApp: !preferences.inApp })}
                      label="Aktifkan notifikasi In-App"
                    />
                  </div>
                </div>

                {/* Channel 2: Email */}
                <div className="rounded-lg bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-field">
                        <img src={mailIcon} alt="" className="h-[13.333px] w-auto" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="flex flex-wrap items-center gap-1">
                          <span className="text-[13px] font-semibold leading-[18px] tracking-[0.13px] text-ink">
                            Email
                          </span>
                          <span className="rounded bg-field px-1.5 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-green">
                            Terverifikasi
                          </span>
                        </p>
                        <p className="text-sm leading-5 text-muted-dark">
                          Kirim ringkasan berkala dan peringatan operasional mendesak ke alamat email terdaftar.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={preferences.email}
                      onChange={() => update({ email: !preferences.email })}
                      label="Aktifkan notifikasi Email"
                    />
                  </div>

                  <div className="flex flex-col gap-1 pl-14 pt-3 max-sm:pl-0">
                    <div className="relative w-full max-w-[512px]">
                      <label htmlFor="email-address" className="sr-only">
                        Alamat email notifikasi
                      </label>
                      <input
                        id="email-address"
                        type="email"
                        value={preferences.emailAddress}
                        onChange={(event) => update({ emailAddress: event.target.value })}
                        className="w-full rounded bg-field py-2 pl-10 pr-3 font-mono text-[13px] leading-[18px] tracking-[0.13px] text-ink outline-none focus:ring-1 focus:ring-brand"
                      />
                      <img
                        src={atIcon}
                        alt=""
                        className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2"
                      />
                    </div>
                    <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                      Pemberitahuan resmi dikirim menggunakan server relay internal{' '}
                      <span className="font-mono text-[11px] tracking-[0.44px]">smtp.internal.logistics</span>.
                    </p>
                  </div>
                </div>

                {/* Channel 3: WhatsApp Gateway */}
                <div className="rounded-lg bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-field">
                        <img src={chatIcon} alt="" className="size-[16.667px]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="flex flex-wrap items-center gap-1">
                          <span className="text-[13px] font-semibold leading-[18px] tracking-[0.13px] text-ink">
                            WhatsApp Gateway
                          </span>
                          <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] ${
                            preferences.whatsapp ? 'bg-field text-brand' : 'bg-field text-muted-dark'
                          }`}>
                            {preferences.whatsapp ? 'REALTIME' : 'OFFLINE'}
                          </span>
                        </p>
                        <p className="text-sm leading-5 text-muted-dark">
                          Notifikasi instan via pesan WhatsApp webhook untuk peringatan eskalasi darurat.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={preferences.whatsapp}
                      onChange={() => update({ whatsapp: !preferences.whatsapp })}
                      label="Aktifkan notifikasi WhatsApp"
                    />
                  </div>

                  <div className="flex flex-col gap-1 pl-14 pt-3 max-sm:pl-0">
                    <div className="relative w-full max-w-[512px]">
                      <label htmlFor="whatsapp-number" className="sr-only">
                        Nomor WhatsApp
                      </label>
                      <input
                        id="whatsapp-number"
                        type="tel"
                        value={preferences.whatsappNumber}
                        onChange={(event) => update({ whatsappNumber: event.target.value })}
                        disabled={!preferences.whatsapp}
                        className={`w-full rounded bg-field py-2 pl-10 pr-3 font-mono text-[13px] leading-[18px] tracking-[0.13px] text-ink outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                      <img
                        src={phoneIcon}
                        alt=""
                        className="pointer-events-none absolute left-3 top-1/2 size-[13.5px] -translate-y-1/2"
                      />
                    </div>
                    <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                      Memerlukan otentikasi token bot WhatsApp API melalui pusat integrasi IT.
                    </p>
                  </div>
                </div>
              </div>

              {saved && (
                <p
                  role="status"
                  className="mt-4 rounded border border-[rgba(107,216,203,0.4)] bg-[rgba(137,245,231,0.2)] px-4 py-2 text-xs leading-4 text-green"
                >
                  Preferensi tersimpan (simulasi — belum terhubung ke backend).
                </p>
              )}

              {/* Action bar */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <img src={infoIcon} alt="" className="size-[16.667px] shrink-0" />
                  <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                    Perubahan preferensi ini berlaku mengikat untuk profil akun{' '}
                    <strong className="font-semibold">Kepala Gudang</strong> (WH-01).
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded bg-field px-3 py-2 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none transition hover:bg-chip focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Batal / Reset
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded bg-brand-hover px-5 py-2 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <img src={checkSmallIcon} alt="" className="h-[9px] w-auto" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </main>
        </form>
      </div>
    </div>
  )
}
