import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  LayoutPanelTop,
  Plus,
  Trash2,
  ListChecks,
  FileText,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG = "keunggulan";

type ListItem = { id: number; text: string };
type SopSection = { id: number; title: string; items: ListItem[] };
type Keunggulan = { id: string; judul: string; deskripsi: string; icon?: string; is_active?: boolean };
interface KeunggulanContent {
  hero: { title: string; subtitle: string; overlay: string; image: string };
  deskripsi: { p1: string; p2: string };
  keunggulan: Keunggulan[];
  sopIntro: { title: string; subtitle: string };
  tujuan: string;
  ruangLingkup: ListItem[];
  dasar: ListItem[];
  prinsip: ListItem[];
  prosedur: SopSection[];
  dokumentasi: ListItem[];
  penutup: string;
}

const defaults: KeunggulanContent = {
  hero: { title: "Keunggulan PT Samasta Nusantara Digdaya", subtitle: "Pendekatan terintegrasi yang memberikan nilai tambah optimal bagi pertumbuhan bisnis Anda", overlay: "#1e3a8a", image: "" },
  deskripsi: { p1: "PT Samasta Nusantara Digdaya menonjolkan diri sebagai perusahaan pengadaan barang dan jasa yang memiliki keunggulan komprehensif...", p2: "Melalui pemahaman yang komprehensif terhadap karakteristik dan spesifikasi pekerjaan, PT Samasta Nusantara Digdaya hadir menawarkan solusi pengadaan..." },
  keunggulan: [],
  sopIntro: { title: "Standar Operasional Prosedur (SOP)", subtitle: "PT Samasta Nusantara Digdaya" },
  tujuan: "SOP ini disusun sebagai pedoman kerja untuk memastikan seluruh kegiatan usaha yang dilakukan oleh PT Samasta Nusantara Digdaya berjalan secara profesional, terstruktur, efisien, sesuai ketentuan yang berlaku, serta berorientasi pada kualitas dan kepuasan klien sesuai dengan visi & misi Tata Kelola Perusahaan yang Baik (Good Corporate Governance).",
  ruangLingkup: [
    { id: 1, text: "Manajemen dan administrasi perusahaan" },
    { id: 2, text: "Pengadaan barang dan jasa" },
    { id: 3, text: "Pendamping mitra manajemen & teknis" },
    { id: 4, text: "Jasa profesional dan pengembangan SDM" },
    { id: 5, text: "Event, kreatif, dan media" },
    { id: 6, text: "Pemeliharaan & perawatan" },
    { id: 7, text: "Monitoring dan evaluasi kegiatan" },
    { id: 8, text: "Pemeliharaan rutin" },
  ],
  dasar: [
    { id: 1, text: "Peraturan perundang-undangan yang berlaku" },
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
    { id: 6, title: "SOP Pemeliharaan, Perawatan, dan Perbaikan Lingkungan", items: [{ id: 1, text: "Pengecekan rutin." }] },
    { id: 7, title: "SOP Monitoring & Evaluasi", items: [{ id: 1, text: "Monitoring dilakukan terhadap setiap kegiatan." }] },
  ],
  dokumentasi: [
    { id: 1, text: "Seluruh kegiatan wajib didokumentasikan secara tertulis." },
    { id: 2, text: "Laporan disusun secara berkala (bulanan/triwulanan)." },
    { id: 3, text: "Dokumen disimpan secara sistematis dan terjaga kerahasiaannya." },
  ],
  penutup: "SOP ini disusun untuk menjadi acuan dalam menjalankan kegiatan usaha sehari-hari oleh seluruh jajaran PT Samasta Nusantara Digdaya...",
};

registerDefaults(SLUG, defaults);

