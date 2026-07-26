import { useEffect, useState } from "react";
import { BookOpen, Shield, Calendar, ListChecks, HelpCircle, FileText, ClipboardList, Settings, PenTool, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getIcon } from "@/lib/icons";

interface Item {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
}

interface KeunggulanContent {
  hero: { title: string; subtitle: string; overlay: string; image: string };
  deskripsi: { p1: string; p2: string };
  sopIntro: { title: string; subtitle: string };
  tujuan: string;
  ruangLingkup: { id: number; text: string }[];
  dasar: { id: number; text: string }[];
  prinsip: { id: number; text: string }[];
  prosedur: { id: number; title: string; items: { id: number; text: string }[] }[];
  dokumentasi: { id: number; text: string }[];
  penutup: string;
}

const defaults: KeunggulanContent = {
  hero: { 
    title: "Keunggulan PT Samasta Nusantara Digdaya", 
    subtitle: "Pendekatan terintegrasi yang memberikan nilai tambah optimal bagi pertumbuhan bisnis Anda", 
    overlay: "#1e3a8a", 
    image: "" 
  },
  deskripsi: { 
    p1: "PT Samasta Nusantara Digdaya menonjolkan diri sebagai perusahaan pengadaan barang dan jasa yang memiliki keunggulan komprehensif, didukung oleh jaringan luas, legalitas lengkap, dan komitmen pelayanan prima.", 
    p2: "Melalui pemahaman yang komprehensif terhadap karakteristik dan spesifikasi pekerjaan, PT Samasta Nusantara Digdaya hadir menawarkan solusi pengadaan yang efisien, transparan, dan profesional." 
  },
  sopIntro: { 
    title: "Standar Operasional Prosedur (SOP)", 
    subtitle: "Pedoman kerja standardisasi mutu pelayanan PT Samasta Nusantara Digdaya" 
  },
  tujuan: "SOP ini disusun sebagai pedoman kerja untuk memastikan seluruh kegiatan usaha yang dilakukan oleh PT Samasta Nusantara Digdaya berjalan secara profesional, terstruktur, efisien, sesuai ketentuan yang berlaku, serta berorientasi pada kualitas dan kepuasan klien sesuai dengan visi & misi Tata Kelola Perusahaan yang Baik (Good Corporate Governance).",
  ruangLingkup: [
    { id: 1, text: "Manajemen dan administrasi perusahaan" },
    { id: 2, text: "Pengadaan barang dan jasa" },
    { id: 3, text: "Pendamping mitra manajemen & teknis" },
    { id: 4, text: "Jasa profesional dan pengembangan SDM" },
    { id: 5, text: "Event, kreatif, dan media" },
    { id: 6, text: "Pemeliharaan & perawatan" },
    { id: 7, text: "Monitoring dan evaluasi kegiatan" },
  ],
  dasar: [
    { id: 1, text: "Peraturan perundang-undangan yang berlaku di Republik Indonesia" },
    { id: 2, text: "Anggaran Dasar dan Anggaran Rumah Tangga Perseroan" },
    { id: 3, text: "Prinsip-prinsip Good Corporate Governance (GCG)" },
    { id: 4, text: "Kebijakan internal perusahaan" },
  ],
  prinsip: [
    { id: 1, text: "Transparansi" },
    { id: 2, text: "Akuntabilitas" },
    { id: 3, text: "Profesionalisme" },
    { id: 4, text: "Efisiensi dan efektivitas" },
    { id: 5, text: "Kepatuhan hukum dan etika bisnis" },
  ],
  prosedur: [
    { id: 1, title: "SOP Perencanaan Kegiatan", items: [{ id: 1, text: "Setiap kegiatan diawali dengan perencanaan terperinci." }, { id: 2, text: "Penyusunan menyangkut tujuan, sasaran, jadwal, anggaran." }] },
    { id: 2, title: "SOP Pengadaan Barang dan Jasa", items: [{ id: 1, text: "Verifikasi kebutuhan dengan bagian terkait." }] },
    { id: 3, title: "SOP Pendamping Manajemen & Teknis", items: [{ id: 1, text: "Identifikasi kebutuhan pendampingan mitra." }] },
    { id: 4, title: "SOP Jasa Profesional & Pengembangan SDM", items: [{ id: 1, text: "Identifikasi kebutuhan keahlian." }] },
    { id: 5, title: "SOP Event, Kreatif & Media", items: [{ id: 1, text: "Penyusunan konsep dan rancangan event." }] },
    { id: 6, title: "SOP Pemeliharaan, Perawatan, dan Perbaikan Lingkungan", items: [{ id: 1, text: "Pengecekan rutin dan preventif." }] },
    { id: 7, title: "SOP Monitoring & Evaluasi", items: [{ id: 1, text: "Monitoring dilakukan terhadap setiap kegiatan." }] },
  ],
  dokumentasi: [
    { id: 1, text: "Seluruh kegiatan wajib didokumentasikan secara tertulis." },
    { id: 2, text: "Laporan disusun secara berkala (bulanan/triwulanan)." },
    { id: 3, text: "Dokumen disimpan secara sistematis dan terjaga kerahasiaannya." },
  ],
  penutup: "SOP ini disusun untuk menjadi acuan dalam menjalankan kegiatan usaha sehari-hari oleh seluruh jajaran PT Samasta Nusantara Digdaya. Setiap pelanggaran terhadap SOP ini akan dikenakan sanksi sesuai ketentuan perusahaan.",
};

