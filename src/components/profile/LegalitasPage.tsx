import { useEffect, useState } from "react";
import { ShieldCheck, ScrollText, FileText, Download, Award, Handshake, Scale, Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Dokumen {
  id: string;
  nama: string;
  nomor: string;
  penerbit: string;
  tanggal: string;
  deskripsi: string;
  file: string;
  featured: boolean;
}

interface LegalitasContent {
  hero: { title: string; subtitle: string; overlay: string; image: string };
  komitmen: { title: string; p1: string; p2: string };
  dokumenIntro: { title: string; subtitle: string };
  prinsip: { id: number; judul: string; deskripsi: string; icon: string }[];
  komitmenLanjut: { title: string; body: string; badge: string };
  kepercayaan: { title: string; body: string };
}

const defaults: LegalitasContent = {
  hero: { 
    title: "Legalitas & Perizinan Perusahaan", 
    subtitle: "Komitmen terhadap regulasi dan standar operasional yang profesional dan akuntabel", 
    overlay: "#1e3a8a", 
    image: "" 
  },
  komitmen: { 
    title: "Komitmen Kepatuhan Hukum", 
    p1: "PT Samasta Nusantara Digdaya beroperasi dengan komitmen penuh terhadap kepatuhan regulasi dan standar operasional yang berlaku di Indonesia. Kami berupaya menjaga integritas bisnis melalui pemenuhan legalitas korporasi secara menyeluruh.", 
    p2: "Kami memastikan bahwa setiap layanan yang diberikan kepada mitra bisnis didukung oleh fondasi legal yang kuat, perizinan yang lengkap, dan tata kelola yang akuntabel." 
  },
  dokumenIntro: { 
    title: "Dokumen Legal & Perizinan", 
    subtitle: "Legalitas perusahaan yang telah terdaftar dan disahkan oleh instansi berwenang" 
  },
  prinsip: [
    { id: 1, judul: "Kepatuhan Regulasi", deskripsi: "Memastikan seluruh operasional sesuai regulasi berlaku.", icon: "shield" },
    { id: 2, judul: "Aspek Legal Korporasi", deskripsi: "Pengelolaan aspek legal korporasi yang profesional.", icon: "scale" },
    { id: 3, judul: "Transparansi Administrasi", deskripsi: "Sistem administrasi dan dokumentasi yang transparan.", icon: "file" },
    { id: 4, judul: "Peningkatan Berkelanjutan", deskripsi: "Komitmen terhadap peningkatan standar operasional.", icon: "check" },
  ],
  komitmenLanjut: { 
    title: "Komitmen Peningkatan Berkelanjutan", 
    body: "PT Samasta Nusantara Digdaya terus berkomitmen untuk meningkatkan standar operasional melalui perolehan sertifikasi internasional yang relevan dengan bidang usaha guna memberikan kepuasan maksimal bagi pelanggan.", 
    badge: "Sertifikasi ISO dalam Proses" 
  },
  kepercayaan: { 
    title: "Kepercayaan Mitra Adalah Prioritas", 
    body: "Kepatuhan terhadap aspek legal dan regulasi bukan hanya kewajiban, tetapi merupakan komitmen perusahaan dalam membangun kepercayaan dengan seluruh mitra bisnis, klien, dan masyarakat." 
  },
};

const getIcon = (name: string) => {
  switch (name) {
    case "shield":
      return Shield;
    case "scale":
      return Scale;
    case "file":
      return FileText;
    case "check":
      return Check;
    default:
      return Shield;
  }
};

const LegalitasPage = () => {
  const [content, setContent] = useState<LegalitasContent>(defaults);
  const [documents, setDocuments] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load layout config
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "legalitas-perizinan")
          .maybeSingle();

        console.log("[Legalitas] Public Fetch Result:", pageData);

        if (pageData && pageData.content) {
          const contentData = pageData.content as any;
          setContent(contentData);
          if (contentData.dokumen) {
            setDocuments(contentData.dokumen);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data legalitas:", e);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  console.log("[Legalitas] Render Result - content:", content, "documents count:", documents.length);

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Memuat data...</div>;
  }

  const activeDocs = documents.filter((d) => d.is_active !== false);
  const featuredDocs = activeDocs.filter((d) => d.featured);
  const regularDocs = activeDocs.filter((d) => !d.featured);

  return (
    <div className="space-y-16 py-12 bg-background">
      {/* 1. Komitmen Kepatuhan Hukum */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/10">
              <ShieldCheck className="w-6 h-6 text-navy" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {content.komitmen.title}
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>{content.komitmen.p1}</p>
            <p>{content.komitmen.p2}</p>
          </div>
        </div>
      </section>

      {/* 2. Dokumen Unggulan & Daftar Dokumen */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/10 mb-4">
            <ScrollText className="w-6 h-6 text-navy" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {content.dokumenIntro.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {content.dokumenIntro.subtitle}
          </p>
        </div>

        {/* Featured Documents Grid */}
        {featuredDocs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {featuredDocs.map((doc) => (
              <div key={doc.id} className="bg-card border-2 border-navy/20 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-navy transition-colors duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-navy/10 text-navy uppercase">
                      Featured Document
                    </span>
                    {doc.tanggal && (
                      <span className="text-xs text-muted-foreground">{doc.tanggal}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base mb-1">{doc.nama}</h3>
                    <p className="text-xs text-muted-foreground font-mono">No: {doc.nomor}</p>
                    <p className="text-xs text-muted-foreground mt-1">Penerbit: {doc.penerbit}</p>
                  </div>
                  {doc.deskripsi && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-dashed">
                      {doc.deskripsi}
                    </p>
                  )}
                </div>
                {doc.file && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-navy hover:text-gold transition-colors"
                    >
                      <Download size={14} /> Lihat / Unduh Dokumen
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Regular Documents List/Grid */}
        {regularDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularDocs.map((doc) => (
              <div key={doc.id} className="bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-sm line-clamp-1">{doc.nama}</h4>
                  <p className="text-[11px] text-muted-foreground font-mono line-clamp-1">No: {doc.nomor}</p>
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <p>Penerbit: {doc.penerbit}</p>
                    {doc.tanggal && <p>Tanggal: {doc.tanggal}</p>}
                  </div>
                  {doc.deskripsi && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-dashed line-clamp-2">
                      {doc.deskripsi}
                    </p>
                  )}
                </div>
                {doc.file && (
                  <div className="mt-4 pt-3 border-t">
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-gold transition-colors"
                    >
                      <Download size={12} /> Unduh File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          featuredDocs.length === 0 && (
            <div className="text-center py-10 bg-muted/40 rounded-xl border border-dashed text-sm text-muted-foreground">
              Belum ada berkas dokumen legalitas yang diunggah.
            </div>
          )
        )}
      </section>

      {/* 3. Prinsip Kepatuhan Perusahaan */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {content.prinsip.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-navy/10 mb-3">
                  <IconComponent className="w-5 h-5 text-navy" />
                </div>
                <h4 className="font-bold text-foreground text-sm mb-1">{item.judul}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.deskripsi}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Komitmen Peningkatan Berkelanjutan & Kepercayaan */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1E3A8A] text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">{content.komitmenLanjut.title}</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{content.komitmenLanjut.body}</p>
            </div>
            {content.komitmenLanjut.badge && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                  {content.komitmenLanjut.badge}
                </span>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-navy" />
                <h3 className="font-bold text-base text-foreground">{content.kepercayaan.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{content.kepercayaan.body}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalitasPage;
