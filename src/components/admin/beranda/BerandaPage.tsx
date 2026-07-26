import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Menu,
  Handshake,
  Newspaper,
  Sparkles,
  Phone,
  Building2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Share2,
  MapPin,
  Mail,
  ListChecks,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard, Field } from "../tentang-kami/SectionCard";
import { UploadBox } from "../tentang-kami/UploadBox";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG = "beranda";

const SectionIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
    {children}
  </span>
);

const uid = () => crypto.randomUUID();

interface NavLink { id: number | string; label: string; url: string }
interface Partner { id: number | string; name: string; logoUrl: string | null }
interface Article { id: number | string; category: string; date: string; title: string; excerpt: string; coverUrl: string | null }
interface Feature { id: number | string; title: string; description: string; points: string[]; iconUrl: string | null }
interface SocialLink { id: number | string; platform: string; url: string }

interface BerandaContent {
  published: boolean;
  header: { logoUrl: string | null; brandName: string; nav: NavLink[] };
  hero: { headline: string; ctaText: string; ctaLink: string; backgroundUrl: string | null };
  mitra: { title: string; subtitle: string; partners: Partner[] };
  informasi: { title: string; description: string; viewAllText: string; viewAllLink: string; limitCount?: number };
  mengapa: { title: string; subtitle: string; description: string; features: Feature[] };
  cta: { title: string; description: string; primaryText: string; primaryLink: string; secondaryText: string; secondaryLink: string };
  footer: {
    logoUrl: string | null;
    description: string;
    quickLinks: NavLink[];
    address: string;
    phone: string;
    email: string;
    socials: SocialLink[];
    copyright: string;
  };
}

