import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, LayoutGrid, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, Leaf, GraduationCap, ShoppingCart, Sparkles, ExternalLink,
} from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG = "layanan";

const move = <T,>(a: T[], i: number, d: -1 | 1) => {
  const j = i + d; if (j < 0 || j >= a.length) return a;
  const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n;
};

const iconOpts = [
  { v: "leaf", Icon: Leaf }, { v: "grad", Icon: GraduationCap },
  { v: "cart", Icon: ShoppingCart }, { v: "spark", Icon: Sparkles },
];
const gradients = [
  { v: "green", c: "from-emerald-500 to-emerald-600" },
  { v: "blue", c: "from-blue-500 to-indigo-600" },
  { v: "orange", c: "from-orange-500 to-red-500" },
  { v: "purple", c: "from-fuchsia-500 to-pink-500" },
];

interface LayananCard {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
  warna: string;
  tombol: string;
  link: string;
  aktif: boolean;
}

interface LayananContent {
  hero: { judul: string; subtitle: string; overlay: string; backgroundUrl: string | null };
  section: { judul: string; deskripsi: string };
  cta: { aktif: boolean };
  cards: LayananCard[];
}

const defaults: LayananContent = {
  hero: {
    judul: "Layanan Kami",
    subtitle: "Solusi Terpadu Dalam Pelayanan One - Stop Solution Untuk Membangun Pertumbuhan Bisnis Secara Profesional Dan Berkelanjutan",
    overlay: "#1e3a8a",
    backgroundUrl: null,
  },
  section: {
    judul: "Bidang Usaha Kami",
    deskripsi: "PT Samasta Nusantara Digdaya menyediakan berbagai layanan terintegrasi untuk mendukung kebutuhan bisnis Anda dengan standar profesional dan kualitas terbaik",
  },
  cta: { aktif: false },
  cards: [
    { id: "pemeliharaan", nama: "Pemeliharaan, Perawatan, dan Pembuatan Lingkungan",
      deskripsi: "Layanan terpadu dalam perawatan taman, pembersihan gedung, dan manajemen kebersihan lingkungan untuk memastikan fasilitas Anda selalu dalam kondisi optimal dan nyaman.",
      icon: "leaf", warna: "green", tombol: "Lihat Detail Layanan", link: "/layanan/pemeliharaan", aktif: true },
    { id: "jasa-sdm", nama: "Jasa Profesional & Pengembangan SDM",
      deskripsi: "Solusi pelatihan berbasis kompetensi, sertifikasi profesi, konsultasi hukum, dan pendampingan teknis untuk meningkatkan kapasitas sumber daya manusia organisasi Anda.",
      icon: "grad", warna: "blue", tombol: "Lihat Detail Layanan", link: "/layanan/jasa-sdm", aktif: true },
    { id: "perdagangan", nama: "Pengolahan dan Perdagangan Besar",
      deskripsi: "Layanan distribusi dan perdagangan besar berbagai macam barang dengan sistem rantai pasok terkontrol, termasuk manufaktur konveksi untuk kebutuhan seragam dan atribut.",
      icon: "cart", warna: "orange", tombol: "Lihat Detail Layanan", link: "/layanan/perdagangan", aktif: true },
    { id: "event-organizer", nama: "Event Organizer, Kreatif & Media",
      deskripsi: "Penyelenggaraan event profesional (MICE), jasa desain komunikasi visual, dan layanan catering dalam satu koordinasi terpadu untuk memaksimalkan pengalaman acara Anda.",
      icon: "spark", warna: "purple", tombol: "Lihat Detail Layanan", link: "/layanan/event-organizer", aktif: true },
  ],
};

registerDefaults(SLUG, defaults);

