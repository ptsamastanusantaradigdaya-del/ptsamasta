import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Share2, MessageSquare, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG = "kontak";

interface KontakContent {
  hero: { judul: string; subtitle: string };
  info: {
    email: string;
    whatsapp: string;
    waLink: string;
    alamatKantor: string;
    mapsLink: string;
    embedMaps: string;
    alamatLengkap: string;
    jamOperasional: string;
  };
  sosmed: { id: string; label: string; username: string; link: string }[];
  cta: { judul: string; deskripsi: string; tombolWa: string; tombolPenawaran: string };
}

const defaults: KontakContent = {
  hero: {
    judul: "Hubungi Kami",
    subtitle:
      "Kami siap menjadi mitra strategis Anda. Hubungi kami untuk konsultasi dan informasi lebih lanjut mengenai layanan kami.",
  },
  info: {
    email: "info@samastanusantara.com",
    whatsapp: "+62 812-3456-7890",
    waLink: "https://wa.me/6281234567890",
    alamatKantor: "Jl. Tegalan, Palmerah, Matraman, Jakarta Timur",
    mapsLink: "https://maps.google.com/?q=...",
    embedMaps: "",
    alamatLengkap:
      "PT Samasta Nusantara Digdaya\nJl. Tegalan Rt 001 Rw 003\nPalmerah, Kec. Matraman\nKota Jakarta Timur\nDaerah Khusus Ibukota Jakarta",
    jamOperasional:
      "Senin - Jumat: 08:00 - 17:00 WIB\nSabtu: 08:00 - 12:00 WIB\nMinggu & Hari Libur: Tutup",
  },
  sosmed: [
    { id: "facebook", label: "Facebook", username: "@samastanusantara", link: "" },
    { id: "instagram", label: "Instagram", username: "@samastanusantara", link: "" },
    { id: "youtube", label: "YouTube", username: "@samastanusantara", link: "" },
    { id: "tiktok", label: "TikTok", username: "@samastanusantara", link: "" },
  ],
  cta: {
    judul: "Siap Bermitra dengan Kami?",
    deskripsi:
      "Hubungi tim kami sekarang untuk mendapatkan solusi terbaik bagi kebutuhan bisnis Anda",
    tombolWa: "Chat via WhatsApp",
    tombolPenawaran: "Ajukan Penawaran",
  },
};

registerDefaults(SLUG, defaults);

