import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Plus, Trash2, Image as ImageIcon, FileText, LayoutPanelTop, Quote, Calendar } from "lucide-react";
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

const SLUG = "sejarah";

interface RingkasanItem { id: number; label: string; value: string; desc: string }
interface KartuItem { id: number; nama: string; subjudul: string; deskripsi: string }
interface SejarahContent {
  hero: { breadcrumb: string; title: string; subtitle: string; overlay: string; image: string };
  sejarah: { title: string; body: string };
  ringkasan: RingkasanItem[];
  filosofiIntro: { title: string; subtitle: string };
  kartu: KartuItem[];
  ringkasanFilosofi: { title: string; body: string };
}

const defaults: SejarahContent = {
  hero: {
    breadcrumb: "Beranda > Profil > Sejarah",
    title: "Sejarah dan Filosofi Perusahaan",
    subtitle: "Landasan nilai dan perjalanan PT Samasta Nusantara Digdaya",
    overlay: "#1e3a8a",
    image: "",
  },
  sejarah: {
    title: "Sejarah PT Samasta Nusantara Digdaya",
    body: "PT Samasta Nusantara Digdaya didirikan sebagai respons atas kebutuhan akan entitas usaha nasional yang mampu menghadirkan solusi terintegrasi, profesional, dan berdaya saing dalam berbagai sektor strategis...",
  },
  ringkasan: [
    { id: 1, label: "Tahun Berdiri", value: "20 Juni 2022", desc: "Akta No. 40220622331106022B" },
    { id: 2, label: "Bidang Usaha", value: "Multi-Sektor", desc: "Pengolahan, Konstruksi, Perdagangan, Jasa" },
    { id: 3, label: "Fokus Bisnis", value: "Nasional", desc: "Pemerintah & Swasta" },
  ],
  filosofiIntro: {
    title: "Filosofi PT Samasta Nusantara Digdaya",
    subtitle: "Filosofi perusahaan berlandaskan pada makna dan nilai yang terkandung dalam nama PT Samasta Nusantara Digdaya sebagai identitas dan arah gerak usaha.",
  },
  kartu: [
    { id: 1, nama: "Samasta", subjudul: "(Menyeluruh dan Terintegrasi)", deskripsi: "Samasta bermakna menyeluruh dan terintegrasi..." },
    { id: 2, nama: "Nusantara", subjudul: "(Orientasi Nasional dan Kebangsaan)", deskripsi: "Nusantara merepresentasikan orientasi nasional..." },
    { id: 3, nama: "Digdaya", subjudul: "(Kekuatan dan Ketangguhan)", deskripsi: "Digdaya mencerminkan kekuatan, ketangguhan..." },
  ],
  ringkasanFilosofi: {
    title: "Ringkasan Filosofi",
    body: "Secara utuh, filosofi PT Samasta Nusantara Digdaya menegaskan tekad Perseroan untuk menjadi perusahaan nasional yang memiliki kapasitas menyeluruh, berdaya saing tinggi, dan berlandaskan integritas...",
  },
};

registerDefaults(SLUG, defaults);

type TimelineItem = { id: string; year: string; title: string; description: string };

