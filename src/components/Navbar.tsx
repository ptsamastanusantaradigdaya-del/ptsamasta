import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSamasta from "@/assets/logo-samasta.png";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const profilSubPages = [
  { label: "Tentang Kami", href: "/profil/tentang-kami" },
  { label: "Struktur Manajemen", href: "/profil/struktur-manajemen" },
  { label: "Sejarah", href: "/profil/sejarah" },
  { label: "Legalitas & Perizinan", href: "/profil/legalitas" },
  { label: "Keunggulan", href: "/profil/keunggulan" },
];

const layananSubPages = [
  { label: "Pemeliharaan, Perawatan, dan Pembuatan Lingkungan", href: "/layanan/pemeliharaan" },
  { label: "Jasa Profesional & Pengembangan SDM", href: "/layanan/jasa-profesional" },
  { label: "Pengolahan dan Perdagangan Besar", href: "/layanan/perdagangan" },
  { label: "Event Organizer, Kreatif & Media", href: "/layanan/event-organizer" },
];

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil", hasDropdown: true, dropdownKey: "profil" as const },
  { label: "Layanan", href: "/layanan", hasDropdown: true, dropdownKey: "layanan" as const },
  { label: "Portofolio", href: "/portofolio" },
  { label: "Berita", href: "/berita" },
  { label: "Kontak", href: "/kontak" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profilOpen, setProfilOpen] = useState(false);
  const [layananOpen, setLayananOpen] = useState(false);
  const location = useLocation();

  const [logo, setLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("PT SAMASTA NUSANTARA DIGDAYA");
  const [navItems, setNavItems] = useState<any[]>(navLinks);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("cms_pages")
          .select("slug, content")
          .in("slug", ["pengaturan", "beranda"]);

        if (data) {
          const pengaturan = data.find((d) => d.slug === "pengaturan");
          const beranda = data.find((d) => d.slug === "beranda");

          let fetchedLogo = null;
          let fetchedBrandName = "PT SAMASTA NUSANTARA DIGDAYA";

          // 1. Read from beranda (slug = 'beranda') first as Single Source of Truth for Header
          if (beranda && beranda.content) {
            const content = beranda.content as any;
            if (content.header) {
              if (content.header.logoUrl) fetchedLogo = content.header.logoUrl;
              if (content.header.brandName) {
                fetchedBrandName = content.header.brandName;
                document.title = content.header.brandName;
              }
            }
          }

          // 2. Fallback to pengaturan (slug = 'pengaturan') if not set in beranda
          if (pengaturan && pengaturan.content) {
            const content = pengaturan.content as any;
            if (content.umum) {
              if (!fetchedLogo && content.umum.logoUrl) fetchedLogo = content.umum.logoUrl;
              if (fetchedBrandName === "PT SAMASTA NUSANTARA DIGDAYA" && content.umum.namaSitus) {
                fetchedBrandName = content.umum.namaSitus;
                document.title = content.umum.namaSitus;
              }
            }
          }

          if (fetchedLogo) setLogo(fetchedLogo);
          setBrandName(fetchedBrandName);

          if (beranda && beranda.content) {
            const content = beranda.content as any;
            if (content.header && content.header.nav && content.header.nav.length > 0) {
              const mappedNav = content.header.nav.map((item: any) => {
                const urlLower = (item.url || "").toLowerCase().trim();
                const isProfil = urlLower.includes("profil") || item.label.toLowerCase() === "profil";
                const isLayanan = urlLower.includes("layanan") || item.label.toLowerCase() === "layanan";

                return {
                  label: item.label,
                  href: item.url,
                  hasDropdown: isProfil || isLayanan,
                  dropdownKey: isProfil ? ("profil" as const) : isLayanan ? ("layanan" as const) : undefined,
                };
              });
              setNavItems(mappedNav);
            }
          }
        }
      } catch (e) {
        console.error("Gagal memuat pengaturan navbar:", e);
      }
    };
    void fetchSettings();
  }, []);

  const isRoute = (href: string) => href.startsWith("/");
  const isProfilActive = location.pathname.startsWith("/profil");
  const isLayananActive = location.pathname.startsWith("/layanan");

  const getDropdownItems = (key: string) => {
    if (key === "profil") return profilSubPages;
    if (key === "layanan") return layananSubPages;
    return [];
  };

  const isDropdownActive = (key: string) => {
    if (key === "profil") return isProfilActive;
    if (key === "layanan") return isLayananActive;
    return false;
  };

  const getMobileOpen = (key: string) => {
    if (key === "profil") return profilOpen;
    if (key === "layanan") return layananOpen;
    return false;
  };

  const toggleMobileOpen = (key: string) => {
    if (key === "profil") setProfilOpen(!profilOpen);
    if (key === "layanan") setLayananOpen(!layananOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/90 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo || logoSamasta} alt={brandName} className="h-10 w-auto object-contain" />
          <span className="text-primary-foreground font-bold text-sm hidden sm:block leading-tight uppercase">
            {brandName}
          </span>
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((l) => (
            <li key={l.label}>
              {l.hasDropdown ? (
                <div className="flex items-center gap-0">
                  <Link
                    to={l.href}
                    className={`text-sm font-medium transition-colors ${
                      isDropdownActive(l.dropdownKey)
                        ? "text-gold"
                        : "text-primary-foreground/80 hover:text-gold"
                    }`}
                  >
                    {l.label}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`p-1 transition-colors ${
                          isDropdownActive(l.dropdownKey)
                            ? "text-gold"
                            : "text-primary-foreground/80 hover:text-gold"
                        }`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className={l.dropdownKey === "layanan" ? "w-72" : "w-52"}>
                      {getDropdownItems(l.dropdownKey).map((sub) => (
                        <DropdownMenuItem key={sub.href} asChild>
                          <Link
                            to={sub.href}
                            className={`w-full cursor-pointer ${
                              location.pathname === sub.href ? "font-semibold text-[#1E3A8A]" : ""
                            }`}
                          >
                            <span className="text-sm font-medium">{sub.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : isRoute(l.href) ? (
                <Link
                  to={l.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === l.href
                      ? "text-gold"
                      : "text-primary-foreground/80 hover:text-gold"
                  }`}
                >
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="text-primary-foreground/80 hover:text-gold text-sm font-medium transition-colors">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy-dark/95 backdrop-blur-md border-t border-primary-foreground/10">
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navItems.map((l) => (
              <li key={l.label}>
                {l.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => toggleMobileOpen(l.dropdownKey)}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        isDropdownActive(l.dropdownKey) ? "text-gold" : "text-primary-foreground/80 hover:text-gold"
                      }`}
                    >
                      {l.label}
                      <ChevronDown size={14} className={`transition-transform ${getMobileOpen(l.dropdownKey) ? "rotate-180" : ""}`} />
                    </button>
                    {getMobileOpen(l.dropdownKey) && (
                      <ul className="ml-4 mt-2 flex flex-col gap-2">
                        {getDropdownItems(l.dropdownKey).map((sub) => (
                          <li key={sub.href}>
                            <Link
                              to={sub.href}
                              onClick={() => { setOpen(false); setProfilOpen(false); setLayananOpen(false); }}
                              className="text-primary-foreground/70 hover:text-gold text-sm transition-colors"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : isRoute(l.href) ? (
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className="text-primary-foreground/80 hover:text-gold text-sm font-medium transition-colors"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href} onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-gold text-sm font-medium transition-colors">
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
