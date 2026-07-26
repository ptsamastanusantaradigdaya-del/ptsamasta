import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Newspaper, Image as ImageIcon, ChevronUp, ChevronDown, Save } from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const upd = <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) =>
  arr.map((x) => (x.id === id ? { ...x, ...patch } : x));
const rm = <T extends { id: string }>(arr: T[], id: string) => arr.filter((x) => x.id !== id);
const nid = () => crypto.randomUUID();
const move = <T,>(arr: T[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; return n;
};

type Artikel = {
  id: string; kategori: string; judul: string; thumbnail: string;
  tanggal: string; waktuBaca: string; ringkasan: string; konten: string;
  tombolText: string; status: "draft" | "publish";
};

export function BeritaPage() {
  const [hero, setHero] = useState({ judul: "Berita & Artikel" });
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load hero setting from cms_pages
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "berita")
          .maybeSingle();
        if (pageData && pageData.content && typeof pageData.content === "object") {
          const content = pageData.content as any;
          if (content.hero) setHero(content.hero);
        }

        // Load articles
        const { data: articles, error } = await supabase
          .from("articles")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setArtikel(
          (articles ?? []).map((a) => ({
            id: a.id,
            kategori: a.category || "",
            judul: a.title || "",
            thumbnail: a.thumbnail_url || "",
            tanggal: a.published_at ? a.published_at.split("T")[0] : "",
            waktuBaca: "", // Not stored explicitly in public web
            ringkasan: a.excerpt || "",
            konten: a.content || "",
            tombolText: "Baca Selengkapnya",
            status: a.is_published ? "publish" : "draft",
          }))
        );
      } catch (e: any) {
        toast.error("Gagal memuat data: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const patchA = (id: string, patch: Partial<Artikel>) => setArtikel((a) => upd(a, id, patch));

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Hero to cms_pages
      const { error: heroErr } = await supabase.from("cms_pages").upsert({
        slug: "berita",
        content: { hero } as any,
      }, { onConflict: "slug" });
      if (heroErr) throw heroErr;

      // 2. Sync Articles table
      const { data: existing } = await supabase.from("articles").select("id");
      const currentIds = artikel.map((a) => a.id);
      const toDelete = (existing ?? []).map((e) => e.id).filter((id) => !currentIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("articles").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }

      // Upsert current articles
      const upsertData = artikel.map((a, index) => {
        const slug = a.judul
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        return {
          id: a.id,
          title: a.judul,
          slug: slug || "artikel-" + a.id.slice(0, 8),
          excerpt: a.ringkasan,
          content: a.konten,
          category: a.kategori,
          thumbnail_url: a.thumbnail,
          published_at: a.tanggal ? new Date(a.tanggal).toISOString() : new Date().toISOString(),
          is_published: a.status === "publish",
          sort_order: index,
        };
      });

      if (upsertData.length > 0) {
        const { error } = await supabase.from("articles").upsert(upsertData);
        if (error) throw error;
      }

      toast.success("Perubahan berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan perubahan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
  }

  return (
    <div className="space-y-6 pb-28">
      <header>
        <p className="text-xs text-slate-500">Beranda / Berita</p>
        <h1 className="text-2xl font-semibold text-slate-900">Kelola Halaman Berita</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola artikel berita dan publikasi.</p>
      </header>

      <SectionCard title="Hero Section" icon={<ImageIcon className="h-4 w-4 text-blue-600" />}>
        <Field label="Judul Hero">
          <Input value={hero.judul} onChange={(e) => setHero(prev => ({ ...prev, judul: e.target.value }))} />
        </Field>
        <Field label="Subtitle Hero">
          <Input value={hero.subtitle || ""} onChange={(e) => setHero(prev => ({ ...prev, subtitle: e.target.value }))} />
        </Field>
        <Field label="Gambar Hero">
          <UploadBox height="h-40" folder="berita/hero" value={hero.gambar || ""} onChange={(url) => setHero(prev => ({ ...prev, gambar: url ?? "" }))} />
        </Field>
      </SectionCard>

      <SectionCard title="Daftar Artikel" icon={<Newspaper className="h-4 w-4 text-blue-600" />}
        description="Tambah, ubah, atur urutan, dan publikasikan artikel.">
        <AnimatePresence>
          {artikel.map((a, i) => (
            <motion.div key={a.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5 mt-1">
                  <button onClick={() => setArtikel(move(artikel, i, -1))}><ChevronUp className="h-4 w-4 text-slate-400" /></button>
                  <button onClick={() => setArtikel(move(artikel, i, 1))}><ChevronDown className="h-4 w-4 text-slate-400" /></button>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={a.status === "publish" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}>
                      {a.status === "publish" ? "Publish" : "Draft"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"
                        onClick={() => patchA(a.id, { status: a.status === "publish" ? "draft" : "publish" })}>
                        {a.status === "publish" ? "Jadikan Draft" : "Publikasikan"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setArtikel(rm(artikel, a.id))}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-[1fr_220px] gap-3">
                    <div className="space-y-3">
                      <Field label="Judul Artikel">
                        <Input value={a.judul} onChange={(e) => patchA(a.id, { judul: e.target.value })} />
                      </Field>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Kategori">
                          <Input value={a.kategori} onChange={(e) => patchA(a.id, { kategori: e.target.value })} />
                        </Field>
                        <Field label="Tanggal Publikasi">
                          <Input type="date" value={a.tanggal} onChange={(e) => patchA(a.id, { tanggal: e.target.value })} />
                        </Field>
                        <Field label="Estimasi Waktu Baca">
                          <Input value={a.waktuBaca} onChange={(e) => patchA(a.id, { waktuBaca: e.target.value })} />
                        </Field>
                      </div>
                    </div>
                    <Field label="Thumbnail"><UploadBox height="h-32" label="Upload" value={a.thumbnail} onChange={(url) => patchA(a.id, { thumbnail: url ?? "" })} /></Field>
                  </div>
                  <Field label="Ringkasan Artikel">
                    <Textarea rows={2} value={a.ringkasan} onChange={(e) => patchA(a.id, { ringkasan: e.target.value })} />
                  </Field>
                  <Field label="Konten Artikel Lengkap">
                    <Textarea rows={6} value={a.konten} onChange={(e) => patchA(a.id, { konten: e.target.value })} />
                  </Field>
                  <Field label="Teks Tombol">
                    <Input value={a.tombolText} onChange={(e) => patchA(a.id, { tombolText: e.target.value })} />
                  </Field>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" className="w-full"
          onClick={() => setArtikel([...artikel, { id: nid(), kategori: "", judul: "", thumbnail: "", tanggal: new Date().toISOString().split("T")[0], waktuBaca: "", ringkasan: "", konten: "", tombolText: "Baca Selengkapnya", status: "draft" }])}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Artikel
        </Button>
      </SectionCard>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-end gap-2 z-20">
        <Button variant="outline" onClick={() => window.location.reload()}>Batalkan</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}