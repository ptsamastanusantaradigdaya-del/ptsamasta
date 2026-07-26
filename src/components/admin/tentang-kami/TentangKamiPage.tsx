import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Eye,
  Target,
  Plus,
  Trash2,
  Quote,
  Sparkles,
  Image as ImageIcon,
  Link2,
  Award,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard, Field } from "./SectionCard";
import { UploadBox } from "./UploadBox";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG = "tentang-kami";

const SectionIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
    {children}
  </span>
);

const VISI_ICONS = [
  { key: "award", label: "Award", Icon: Award },
  { key: "shield", label: "Shield", Icon: ShieldCheck },
  { key: "trending", label: "Trending", Icon: TrendingUp },
  { key: "sparkles", label: "Sparkles", Icon: Sparkles },
];

interface TentangKamiContent {
  breadcrumb: string[];
  hero: {
    title: string;
    subtitle: string;
    backgroundUrl: string | null;
    overlay: string;
  };
  partnerLogos: { id: number | string; name: string; logoUrl: string | null }[];
  profil: {
    badge: string;
    title: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    quote: string;
  };
  visiMisi: {
    title: string;
    tagline: string;
    pilarTitle: string;
    visi: string;
    highlights: { id: number | string; label: string; icon: string }[];
    misiIntro: string;
    misi: string[];
  };
}

const defaults: TentangKamiContent = {
  breadcrumb: ["Beranda", "Profil Perusahaan", "Tentang Kami"],
  hero: {
    title: "PT Samasta Nusantara Digdaya",
    subtitle: "Dipercaya oleh Platform Pengadaan Terkemuka",
    backgroundUrl: null,
    overlay: "#1e3a8a",
  },
  partnerLogos: [
    { id: "9ca426cf-06f1-4db8-8318-6323cfbe4b91", name: "Amaimarket", logoUrl: null },
    { id: "f5b026e6-c1eb-4752-9b22-ee594cb7bf4e", name: "PaDI UMKM", logoUrl: null },
    { id: "7ab529fa-6bbf-4127-99bc-3b4791dc089f", name: "Bela Pengadaan", logoUrl: null },
    { id: "37c95e1e-d4c3-4d43-9824-3486df81e592", name: "SIPLah", logoUrl: null },
    { id: "8e3cb265-d01d-4de6-91e8-6925de9c693a", name: "e-Catalogue", logoUrl: null },
    { id: "268f7b59-9944-4860-ae3b-b6f7cfab7f62", name: "LKPP", logoUrl: null },
  ],
  profil: {
    badge: "Profil Perusahaan",
    title: "Profil Perusahaan",
    p1: "PT SAMASTA NUSANTARA DIGDAYA berdiri sebagai entitas bisnis yang progresif dan multi-disiplin, berdedikasi penuh untuk menjadi garda terdepan dalam penyediaan solusi terintegrasi bagi berbagai sektor industri strategis di Indonesia, mencakup industri pengolahan, perdagangan besar, logistik, penyediaan jasa, serta aktivitas profesional dan teknis.",
    p2: "Didirikan berdasarkan hukum Negara Republik Indonesia dan berkedudukan di Kota Administrasi Jakarta Pusat, PT Samasta Nusantara Digdaya berkomitmen untuk menjalankan kegiatan usaha secara profesional dengan menerapkan standar operasional yang terukur, sistem manajemen yang adaptif, serta tata kelola perusahaan yang baik.",
    p3: "Dengan dukungan sumber daya manusia yang kompeten, jaringan kerja yang luas, serta portofolio bidang usaha yang beragam, PT Samasta Nusantara Digdaya hadir sebagai mitra strategis bagi sektor pemerintah maupun swasta.",
    p4: "Melalui komitmen tersebut, PT Samasta Nusantara Digdaya optimis dapat berkontribusi secara nyata dalam mendukung pembangunan nasional dan menciptakan dampak positif yang berkelanjutan bagi seluruh pemangku kepentingan.",
    quote:
      "Kami percaya bahwa manifestasi dari konsep One-Stop Solution yang efisien. Dengan dukungan tim ahli yang kompeten dan integritas yang tak tergoyahkan, kami tidak hanya menjanjikan layanan, tetapi kami memberikan jaminan bahwa setiap proyek yang dipercayakan kepada kami akan dikelola dengan standar operasional terbaik.",
  },
  visiMisi: {
    title: "Visi & Misi Kami",
    tagline:
      "Panduan strategis yang mengarahkan setiap langkah kami dalam melayani mitra bisnis",
    pilarTitle: "Pilar Visi",
    visi: "Menjadi perusahaan nasional yang unggul, terpercaya, dan berdaya saing tinggi dalam menyediakan solusi usaha terintegrasi yang berkelanjutan serta memberikan kontribusi nyata bagi pembangunan dan kemajuan Nusantara.",
    highlights: [
      { id: "a17ab56f-f5bf-4127-99bc-3b4791dc0a1a", label: "Unggul", icon: "award" },
      { id: "b37c951e-e4c3-4d43-9824-3486df81e2b2", label: "Terpercaya", icon: "shield" },
      { id: "c8e3cb65-e01d-4de6-91e8-6925de9c6c3c", label: "Berdaya Saing", icon: "trending" },
    ],
    misiIntro:
      "Dalam upaya mewujudkan visi besar perusahaan, PT Samasta Nusantara Digdaya berkomitmen untuk:",
    misi: [
      "Menyediakan produk dan layanan yang berkualitas tinggi melalui penerapan standar profesionalisme, efisiensi, dan kepatuhan terhadap peraturan perundang-undangan yang berlaku.",
      "Mengembangkan sistem kerja dan manajemen yang terintegrasi, adaptif, serta berorientasi pada peningkatan kinerja dan kepuasan pemangku kepentingan.",
      "Menjunjung tinggi nilai integritas, transparansi, dan akuntabilitas sebagai landasan utama dalam setiap aktivitas usaha.",
      "Membangun dan memperkuat kemitraan strategis dengan pemerintah, sektor swasta, dan pemangku kepentingan lainnya secara berkelanjutan.",
      "Meningkatkan kapasitas sumber daya manusia secara berkesinambungan guna mendukung daya saing dan keberlanjutan perusahaan.",
      "Memberikan nilai tambah dan dampak positif bagi masyarakat, lingkungan, serta pembangunan nasional.",
    ],
  },
};

