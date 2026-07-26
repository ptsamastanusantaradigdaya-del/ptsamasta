import { useEffect, useState } from "react";
import { Settings, Shield, Globe, ShieldAlert, Phone, HelpCircle } from "lucide-react";
import { SectionCard, Field } from "@/components/admin/tentang-kami/SectionCard";
import { UploadBox } from "@/components/admin/tentang-kami/UploadBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CmsPageShell } from "@/components/admin/cms/CmsPageShell";
import { useCmsPage } from "@/hooks/useCmsPage";
import { registerDefaults } from "@/lib/cms/defaults";
import { toast } from "sonner";

const SLUG = "pengaturan";

interface SettingsContent {
  umum: {
    namaSitus: string;
    deskripsiSitus: string;
    logoUrl: string;
    copyrightText: string;
  };
  keamanan: {
    izinkanRegistrasi: boolean;
    modePemeliharaan: boolean;
  };
  kontak: {
    emailUtama: string;
    whatsappUtama: string;
  };
}

const defaults: SettingsContent = {
  umum: {
    namaSitus: "PT Samasta Nusantara Digdaya",
    deskripsiSitus: "Penyedia solusi terintegrasi dan profesional untuk berbagai sektor industri strategis di Indonesia.",
    logoUrl: "",
    copyrightText: "© 2026 PT Samasta Nusantara Digdaya. All rights reserved.",
  },
  keamanan: {
    izinkanRegistrasi: true,
    modePemeliharaan: false,
  },
  kontak: {
    emailUtama: "info@snd.co.id",
    whatsappUtama: "+62 856-1397-4228",
  },
};

registerDefaults(SLUG, defaults);

export function PengaturanPage() {
  const cms = useCmsPage<SettingsContent>(SLUG);
  const c = cms.content;

  const patch = (mut: (d: SettingsContent) => void) =>
    cms.setContent((prev) => {
      const next: SettingsContent = JSON.parse(JSON.stringify((prev ?? defaults) as SettingsContent));
      mut(next);
      return next;
    });

  const handleSave = async () => {
    console.log("[PengaturanPage] handleSave triggered");
    try {
      console.log("[PengaturanPage] calling cms.save()...");
      await cms.save();
      console.log("[PengaturanPage] cms.save() call completed");
      toast.success("Pengaturan situs berhasil disimpan");
    } catch (e: any) {
      console.error("[PengaturanPage] handleSave error:", e);
      toast.error("Gagal menyimpan pengaturan: " + e.message);
    }
  };

  return (
    <CmsPageShell
      title="Pengaturan Sistem & Website"
      description="Konfigurasi parameter global, pembatasan keamanan, dan informasi umum website."
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Umum */}
            <SectionCard title="Pengaturan Umum Situs" icon={<Globe className="h-5 w-5 text-blue-600" />}>
              <div className="space-y-4">
                <Field label="Nama Website / Perusahaan">
                  <Input
                    value={c.umum.namaSitus}
                    onChange={(e) => patch((d) => { d.umum.namaSitus = e.target.value; })}
                  />
                </Field>
                <Field label="Deskripsi Singkat / Tagline">
                  <Textarea
                    rows={3}
                    value={c.umum.deskripsiSitus}
                    onChange={(e) => patch((d) => { d.umum.deskripsiSitus = e.target.value; })}
                  />
                </Field>
                <Field label="Teks Copyright Footer">
                  <Input
                    value={c.umum.copyrightText}
                    onChange={(e) => patch((d) => { d.umum.copyrightText = e.target.value; })}
                  />
                </Field>
              </div>
            </SectionCard>

            {/* Logo */}
            <SectionCard title="Logo Website" icon={<Settings className="h-5 w-5 text-blue-600" />}>
              <Field label="Logo Perusahaan" hint="Unggah berkas gambar logo untuk digunakan di header & footer">
                <UploadBox
                  height="h-44"
                  value={c.umum.logoUrl}
                  onChange={(url) => patch((d) => { d.umum.logoUrl = url ?? ""; })}
                />
              </Field>
            </SectionCard>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Keamanan & Pembatasan */}
            <SectionCard title="Keamanan & Akses" icon={<Shield className="h-5 w-5 text-red-600" />}>
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1 pr-4">
                    <Label className="text-sm font-semibold text-slate-900">Izinkan Pendaftaran Admin Baru</Label>
                    <p className="text-xs text-slate-500">
                      Aktifkan fitur ini jika Anda ingin mengizinkan pengguna mendaftar sendiri sebagai admin via halaman login. Matikan untuk mencegah pendaftaran publik yang tidak sah.
                    </p>
                  </div>
                  <Switch
                    checked={c.keamanan.izinkanRegistrasi}
                    onCheckedChange={(checked) => patch((d) => { d.keamanan.izinkanRegistrasi = checked; })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-sm font-semibold text-slate-900">Mode Pemeliharaan (Maintenance Mode)</Label>
                    <p className="text-xs text-slate-500">
                      Aktifkan mode pemeliharaan untuk mengunci website publik dan menampilkan pesan "Dalam Pemeliharaan" bagi pengunjung umum.
                    </p>
                  </div>
                  <Switch
                    checked={c.keamanan.modePemeliharaan}
                    onCheckedChange={(checked) => patch((d) => { d.keamanan.modePemeliharaan = checked; })}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Kontak Utama */}
            <SectionCard title="Kontak & Layanan Utama" icon={<Phone className="h-5 w-5 text-blue-600" />}>
              <div className="space-y-4">
                <Field label="Email Utama Layanan">
                  <Input
                    value={c.kontak.emailUtama}
                    onChange={(e) => patch((d) => { d.kontak.emailUtama = e.target.value; })}
                  />
                </Field>
                <Field label="WhatsApp Utama Layanan">
                  <Input
                    value={c.kontak.whatsappUtama}
                    onChange={(e) => patch((d) => { d.kontak.whatsappUtama = e.target.value; })}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
