import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Info,
  Network,
  History,
  ScrollText,
  Award,
  Briefcase,
  FolderOpen,
  LogOut,
  ChevronDown,
  Newspaper,
  ClipboardList,
  Users,
  Calendar,
  Phone,
  Settings,
  Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoSamasta from "@/assets/logo-samasta.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { showError } from "@/lib/errors";

const mainMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Beranda", to: "/admin/dashboard/beranda", icon: Home },
];

const profileSubmenu = [
  { label: "Tentang Kami", to: "/admin/dashboard/tentang-kami", icon: Info },
  { label: "Struktur Manajemen", to: "/admin/dashboard/struktur", icon: Network },
  { label: "Sejarah", to: "/admin/dashboard/sejarah", icon: History },
  { label: "Legalitas & Perizinan", to: "/admin/dashboard/legalitas", icon: ScrollText },
  { label: "Keunggulan", to: "/admin/dashboard/keunggulan", icon: Award },
];

const layananSubmenu = [
  { label: "Halaman Layanan", to: "/admin/dashboard/layanan" },
  { label: "Pemeliharaan & Lingkungan", to: "/admin/dashboard/layanan/pemeliharaan" },
  { label: "Jasa Profesional & SDM", to: "/admin/dashboard/layanan/jasa-profesional" },
  { label: "Pengolahan & Perdagangan", to: "/admin/dashboard/layanan/perdagangan" },
  { label: "Event Organizer & Media", to: "/admin/dashboard/layanan/event-organizer" },
];

const bottomMenu = [
  { label: "Portofolio", to: "/admin/dashboard/portofolio", icon: FolderOpen },
  { label: "Berita", to: "/admin/dashboard/berita", icon: Newspaper },
  { label: "Pengajuan Jasa", to: "/admin/dashboard/pengajuan-jasa", icon: ClipboardList },
  { label: "Pengguna", to: "/admin/dashboard/pengguna", icon: Users },
  { label: "Kalender", to: "/admin/dashboard/kalender", icon: Calendar },
  { label: "Kontak", to: "/admin/dashboard/kontak", icon: Phone },
  { label: "Pengaturan", to: "/admin/dashboard/pengaturan", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Berhasil keluar");
    } catch (e) {
      showError(e, "Gagal keluar");
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };
  const profileOpen = profileSubmenu.some((m) => location.pathname === m.to);
  const [expanded, setExpanded] = useState(profileOpen);
  const layananOpen = layananSubmenu.some((m) => location.pathname === m.to) || location.pathname.startsWith("/admin/dashboard/layanan");
  const [layananExpanded, setLayananExpanded] = useState(layananOpen);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#1e2a4a] text-slate-200 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <img
            src={logoSamasta}
            alt="Logo PT Samasta Nusantara Digdaya"
            className="h-10 w-10 rounded-lg object-cover shrink-0 ring-1 ring-white/10"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">PT Samasta Nusantara</p>
            <p className="text-sm font-semibold text-white">Digdaya</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {mainMenu.map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to)} onClick={onClose} />
          ))}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Profil
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>

          {expanded && (
            <div className="pl-8 space-y-1">
              {profileSubmenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(item.to)
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={() => setLayananExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Briefcase className="h-5 w-5" />
              Layanan
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", layananExpanded && "rotate-180")}
            />
          </button>

          {layananExpanded && (
            <div className="pl-8 space-y-1">
              {layananSubmenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(item.to)
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {bottomMenu.map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to)} onClick={onClose} />
          ))}
        </nav>

        <div className="border-t border-white/5 px-3 py-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
          <p className="text-xs text-slate-500 px-3 mt-3">
            © 2026 PT Samasta Nusantara Digdaya
          </p>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  label,
  to,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}