const defaults: BerandaContent = {
  published: true,
  header: {
    logoUrl: null,
    brandName: "PT Samasta Nusantara Digdaya",
    nav: [
      { id: 1, label: "Beranda", url: "/" },
      { id: 2, label: "Profil", url: "/profil" },
      { id: 3, label: "Layanan", url: "/layanan" },
      { id: 4, label: "Portofolio", url: "/portofolio" },
      { id: 5, label: "Berita", url: "/berita" },
      { id: 6, label: "Kontak", url: "/kontak" },
    ],
  },
  hero: {
    headline:
      "Solusi Terpadu Dalam Pelayanan\nOne - Stop Solution Untuk Membangun Pertumbuhan Bisnis Secara Profesional Dan Berkelanjutan",
    ctaText: "Pelajari Tentang Kami",
    ctaLink: "/tentang-kami",
    backgroundUrl: null,
  },
  mitra: {
    title: "Mitra Perusahaan",
    subtitle:
      "Dipercaya oleh berbagai platform pengadaan dan institusi terkemuka di Indonesia",
    partners: [
      { id: 1, name: "Amaimarket", logoUrl: null },
      { id: 2, name: "PaDI UMKM", logoUrl: null },
      { id: 3, name: "Bela Pengadaan", logoUrl: null },
      { id: 4, name: "SIPLah", logoUrl: null },
      { id: 5, name: "e-Catalogue", logoUrl: null },
    ],
  },
  informasi: {
    title: "Informasi Perusahaan",
    description:
      "Ketahui lebih jauh tentang Insight perusahaan kami dengan detail dipisah mengenai layanan kami secara detail. Dengan klaim kami yang jelas sebagai pelayanan terbaik, PT Samasta Nusantara Digdaya Terpercaya",
    viewAllText: "Lihat Semua Artikel",
    viewAllLink: "/berita",
    limitCount: 3,
  },
  mengapa: {
    title: "Mengapa Memilih Kami?",
    subtitle: "Spesialisasi Oleh PT Samasta Nusantara Digdaya",
    description:
      "Kami hadir sebagai mitra strategis yang menyediakan solusi bisnis terintegrasi dengan pendekatan one-stop solution. Dengan keahlian lintas sektor dan komitmen pada standar kualitas tertinggi, PT Samasta Nusantara Digdaya memberikan nilai tambah melalui sinergi layanan yang efisien, pendampingan profesional, dan inovasi berkelanjutan untuk mendukung pertumbuhan bisnis Anda.",
    features: [
      {
        id: 1,
        title: "Pendampingan Manajemen & Teknis Terpadu",
        description:
          "Kami memberikan jasa konsultasi dan pendampingan di setiap lini bisnis untuk meningkatkan efisiensi operasional klien, yang meliputi:",
        points: [
          "Konsultasi & Implementasi Legalitas",
          "Manajemen Kebersihan & Lingkungan",
          "Pendampingan Teknis Arsitektur",
        ],
        iconUrl: null,
      },
      {
        id: 2,
        title: "Pengembangan Kapasitas Sumber Daya Manusia (Capacity Building)",
        description:
          "Sebagai pemegang izin di bidang sertifikasi, kami fokus pada peningkatan kualitas SDM melalui:",
        points: [
          "Pelatihan Berbasis Kompetensi",
          "Sertifikasi Profesi Kolektif",
          "Pendampingan Sertifikasi Halal",
        ],
        iconUrl: null,
      },
      {
        id: 3,
        title: "Integrasi Solusi Kreatif & Operasional",
        description:
          "Kami menawarkan efisiensi melalui sinergi antar unit bisnis yang sulit ditemukan di perusahaan lain:",
        points: [
          "Satu Atap meliputi Event & MICE",
          "Rantai Pasok Manufaktur Terkontrol",
        ],
        iconUrl: null,
      },
      {
        id: 4,
        title: "Monitoring & Supervisi Berkelanjutan",
        description:
          "Kami melakukan supervisi berkelanjutan untuk semua aspek operasional yang dipercayakan kepada kami.",
        points: [],
        iconUrl: null,
      },
    ],
  },
  cta: {
    title: "Ingin Tahu Lebih Lanjut tentang Kami?",
    description:
      "Tim kami siap menjawab pertanyaan Anda dan membantu menemukan solusi terbaik untuk kebutuhan bisnis Anda.",
    primaryText: "Hubungi Tim Kami",
    primaryLink: "/kontak",
    secondaryText: "Lihat Layanan Kami",
    secondaryLink: "/layanan",
  },
  footer: {
    logoUrl: null,
    description:
      "Perusahaan jasa dan pengadaan terpercaya yang menyediakan berbagai layanan profesional untuk mendukung pertumbuhan bisnis UMKM, Startup, dan Perusahaan di Indonesia.",
    quickLinks: [
      { id: 1, label: "Profile Perusahaan", url: "/profil" },
      { id: 2, label: "Layanan", url: "/layanan" },
      { id: 3, label: "Portofolio", url: "/portofolio" },
      { id: 4, label: "Berita", url: "/berita" },
      { id: 5, label: "Kontak", url: "/kontak" },
    ],
    address:
      "Jl. Tegalan, RT.1/RW.3, Palmerah, Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta",
    phone: "+62 859-1397-4229",
    email: "info@snd.co.id",
    socials: [
      { id: 1, platform: "Instagram", url: "" },
      { id: 2, platform: "LinkedIn", url: "" },
    ],
    copyright: "© 2026 PT Samasta Nusantara Digdaya. All rights reserved.",
  },
};

registerDefaults(SLUG, defaults);

