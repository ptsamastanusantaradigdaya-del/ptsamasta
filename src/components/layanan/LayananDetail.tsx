import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader2, Landmark, BriefcaseBusiness, Heart, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getIcon } from "@/lib/icons";
import PartnersSection from "@/components/PartnersSection";

interface Category {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  hero_image_url: string | null;
  color_theme: string | null;
}

interface Scope {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Partner {
  name: string;
  logo_url: string;
  group_name: string;
}

interface Portfolio {
  id: string;
  title: string;
  cover_url: string | null;
}

const defaultClients = [
  { icon: Landmark, label: "Pemerintah" },
  { icon: BriefcaseBusiness, label: "Swasta" },
  { icon: Heart, label: "Yayasan" },
  { icon: Users, label: "Perusahaan" },
];

const getGradientClass = (theme: string | null): string => {
  if (!theme) return "from-blue-600 to-indigo-500";
  const themeLower = theme.toLowerCase().trim();
  if (themeLower === "green" || themeLower.includes("green") || themeLower.includes("emerald")) {
    return "from-emerald-500 to-emerald-600";
  }
  if (themeLower === "blue" || themeLower.includes("blue") || themeLower.includes("indigo")) {
    return "from-blue-500 to-indigo-600";
  }
  if (themeLower === "orange" || themeLower.includes("orange") || themeLower.includes("amber") || themeLower.includes("red")) {
    return "from-orange-500 to-red-500";
  }
  if (themeLower === "purple" || themeLower.includes("purple") || themeLower.includes("pink") || themeLower.includes("fuchsia")) {
    return "from-fuchsia-500 to-pink-500";
  }
  return theme;
};

const LayananDetail = ({ serviceKey }: { serviceKey: string }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [clients, setClients] = useState<any[]>(defaultClients);
  const [katalog, setKatalog] = useState<any[]>([]);
  const [portfolios, setPortfolio] = useState<Portfolio[]>([]);
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load cms config
        const { data: cmsPage } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", `layanan-${serviceKey}`)
          .maybeSingle();

        console.log("[Detail Page] Fetch - cms_pages:", cmsPage);

        let loadedCms: any = null;
        if (cmsPage && cmsPage.content) {
          loadedCms = cmsPage.content;
          setCmsData(loadedCms);
          if (loadedCms.clients && loadedCms.clients.length > 0) {
            setClients(loadedCms.clients.map((c: any) => ({ label: c.nama, emoji: c.emoji, nama: c.nama })));
          }
          if (loadedCms.katalog && loadedCms.katalog.length > 0) {
            setKatalog(loadedCms.katalog);
          }
        }

        // 1. Fetch Category
        const { data: catData, error: catError } = await supabase
          .from("service_categories")
          .select("*")
          .eq("slug", serviceKey)
          .eq("is_active", true)
          .maybeSingle();

        if (catError) throw catError;

        if (catData) {
          setCategory(catData);

          // 2. Fetch Scopes
          const { data: scopesData } = await supabase
            .from("service_scopes")
            .select("id, name, slug, description, image_url")
            .eq("category_id", catData.id)
            .eq("is_active", true)
            .order("sort_order");
          setScopes(scopesData ?? []);
        }

        // 3. Fetch Portfolios
        const { data: portfoliosData } = await supabase
          .from("portofolio")
          .select("id, title, cover_url")
          .eq("category", serviceKey)
          .eq("is_published", true)
          .order("sort_order")
          .limit(8);
        setPortfolio(portfoliosData ?? []);

      } catch (err) {
        console.error("Error fetching service detail data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceKey]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-20 text-center container mx-auto px-4">
        <p className="text-muted-foreground">Layanan tidak ditemukan.</p>
        <Link to="/layanan" className="text-[#2563EB] underline mt-4 inline-block">
          Kembali ke Semua Layanan
        </Link>
      </div>
    );
  }

