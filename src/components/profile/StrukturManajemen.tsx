import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  Shield,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Mail,
  Linkedin,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Member = {
  id: string;
  slug: string;
  name: string;
  position: string;
  photo_url: string | null;
  level: number;
  bio: string | null;
  detail_content: string | null;
};

const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "award":
      return Award;
    case "shield":
      return Shield;
    case "trending":
      return TrendingUp;
    case "users":
      return Users;
    case "briefcase":
      return Briefcase;
    case "education":
      return GraduationCap;
    default:
      return Sparkles;
  }
};

const parseDetailContent = (detailContent: string | null) => {
  const res = {
    badgeColor: "#2563EB",
    heroBgColor: "#1E3A8A",
    keahlian: [] as string[],
    pendidikanSingkat: "",
    pengalamanTahun: "",
  };
  if (!detailContent) return res;
  if (detailContent.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(detailContent);
      return { ...res, ...parsed };
    } catch (e) {
      console.error("Gagal parse JSON detail_content:", e);
    }
  }
  return res;
};

const StrukturManajemen = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);

  useEffect(() => {
    // Load members from database
    supabase
      .from("struktur_manajemen")
      .select("id,slug,name,position,photo_url,level,bio,detail_content,sort_order,is_active")
      .eq("is_active", true)
      .order("level")
      .order("sort_order")
      .then(({ data }) => {
        console.log("[StrukturManajemen] Fetch Result - Members:", data);
        setMembers(data ?? []);
      });

    // Load page layout CMS config
    supabase
      .from("cms_pages")
      .select("content")
      .eq("slug", "struktur-manajemen")
      .maybeSingle()
      .then(({ data }) => {
        console.log("[StrukturManajemen] Fetch Result - CMS Layout:", data);
        if (data && data.content) {
          setCmsContent(data.content);
        }
      });
  }, []);

  console.log("[StrukturManajemen] Rendered Result:", {
    membersCount: members.length,
    hasCmsContent: !!cmsContent,
    cmsContentKeys: cmsContent ? Object.keys(cmsContent) : []
  });

  const introTitle = cmsContent?.intro?.title || "Kepemimpinan yang Visioner dan Berpengalaman";
  const introP1 = cmsContent?.intro?.paragraf1 || "Tim manajemen PT Samasta Nusantara Digdaya terdiri dari para profesional berpengalaman dengan rekam jejak yang terbukti di berbagai industri.";
  const introP2 = cmsContent?.intro?.paragraf2 || "Setiap anggota direksi membawa perspektif unik dan komitmen kuat untuk memberikan terbaik bagi klien, mitra, dan stakeholder kami.";

  const komisarisTitle = cmsContent?.sectionTitles?.komisarisTitle || "Dewan Komisaris";
  const komisarisSubtitle = cmsContent?.sectionTitles?.komisarisSubtitle || "Pengawas independen yang memastikan tata kelola perusahaan yang baik";
  
  const direksiTitle = cmsContent?.sectionTitles?.direksiTitle || "Dewan Direksi";
  const direksiSubtitle = cmsContent?.sectionTitles?.direksiSubtitle || "Pemimpin strategis yang menjalankan visi dan misi perusahaan";

  const pencapaian = cmsContent?.pencapaian || {
    title: "Pencapaian Perusahaan",
    subtitle: "Hasil nyata dari kepemimpinan yang efektif dan komitmen terhadap keunggulan",
    items: [
      { id: 1, title: "Sertifikasi ISO 9001:2015", desc: "Standar manajemen mutu internasional", icon: "award" },
      { id: 2, title: "Good Corporate Governance", desc: "Tata kelola perusahaan yang transparan", icon: "shield" },
      { id: 3, title: "Pertumbuhan 45% YoY", desc: "Kinerja finansial yang konsisten", icon: "trending" },
      { id: 4, title: "100+ Klien Korporat", desc: "Kepercayaan dari berbagai industri", icon: "users" },
    ],
  };

  const gcg = cmsContent?.gcg || {
    title: "Good Corporate Governance",
    subtitle: "Komitmen kami terhadap tata kelola perusahaan yang baik",
    items: [
      { id: 1, title: "Transparansi", desc: "Kami berkomitmen untuk transparansi dalam pelaporan keuangan, operasional, dan pengambilan keputusan strategis.", icon: "shield" },
      { id: 2, title: "Akuntabilitas", desc: "Setiap keputusan dan tindakan direksi dapat dipertanggungjawabkan kepada stakeholder dan publik.", icon: "users" },
      { id: 3, title: "Kepatuhan", desc: "Mematuhi semua regulasi, standar industri, dan kode etik bisnis yang berlaku di Indonesia.", icon: "award" },
    ],
  };

  const cta = cmsContent?.cta || {
    title: "Ingin Tahu Lebih Lanjut tentang Kami?",
    subtitle: "Tim kami siap menjawab pertanyaan Anda dan membantu menemukan solusi terbaik untuk kebutuhan bisnis Anda.",
    primaryLabel: "Hubungi Tim Kami",
    primaryLink: "/kontak",
    secondaryLabel: "Lihat Layanan Kami",
    secondaryLink: "/layanan",
  };

  const komisaris = members.filter((m) => m.level <= 2);
  const direksi = members.filter((m) => m.level >= 3);

  return (
    <div className="space-y-0">
      {/* Intro Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            {introTitle}
          </h3>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 max-w-2xl mx-auto">
            <p>{introP1}</p>
            {introP2 && <p>{introP2}</p>}
          </div>
        </div>
      </section>

      {/* Dewan Komisaris */}
      {komisaris.length > 0 && (
        <section className="py-16 bg-muted/40 border-t border-border">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">{komisarisTitle}</h3>
            <p className="text-sm text-muted-foreground mb-12 max-w-xl mx-auto">
              {komisarisSubtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto justify-center">
              {komisaris.map((m) => {
                const parsed = parseDetailContent(m.detail_content);
                return (
                  <Link
                    key={m.id}
                    to={`/profil/struktur-manajemen/${m.slug}`}
                    className="group bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md hover:border-primary/20 transition duration-300"
                  >
                    <div className="w-36 h-36 rounded-2xl mx-auto mb-5 overflow-hidden border-2 border-border group-hover:border-primary/20 bg-muted flex items-center justify-center transition-colors">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Users size={44} className="text-muted-foreground" />
                      )}
                    </div>
                    <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{m.name}</h4>
                    <span
                      style={{ backgroundColor: parsed.badgeColor || "#1E3A8A" }}
                      className="inline-block mt-3 text-white text-[10px] font-semibold px-4 py-1.5 rounded-full"
                    >
                      {m.position}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dewan Direksi */}
      {direksi.length > 0 && (
        <section className="py-16 bg-background border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">{direksiTitle}</h3>
            <p className="text-sm text-muted-foreground mb-12 max-w-xl mx-auto">
              {direksiSubtitle}
            </p>

            <div className="space-y-8 max-w-3xl mx-auto">
              {direksi.map((m) => {
                const parsed = parseDetailContent(m.detail_content);
                return (
                  <div
                    key={m.id}
                    className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 text-left">
                      {/* Left: Photo */}
                      <div className="relative w-full max-w-[160px] aspect-square rounded-xl overflow-hidden bg-muted mx-auto flex-shrink-0 border">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-12 h-12 text-[#1E3A8A] absolute inset-0 m-auto" />
                        )}
                      </div>
                      
                      {/* Right: Info details */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-foreground">{m.name}</h4>
                            <span
                              style={{ backgroundColor: parsed.badgeColor || "#2563EB" }}
                              className="inline-block text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full w-fit"
                            >
                              {m.position}
                            </span>
                          </div>
                          {m.bio && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                              {m.bio}
                            </p>
                          )}
                          
                          {/* Quick info list */}
                          <div className="space-y-2 text-xs text-muted-foreground mb-4 border-t pt-3 border-dashed">
                            {parsed.keahlian && parsed.keahlian.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-foreground mr-1 text-[11px]">Keahlian:</span>
                                {parsed.keahlian.map((k: string, ki: number) => (
                                  <span key={ki} className="bg-muted px-2 py-0.5 rounded text-[10px] text-foreground font-medium border">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            )}
                            {parsed.pendidikanSingkat && (
                              <div className="flex items-center gap-1.5">
                                <GraduationCap size={14} className="text-[#1E3A8A] shrink-0" />
                                <span><span className="font-semibold text-foreground text-[11px]">Pendidikan:</span> {parsed.pendidikanSingkat}</span>
                              </div>
                            )}
                            {parsed.pengalamanTahun && (
                              <div className="flex items-center gap-1.5">
                                <Briefcase size={14} className="text-[#1E3A8A] shrink-0" />
                                <span><span className="font-semibold text-foreground text-[11px]">Pengalaman:</span> {parsed.pengalamanTahun}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Bottom buttons & socials */}
                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <Link
                            to={`/profil/struktur-manajemen/${m.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
                          >
                            Lihat Profil Lengkap <ArrowRight size={14} />
                          </Link>
                          <div className="flex items-center gap-2">
                            <a href="#" className="p-1 rounded-md text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-100 transition">
                              <Linkedin size={14} />
                            </a>
                            <a href="#" className="p-1 rounded-md text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-100 transition">
                              <Mail size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Corporate Achievements Banner */}
      {pencapaian.items && pencapaian.items.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8] text-white">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h3 className="text-2xl font-bold mb-2">{pencapaian.title}</h3>
            <p className="text-sm text-white/70 mb-12 max-w-xl mx-auto">
              {pencapaian.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pencapaian.items.map((it: any) => {
                const Icon = getIconComponent(it.icon);
                return (
                  <div
                    key={it.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-colors text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                        <Icon size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{it.title}</h4>
                      <p className="text-xs text-white/80 leading-relaxed">{it.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Good Corporate Governance */}
      {gcg.items && gcg.items.length > 0 && (
        <section className="py-16 bg-background border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">{gcg.title}</h3>
            <p className="text-sm text-muted-foreground mb-12 max-w-xl mx-auto">
              {gcg.subtitle}
            </p>

            <div className="space-y-4 max-w-2xl mx-auto text-left">
              {gcg.items.map((it: any) => {
                const Icon = getIconComponent(it.icon);
                return (
                  <div
                    key={it.id}
                    className="bg-muted/40 border border-border rounded-xl p-5 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-1">{it.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{it.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-[#F0F7FF] text-center">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          <h3 className="text-2xl font-bold text-foreground">
            {cta.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {cta.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={cta.primaryLink}
              className="px-6 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
            >
              {cta.primaryLabel}
            </Link>
            <Link
              to={cta.secondaryLink}
              className="px-6 py-2.5 bg-white border border-border text-foreground text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StrukturManajemen;
