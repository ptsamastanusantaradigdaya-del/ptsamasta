import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Users,
  Heart,
  BookOpen,
  ArrowLeft,
  Loader2,
  Sparkles,
  TrendingUp,
  Settings,
  Award,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Member = {
  id: string;
  slug: string;
  name: string;
  position: string;
  photo_url: string | null;
  bio: string | null;
  detail_content: string | null;
};

const renderMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );

const getSectionIconComponent = (key: string) => {
  switch (key) {
    case "briefcase":
      return Briefcase;
    case "education":
      return GraduationCap;
    case "users":
      return Users;
    case "heart":
      return Heart;
    case "sparkles":
      return Sparkles;
    case "trending":
      return TrendingUp;
    case "settings":
      return Settings;
    case "award":
      return Award;
    case "building":
      return Building2;
    case "shield":
      return ShieldCheck;
    default:
      return BookOpen;
  }
};

const parseDetailContent = (detailContent: string | null) => {
  const res = {
    badgeColor: "#1E3A8A",
    heroBgColor: "#1E3A8A",
    heroOverlay: "#1E3A8A",
    heroDeskripsi: "",
    jabatanProfesional: "",
    latarPendidikan: "",
    organisasi: "",
    kontribusi: "",
    highlights: [] as { id: string | number; label: string; isi: string; icon: string }[],
    // Direktur additional fields
    visiKepemimpinan: "",
    strategiBisnis: "",
    fokusPengembangan: "",
    targetPerusahaan: "",
    keahlian: [] as string[],
    portofolio: "",
    pengalaman: "",
    pendidikan: "",
    sertifikasi: "",
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
  // Fallback parse markdown
  const rawSections = detailContent.split(/(?=^## )/m);
  rawSections.forEach((s) => {
    const trimmed = s.trim();
    if (trimmed.startsWith("## ")) {
      const lines = trimmed.split("\n");
      const title = lines[0].replace(/^##\s*/, "").trim().toLowerCase();
      const content = lines.slice(1).join("\n").trim();
      if (title.includes("jabatan") || title.includes("pengalaman")) {
        res.jabatanProfesional = content;
      } else if (title.includes("pendidikan") || title.includes("latar belakang")) {
        res.latarPendidikan = content;
      } else if (title.includes("organisasi") || title.includes("kepemimpinan")) {
        res.organisasi = content;
      } else if (title.includes("kontribusi") || title.includes("nilai")) {
        res.kontribusi = content;
      }
    }
  });
  return res;
};

const LeadershipDetail = ({ slug }: { slug: string }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("struktur_manajemen")
      .select("id,slug,name,position,photo_url,bio,detail_content")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setMember(data);
          document.title = `${data.name} - ${data.position} - PT Samasta Nusantara Digdaya`;
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-20 text-center container mx-auto px-4">
        <p className="text-muted-foreground">Profil tidak ditemukan.</p>
        <Link to="/profil/struktur-manajemen" className="text-[#2563EB] underline mt-4 inline-block">
          Kembali ke Struktur Manajemen
        </Link>
      </div>
    );
  }

  const parsedDetail = parseDetailContent(member.detail_content);
  const themeColor = parsedDetail.heroBgColor || "#1E3A8A";
  const badgeColor = parsedDetail.badgeColor || themeColor;

  const sections: { title: string; content: string; iconKey: string }[] = [];

  // standard sections
  if (parsedDetail.jabatanProfesional) {
    sections.push({ title: "Jabatan & Pengalaman Profesional", content: parsedDetail.jabatanProfesional, iconKey: "briefcase" });
  }
  if (parsedDetail.latarPendidikan) {
    sections.push({ title: "Latar Belakang Pendidikan", content: parsedDetail.latarPendidikan, iconKey: "education" });
  }
  if (parsedDetail.organisasi) {
    sections.push({ title: "Organisasi & Kepemimpinan", content: parsedDetail.organisasi, iconKey: "users" });
  }
  if (parsedDetail.kontribusi) {
    sections.push({ title: "Kontribusi & Nilai yang Dibawa", content: parsedDetail.kontribusi, iconKey: "heart" });
  }

  // Direktur-only sections
  if (parsedDetail.visiKepemimpinan) {
    sections.push({ title: "Visi Kepemimpinan", content: parsedDetail.visiKepemimpinan, iconKey: "sparkles" });
  }
  if (parsedDetail.strategiBisnis) {
    sections.push({ title: "Strategi Bisnis", content: parsedDetail.strategiBisnis, iconKey: "trending" });
  }
  if (parsedDetail.fokusPengembangan) {
    sections.push({ title: "Fokus Pengembangan", content: parsedDetail.fokusPengembangan, iconKey: "settings" });
  }
  if (parsedDetail.targetPerusahaan) {
    sections.push({ title: "Target Perusahaan", content: parsedDetail.targetPerusahaan, iconKey: "award" });
  }
  if (parsedDetail.portofolio) {
    sections.push({ title: "Portofolio", content: parsedDetail.portofolio, iconKey: "building" });
  }
  if (parsedDetail.sertifikasi) {
    sections.push({ title: "Sertifikasi", content: parsedDetail.sertifikasi, iconKey: "shield" });
  }

  return (
    <div>
      {/* Hero */}
      <section
        style={{ backgroundColor: themeColor }}
        className="relative pt-24 pb-20 overflow-hidden text-white"
      >
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-8">
            <Link to="/" className="hover:text-amber-400 transition-colors">Beranda</Link>
            <span>&gt;</span>
            <Link to="/profil/tentang-kami" className="hover:text-amber-400 transition-colors">Profil</Link>
            <span>&gt;</span>
            <Link to="/profil/struktur-manajemen" className="hover:text-amber-400 transition-colors">Struktur Manajemen</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">{member.position}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left: sidebar card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center flex-shrink-0 w-64 border border-white/10">
              <div className="text-white/60 text-xs mb-3">Profil Kepemimpinan</div>
              <div className="w-40 h-40 rounded-xl mx-auto mb-4 overflow-hidden bg-white/20 flex items-center justify-center border-4 border-white/10">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <Users size={64} className="text-white/60" />
                )}
              </div>
              <h4 className="text-white font-bold text-sm leading-snug">{member.name}</h4>
              <span
                style={{ backgroundColor: badgeColor }}
                className="inline-block mt-3 text-white text-xs px-4 py-1.5 rounded-full font-medium"
              >
                {member.position}
              </span>
            </div>

            {/* Right: main info */}
            <div className="text-white flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-1">
                {member.name}
              </h2>
              <span className="text-white/70 text-sm font-medium">{member.position}</span>
              {(parsedDetail.heroDeskripsi || member.bio) && (
                <p className="text-white/80 text-sm leading-relaxed mt-4 max-w-xl whitespace-pre-wrap">
                  {parsedDetail.heroDeskripsi || member.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Dynamic Sections */}
      <div className="divide-y divide-border/60">
        {sections.map((sect, i) => {
          const Icon = getSectionIconComponent(sect.iconKey);
          const isEven = i % 2 === 1;
          return (
            <section key={sect.title} className={`py-12 ${isEven ? "bg-muted/40" : "bg-background"}`}>
              <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    style={{ backgroundColor: themeColor }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{sect.title}</h3>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
                  {sect.content.split("\n\n").map((para, idx) => {
                    if (para.trim().startsWith("-") || para.trim().startsWith("*")) {
                      const listItems = para
                        .split("\n")
                        .map((item) => item.replace(/^[-*]\s*/, "").trim())
                        .filter(Boolean);
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-2 ml-4">
                          {listItems.map((item, key) => (
                            <li key={key}>{renderMarkdown(item)}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{renderMarkdown(para)}</p>;
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Highlights Section */}
      {parsedDetail.highlights && parsedDetail.highlights.length > 0 && (
        <section style={{ backgroundColor: themeColor }} className="py-16 text-white border-t border-white/10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-xl font-bold text-center mb-10">Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parsedDetail.highlights.map((h: any, idx: number) => {
                const HighlightIcon = getSectionIconComponent(h.icon);
                return (
                  <div key={h.id || idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <HighlightIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{h.label}</h4>
                        <p className="text-xs text-white/80 leading-relaxed">{h.isi}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-muted text-center border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-xl font-bold text-foreground mb-3">
            Pelajari Lebih Lanjut tentang Tim Kami
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Lihat profil lengkap Dewan Komisaris dan Direksi PT Samasta Nusantara Digdaya
          </p>
          <Link
            to="/profil/struktur-manajemen"
            style={{ backgroundColor: themeColor }}
            className="inline-block px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Kembali ke Struktur Manajemen
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LeadershipDetail;
