import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Layanan from "./pages/Layanan";
import Portofolio from "./pages/Portofolio";
import Berita from "./pages/Berita";
import Kontak from "./pages/Kontak";
import AjukanPenawaran from "./components/layanan/AjukanPenawaran";
import NotFound from "./pages/NotFound";
import DebugCms from "./pages/DebugCms";

// Admin Dashboard Components
import { LoginPage } from "./components/admin/Login";
import { AdminLayout } from "./components/admin/AdminLayout";
import { DashboardHome } from "./components/admin/DashboardHome";
import { BerandaPage } from "./components/admin/beranda/BerandaPage";
import { BeritaPage } from "./components/admin/berita/BeritaPage";
import { KontakPage } from "./components/admin/kontak/KontakPage";
import { SejarahPage } from "./components/admin/sejarah/SejarahPage";
import { KeunggulanPage } from "./components/admin/keunggulan/KeunggulanPage";
import { LegalitasPage } from "./components/admin/legalitas/LegalitasPage";
import { StrukturPage } from "./components/admin/struktur/StrukturPage";
import { TentangKamiPage } from "./components/admin/tentang-kami/TentangKamiPage";
import { LayananPage } from "./components/admin/layanan/LayananPage";
import { LayananSubPage, type SubMeta } from "./components/admin/layanan/LayananSubPage";
import { PortofolioPage } from "./components/admin/portofolio/PortofolioPage";
import { PengajuanJasaPage } from "./components/admin/pengajuan-jasa/PengajuanJasaPage";
import { PenggunaPage } from "./components/admin/pengguna/PenggunaPage";
import { PengaturanPage } from "./components/admin/pengaturan/PengaturanPage";
import { KalenderPage } from "./components/admin/kalender/KalenderPage";
import { PagePlaceholder } from "./components/admin/PagePlaceholder";

const queryClient = new QueryClient();

const LAYANAN_SUBS: Record<string, SubMeta> = {
  "pemeliharaan": { slug: "pemeliharaan", nama: "Pemeliharaan, Perawatan, dan Pembuatan Lingkungan", warnaHero: "#16a34a" },
  "jasa-profesional": { slug: "jasa-profesional", nama: "Jasa Profesional & Pengembangan SDM", warnaHero: "#2563eb" },
  "perdagangan": { slug: "perdagangan", nama: "Pengolahan dan Perdagangan Besar", warnaHero: "#ea580c" },
  "event-organizer": { slug: "event-organizer", nama: "Event Organizer, Kreatif & Media", warnaHero: "#c026d3" },
};

function LayananSubPageWrapper() {
  const { sub } = useParams<{ sub: string }>();
  const meta = sub ? LAYANAN_SUBS[sub] : undefined;
  if (!meta) return <div className="p-8 text-center text-slate-500">Sub-kategori tidak ditemukan</div>;
  return <LayananSubPage key={sub} meta={meta} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profil/struktur-manajemen/:memberSlug" element={<Profile />} />
          <Route path="/profil/:subPage" element={<Profile />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/layanan/:categorySlug/:serviceType/penawaran" element={<AjukanPenawaran />} />
          <Route path="/layanan/:subPage" element={<Layanan />} />
          <Route path="/portofolio" element={<Portofolio />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/debug-cms" element={<DebugCms />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="beranda" element={<BerandaPage />} />
            <Route path="berita" element={<BeritaPage />} />
            <Route path="kontak" element={<KontakPage />} />
            <Route path="sejarah" element={<SejarahPage />} />
            <Route path="keunggulan" element={<KeunggulanPage />} />
            <Route path="legalitas" element={<LegalitasPage />} />
            <Route path="struktur" element={<StrukturPage />} />
            <Route path="tentang-kami" element={<TentangKamiPage />} />
            <Route path="layanan" element={<LayananPage />} />
            <Route path="layanan/:sub" element={<LayananSubPageWrapper />} />
            <Route path="portofolio" element={<PortofolioPage />} />
            <Route path="pengajuan-jasa" element={<PengajuanJasaPage />} />
            <Route path="pengguna" element={<PenggunaPage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
            <Route path="kalender" element={<KalenderPage />} />
          </Route>

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
