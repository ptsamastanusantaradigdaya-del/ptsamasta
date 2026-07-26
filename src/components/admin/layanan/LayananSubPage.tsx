import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, LayoutGrid, Plus, Trash2, ChevronUp, ChevronDown,
  Users, GalleryHorizontal, FileText, ListChecks, Workflow, Sparkles, Phone, Eye, EyeOff,
  Settings, X, CheckCircle, Mail, ChevronLeft, ChevronRight,
} from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const nid = () => String(Date.now() + Math.floor(Math.random() * 1000));
const upd = <T extends { id: string }>(a: T[], id: string, p: Partial<T>) =>
  a.map((x) => (x.id === id ? { ...x, ...p } : x));
const rm = <T extends { id: string }>(a: T[], id: string) => a.filter((x) => x.id !== id);
const move = <T,>(a: T[], i: number, d: -1 | 1) => {
  const j = i + d; if (j < 0 || j >= a.length) return a;
  const n = [...a]; [n[i], n[j]] = [n[j], n[i]]; return n;
};

export type SubMeta = {
  slug: string;
  nama: string;
  warnaHero: string;
};

export type FormField = {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "textarea";
  required: boolean;
  active: boolean;
  system: boolean;
  description: string;
};

export const createDefaultFields = (): FormField[] => [
  { id: "nama_lengkap", label: "Nama Lengkap", placeholder: "Masukkan nama lengkap Anda", type: "text", required: true, active: true, system: true, description: "" },
  { id: "nama_perusahaan", label: "Nama Perusahaan / Instansi / Lembaga", placeholder: "Masukkan nama perusahaan / instansi / lembaga Anda", type: "text", required: true, active: true, system: true, description: "" },
  { id: "email", label: "Email", placeholder: "nama@perusahaan.com", type: "email", required: true, active: true, system: true, description: "" },
  { id: "whatsapp", label: "Nomor WhatsApp", placeholder: "+62 812-3456-7890", type: "text", required: true, active: true, system: true, description: "" },
  { id: "deskripsi", label: "Deskripsi Kebutuhan / Proyek", placeholder: "Jelaskan kebutuhan dan detail proyek Anda secara lengkap...", type: "textarea", required: true, active: true, system: true, description: "" },
  { id: "estimasi_waktu", label: "Estimasi Waktu Pengerjaan", placeholder: "Contoh: 3 bulan", type: "text", required: true, active: true, system: true, description: "" },
];

type Lingkup = {
  id: string; nama: string; deskripsi: string; icon: string; gambar: string;
  urutan: number; aktif: boolean;
  form: {
    judul: string; deskripsi: string;
    services: { id: string; nama: string; deskripsi: string; gambar: string; ruangLingkup: string }[];
    proses: { id: string; teks: string }[];
    keunggulan: { id: string; judul: string; deskripsi: string }[];
    bantuanEmail: string;
    bantuanTelepon: string;
    fields: FormField[];
  };
};