export function LayananPage() {
  const cms = useCmsPage<LayananContent>(SLUG);
  const [loadingDb, setLoadingDb] = useState(true);
  const c = cms.content;

  const patch = (mut: (draft: LayananContent) => void) =>
    cms.setContent((prev) => {
      const base = (prev ?? defaults) as LayananContent;
      const next: LayananContent = JSON.parse(JSON.stringify(base));
      mut(next);
      return next;
    });

  // Fetch service_categories on mount/status ready
  useEffect(() => {
    if (cms.status === "ready" || cms.status === "empty") {
      const fetchCategories = async () => {
        try {
          const { data, error } = await supabase
            .from("service_categories")
            .select("*")
            .order("sort_order");
          if (error) throw error;
          console.log("[Service Card] Fetch Result - service_categories:", data);
          if (data && data.length > 0) {
            patch((d) => {
              d.cards = data.map((cat) => {
                const existing = d.cards.find((c) => c.id === cat.slug);
                return {
                  id: cat.slug,
                  nama: cat.name,
                  deskripsi: cat.short_description || "",
                  icon: cat.icon || "leaf",
                  warna: cat.color_theme || "green",
                  tombol: existing?.tombol || "Lihat Detail Layanan",
                  link: existing?.link || `/layanan/${cat.slug}`,
                  aktif: cat.is_active,
                };
              });
            });
          }
        } catch (e: any) {
          console.error("Gagal memuat kategori layanan: " + e.message);
        } finally {
          setLoadingDb(false);
        }
      };
      void fetchCategories();
    }
  }, [cms.status]);

  const handleSave = async () => {
    try {
      if (!c) return;
      console.log("[Service Card] Save Payload - cards:", c.cards);

      // 1. Save layouts to cms_pages
      await cms.save();

      // 2. Sync deletes in service_categories table
      const { data: existingCats } = await supabase.from("service_categories").select("slug");
      const currentSlugs = c.cards.map((card) => card.id);
      const toDeleteSlugs = (existingCats ?? []).map((cat) => cat.slug).filter((slug) => !currentSlugs.includes(slug));

      if (toDeleteSlugs.length > 0) {
        const { data: delRes, error: delErr } = await supabase
          .from("service_categories")
          .delete()
          .in("slug", toDeleteSlugs)
          .select();
        if (delErr) throw delErr;
        console.log("[Service Card] Delete - slugs:", toDeleteSlugs, "response:", delRes);
      }

      // 3. Upsert service_categories
      const upsertData = c.cards.map((card, idx) => ({
        slug: card.id,
        name: card.nama,
        short_description: card.deskripsi,
        icon: card.icon,
        color_theme: card.warna,
        sort_order: idx,
        is_active: card.aktif,
      }));

      const { data: saveRes, error } = await supabase
        .from("service_categories")
        .upsert(upsertData, { onConflict: "slug" })
        .select();
      if (error) throw error;
      console.log("[Service Card] Save Response - categories upsert result:", saveRes);

      toast.success("Halaman Layanan berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data layanan: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Kelola Halaman Layanan"
      description="Atur konten halaman utama Layanan. Edit detail tiap sub-layanan melalui sub-menu di sidebar."
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
        <div className="space-y-6 max-w-6xl">
        <SectionCard title="Hero Section" icon={<ImageIcon className="h-4 w-4 text-blue-600" />}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Judul Hero">
            <Input value={c.hero.judul} onChange={(e) => patch((d) => { d.hero.judul = e.target.value; })} />
          </Field>
          <Field label="Warna Overlay" hint="Hex / nama warna overlay di atas gambar">
            <Input type="color" value={c.hero.overlay} onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })} className="h-10 w-24 p-1" />
          </Field>
        </div>
        <Field label="Subtitle Hero">
          <Textarea rows={3} value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} />
        </Field>
        <Field label="Gambar Background">
          <UploadBox
            height="h-40"
            folder="layanan/hero"
            value={c.hero.backgroundUrl}
            onChange={(url) => patch((d) => { d.hero.backgroundUrl = url; })}
          />
        </Field>
      </SectionCard>

      <SectionCard title='Section "Bidang Usaha Kami"' icon={<LayoutGrid className="h-4 w-4 text-blue-600" />}>
        <Field label="Judul Section">
          <Input value={c.section.judul} onChange={(e) => patch((d) => { d.section.judul = e.target.value; })} />
        </Field>
        <Field label="Deskripsi Section">
          <Textarea rows={2} value={c.section.deskripsi} onChange={(e) => patch((d) => { d.section.deskripsi = e.target.value; })} />
        </Field>
      </SectionCard>

      <SectionCard title="Card Layanan" icon={<LayoutGrid className="h-4 w-4 text-blue-600" />}
        description="Atur card yang tampil pada halaman Layanan. Konten detail tiap layanan dikelola pada sub-menu masing-masing.">
        <AnimatePresence>
          {c.cards.map((card, i) => {
            const Icn = iconOpts.find((o) => o.v === card.icon)?.Icon ?? Leaf;
            const grad = gradients.find((g) => g.v === card.warna)?.c ?? "from-slate-400 to-slate-500";
            return (
              <motion.div key={card.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5 mt-1">
                    <button onClick={() => patch((d) => { d.cards = move(d.cards, i, -1); })}><ChevronUp className="h-4 w-4 text-slate-400" /></button>
                    <button onClick={() => patch((d) => { d.cards = move(d.cards, i, 1); })}><ChevronDown className="h-4 w-4 text-slate-400" /></button>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white shrink-0`}>
                    <Icn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
                    <Field label="Nama Layanan">
                      <Input value={card.nama} onChange={(e) => patch((d) => { d.cards[i].nama = e.target.value; })} />
                    </Field>
                    <Field label="Status">
                      <div className="flex items-center gap-2 h-9">
                        <Switch checked={card.aktif} onCheckedChange={(v) => patch((d) => { d.cards[i].aktif = v; })} />
                        <span className="text-xs text-slate-500">{card.aktif ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
                      </div>
                    </Field>
                    <Button size="sm" variant="ghost" onClick={() => patch((d) => { d.cards.splice(i, 1); })}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <Field label="Deskripsi Singkat">
                  <Textarea rows={2} value={card.deskripsi} onChange={(e) => patch((d) => { d.cards[i].deskripsi = e.target.value; })} />
                </Field>
                <div className="grid md:grid-cols-4 gap-3">
                  <Field label="Icon">
                    <div className="flex gap-1.5 items-center h-9">
                      {iconOpts.map((o) => (
                        <button key={o.v} onClick={() => patch((d) => { d.cards[i].icon = o.v; })}
                          className={`h-8 w-8 rounded-md border flex items-center justify-center ${card.icon === o.v ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500"}`}>
                          <o.Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Warna Card">
                    <div className="flex gap-1.5 items-center h-9">
                      {gradients.map((g) => (
                        <button key={g.v} onClick={() => patch((d) => { d.cards[i].warna = g.v; })}
                          className={`h-7 w-7 rounded-full bg-gradient-to-br ${g.c} ${card.warna === g.v ? "ring-2 ring-offset-2 ring-slate-900" : ""}`} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Teks Tombol">
                    <Input value={card.tombol} onChange={(e) => patch((d) => { d.cards[i].tombol = e.target.value; })} />
                  </Field>
                  <Field label="Link Detail">
                    <Input value={card.link} onChange={(e) => patch((d) => { d.cards[i].link = e.target.value; })} />
                  </Field>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <Button variant="outline" className="w-full"
          onClick={() => patch((d) => { d.cards.push({ id: String(Date.now()), nama: "", deskripsi: "", icon: "leaf", warna: "blue", tombol: "Lihat Detail Layanan", link: "/layanan/", aktif: true }); })}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Card Layanan
        </Button>
      </SectionCard>

      <SectionCard title="Section CTA Bawah" icon={<ExternalLink className="h-4 w-4 text-blue-600" />}
        description='Section CTA "Butuh layanan sesuai kebutuhan Anda?" dinonaktifkan secara default. Pengajuan dilakukan via Form Penawaran di tiap Ruang Lingkup.'>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Tampilkan Section CTA</p>
            <p className="text-xs text-slate-500">Nonaktifkan untuk menyembunyikan CTA dari halaman publik.</p>
          </div>
          <Switch checked={c.cta.aktif} onCheckedChange={(v) => patch((d) => { d.cta.aktif = v; })} />
        </div>
      </SectionCard>
        </div>
      )}
    </CmsPageShell>
  );
}