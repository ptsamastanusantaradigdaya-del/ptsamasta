import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, ShieldCheck, FileText, Plus, Trash2, LayoutPanelTop, Award, Handshake } from "lucide-react";
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

const SLUG = "legalitas-perizinan";

interface Dokumen { id: string; nama: string; nomor: string; penerbit: string; tanggal: string; deskripsi: string; file: string; featured: boolean; is_active?: boolean }
interface Prinsip { id: number; judul: string; deskripsi: string; icon: string }
interface LegalitasContent {
  hero: { title: string; subtitle: string; overlay: string; image: string };
  komitmen: { title: string; p1: string; p2: string };
  dokumenIntro: { title: string; subtitle: string };
  dokumen: Dokumen[];
  prinsip: Prinsip[];
  komitmenLanjut: { title: string; body: string; badge: string };
  kepercayaan: { title: string; body: string };
}

const defaults: LegalitasContent = {
  hero: { title: "Legalitas & Perizinan Perusahaan", subtitle: "Komitmen terhadap regulasi dan standar operasional yang profesional dan akuntabel", overlay: "#1e3a8a", image: "" },
  komitmen: { title: "Komitmen Kepatuhan Hukum", p1: "PT Samasta Nusantara Digdaya beroperasi dengan komitmen penuh terhadap kepatuhan regulasi dan standar operasional yang berlaku di Indonesia...", p2: "Kami memastikan bahwa setiap layanan yang diberikan kepada mitra bisnis didukung oleh fondasi legal yang kuat, perizinan yang lengkap, dan tata kelola yang akuntabel." },
  dokumenIntro: { title: "Dokumen Legal & Perizinan", subtitle: "Legalitas perusahaan yang telah terdaftar dan disahkan oleh instansi berwenang" },
  dokumen: [],
  prinsip: [
    { id: 1, judul: "Kepatuhan Regulasi", deskripsi: "Memastikan seluruh operasional sesuai regulasi berlaku.", icon: "shield" },
    { id: 2, judul: "Aspek Legal Korporasi", deskripsi: "Pengelolaan aspek legal korporasi yang profesional.", icon: "scale" },
    { id: 3, judul: "Transparansi Administrasi", deskripsi: "Sistem administrasi dan dokumentasi yang transparan.", icon: "file" },
    { id: 4, judul: "Peningkatan Berkelanjutan", deskripsi: "Komitmen terhadap peningkatan standar operasional.", icon: "check" },
  ],
  komitmenLanjut: { title: "Komitmen Peningkatan Berkelanjutan", body: "PT Samasta Nusantara Digdaya terus berkomitmen untuk meningkatkan standar operasional melalui perolehan sertifikasi internasional yang relevan dengan bidang usaha...", badge: "Sertifikasi ISO dalam Proses" },
  kepercayaan: { title: "Kepercayaan Mitra Adalah Prioritas", body: "Kepatuhan terhadap aspek legal dan regulasi bukan hanya kewajiban, tetapi merupakan komitmen perusahaan dalam membangun kepercayaan dengan seluruh mitra bisnis..." },
};

registerDefaults(SLUG, defaults);

