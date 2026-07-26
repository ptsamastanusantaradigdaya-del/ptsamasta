import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LayananOverview from "@/components/layanan/LayananOverview";
import LayananDetail from "@/components/layanan/LayananDetail";
import { supabase } from "@/integrations/supabase/client";
import buildingBg from "@/assets/building-bg.jpg";

const subPages = [
  { key: "overview", label: "Bidang Usaha" },
  { key: "pemeliharaan", label: "Pemeliharaan & Lingkungan" },
  { key: "jasa-profesional", label: "Jasa Profesional & SDM" },
  { key: "perdagangan", label: "Perdagangan Besar" },
  { key: "event-organizer", label: "Event Organizer & Media" },
];

const Layanan = () => {
  const { subPage } = useParams();
  const activeTab = subPage || "overview";
  const currentLabel = subPages.find((s) => s.key === activeTab)?.label || "Layanan";

  const [cmsData, setCmsData] = useState<any>(null);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const { data } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "layanan")
          .maybeSingle();
        if (data && data.content) {
          setCmsData(data.content);
        }
      } catch (e) {
        console.error("Gagal memuat CMS Layanan:", e);
      }
    };
    void fetchCms();
  }, []);

  const renderContent = () => {
    if (activeTab === "overview") return <LayananOverview cmsData={cmsData?.section} />;
    return <LayananDetail serviceKey={activeTab} />;
  };

  const heroTitle = cmsData?.hero?.judul ?? "Layanan Kami";
  const heroSubtitle = cmsData?.hero?.subtitle ?? "Solusi Terpadu Dalam Pelayanan One - Stop Solution Untuk Membangun Pertumbuhan Bisnis Secara Profesional Dan Berkelanjutan";
  const heroBgImage = cmsData?.hero?.backgroundUrl || buildingBg;
  const heroOverlay = cmsData?.hero?.overlay || "#1E3A8A";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: heroOverlay, opacity: 0.85 }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-start gap-2 text-sm text-primary-foreground/60 mb-6">
            <Link to="/" className="hover:text-gold transition-colors">Beranda</Link>
            <span>&gt;</span>
            <span className="text-primary-foreground/80">Layanan</span>
            {activeTab !== "overview" && (
              <>
                <span>&gt;</span>
                <span className="text-primary-foreground">{currentLabel}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
            {heroTitle}
          </h1>
          <p className="text-primary-foreground/70 text-sm max-w-xl mx-auto whitespace-pre-line">
            {heroSubtitle}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <main>{renderContent()}</main>

      <Footer />
    </div>
  );
};

export default Layanan;