export function BerandaPage() {
  const cms = useCmsPage<BerandaContent>(SLUG);
  const [heroId, setHeroId] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const c = cms.content;

  const patch = (mut: (draft: BerandaContent) => void) =>
    cms.setContent((prev) => {
      const base = (prev ?? defaults) as BerandaContent;
      const next: BerandaContent = JSON.parse(JSON.stringify(base));
      mut(next);
      return next;
    });

  // Fetch structured content on mount/status change
  useEffect(() => {
    if (cms.status === "ready" || cms.status === "empty") {
      const fetchDb = async () => {
        try {
          // 1. Fetch hero settings
          const { data: heroData } = await supabase
            .from("home_hero")
            .select("*")
            .limit(1)
            .maybeSingle();
          if (heroData) {
            setHeroId(heroData.id);
            patch((d) => {
              d.hero.headline = heroData.title || "";
              d.hero.ctaText = heroData.cta_primary_label || "";
              d.hero.ctaLink = heroData.cta_primary_href || "";
              d.hero.backgroundUrl = heroData.image_url || "";
            });
          }

          // 2. Fetch why choose us cards
          const { data: whyData } = await supabase
            .from("why_choose_us")
            .select("*")
            .order("sort_order");
          if (whyData && whyData.length > 0) {
            patch((d) => {
              d.mengapa.features = whyData.map((w) => ({
                id: w.id as any,
                title: w.title,
                description: w.description || "",
                points: [],
                iconUrl: w.icon || "",
              }));
            });
          }

          // 3. Fetch partners for group_name = 'home'
          const { data: partnersData } = await supabase
            .from("partners")
            .select("*")
            .eq("group_name", "home")
            .order("sort_order");
          if (partnersData && partnersData.length > 0) {
            patch((d) => {
              d.mitra.partners = partnersData.map((p) => ({
                id: p.id as any,
                name: p.name,
                logoUrl: p.logo_url,
              }));
            });
          }
        } catch (e: any) {
          console.error("Gagal memuat data Beranda dari DB: " + e.message);
        } finally {
          setLoadingDb(false);
        }
      };
      void fetchDb();
    }
  }, [cms.status]);

  const handleSave = async () => {
    try {
      // 1. Save CMS layout configurations to cms_pages
      await cms.save();

      if (c) {
        // 2. Save home_hero table
        const heroPayload = {
          title: c.hero.headline,
          cta_primary_label: c.hero.ctaText,
          cta_primary_href: c.hero.ctaLink,
          image_url: c.hero.backgroundUrl || "",
          is_active: true,
        };

        if (heroId) {
          const { error } = await supabase.from("home_hero").update(heroPayload).eq("id", heroId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("home_hero")
            .insert([heroPayload])
            .select("id")
            .single();
          if (error) throw error;
          if (data) setHeroId(data.id);
        }

        // 3. Sync why_choose_us table
        const { data: existingWhy } = await supabase.from("why_choose_us").select("id");
        const currentWhyIds = c.mengapa.features.map((f) => f.id);
        const toDeleteWhy = (existingWhy ?? []).map((w) => w.id).filter((id) => !currentWhyIds.includes(id));

        if (toDeleteWhy.length > 0) {
          const { error: delWhyErr } = await supabase.from("why_choose_us").delete().in("id", toDeleteWhy);
          if (delWhyErr) throw delWhyErr;
        }

        const upsertWhyData = c.mengapa.features.map((f, idx) => {
          const idStr = String(f.id);
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);
          const finalId = isUuid ? idStr : crypto.randomUUID();
          return {
            id: finalId,
            title: f.title,
            description: f.description,
            icon: f.iconUrl || "Sparkles",
            sort_order: idx,
            is_active: true,
          };
        });

        if (upsertWhyData.length > 0) {
          const { error } = await supabase.from("why_choose_us").upsert(upsertWhyData);
          if (error) throw error;
        }

        // 4. Sync partners table for group_name = 'home'
        const { data: existingPartners } = await supabase
          .from("partners")
          .select("id")
          .eq("group_name", "home");
        const currentPartnerIds = c.mitra.partners.map((p) => p.id);
        const toDeletePartners = (existingPartners ?? []).map((p) => p.id).filter((id) => !currentPartnerIds.includes(id));

        if (toDeletePartners.length > 0) {
          const { error: delPartErr } = await supabase.from("partners").delete().in("id", toDeletePartners);
          if (delPartErr) throw delPartErr;
        }

        const upsertPartnersData = c.mitra.partners.map((p, idx) => {
          const idStr = String(p.id);
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);
          const finalId = isUuid ? idStr : crypto.randomUUID();
          return {
            id: finalId,
            name: p.name || "Partner",
            logo_url: p.logoUrl || "",
            group_name: "home",
            sort_order: idx,
            is_active: true,
          };
        });

        if (upsertPartnersData.length > 0) {
          const { error } = await supabase.from("partners").upsert(upsertPartnersData);
          if (error) throw error;
        }
      }

      toast.success("Halaman Beranda berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data Beranda: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Beranda (Home Page)"
      description="Kelola seluruh konten yang ditampilkan di halaman utama website publik"
      status={cms.status}
      error={cms.error}
      updatedAt={cms.updatedAt}
      saving={cms.saving}
      defaults={defaults}
      seed={cms.seed}
      save={handleSave}
      reload={cms.reload}
    >
      {c && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6 max-w-6xl"
        >
          {/* Header / Navigation */}
          <SectionCard
            title="Header & Navigasi"
            icon={<SectionIcon><Menu className="h-4 w-4" /></SectionIcon>}
            description="Logo dan menu navigasi yang tampil di bagian atas website"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Logo Website" hint="Rekomendasi: PNG transparan, 200x60px">
                <UploadBox
                  height="h-24"
                  label="Upload logo"
                  folder="beranda/header"
                  value={c.header.logoUrl}
                  onChange={(url) => patch((d) => { d.header.logoUrl = url; })}
                />
              </Field>
              <Field label="Nama Brand">
                <Input
                  value={c.header.brandName}
                  onChange={(e) => patch((d) => { d.header.brandName = e.target.value; })}
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LinkIcon className="h-4 w-4 text-blue-600" /> Menu Navigasi
                </div>
                <button
                  type="button"
                  onClick={() => patch((d) => { d.header.nav.push({ id: uid(), label: "", url: "" }); })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Tambah Menu
                </button>
              </div>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {c.header.nav.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center bg-slate-50/60 border border-slate-200 rounded-lg p-2.5"
                    >
                      <Input
                        value={item.label}
                        placeholder="Label menu"
                        onChange={(e) => patch((d) => { d.header.nav[i].label = e.target.value; })}
                      />
                      <Input
                        value={item.url}
                        placeholder="/url"
                        onChange={(e) => patch((d) => { d.header.nav[i].url = e.target.value; })}
                      />
                      <button
                        type="button"
                        onClick={() => patch((d) => { d.header.nav.splice(i, 1); })}
                        className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 justify-self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </SectionCard>

          {/* Hero */}
          <SectionCard
            title="Hero Section"
            icon={<SectionIcon><ImageIcon className="h-4 w-4" /></SectionIcon>}
            description="Banner utama dengan judul, deskripsi, dan tombol call-to-action"
          >
            <Field label="Headline Hero" hint="Gunakan format multi-baris seperti di Figma">
              <Textarea
                rows={4}
                value={c.hero.headline}
                onChange={(e) => patch((d) => { d.hero.headline = e.target.value; })}
              />
            </Field>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Teks Tombol CTA">
                <Input value={c.hero.ctaText} onChange={(e) => patch((d) => { d.hero.ctaText = e.target.value; })} />
              </Field>
              <Field label="Link Tombol CTA">
                <Input value={c.hero.ctaLink} onChange={(e) => patch((d) => { d.hero.ctaLink = e.target.value; })} />
              </Field>
            </div>
            <Field
              label="Background Image Hero"
              hint="Rekomendasi: 1920x900px, JPG/PNG. Akan ditampilkan dengan overlay biru."
            >
              <UploadBox
                height="h-48"
                folder="beranda/hero"
                value={c.hero.backgroundUrl}
                onChange={(url) => patch((d) => { d.hero.backgroundUrl = url; })}
              />
            </Field>
          </SectionCard>

          {/* Mitra */}
          <SectionCard
            title="Mitra Perusahaan"
            icon={<SectionIcon><Handshake className="h-4 w-4" /></SectionIcon>}
            description="Section logo partner yang dipercaya perusahaan"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Judul Section">
                <Input value={c.mitra.title} onChange={(e) => patch((d) => { d.mitra.title = e.target.value; })} />
              </Field>
              <Field label="Subtitle">
                <Input value={c.mitra.subtitle} onChange={(e) => patch((d) => { d.mitra.subtitle = e.target.value; })} />
              </Field>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-700">Logo Mitra</span>
              <button
                type="button"
                onClick={() => patch((d) => { d.mitra.partners.push({ id: uid(), name: "", logoUrl: null }); })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" /> Tambah Logo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {c.mitra.partners.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group space-y-2"
                  >
                    <UploadBox
                      height="h-20"
                      label="Logo"
                      hint=""
                      folder="beranda/partners"
                      value={p.logoUrl}
                      onChange={(url) => patch((d) => { d.mitra.partners[i].logoUrl = url; })}
                    />
                    <Input
                      value={p.name}
                      placeholder="Nama mitra"
                      className="h-9 text-sm"
                      onChange={(e) => patch((d) => { d.mitra.partners[i].name = e.target.value; })}
                    />
                    <button
                      onClick={() => patch((d) => { d.mitra.partners.splice(i, 1); })}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-full bg-red-500 text-white shadow"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* Informasi / Articles */}
          <SectionCard
            title="Informasi Perusahaan"
            icon={<SectionIcon><Newspaper className="h-4 w-4" /></SectionIcon>}
            description="Section heading dan 3 artikel pilihan yang tampil di homepage"
          >
            <Field label="Judul Section">
              <Input value={c.informasi.title} onChange={(e) => patch((d) => { d.informasi.title = e.target.value; })} />
            </Field>
            <Field label="Deskripsi Section">
              <Textarea rows={3} value={c.informasi.description} onChange={(e) => patch((d) => { d.informasi.description = e.target.value; })} />
            </Field>

            <Field label="Jumlah Berita yang Ditampilkan">
              <Input
                type="number"
                min={1}
                max={20}
                value={c.informasi.limitCount ?? 3}
                onChange={(e) => patch((d) => { d.informasi.limitCount = parseInt(e.target.value) || 3; })}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-5 pt-2">
              <Field label="Teks Tombol 'Lihat Semua Artikel'">
                <Input value={c.informasi.viewAllText} onChange={(e) => patch((d) => { d.informasi.viewAllText = e.target.value; })} />
              </Field>
              <Field label="Link Tombol">
                <Input value={c.informasi.viewAllLink} onChange={(e) => patch((d) => { d.informasi.viewAllLink = e.target.value; })} />
              </Field>
            </div>
          </SectionCard>

          {/* Mengapa */}
          <SectionCard
            title="Mengapa Memilih Kami"
            icon={<SectionIcon><Sparkles className="h-4 w-4" /></SectionIcon>}
            description="Section background biru berisi keunggulan perusahaan"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Judul Section">
                <Input value={c.mengapa.title} onChange={(e) => patch((d) => { d.mengapa.title = e.target.value; })} />
              </Field>
              <Field label="Subtitle">
                <Input value={c.mengapa.subtitle} onChange={(e) => patch((d) => { d.mengapa.subtitle = e.target.value; })} />
              </Field>
            </div>
            <Field label="Deskripsi Section">
              <Textarea rows={3} value={c.mengapa.description} onChange={(e) => patch((d) => { d.mengapa.description = e.target.value; })} />
            </Field>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-700">Kartu Keunggulan</span>
              <button
                type="button"
                onClick={() => patch((d) => { d.mengapa.features.push({ id: uid(), title: "", description: "", points: [], iconUrl: null }); })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" /> Tambah Kartu
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {c.mengapa.features.map((f, fi) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative bg-white border border-slate-200 rounded-xl p-4 space-y-3"
                  >
                    <button
                      onClick={() => patch((d) => { d.mengapa.features.splice(fi, 1); })}
                      className="absolute top-2 right-2 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-start gap-3">
                      <UploadBox
                        height="h-12"
                        className="w-12 shrink-0"
                        label=""
                        hint=""
                        folder="beranda/features"
                        value={f.iconUrl}
                        onChange={(url) => patch((d) => { d.mengapa.features[fi].iconUrl = url; })}
                      />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={f.title}
                          onChange={(e) => patch((d) => { d.mengapa.features[fi].title = e.target.value; })}
                          placeholder="Judul keunggulan"
                          className="font-semibold"
                        />
                      </div>
                    </div>
                    <Field label="Deskripsi">
                      <Textarea
                        value={f.description}
                        onChange={(e) => patch((d) => { d.mengapa.features[fi].description = e.target.value; })}
                        rows={3}
                      />
                    </Field>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <ListChecks className="h-3.5 w-3.5 text-blue-600" /> Poin Detail
                        </span>
                        <button
                          type="button"
                          onClick={() => patch((d) => { d.mengapa.features[fi].points.push(""); })}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Tambah Poin
                        </button>
                      </div>
                      <div className="space-y-2">
                        {f.points.map((pt, pi) => (
                          <div key={pi} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                            <Input
                              value={pt}
                              onChange={(e) => patch((d) => { d.mengapa.features[fi].points[pi] = e.target.value; })}
                              placeholder={`Poin ${pi + 1}`}
                              className="h-9 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => patch((d) => { d.mengapa.features[fi].points.splice(pi, 1); })}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* CTA */}
          <SectionCard
            title="Call-to-Action Bawah"
            icon={<SectionIcon><Phone className="h-4 w-4" /></SectionIcon>}
            description="Section ajakan kontak sebelum footer"
          >
            <Field label="Judul CTA">
              <Input value={c.cta.title} onChange={(e) => patch((d) => { d.cta.title = e.target.value; })} />
            </Field>
            <Field label="Deskripsi CTA">
              <Textarea rows={2} value={c.cta.description} onChange={(e) => patch((d) => { d.cta.description = e.target.value; })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-600 uppercase">Tombol Primary</p>
                <Field label="Teks Tombol">
                  <Input value={c.cta.primaryText} onChange={(e) => patch((d) => { d.cta.primaryText = e.target.value; })} />
                </Field>
                <Field label="Link">
                  <Input value={c.cta.primaryLink} onChange={(e) => patch((d) => { d.cta.primaryLink = e.target.value; })} />
                </Field>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-600 uppercase">Tombol Secondary</p>
                <Field label="Teks Tombol">
                  <Input value={c.cta.secondaryText} onChange={(e) => patch((d) => { d.cta.secondaryText = e.target.value; })} />
                </Field>
                <Field label="Link">
                  <Input value={c.cta.secondaryLink} onChange={(e) => patch((d) => { d.cta.secondaryLink = e.target.value; })} />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Footer */}
          <SectionCard
            title="Footer"
            icon={<SectionIcon><Building2 className="h-4 w-4" /></SectionIcon>}
            description="Informasi yang ditampilkan di footer halaman publik"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Logo Footer">
                <UploadBox
                  height="h-24"
                  label="Upload logo footer"
                  folder="beranda/footer"
                  value={c.footer.logoUrl}
                  onChange={(url) => patch((d) => { d.footer.logoUrl = url; })}
                />
              </Field>
              <Field label="Deskripsi Perusahaan (Footer)">
                <Textarea
                  rows={4}
                  value={c.footer.description}
                  onChange={(e) => patch((d) => { d.footer.description = e.target.value; })}
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LinkIcon className="h-4 w-4 text-blue-600" /> Tautan Cepat
                </div>
                <button
                  type="button"
                  onClick={() => patch((d) => { d.footer.quickLinks.push({ id: uid(), label: "", url: "" }); })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Tambah Tautan
                </button>
              </div>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {c.footer.quickLinks.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center bg-slate-50/60 border border-slate-200 rounded-lg p-2.5"
                    >
                      <Input
                        value={item.label}
                        placeholder="Label tautan"
                        onChange={(e) => patch((d) => { d.footer.quickLinks[i].label = e.target.value; })}
                      />
                      <Input
                        value={item.url}
                        placeholder="/url"
                        onChange={(e) => patch((d) => { d.footer.quickLinks[i].url = e.target.value; })}
                      />
                      <button
                        type="button"
                        onClick={() => patch((d) => { d.footer.quickLinks.splice(i, 1); })}
                        className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 justify-self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Alamat">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Textarea
                    rows={3}
                    className="pl-9"
                    value={c.footer.address}
                    onChange={(e) => patch((d) => { d.footer.address = e.target.value; })}
                  />
                </div>
              </Field>
              <Field label="Telepon">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input className="pl-9" value={c.footer.phone} onChange={(e) => patch((d) => { d.footer.phone = e.target.value; })} />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input className="pl-9" value={c.footer.email} onChange={(e) => patch((d) => { d.footer.email = e.target.value; })} />
                </div>
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Share2 className="h-4 w-4 text-blue-600" /> Media Sosial
                </div>
                <button
                  type="button"
                  onClick={() => patch((d) => { d.footer.socials.push({ id: uid(), platform: "", url: "" }); })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Tambah Sosial
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <AnimatePresence initial={false}>
                  {c.footer.socials.map((s, i) => (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center bg-slate-50/60 border border-slate-200 rounded-lg p-2.5"
                    >
                      <Input value={s.platform} placeholder="Platform" onChange={(e) => patch((d) => { d.footer.socials[i].platform = e.target.value; })} />
                      <Input value={s.url} placeholder="https://..." onChange={(e) => patch((d) => { d.footer.socials[i].url = e.target.value; })} />
                      <button
                        type="button"
                        onClick={() => patch((d) => { d.footer.socials.splice(i, 1); })}
                        className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <Field label="Copyright Text">
              <Input value={c.footer.copyright} onChange={(e) => patch((d) => { d.footer.copyright = e.target.value; })} />
            </Field>
          </SectionCard>
        </motion.div>
      )}
    </CmsPageShell>
  );
}