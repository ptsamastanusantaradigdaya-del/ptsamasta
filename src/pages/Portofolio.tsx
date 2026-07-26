import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, GraduationCap, ShoppingCart, Sparkles, MapPin, Calendar, User, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  category: string | null;
  client: string | null;
  cover_url: string | null;
  description: string | null;
  gallery: string[] | null;
  location: string | null;
  slug: string;
  title: string;
  year: string | null;
};

type Category = {
  id: string;
  name: string;
  color: string;
  gradient: string;
  iconName: string;
  description: string;
};

const defaultCategories: Category[] = [
  {
    id: "pemeliharaan",
    name: "Pemeliharaan, Perawatan, dan Pembuatan Lingkungan",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600",
    iconName: "Leaf",
    description: "Portofolio layanan perawatan lingkungan yang mencakup pemeliharaan taman dan kebersihan bangunan untuk area perumahan, perkantoran, dan fasilitas publik."
  },
  {
    id: "jasa-sdm",
    name: "Jasa Profesional & Pengembangan SDM",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
    iconName: "GraduationCap",
    description: "Dokumentasi proyek jasa profesional yang mendukung aspek legalitas, sertifikasi, dan pengembangan kompetensi SDM."
  },
  {
    id: "perdagangan",
    name: "Pengolahan dan Perdagangan Besar",
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    iconName: "ShoppingCart",
    description: "Layanan pengadaan and distribusi skala besar serta manufaktur konveksi seragam."
  },
  {
    id: "event-organizer",
    name: "Event Organizer, Kreatif & Media",
    color: "purple",
    gradient: "from-fuchsia-500 to-pink-500",
    iconName: "Sparkles",
    description: "Penyelenggaraan event (MICE), desain komunikasi visual, dan publikasi media."
  }
];