registerDefaults(SLUG, defaults);

export function TentangKamiPage() {
  const cms = useCmsPage<TentangKamiContent>(SLUG);
  const [loadingDb, setLoadingDb] = useState(true);
  const [aboutRows, setAboutRows] = useState<any[]>([]);
  const c = cms.content;

  const patch = (mut: (draft: TentangKamiContent) => void) =>
    cms.setContent((prev) => {
      const base = (prev ?? defaults) as TentangKamiContent;
      const next: TentangKamiContent = JSON.parse(JSON.stringify(base));
      mut(next);
      return next;
    });

  useEffect(() => {
    if (cms.status === "ready" || cms.status === "empty") {
      const fetchDbData = async () => {
        try {
          // Fetch about_us rows
          const { data: aboutData } = await supabase.from("about_us").select("*");
          if (aboutData) {
            setAboutRows(aboutData);
            patch((d) => {
              const profilRow = aboutData.find((r) => r.section_key === "profil");
              if (profilRow && profilRow.body) {
                const paragraphs = profilRow.body.split("\n\n");
                d.profil.p1 = paragraphs[0] || "";
                d.profil.p2 = paragraphs[1] || "";
                d.profil.p3 = paragraphs[2] || "";
                d.profil.p4 = paragraphs[3] || "";
              }
              const quoteRow = aboutData.find((r) => r.section_key === "highlight");
              if (quoteRow && quoteRow.body) {
                d.profil.quote = quoteRow.body;
              }
              const visiRow = aboutData.find((r) => r.section_key === "visi");
              if (visiRow && visiRow.body) {
                d.visiMisi.visi = visiRow.body;
              }
              const misiRow = aboutData.find((r) => r.section_key === "misi");
              if (misiRow && misiRow.body) {
                d.visiMisi.misi = misiRow.body
                  .split("\n")
                  .map((line) => line.replace(/^-\s*/, ""))
                  .filter(Boolean);
              }
            });
          }

          // Fetch partner logos for group_name = 'tentang-kami'
          const { data: partnersData } = await supabase
            .from("partners")
            .select("*")
            .eq("group_name", "tentang-kami")
            .order("sort_order");
          if (partnersData && partnersData.length > 0) {
            patch((d) => {
              d.partnerLogos = partnersData.map((p) => ({
                id: p.id as any,
                name: p.name,
                logoUrl: p.logo_url,
              }));
            });
          }
        } catch (e: any) {
          console.error("Gagal memuat data Tentang Kami dari DB: " + e.message);
        } finally {
          setLoadingDb(false);
        }
      };
      void fetchDbData();
    }
  }, [cms.status]);

  const handleSave = async () => {
    try {
      if (c) {
        console.log("[TentangKami Hero] Payload Save:", JSON.stringify(c.hero, null, 2));
        console.log("[Vision Section] Payload Save - sectionTitle:", c.visiMisi.title);
        console.log("[Vision Section] Payload Save - pillarTitle:", c.visiMisi.pilarTitle);
      }
      // 1. Save CMS layout configurations to cms_pages
      await cms.save();

      if (c) {
        // 2. Save about_us table
        const payloadProfil = [
          c.profil.p1,
          c.profil.p2,
          c.profil.p3,
          c.profil.p4,
        ].filter(Boolean).join("\n\n");

        const payloadMisi = c.visiMisi.misi.map((m) => `- ${m}`).join("\n");

        const aboutUpdates = [
          { key: "profil", title: c.profil.title || "Profil Perusahaan", body: payloadProfil, order: 1 },
          { key: "highlight", title: "One-Stop Solution", body: c.profil.quote, order: 2 },
          { key: "visi", title: "Visi", body: c.visiMisi.visi, order: 3 },
          { key: "misi", title: "Misi", body: payloadMisi, order: 4 },
        ];

        for (const update of aboutUpdates) {
          const existingRow = aboutRows.find((r) => r.section_key === update.key);
          const rowPayload = {
            section_key: update.key,
            title: update.title,
            body: update.body,
            sort_order: update.order,
          };
          if (existingRow) {
            const { error: updErr } = await supabase.from("about_us").update(rowPayload).eq("id", existingRow.id);
            if (updErr) throw updErr;
          } else {
            const { error: insErr } = await supabase.from("about_us").insert([rowPayload]);
            if (insErr) throw insErr;
          }
        }

        // 3. Sync partners table for group_name = 'tentang-kami'
        const { data: existingPartners } = await supabase
          .from("partners")
          .select("id")
          .eq("group_name", "tentang-kami");
        const currentIds = c.partnerLogos.map((p) => p.id);
        const toDelete = (existingPartners ?? []).map((p) => p.id).filter((id) => !currentIds.includes(id));
        
        console.log("[TentangKamiPage:handleSave] Syncing partners...");
        console.log("[TentangKamiPage:handleSave] Current partner IDs in form:", currentIds);
        console.log("[TentangKamiPage:handleSave] Partner IDs to delete from DB:", toDelete);

        if (toDelete.length > 0) {
          const { error: deleteErr } = await supabase.from("partners").delete().in("id", toDelete);
          if (deleteErr) {
            console.error("[TentangKamiPage:handleSave] Delete partners failed:", deleteErr);
            throw deleteErr;
          }
        }

        const upsertPartnersData = c.partnerLogos.map((p, idx) => {
          const idStr = String(p.id);
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);
          const finalId = isUuid ? idStr : crypto.randomUUID();
          return {
            id: finalId,
            name: p.name || "Partner",
            logo_url: p.logoUrl || "",
            group_name: "tentang-kami",
            sort_order: idx,
            is_active: true,
          };
        });

        console.log("[TentangKamiPage:handleSave] Upserting partners data to DB:", JSON.parse(JSON.stringify(upsertPartnersData)));

        if (upsertPartnersData.length > 0) {
          const { data: upsertRes, error: upsertErr } = await supabase
            .from("partners")
            .upsert(upsertPartnersData)
            .select();
            
          console.log("[TentangKamiPage:handleSave] Upsert response:", { data: upsertRes, error: upsertErr });
          
          if (upsertErr) {
            console.error("[TentangKamiPage:handleSave] Upsert failed with error details:", {
              message: upsertErr.message,
              details: upsertErr.details,
              hint: upsertErr.hint,
              code: upsertErr.code
            });
            throw upsertErr;
          }
        }
      }

      toast.success("Halaman Tentang Kami berhasil disimpan");
    } catch (e: any) {
      console.error("[TentangKamiPage:handleSave] Exception during handleSave:", e);
      toast.error("Gagal menyimpan data Tentang Kami: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Tentang Kami"
      description="Kelola seluruh konten halaman Tentang Kami pada website publik PT Samasta Nusantara Digdaya"
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
          {/* Breadcrumb */}
          <SectionCard
            title="Breadcrumb"
            icon={<SectionIcon><Link2 className="h-4 w-4" /></SectionIcon>}
            description="Jejak navigasi yang ditampilkan di atas hero section"
          >
            <div className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {c.breadcrumb.map((crumb, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-1 py-1"
                  >
                    <input
                      value={crumb}
                      onChange={(e) =>
                        patch((d) => {
                          d.breadcrumb[i] = e.target.value;
                        })
                      }
                      placeholder="Label"
                      className="bg-transparent text-sm text-slate-700 outline-none w-32"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch((d) => {
                          d.breadcrumb.splice(i, 1);
                        })
                      }
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => patch((d) => d.breadcrumb.push(""))}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1 border border-dashed border-blue-300 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah
              </button>
            </div>
          </SectionCard>

          {/* Hero Section */}
          <SectionCard
            title="Hero Section"
            icon={<SectionIcon><ImageIcon className="h-4 w-4" /></SectionIcon>}
            description="Bagian paling atas halaman Tentang Kami di website publik"
          >
            <Field label="Judul Hero">
              <Input
                value={c.hero.title}
                onChange={(e) => patch((d) => { d.hero.title = e.target.value; })}
              />
            </Field>
            <Field label="Subtitle Hero (di atas logo partner)">
              <Input
                value={c.hero.subtitle}
                onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })}
              />
            </Field>
            <Field label="Background Image Hero" hint="Rekomendasi: 1920x600px, PNG/JPG">
              <UploadBox
                height="h-40"
                folder="tentang-kami/hero"
                value={c.hero.backgroundUrl}
                onChange={(url) => patch((d) => { d.hero.backgroundUrl = url; })}
              />
            </Field>
            <Field label="Overlay Color (Opasitas Biru)" hint="Warna overlay gradient di atas background image">
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={c.hero.overlay}
                  onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={c.hero.overlay}
                  onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })}
                  className="font-mono"
                />
              </div>
            </Field>
          </SectionCard>

          {/* Logo Partner */}
          <SectionCard
            title="Logo Partner / Client"
            description="Logo platform pengadaan yang ditampilkan di hero section"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {c.partnerLogos.map((logo, idx) => (
                  <motion.div
                    key={logo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group space-y-2"
                  >
                    <UploadBox
                      height="h-24"
                      label="Upload logo"
                      hint=""
                      folder="tentang-kami/partners"
                      value={logo.logoUrl}
                      onChange={(url) =>
                        patch((d) => { d.partnerLogos[idx].logoUrl = url; })
                      }
                    />
                    <Input
                      value={logo.name}
                      onChange={(e) =>
                        patch((d) => { d.partnerLogos[idx].name = e.target.value; })
                      }
                      placeholder="Nama partner"
                      className="text-sm h-9"
                    />
                    <button
                      onClick={() =>
                        patch((d) => { d.partnerLogos.splice(idx, 1); })
                      }
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                      aria-label="Hapus logo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() =>
                patch((d) => {
                  d.partnerLogos.push({ id: crypto.randomUUID(), name: "", logoUrl: null });
                })
              }
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Logo
            </button>
          </SectionCard>

          {/* Profil Perusahaan */}
          <SectionCard
            title="Profil Perusahaan"
            icon={<SectionIcon><Building2 className="h-4 w-4" /></SectionIcon>}
            description="Section narasi panjang perusahaan, lengkap dengan highlight quote di akhir"
          >
            <Field label="Badge Section" hint="Label kecil dengan icon di atas judul">
              <Input
                value={c.profil.badge}
                onChange={(e) => patch((d) => { d.profil.badge = e.target.value; })}
              />
            </Field>
            <Field label="Judul Section">
              <Input
                value={c.profil.title}
                onChange={(e) => patch((d) => { d.profil.title = e.target.value; })}
              />
            </Field>
            {(["p1", "p2", "p3", "p4"] as const).map((k, i) => (
              <Field
                key={k}
                label={`Paragraf ${i + 1}`}
              >
                <Textarea
                  rows={5}
                  value={c.profil[k]}
                  onChange={(e) => patch((d) => { d.profil[k] = e.target.value; })}
                />
              </Field>
            ))}
            <Field
              label="Highlight Quote"
              hint="Tampil sebagai kutipan italic dengan border biru di akhir section"
            >
              <div className="relative">
                <Quote className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Textarea
                  rows={4}
                  value={c.profil.quote}
                  onChange={(e) => patch((d) => { d.profil.quote = e.target.value; })}
                  className="pl-10 italic bg-blue-50/40 border-l-4 border-l-blue-500"
                />
              </div>
            </Field>
          </SectionCard>

          {/* Visi Misi */}
          <SectionCard
            title="Visi & Misi Kami"
            icon={<SectionIcon><Eye className="h-4 w-4" /></SectionIcon>}
            description="Section bertema biru di website publik berisi visi dan misi perusahaan"
          >
            <Field label="Judul Section">
              <Input
                value={c.visiMisi.title}
                onChange={(e) => patch((d) => { d.visiMisi.title = e.target.value; })}
              />
            </Field>
            <Field label="Tagline Visi & Misi">
              <Input
                value={c.visiMisi.tagline}
                onChange={(e) => patch((d) => { d.visiMisi.tagline = e.target.value; })}
              />
            </Field>
            <Field label="Judul Sub Section (Pilar Visi)">
              <Input
                value={c.visiMisi.pilarTitle || ""}
                onChange={(e) => patch((d) => { d.visiMisi.pilarTitle = e.target.value; })}
              />
            </Field>

            {/* Visi */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Eye className="h-4 w-4 text-blue-600" /> Visi
              </div>
              <Field label="Isi Visi">
                <Textarea
                  rows={4}
                  value={c.visiMisi.visi}
                  onChange={(e) => patch((d) => { d.visiMisi.visi = e.target.value; })}
                  className="bg-white"
                />
              </Field>

              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Pilar Visi (icon + label)
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      patch((d) => {
                        d.visiMisi.highlights.push({
                          id: crypto.randomUUID(),
                          label: "",
                          icon: "sparkles",
                        });
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AnimatePresence initial={false}>
                    {c.visiMisi.highlights.map((h, hi) => {
                      const ActiveIcon =
                        VISI_ICONS.find((v) => v.key === h.icon)?.Icon ?? Sparkles;
                      return (
                        <motion.div
                          key={h.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative group bg-white border border-slate-200 rounded-xl p-3 space-y-2"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              patch((d) => { d.visiMisi.highlights.splice(hi, 1); })
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 mx-auto">
                            <ActiveIcon className="h-5 w-5" />
                          </div>
                          <Input
                            value={h.label}
                            onChange={(e) =>
                              patch((d) => { d.visiMisi.highlights[hi].label = e.target.value; })
                            }
                            placeholder="Label pilar"
                            className="text-sm text-center"
                          />
                          <select
                            value={h.icon}
                            onChange={(e) =>
                              patch((d) => { d.visiMisi.highlights[hi].icon = e.target.value; })
                            }
                            className="w-full text-xs rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {VISI_ICONS.map((v) => (
                              <option key={v.key} value={v.key}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Misi */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Target className="h-4 w-4 text-blue-600" /> Misi
                </div>
                <button
                  type="button"
                  onClick={() => patch((d) => { d.visiMisi.misi.push(""); })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Tambah Misi
                </button>
              </div>

              <Field label="Intro Misi">
                <Textarea
                  rows={2}
                  value={c.visiMisi.misiIntro}
                  onChange={(e) => patch((d) => { d.visiMisi.misiIntro = e.target.value; })}
                  className="bg-white"
                />
              </Field>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {c.visiMisi.misi.map((m, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex gap-3 items-start bg-white border border-slate-200 rounded-lg p-3"
                    >
                      <div className="shrink-0 h-7 w-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mt-1">
                        {i + 1}
                      </div>
                      <Textarea
                        value={m}
                        onChange={(e) =>
                          patch((d) => { d.visiMisi.misi[i] = e.target.value; })
                        }
                        rows={3}
                        placeholder={`Poin misi ke-${i + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch((d) => { d.visiMisi.misi.splice(i, 1); })
                        }
                        className="shrink-0 p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}
    </CmsPageShell>
  );
}