export function SejarahPage() {
  const cms = useCmsPage<SejarahContent>(SLUG);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const c = cms.content;

  const patch = (mut: (d: SejarahContent) => void) =>
    cms.setContent((prev) => {
      const next: SejarahContent = JSON.parse(JSON.stringify((prev ?? defaults) as SejarahContent));
      mut(next);
      return next;
    });

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const { data, error } = await supabase
          .from("sejarah")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setTimeline(
          (data ?? []).map((t) => ({
            id: t.id,
            year: t.year || "",
            title: t.title || "",
            description: t.description || "",
          }))
        );
      } catch (e: any) {
        console.error("Gagal memuat timeline sejarah: " + e.message);
      } finally {
        setLoadingTimeline(false);
      }
    };
    void fetchTimeline();
  }, []);

  const handleSave = async () => {
    try {
      // 1. Save layouts to cms_pages
      await cms.save();

      // 2. Sync sejarah table
      const { data: existing } = await supabase.from("sejarah").select("id");
      const currentIds = timeline.map((t) => t.id);
      const toDelete = (existing ?? []).map((e) => e.id).filter((id) => !currentIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("sejarah").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }

      const upsertData = timeline.map((t, index) => ({
        id: t.id,
        year: t.year,
        title: t.title,
        description: t.description,
        sort_order: index,
      }));

      if (upsertData.length > 0) {
        const { error } = await supabase.from("sejarah").upsert(upsertData);
        if (error) throw error;
      }

      toast.success("Perubahan data sejarah berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data sejarah: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Kelola Halaman Sejarah"
      description="Atur konten halaman Sejarah pada website publik."
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
          <SectionCard title="Hero Section" description="Judul, subtitle, dan gambar utama" icon={<LayoutPanelTop className="h-5 w-5 text-blue-600" />}>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <Field label="Breadcrumb">
                  <Input value={c.hero.breadcrumb} onChange={(e) => patch((d) => { d.hero.breadcrumb = e.target.value; })} />
                </Field>
                <Field label="Judul Hero">
                  <Input value={c.hero.title} onChange={(e) => patch((d) => { d.hero.title = e.target.value; })} />
                </Field>
                <Field label="Subtitle">
                  <Textarea rows={2} value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} />
                </Field>
                <Field label="Warna Overlay">
                  <div className="flex gap-2">
                    <input type="color" value={c.hero.overlay} onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })} className="h-10 w-12 rounded border" />
                    <Input value={c.hero.overlay} onChange={(e) => patch((d) => { d.hero.overlay = e.target.value; })} />
                  </div>
                </Field>
              </div>
              <Field label="Gambar Hero">
                <UploadBox height="h-56" label="Upload gambar hero" value={c.hero.image} onChange={(url) => patch((d) => { d.hero.image = url ?? ""; })} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Sejarah Perusahaan" description="Narasi sejarah perusahaan" icon={<BookOpen className="h-5 w-5 text-blue-600" />}>
            <Field label="Judul Sejarah">
              <Input value={c.sejarah.title} onChange={(e) => patch((d) => { d.sejarah.title = e.target.value; })} />
            </Field>
            <Field label="Isi Sejarah" hint="Gunakan paragraf yang jelas.">
              <Textarea rows={10} value={c.sejarah.body} onChange={(e) => patch((d) => { d.sejarah.body = e.target.value; })} />
            </Field>
          </SectionCard>

          <SectionCard title="Timeline Sejarah" description="Kelola perjalanan sejarah per tahun" icon={<Calendar className="h-5 w-5 text-blue-600" />}>
            <div className="space-y-4">
              <AnimatePresence>
                {timeline.map((item, idx) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-lg border bg-slate-50/60 relative space-y-3">
                    <div className="grid md:grid-cols-[140px_1fr] gap-3">
                      <Field label="Tahun">
                        <Input value={item.year} onChange={(e) => setTimeline(prev => prev.map(x => x.id === item.id ? { ...x, year: e.target.value } : x))} />
                      </Field>
                      <Field label="Judul Peristiwa">
                        <Input value={item.title} onChange={(e) => setTimeline(prev => prev.map(x => x.id === item.id ? { ...x, title: e.target.value } : x))} />
                      </Field>
                    </div>
                    <Field label="Deskripsi Detail">
                      <Textarea rows={3} value={item.description} onChange={(e) => setTimeline(prev => prev.map(x => x.id === item.id ? { ...x, description: e.target.value } : x))} />
                    </Field>
                    <button onClick={() => setTimeline(prev => prev.filter(x => x.id !== item.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button variant="outline" onClick={() => setTimeline(prev => [...prev, { id: crypto.randomUUID(), year: "", title: "", description: "" }])} className="gap-2"><Plus className="h-4 w-4" /> Tambah Peristiwa</Button>
            </div>
          </SectionCard>

          <SectionCard title="Ringkasan Perusahaan" description="Tahun berdiri, bidang usaha, fokus bisnis" icon={<FileText className="h-5 w-5 text-blue-600" />}>
            <AnimatePresence>
              {c.ringkasan.map((r, i) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-3 gap-3 p-4 rounded-lg border bg-slate-50/60 relative">
                  <Field label="Label"><Input value={r.label} onChange={(e) => patch((d) => { d.ringkasan[i].label = e.target.value; })} /></Field>
                  <Field label="Nilai"><Input value={r.value} onChange={(e) => patch((d) => { d.ringkasan[i].value = e.target.value; })} /></Field>
                  <Field label="Deskripsi"><Input value={r.desc} onChange={(e) => patch((d) => { d.ringkasan[i].desc = e.target.value; })} /></Field>
                  <button onClick={() => patch((d) => { d.ringkasan.splice(i, 1); })} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="outline" onClick={() => patch((d) => { d.ringkasan.push({ id: Date.now(), label: "Label", value: "", desc: "" }); })} className="gap-2"><Plus className="h-4 w-4" /> Tambah Ringkasan</Button>
          </SectionCard>

          <SectionCard title="Filosofi Perusahaan" description="Judul dan deskripsi pengantar filosofi" icon={<Sparkles className="h-5 w-5 text-blue-600" />}>
            <Field label="Judul"><Input value={c.filosofiIntro.title} onChange={(e) => patch((d) => { d.filosofiIntro.title = e.target.value; })} /></Field>
            <Field label="Subtitle"><Textarea rows={3} value={c.filosofiIntro.subtitle} onChange={(e) => patch((d) => { d.filosofiIntro.subtitle = e.target.value; })} /></Field>
          </SectionCard>

          <SectionCard title="Kartu Filosofi" description="Samasta, Nusantara, Digdaya" icon={<ImageIcon className="h-5 w-5 text-blue-600" />}>
            <AnimatePresence>
              {c.kartu.map((k, i) => (
                <motion.div key={k.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 p-4 rounded-lg border bg-slate-50/60 relative">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Nama"><Input value={k.nama} onChange={(e) => patch((d) => { d.kartu[i].nama = e.target.value; })} /></Field>
                    <Field label="Sub-judul"><Input value={k.subjudul} onChange={(e) => patch((d) => { d.kartu[i].subjudul = e.target.value; })} /></Field>
                  </div>
                  <Field label="Deskripsi"><Textarea rows={4} value={k.deskripsi} onChange={(e) => patch((d) => { d.kartu[i].deskripsi = e.target.value; })} /></Field>
                  <button onClick={() => patch((d) => { d.kartu.splice(i, 1); })} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="outline" onClick={() => patch((d) => { d.kartu.push({ id: Date.now(), nama: "", subjudul: "", deskripsi: "" }); })} className="gap-2"><Plus className="h-4 w-4" /> Tambah Kartu Filosofi</Button>
          </SectionCard>

          <SectionCard title="Ringkasan Filosofi" description="Penegasan filosofi perusahaan" icon={<Quote className="h-5 w-5 text-blue-600" />}>
            <Field label="Judul"><Input value={c.ringkasanFilosofi.title} onChange={(e) => patch((d) => { d.ringkasanFilosofi.title = e.target.value; })} /></Field>
            <Field label="Isi"><Textarea rows={5} value={c.ringkasanFilosofi.body} onChange={(e) => patch((d) => { d.ringkasanFilosofi.body = e.target.value; })} /></Field>
          </SectionCard>
        </div>
      )}
    </CmsPageShell>
  );
}