export function LayananSubPage({ meta }: { meta: SubMeta }) {
  const defaultCard = {
    nama: meta.nama, deskripsi: "", icon: "leaf", warna: "green",
    tombol: "Lihat Detail Layanan", urutan: 1, aktif: true,
  };
  const [card, setCard] = useState(defaultCard);
  const defaultHero = {
    judul: `Layanan ${meta.nama}`,
    subtitle: "Solusi profesional untuk kebutuhan bisnis Anda.",
    gambar: "", warna: meta.warnaHero,
  };
  const [hero, setHero] = useState(defaultHero);
  const [tentang, setTentang] = useState("");
  const defaultPartners = [
    { id: nid(), nama: "IPLah", logo: "" },
    { id: nid(), nama: "Catalogue", logo: "" },
    { id: nid(), nama: "LKPP", logo: "" },
  ];
  const [partners, setPartners] = useState<{ id: string; nama: string; logo: string }[]>(defaultPartners);
  const defaultClients = [
    { id: nid(), nama: "Pemerintah", emoji: "🏛️" },
    { id: nid(), nama: "Swasta", emoji: "🏢" },
    { id: nid(), nama: "Yayasan", emoji: "🎓" },
    { id: nid(), nama: "Perusahaan", emoji: "🏭" },
  ];
  const [clients, setClients] = useState<{ id: string; nama: string; emoji: string }[]>(defaultClients);
  const defaultKatalog = Array.from({ length: 8 }, () => ({ id: nid(), url: "" }));
  const [katalog, setKatalog] = useState<{ id: string; url: string }[]>(defaultKatalog);

  const defaultLingkup: Lingkup[] = [
    {
      id: nid(), nama: "Ruang Lingkup 1", deskripsi: "", icon: "leaf", gambar: "",
      urutan: 1, aktif: true,
      form: {
        judul: "Ajukan Permintaan Penawaran",
        deskripsi: "Isi formulir di bawah ini untuk mendapatkan penawaran terbaik dari kami. Tim profesional kami akan menghubungi Anda dalam waktu 1×24 jam untuk membahas kebutuhan proyek Anda secara detail.",
        services: [
          { id: nid(), nama: "", deskripsi: "", gambar: "", ruangLingkup: "" },
        ],
        proses: [
          { id: nid(), teks: "Tim kami akan menghubungi Anda dalam waktu 1×24 jam" },
          { id: nid(), teks: "Diskusi kebutuhan dan spesifikasi proyek secara detail" },
          { id: nid(), teks: "Kami akan menyusun proposal dan penawaran harga" },
          { id: nid(), teks: "Mulai pengerjaan setelah kesepakatan tercapai" },
        ],
        keunggulan: [
          { id: nid(), judul: "Profesional", deskripsi: "Tim ahli dengan pengalaman bertahun-tahun" },
          { id: nid(), judul: "Responsif", deskripsi: "Respon cepat dalam 1×24 jam" },
          { id: nid(), judul: "Terpercaya", deskripsi: "Dipercaya oleh ratusan perusahaan" },
        ],
        bantuanEmail: "info@snd.co.id",
        bantuanTelepon: "+62 858-1397-4229",
        fields: createDefaultFields(),
      },
    },
  ];
  const [lingkup, setLingkup] = useState<Lingkup[]>(defaultLingkup);

  const [activeLingkup, setActiveLingkup] = useState(defaultLingkup[0]?.id ?? "");

  // ---- CMS integration (per sub slug) ----
  interface SubContent {
    card: typeof defaultCard;
    hero: typeof defaultHero;
    tentang: string;
    partners: { id: string; nama: string; logo: string }[];
    clients: { id: string; nama: string; emoji: string }[];
    katalog: { id: string; url: string }[];
    lingkup: Lingkup[];
  }
  const defaults: SubContent = { card: defaultCard, hero: defaultHero, tentang: "", partners: defaultPartners, clients: defaultClients, katalog: defaultKatalog, lingkup: defaultLingkup };
  const cms = useCmsPage<SubContent>(`layanan-${meta.slug}`);
  useEffect(() => {
    const fetchDbData = async () => {
      try {
        // 1. Fetch Category
        const { data: catData } = await supabase
          .from("service_categories")
          .select("*")
          .eq("slug", meta.slug)
          .maybeSingle();

        if (catData) {
          console.log("[Service Card] Fetch Result - category:", catData);
          setCard({
            nama: catData.name,
            deskripsi: catData.short_description || "",
            icon: catData.icon || "leaf",
            warna: catData.color_theme || "green",
            tombol: "Lihat Detail Layanan",
            urutan: catData.sort_order || 1,
            aktif: catData.is_active,
          });

          setHero({
            judul: cms.content?.hero?.judul || catData.name,
            subtitle: cms.content?.hero?.subtitle || catData.short_description || "",
            gambar: cms.content?.hero?.gambar || catData.hero_image_url || "",
            warna: cms.content?.hero?.warna || catData.color_theme || meta.warnaHero,
          });

          setTentang(catData.long_description || "");

          // 2. Fetch Scopes
          const { data: scopesData } = await supabase
            .from("service_scopes")
            .select("*")
            .eq("category_id", catData.id)
            .order("sort_order");

          console.log("[Ruang Lingkup] Fetch - service_scopes:", scopesData);
          if (scopesData && scopesData.length > 0) {
            const parsedScopes: Lingkup[] = [];
            const cmsLingkup = cms.content?.lingkup || [];

            for (const scope of scopesData) {
              const savedScope = cmsLingkup.find((x: any) => x.id === scope.id)
                || cmsLingkup.find((x: any) => x.nama?.toLowerCase() === scope.name?.toLowerCase());

              // 3. Fetch scope items
              const { data: itemsData } = await supabase
                .from("service_scope_items")
                .select("*")
                .eq("scope_id", scope.id)
                .order("sort_order");

              const services = (itemsData ?? []).map((item) => {
                const details = item.details as any;
                return {
                  id: item.id,
                  nama: item.name,
                  deskripsi: item.description || "",
                  gambar: item.image_url || "",
                  ruangLingkup: details?.ruangLingkup || "",
                };
              });

              parsedScopes.push({
                id: scope.id,
                nama: scope.name,
                deskripsi: scope.description || "",
                icon: scope.icon || "leaf",
                gambar: scope.image_url || "",
                urutan: scope.sort_order || 1,
                aktif: scope.is_active,
                form: {
                  judul: savedScope?.form?.judul || "Ajukan Permintaan Penawaran",
                  deskripsi: savedScope?.form?.deskripsi || "Isi formulir di bawah ini untuk mendapatkan penawaran terbaik dari kami.",
                  services,
                  proses: savedScope?.form?.proses || [
                    { id: nid(), teks: "Tim kami akan menghubungi Anda dalam waktu 1×24 jam" },
                    { id: nid(), teks: "Diskusi kebutuhan dan spesifikasi proyek secara detail" },
                    { id: nid(), teks: "Kami akan menyusun proposal dan penawaran harga" },
                    { id: nid(), teks: "Mulai pengerjaan setelah kesepakatan tercapai" },
                  ],
                  keunggulan: savedScope?.form?.keunggulan || [
                    { id: nid(), judul: "Profesional", deskripsi: "Tim ahli dengan pengalaman bertahun-tahun" },
                    { id: nid(), judul: "Responsif", deskripsi: "Respon cepat dalam 1×24 jam" },
                    { id: nid(), judul: "Terpercaya", deskripsi: "Dipercaya oleh ratusan perusahaan" },
                  ],
                  bantuanEmail: savedScope?.form?.bantuanEmail || "info@samastanusantara.com",
                  bantuanTelepon: savedScope?.form?.bantuanTelepon || "+62 812-3456-7890",
                  fields: savedScope?.form?.fields || createDefaultFields(),
                },
              });
            }
            setLingkup(parsedScopes);
            setActiveLingkup(parsedScopes[0]?.id ?? "");
          }
          if (cms.content) {
            console.log("[Detail Page] Fetch - cms_pages content:", cms.content);
            if (cms.content.partners && cms.content.partners.length > 0) {
              setPartners(cms.content.partners);
            }
            if (cms.content.clients && cms.content.clients.length > 0) {
              setClients(cms.content.clients);
            }
            if (cms.content.katalog && cms.content.katalog.length > 0) {
              setKatalog(cms.content.katalog);
            }
          }
        }
      } catch (e: any) {
        console.error("Gagal memuat detail sub-layanan: " + e.message);
      }
    };
    if (cms.status === "ready" || cms.status === "empty") {
      void fetchDbData();
    }
  }, [cms.status, meta.slug]);

  const handleSave = async () => {
    try {
      // 1. Get Category ID
      const { data: catData } = await supabase
        .from("service_categories")
        .select("id")
        .eq("slug", meta.slug)
        .single();

      if (!catData) throw new Error("Kategori layanan tidak ditemukan di database");

      console.log("[Hero Save Payload]", hero);
      const payload = { card, hero, tentang, partners, clients, katalog, lingkup };
      console.log("[Detail Page] Save - payload:", JSON.stringify(payload, null, 2));

      // 2. Update service_categories
      const { data: saveRes, error: saveErr } = await supabase
        .from("service_categories")
        .update({
          name: card.nama,
          short_description: card.deskripsi,
          long_description: tentang,
          icon: card.icon,
          color_theme: card.warna,
          hero_image_url: hero.gambar,
          is_active: card.aktif,
          sort_order: card.urutan,
        })
        .eq("id", catData.id)
        .select();
      if (saveErr) throw saveErr;
      console.log("[Detail Page] Update - category response:", saveRes);

      // 3. Sync service_scopes table
      const { data: existingScopes } = await supabase
        .from("service_scopes")
        .select("id")
        .eq("category_id", catData.id);
      const currentScopeIds = lingkup.map((l) => l.id);
      const toDeleteScopes = (existingScopes ?? []).map((s) => s.id).filter((id) => !currentScopeIds.includes(id));

      if (toDeleteScopes.length > 0) {
        // Delete child scope items first to prevent foreign key violations or orphan data
        const { error: delItemsErr } = await supabase.from("service_scope_items").delete().in("scope_id", toDeleteScopes);
        if (delItemsErr) throw delItemsErr;

        const { data: delRes, error: delErr } = await supabase
          .from("service_scopes")
          .delete()
          .in("id", toDeleteScopes)
          .select();
        if (delErr) throw delErr;
        console.log("[Ruang Lingkup] Delete - IDs:", toDeleteScopes, "response:", delRes);
      }

      const updatedLingkup = [];

      for (const l of lingkup) {
        const isNewScope = !existingScopes?.some((s) => s.id === l.id);
        const scopeSlug = l.nama
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const scopePayload = {
          category_id: catData.id,
          name: l.nama,
          slug: scopeSlug || "scope-" + l.id.slice(0, 8),
          description: l.deskripsi,
          image_url: l.gambar,
          sort_order: l.urutan,
          is_active: l.aktif,
        };

        let finalScopeId = l.id;
        if (isNewScope) {
          console.log("[Ruang Lingkup] Create - payload:", scopePayload);
          const { data: insertedScope, error: insErr } = await supabase
            .from("service_scopes")
            .insert([scopePayload])
            .select("id")
            .single();
          if (insErr) throw insErr;
          if (insertedScope) finalScopeId = insertedScope.id;
        } else {
          console.log("[Ruang Lingkup] Update - ID:", l.id, "payload:", scopePayload);
          const { error: updErr } = await supabase.from("service_scopes").update(scopePayload).eq("id", l.id);
          if (updErr) throw updErr;
        }

        // 4. Sync service_scope_items for this scope
        const { data: existingItems } = await supabase
          .from("service_scope_items")
          .select("id")
          .eq("scope_id", finalScopeId);
        const currentItemIds = l.form.services.map((s) => s.id);
        const toDeleteItems = (existingItems ?? []).map((item) => item.id).filter((id) => !currentItemIds.includes(id));

        if (toDeleteItems.length > 0) {
          const { error: delItemErr } = await supabase.from("service_scope_items").delete().in("id", toDeleteItems);
          if (delItemErr) throw delItemErr;
        }

        const upsertItemsData = l.form.services.map((item, idx) => {
          const isNewItem = typeof item.id === "number" || !item.id.includes("-");
          return {
            id: isNewItem ? undefined : item.id,
            scope_id: finalScopeId,
            name: item.nama || "Layanan",
            description: item.deskripsi,
            image_url: item.gambar,
            details: { ruangLingkup: item.ruangLingkup } as any,
            sort_order: idx,
            is_active: true,
          };
        });

        if (upsertItemsData.length > 0) {
          const { error: upsertItemsErr } = await supabase.from("service_scope_items").upsert(upsertItemsData);
          if (upsertItemsErr) throw upsertItemsErr;
        }

        updatedLingkup.push({
          ...l,
          id: finalScopeId,
        });
      }

      // 5. Save layouts to cms_pages sub-slug with correct database scope IDs!
      const newContent = { card, hero, tentang, partners, clients, katalog, lingkup: updatedLingkup };
      cms.setContent(newContent);
      await cms.save(newContent);

      // 6. Cross-sync to cms_pages overview slug "layanan" so overview page matches instantly!
      const { data: overviewPage } = await supabase
        .from("cms_pages")
        .select("content")
        .eq("slug", "layanan")
        .maybeSingle();

      if (overviewPage && overviewPage.content) {
        const overviewContent = overviewPage.content as any;
        if (Array.isArray(overviewContent.cards)) {
          const updatedCards = overviewContent.cards.map((c: any) => {
            if (c.id === meta.slug) {
              return {
                ...c,
                nama: card.nama,
                deskripsi: card.deskripsi,
                icon: card.icon,
                warna: card.warna,
                tombol: card.tombol,
                aktif: card.aktif,
              };
            }
            return c;
          });

          const { error: overviewErr } = await supabase
            .from("cms_pages")
            .update({ content: { ...overviewContent, cards: updatedCards } })
            .eq("slug", "layanan");
          if (overviewErr) throw overviewErr;
        }
      }

      toast.success("Sub-layanan berhasil disimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan sub-layanan: " + e.message);
    }
  };

  const patchL = (id: string, patch: Partial<Lingkup>) =>
    setLingkup((arr) => arr.map(x => x.id === id ? { ...x, ...patch } : x));
  const patchForm = (id: string, patch: Partial<Lingkup["form"]>) =>
    setLingkup((arr) => arr.map((x) => x.id === id ? { ...x, form: { ...x.form, ...patch } } : x));

  const movePartner = (i: number, direction: "up" | "down") => {
    const target = direction === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= partners.length) return;
    console.log("[Detail Page] Reorder - partner:", partners[i].nama, "direction:", direction);
    setPartners((prev) => {
      const next = [...prev];
      const temp = next[i];
      next[i] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const moveKatalog = (i: number, direction: "left" | "right") => {
    const target = direction === "left" ? i - 1 : i + 1;
    if (target < 0 || target >= katalog.length) return;
    console.log("[Detail Page] Reorder - katalog item index:", i, "direction:", direction);
    setKatalog((prev) => {
      const next = [...prev];
      const temp = next[i];
      next[i] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const [previewFormOpen, setPreviewFormOpen] = useState(false);

  const addField = (scopeId: string) => {
    setLingkup((arr) =>
      arr.map((x) => {
        if (x.id !== scopeId) return x;
        const newField: FormField = {
          id: "field_" + nid(),
          label: "Kolom Baru",
          placeholder: "Masukkan data",
          type: "text",
          required: false,
          active: true,
          system: false,
          description: "",
        };
        return {
          ...x,
          form: {
            ...x.form,
            fields: [...(x.form.fields || []), newField],
          },
        };
      })
    );
  };

  const removeField = (scopeId: string, fieldId: string) => {
    console.log("[Service Form] Delete - field:", fieldId, "from scope:", scopeId);
    setLingkup((arr) =>
      arr.map((x) => {
        if (x.id !== scopeId) return x;
        return {
          ...x,
          form: {
            ...x.form,
            fields: (x.form.fields || []).filter((f) => f.id !== fieldId),
          },
        };
      })
    );
  };

  const updateField = (scopeId: string, fieldId: string, patch: Partial<FormField>) => {
    setLingkup((arr) =>
      arr.map((x) => {
        if (x.id !== scopeId) return x;
        return {
          ...x,
          form: {
            ...x.form,
            fields: (x.form.fields || []).map((f) =>
              f.id === fieldId ? { ...f, ...patch } : f
            ),
          },
        };
      })
    );
  };

  const moveField = (scopeId: string, index: number, dir: -1 | 1) => {
    setLingkup((arr) =>
      arr.map((x) => {
        if (x.id !== scopeId) return x;
        const fields = [...(x.form.fields || [])];
        const targetIndex = index + dir;
        if (targetIndex < 0 || targetIndex >= fields.length) return x;
        [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
        return {
          ...x,
          form: {
            ...x.form,
            fields,
          },
        };
      })
    );
  };

  return (
    <CmsPageShell
      title={`Kelola Layanan — ${meta.nama}`}
      description="Kelola seluruh konten sub-layanan, ruang lingkup, dan form penawaran."
      status={cms.status}
      error={cms.error}
      updatedAt={cms.updatedAt}
      saving={cms.saving}
      defaults={defaults}
      seed={cms.seed}
      save={handleSave}
      reload={cms.reload}
    >
      <div className="space-y-6">
      <Tabs defaultValue="detail" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="card">Card Layanan</TabsTrigger>
          <TabsTrigger value="detail">Halaman Detail</TabsTrigger>
          <TabsTrigger value="lingkup">Ruang Lingkup</TabsTrigger>
          <TabsTrigger value="form">Form Penawaran</TabsTrigger>
        </TabsList>

        {/* CARD */}
        <TabsContent value="card" className="space-y-6 mt-0">
          <SectionCard title="Card pada Halaman Layanan" icon={<LayoutGrid className="h-4 w-4 text-blue-600" />}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nama Layanan">
                <Input value={card.nama} onChange={(e) => setCard({ ...card, nama: e.target.value })} />
              </Field>
              <Field label="Teks Tombol">
                <Input value={card.tombol} onChange={(e) => setCard({ ...card, tombol: e.target.value })} />
              </Field>
            </div>
            <Field label="Deskripsi Singkat">
              <Textarea rows={3} value={card.deskripsi} onChange={(e) => setCard({ ...card, deskripsi: e.target.value })} />
            </Field>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Urutan">
                <Input type="number" value={card.urutan} onChange={(e) => setCard({ ...card, urutan: Number(e.target.value) })} />
              </Field>
              <Field label="Warna Card"><Input value={card.warna} onChange={(e) => setCard({ ...card, warna: e.target.value })} /></Field>
              <Field label="Status Tampil">
                <div className="flex items-center gap-2 h-9">
                  <Switch checked={card.aktif} onCheckedChange={(v) => setCard({ ...card, aktif: v })} />
                  <span className="text-xs text-slate-500">{card.aktif ? "Aktif" : "Disembunyikan"}</span>
                </div>
              </Field>
            </div>
          </SectionCard>
        </TabsContent>

        {/* DETAIL */}
        <TabsContent value="detail" className="space-y-6 mt-0">
          <SectionCard title="Hero Section" icon={<ImageIcon className="h-4 w-4 text-blue-600" />}>
            <Field label="Judul Hero">
              <Input value={hero.judul} onChange={(e) => setHero({ ...hero, judul: e.target.value })} />
            </Field>
            <Field label="Subtitle Hero">
              <Textarea rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Gambar Hero">
                <UploadBox height="h-40" folder={`layanan/${meta.slug}/hero`} value={hero.gambar} onChange={(url) => setHero({ ...hero, gambar: url ?? "" })} />
              </Field>
              <Field label="Warna Background Hero">
                <Input 
                  type="color" 
                  value={hero.warna && /^#[0-9A-F]{6}$/i.test(hero.warna) ? hero.warna : meta.warnaHero} 
                  onChange={(e) => setHero({ ...hero, warna: e.target.value })} 
                  className="h-10 w-24 p-1" 
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Tentang Layanan" icon={<FileText className="h-4 w-4 text-blue-600" />}>
            <Field label="Deskripsi Tentang Layanan">
              <Textarea rows={5} value={tentang} onChange={(e) => setTentang(e.target.value)} />
            </Field>
          </SectionCard>

          <SectionCard title="Logo Partner / Marketplace" icon={<LayoutGrid className="h-4 w-4 text-blue-600" />}>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {partners.map((p, i) => (
                <div key={p.id} className="rounded-md border border-slate-200 bg-white p-3 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-semibold">Partner {i + 1}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => movePartner(i, "up")}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => movePartner(i, "down")}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Input value={p.nama} placeholder="Nama partner"
                    onChange={(e) => setPartners(upd(partners, p.id, { nama: e.target.value }))} />
                  <UploadBox height="h-20" label="Upload logo" folder={`layanan/${meta.slug}/partners`} value={p.logo} onChange={(url) => setPartners(upd(partners, p.id, { logo: url ?? "" }))} />
                  <Button size="sm" variant="ghost" className="w-full text-red-500 hover:text-red-700"
                    onClick={() => {
                      console.log("[Detail Page] Delete - partner:", p.nama);
                      setPartners(rm(partners, p.id));
                    }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Hapus Partner
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full"
              onClick={() => setPartners([...partners, { id: nid(), nama: "", logo: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Partner
            </Button>
          </SectionCard>

          <SectionCard title="Kategori Client" icon={<Users className="h-4 w-4 text-blue-600" />}>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {clients.map((c) => (
                <div key={c.id} className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
                  <Input value={c.emoji} placeholder="🏢" maxLength={4}
                    onChange={(e) => setClients(upd(clients, c.id, { emoji: e.target.value }))} />
                  <Input value={c.nama} placeholder="Nama kategori"
                    onChange={(e) => setClients(upd(clients, c.id, { nama: e.target.value }))} />
                  <Button size="sm" variant="ghost" className="w-full text-red-500 hover:text-red-700" onClick={() => {
                    console.log("[Detail Page] Delete - client category:", c.nama);
                    setClients(rm(clients, c.id));
                  }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Hapus Kategori
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full"
              onClick={() => setClients([...clients, { id: nid(), nama: "", emoji: "🏢" }])}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Kategori
            </Button>
          </SectionCard>

          <SectionCard title="Galeri / Katalog" icon={<GalleryHorizontal className="h-4 w-4 text-blue-600" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {katalog.map((k, i) => (
                <div key={k.id} className="space-y-2 rounded-md border border-slate-100 p-2 bg-slate-50/50">
                  <UploadBox height="h-28" folder={`layanan/${meta.slug}/katalog`} value={k.url} onChange={(url) => setKatalog(katalog.map(x => x.id === k.id ? { ...x, url: url ?? "" } : x))} />
                  <div className="flex justify-between items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveKatalog(i, "left")}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 flex-1 text-red-500 hover:text-red-700" onClick={() => {
                      console.log("[Detail Page] Delete - catalog item ID:", k.id);
                      setKatalog(katalog.filter((x) => x.id !== k.id));
                    }}>
                      <Trash2 className="h-3.5 w-3.5 mx-auto" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveKatalog(i, "right")}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => setKatalog([...katalog, { id: nid(), url: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Gambar
            </Button>
          </SectionCard>
        </TabsContent>

        {/* LINGKUP */}
        <TabsContent value="lingkup" className="space-y-6 mt-0">
          <SectionCard title="Ruang Lingkup Layanan" icon={<ListChecks className="h-4 w-4 text-blue-600" />}
            description="Setiap ruang lingkup tampil sebagai card di halaman detail dan memiliki Form Penawaran sendiri.">
            <AnimatePresence>
              {lingkup.map((l, i) => (
                <motion.div key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-0.5 mt-1">
                      <button onClick={() => setLingkup(move(lingkup, i, -1))}><ChevronUp className="h-4 w-4 text-slate-400" /></button>
                      <button onClick={() => setLingkup(move(lingkup, i, 1))}><ChevronDown className="h-4 w-4 text-slate-400" /></button>
                    </div>
                    <div className="flex-1 grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
                      <Field label="Nama Ruang Lingkup">
                        <Input value={l.nama} onChange={(e) => patchL(l.id, { nama: e.target.value })} />
                      </Field>
                      <Field label="Urutan">
                        <Input type="number" value={l.urutan} className="w-24"
                          onChange={(e) => patchL(l.id, { urutan: Number(e.target.value) })} />
                      </Field>
                      <Field label="Status">
                        <div className="flex items-center gap-2 h-9">
                          <Switch checked={l.aktif} onCheckedChange={(v) => patchL(l.id, { aktif: v })} />
                          {l.aktif ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                        </div>
                      </Field>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => {
                      console.log("[Ruang Lingkup] UI Delete clicked for scope:", l.nama);
                      setLingkup(rm(lingkup, l.id));
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Field label="Deskripsi">
                    <Textarea rows={2} value={l.deskripsi} onChange={(e) => patchL(l.id, { deskripsi: e.target.value })} />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Icon (nama lucide)">
                      <Input value={l.icon} onChange={(e) => patchL(l.id, { icon: e.target.value })} />
                    </Field>
                    <Field label="Gambar">
                      <UploadBox
                        height="h-24"
                        folder={`layanan/${meta.slug}/lingkup/${l.id}`}
                        value={l.gambar}
                        onChange={(url) => patchL(l.id, { gambar: url ?? "" })}
                      />
                    </Field>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
                    <p className="text-xs text-slate-500">Form Penawaran ruang lingkup ini</p>
                    <Button size="sm" variant="outline" onClick={() => setActiveLingkup(l.id)}>
                      Kelola Form
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="outline" className="w-full"
              onClick={() => setLingkup([...lingkup, {
                id: nid(), nama: "Ruang Lingkup Baru", deskripsi: "", icon: "leaf", gambar: "",
                urutan: lingkup.length + 1, aktif: true,
                form: {
                  judul: "Ajukan Permintaan Penawaran", deskripsi: "", services: [],
                  proses: [], keunggulan: [], bantuanEmail: "", bantuanTelepon: "",
                  fields: createDefaultFields(),
                },
              }])}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Ruang Lingkup
            </Button>
          </SectionCard>
        </TabsContent>

        {/* FORM */}
        <TabsContent value="form" className="space-y-6 mt-0">
          <SectionCard title="Pilih Ruang Lingkup" icon={<ListChecks className="h-4 w-4 text-blue-600" />}>
            <div className="flex flex-wrap gap-2">
              {lingkup.map((l) => (
                <button key={l.id} onClick={() => setActiveLingkup(l.id)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${activeLingkup === l.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
                  {l.nama || "(tanpa nama)"}
                </button>
              ))}
            </div>
          </SectionCard>

          {lingkup.filter((l) => l.id === activeLingkup).map((l) => (
            <div key={l.id} className="space-y-6">
              <SectionCard title="Header Form" icon={<FileText className="h-4 w-4 text-blue-600" />}>
                <Field label="Judul Form">
                  <Input value={l.form.judul} onChange={(e) => patchForm(l.id, { judul: e.target.value })} />
                </Field>
                <Field label="Deskripsi Form">
                  <Textarea rows={3} value={l.form.deskripsi}
                    onChange={(e) => patchForm(l.id, { deskripsi: e.target.value })} />
                </Field>
              </SectionCard>

              <SectionCard title='Daftar "Our Service"' icon={<LayoutGrid className="h-4 w-4 text-blue-600" />}
                description="Daftar layanan yang dapat dipilih pada form. Setiap item memiliki gambar dan ruang lingkup pekerjaan.">
                {l.form.services.map((s, si) => (
                  <div key={s.id} className="rounded-md border border-slate-200 p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => patchForm(l.id, { services: move(l.form.services, si, -1) })}><ChevronUp className="h-4 w-4 text-slate-400" /></button>
                        <button type="button" onClick={() => patchForm(l.id, { services: move(l.form.services, si, 1) })}><ChevronDown className="h-4 w-4 text-slate-400" /></button>
                      </div>
                      <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <Field label="Nama Layanan">
                          <Input value={s.nama} onChange={(e) => patchForm(l.id, { services: upd(l.form.services, s.id, { nama: e.target.value }) })} />
                        </Field>
                        <Field label="Gambar">
                          <UploadBox
                            height="h-20"
                            folder={`layanan/${meta.slug}/form-services/${s.id}`}
                            value={s.gambar}
                            onChange={(url) => patchForm(l.id, { services: upd(l.form.services, s.id, { gambar: url ?? "" }) })}
                          />
                        </Field>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => {
                        console.log("[Service Form] Delete - form sub-service:", s.nama);
                        patchForm(l.id, { services: rm(l.form.services, s.id) });
                      }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <Field label="Deskripsi">
                      <Textarea rows={2} value={s.deskripsi}
                        onChange={(e) => patchForm(l.id, { services: upd(l.form.services, s.id, { deskripsi: e.target.value }) })} />
                    </Field>
                    <Field label="Ruang Lingkup Pekerjaan" hint="Pisahkan tiap poin dengan baris baru">
                      <Textarea rows={4} value={s.ruangLingkup}
                        onChange={(e) => patchForm(l.id, { services: upd(l.form.services, s.id, { ruangLingkup: e.target.value }) })} />
                    </Field>
                  </div>
                ))}
                <Button variant="outline" className="w-full"
                  onClick={() => patchForm(l.id, { services: [...l.form.services, { id: nid(), nama: "", deskripsi: "", gambar: "", ruangLingkup: "" }] })}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Sub-Lingkup
                </Button>
              </SectionCard>

              <SectionCard title="Proses Selanjutnya" icon={<Workflow className="h-4 w-4 text-blue-600" />}>
                {l.form.proses.map((p, pi) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => patchForm(l.id, { proses: move(l.form.proses, pi, -1) })} disabled={pi === 0}>
                        <ChevronUp className={`h-3 w-3 ${pi === 0 ? "text-slate-200" : "text-slate-500"}`} />
                      </button>
                      <button type="button" onClick={() => patchForm(l.id, { proses: move(l.form.proses, pi, 1) })} disabled={pi === l.form.proses.length - 1}>
                        <ChevronDown className={`h-3 w-3 ${pi === l.form.proses.length - 1 ? "text-slate-200" : "text-slate-500"}`} />
                      </button>
                    </div>
                    <span className="h-7 w-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">{pi + 1}</span>
                    <Input className="flex-1" value={p.teks} onChange={(e) => patchForm(l.id, { proses: upd(l.form.proses, p.id, { teks: e.target.value }) })} />
                    <Button size="sm" variant="ghost" onClick={() => {
                      console.log("[Service Form] Delete - form process step index:", pi);
                      patchForm(l.id, { proses: rm(l.form.proses, p.id) });
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full"
                  onClick={() => patchForm(l.id, { proses: [...l.form.proses, { id: nid(), teks: "" }] })}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Langkah
                </Button>
              </SectionCard>

              <SectionCard title="Mengapa Memilih Kami" icon={<Sparkles className="h-4 w-4 text-blue-600" />}>
                {l.form.keunggulan.map((k, ki) => (
                  <div key={k.id} className="rounded-md border border-slate-200 p-3 grid md:grid-cols-[auto_1fr_2fr_auto] gap-3 items-end">
                    <div className="flex flex-col gap-0.5 mb-2">
                      <button type="button" onClick={() => patchForm(l.id, { keunggulan: move(l.form.keunggulan, ki, -1) })} disabled={ki === 0}>
                        <ChevronUp className={`h-4 w-4 ${ki === 0 ? "text-slate-200" : "text-slate-500"}`} />
                      </button>
                      <button type="button" onClick={() => patchForm(l.id, { keunggulan: move(l.form.keunggulan, ki, 1) })} disabled={ki === l.form.keunggulan.length - 1}>
                        <ChevronDown className={`h-4 w-4 ${ki === l.form.keunggulan.length - 1 ? "text-slate-200" : "text-slate-500"}`} />
                      </button>
                    </div>
                    <Field label="Judul">
                      <Input value={k.judul} onChange={(e) => patchForm(l.id, { keunggulan: upd(l.form.keunggulan, k.id, { judul: e.target.value }) })} />
                    </Field>
                    <Field label="Deskripsi">
                      <Input value={k.deskripsi} onChange={(e) => patchForm(l.id, { keunggulan: upd(l.form.keunggulan, k.id, { deskripsi: e.target.value }) })} />
                    </Field>
                    <Button size="sm" variant="ghost" onClick={() => {
                      console.log("[Service Form] Delete - form advantage:", k.judul);
                      patchForm(l.id, { keunggulan: rm(l.form.keunggulan, k.id) });
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full"
                  onClick={() => patchForm(l.id, { keunggulan: [...l.form.keunggulan, { id: nid(), judul: "", deskripsi: "" }] })}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Keunggulan
                </Button>
              </SectionCard>

              <SectionCard title="Butuh Bantuan?" icon={<Phone className="h-4 w-4 text-blue-600" />}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Email Bantuan">
                    <Input value={l.form.bantuanEmail} onChange={(e) => patchForm(l.id, { bantuanEmail: e.target.value })} />
                  </Field>
                  <Field label="Telepon Bantuan">
                    <Input value={l.form.bantuanTelepon} onChange={(e) => patchForm(l.id, { bantuanTelepon: e.target.value })} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="Pengaturan Kolom Form Ajukan Penawaran" icon={<Settings className="h-4 w-4 text-blue-600" />}
                description="Kelola kolom input tambahan atau sesuaikan kolom sistem yang muncul pada formulir Ajukan Penawaran di Website Publik.">
                <div className="space-y-4">
                  {(l.form.fields || []).map((f, fi) => (
                    <div key={f.id} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button type="button" onClick={() => moveField(l.id, fi, -1)} disabled={fi === 0}>
                              <ChevronUp className={`h-4 w-4 ${fi === 0 ? "text-slate-200" : "text-slate-500"}`} />
                            </button>
                            <button type="button" onClick={() => moveField(l.id, fi, 1)} disabled={fi === (l.form.fields || []).length - 1}>
                              <ChevronDown className={`h-4 w-4 ${fi === (l.form.fields || []).length - 1 ? "text-slate-200" : "text-slate-500"}`} />
                            </button>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {f.system ? "Kolom Sistem" : "Kolom Kustom"}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            (ID: {f.id})
                          </span>
                        </div>
                        {!f.system && (
                          <Button size="sm" variant="ghost" onClick={() => removeField(l.id, f.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Nama / Judul Kolom">
                          <Input value={f.label} onChange={(e) => updateField(l.id, f.id, { label: e.target.value })} />
                        </Field>
                        <Field label="Placeholder">
                          <Input value={f.placeholder} onChange={(e) => updateField(l.id, f.id, { placeholder: e.target.value })} />
                        </Field>
                      </div>

                      <Field label="Deskripsi / Petunjuk Pengisian">
                        <Input value={f.description} onChange={(e) => updateField(l.id, f.id, { description: e.target.value })} />
                      </Field>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-600">Wajib Diisi (Required)</label>
                          <Switch
                            checked={f.required}
                            disabled={f.system} // System fields required status is locked
                            onCheckedChange={(v) => updateField(l.id, f.id, { required: v })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-600">Status Aktif</label>
                          <Switch
                            checked={f.active}
                            disabled={f.system} // System fields active status is locked
                            onCheckedChange={(v) => updateField(l.id, f.id, { active: v })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => addField(l.id)}>
                      <Plus className="h-4 w-4 mr-1" /> Tambah Kolom Kustom
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={() => {
                       console.log("[Service Form] Preview - opening form modal preview");
                       setPreviewFormOpen(true);
                     }}>
                      <Eye className="h-4 w-4 mr-1" /> Preview Form
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </div>
          ))}

          {lingkup.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
              Belum ada ruang lingkup. Tambahkan terlebih dahulu pada tab "Ruang Lingkup".
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>

      {/* Preview Form Modal */}
      <AnimatePresence>
        {previewFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setPreviewFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Preview Form Ajukan Penawaran (Website Publik)</h3>
              </div>

              {lingkup.filter((l) => l.id === activeLingkup).map((l) => (
                <div key={l.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  {/* Form Preview */}
                  <div className="lg:col-span-2 space-y-6 border border-slate-100 p-5 rounded-xl bg-slate-50/20">
                    <div className="text-center mb-6">
                      <span className="inline-block px-3 py-1 bg-[#1E3A8A] text-white text-[10px] font-semibold rounded-full mb-2">
                        {l.nama}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">{l.form.judul}</h4>
                      <p className="text-slate-500 text-xs mt-1">{l.form.deskripsi}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Layanan Kami (Our Services) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 text-left">
                          Layanan Kami <span className="text-red-500">*</span>
                          <span className="text-slate-400 font-normal ml-1">(Dapat memilih lebih dari satu)</span>
                        </label>
                        <div className="space-y-2">
                          {l.form.services.map((s, idx) => (
                            <div key={idx} className="rounded-lg border border-slate-200 p-3 bg-white flex items-start gap-2.5">
                              <input type="checkbox" className="mt-0.5" disabled />
                              <div className="text-left">
                                <h5 className="font-semibold text-xs text-slate-800">{s.nama || "Nama Layanan"}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{s.deskripsi}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Fields */}
                      {(l.form.fields || []).filter(f => f.active).map((f) => (
                        <div key={f.id} className="space-y-1.5 text-left">
                          <label className="block text-xs font-bold text-slate-700 text-left">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </label>
                          
                          {f.type === "textarea" ? (
                            <Textarea placeholder={f.placeholder} disabled className="text-xs" rows={3} />
                          ) : (
                            <Input type={f.type} placeholder={f.placeholder} disabled className="text-xs" />
                          )}
                          
                          {f.description && (
                            <p className="text-[10px] text-slate-400 italic text-left">{f.description}</p>
                          )}
                        </div>
                      ))}

                      <Button disabled className="w-full bg-[#1E3A8A] text-white text-xs py-5">
                        Kirim Permintaan
                      </Button>
                    </div>
                  </div>

                  {/* Sidebar Preview */}
                  <div className="space-y-4 text-xs text-left">
                    {/* Proses */}
                    <div className="bg-[#1E3A8A] rounded-xl p-5 text-white space-y-3">
                      <h5 className="font-bold">Proses Selanjutnya</h5>
                      <div className="space-y-3">
                        {l.form.proses.map((step, idx) => (
                          <div key={step.id} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </div>
                            <p className="text-white/90 text-[10px] leading-relaxed flex-1 text-left">{step.teks}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keunggulan */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                      <h5 className="font-bold text-slate-900">Mengapa Memilih Kami?</h5>
                      <div className="space-y-3">
                        {l.form.keunggulan.map((item) => (
                          <div key={item.id} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-left">
                              <p className="font-semibold text-slate-800">{item.judul}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5">{item.deskripsi}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bantuan */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
                      <h5 className="font-bold text-slate-900">Butuh Bantuan?</h5>
                      <p className="text-slate-400 text-[10px]">Hubungi tim kami jika Anda memiliki pertanyaan</p>
                      <div className="space-y-1.5 text-slate-600 font-medium">
                        <p className="flex items-center gap-1.5"><Mail size={12} /> {l.form.bantuanEmail}</p>
                        <p className="flex items-center gap-1.5"><Phone size={12} /> {l.form.bantuanTelepon}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CmsPageShell>
  );
}