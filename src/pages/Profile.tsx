import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TentangKami from "@/components/profile/TentangKami";
import StrukturManajemen from "@/components/profile/StrukturManajemen";
import SejarahPage from "@/components/profile/SejarahPage";
import LegalitasPage from "@/components/profile/LegalitasPage";
import KeunggulanPage from "@/components/profile/KeunggulanPage";
import LeadershipDetail from "@/components/profile/LeadershipDetail";
import buildingBg from "@/assets/building-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

const subPages = [
  { key: "tentang-kami", label: "Tentang Kami" },
  { key: "struktur-manajemen", label: "Struktur Manajemen" },
  { key: "sejarah", label: "Sejarah" },
  { key: "legalitas", label: "Legalitas & Perizinan" },
  { key: "keunggulan", label: "Keunggulan" }
];

const getSlugForTab = (tab: string) => {
  switch (tab) {
    case "tentang-kami":
      return "tentang-kami";
    case "struktur-manajemen":
      return "struktur-manajemen";
    case "sejarah":
      return "sejarah";
    case "legalitas":
      return "legalitas-perizinan";
    case "keunggulan":
      return "keunggulan";
    default:
      return "tentang-kami";
  }
};

const Profile = () => {
  const { subPage, memberSlug } = useParams();
  const activeTab = subPage || "tentang-kami";
  
  const [brandName, setBrandName] = useState("PT Samasta Nusantara Digdaya");
  const [heroTitle, setHeroTitle] = useState("PT Samasta Nusantara Digdaya");
  const [heroSubtitle, setHeroSubtitle] = useState("Dipercaya oleh Platform Pengadaan Terkemuka");
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [heroOverlay, setHeroOverlay] = useState("#1E3A8A");
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["Beranda", "Profil", "Tentang Kami"]);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const activeSlug = getSlugForTab(activeTab);
        console.log(`[Profile] Current URL: /profil/${activeTab}`);
        console.log(`[Profile] Loaded Slug: ${activeSlug}`);
        console.log(`[Profile] Matched Route: /profil/:subPage`);
        console.log(`[Profile] Loaded Page: ${activeTab}`);

        const { data } = await supabase
          .from("cms_pages")
          .select("slug, content")
          .in("slug", ["pengaturan", activeSlug]);
        
        console.log("[Profile] Database Result:", data);

        if (data) {
          const pengaturan = data.find((d) => d.slug === "pengaturan");
          const pageData = data.find((d) => d.slug === activeSlug);

          console.log(`[Profile] Public Fetch Result (${activeSlug}):`, pageData?.content);

          if (pengaturan && pengaturan.content) {
            const content = pengaturan.content as any;
            if (content.umum && content.umum.namaSitus) {
              setBrandName(content.umum.namaSitus);
            }
          }

          let title = "PT Samasta Nusantara Digdaya";
          let subtitle = "";
          let bgUrl = null;
          let overlay = "#1E3A8A";
          
          const currentTabLabel = subPages.find((s) => s.key === activeTab)?.label || "Tentang Kami";
          let bread = ["Beranda", "Profil", currentTabLabel];
          title = currentTabLabel;

          if (pageData && pageData.content) {
            const content = pageData.content as any;
            if (content.hero) {
              if (content.hero.title) title = content.hero.title;
              if (content.hero.subtitle) subtitle = content.hero.subtitle;
              if (content.hero.backgroundUrl) bgUrl = content.hero.backgroundUrl;
              else if (content.hero.image) bgUrl = content.hero.image;
              if (content.hero.overlay) overlay = content.hero.overlay;
            }
            if (content.breadcrumb && Array.isArray(content.breadcrumb)) {
              bread = content.breadcrumb;
            }
          }

          setHeroTitle(title);
          setHeroSubtitle(subtitle);
          setHeroBg(bgUrl);
          setHeroOverlay(overlay);
          setBreadcrumbs(bread);

          console.log("[Profile] Loaded Breadcrumb:", bread);
          console.log("[Profile] Loaded Hero:", { title, subtitle, bgUrl, overlay });

          // Document title update
          document.title = `${title} - ${brandName}`;
        }
      } catch (e) {
        console.error("Gagal memuat data hero profil:", e);
      }
    };
    void fetchCmsData();
  }, [activeTab, brandName]);

  if (memberSlug) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <LeadershipDetail slug={memberSlug} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!subPage) {
    return <Navigate to="/profil/tentang-kami" replace />;
  }

  // Render dynamic leadership profile if tab is not a standard subpage
  const isStandardTab = subPages.some(p => p.key === activeTab);
  if (!isStandardTab) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <LeadershipDetail slug={activeTab} />
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "tentang-kami":
        return <TentangKami />;
      case "struktur-manajemen":
        return <StrukturManajemen />;
      case "sejarah":
        return <SejarahPage />;
      case "legalitas":
        return <LegalitasPage />;
      case "keunggulan":
        return <KeunggulanPage />;
      default:
        return <TentangKami />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner with building background */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg || buildingBg} alt="" className="w-full h-full object-cover" />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: heroOverlay || "#1E3A8A", opacity: 0.85 }} 
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center justify-start gap-2 text-sm text-primary-foreground/60 mb-6">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span>&gt;</span>}
                {idx === 0 ? (
                  <Link to="/" className="hover:text-gold transition-colors">{crumb}</Link>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? "text-primary-foreground font-semibold" : "text-primary-foreground/80"}>
                    {crumb}
                  </span>
                )}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
            {heroTitle || brandName}
          </h1>
          <p className="text-primary-foreground/70 text-sm">
            {heroSubtitle}
          </p>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Sub-navigation tabs */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          














        </div>
      </div>

      {/* Content */}
      <main>{renderContent()}</main>

      <Footer />
    </div>);

};

export default Profile;