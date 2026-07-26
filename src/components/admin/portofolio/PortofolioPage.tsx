import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FolderOpen, Image as ImageIcon, ChevronUp, ChevronDown, Save, GripVertical } from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

type Project = {
  id: string; judul: string; tahun: string; lokasi: string;
  deskripsi: string; thumbnail: string; tombolText: string;
  detail: { konten: string; galeri: string[]; info: string };
};

type Kategori = {
  id: string; nama: string; warna: string; deskripsi: string;
  projects: Project[];
};

const warnaPilihan = [
  { v: "green", c: "bg-emerald-500" },
  { v: "blue", c: "bg-blue-500" },
  { v: "orange", c: "bg-orange-500" },
  { v: "purple", c: "bg-purple-500" },
  { v: "red", c: "bg-red-500" },
  { v: "teal", c: "bg-teal-500" },
];

export function PortofolioPage() {
  const [hero, setHero] = useState({
    judul: "Portofolio Perusahaan",
    subtitle: "Dokumentasi pengalaman dan proyek yang telah kami tangani di berbagai bidang usaha",
    gambar: "",
  });

  const defaultKategori: Kategori[] = [
    {
      id: "pemeliharaan", nama: "Pemeliharaan, Perawatan, dan Pembuatan Lingkungan", warna: "green",
      deskripsi: "Portofolio layanan perawatan lingkungan yang mencakup pemeliharaan taman dan kebersihan bangunan untuk area perumahan, perkantoran, dan fasilitas publik.",
      projects: [],
    },
    {
      id: "jasa-sdm", nama: "Jasa Profesional & Pengembangan SDM", warna: "blue",
      deskripsi: "Dokumentasi proyek jasa profesional yang mendukung aspek legalitas, sertifikasi, dan pengembangan kompetensi SDM.",
      projects: [],
    },
    {
      id: "perdagangan", nama: "Perdagangan Besar, Logistik, dan Penyediaan Jasa", warna: "orange",
      deskripsi: "Layanan pengadaan and distribusi skala besar.",
      projects: [],
    },
    {
      id: "event-organizer", nama: "Event Organizer, Kreatif, dan Media", warna: "purple",
      deskripsi: "Penyelenggaraan event, desain kreatif, dan publikasi media.",
      projects: [],
    },
  ];

  const [kategori, setKategori] = useState<Kategori[]>(defaultKategori);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch hero and categories from cms_pages
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "portofolio")
          .maybeSingle();

        let loadedKategori = defaultKategori;
        if (pageData && pageData.content) {
          const content = pageData.content as any;
          if (content.hero) {
            setHero({
              judul: content.hero.judul || "Portofolio Perusahaan",
              subtitle: content.hero.subtitle || "",
              gambar: content.hero.gambar || "",
            });
          }
          if (Array.isArray(content.kategori)) {
            loadedKategori = content.kategori.map((k: any) => ({
              id: k.id,
              nama: k.nama || "",
              warna: k.warna || "blue",
              deskripsi: k.deskripsi || "",
              projects: [],
            }));
          }
        }

        // 2. Fetch projects from portofolio table
        const { data: protoData } = await supabase
          .from("portofolio")
          .select("*")
          .order("sort_order");

        if (protoData) {
          const finalKategori = loadedKategori.map((kat) => {
            const matchedProj = protoData
              .filter((p) => p.category === kat.id)
              .map((p) => {
                let galleryUrls: string[] = [];
                try {
                  galleryUrls = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
                } catch (e) {}

                return {
                  id: p.id,
                  judul: p.title,
                  tahun: p.year || "",
                  lokasi: p.location || "",
                  deskripsi: p.description || "",
                  thumbnail: p.cover_url || "",
                  tombolText: "Lihat Detail Proyek",
                  detail: {
                    konten: p.description || "",
                    galeri: galleryUrls,
                    info: p.client || "",
                  },
                };
              });
            return { ...kat, projects: matchedProj };
          });
          setKategori(finalKategori);
        } else {
          setKategori(loadedKategori);
        }
      } catch (e: any) {
        console.error("Gagal memuat data portofolio: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const kategoriPayload = kategori.map((k) => ({
        id: k.id,
        nama: k.nama,
        warna: k.warna,
        deskripsi: k.deskripsi,
      }));

      console.log("[Portfolio Save Payload]", {
        hero,
        kategori: kategoriPayload,
      });

      // 1. Save hero and categories to cms_pages
      const pageContent = { hero, kategori: kategoriPayload };
      const { data: userData } = await supabase.auth.getUser();
      const updatedBy = userData?.user?.id || null;

      const { error: pageErr } = await supabase
        .from("cms_pages")
        .upsert({
          slug: "portofolio",
          content: pageContent,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        }, { onConflict: "slug" });

      if (pageErr) throw pageErr;

      // 2. Sync portofolio table
      const { data: existingProj } = await supabase.from("portofolio").select("id");
      const currentProjIds: string[] = [];
      kategori.forEach((kat) => kat.projects.forEach((p) => currentProjIds.push(p.id)));

      const toDelete = (existingProj ?? []).map((e) => e.id).filter((id) => !currentProjIds.includes(id));
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("portofolio").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }

      let orderIdx = 0;
      for (const kat of kategori) {
        for (const p of kat.projects) {
          const slug = p.judul
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

          const projPayload = {
            id: p.id,
            category: kat.id,
            title: p.judul,
            slug: slug || "project-" + p.id.slice(0, 8),
            year: p.tahun,
            location: p.lokasi,
            description: p.detail.konten || p.deskripsi,
            cover_url: p.thumbnail,
            client: p.detail.info,
            gallery: p.detail.galeri as any,
            sort_order: orderIdx++,
            is_published: true,
          };

          const { error: upsertErr } = await supabase.from("portofolio").upsert(projPayload);
          if (upsertErr) throw upsertErr;
        }
      }

      // 3. Verification query
      const { data: verifyData } = await supabase
        .from("cms_pages")
        .select("slug, content, updated_at")
        .eq("slug", "portofolio")
        .maybeSingle();

      console.log("[Portfolio Database]", verifyData);

      toast.success("Perubahan data portofolio berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data portofolio: " + e.message);
    }
  };

  const patchKat = (id: string, patch: Partial<Kategori>) =>
    setKategori((k) => k.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const patchProj = (kid: string, pid: string, patch: Partial<Project>) =>
    setKategori((k) => k.map((x) => (x.id === kid ? { ...x, projects: upd(x.projects, pid, patch) } : x)));

  return (
    <div className="space-y-6 pb-28">
      <header>
        <p className="text-xs text-slate-500">Beranda / Portofolio</p>
        <h1 className="text-2xl font-semibold text-slate-900">Kelola Halaman Portofolio</h1>
        <p className="text-sm text-slate-500 mt-1">Atur hero, kategori, and project portofolio.</p>
      </header>

      <SectionCard title="Hero Section" icon={<ImageIcon className="h-4 w-4 text-blue-600" />}>
        <Field label="Judul Hero">
          <Input value={hero.judul} onChange={(e) => setHero({ ...hero, judul: e.target.value })} />
        </Field>
        <Field label="Subtitle Hero">
          <Textarea rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </Field>
        <Field label="Gambar Hero">
          <UploadBox height="h-44" value={hero.gambar} onChange={(url) => setHero({ ...hero, gambar: url ?? "" })} />
        </Field>
      </SectionCard>

      <SectionCard title="Kategori Portofolio" icon={<FolderOpen className="h-4 w-4 text-blue-600" />}
        description="Atur kategori dan project di dalamnya. Urutan dapat disesuaikan.">
        <AnimatePresence>
          {kategori.map((k, ki) => (
            <motion.div key={k.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-lg border border-slate-200 bg-slate-50/40 p-4 space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5 mt-1">
                  <button onClick={() => setKategori(move(kategori, ki, -1))} className="text-slate-400 hover:text-slate-700"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => setKategori(move(kategori, ki, 1))} className="text-slate-400 hover:text-slate-700"><ChevronDown className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 grid md:grid-cols-[1fr_auto] gap-3">
                  <Field label="Nama Kategori">
                    <Input value={k.nama} onChange={(e) => patchKat(k.id, { nama: e.target.value })} />
                  </Field>
                  <Field label="Warna">
                    <div className="flex gap-1.5 items-center h-9">
                      {warnaPilihan.map((w) => (
                        <button key={w.v} onClick={() => patchKat(k.id, { warna: w.v })}
                          className={`h-7 w-7 rounded-full ${w.c} ${k.warna === w.v ? "ring-2 ring-offset-2 ring-slate-900" : ""}`} />
                      ))}
                    </div>
                  </Field>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setKategori(rm(kategori, k.id))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <Field label="Deskripsi Kategori">
                <Textarea rows={2} value={k.deskripsi} onChange={(e) => patchKat(k.id, { deskripsi: e.target.value })} />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Daftar Project</p>
                  <Button size="sm" variant="outline"
                    onClick={() => patchKat(k.id, { projects: [...k.projects, { id: nid(), judul: "", tahun: "", lokasi: "", deskripsi: "", thumbnail: "", tombolText: "Lihat Detail Proyek", detail: { konten: "", galeri: [], info: "" } }] })}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Project
                  </Button>
                </div>
                {k.projects.map((p, pi) => (
                  <div key={p.id} className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5 mt-1">
                        <button onClick={() => patchKat(k.id, { projects: move(k.projects, pi, -1) })}><ChevronUp className="h-4 w-4 text-slate-400" /></button>
                        <button onClick={() => patchKat(k.id, { projects: move(k.projects, pi, 1) })}><ChevronDown className="h-4 w-4 text-slate-400" /></button>
                      </div>
                      <div className="flex-1 grid md:grid-cols-3 gap-3">
                        <Field label="Judul Project">
                          <Input value={p.judul} onChange={(e) => patchProj(k.id, p.id, { judul: e.target.value })} />
                        </Field>
                        <Field label="Tahun">
                          <Input value={p.tahun} onChange={(e) => patchProj(k.id, p.id, { tahun: e.target.value })} />
                        </Field>
                        <Field label="Lokasi / Klien">
                          <Input value={p.lokasi} onChange={(e) => patchProj(k.id, p.id, { lokasi: e.target.value })} />
                        </Field>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => patchKat(k.id, { projects: rm(k.projects, p.id) })}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Deskripsi Project">
                        <Textarea rows={3} value={p.deskripsi} onChange={(e) => patchProj(k.id, p.id, { deskripsi: e.target.value, detail: { ...p.detail, konten: e.target.value } })} />
                      </Field>
                      <Field label="Gambar Thumbnail">
                        <UploadBox height="h-28" value={p.thumbnail} onChange={(url) => patchProj(k.id, p.id, { thumbnail: url ?? "" })} />
                      </Field>
                    </div>
                    <Field label="Teks Tombol Detail">
                      <Input value={p.tombolText} onChange={(e) => patchProj(k.id, p.id, { tombolText: e.target.value })} />
                    </Field>
                    <div className="rounded-md border border-dashed border-slate-200 p-3 space-y-3 bg-slate-50/40">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Detail Lengkap Project</p>
                      <Field label="Konten Detail">
                        <Textarea rows={4} value={p.detail.konten}
                          onChange={(e) => patchProj(k.id, p.id, { deskripsi: e.target.value, detail: { ...p.detail, konten: e.target.value } })} />
                      </Field>
                      <Field label="Informasi Tambahan">
                        <Textarea rows={2} value={p.detail.info}
                          onChange={(e) => patchProj(k.id, p.id, { detail: { ...p.detail, info: e.target.value } })} />
                      </Field>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-700">Galeri Project</p>
                          <Button size="sm" variant="outline"
                            onClick={() => patchProj(k.id, p.id, { detail: { ...p.detail, galeri: [...p.detail.galeri, ""] } })}>
                            <Plus className="h-4 w-4 mr-1" /> Tambah Gambar
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {p.detail.galeri.map((g, gi) => (
                            <div key={gi} className="space-y-1">
                              <UploadBox height="h-24" value={g} onChange={(url) => {
                                const newGal = [...p.detail.galeri];
                                newGal[gi] = url ?? "";
                                patchProj(k.id, p.id, { detail: { ...p.detail, galeri: newGal } });
                              }} />
                              <Button size="sm" variant="ghost" className="w-full h-7 text-xs text-red-500" onClick={() => {
                                const newGal = p.detail.galeri.filter((_, idx) => idx !== gi);
                                patchProj(k.id, p.id, { detail: { ...p.detail, galeri: newGal } });
                              }}>Hapus</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" className="w-full"
          onClick={() => setKategori([...kategori, { id: nid(), nama: "", warna: "blue", deskripsi: "", projects: [] }])}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Kategori
        </Button>
      </SectionCard>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-end gap-2 z-20">
        <Button variant="outline" onClick={() => window.location.reload()}>Batalkan</Button>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Simpan Perubahan</Button>
      </div>
    </div>
  );
}