import { useEffect, useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Youtube, 
  MessageSquare 
} from "lucide-react";
import logoSamasta from "@/assets/logo-samasta.png";
import { supabase } from "@/integrations/supabase/client";

interface NavLink { id: number | string; label: string; url: string }
interface SocialLink { id: number | string; platform: string; url: string }

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram": return <Instagram size={16} />;
    case "linkedin": return <Linkedin size={16} />;
    case "facebook": return <Facebook size={16} />;
    case "twitter":
    case "x": 
      return <Twitter size={16} />;
    case "youtube": return <Youtube size={16} />;
    default: return <MessageSquare size={16} />;
  }
};

const Footer = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("PT Samasta Nusantara Digdaya");
  const [description, setDescription] = useState(
    "Perusahaan jasa dan pengadaan yang berpengalaman dalam menyediakan berbagai layanan profesional untuk mendukung pertumbuhan bisnis UMKM, Startup, dan Perusahaan di Indonesia."
  );
  const [address, setAddress] = useState(
    "Jl. Tergalent, RT.01/RW.3, Pademangan, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta"
  );
  const [phone, setPhone] = useState("+62 856-1397-4228");
  const [email, setEmail] = useState("info@snd.co.id");
  const [quickLinks, setQuickLinks] = useState<NavLink[]>([
    { id: 1, label: "Profil Perusahaan", url: "/profil/tentang-kami" },
    { id: 2, label: "Layanan", url: "/layanan" },
    { id: 3, label: "Portofolio", url: "/portofolio" },
    { id: 4, label: "Berita", url: "/berita" },
    { id: 5, label: "Kontak", url: "/kontak" },
  ]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [copyrightText, setCopyrightText] = useState("PT Samasta Nusantara Digdaya. All rights reserved.");

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // 1. Fetch from cms_pages where slug = 'beranda' (main source for footer settings)
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "beranda")
          .maybeSingle();

        let hasCmsFooter = false;

        if (pageData && pageData.content) {
          const content = pageData.content as any;
          if (content.footer) {
            hasCmsFooter = true;
            const f = content.footer;
            if (f.logoUrl) setLogo(f.logoUrl);
            if (f.description) setDescription(f.description);
            if (f.address) setAddress(f.address);
            if (f.phone) setPhone(f.phone);
            if (f.email) setEmail(f.email);
            if (f.copyright) setCopyrightText(f.copyright);
            if (f.quickLinks && Array.isArray(f.quickLinks)) setQuickLinks(f.quickLinks);
            if (f.socials && Array.isArray(f.socials)) setSocials(f.socials);
          }
        }

        // 2. Fetch from cms_pages where slug = 'pengaturan' (fallback for logo & brand name)
        const { data: settingsData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "pengaturan")
          .maybeSingle();

        if (settingsData && settingsData.content) {
          const content = settingsData.content as any;
          if (content.umum) {
            if (content.umum.logoUrl && !logo) setLogo(content.umum.logoUrl);
            if (content.umum.namaSitus) setBrandName(content.umum.namaSitus);
            if (content.umum.copyrightText && (!hasCmsFooter || !content.footer?.copyright)) {
              setCopyrightText(content.umum.copyrightText);
            }
          }
        }

        // 3. Fetch from kontak_info as database fallback for contact info
        if (!hasCmsFooter) {
          const { data: contactData } = await supabase
            .from("kontak_info")
            .select("address, phone, email, instagram, linkedin")
            .maybeSingle();

          if (contactData) {
            if (contactData.address) setAddress(contactData.address);
            if (contactData.phone) setPhone(contactData.phone);
            if (contactData.email) setEmail(contactData.email);
            
            const tempSocials: SocialLink[] = [];
            if (contactData.instagram) tempSocials.push({ id: "ig", platform: "Instagram", url: contactData.instagram });
            if (contactData.linkedin) tempSocials.push({ id: "li", platform: "Linkedin", url: contactData.linkedin });
            setSocials(tempSocials);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data footer:", e);
      }
    };

    void fetchFooterData();
  }, []);

  return (
    <footer id="kontak" className="bg-navy-dark text-primary-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo || logoSamasta} alt={brandName} className="h-12 w-auto" />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex gap-3 mt-4">
              {socials.map((s) => (
                s.url && s.url !== "#" && (
                  <a 
                    key={s.id} 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold transition-colors" 
                    title={s.platform}
                  >
                    {getSocialIcon(s.platform)}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="flex-shrink-0 mt-0.5 text-gold" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-gold" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-gold" />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/15 py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <p>{copyrightText.includes("©") ? copyrightText : `© ${new Date().getFullYear()} ${copyrightText}`}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
