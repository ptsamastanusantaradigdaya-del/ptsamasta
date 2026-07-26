import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Mail, Phone, Calendar, Search, Building2, User, FileText, X, Clock, Settings, ShieldAlert, CheckCircle2, AlertCircle, PlayCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface StatusHistory {
  user: string;
  old_status: string;
  new_status: string;
  timestamp: string;
}

interface ProposalMeta {
  customFields: { label: string; value: string }[];
  pic: string;
  catatan_internal: string;
  tanggal_diproses: string;
  tanggal_selesai: string;
  status_history: StatusHistory[];
}

interface Pengajuan {
  id: string;
  nama_lengkap: string;
  nama_perusahaan: string;
  email: string;
  whatsapp: string;
  category_slug: string;
  scope_slug: string;
  selected_services: string[];
  deskripsi: string;
  estimasi_waktu?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const categoryMap: Record<string, string> = {
  "pemeliharaan": "Pemeliharaan & Lingkungan",
  "jasa-sdm": "Jasa Profesional & SDM",
  "perdagangan": "Pengolahan & Perdagangan Besar",
  "event-organizer": "Event Organizer & Media",
};

const parseCustomFields = (notes: string | null | undefined): { label: string; value: string }[] => {
  if (!notes) return [];
  try {
    const parsed = JSON.parse(notes);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.customFields)) {
      return parsed.customFields;
    }
  } catch (e) {}
  return [];
};

const parseProposalMeta = (notes: string | null | undefined): ProposalMeta => {
  const defaults: ProposalMeta = {
    customFields: [],
    pic: "",
    catatan_internal: "",
    tanggal_diproses: "",
    tanggal_selesai: "",
    status_history: [],
  };

  if (!notes) return defaults;
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        customFields: Array.isArray(parsed.customFields) ? parsed.customFields : [],
        pic: parsed.pic || "",
        catatan_internal: parsed.catatan_internal || "",
        tanggal_diproses: parsed.tanggal_diproses || "",
        tanggal_selesai: parsed.tanggal_selesai || "",
        status_history: Array.isArray(parsed.status_history) ? parsed.status_history : [],
      };
    }
    if (Array.isArray(parsed)) {
      return { ...defaults, customFields: parsed };
    }
  } catch (e) {}
  return defaults;
};