export function KontakPage() {
  const cms = useCmsPage<KontakContent>(SLUG);
  const [infoId, setInfoId] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const c = cms.content;

  const patch = (mut: (draft: KontakContent) => void) =>
    cms.setContent((prev) => {
      const base = (prev ?? defaults) as KontakContent;
      const next: KontakContent = JSON.parse(JSON.stringify(base));
      mut(next);
      return next;
    });

  // Fetch from kontak_info on mount/status change
  useEffect(() => {
    if (cms.status === "ready" || cms.status === "empty") {
      const fetchInfo = async () => {
        try {
          const { data, error } = await supabase
            .from("kontak_info")
            .select("*")
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            setInfoId(data.id);
            patch((d) => {
              d.info.email = data.email || "";
              d.info.whatsapp = data.whatsapp || "";
              d.info.alamatLengkap = data.address || "";
              d.info.alamatKantor = data.address ? data.address.split("\n")[0] : "";
              d.info.jamOperasional = data.business_hours || "";
              d.info.embedMaps = data.map_url || "";
              
              // Map socials
              d.sosmed = d.sosmed.map((s) => {
                if (s.id === "facebook") return { ...s, link: data.facebook || "" };
                if (s.id === "instagram") return { ...s, link: data.instagram || "" };
                if (s.id === "youtube") return { ...s, link: data.youtube || "" };
                if (s.id === "tiktok") return { ...s, link: data.tiktok || "" };
                return s;
              });
            });
          }
        } catch (e: any) {
          console.error("Gagal memuat kontak_info: " + e.message);
        } finally {
          setLoadingInfo(false);
        }
      };
      void fetchInfo();
    }
  }, [cms.status]);

  const handleSave = async () => {
    try {
      // 1. Save CMS layout settings
      await cms.save();

      // 2. Save structured kontak_info
      if (c) {
        const facebook = c.sosmed.find((s) => s.id === "facebook" || s.label.toLowerCase() === "facebook")?.link || "";
        const instagram = c.sosmed.find((s) => s.id === "instagram" || s.label.toLowerCase() === "instagram")?.link || "";
        const youtube = c.sosmed.find((s) => s.id === "youtube" || s.label.toLowerCase() === "youtube")?.link || "";
        const tiktok = c.sosmed.find((s) => s.id === "tiktok" || s.label.toLowerCase() === "tiktok")?.link || "";

        const payload = {
          email: c.info.email,
          whatsapp: c.info.whatsapp,
          phone: c.info.whatsapp, // use whatsapp for phone as default
          address: c.info.alamatLengkap,
          business_hours: c.info.jamOperasional,
          map_url: c.info.embedMaps,
          facebook,
          instagram,
          youtube,
          tiktok,
        };

        console.log("[Contact Save Payload]", payload);

        if (infoId) {
          const { error } = await supabase
            .from("kontak_info")
            .update(payload)
            .eq("id", infoId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("kontak_info")
            .insert([payload])
            .select("id")
            .single();
          if (error) throw error;
          if (data) setInfoId(data.id);
        }

        // Fetch and print fresh database content
        const { data: freshInfo } = await supabase
          .from("kontak_info")
          .select("*")
          .limit(1)
          .maybeSingle();
        console.log("[Contact Database]", freshInfo);
      }
    } catch (e: any) {
      toast.error("Gagal menyimpan data kontak: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Kelola Halaman Kontak"
      description="Atur informasi kontak, media sosial, dan CTA halaman Kontak."
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
            <Field label="Judul Hero">
              <Input value={c.hero.judul} onChange={(e) => patch((d) => { d.hero.judul = e.target.value; })} />
            </Field>
            <Field label="Subtitle Hero">
              <Textarea rows={2} value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} />
            </Field>
          </SectionCard>

          <SectionCard title="Informasi Kontak" icon={<Phone className="h-4 w-4 text-blue-600" />}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Email Perusahaan">
                <Input value={c.info.email} onChange={(e) => patch((d) => { d.info.email = e.target.value; })} />
              </Field>
              <Field label="Nomor WhatsApp">
                <Input value={c.info.whatsapp} onChange={(e) => patch((d) => { d.info.whatsapp = e.target.value; })} />
              </Field>
              <Field label="Link WhatsApp">
                <Input value={c.info.waLink} onChange={(e) => patch((d) => { d.info.waLink = e.target.value; })} />
              </Field>
              <Field label="Alamat Kantor (Singkat)">
                <Input value={c.info.alamatKantor} onChange={(e) => patch((d) => { d.info.alamatKantor = e.target.value; })} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Lokasi Kantor" icon={<MapPin className="h-4 w-4 text-blue-600" />}>
            <Field label="Link Google Maps">
              <Input value={c.info.mapsLink} onChange={(e) => patch((d) => { d.info.mapsLink = e.target.value; })} />
            </Field>
            <Field label="Embed Google Maps (iframe code)" hint="Tempelkan kode <iframe> dari Google Maps">
              <Textarea rows={3} value={c.info.embedMaps} onChange={(e) => patch((d) => { d.info.embedMaps = e.target.value; })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Alamat Lengkap">
                <Textarea rows={5} value={c.info.alamatLengkap} onChange={(e) => patch((d) => { d.info.alamatLengkap = e.target.value; })} />
              </Field>
              <Field label="Jam Operasional">
                <Textarea rows={5} value={c.info.jamOperasional} onChange={(e) => patch((d) => { d.info.jamOperasional = e.target.value; })} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Media Sosial" icon={<Share2 className="h-4 w-4 text-blue-600" />}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Daftar Media Sosial</p>
              <Button size="sm" variant="outline" type="button"
                onClick={() => patch((d) => {
                  const newId = "sosmed-" + crypto.randomUUID().slice(0, 8);
                  d.sosmed.push({ id: newId, label: "", username: "", link: "" });
                })}>
                <Plus className="h-4 w-4 mr-1" /> Tambah Media Sosial
              </Button>
            </div>
            <div className="space-y-3">
              {c.sosmed.map((s, i) => (
                <div key={s.id} className="rounded-md border border-slate-200 p-3 grid md:grid-cols-[150px_1fr_1fr_auto] gap-3 items-end">
                  <Field label="Platform">
                    <Input value={s.label} onChange={(e) => patch((d) => { d.sosmed[i].label = e.target.value; })} placeholder="Contoh: LinkedIn" />
                  </Field>
                  <Field label="Username">
                    <Input value={s.username}
                      onChange={(e) => patch((d) => { d.sosmed[i].username = e.target.value; })} placeholder="Contoh: @username" />
                  </Field>
                  <Field label="Link">
                    <Input value={s.link}
                      onChange={(e) => patch((d) => { d.sosmed[i].link = e.target.value; })} placeholder="Contoh: https://linkedin.com/in/..." />
                  </Field>
                  <Button size="sm" variant="ghost" type="button" className="text-red-500 hover:text-red-700 hover:bg-red-50 mb-1"
                    onClick={() => patch((d) => {
                      d.sosmed = d.sosmed.filter((_, idx) => idx !== i);
                    })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {c.sosmed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada media sosial yang ditambahkan.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="CTA Section" icon={<MessageSquare className="h-4 w-4 text-blue-600" />}>
            <Field label="Judul CTA">
              <Input value={c.cta.judul} onChange={(e) => patch((d) => { d.cta.judul = e.target.value; })} />
            </Field>
            <Field label="Deskripsi CTA">
              <Textarea rows={2} value={c.cta.deskripsi} onChange={(e) => patch((d) => { d.cta.deskripsi = e.target.value; })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Tombol Chat WhatsApp">
                <Input value={c.cta.tombolWa} onChange={(e) => patch((d) => { d.cta.tombolWa = e.target.value; })} />
              </Field>
              <Field label="Tombol Ajukan Penawaran">
                <Input value={c.cta.tombolPenawaran} onChange={(e) => patch((d) => { d.cta.tombolPenawaran = e.target.value; })} />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}
    </CmsPageShell>
  );
}