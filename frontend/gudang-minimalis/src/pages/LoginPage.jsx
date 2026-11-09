import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Archive,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Lock,
  AlertCircle,
} from "lucide-react";
import { API } from "../lib/auth";

const ROLE_ROUTES = {
  ADMIN: "/admin",
  KEPALA_GUDANG: "/kepala-gudang",
  STAF_GUDANG: "/staff",
};

function normalizeRole(rawRole, fallbackRole = "STAF_GUDANG") {
  const r = String(rawRole || "")
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("KEPALA")) return "KEPALA_GUDANG";
  if (r.includes("STAF") || r.includes("STAFF")) return "STAF_GUDANG";
  return ROLE_ROUTES[fallbackRole] ? fallbackRole : "STAF_GUDANG";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("AUTO");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const userStr =
      localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role && ROLE_ROUTES[user.role]) {
          navigate(ROLE_ROUTES[user.role], { replace: true });
        }
      } catch {
        /* ignore */
      }
    }
  }, [navigate]);

  function handleLoginSuccess(userObj, token) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("auth_token", token);
    storage.setItem("auth_user", JSON.stringify(userObj));
    navigate(ROLE_ROUTES[userObj.role] || "/staff", { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          payload.message ||
          payload.error ||
          "Email atau kata sandi tidak valid.",
        );
      }

      const root = payload.data || payload;
      const token =
        root.token || root.access_token || root.accessToken || payload.token;
      if (!token) {
        throw new Error(
          "Token autentikasi tidak ditemukan dari respons server.",
        );
      }

      let apiUser = root.user || payload.user || null;

      if (!apiUser) {
        try {
          const meRes = await fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            apiUser = meData.data || meData.user || meData;
          }
        } catch {
          /* ignore */
        }
      }

      const resolvedRole =
        selectedRole !== "AUTO"
          ? selectedRole
          : normalizeRole(apiUser?.role || apiUser?.peran, "STAF_GUDANG");

      handleLoginSuccess(
        {
          id: apiUser?.id || apiUser?.id_user,
          name:
            apiUser?.nama_lengkap ||
            apiUser?.nama ||
            apiUser?.name ||
            normalizedEmail.split("@")[0],
          email: apiUser?.email || normalizedEmail,
          role: resolvedRole,
        },
        token,
      );
    } catch (err) {
      setErrorMsg(
        err.message ||
        "Gagal terhubung ke server backend. Pastikan koneksi aktif.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Left panel */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-[#0037B0] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-white/15 text-white">
            <Archive size={18} />
          </div>
          <span className="text-[15px] font-semibold text-white">
            Gudang Minimalis
          </span>
        </div>

        <div>
          <h1 className="text-[32px] font-semibold leading-tight text-white">
            Sistem Manajemen
            <br />
            Inventaris Gudang
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-blue-200">
            Platform terintegrasi untuk pengelolaan stok, audit opname, dan
            pelaporan inventaris gudang secara real-time.
          </p>
        </div>

        <p className="text-[12px] text-blue-300">
          © 2025 Gudang Minimalis · Ver 2.4.0
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-lg bg-[#0037B0] text-white">
              <Archive size={18} />
            </div>
            <span className="text-[15px] font-semibold text-[#111827]">
              Gudang Minimalis
            </span>
          </div>

          <h2 className="text-[24px] font-semibold text-[#111827]">
            Masuk ke Akun
          </h2>
          <p className="mt-1.5 text-[14px] text-[#6B7280]">
            Masukkan email resmi dan kata sandi akun Anda.
          </p>

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-[13.5px] font-medium text-[#111827]"
              >
                Email Resmi
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/15">
                <User size={15} className="shrink-0 text-[#9CA3AF]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="nama@inventaris.test"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-[13.5px] font-medium text-[#111827]"
              >
                Kata Sandi
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/15">
                <Lock size={15} className="shrink-0 text-[#9CA3AF]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="shrink-0 text-[#9CA3AF] hover:text-[#6B7280]"
                  aria-label={
                    showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                  }
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role select */}
            {/* <div>
              <label
                htmlFor="login-role"
                className="mb-1.5 block text-[13.5px] font-medium text-[#111827]"
              >
                Masuk sebagai
              </label>
              <select
                id="login-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[14px] text-[#111827] transition-colors focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/15"
              >
                <option value="AUTO">Otomatis (deteksi dari akun)</option>
                <option value="ADMIN">Administrator Sistem</option>
                <option value="KEPALA_GUDANG">Kepala Gudang</option>
                <option value="STAF_GUDANG">Staf Gudang</option>
              </select>
            </div> */}

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded accent-[#0037B0]"
                />
                <span className="text-[13.5px] text-[#374151]">Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  alert("Hubungi Administrator IT: admin@gudangwh01.com")
                }
                className="text-[13.5px] font-medium text-[#0037B0] hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0037B0] text-[14px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memverifikasi…
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-[#6B7280]">
            Sistem Logistik Sentral WH-01 · Seluruh hak cipta dilindungi
          </p>
        </div>
      </div>
    </div>
  );
}
