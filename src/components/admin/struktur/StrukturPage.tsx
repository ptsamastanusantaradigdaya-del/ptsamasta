import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Users,
  UserCog,
  Trophy,
  ShieldCheck,
  Megaphone,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Network,
  HeartHandshake,
  Sparkles,
  Search,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
  Mail,
  Linkedin,
  Phone,
} from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";

const SLUG = "struktur-manajemen";

type Pimpinan = {
  id: string;
  nama: string;
  jabatan: string;
  kategori: "komisaris" | "direksi";
  badgeColor: string;
  deskripsiSingkat: string;
  heroDeskripsi: string;
  heroBgColor: string;
  keahlian: string[];
  pendidikanSingkat: string;
  pengalamanTahun: string;
  jabatanProfesional: string;
  latarPendidikan: string;
  organisasi: string;
  kontribusi: string;
  highlights: { id: number | string; label: string; isi: string; icon: string }[];
  expanded: boolean;
  photo_url?: string;
  // Direktur-only fields
  visiKepemimpinan?: string;
  strategiBisnis?: string;
  fokusPengembangan?: string;
  targetPerusahaan?: string;
  portofolio?: string;
  sertifikasi?: string;
  pengalaman?: string;
  pendidikan?: string;
};

const ICON_OPTIONS = [
  { value: "award", label: "Award", Icon: Award },
  { value: "shield", label: "Shield", Icon: ShieldCheck },
  { value: "trending", label: "Trending", Icon: TrendingUp },
  { value: "users", label: "Users", Icon: Users },
  { value: "building", label: "Building", Icon: Building2 },
  { value: "education", label: "Education", Icon: GraduationCap },
  { value: "briefcase", label: "Briefcase", Icon: Briefcase },
];

