import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageSquare, ChevronRight, FileText, Clock, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type KontakInfo = {
  address: string | null;
  phone: string | null;
  email: string | null;
  business_hours: string | null;
  map_url: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  whatsapp: string | null;
};

const Kontak = () => {
  const [hero, setHero] = useState({
    judul: "Hubungi Kami",
    subtitle: "Kami siap menjadi mitra strategis Anda. Hubungi kami untuk konsultasi dan informasi lebih lanjut mengenai layanan kami."
  });

  const [info, setInfo] = useState<KontakInfo>({
    email: "info@samastanusantara.com",
    whatsapp: "+62 812-3456-7890",
    phone: "+62 812-3456-7890",
    address: "PT Samasta Nusantara Digdaya\nJl. Tegalan Rt 001 Rw 003\nPalmerah, Kec. Matraman\nKota Jakarta Timur\nDaerah Khusus Ibukota Jakarta",
    business_hours: "Senin - Jumat: 08:00 - 17:00 WIB\nSabtu: 08:00 - 12:00 WIB\nMinggu & Hari Libur: Tutup",
    map_url: "",
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: ""
  });

  const [cta, setCta] = useState({
    judul: "Siap Bermitra dengan Kami?",
    deskripsi: "Hubungi tim kami sekarang untuk mendapatkan solusi terbaik bagi kebutuhan bisnis Anda",
    tombolWa: "Chat via WhatsApp",
    tombolPenawaran: "Ajukan Penawaran"
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [sosmed, setSosmed] = useState<{ id: string; label: string; username: string; link: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log("[Contact Fetch]", { slug: "kontak" });
        // 1. Fetch Hero Page Config
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "kontak")
          .lte("updated_at", new Date().toISOString())
          .maybeSingle();

        let loadedHero = {
          judul: "Hubungi Kami",
          subtitle: "Kami siap menjadi mitra strategis Anda. Hubungi kami untuk konsultasi dan informasi lebih lanjut mengenai layanan kami."
        };
        let loadedSosmed: { id: string; label: string; username: string; link: string }[] = [];

        if (pageData && pageData.content && typeof pageData.content === "object") {
          const content = pageData.content as any;
          if (content.hero) {
            loadedHero = {
              judul: content.hero.judul || "Hubungi Kami",
              subtitle: content.hero.subtitle || "Kami siap menjadi mitra strategis Anda. Hubungi kami untuk konsultasi dan informasi lebih lanjut mengenai layanan kami."
            };
          }
          if (Array.isArray(content.sosmed)) {
            loadedSosmed = content.sosmed;
          }
          if (content.cta) {
            setCta({
              judul: content.cta.judul || "Siap Bermitra dengan Kami?",
              deskripsi: content.cta.deskripsi || "Hubungi tim kami sekarang untuk mendapatkan solusi terbaik bagi kebutuhan bisnis Anda",
              tombolWa: content.cta.tombolWa || "Chat via WhatsApp",
              tombolPenawaran: content.cta.tombolPenawaran || "Ajukan Penawaran"
            });
          }
        }
        setHero(loadedHero);

        // 2. Fetch Kontak Info
        const { data: contactData } = await supabase
          .from("kontak_info")
          .select("*")
          .lte("updated_at", new Date().toISOString())
          .limit(1)
          .maybeSingle();

        if (contactData) {
          setInfo({
            email: contactData.email || "info@samastanusantara.com",
            whatsapp: contactData.whatsapp || "+62 812-3456-7890",
            phone: contactData.phone || contactData.whatsapp || "+62 812-3456-7890",
            address: contactData.address || "PT Samasta Nusantara Digdaya\nJl. Tegalan Rt 001 Rw 003\nPalmerah, Kec. Matraman\nKota Jakarta Timur\nDaerah Khusus Ibukota Jakarta",
            business_hours: contactData.business_hours || "Senin - Jumat: 08:00 - 17:00 WIB\nSabtu: 08:00 - 12:00 WIB\nMinggu & Hari Libur: Tutup",
            map_url: contactData.map_url || "",
            facebook: contactData.facebook || "",
            instagram: contactData.instagram || "",
            youtube: contactData.youtube || "",
            tiktok: contactData.tiktok || ""
          });

          if (loadedSosmed.length === 0) {
            loadedSosmed = [
              { id: "facebook", label: "Facebook", username: "@samastanusantara", link: contactData.facebook || "" },
              { id: "instagram", label: "Instagram", username: "@samasta.nusantara", link: contactData.instagram || "" },
              { id: "youtube", label: "YouTube", username: "@samastanusantara", link: contactData.youtube || "" },
              { id: "tiktok", label: "TikTok", username: "@samastanusantara", link: contactData.tiktok || "" }
            ];
          }
        } else if (loadedSosmed.length === 0) {
          loadedSosmed = [
            { id: "facebook", label: "Facebook", username: "@samastanusantara", link: "" },
            { id: "instagram", label: "Instagram", username: "@samasta.nusantara", link: "" },
            { id: "youtube", label: "YouTube", username: "@samastanusantara", link: "" },
            { id: "tiktok", label: "TikTok", username: "@samastanusantara", link: "" }
          ];
        }

        setSosmed(loadedSosmed);
      } catch (e: any) {
        console.error("Gagal memuat data kontak: ", e.message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const getSocialIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("facebook")) return <Facebook size={24} fill="currentColor" />;
    if (lower.includes("instagram")) return <Instagram size={24} />;
    if (lower.includes("youtube")) return <Youtube size={24} />;
    if (lower.includes("tiktok")) {
      return (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.99-1.63-.22-.17-.4-.36-.6-.55v6.51c.03 2.08-.85 4.13-2.4 5.48-1.74 1.54-4.22 2.24-6.49 1.84-2.58-.45-4.83-2.31-5.69-4.79-.97-2.73-.24-5.9 1.83-7.97 1.61-1.63 3.96-2.4 6.22-2.1v4.13c-1.3-.23-2.67.18-3.56 1.17-.92 1.01-1.07 2.53-.45 3.73.54 1.05 1.72 1.77 2.91 1.8 1.11.02 2.22-.54 2.75-1.52.27-.47.38-1.01.37-1.55V.02z" />
        </svg>
      );
    }
    return <Share2 size={24} />;
  };

  const getSocialBg = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("facebook")) return "bg-blue-100 text-blue-600";
    if (lower.includes("instagram")) return "bg-pink-100 text-pink-600";
    if (lower.includes("youtube")) return "bg-red-100 text-red-600";
    if (lower.includes("tiktok")) return "bg-slate-100 text-slate-900";
    return "bg-slate-100 text-slate-600";
  };

  const getWaLink = (num: string | null) => {
    if (!num) return "https://wa.me/6281234567890";
    const cleanNum = num.replace(/[^0-9]/g, "");
    // If starts with 0, convert to 62
    if (cleanNum.startsWith("0")) {
      return `https://wa.me/62${cleanNum.slice(1)}`;
    }
    return `https://wa.me/${cleanNum}`;
  };

  const getEmbedMapSrc = (embedCode: string | null) => {
    if (!embedCode) return "";
    // If it is a full iframe tag, extract the src URL
    if (embedCode.includes("src=\"")) {
      const match = embedCode.match(/src="([^"]+)"/);
      if (match && match[1]) return match[1];
    }
    // Otherwise, return the code itself (if it's a URL)
    return embedCode;
  };

  const mapSrc = getEmbedMapSrc(info.map_url);

  console.log("[Contact Render]", { hero, info, sosmed });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#1E3A8A]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="flex items-center justify-start gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-gold transition-colors">Beranda</Link>
            <span>&gt;</span>
            <span className="text-white">Kontak</span>
          </div>

          <div className="pt-4 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              {hero.judul}
            </h1>
            <p className="text-white/80 text-sm max-w-xl mx-auto leading-relaxed">
              {hero.subtitle}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12 space-y-16 container mx-auto px-4 max-w-5xl">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center flex-shrink-0">
              <Mail size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">Email</h3>
              <a href={`mailto:${info.email}`} className="text-xs text-muted-foreground hover:text-[#1E3A8A] transition-colors break-all">
                {info.email}
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">WhatsApp</h3>
              <a href={getWaLink(info.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                {info.whatsapp}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
              <MapPin size={22} />
            </div>
            <div className="space-y-1 flex-grow">
              <h3 className="font-bold text-sm text-foreground">Alamat Kantor</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {info.address ? info.address.split("\n")[0] : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ikuti Kami di Media Sosial</h2>
            <p className="text-muted-foreground text-sm mt-2">Tetap terhubung dengan kami melalui platform media sosial</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {sosmed.map((s) => {
              console.log("[Contact Social Render]", s);
              return (
                <a
                  key={s.id}
                  href={s.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3 group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform ${getSocialBg(s.label)}`}>
                    {getSocialIcon(s.label)}
                  </div>
                  <span className="font-bold text-sm text-foreground">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.username || "-"}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Map Location Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Lokasi Kantor</h2>
            <p className="text-muted-foreground text-xs mt-1">Kunjungi kantor kami untuk konsultasi langsung</p>
          </div>

          <div className="w-full h-80 rounded-2xl overflow-hidden border border-border bg-muted relative shadow-sm">
            {mapSrc ? (
              <iframe
                title="Peta Lokasi Kantor"
                src={mapSrc}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                <MapPin size={40} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground max-w-sm">
                  Peta lokasi belum diatur. Silakan kunjungi alamat kami langsung melalui aplikasi peta luar.
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address || "PT Samasta Nusantara Digdaya")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-navy-dark text-white rounded-xl text-xs font-bold hover:bg-navy-dark/90 flex items-center gap-1.5"
                >
                  Buka Google Maps <ChevronRight size={14} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address and Business Hours split card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/40 border border-blue-100 rounded-2xl p-6 md:p-8">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-[#1E3A8A] flex items-center gap-2">
              <MapPin size={18} />
              Alamat Lengkap
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-7">
              {info.address}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-base text-[#1E3A8A] flex items-center gap-2">
              <Clock size={18} />
              Jam Operasional
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-7">
              {info.business_hours}
            </p>
          </div>
        </div>

        {/* Bottom CTA Block */}
        <div className="rounded-2xl bg-[#1E3A8A] text-white p-8 md:p-10 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold leading-tight">{cta.judul}</h3>
            <p className="text-white/80 text-sm max-w-xl mx-auto">
              {cta.deskripsi}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href={getWaLink(info.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <MessageSquare size={18} /> {cta.tombolWa}
            </a>
            <Link
              to="/layanan"
              className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-white/95 text-[#1E3A8A] font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <FileText size={18} /> {cta.tombolPenawaran}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Kontak;
