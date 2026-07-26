import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, ShieldAlert, CheckCircle, Info, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DebugCms() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cms_pages")
        .select("slug, content, updated_at");
      
      if (err) throw err;
      setDataList(data ?? []);
      setTime(new Date().toLocaleTimeString("id-ID"));
    } catch (e: any) {
      setError(e.message || "Gagal menghubungi Supabase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const pengaturan = dataList.find((d) => d.slug === "pengaturan");
  const beranda = dataList.find((d) => d.slug === "beranda");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-28 max-w-5xl space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Diagnostic Panel</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Verifikasi Database CMS End-to-End</h1>
          </div>
          <button 
            onClick={() => void fetchData()} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Status Koneksi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Database Engine</p>
              <p className="font-bold text-sm">Supabase PostgreSQL</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${error ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {error ? <ShieldAlert size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <p className="text-xs text-slate-400">Status Koneksi Browser</p>
              <p className="font-bold text-sm">{error ? "Error Terdeteksi" : "Terhubung Sukses"}</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
              <Info size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Waktu Penarikan Terakhir</p>
              <p className="font-bold text-sm">{time || "-"}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm leading-relaxed">
            <strong>Koneksi Gagal:</strong> {error}
          </div>
        )}

        {/* Penjelasan Kueri */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Info className="text-blue-400" size={18} />
            Kueri Database yang Berjalan (SQL Audit)
          </h2>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <p className="text-slate-400 mb-1">// Kueri SELECT yang digunakan oleh Website Publik (Navbar & Footer):</p>
              <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-blue-300 overflow-x-auto">
{`const { data } = await supabase
  .from("cms_pages")
  .select("slug, content")
  .in("slug", ["pengaturan", "beranda"]);`}
              </pre>
            </div>
            <div>
              <p className="text-slate-400 mb-1">// Kueri UPDATE yang digunakan oleh Admin Panel saat tombol Simpan ditekan:</p>
              <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-300 overflow-x-auto">
{`await supabase
  .from("cms_pages")
  .upsert({
    slug: "pengaturan",
    content: {
      umum: {
        namaSitus: "PT Samasta Nusantara Digdaya Jakarta",
        logoUrl: "https://...",
        copyrightText: "..."
      }
    }
  }, { onConflict: "slug" });`}
              </pre>
            </div>
          </div>
        </div>

        {/* Data Pengecekan Riil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Pengaturan */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-blue-400">Slug: "pengaturan"</h3>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">CMS Global</span>
            </div>
            {pengaturan ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">JSON Field Target:</p>
                  <code className="text-amber-300 text-xs">content.umum.namaSitus</code>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Nilai Nama Brand Terkini:</p>
                  <p className="font-semibold text-white bg-slate-900 px-3 py-1.5 rounded border border-slate-700 mt-1">
                    {pengaturan.content?.umum?.namaSitus || <em className="text-slate-500">Kosong / Tidak diset</em>}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Nilai Logo URL Terkini:</p>
                  {pengaturan.content?.umum?.logoUrl ? (
                    <div className="space-y-2 mt-1">
                      <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded truncate border border-slate-700 text-left">
                        {pengaturan.content.umum.logoUrl}
                      </p>
                      <div className="h-12 w-32 bg-slate-955 rounded flex items-center justify-center p-2 border border-slate-800">
                        <img src={pengaturan.content.umum.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 mt-1 italic text-xs">Belum ada logo terunggah</p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Raw JSON:</p>
                  <pre className="bg-slate-950 p-3 rounded text-xs overflow-x-auto text-slate-300 max-h-40 overflow-y-auto">
                    {JSON.stringify(pengaturan.content, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Record "pengaturan" tidak ditemukan di database. Pastikan Anda telah menekan 'Seed Data' atau menyimpan perubahan di Pengaturan.</p>
            )}
          </div>

          {/* Card Beranda */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-blue-400">Slug: "beranda"</h3>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">CMS Halaman</span>
            </div>
            {beranda ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">JSON Field Target:</p>
                  <code className="text-amber-300 text-xs">content.header.nav</code>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Menu Navigasi Dinamis Terkini:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 bg-slate-900 p-3 rounded border border-slate-700 text-xs">
                    {beranda.content?.header?.nav?.map((item: any) => (
                      <li key={item.id}>
                        <span className="font-bold text-white">{item.label}</span> &rarr; <span className="text-slate-400">{item.url}</span>
                      </li>
                    )) || <li className="text-slate-500">Kosong / Tidak diset</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Raw JSON:</p>
                  <pre className="bg-slate-950 p-3 rounded text-xs overflow-x-auto text-slate-300 max-h-40 overflow-y-auto">
                    {JSON.stringify(beranda.content, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Record "beranda" tidak ditemukan di database.</p>
            )}
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:underline text-sm font-semibold">
            <ArrowLeft size={16} />
            Kembali ke Beranda Publik
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