  const gradient = getGradientClass(category.color_theme);
  const isHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);
  const heroColor = cmsData?.hero?.warna && isHexColor(cmsData.hero.warna) ? cmsData.hero.warna : null;

  // USER REQUESTED LOGS
  console.log("[Hero CMS Fetch]", cmsData);
  console.log("[Hero Color From CMS]", cmsData?.hero?.warna);
  console.log("[Hero Color Final]", heroColor);
  console.log("[Hero Fetch]", { cmsData, category, serviceKey });
  console.log("[Hero Final Style]", heroColor ? { backgroundColor: heroColor } : `Gradient: ${gradient}`);
  console.log("[Hero Render]", { heroColor, gradient, useGradient: !heroColor });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative pt-16 overflow-hidden">
        <div 
          className={`relative min-h-[360px] flex items-end ${!heroColor ? `bg-gradient-to-r ${gradient}` : ""}`}
          style={heroColor ? { backgroundColor: heroColor } : undefined}
        >
          <div className="absolute top-20 left-0 right-0 z-10">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Link to="/" className="hover:text-white transition-colors">🏠 Beranda</Link>
                <span>&gt;</span>
                <Link to="/layanan" className="hover:text-white transition-colors">Layanan</Link>
                <span>&gt;</span>
                <span className="text-white">{category.name}</span>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-12 pt-32 flex flex-col md:flex-row items-end gap-8">
            <div className="flex-1 z-10">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight whitespace-pre-line">
                {cmsData?.hero?.judul || category.name}
              </h1>
              <p className="text-white/80 text-sm max-w-md">
                {cmsData?.hero?.subtitle || category.short_description}
              </p>
            </div>
            {(cmsData?.hero?.gambar || category.hero_image_url) && (
              <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={cmsData?.hero?.gambar || category.hero_image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Partners Marquee (Shared Component) */}
      <PartnersSection
        groupName="home"
        showTitle={false}
        className="py-8 bg-background border-b border-border"
      />

      {/* Tentang Layanan */}
      {category.long_description && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Tentang Layanan</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {category.long_description}
            </p>
          </div>
        </section>
      )}

      {/* Ruang Lingkup Layanan */}
      {scopes.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Ruang Lingkup Layanan</h2>
            <div className={`grid grid-cols-1 ${scopes.length > 1 ? "md:grid-cols-2" : ""} gap-8`}>
              {scopes.map((s) => {
                // If scope lists icons or defaults
                const ScopeIcon = getIcon(null, Sparkles);
                return (
                  <div key={s.id} className="bg-card rounded-xl border border-border p-8 text-center shadow-sm flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-[#1E3A8A]">
                      <ScopeIcon size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{s.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                      {s.description}
                    </p>
                    <Link
                      to={`/layanan/${category.slug}/${s.slug}/penawaran`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors text-sm"
                    >
                      Ajukan Penawaran →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Our Clients */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Mitra Kami</h2>
          <p className="text-muted-foreground text-sm mb-10">Kami dipercaya oleh berbagai sektor institusi</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clients.map((c) => (
              <div key={c.id || c.label} className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {c.emoji ? c.emoji : (c.icon ? <c.icon className="w-8 h-8 text-foreground/70" /> : "🏢")}
                </div>
                <span className="text-sm font-medium text-foreground">{c.nama || c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portofolio / Katalog */}
      {((katalog && katalog.some(k => k.url)) || portfolios.length > 0) && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">Katalog & Portofolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {katalog && katalog.some(k => k.url) ? (
                katalog.filter(k => k.url).map((k, i) => (
                  <div key={k.id || i} className="rounded-xl overflow-hidden shadow-sm aspect-[3/4] bg-muted relative group">
                    <img src={k.url} alt="Katalog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ))
              ) : (
                portfolios.map((p, i) => (
                  <div key={p.id} className="rounded-xl overflow-hidden shadow-sm aspect-[3/4] bg-muted relative group">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4">{p.title}</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-left">
                      <p className="text-white text-xs font-semibold leading-snug">{p.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Back CTA */}
      <section className="py-12 bg-background border-t border-border text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/layanan"
            className="inline-flex items-center gap-2 text-[#1E3A8A] hover:underline text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Kembali ke Semua Bidang Usaha
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LayananDetail;
