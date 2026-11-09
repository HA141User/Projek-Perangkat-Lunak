import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../lib/auth";

import logoutIcon from "../assets/staff/logout.svg";
import searchIcon from "../assets/staff/search.svg";
import searchButtonIcon from "../assets/staff/search-btn.svg";

const menu = [
  { label: "Beranda", to: "/staff" },
  { label: "Data Barang", to: "/staff/barang" },
  { label: "Audit Opname", to: "/staff/opname" },
];

export default function DataBarang() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // STATE BARU UNTUK API
  const [racks, setRacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const searchInputRef = useRef(null);

  // Pintasan ⌘K / Ctrl+K
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // MENGAMBIL DATA DARI BACKEND API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await apiFetch("/api/items/");

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil data dari server (mungkin CORS terblokir).",
          );
        }

        const data = await response.json();

        const formattedData = (data.data || []).map((item, idx) => ({
          id: item.id_barang || item.id || String(idx + 1),
          rack: item.lokasi_nama || "RAK DEFAULT",
          zone: item.kategori_nama || "ZONA UMUM",
          aisle: "Gudang Utama",
          sku: `${item.kode_barang || "SKU"} - ${item.nama_barang || "Barang API"}`,
          detail: item.deskripsi || "Detail otomatis dari server",
          stock: item.stok_saat_ini || 0,
          unit: "Pcs",
          status:
            item.stok_saat_ini > (item.batas_stok_minimum || 5)
              ? "Siap Alokasi"
              : "Stok Kritis",
        }));

        setRacks(formattedData);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const results = useMemo(() => {
    const q = appliedQuery?.trim().toLowerCase();
    if (!q) return racks;

    return racks.filter((item) =>
      [item.rack, item.zone, item.aisle, item.sku, item.detail]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [appliedQuery, racks]);

  function handleSearch(event) {
    event?.preventDefault();
    setAppliedQuery(query);
  }

  return (
    <div className="flex min-h-screen bg-white max-md:flex-col">
      <Sidebar items={menu} wide logoutIcon={logoutIcon} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/90 px-8 backdrop-blur-md">
          <h1 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
            Halo, Staf Gudang
          </h1>
        </header>

        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 pb-16 pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex items-center gap-1.5 rounded-sm bg-[#E1E8FD] px-2 py-0.5 text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                <span
                  className="size-1.5 rounded-full bg-[#0051D5]"
                  aria-hidden="true"
                />
                Mode Terhubung API
              </span>
              <span className="text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted">
                LIVE SERVER
              </span>
            </div>
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.6px] text-ink">
              Pencarian &amp; Data Barang
            </h2>
            <p className="text-sm leading-5 text-muted-dark">
              Data barang dan rak diambil langsung dari database PostgreSQL
              backend.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-sm:flex-col max-sm:items-stretch"
          >
            <div className="relative min-w-0 flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari SKU, Rak, atau Nama Barang..."
                autoComplete="off"
                className="w-full rounded bg-field py-3 pl-11 pr-16 text-sm leading-5 text-ink outline-none focus:ring-1 focus:ring-brand"
              />
              <img
                src={searchIcon}
                alt=""
                className="pointer-events-none absolute left-[14.5px] top-[14.5px] size-[15px]"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[11px] text-muted">
                ⌘K
              </kbd>
            </div>
            <button
              type="submit"
              className="flex shrink-0 items-center justify-center gap-1 rounded bg-brand-hover px-8 py-3 text-[13px] font-medium text-white hover:bg-brand"
            >
              <img
                src={searchButtonIcon}
                alt=""
                className="h-[9.75px] w-auto"
              />
              Cari Data
            </button>
          </form>

          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <strong>Error API: </strong> {errorMsg} <br /> (Pastikan CORS
              sudah diizinkan oleh tim backend)
            </div>
          )}

          <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="overflow-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-field text-[11px] font-semibold uppercase tracking-[0.55px] text-muted">
                    <th className="px-5 py-3">LOKASI RAK</th>
                    <th className="px-5 py-3">SKU &amp; NAMA BARANG</th>
                    <th className="px-5 py-3 text-right">STOK SISTEM</th>
                    <th className="px-5 py-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-muted"
                      >
                        Mengambil data dari server backend...
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-muted"
                      >
                        Tidak ada barang yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    results.map((item) => {
                      const isSelected = item.id === selectedId;
                      return (
                        <tr
                          key={item.id}
                          className={`border-t border-field transition ${isSelected ? "bg-[rgba(241,243,255,0.5)]" : ""}`}
                        >
                          <td className="px-5 py-6">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-ink">
                                {item.rack}
                              </span>
                              <span className="rounded-sm bg-[#DCE2F7] px-1 py-0.5 text-[11px] font-semibold uppercase text-muted-dark">
                                {item.zone}
                              </span>
                            </div>
                            <p className="mt-0.5 font-mono text-xs text-muted">
                              {item.aisle}
                            </p>
                          </td>
                          <td className="px-5 py-6">
                            <p className="text-[13px] font-semibold text-ink">
                              {item.sku}
                            </p>
                            <p className="text-xs text-muted-dark">
                              {item.detail}
                            </p>
                          </td>
                          <td className="px-5 py-6 text-right">
                            <div className="flex items-baseline justify-end gap-1.5">
                              <span className="font-mono text-base font-medium text-ink">
                                {item.stock}
                              </span>
                              <span className="text-xs text-muted">
                                {item.unit}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-semibold text-green">
                              {item.status}
                            </p>
                          </td>
                          <td className="px-5 py-6 align-middle text-center">
                            <button
                              onClick={() => setSelectedId(item.id)}
                              className={`flex w-full items-center justify-center gap-1 rounded-sm px-3 py-2 text-[13px] font-medium transition ${
                                isSelected
                                  ? "bg-brand-hover text-white"
                                  : "bg-[#E1E8FD] text-ink hover:bg-chip"
                              }`}
                            >
                              <span>Pilih</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