export function StrukturPage() {
  const defaultHero = {
    badge: "Manajemen & Kepemimpinan",
    title: "Susunan Direksi & Komisaris",
    subtitle:
      "Kepemimpinan Berpengalaman yang Mengarahkan PT Samasta Nusantara Digdaya Menuju Kesuksesan",
    overlayColor: "#1E3A8A",
    image: "",
  };
  const [hero, setHero] = useState(defaultHero);

  const defaultIntro = {
    title: "Kepemimpinan yang Visioner dan Berpengalaman",
    paragraf1:
      "Tim manajemen PT Samasta Nusantara Digdaya terdiri dari para profesional berpengalaman dengan rekam jejak yang terbukti di berbagai industri. Dengan kombinasi keahlian strategis, operasional, dan finansial, kami memimpin perusahaan menuju pertumbuhan berkelanjutan.",
    paragraf2:
      "Setiap anggota direksi membawa perspektif unik dan komitmen kuat untuk memberikan terbaik bagi klien, mitra, dan stakeholder kami.",
  };
  const [intro, setIntro] = useState(defaultIntro);

  const defaultSectionTitles = {
    komisarisTitle: "Dewan Komisaris",
    komisarisSubtitle: "Pengawas independen yang memastikan tata kelola perusahaan yang baik",
    direksiTitle: "Dewan Direksi",
    direksiSubtitle: "Pemimpin strategis yang menjalankan visi dan misi perusahaan",
  };
  const [sectionTitles, setSectionTitles] = useState(defaultSectionTitles);

  const [pimpinan, setPimpinan] = useState<Pimpinan[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const defaultPencapaian = {
    title: "Pencapaian Perusahaan",
    subtitle: "Hasil nyata dari kepemimpinan yang efektif dan komitmen terhadap keunggulan",
    items: [
      { id: 1, title: "Sertifikasi ISO 9001:2015", desc: "Standar manajemen mutu internasional", icon: "award" },
      { id: 2, title: "Good Corporate Governance", desc: "Tata kelola perusahaan yang transparan", icon: "shield" },
      { id: 3, title: "Pertumbuhan 45% YoY", desc: "Kinerja finansial yang konsisten", icon: "trending" },
      { id: 4, title: "100+ Klien Korporat", desc: "Kepercayaan dari berbagai industri", icon: "users" },
    ],
  };
  const [pencapaian, setPencapaian] = useState(defaultPencapaian);

  const defaultGcg = {
    title: "Good Corporate Governance",
    subtitle: "Komitmen kami terhadap tata kelola perusahaan yang baik",
    items: [
      { id: 1, title: "Transparansi", desc: "Kami berkomitmen untuk transparansi dalam pelaporan keuangan, operasional, dan pengambilan keputusan strategis.", icon: "shield" },
      { id: 2, title: "Akuntabilitas", desc: "Setiap keputusan dan tindakan direksi dapat dipertanggungjawabkan kepada stakeholder dan publik.", icon: "users" },
      { id: 3, title: "Kepatuhan", desc: "Mematuhi semua regulasi, standar industri, dan kode etik bisnis yang berlaku di Indonesia.", icon: "award" },
    ],
  };
  const [gcg, setGcg] = useState(defaultGcg);

  const defaultCta = {
    title: "Ingin Tahu Lebih Lanjut tentang Kami?",
    subtitle: "Tim kami siap menjawab pertanyaan Anda dan membantu menemukan solusi terbaik untuk kebutuhan bisnis Anda.",
    primaryLabel: "Hubungi Tim Kami",
    primaryLink: "/kontak",
    secondaryLabel: "Lihat Layanan Kami",
    secondaryLink: "/layanan",
  };
  const [cta, setCta] = useState(defaultCta);

  // ---- CMS integration ----
  interface StrukturContent {
    hero: typeof defaultHero;
    intro: typeof defaultIntro;
    sectionTitles: typeof defaultSectionTitles;
    pimpinan: Pimpinan[];
    pencapaian: typeof defaultPencapaian;
    gcg: typeof defaultGcg;
    cta: typeof defaultCta;
  }
  const defaults: StrukturContent = {
    hero: defaultHero, intro: defaultIntro, sectionTitles: defaultSectionTitles,
    pimpinan: [], pencapaian: defaultPencapaian, gcg: defaultGcg, cta: defaultCta,
  };
  registerDefaults(SLUG, defaults);
  const cms = useCmsPage<StrukturContent>(SLUG);

  const parseDetailContent = (detailContent: string | null) => {
    const res = {
      badgeColor: "#1E3A8A",
      heroBgColor: "#1E3A8A",
      heroOverlay: "#1E3A8A",
      heroDeskripsi: "",
      jabatanProfesional: "",
      latarPendidikan: "",
      organisasi: "",
      kontribusi: "",
      highlights: [] as { id: string | number; label: string; isi: string; icon: string }[],
      // Direktur additional fields
      visiKepemimpinan: "",
      strategiBisnis: "",
      fokusPengembangan: "",
      targetPerusahaan: "",
      keahlian: [] as string[],
      portofolio: "",
      pengalaman: "",
      pendidikan: "",
      sertifikasi: "",
    };
    if (!detailContent) return res;
    if (detailContent.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(detailContent);
        return { ...res, ...parsed };
      } catch (e) {
        console.error("Gagal parse JSON detail_content:", e);
      }
    }
    // Fallback parse markdown
    const rawSections = detailContent.split(/(?=^## )/m);
    rawSections.forEach((s) => {
      const trimmed = s.trim();
      if (trimmed.startsWith("## ")) {
        const lines = trimmed.split("\n");
        const title = lines[0].replace(/^##\s*/, "").trim().toLowerCase();
        const content = lines.slice(1).join("\n").trim();
        if (title.includes("jabatan") || title.includes("pengalaman")) {
          res.jabatanProfesional = content;
        } else if (title.includes("pendidikan") || title.includes("latar belakang")) {
          res.latarPendidikan = content;
        } else if (title.includes("organisasi") || title.includes("kepemimpinan")) {
          res.organisasi = content;
        } else if (title.includes("kontribusi") || title.includes("nilai")) {
          res.kontribusi = content;
        }
      }
    });
    return res;
  };

  const buildDetailContent = (p: Pimpinan) => {
    const payload = {
      badgeColor: p.badgeColor,
      heroBgColor: p.heroBgColor,
      heroDeskripsi: p.heroDeskripsi,
      jabatanProfesional: p.jabatanProfesional,
      latarPendidikan: p.latarPendidikan,
      organisasi: p.organisasi,
      kontribusi: p.kontribusi,
      highlights: p.highlights,
      visiKepemimpinan: p.visiKepemimpinan,
      strategiBisnis: p.strategiBisnis,
      fokusPengembangan: p.fokusPengembangan,
      targetPerusahaan: p.targetPerusahaan,
      keahlian: p.keahlian,
      portofolio: p.portofolio,
      pengalaman: p.pengalaman,
      pendidikan: p.pendidikan,
      sertifikasi: p.sertifikasi,
    };
    return JSON.stringify(payload, null, 2);
  };

  useEffect(() => {
    const c = cms.content;
    if (!c) return;
    if (c.hero) setHero({ ...defaultHero, ...c.hero });
    if (c.intro) setIntro({ ...defaultIntro, ...c.intro });
    if (c.sectionTitles) setSectionTitles({ ...defaultSectionTitles, ...c.sectionTitles });
    if (c.pencapaian) setPencapaian({ ...defaultPencapaian, ...c.pencapaian });
    if (c.gcg) setGcg({ ...defaultGcg, ...c.gcg });
    if (c.cta) setCta({ ...defaultCta, ...c.cta });
    
    // Fetch pimpinan from database
    const fetchPimpinan = async () => {
      try {
        const { data, error } = await supabase
          .from("struktur_manajemen")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setPimpinan(
          (data ?? []).map((p) => {
            const parsed = parseDetailContent(p.detail_content);
            return {
              id: p.id,
              nama: p.name || "",
              jabatan: p.position || "",
              kategori: p.level <= 2 ? "komisaris" : "direksi",
              badgeColor: p.level <= 2 ? "#1E3A8A" : "#EA580C",
              deskripsiSingkat: p.bio || "",
              heroDeskripsi: p.bio || "",
              heroBgColor: p.level <= 2 ? "#1E3A8A" : "#EA580C",
              keahlian: [],
              pendidikanSingkat: "",
              pengalamanTahun: "",
              expanded: false,
              photo_url: p.photo_url || "",
              ...parsed,
            };
          })
        );
      } catch (e: any) {
        toast.error("Gagal memuat dewan manajemen: " + e.message);
      } finally {
        setLoadingList(false);
      }
    };
    void fetchPimpinan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cms.status]);

  const handleSave = async () => {
    try {
      console.log("[StrukturManajemen] Payload Save:", JSON.stringify({ hero, intro, sectionTitles, pencapaian, gcg, cta, pimpinan }, null, 2));

      // 1. Save CMS configs to cms_pages
      cms.setContent({ hero, intro, sectionTitles, pimpinan: [], pencapaian, gcg, cta });
      setTimeout(async () => {
        await cms.save();
      }, 0);

      // 2. Sync dewan manajemen table
      const { data: existing } = await supabase.from("struktur_manajemen").select("id");
      const currentIds = pimpinan.map((p) => p.id);
      const toDelete = (existing ?? []).map((e) => e.id).filter((id) => !currentIds.includes(id));

      if (toDelete.length > 0) {
        await supabase.from("struktur_manajemen").delete().in("id", toDelete);
      }

      const upsertData = pimpinan.map((p, index) => {
        const slug = p.nama
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        return {
          id: p.id,
          slug: slug || "pimpinan-" + p.id.slice(0, 8),
          name: p.nama,
          position: p.jabatan,
          level: p.kategori === "komisaris" ? 2 : 3,
          photo_url: p.photo_url || "",
          bio: p.deskripsiSingkat,
          detail_content: buildDetailContent(p),
          sort_order: index,
          is_active: p.is_active !== false,
        };
      });

      if (upsertData.length > 0) {
        const { data: dbResult, error } = await supabase.from("struktur_manajemen").upsert(upsertData).select();
        if (error) throw error;
        console.log("[StrukturManajemen] Database Result:", dbResult);
      }

      toast.success("Perubahan struktur manajemen berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan data dewan: " + e.message);
    }
  };

  const togglePimpinan = (id: string) =>
    setPimpinan((p) => p.map((x) => (x.id === id ? { ...x, expanded: !x.expanded } : x)));

  const updatePimpinan = <K extends keyof Pimpinan>(id: string, key: K, value: Pimpinan[K]) =>
    setPimpinan((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)));

  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const movePimpinan = (id: string, direction: "up" | "down") => {
    setPimpinan((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx === -1) return prev;
      const category = prev[idx].kategori;
      const sameCategoryIndices = prev
        .map((x, i) => (x.kategori === category ? i : -1))
        .filter((i) => i !== -1);
      const catIdx = sameCategoryIndices.indexOf(idx);
      const targetCatIdx = direction === "up" ? catIdx - 1 : catIdx + 1;
      if (targetCatIdx < 0 || targetCatIdx >= sameCategoryIndices.length) return prev;
      const swapWithIdx = sameCategoryIndices[targetCatIdx];
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[swapWithIdx];
      next[swapWithIdx] = temp;
      return next;
    });
  };

  const movePencapaian = (idx: number, direction: "up" | "down") => {
    setPencapaian((prev) => {
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.items.length) return prev;
      const nextItems = [...prev.items];
      const temp = nextItems[idx];
      nextItems[idx] = nextItems[targetIdx];
      nextItems[targetIdx] = temp;
      return { ...prev, items: nextItems };
    });
  };

  const moveGcg = (idx: number, direction: "up" | "down") => {
    setGcg((prev) => {
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.items.length) return prev;
      const nextItems = [...prev.items];
      const temp = nextItems[idx];
      nextItems[idx] = nextItems[targetIdx];
      nextItems[targetIdx] = temp;
      return { ...prev, items: nextItems };
    });
  };

  const addPimpinan = (kategori: "komisaris" | "direksi") =>
    setPimpinan((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        nama: "Nama Lengkap",
        jabatan: kategori === "komisaris" ? "Komisaris" : "Direktur",
        kategori,
        badgeColor: kategori === "komisaris" ? "#1E3A8A" : "#2563EB",
        deskripsiSingkat: "",
        heroDeskripsi: "",
        heroBgColor: kategori === "komisaris" ? "#1E3A8A" : "#2563EB",
        keahlian: [],
        pendidikanSingkat: "",
        pengalamanTahun: "",
        jabatanProfesional: "",
        latarPendidikan: "",
        organisasi: "",
        kontribusi: "",
        highlights: [],
        expanded: true,
        visiKepemimpinan: "",
        strategiBisnis: "",
        fokusPengembangan: "",
        targetPerusahaan: "",
        portofolio: "",
        sertifikasi: "",
        pengalaman: "",
        pendidikan: "",
        email: "",
        linkedin: "",
        telepon: "",
        is_active: true,
      },
    ]);

  const removePimpinan = (id: string) =>
    setPimpinan((p) => p.filter((x) => x.id !== id));

  const addHighlight = (pid: string) =>
    setPimpinan((p) =>
      p.map((x) =>
        x.id === pid
          ? { ...x, highlights: [...x.highlights, { id: Date.now(), label: "Highlight Baru", isi: "", icon: "award" }] }
          : x,
      ),
    );

  const updateHighlight = (pid: string, hid: number, key: "label" | "isi" | "icon", value: string) =>
    setPimpinan((p) =>
      p.map((x) =>
        x.id === pid
          ? { ...x, highlights: x.highlights.map((h) => (h.id === hid ? { ...h, [key]: value } : h)) }
          : x,
      ),
    );

  const removeHighlight = (pid: string, hid: number) =>
    setPimpinan((p) =>
      p.map((x) =>
        x.id === pid ? { ...x, highlights: x.highlights.filter((h) => h.id !== hid) } : x,
      ),
    );

  return (
    <CmsPageShell
      title="Kelola Struktur Manajemen"
      description="Ubah konten halaman Struktur Manajemen & halaman detail pimpinan."
      status={cms.status}
      error={cms.error}
      updatedAt={cms.updatedAt}
      saving={cms.saving}
      defaults={defaults}
      seed={cms.seed}
      save={handleSave}
      reload={cms.reload}
    >
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari pimpinan berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50/50"
          />
        </div>
        <Button
          type="button"
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          <Eye className="h-4 w-4" /> Preview Halaman
        </Button>
      </div>

      {/* HERO */}
      <SectionCard
        title="Hero Section"
        description="Banner utama pada halaman Struktur Manajemen."
        icon={<ImageIcon className="h-5 w-5 text-blue-600" />}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Badge / Label Atas">
            <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
          </Field>
          <Field label="Overlay Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={hero.overlayColor}
                onChange={(e) => setHero({ ...hero, overlayColor: e.target.value })}
                className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
              />
              <Input value={hero.overlayColor} onChange={(e) => setHero({ ...hero, overlayColor: e.target.value })} />
            </div>
          </Field>
        </div>
        <Field label="Judul Hero">
          <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <Textarea rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </Field>
        <Field label="Background Image" hint="Direkomendasikan 1920x600px">
          <UploadBox height="h-40" value={hero.image} onChange={(url) => setHero({ ...hero, image: url ?? "" })} />
        </Field>
      </SectionCard>

      {/* INTRO */}
      <SectionCard
        title="Intro / Pengantar"
        description="Teks pengantar setelah hero section."
        icon={<Sparkles className="h-5 w-5 text-blue-600" />}
      >
        <Field label="Judul">
          <Input value={intro.title} onChange={(e) => setIntro({ ...intro, title: e.target.value })} />
        </Field>
        <Field label="Paragraf 1">
          <Textarea rows={3} value={intro.paragraf1} onChange={(e) => setIntro({ ...intro, paragraf1: e.target.value })} />
        </Field>
        <Field label="Paragraf 2">
          <Textarea rows={2} value={intro.paragraf2} onChange={(e) => setIntro({ ...intro, paragraf2: e.target.value })} />
        </Field>
      </SectionCard>

      {/* DEWAN KOMISARIS */}
      <PimpinanSection
        sectionTitle={sectionTitles.komisarisTitle}
        sectionSubtitle={sectionTitles.komisarisSubtitle}
        onTitleChange={(v) => setSectionTitles({ ...sectionTitles, komisarisTitle: v })}
        onSubtitleChange={(v) => setSectionTitles({ ...sectionTitles, komisarisSubtitle: v })}
        kategori="komisaris"
        icon={<Users className="h-5 w-5 text-blue-600" />}
        title="Dewan Komisaris"
        pimpinan={pimpinan
          .filter((p) => p.kategori === "komisaris")
          .filter((p) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        onAdd={() => addPimpinan("komisaris")}
        onRemove={removePimpinan}
        onToggle={togglePimpinan}
        onUpdate={updatePimpinan}
        onMove={movePimpinan}
        onAddHighlight={addHighlight}
        onUpdateHighlight={updateHighlight}
        onRemoveHighlight={removeHighlight}
      />

      {/* DEWAN DIREKSI */}
      <PimpinanSection
        sectionTitle={sectionTitles.direksiTitle}
        sectionSubtitle={sectionTitles.direksiSubtitle}
        onTitleChange={(v) => setSectionTitles({ ...sectionTitles, direksiTitle: v })}
        onSubtitleChange={(v) => setSectionTitles({ ...sectionTitles, direksiSubtitle: v })}
        kategori="direksi"
        icon={<UserCog className="h-5 w-5 text-blue-600" />}
        title="Dewan Direksi"
        pimpinan={pimpinan
          .filter((p) => p.kategori === "direksi")
          .filter((p) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        onAdd={() => addPimpinan("direksi")}
        onRemove={removePimpinan}
        onToggle={togglePimpinan}
        onUpdate={updatePimpinan}
        onMove={movePimpinan}
        onAddHighlight={addHighlight}
        onUpdateHighlight={updateHighlight}
        onRemoveHighlight={removeHighlight}
      />

      {/* PENCAPAIAN */}
      <SectionCard
        title="Pencapaian Perusahaan"
        description="Daftar pencapaian yang ditampilkan pada banner biru."
        icon={<Trophy className="h-5 w-5 text-blue-600" />}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Judul Section">
            <Input value={pencapaian.title} onChange={(e) => setPencapaian({ ...pencapaian, title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <Input value={pencapaian.subtitle} onChange={(e) => setPencapaian({ ...pencapaian, subtitle: e.target.value })} />
          </Field>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {pencapaian.items.map((it, idx) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-[140px_1fr_2fr_auto] gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <IconSelect
                  value={it.icon}
                  onChange={(v) =>
                    setPencapaian({
                      ...pencapaian,
                      items: pencapaian.items.map((x, i) => (i === idx ? { ...x, icon: v } : x)),
                    })
                  }
                />
                <Input
                  placeholder="Judul"
                  value={it.title}
                  onChange={(e) =>
                    setPencapaian({
                      ...pencapaian,
                      items: pencapaian.items.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                    })
                  }
                />
                <Input
                  placeholder="Deskripsi"
                  value={it.desc}
                  onChange={(e) =>
                    setPencapaian({
                      ...pencapaian,
                      items: pencapaian.items.map((x, i) => (i === idx ? { ...x, desc: e.target.value } : x)),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() =>
                    setPencapaian({ ...pencapaian, items: pencapaian.items.filter((x) => x.id !== it.id) })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            variant="outline"
            onClick={() =>
              setPencapaian({
                ...pencapaian,
                items: [...pencapaian.items, { id: Date.now(), title: "", desc: "", icon: "award" }],
              })
            }
          >
            <Plus className="h-4 w-4" /> Tambah Pencapaian
          </Button>
        </div>
      </SectionCard>

      {/* GCG */}
      <SectionCard
        title="Good Corporate Governance"
        description="Prinsip-prinsip tata kelola perusahaan."
        icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Judul Section">
            <Input value={gcg.title} onChange={(e) => setGcg({ ...gcg, title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <Input value={gcg.subtitle} onChange={(e) => setGcg({ ...gcg, subtitle: e.target.value })} />
          </Field>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {gcg.items.map((it, idx) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-[140px_1fr_auto] gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <IconSelect
                  value={it.icon}
                  onChange={(v) =>
                    setGcg({ ...gcg, items: gcg.items.map((x, i) => (i === idx ? { ...x, icon: v } : x)) })
                  }
                />
                <div className="space-y-2">
                  <Input
                    placeholder="Judul prinsip"
                    value={it.title}
                    onChange={(e) =>
                      setGcg({
                        ...gcg,
                        items: gcg.items.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                      })
                    }
                  />
                  <Textarea
                    rows={2}
                    placeholder="Deskripsi"
                    value={it.desc}
                    onChange={(e) =>
                      setGcg({
                        ...gcg,
                        items: gcg.items.map((x, i) => (i === idx ? { ...x, desc: e.target.value } : x)),
                      })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setGcg({ ...gcg, items: gcg.items.filter((x) => x.id !== it.id) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            variant="outline"
            onClick={() =>
              setGcg({ ...gcg, items: [...gcg.items, { id: Date.now(), title: "", desc: "", icon: "shield" }] })
            }
          >
            <Plus className="h-4 w-4" /> Tambah Prinsip
          </Button>
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard
        title="Call to Action"
        description="Section ajakan di bagian bawah halaman."
        icon={<Megaphone className="h-5 w-5 text-blue-600" />}
      >
        <Field label="Judul CTA">
          <Input value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <Textarea rows={2} value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} />
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Tombol Primer — Label">
            <Input value={cta.primaryLabel} onChange={(e) => setCta({ ...cta, primaryLabel: e.target.value })} />
          </Field>
          <Field label="Tombol Primer — Link">
            <Input value={cta.primaryLink} onChange={(e) => setCta({ ...cta, primaryLink: e.target.value })} />
          </Field>
          <Field label="Tombol Sekunder — Label">
            <Input value={cta.secondaryLabel} onChange={(e) => setCta({ ...cta, secondaryLabel: e.target.value })} />
          </Field>
          <Field label="Tombol Sekunder — Link">
            <Input value={cta.secondaryLink} onChange={(e) => setCta({ ...cta, secondaryLink: e.target.value })} />
          </Field>
        </div>
      </SectionCard>

      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-50 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Preview Halaman Publik</h3>
                  <p className="text-xs text-slate-500">Tampilan sebelum disimpan ke database</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Preview Body */}
              <div className="flex-1 overflow-y-auto space-y-12 pb-16">
                {/* Hero */}
                <div
                  style={{ backgroundColor: hero.overlayColor }}
                  className="py-16 text-center text-white relative px-4"
                >
                  <span className="bg-white/10 border border-white/10 text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    {hero.badge}
                  </span>
                  <h1 className="text-3xl font-extrabold mt-3">{hero.title}</h1>
                  <p className="text-sm text-white/70 mt-2 max-w-xl mx-auto">{hero.subtitle}</p>
                </div>

                {/* Intro */}
                <div className="text-center max-w-3xl mx-auto px-4 space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">{intro.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{intro.paragraf1}</p>
                  {intro.paragraf2 && <p className="text-xs text-slate-500 leading-relaxed">{intro.paragraf2}</p>}
                </div>

                {/* Dewan Komisaris */}
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">{sectionTitles.komisarisTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                    {pimpinan.filter((p) => p.kategori === "komisaris" && p.is_active !== false).map((p) => (
                      <div key={p.id} className="bg-white border rounded-xl p-4 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-slate-100 border overflow-hidden">
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.nama} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="h-8 w-8 text-slate-400 mx-auto mt-6" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-800">{p.nama}</h4>
                        <span
                          style={{ backgroundColor: p.badgeColor }}
                          className="inline-block mt-2 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {p.jabatan}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dewan Direksi */}
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">{sectionTitles.direksiTitle}</h3>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {pimpinan.filter((p) => p.kategori === "direksi" && p.is_active !== false).map((p) => (
                      <div key={p.id} className="bg-white border rounded-xl p-5 text-left shadow-sm flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-slate-100 border overflow-hidden shrink-0">
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.nama} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="h-8 w-8 text-slate-400 mx-auto mt-8" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{p.nama}</h4>
                          <span
                            style={{ backgroundColor: p.badgeColor }}
                            className="inline-block mt-1 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            {p.jabatan}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{p.deskripsiSingkat}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pencapaian */}
                <div className="bg-[#1E3A8A] text-white py-12 px-4 text-center">
                  <h3 className="font-bold text-lg mb-2">{pencapaian.title}</h3>
                  <p className="text-xs text-white/70 mb-8">{pencapaian.subtitle}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {pencapaian.items.map((it: any) => (
                      <div key={it.id} className="bg-white/10 rounded-xl p-4 text-left border border-white/10">
                        <h4 className="font-bold text-xs">{it.title}</h4>
                        <p className="text-[10px] text-white/80 mt-1">{it.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GCG */}
                <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
                  <h3 className="text-lg font-bold text-slate-800">{gcg.title}</h3>
                  <div className="space-y-3 max-w-xl mx-auto text-left">
                    {gcg.items.map((it: any) => (
                      <div key={it.id} className="bg-white border rounded-xl p-4 shadow-sm flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{it.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1">{it.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CmsPageShell>
  );
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {ICON_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function PimpinanSection({
  sectionTitle,
  sectionSubtitle,
  onTitleChange,
  onSubtitleChange,
  icon,
  title,
  pimpinan,
  onAdd,
  onRemove,
  onToggle,
  onUpdate,
  onMove,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight,
}: {
  sectionTitle: string;
  sectionSubtitle: string;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  kategori: "komisaris" | "direksi";
  icon: React.ReactNode;
  title: string;
  pimpinan: Pimpinan[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdate: <K extends keyof Pimpinan>(id: string, key: K, value: Pimpinan[K]) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onAddHighlight: (pid: string) => void;
  onUpdateHighlight: (pid: string, hid: number, key: "label" | "isi" | "icon", value: string) => void;
  onRemoveHighlight: (pid: string, hid: number) => void;
}) {
  return (
    <SectionCard title={title} description="Kelola heading section beserta daftar profil." icon={icon}>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Judul Section">
          <Input value={sectionTitle} onChange={(e) => onTitleChange(e.target.value)} />
        </Field>
        <Field label="Subtitle Section">
          <Input value={sectionSubtitle} onChange={(e) => onSubtitleChange(e.target.value)} />
        </Field>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {pimpinan.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: p.badgeColor }}
                  >
                    {p.nama.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.nama || "Tanpa Nama"}</p>
                    <p className="text-xs text-slate-500 truncate">{p.jabatan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex flex-col shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-slate-600"
                      onClick={() => onMove(p.id, "up")}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-slate-600"
                      onClick={() => onMove(p.id, "down")}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onToggle(p.id)}>
                    {p.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onRemove(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {p.expanded && (
                <div className="p-5 space-y-5">
                  {/* Card list section */}
                  <div className="grid md:grid-cols-[160px_1fr] gap-5">
                    <Field label="Foto Profil">
                      <UploadBox height="h-40" value={p.photo_url} onChange={(url) => onUpdate(p.id, "photo_url", url ?? "")} />
                    </Field>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Nama Lengkap">
                          <Input value={p.nama} onChange={(e) => onUpdate(p.id, "nama", e.target.value)} />
                        </Field>
                        <Field label="Jabatan">
                          <Input value={p.jabatan} onChange={(e) => onUpdate(p.id, "jabatan", e.target.value)} />
                        </Field>
                        <Field label="Warna Badge Jabatan">
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={p.badgeColor}
                              onChange={(e) => onUpdate(p.id, "badgeColor", e.target.value)}
                              className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                            />
                            <Input
                              value={p.badgeColor}
                              onChange={(e) => onUpdate(p.id, "badgeColor", e.target.value)}
                            />
                          </div>
                        </Field>
                        <Field label="Warna Background Hero Detail">
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={p.heroBgColor}
                              onChange={(e) => onUpdate(p.id, "heroBgColor", e.target.value)}
                              className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                            />
                            <Input
                              value={p.heroBgColor}
                              onChange={(e) => onUpdate(p.id, "heroBgColor", e.target.value)}
                            />
                          </div>
                        </Field>
                        <Field label="Status Aktif">
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={p.is_active !== false}
                              onChange={(e) => onUpdate(p.id, "is_active", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-600 font-medium">Tampilkan di Website Publik</span>
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>

                  <Field label="Deskripsi Hero Detail" hint="Tampil di banner halaman detail profil.">
                    <Textarea
                      rows={3}
                      value={p.heroDeskripsi}
                      onChange={(e) => onUpdate(p.id, "heroDeskripsi", e.target.value)}
                    />
                  </Field>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Field label="Pendidikan (Ringkas)">
                      <Input
                        value={p.pendidikanSingkat}
                        onChange={(e) => onUpdate(p.id, "pendidikanSingkat", e.target.value)}
                      />
                    </Field>
                    <Field label="Pengalaman">
                      <Input
                        placeholder="10+ Tahun"
                        value={p.pengalamanTahun}
                        onChange={(e) => onUpdate(p.id, "pengalamanTahun", e.target.value)}
                      />
                    </Field>
                    <Field label="Keahlian (pisahkan dengan koma)">
                      <Input
                        value={p.keahlian.join(", ")}
                        onChange={(e) =>
                          onUpdate(p.id, "keahlian", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Field label="Email">
                      <Input
                        value={p.email || ""}
                        onChange={(e) => onUpdate(p.id, "email", e.target.value)}
                      />
                    </Field>
                    <Field label="LinkedIn URL">
                      <Input
                        value={p.linkedin || ""}
                        onChange={(e) => onUpdate(p.id, "linkedin", e.target.value)}
                      />
                    </Field>
                    <Field label="Telepon / WhatsApp">
                      <Input
                        value={p.telepon || ""}
                        onChange={(e) => onUpdate(p.id, "telepon", e.target.value)}
                      />
                    </Field>
                  </div>
                  {p.keahlian.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.keahlian.map((k, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Detail page content */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Konten Halaman Detail Pimpinan
                    </p>
                    <Field label="Jabatan & Pengalaman Profesional">
                      <Textarea
                        rows={4}
                        value={p.jabatanProfesional}
                        onChange={(e) => onUpdate(p.id, "jabatanProfesional", e.target.value)}
                      />
                    </Field>
                    <Field label="Latar Belakang Pendidikan">
                      <Textarea
                        rows={4}
                        value={p.latarPendidikan}
                        onChange={(e) => onUpdate(p.id, "latarPendidikan", e.target.value)}
                      />
                    </Field>
                    <Field label="Organisasi & Kepemimpinan">
                      <Textarea
                        rows={4}
                        value={p.organisasi}
                        onChange={(e) => onUpdate(p.id, "organisasi", e.target.value)}
                      />
                    </Field>
                    <Field label="Kontribusi & Nilai yang Dibawa">
                      <Textarea
                        rows={4}
                        value={p.kontribusi}
                        onChange={(e) => onUpdate(p.id, "kontribusi", e.target.value)}
                      />
                    </Field>

                    {/* Direktur-only extra fields */}
                    {p.kategori === "direksi" && (
                      <>
                        <Field label="Visi Kepemimpinan">
                          <Textarea
                            rows={4}
                            value={p.visiKepemimpinan || ""}
                            onChange={(e) => onUpdate(p.id, "visiKepemimpinan", e.target.value)}
                          />
                        </Field>
                        <Field label="Strategi Bisnis">
                          <Textarea
                            rows={4}
                            value={p.strategiBisnis || ""}
                            onChange={(e) => onUpdate(p.id, "strategiBisnis", e.target.value)}
                          />
                        </Field>
                        <Field label="Fokus Pengembangan">
                          <Textarea
                            rows={4}
                            value={p.fokusPengembangan || ""}
                            onChange={(e) => onUpdate(p.id, "fokusPengembangan", e.target.value)}
                          />
                        </Field>
                        <Field label="Target Perusahaan">
                          <Textarea
                            rows={4}
                            value={p.targetPerusahaan || ""}
                            onChange={(e) => onUpdate(p.id, "targetPerusahaan", e.target.value)}
                          />
                        </Field>
                        <Field label="Portofolio Detail">
                          <Textarea
                            rows={4}
                            value={p.portofolio || ""}
                            onChange={(e) => onUpdate(p.id, "portofolio", e.target.value)}
                          />
                        </Field>
                        <Field label="Sertifikasi Detail">
                          <Textarea
                            rows={4}
                            value={p.sertifikasi || ""}
                            onChange={(e) => onUpdate(p.id, "sertifikasi", e.target.value)}
                          />
                        </Field>
                      </>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Highlights
                      </p>
                      <Button size="sm" variant="outline" onClick={() => onAddHighlight(p.id)}>
                        <Plus className="h-4 w-4" /> Tambah Highlight
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <AnimatePresence>
                        {p.highlights.map((h) => (
                          <motion.div
                            key={h.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <IconSelect
                                value={h.icon}
                                onChange={(v) => onUpdateHighlight(p.id, h.id, "icon", v)}
                              />
                              <Input
                                placeholder="Label"
                                value={h.label}
                                onChange={(e) => onUpdateHighlight(p.id, h.id, "label", e.target.value)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                onClick={() => onRemoveHighlight(p.id, h.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              rows={2}
                              placeholder="Isi highlight"
                              value={h.isi}
                              onChange={(e) => onUpdateHighlight(p.id, h.id, "isi", e.target.value)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" onClick={onAdd} className="w-full">
          <Plus className="h-4 w-4" /> Tambah {title === "Dewan Komisaris" ? "Komisaris" : "Direksi"}
        </Button>
      </div>
    </SectionCard>
  );
}

// Unused but exported icons to satisfy potential future usage
export const __icons = { Network, HeartHandshake };