export function KeunggulanPage() {
  const cms = useCmsPage<KeunggulanContent>(SLUG);
  const [keunggulanList, setKeunggulanList] = useState<Keunggulan[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const c = cms.content;

  const patch = (mut: (d: KeunggulanContent) => void) =>
    cms.setContent((prev) => {
      const next: KeunggulanContent = JSON.parse(JSON.stringify((prev ?? defaults) as KeunggulanContent));
      mut(next);
      return next;
    });

  useEffect(() => {
    const fetchList = async () => {
      try {
        // Load layout config first to check for preserved advantages details
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", SLUG)
          .maybeSingle();

        if (pageData && pageData.content && (pageData.content as any).keunggulan && (pageData.content as any).keunggulan.length > 0) {
          setKeunggulanList((pageData.content as any).keunggulan);
        } else {
          // Fallback load from keunggulan table
          const { data, error } = await supabase
            .from("keunggulan")
            .select("*")
            .order("sort_order", { ascending: true });
          if (error) throw error;
          setKeunggulanList(
            (data ?? []).map((k) => ({
              id: k.id,
              judul: k.title || "",
              deskripsi: k.description || "",
              icon: k.icon || "Award",
              is_active: true,
            }))
          );
        }
      } catch (e: any) {
        console.error("Gagal memuat keunggulan: " + e.message);
      } finally {
        setLoadingList(false);
      }
    };
    void fetchList();
  }, []);

  const handleSave = async () => {
    try {
      const finalContent = {
        ...c,
        keunggulan: keunggulanList,
      };

      console.log("[Keunggulan] Payload Save:", JSON.stringify({ cmsContent: finalContent, keunggulanList }, null, 2));

      // 1. Save SOP and layouts with keunggulan list to cms_pages
      const { data: cmsRes, error: cmsErr } = await supabase
        .from("cms_pages")
        .update({ content: finalContent })
        .eq("slug", SLUG)
        .select();
      if (cmsErr) throw cmsErr;
      console.log("[Keunggulan] Upsert Response - cms_pages:", cmsRes);

      // 2. Sync keunggulan table
      const { data: existing } = await supabase.from("keunggulan").select("id");
      const currentIds = keunggulanList.map((k) => k.id);
      const toDelete = (existing ?? []).map((e) => e.id).filter((id) => !currentIds.includes(id));

      if (toDelete.length > 0) {
        await supabase.from("keunggulan").delete().in("id", toDelete);
      }

      const upsertData = keunggulanList.map((k, index) => ({
        id: k.id,
        title: k.judul,
        description: k.deskripsi,
        icon: k.icon || "Award",
        sort_order: index,
      }));

      if (upsertData.length > 0) {
        const { data: dbRes, error: dbErr } = await supabase
          .from("keunggulan")
          .upsert(upsertData)
          .select();
        if (dbErr) throw dbErr;
        console.log("[Keunggulan] Upsert Response - keunggulan table:", dbRes);
      }

      // 3. SELECT Verification
      const { data: verifyCms } = await supabase.from("cms_pages").select("content").eq("slug", SLUG).maybeSingle();
      const { data: verifyList } = await supabase.from("keunggulan").select("*").order("sort_order", { ascending: true });
      console.log("[Keunggulan] SELECT Verification - cms_pages:", verifyCms);
      console.log("[Keunggulan] SELECT Verification - keunggulan table:", verifyList);

      toast.success("Perubahan data keunggulan berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data keunggulan: " + e.message);
    }
  };

  const renderList = (label: string, items: ListItem[], mutate: (draft: KeunggulanContent) => ListItem[]) => {
    const moveItem = (i: number, direction: "up" | "down") => {
      const target = direction === "up" ? i - 1 : i + 1;
      if (target < 0 || target >= items.length) return;
      patch((d) => {
        const list = mutate(d);
        const temp = list[i];
        list[i] = list[target];
        list[target] = temp;
      });
    };

    return (
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((it, i) => (
            <motion.div key={it.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2 items-center">
              <div className="flex flex-col shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-slate-400 hover:text-slate-600"
                  type="button"
                  onClick={() => moveItem(i, "up")}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-slate-400 hover:text-slate-600"
                  type="button"
                  onClick={() => moveItem(i, "down")}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <Input value={it.text} onChange={(e) => patch((d) => { mutate(d)[i].text = e.target.value; })} />
              <button onClick={() => patch((d) => { mutate(d).splice(i, 1); })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={() => patch((d) => { mutate(d).push({ id: Date.now(), text: "" }); })} className="gap-2"><Plus className="h-3.5 w-3.5" /> Tambah {label}</Button>
      </div>
    );
  };

  const [searchTerm, setSearchTerm] = useState("");

  const moveKeunggulan = (i: number, direction: "up" | "down") => {
    const target = direction === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= keunggulanList.length) return;
    setKeunggulanList((prev) => {
      const next = [...prev];
      const temp = next[i];
      next[i] = next[target];
      next[target] = temp;
      return next;
    });
  };

  return (
    <CmsPageShell
      title="Kelola Halaman Keunggulan"
      description="Atur konten keunggulan dan SOP perusahaan."
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
      <SectionCard title="Hero Section" icon={<LayoutPanelTop className="h-5 w-5 text-blue-600" />}>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <Field label="Judul"><Input value={c.hero.title} onChange={(e) => patch((d) => { d.hero.title = e.target.value; })} /></Field>
            <Field label="Subtitle"><Textarea rows={2} value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} /></Field>
            <Field label="Warna Overlay">
              <div className="flex gap-2">
                <input type="color" value={c.hero.overlay} onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })} className="h-10 w-12 rounded border" />
                <Input value={c.hero.overlay} onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })} />
              </div>
            </Field>
          </div>
          <Field label="Gambar Hero"><UploadBox height="h-56" value={c.hero.image} onChange={(url) => patch((d) => { d.hero.image = url ?? ""; })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Deskripsi Keunggulan" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <Field label="Paragraf 1"><Textarea rows={4} value={c.deskripsi.p1} onChange={(e) => patch((d) => { d.deskripsi.p1 = e.target.value; })} /></Field>
        <Field label="Paragraf 2"><Textarea rows={4} value={c.deskripsi.p2} onChange={(e) => patch((d) => { d.deskripsi.p2 = e.target.value; })} /></Field>
      </SectionCard>

      {/* Search Bar for Keunggulan list */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari keunggulan berdasarkan judul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50/50"
          />
        </div>
      </div>

      <SectionCard title="Daftar Keunggulan" description="Kartu keunggulan perusahaan" icon={<Award className="h-5 w-5 text-blue-600" />}>
        <AnimatePresence>
          {keunggulanList
            .filter((k) => k.judul.toLowerCase().includes(searchTerm.toLowerCase()) || k.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((k, i) => (
              <motion.div key={k.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-lg border bg-slate-50/60 relative space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-slate-400 hover:text-slate-600"
                      onClick={() => moveKeunggulan(i, "up")}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-slate-400 hover:text-slate-600"
                      onClick={() => moveKeunggulan(i, "down")}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">No. {i + 1}</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={k.is_active !== false}
                      onChange={(e) => setKeunggulanList(prev => prev.map(x => x.id === k.id ? { ...x, is_active: e.target.checked } : x))}
                      className="h-3.5 w-3.5 rounded border-slate-200 text-blue-600 cursor-pointer"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
                <div className="grid md:grid-cols-[140px_1fr] gap-3">
                  <Field label="Icon">
                    <Input value={k.icon} onChange={(e) => setKeunggulanList(prev => prev.map(x => x.id === k.id ? { ...x, icon: e.target.value } : x))} />
                  </Field>
                  <Field label="Judul">
                    <Input value={k.judul} onChange={(e) => setKeunggulanList(prev => prev.map(x => x.id === k.id ? { ...x, judul: e.target.value } : x))} />
                  </Field>
                </div>
                <Field label="Deskripsi"><Textarea rows={3} value={k.deskripsi} onChange={(e) => setKeunggulanList(prev => prev.map(x => x.id === k.id ? { ...x, deskripsi: e.target.value } : x))} /></Field>
                <button onClick={() => setKeunggulanList(prev => prev.filter(x => x.id !== k.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </motion.div>
            ))}
        </AnimatePresence>
        <Button variant="outline" onClick={() => setKeunggulanList(prev => [...prev, { id: crypto.randomUUID(), judul: "", deskripsi: "", icon: "Award", is_active: true }])} className="gap-2"><Plus className="h-4 w-4" /> Tambah Keunggulan</Button>
      </SectionCard>

      <SectionCard title="SOP — Pengantar" icon={<ListChecks className="h-5 w-5 text-blue-600" />}>
        <Field label="Judul"><Input value={c.sopIntro.title} onChange={(e) => patch((d) => { d.sopIntro.title = e.target.value; })} /></Field>
        <Field label="Subtitle"><Input value={c.sopIntro.subtitle} onChange={(e) => patch((d) => { d.sopIntro.subtitle = e.target.value; })} /></Field>
      </SectionCard>

      <SectionCard title="I. Tujuan">
        <Field label="Isi Tujuan"><Textarea rows={5} value={c.tujuan} onChange={(e) => patch((d) => { d.tujuan = e.target.value; })} /></Field>
      </SectionCard>

      <SectionCard title="II. Ruang Lingkup">{renderList("Item", c.ruangLingkup, (d) => d.ruangLingkup)}</SectionCard>
      <SectionCard title="III. Dasar Pelaksanaan">{renderList("Dasar", c.dasar, (d) => d.dasar)}</SectionCard>
      <SectionCard title="IV. Prinsip Umum Pelaksanaan">{renderList("Prinsip", c.prinsip, (d) => d.prinsip)}</SectionCard>

      <SectionCard title="V. Prosedur Operasional" description="Setiap sub-SOP berisi langkah-langkah pelaksanaan">
        <AnimatePresence>
          {c.prosedur.map((s, i) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-lg border bg-slate-50/60 relative space-y-3">
              <Field label={`Sub-SOP ${i + 1}`}><Input value={s.title} onChange={(e) => patch((d) => { d.prosedur[i].title = e.target.value; })} /></Field>
              {renderList("Langkah", s.items, (d) => d.prosedur[i].items)}
              <button onClick={() => patch((d) => { d.prosedur.splice(i, 1); })} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" onClick={() => patch((d) => { d.prosedur.push({ id: Date.now(), title: "", items: [] }); })} className="gap-2"><Plus className="h-4 w-4" /> Tambah Sub-SOP</Button>
      </SectionCard>

      <SectionCard title="VI. Dokumentasi & Pelaporan">{renderList("Poin", c.dokumentasi, (d) => d.dokumentasi)}</SectionCard>

      <SectionCard title="VII. Penutup">
        <Field label="Isi Penutup"><Textarea rows={4} value={c.penutup} onChange={(e) => patch((d) => { d.penutup = e.target.value; })} /></Field>
      </SectionCard>
        </div>
      )}
    </CmsPageShell>
  );
}