const Portofolio = () => {
  const [hero, setHero] = useState({
    judul: "Portofolio Perusahaan",
    subtitle: "Dokumentasi pengalaman dan proyek yang telah kami tangani di berbagai bidang usaha",
    gambar: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800"
  });
  
  const [supabaseData, setSupabaseData] = useState<{ pageData: any; protoData: any } | null>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log("[Portfolio Fetch] Loading portfolio data from Supabase...");
      if (refetchTrigger > 0) {
        console.log("[Portfolio Refetch] Triggered refetch count:", refetchTrigger);
      }
      
      try {
        // 1. Fetch Page Layout Config (Hero and Categories)
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "portofolio")
          .lte("updated_at", new Date().toISOString())
          .maybeSingle();

        let currentHero = {
          judul: "Portofolio Perusahaan",
          subtitle: "Dokumentasi pengalaman dan proyek yang telah kami tangani di berbagai bidang usaha",
          gambar: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800"
        };
        let currentCategories = defaultCategories;
        let rawPageContent = null;

        if (pageData && pageData.content && typeof pageData.content === "object") {
          rawPageContent = pageData.content;
          const content = pageData.content as any;
          if (content.hero) {
            currentHero = {
              judul: content.hero.judul || "Portofolio Perusahaan",
              subtitle: content.hero.subtitle || "Dokumentasi pengalaman dan proyek yang telah kami tangani di berbagai bidang usaha",
              gambar: content.hero.gambar || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800"
            };
          }
          if (Array.isArray(content.kategori)) {
            currentCategories = content.kategori.map((k: any) => {
              const color = k.warna || "blue";
              let gradient = "from-blue-500 to-indigo-600";
              if (color === "green") gradient = "from-emerald-500 to-emerald-600";
              else if (color === "blue") gradient = "from-blue-500 to-indigo-600";
              else if (color === "orange") gradient = "from-orange-500 to-red-500";
              else if (color === "purple") gradient = "from-fuchsia-500 to-pink-500";
              else if (color === "red") gradient = "from-red-500 to-red-600";
              else if (color === "teal") gradient = "from-teal-500 to-teal-600";

              let iconName = "Sparkles";
              if (k.id === "pemeliharaan") iconName = "Leaf";
              else if (k.id === "jasa-sdm") iconName = "GraduationCap";
              else if (k.id === "perdagangan") iconName = "ShoppingCart";
              else if (k.id === "event-organizer") iconName = "Sparkles";

              return {
                id: k.id,
                name: k.nama || "",
                color,
                gradient,
                iconName,
                description: k.deskripsi || ""
              };
            });
          }
        }

        setHero(currentHero);
        setCategories(currentCategories);
        console.log("[Portfolio Hero]", currentHero);
        console.log("[Portfolio Categories]", currentCategories);

        // 2. Fetch Projects list
        console.log("[Portfolio Projects Query]", { is_published: true });
        const { data: protoData, error } = await supabase
          .from("portofolio")
          .select("*")
          .eq("is_published", true)
          .lte("created_at", new Date().toISOString())
          .order("sort_order", { ascending: true });

        if (error) throw error;
        
        let formattedProjects: Project[] = [];
        if (protoData) {
          formattedProjects = protoData.map((p) => {
            let galleryUrls: string[] = [];
            try {
              galleryUrls = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
            } catch (e) {}

            return {
              id: p.id,
              category: p.category,
              client: p.client,
              cover_url: p.cover_url,
              description: p.description,
              gallery: galleryUrls,
              location: p.location,
              slug: p.slug,
              title: p.title,
              year: p.year
            };
          });
          setProjects(formattedProjects);
          console.log("[Portfolio Projects Result]", formattedProjects);
        }

        setSupabaseData({ pageData: rawPageContent, protoData });
      } catch (e: any) {
        console.error("Gagal memuat data portofolio: ", e.message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [refetchTrigger]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Leaf": return <Leaf className="w-5 h-5" />;
      case "GraduationCap": return <GraduationCap className="w-5 h-5" />;
      case "ShoppingCart": return <ShoppingCart className="w-5 h-5" />;
      case "Sparkles": return <Sparkles className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getCategoryTheme = (catId: string | null) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return {
      color: "blue",
      gradient: "from-blue-500 to-indigo-600",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      badgeColor: "text-blue-600"
    };

    let btnBg = "bg-blue-600 hover:bg-blue-700";
    let badgeColor = "text-blue-600";
    
    if (cat.id === "pemeliharaan") {
      btnBg = "bg-emerald-700 hover:bg-emerald-800";
      badgeColor = "text-emerald-600";
    } else if (cat.id === "jasa-sdm") {
      btnBg = "bg-blue-700 hover:bg-blue-800";
      badgeColor = "text-blue-600";
    } else if (cat.id === "perdagangan") {
      btnBg = "bg-orange-700 hover:bg-orange-800";
      badgeColor = "text-orange-600";
    } else if (cat.id === "event-organizer") {
      btnBg = "bg-purple-700 hover:bg-purple-800";
      badgeColor = "text-purple-600";
    }

    return {
      color: cat.color,
      gradient: cat.gradient,
      btnBg,
      badgeColor
    };
  };

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const handlePrevImage = () => {
    if (!selectedProject || !selectedProject.gallery) return;
    const len = selectedProject.gallery.length;
    setActiveImageIndex((prev) => (prev === 0 ? len - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!selectedProject || !selectedProject.gallery) return;
    const len = selectedProject.gallery.length;
    setActiveImageIndex((prev) => (prev === len - 1 ? 0 : prev + 1));
  };

  // 1. [Portfolio Hero Render]
  console.log("[Portfolio Hero Render]", {
    receivedReact: hero,
    supabaseQuery: supabaseData?.pageData?.hero,
    renderedJSX: { judul: hero.judul, subtitle: hero.subtitle, gambar: hero.gambar }
  });

  // 2. [Portfolio Category Render]
  categories.forEach((cat) => {
    console.log("[Portfolio Category Render]", {
      receivedReact: cat,
      supabaseQuery: supabaseData?.pageData?.kategori?.find((k: any) => k.id === cat.id),
      renderedJSX: { id: cat.id, name: cat.name, color: cat.color, description: cat.description }
    });
  });

  // 3. [Portfolio Card Render]
  filteredProjects.forEach((p) => {
    console.log("[Portfolio Card Render]", {
      receivedReact: p,
      supabaseQuery: supabaseData?.protoData?.find((x: any) => x.id === p.id),
      renderedJSX: { id: p.id, title: p.title, location: p.location, year: p.year }
    });
  });

  // 4. [Portfolio Detail Render], [Portfolio Gallery Render], [Portfolio Modal Render]
  if (selectedProject) {
    console.log("[Portfolio Modal Render]", {
      receivedReact: selectedProject,
      supabaseQuery: supabaseData?.protoData?.find((x: any) => x.id === selectedProject.id),
      renderedJSX: { title: selectedProject.title, category: selectedProject.category }
    });

    console.log("[Portfolio Detail Render]", {
      receivedReact: selectedProject,
      supabaseQuery: supabaseData?.protoData?.find((x: any) => x.id === selectedProject.id),
      renderedJSX: { client: selectedProject.client, location: selectedProject.location, year: selectedProject.year, description: selectedProject.description }
    });

    if (selectedProject.gallery && selectedProject.gallery.length > 0) {
      console.log("[Portfolio Gallery Render]", {
        receivedReact: selectedProject.gallery,
        supabaseQuery: supabaseData?.protoData?.find((x: any) => x.id === selectedProject.id)?.gallery,
        renderedJSX: selectedProject.gallery
      });
    }
  }
  console.log("[Portfolio Filter Result]", filteredProjects);
  console.log("[Portfolio Render Result]", { categoriesCount: categories.length, projectsCount: projects.length, filteredCount: filteredProjects.length });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#1E3A8A]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-start gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-gold transition-colors">Beranda</Link>
            <span>&gt;</span>
            <span className="text-white">Portofolio</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
            <div className="flex-1 text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                {hero.judul}
              </h1>
              <p className="text-white/80 text-sm max-w-xl">
                {hero.subtitle}
              </p>
            </div>
            {hero.gambar && (
              <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-64 rounded-2xl overflow-hidden shadow-2xl bg-white/10 p-2 backdrop-blur-sm">
                <img
                  src={hero.gambar}
                  alt={hero.judul}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12 container mx-auto px-4">
        {/* Category Tabs */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Kategori Portofolio</h2>
          <p className="text-muted-foreground text-sm mt-2">Pilih kategori untuk melihat proyek kami</p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                activeFilter === "all"
                  ? "bg-navy-dark text-white border-navy-dark"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Semua Proyek
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                  activeFilter === cat.id
                    ? "bg-navy-dark text-white border-navy-dark"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Memuat portofolio...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">Belum ada portofolio yang dipublikasikan.</div>
        ) : (
          <div className="space-y-16">
            {categories.filter(c => activeFilter === "all" || c.id === activeFilter).map((cat) => {
              const catProjects = projects.filter(p => p.category === cat.id);
              if (catProjects.length === 0) return null;

              const theme = getCategoryTheme(cat.id);

              return (
                <div key={cat.id} className="space-y-6">
                  {/* Category Section Header */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center`}>
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                    </div>
                  </div>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {catProjects.map((p) => (
                      <div
                        key={p.id}
                        className={`rounded-2xl bg-gradient-to-br ${theme.gradient} text-white p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between aspect-[4/3] min-h-[220px]`}
                      >
                        <div>
                          <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/20 mb-3">
                            {cat.name.split(",")[0].split("&")[0]}
                          </span>
                          <h4 className="text-lg font-bold leading-snug mb-4 line-clamp-3">{p.title}</h4>
                        </div>

                        <div className="space-y-4">
                          <div className="text-xs text-white/80 space-y-1">
                            {p.location && (
                              <p className="flex items-center gap-1">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span className="line-clamp-1">{p.location}</span>
                              </p>
                            )}
                            {p.year && (
                              <p className="flex items-center gap-1">
                                <Calendar size={12} className="flex-shrink-0" />
                                <span>Tahun {p.year}</span>
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              console.log("[Portfolio Detail]", p);
                              console.log("[Portfolio Gallery]", p.gallery);
                              setSelectedProject(p);
                              setActiveImageIndex(0);
                            }}
                            className={`w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-white/25 hover:bg-white/35 transition-colors border border-white/20 text-center`}
                          >
                            Lihat Detail Proyek →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Hero */}
            <div className="p-6 md:p-8 border-b border-border flex-shrink-0">
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#1E3A8A] text-white mb-2">
                {categories.find(c => c.id === selectedProject.category)?.name || "Portofolio"}
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">{selectedProject.title}</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              {/* Meta details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 text-xs">
                {selectedProject.client && (
                  <div className="space-y-1">
                     <p className="text-muted-foreground font-medium flex items-center gap-1">
                      <User size={12} /> Klien / Instansi
                    </p>
                    <p className="font-semibold text-foreground">{selectedProject.client}</p>
                  </div>
                )}
                {selectedProject.location && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground font-medium flex items-center gap-1">
                      <MapPin size={12} /> Lokasi Proyek
                    </p>
                    <p className="font-semibold text-foreground">{selectedProject.location}</p>
                  </div>
                )}
                {selectedProject.year && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar size={12} /> Tahun Pelaksanaan
                    </p>
                    <p className="font-semibold text-foreground">{selectedProject.year}</p>
                  </div>
                )}
              </div>

              {/* Gallery section */}
              {selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Galeri Proyek</p>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 flex items-center justify-center group">
                    <img
                      src={selectedProject.gallery[activeImageIndex]}
                      alt={`${selectedProject.title} - ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {selectedProject.gallery.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                          {activeImageIndex + 1} / {selectedProject.gallery.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail strip */}
                  {selectedProject.gallery.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {selectedProject.gallery.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                            activeImageIndex === i ? "border-[#1E3A8A]" : "border-transparent opacity-60"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedProject.cover_url ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Gambar Proyek</p>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/5">
                    <img src={selectedProject.cover_url} alt={selectedProject.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : null}

              {/* Description */}
              {selectedProject.description && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Deskripsi Proyek</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-border flex justify-end flex-shrink-0">
              <Button onClick={() => setSelectedProject(null)} className="bg-navy-dark text-white hover:bg-navy-dark/95">
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Portofolio;