const getStatusBadgeClass = (status: string | null | undefined) => {
  const st = status || "Pengajuan Baru";
  switch (st) {
    case "Pengajuan Baru":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Sedang Direview":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Penawaran Dikirim":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Disetujui":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Ditolak":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Terlaksana":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "Dibatalkan":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export function PengajuanJasaPage() {
  const [list, setList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Pengajuan | null>(null);
  
  // Workflows States
  const [currentUser, setCurrentUser] = useState<string>("System");
  const [activeStatusFilter, setActiveStatusFilter] = useState("Semua");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPic, setNewPic] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newTanggalDiproses, setNewTanggalDiproses] = useState("");
  const [newTanggalSelesai, setNewTanggalSelesai] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pengajuan_penawaran")
        .select("*")
        .lte("created_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const mapped = (data || []).map((x) => ({
        ...x,
        selected_services: Array.isArray(x.selected_services) ? x.selected_services : [],
      }));
      setList(mapped);
      console.log("[Proposal Fetch]", { count: mapped.length });
    } catch (e: any) {
      toast.error("Gagal memuat data pengajuan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.email || user.id || "Admin");
      }
    };
    void getUser();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const meta = parseProposalMeta(selectedItem.notes);
      setNewStatus(selectedItem.status || "Pengajuan Baru");
      setNewPic(meta.pic);
      setNewNotes(meta.catatan_internal);
      setNewTanggalDiproses(meta.tanggal_diproses);
      setNewTanggalSelesai(meta.tanggal_selesai);
    }
  }, [selectedItem, isStatusModalOpen]);

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;

    try {
      const oldStatus = selectedItem.status || "Pengajuan Baru";
      const currentMeta = parseProposalMeta(selectedItem.notes);
      
      let updatedHistory = currentMeta.status_history;
      if (oldStatus !== newStatus) {
        const historyEntry: StatusHistory = {
          user: currentUser,
          old_status: oldStatus,
          new_status: newStatus,
          timestamp: new Date().toISOString(),
        };
        updatedHistory = [...updatedHistory, historyEntry];
        console.log("[Proposal Status]", { proposalId: selectedItem.id, oldStatus, newStatus });
        console.log("[Proposal Timeline]", updatedHistory);
      }

      const updatedMeta: ProposalMeta = {
        customFields: parseCustomFields(selectedItem.notes),
        pic: newPic,
        catatan_internal: newNotes,
        tanggal_diproses: newTanggalDiproses,
        tanggal_selesai: newTanggalSelesai,
        status_history: updatedHistory,
      };

      console.log("[Proposal Update]", { id: selectedItem.id, status: newStatus, notes: updatedMeta });

      const { error } = await supabase
        .from("pengajuan_penawaran")
        .update({
          status: newStatus,
          notes: JSON.stringify(updatedMeta),
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      console.log("[Proposal Save]", { id: selectedItem.id, status: newStatus });
      toast.success("Status alur kerja berhasil diperbarui");
      setIsStatusModalOpen(false);
      setSelectedItem(null);
      void loadData();
    } catch (e: any) {
      toast.error("Gagal memperbarui status: " + e.message);
    }
  };

  const filteredList = list.filter((p) => {
    const matchSearch =
      p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      (p.nama_perusahaan || "").toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (categoryMap[p.category_slug] || p.category_slug).toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      activeStatusFilter === "Semua" ||
      p.status === activeStatusFilter ||
      (activeStatusFilter === "Pengajuan Baru" && !p.status);

    return matchSearch && matchStatus;
  });

  console.log("[Proposal Render]", { total: list.length, filtered: filteredList.length, activeFilter: activeStatusFilter });

  return (
    <div className="space-y-6 max-w-6xl relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengajuan Penawaran Jasa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar formulir penawaran masuk dari calon mitra dan klien PT Samasta Nusantara Digdaya
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2 shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Segarkan
        </Button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Pengajuan</span>
          <span className="text-2xl font-bold text-slate-900 mt-2">{list.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Baru</span>
          <span className="text-2xl font-bold text-blue-600 mt-2">{list.filter(x => x.status === "Pengajuan Baru" || !x.status).length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Direview</span>
          <span className="text-2xl font-bold text-amber-600 mt-2">{list.filter(x => x.status === "Sedang Direview").length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Disetujui</span>
          <span className="text-2xl font-bold text-emerald-600 mt-2">{list.filter(x => x.status === "Disetujui").length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Terlaksana</span>
          <span className="text-2xl font-bold text-teal-600 mt-2">{list.filter(x => x.status === "Terlaksana").length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Ditolak</span>
          <span className="text-2xl font-bold text-rose-600 mt-2">{list.filter(x => x.status === "Ditolak").length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama, perusahaan, atau layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            {["Semua", "Pengajuan Baru", "Sedang Direview", "Penawaran Dikirim", "Disetujui", "Ditolak", "Terlaksana", "Dibatalkan"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeStatusFilter === st
                    ? "bg-[#1E3A8A] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st === "Pengajuan Baru" ? "Baru" : st === "Sedang Direview" ? "Review" : st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Memuat data pengajuan...</p>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-slate-500">
            <div>
              <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm">Tidak ada data pengajuan penawaran ditemukan</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-500">
                  <th className="px-6 py-4 font-semibold">Pengaju / Perusahaan</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Layanan Diminta</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tanggal Masuk</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedItem(p)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.nama_lengkap}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {p.nama_perusahaan || "Personal / Perorangan"}
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{p.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{p.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                        {categoryMap[p.category_slug] || p.category_slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getStatusBadgeClass(p.status)}>
                        {p.status || "Pengajuan Baru"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(p.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(p);
                          setIsStatusModalOpen(true);
                        }}
                      >
                        Ubah Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && !isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Rincian Pengajuan Penawaran</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Pengaju</span>
                    <div className="flex items-center gap-2 text-slate-900 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <User className="h-4 w-4 text-slate-400" />
                      {selectedItem.nama_lengkap}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Perusahaan</span>
                    <div className="flex items-center gap-2 text-slate-900 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {selectedItem.nama_perusahaan || "Personal / Perorangan"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                    <div className="flex items-center gap-2 text-slate-900 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a href={`mailto:${selectedItem.email}`} className="text-primary hover:underline">
                        {selectedItem.email}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Telepon / WA</span>
                    <div className="flex items-center gap-2 text-slate-900 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a href={`https://wa.me/${selectedItem.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedItem.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori Layanan Utama</span>
                  <div className="bg-blue-50/50 text-blue-900 font-semibold p-3 rounded-lg border border-blue-100">
                    {categoryMap[selectedItem.category_slug] || selectedItem.category_slug}
                  </div>
                </div>

                {selectedItem.selected_services.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Layanan Spesifik yang Dipilih</span>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {selectedItem.selected_services.map((srv, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white border-slate-200 text-slate-700">
                          {srv}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.estimasi_waktu && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Waktu Pelaksanaan</span>
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {selectedItem.estimasi_waktu}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi Kebutuhan Detail</span>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                    {selectedItem.deskripsi}
                  </div>
                </div>

                {(() => {
                  const customFields = parseCustomFields(selectedItem.notes);
                  if (customFields.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Informasi Tambahan (Kolom Kustom)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 border border-blue-100/50 rounded-xl">
                        {customFields.map((cf, idx) => (
                          <div key={idx} className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                            <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wide block">{cf.label}</span>
                            <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{cf.value || "-"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Status & Penugasan */}
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Status & Penugasan (Workflow)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Pengajuan</span>
                      <div>
                        <Badge variant="outline" className={getStatusBadgeClass(selectedItem.status)}>
                          {selectedItem.status || "Pengajuan Baru"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIC (Penanggung Jawab)</span>
                      <div className="text-xs text-slate-700 font-medium bg-white p-2 rounded border border-slate-200/80">
                        {parseProposalMeta(selectedItem.notes).pic || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Diproses</span>
                      <div className="text-xs text-slate-700 font-medium bg-white p-2 rounded border border-slate-200/80">
                        {parseProposalMeta(selectedItem.notes).tanggal_diproses || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Selesai</span>
                      <div className="text-xs text-slate-700 font-medium bg-white p-2 rounded border border-slate-200/80">
                        {parseProposalMeta(selectedItem.notes).tanggal_selesai || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Internal</span>
                    <div className="bg-white p-3 rounded border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {parseProposalMeta(selectedItem.notes).catatan_internal || "Tidak ada catatan internal."}
                    </div>
                  </div>

                  {/* Status History Timeline */}
                  {(() => {
                    const meta = parseProposalMeta(selectedItem.notes);
                    if (meta.status_history.length === 0) return null;
                    return (
                      <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Perubahan Status (Audit Trail)</span>
                        <div className="space-y-3 border-l-2 border-slate-200 pl-3.5 ml-1.5 py-1">
                          {meta.status_history.map((h, idx) => (
                            <div key={idx} className="relative text-xs text-slate-600">
                              <span className="absolute -left-[19.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1E3A8A] border-2 border-white shadow-sm" />
                              <div className="font-semibold text-slate-900">{h.user}</div>
                              <div className="text-slate-500 mt-0.5">
                                Mengubah status dari <span className="font-semibold text-slate-700">"{h.old_status}"</span> menjadi <span className="font-semibold text-[#1E3A8A]">"{h.new_status}"</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(h.timestamp).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit"
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Diterima pada: {new Date(selectedItem.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(true)}>
                      Ubah Status
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ubah Status Modal */}
      <AnimatePresence>
        {isStatusModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg p-6 relative"
            >
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Ubah Status & Alur Kerja</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Pengajuan Baru">Pengajuan Baru</option>
                    <option value="Sedang Direview">Sedang Direview</option>
                    <option value="Penawaran Dikirim">Penawaran Dikirim</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                    <option value="Terlaksana">Terlaksana</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">PIC (Penanggung Jawab)</span>
                  <Input
                    placeholder="Masukkan nama penanggung jawab..."
                    value={newPic}
                    onChange={(e) => setNewPic(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Tanggal Diproses</span>
                    <Input
                      type="date"
                      value={newTanggalDiproses}
                      onChange={(e) => setNewTanggalDiproses(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Tanggal Selesai</span>
                    <Input
                      type="date"
                      value={newTanggalSelesai}
                      onChange={(e) => setNewTanggalSelesai(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Catatan Internal</span>
                  <Textarea
                    rows={3}
                    placeholder="Masukkan catatan perkembangan pengajuan..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleUpdateStatus} className="gap-1.5">
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