export function LegalitasPage() {
  const cms = useCmsPage<LegalitasContent>(SLUG);
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const c = cms.content;

  const patch = (mut: (d: LegalitasContent) => void) =>
    cms.setContent((prev) => {
      const next: LegalitasContent = JSON.parse(JSON.stringify((prev ?? defaults) as LegalitasContent));
      mut(next);
      return next;
    });

  useEffect(() => {
    const fetchList = async () => {
      try {
        // Load layout config first to check for preserved document details
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", SLUG)
          .maybeSingle();

        if (pageData && pageData.content && (pageData.content as any).dokumen && (pageData.content as any).dokumen.length > 0) {
          setDokumenList((pageData.content as any).dokumen);
        } else {
          // Fallback load from legalitas table
          const { data, error } = await supabase
            .from("legalitas")
            .select("*")
            .order("sort_order", { ascending: true });
          if (error) throw error;
          setDokumenList(
            (data ?? []).map((d) => ({
              id: d.id,
              nama: d.name || "",
              nomor: d.number || "",
              penerbit: d.issued_by || "",
              tanggal: d.issued_at || "",
              deskripsi: "",
              file: d.document_url || "",
              featured: d.thumbnail_url === "featured",
              is_active: true,
            }))
          );
        }
      } catch (e: any) {
        console.error("Gagal memuat dokumen legalitas: " + e.message);
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
        dokumen: dokumenList,
      };

      console.log("[Legalitas] Payload Save:", JSON.stringify({ cmsContent: finalContent, documents: dokumenList }, null, 2));

      // 1. Save layout config with documents array to cms_pages
      const { data: cmsRes, error: cmsErr } = await supabase
        .from("cms_pages")
        .update({ content: finalContent })
        .eq("slug", SLUG)
        .select();
      if (cmsErr) throw cmsErr;
      console.log("[Legalitas] Upsert Response - cms_pages:", cmsRes);

      // 2. Sync legalitas table
      const { data: existing } = await supabase.from("legalitas").select("id");
      const currentIds = dokumenList.map((d) => d.id);
      const toDelete = (existing ?? []).map((e) => e.id).filter((id) => !currentIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("legalitas").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }

      const upsertData = dokumenList.map((d, index) => ({
        id: d.id,
        name: d.nama,
        number: d.nomor,
        issued_by: d.penerbit,
        issued_at: d.tanggal,
        document_url: d.file,
        thumbnail_url: d.featured ? "featured" : "",
        sort_order: index,
      }));

      if (upsertData.length > 0) {
        const { data: dbRes, error: dbErr } = await supabase
          .from("legalitas")
          .upsert(upsertData)
          .select();
        if (dbErr) throw dbErr;
        console.log("[Legalitas] Upsert Response - legalitas table:", dbRes);
      }

      // 3. SELECT Verification
      const { data: verifyCms } = await supabase.from("cms_pages").select("content").eq("slug", SLUG).maybeSingle();
      const { data: verifyList } = await supabase.from("legalitas").select("*").order("sort_order", { ascending: true });
      console.log("[Legalitas] SELECT Verification - cms_pages:", verifyCms);
      console.log("[Legalitas] SELECT Verification - legalitas table:", verifyList);

      toast.success("Perubahan data legalitas berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data legalitas: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Kelola Halaman Legalitas & Perizinan"
      description="Atur dokumen legal, prinsip kepatuhan, dan komitmen perusahaan."
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

      <SectionCard title="Komitmen Kepatuhan Hukum" icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}>
        <Field label="Judul"><Input value={c.komitmen.title} onChange={(e) => patch((d) => { d.komitmen.title = e.target.value; })} /></Field>
        <Field label="Paragraf 1"><Textarea rows={4} value={c.komitmen.p1} onChange={(e) => patch((d) => { d.komitmen.p1 = e.target.value; })} /></Field>
        <Field label="Paragraf 2"><Textarea rows={3} value={c.komitmen.p2} onChange={(e) => patch((d) => { d.komitmen.p2 = e.target.value; })} /></Field>
      </SectionCard>

      <SectionCard title="Dokumen Legal & Perizinan" description="Daftar dokumen legal" icon={<ScrollText className="h-5 w-5 text-blue-600" />}>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Judul Section"><Input value={c.dokumenIntro.title} onChange={(e) => patch((d) => { d.dokumenIntro.title = e.target.value; })} /></Field>
          <Field label="Subtitle"><Input value={c.dokumenIntro.subtitle} onChange={(e) => patch((d) => { d.dokumenIntro.subtitle = e.target.value; })} /></Field>
        </div>
        <AnimatePresence>
          {dokumenList.map((dk, i) => (
            <motion.div key={dk.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-lg border bg-slate-50/60 space-y-3 relative">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Nama Dokumen"><Input value={dk.nama} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, nama: e.target.value } : x))} /></Field>
                <Field label="Nomor"><Input value={dk.nomor} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, nomor: e.target.value } : x))} /></Field>
                <Field label="Penerbit"><Input value={dk.penerbit} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, penerbit: e.target.value } : x))} /></Field>
                <Field label="Tanggal"><Input value={dk.tanggal} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, tanggal: e.target.value } : x))} /></Field>
              </div>
              <Field label="Deskripsi"><Textarea rows={3} value={dk.deskripsi} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, deskripsi: e.target.value } : x))} /></Field>
              <div className="grid md:grid-cols-2 gap-3 items-end">
                <Field label="File Dokumen / Preview">
                  <UploadBox height="h-24" folder={`legalitas/${dk.id}`} value={dk.file} onChange={(url) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, file: url ?? "" } : x))} />
                </Field>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={dk.featured} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, featured: e.target.checked } : x))} />
                    Tampilkan sebagai dokumen unggulan (preview besar)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={dk.is_active !== false} onChange={(e) => setDokumenList(prev => prev.map(x => x.id === dk.id ? { ...x, is_active: e.target.checked } : x))} />
                    Tampilkan di Website Publik (Status Aktif)
                  </label>
                </div>
              </div>
              <button onClick={() => setDokumenList(prev => prev.filter(x => x.id !== dk.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" onClick={() => setDokumenList(prev => [...prev, { id: crypto.randomUUID(), nama: "", nomor: "", penerbit: "", tanggal: "", deskripsi: "", file: "", featured: false, is_active: true }])} className="gap-2"><Plus className="h-4 w-4" /> Tambah Dokumen</Button>
      </SectionCard>

      <SectionCard title="Prinsip Kepatuhan Perusahaan" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <AnimatePresence>
          {c.prinsip.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-3 gap-3 p-4 rounded-lg border bg-slate-50/60 relative">
              <Field label="Icon"><Input value={p.icon} onChange={(e) => patch((d) => { d.prinsip[i].icon = e.target.value; })} /></Field>
              <Field label="Judul"><Input value={p.judul} onChange={(e) => patch((d) => { d.prinsip[i].judul = e.target.value; })} /></Field>
              <Field label="Deskripsi"><Input value={p.deskripsi} onChange={(e) => patch((d) => { d.prinsip[i].deskripsi = e.target.value; })} /></Field>
              <button onClick={() => patch((d) => { d.prinsip.splice(i, 1); })} className="absolute top-2 right-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" onClick={() => patch((d) => { d.prinsip.push({ id: Date.now(), judul: "", deskripsi: "", icon: "shield" }); })} className="gap-2"><Plus className="h-4 w-4" /> Tambah Prinsip</Button>
      </SectionCard>

      <SectionCard title="Komitmen Peningkatan Berkelanjutan" icon={<Award className="h-5 w-5 text-blue-600" />}>
        <Field label="Judul"><Input value={c.komitmenLanjut.title} onChange={(e) => patch((d) => { d.komitmenLanjut.title = e.target.value; })} /></Field>
        <Field label="Isi"><Textarea rows={4} value={c.komitmenLanjut.body} onChange={(e) => patch((d) => { d.komitmenLanjut.body = e.target.value; })} /></Field>
        <Field label="Badge Status"><Input value={c.komitmenLanjut.badge} onChange={(e) => patch((d) => { d.komitmenLanjut.badge = e.target.value; })} /></Field>
      </SectionCard>

      <SectionCard title="Kepercayaan Mitra" icon={<Handshake className="h-5 w-5 text-blue-600" />}>
        <Field label="Judul"><Input value={c.kepercayaan.title} onChange={(e) => patch((d) => { d.kepercayaan.title = e.target.value; })} /></Field>
        <Field label="Isi"><Textarea rows={4} value={c.kepercayaan.body} onChange={(e) => patch((d) => { d.kepercayaan.body = e.target.value; })} /></Field>
      </SectionCard>
        </div>
      )}
    </CmsPageShell>
  );
}