const KeunggulanPage = () => {
  const [content, setContent] = useState<KeunggulanContent>(defaults);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load layout config
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "keunggulan")
          .maybeSingle();

        if (pageData && pageData.content) {
          const fetched = pageData.content as any;
          setContent({
            hero: { ...defaults.hero, ...fetched.hero },
            deskripsi: { ...defaults.deskripsi, ...fetched.deskripsi },
            sopIntro: { ...defaults.sopIntro, ...fetched.sopIntro },
            tujuan: fetched.tujuan || defaults.tujuan,
            ruangLingkup: fetched.ruangLingkup || defaults.ruangLingkup,
            dasar: fetched.dasar || defaults.dasar,
            prinsip: fetched.prinsip || defaults.prinsip,
            prosedur: fetched.prosedur || defaults.prosedur,
            dokumentasi: fetched.dokumentasi || defaults.dokumentasi,
            penutup: fetched.penutup || defaults.penutup,
          });
        }

        // Load advantages list
        const { data: advData } = await supabase
          .from("keunggulan")
          .select("id,title,description,icon,sort_order")
          .order("sort_order");

        if (advData) {
          setItems(advData ?? []);
        }
      } catch (e) {
        console.error("Gagal memuat data keunggulan:", e);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Memuat data...</div>;
  }

  return (
    <div className="space-y-16 py-12 bg-background">
      {/* 1. Deskripsi / Introduksi */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p>{content.deskripsi.p1}</p>
          {content.deskripsi.p2 && <p>{content.deskripsi.p2}</p>}
        </div>
      </section>

      {/* 2. Keunggulan Perusahaan List (Desain asli dipertahankan) */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Keunggulan Perusahaan
          </h2>
          <div className="space-y-6">
            {items.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={item.id} className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Standar Operasional Prosedur (SOP) Section */}
      <section className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/10 mb-4">
            <ClipboardList className="w-6 h-6 text-navy" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {content.sopIntro.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {content.sopIntro.subtitle}
          </p>
        </div>

        {/* SOP - Tujuan & Ruang Lingkup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-navy font-bold text-sm uppercase tracking-wide">
              <HelpCircle size={18} />
              <span>Tujuan SOP</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{content.tujuan}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-navy font-bold text-sm uppercase tracking-wide">
              <ListChecks size={18} />
              <span>Ruang Lingkup</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground list-inside list-disc">
              {content.ruangLingkup.map((rl) => (
                <li key={rl.id}>{rl.text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* SOP - Dasar Hukum & Prinsip Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-navy font-bold text-sm uppercase tracking-wide">
              <FileText size={18} />
              <span>Dasar Pelaksanaan</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground list-inside list-disc">
              {content.dasar.map((ds) => (
                <li key={ds.id}>{ds.text}</li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-navy font-bold text-sm uppercase tracking-wide">
              <Settings size={18} />
              <span>Prinsip Utama SOP</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground list-inside list-disc">
              {content.prinsip.map((pr) => (
                <li key={pr.id}>{pr.text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* SOP - Prosedur Kerja Utama */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-navy font-bold text-sm uppercase tracking-wide pb-4 border-b">
            <PenTool size={18} />
            <span>Prosedur Kerja Utama</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.prosedur.map((proc) => (
              <div key={proc.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-navy" />
                  {proc.title}
                </h4>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground list-inside list-decimal pl-1">
                  {proc.items.map((pi) => (
                    <li key={pi.id}>{pi.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* SOP - Dokumentasi & Penutup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-navy font-bold text-sm uppercase tracking-wide">
              <ClipboardList size={18} />
              <span>Dokumentasi Kegiatan</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground list-inside list-disc">
              {content.dokumentasi.map((doc) => (
                <li key={doc.id}>{doc.text}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1E3A8A] text-white rounded-xl p-6 shadow-sm flex items-center">
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wide border-b border-white/20 pb-2">Penutup</h4>
              <p className="text-[11px] text-white/80 leading-relaxed italic">{content.penutup}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KeunggulanPage;
