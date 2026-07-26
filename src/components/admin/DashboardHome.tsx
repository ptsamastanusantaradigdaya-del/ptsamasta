import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  FolderOpen,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Activity = {
  type: string;
  desc: string;
  status: string;
  time: string;
};

export function DashboardHome() {
  const [stats, setStats] = useState({
    totalLayanan: 0,
    totalArtikel: 0,
    totalPortofolio: 0,
    totalPengajuan: 0,
    pengajuanPending: 0,
    pengajuanSelesai: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatsAndActivities = async () => {
      setLoading(true);
      try {
        // Run database slug & UUID migration for CMS pages
        try {
          // 1. Rename "layanan-jasa-sdm" to "layanan-jasa-profesional" if it exists
          const { data: sdmPage } = await supabase
            .from("cms_pages")
            .select("*")
            .eq("slug", "layanan-jasa-sdm")
            .maybeSingle();

          if (sdmPage) {
            console.log("[Migration] Found 'layanan-jasa-sdm'. Renaming to 'layanan-jasa-profesional'...");
            
            // Delete existing 'layanan-jasa-profesional' to prevent key conflict
            await supabase.from("cms_pages").delete().eq("slug", "layanan-jasa-profesional");

            // Insert new row
            const { error: insErr } = await supabase
              .from("cms_pages")
              .insert([{
                slug: "layanan-jasa-profesional",
                content: sdmPage.content
              }]);

            if (!insErr) {
              console.log("[Migration] Successfully inserted 'layanan-jasa-profesional'. Deleting 'layanan-jasa-sdm'...");
              await supabase.from("cms_pages").delete().eq("slug", "layanan-jasa-sdm");
            } else {
              console.error("[Migration] Error inserting 'layanan-jasa-profesional':", insErr);
            }
          }

          // 2. Fetch categories and scopes
          const { data: categories } = await supabase.from("service_categories").select("id, slug, name");
          const { data: scopes } = await supabase.from("service_scopes").select("id, name, category_id");

          // 3. Fetch layout pages
          const { data: cmsRows } = await supabase
            .from("cms_pages")
            .select("slug, content")
            .like("slug", "layanan%");

          for (const row of cmsRows || []) {
            const slug = row.slug;
            if (slug === "layanan") continue;

            const catSlug = slug.replace("layanan-", "");
            const matchedCategory = categories?.find(c => c.slug === catSlug);
            if (!matchedCategory) continue;

            const content = row.content as any;
            if (!content || !Array.isArray(content.lingkup)) continue;

            let modified = false;
            const scopesOfCategory = scopes?.filter(s => s.category_id === matchedCategory.id) || [];

            const updatedLingkup = content.lingkup.map((l: any) => {
              const dbMatch = scopesOfCategory.find(ds => 
                ds.id === l.id || ds.name.toLowerCase() === l.nama.toLowerCase()
              );

              if (dbMatch && l.id !== dbMatch.id) {
                console.log(`[Migration] Page '${slug}', Scope '${l.nama}': ID '${l.id}' -> UUID '${dbMatch.id}'`);
                modified = true;
                return { ...l, id: dbMatch.id };
              }
              return l;
            });

            if (modified) {
              const { error: updErr } = await supabase
                .from("cms_pages")
                .update({ content: { ...content, lingkup: updatedLingkup } })
                .eq("slug", slug);
              if (updErr) {
                console.error(`[Migration] Failed to update slug '${slug}':`, updErr);
              } else {
                console.log(`[Migration] Updated slug '${slug}' content with database UUIDs.`);
              }
            }
          }
        } catch (migErr) {
          console.error("[Migration] Error running auto-migration:", migErr);
        }

        // Query counts
        const { count: catCount } = await supabase.from("service_categories").select("*", { count: "exact", head: true });
        const { count: artCount } = await supabase.from("articles").select("*", { count: "exact", head: true });
        const { count: portCount } = await supabase.from("portofolio").select("*", { count: "exact", head: true });
        const { count: penCount } = await supabase.from("pengajuan_penawaran").select("*", { count: "exact", head: true });
        
        const totalPengajuan = penCount ?? 0;

        setStats({
          totalLayanan: catCount ?? 0,
          totalArtikel: artCount ?? 0,
          totalPortofolio: portCount ?? 0,
          totalPengajuan: totalPengajuan,
          pengajuanPending: Math.max(0, totalPengajuan - 2),
          pengajuanSelesai: Math.min(totalPengajuan, 2),
        });

        // Query latest 5 submissions
        const { data: submissions } = await supabase
          .from("pengajuan_penawaran")
          .select("id, nama_lengkap, nama_perusahaan, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (submissions) {
          const mapped: Activity[] = submissions.map((s) => {
            const timeStr = new Date(s.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
            return {
              type: "Pengajuan Jasa",
              desc: `${s.nama_lengkap} (${s.nama_perusahaan}) mengajukan permintaan penawaran`,
              status: "Pending",
              time: timeStr,
            };
          });
          setActivities(mapped);
        }
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStatsAndActivities();
  }, []);

  const statItems = [
    { label: "Total Layanan", value: stats.totalLayanan.toString(), icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Artikel", value: stats.totalArtikel.toString(), icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Portofolio", value: stats.totalPortofolio.toString(), icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pengajuan Jasa", value: stats.totalPengajuan.toString(), icon: ClipboardCheck, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  const summaryItems = [
    { label: "Total Pengajuan", value: stats.totalPengajuan.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Status Pending", value: stats.pengajuanPending.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pertumbuhan", value: "+100%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const statusStyle: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Published: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-slate-500 text-sm">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Selamat datang di Admin Panel PT Samasta Nusantara Digdaya
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`h-12 w-12 rounded-full ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Aktivitas Terbaru</h2>
          <span className="text-xs text-slate-400">Menampilkan 5 aktivitas terbaru</span>
        </div>
        <div className="overflow-x-auto">
          {activities.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3 font-medium">Tipe</th>
                  <th className="px-6 py-3 font-medium">Deskripsi</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{a.type}</td>
                    <td className="px-6 py-4 text-slate-600">{a.desc}</td>
                    <td className="px-6 py-4">
                      <Badge className={statusStyle[a.status]} variant="secondary">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              Tidak ada aktivitas terbaru.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
