import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Info, 
  X, 
  Loader2, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface tipe data KalenderKegiatan
export interface KalenderKegiatan {
  id: string;
  title: string;
  category: "Meeting" | "Project" | "Deadline" | "Event";
  pic?: string | null;
  tanggal: string; // Format YYYY-MM-DD
  waktu: string; // Format HH:MM
  lokasi?: string | null;
  description?: string | null;
  status: "Terjadwal" | "Sedang Berlangsung" | "Selesai" | "Dibatalkan";
  created_at?: string;
  updated_at?: string;
}

export function KalenderPage() {
  const [events, setEvents] = useState<KalenderKegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // States Pencarian & Penyaringan
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedMonth, setSelectedMonth] = useState<string>("Semua");
  const [selectedYear, setSelectedYear] = useState<string>("Semua");

  // Modal Detail & Form States
  const [detailEvent, setDetailEvent] = useState<KalenderKegiatan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<KalenderKegiatan | null>(null);
  
  // Form Input States
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Meeting" | "Project" | "Deadline" | "Event">("Meeting");
  const [formPic, setFormPic] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formWaktu, setFormWaktu] = useState("");
  const [formLokasi, setFormLokasi] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"Terjadwal" | "Sedang Berlangsung" | "Selesai" | "Dibatalkan">("Terjadwal");
  const [saving, setSaving] = useState(false);

  // Load Data dari Supabase
  const fetchEvents = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("kalender_kegiatan")
        .select("*");
      
      if (error) throw error;
      setEvents((data as KalenderKegiatan[]) || []);
    } catch (e: any) {
      console.error("Gagal memuat kalender:", e);
      setDbError(e.message);
      // Jangan pakai localStorage, biarkan kosong agar aman sesuai instruksi user
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  // Buka Form Tambah
  const handleOpenAddForm = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormCategory("Meeting");
    setFormPic("");
    
    // Set default tanggal hari ini di Waktu Lokal (Format YYYY-MM-DD)
    const localToday = new Date();
    const year = localToday.getFullYear();
    const month = String(localToday.getMonth() + 1).padStart(2, '0');
    const day = String(localToday.getDate()).padStart(2, '0');
    setFormTanggal(`${year}-${month}-${day}`);
    
    setFormWaktu("10:00");
    setFormLokasi("");
    setFormDescription("");
    setFormStatus("Terjadwal");
    setFormOpen(true);
  };

  // Buka Form Edit
  const handleOpenEditForm = (event: KalenderKegiatan) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormCategory(event.category);
    setFormPic(event.pic || "");
    setFormTanggal(event.tanggal);
    setFormWaktu(event.waktu);
    setFormLokasi(event.lokasi || "");
    setFormDescription(event.description || "");
    setFormStatus(event.status);
    
    setDetailEvent(null); // Tutup detail jika sedang terbuka
    setFormOpen(true);
  };

  // Simpan Kegiatan (Create / Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.warning("Judul kegiatan wajib diisi");
      return;
    }
    if (!formTanggal) {
      toast.warning("Tanggal kegiatan wajib diisi");
      return;
    }
    if (!formWaktu) {
      toast.warning("Waktu kegiatan wajib diisi");
      return;
    }

    setSaving(true);
    const payload = {
      title: formTitle,
      category: formCategory,
      pic: formPic || null,
      tanggal: formTanggal,
      waktu: formWaktu,
      lokasi: formLokasi || null,
      description: formDescription || null,
      status: formStatus,
    };

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("kalender_kegiatan")
          .update(payload)
          .eq("id", editingEvent.id);
        
        if (error) throw error;
        toast.success("Kegiatan berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("kalender_kegiatan")
          .insert([payload]);
        
        if (error) throw error;
        toast.success("Kegiatan baru berhasil ditambahkan");
      }
      setFormOpen(false);
      void fetchEvents();
    } catch (e: any) {
      toast.error("Gagal menyimpan kegiatan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Hapus Kegiatan
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("kalender_kegiatan")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Kegiatan berhasil dihapus");
      setDetailEvent(null);
      void fetchEvents();
    } catch (e: any) {
      toast.error("Gagal menghapus kegiatan: " + e.message);
    }
  };

  // Cek Jatuh Tempo Deadline (<= 3 hari dari hari ini)
  const isNearDeadline = (tanggalStr: string, category: string, status: string) => {
    if (category !== "Deadline" || status === "Selesai" || status === "Dibatalkan") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(tanggalStr);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Hitung Statics Dinamis
  const totalEventsCount = events.length;
  const meetingCount = events.filter(e => e.category === "Meeting").length;
  const projectCount = events.filter(e => e.category === "Project").length;
  const deadlineCount = events.filter(e => e.category === "Deadline").length;

  // Format Nama Bulan & Tahun list
  const monthsList = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktobe" }, // typo figma: "Oktobe" or "Oktober", let's use "Oktober"
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];
  // Remove duplicate Oktober values due to above correction
  const uniqueMonthsList = monthsList.filter((m, i, self) => 
    self.findIndex(t => t.label === m.label) === i
  );

  const yearsList = ["2025", "2026", "2027", "2028"];

  // Ambil Tanggal Hari Ini (Format Lokal YYYY-MM-DD)
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayDateString();

  // Widget: Agenda Hari Ini
  const todayAgenda = events
    .filter(e => e.tanggal === todayStr)
    .sort((a, b) => a.waktu.localeCompare(b.waktu));

  // Widget: Deadline Terdekat (<= 3 hari)
  const upcomingDeadlines = events
    .filter(e => isNearDeadline(e.tanggal, e.category, e.status))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.waktu.localeCompare(b.waktu));

  // Filter Kegiatan
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || e.category === selectedCategory;
    
    // Extract month and year from e.tanggal (format: YYYY-MM-DD)
    const [, eMonth, eYear] = e.tanggal.split("-");
    const matchesMonth = selectedMonth === "Semua" || eMonth === selectedMonth;
    const matchesYear = selectedYear === "Semua" || eYear === selectedYear;

    return matchesSearch && matchesCategory && matchesMonth && matchesYear;
  });

  // Urutkan kegiatan berdasarkan tanggal dan waktu terdekat (kronologis ascending)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateCompare = a.tanggal.localeCompare(b.tanggal);
    if (dateCompare !== 0) return dateCompare;
    return a.waktu.localeCompare(b.waktu);
  });

  // Grouping Kegiatan Berdasarkan Tanggal
  const groupEventsByDate = (eventsList: KalenderKegiatan[]) => {
    const groups: { [key: string]: KalenderKegiatan[] } = {};
    eventsList.forEach((e) => {
      if (!groups[e.tanggal]) {
        groups[e.tanggal] = [];
      }
      groups[e.tanggal].push(e);
    });
    return groups;
  };
  const groupedEvents = groupEventsByDate(sortedEvents);

  // Format Hari & Tanggal Cantik (Bahasa Indonesia)
  const formatIndonesianDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Helper Warna Kategori
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Meeting":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Project":
        return "bg-green-50 text-green-700 border-green-200";
      case "Deadline":
        return "bg-red-50 text-red-700 border-red-200";
      case "Event":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Helper Warna Status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Terjadwal":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Sedang Berlangsung":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Selesai":
        return "bg-green-50 text-green-700 border-green-200";
      case "Dibatalkan":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kalender Kegiatan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola jadwal proyek, meeting, dan event perusahaan</p>
        </div>
        <Button 
          onClick={handleOpenAddForm} 
          className="bg-blue-900 hover:bg-blue-800 text-white gap-2 px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Event
        </Button>
      </div>

      {/* Kartu Ringkasan (Summary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Event */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Event</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalEventsCount}</p>
          </div>
        </div>
        {/* Meeting */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Meeting</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{meetingCount}</p>
          </div>
        </div>
        {/* Project */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Project</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{projectCount}</p>
          </div>
        </div>
        {/* Deadline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Deadline</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{deadlineCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Konten Utama & Widgets Samping */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Kolom Kiri & Tengah: Filter dan List Kronologis */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section Pencarian & Filter */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Cari Judul */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <Input
                  placeholder="Cari berdasarkan judul kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Dropdown Bulan */}
              <div className="w-full md:w-44">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Bulan</SelectItem>
                    {uniqueMonthsList.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Tahun */}
              <div className="w-full md:w-36">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Tahun</SelectItem>
                    {yearsList.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Kategori (Pill Buttons) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Semua", "Meeting", "Project", "Deadline", "Event"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-900 text-white border-blue-950 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Kronologis Kegiatan */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900 mx-auto" />
              <p className="text-slate-500 mt-4 text-sm font-medium">Memuat jadwal kegiatan...</p>
            </div>
          ) : dbError ? (
            <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center text-red-800">
              <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-base">Gagal Terhubung ke Database</h3>
              <p className="text-sm text-red-600 mt-1 max-w-md mx-auto">
                Tabel database <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">kalender_kegiatan</code> belum tersedia di Supabase. Mohon jalankan file SQL migrasi di editor kueri database Anda.
              </p>
              <p className="text-xs text-red-500 mt-3 font-mono">Error: {dbError}</p>
            </div>
          ) : Object.keys(groupedEvents).length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Belum Ada Kegiatan</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                Tidak ada agenda kegiatan yang cocok dengan filter atau belum ditambahkan ke kalender.
              </p>
              <Button 
                onClick={handleOpenAddForm} 
                className="bg-blue-900 hover:bg-blue-800 text-white mt-6 gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Event
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([tanggalGroup, listEvents]) => (
                <div key={tanggalGroup} className="space-y-3">
                  {/* Header Tanggal */}
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 shadow-xs w-fit">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <span>{formatIndonesianDate(tanggalGroup)}</span>
                  </div>

                  {/* List Event pada Tanggal Ini */}
                  <div className="space-y-3 pl-1">
                    {listEvents.map((evt) => {
                      const isNear = isNearDeadline(evt.tanggal, evt.category, evt.status);
                      const timeHour = evt.waktu.split(":")[0] || "00";
                      const timeMin = evt.waktu.split(":")[1] || "00";

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setDetailEvent(evt)}
                          className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-start gap-5 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all relative group"
                        >
                          {/* Sisi Kiri: Waktu */}
                          <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-5 min-w-[70px] text-center">
                            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{timeHour}</span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{timeMin}</span>
                          </div>

                          {/* Sisi Tengah: Rincian Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                {evt.title}
                              </h4>
                              
                              {/* Warning Badge jika Deadline < 3 Hari */}
                              {isNear && (
                                <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="h-3 w-3" />
                                  Jatuh Tempo (3 Hari)
                                </span>
                              )}
                            </div>

                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                              {evt.description || "Tidak ada deskripsi."}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-350" />
                                <span>{evt.waktu}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-slate-350" />
                                <span>{evt.lokasi || "-"}</span>
                              </div>
                              {evt.pic && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5 text-slate-350" />
                                  <span>PIC: {evt.pic}</span>
                                </div>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyles(evt.status)}`}>
                                {evt.status}
                              </span>
                            </div>
                          </div>

                          {/* Sisi Kanan: Kategori & Aksi Cepat */}
                          <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getCategoryStyles(evt.category)}`}>
                              {evt.category}
                            </span>
                            
                            {/* Tombol Hapus & Edit Cepat (Ditampilkan saat hover di desktop) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditForm(evt);
                                }}
                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-blue-900 border border-slate-100 hover:border-slate-200 transition-colors"
                                title="Ubah Kegiatan"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleDeleteEvent(evt.id, evt.title);
                                }}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 border border-slate-100 hover:border-red-200 transition-colors"
                                title="Hapus Kegiatan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Widget Samping */}
        <div className="space-y-6">
          
          {/* Widget 1: Agenda Hari Ini */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CalendarIcon className="h-5 w-5 text-blue-900" />
              <h3 className="font-bold text-slate-900 text-sm">Agenda Hari Ini</h3>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-900 mx-auto" />
              </div>
            ) : todayAgenda.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6 font-medium">Tidak ada agenda hari ini</p>
            ) : (
              <div className="space-y-3">
                {todayAgenda.map(evt => (
                  <div 
                    key={evt.id}
                    onClick={() => setDetailEvent(evt)}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-150 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-900">{evt.waktu}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${getCategoryStyles(evt.category)}`}>
                        {evt.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                    <p className="text-slate-400 text-[10px] flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-slate-350" />
                      <span className="line-clamp-1">{evt.lokasi || "-"}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Deadline Terdekat (<= 3 hari) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm">Deadline Terdekat</h3>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-red-600 mx-auto" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6 font-medium">Tidak ada deadline terdekat</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(evt => {
                  const daysLeft = Math.ceil((new Date(evt.tanggal).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                  const daysLeftText = daysLeft === 0 ? "Hari ini" : daysLeft === 1 ? "Besok" : `${daysLeft} hari lagi`;

                  return (
                    <div 
                      key={evt.id}
                      onClick={() => setDetailEvent(evt)}
                      className="p-3 rounded-lg bg-red-50/30 border border-red-150 hover:border-red-300 hover:bg-red-50/60 cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider bg-red-100/70 px-1.5 py-0.5 rounded">
                          {daysLeftText}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{evt.waktu}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                        <span>PIC: {evt.pic || "-"}</span>
                        <span>{formatIndonesianDate(evt.tanggal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal Detail Kegiatan */}
      <AnimatePresence>
        {detailEvent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden"
            >
              {/* Header Modal Detail */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className={`px-2.5 py-0.8 rounded-md text-[10px] font-extrabold uppercase border tracking-wider ${getCategoryStyles(detailEvent.category)}`}>
                    {detailEvent.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{detailEvent.title}</h3>
                </div>
                <button 
                  onClick={() => setDetailEvent(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Rincian Modal Detail */}
              <div className="p-6 space-y-5 text-sm">
                
                {/* Deskripsi */}
                {detailEvent.description && (
                  <div className="space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-150">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Deskripsi</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{detailEvent.description}</p>
                  </div>
                )}

                {/* Grid Rincian Kegiatan */}
                <div className="grid grid-cols-2 gap-4">
                  {/* PIC */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">PIC (Penanggung Jawab)</span>
                    <p className="text-slate-800 font-bold flex items-center gap-1">
                      <User className="h-4 w-4 text-slate-500" />
                      {detailEvent.pic || "-"}
                    </p>
                  </div>
                  {/* Status */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Status Kegiatan</span>
                    <div className="pt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(detailEvent.status)}`}>
                        {detailEvent.status}
                      </span>
                    </div>
                  </div>
                  {/* Tanggal */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Tanggal Kegiatan</span>
                    <p className="text-slate-800 font-bold flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      {formatIndonesianDate(detailEvent.tanggal)}
                    </p>
                  </div>
                  {/* Waktu */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Waktu</span>
                    <p className="text-slate-800 font-bold flex items-center gap-1">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {detailEvent.waktu} WIB
                    </p>
                  </div>
                  {/* Lokasi */}
                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Lokasi</span>
                    <p className="text-slate-800 font-bold flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {detailEvent.lokasi || "-"}
                    </p>
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-slate-400 text-[10px] font-medium">
                  {detailEvent.created_at && (
                    <div>
                      <span>Dibuat: </span>
                      <span>{new Date(detailEvent.created_at).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {detailEvent.updated_at && (
                    <div className="text-right">
                      <span>Diperbarui: </span>
                      <span>{new Date(detailEvent.updated_at).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Aksi Modal Detail */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenEditForm(detailEvent)}
                  className="gap-1 rounded-lg border-slate-200 text-slate-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Ubah
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleDeleteEvent(detailEvent.id, detailEvent.title)}
                  className="gap-1 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Form Tambah / Edit Kegiatan */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden"
            >
              {/* Header Modal Form */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingEvent ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                </h3>
                <button 
                  onClick={() => setFormOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={(e) => void handleSaveEvent(e)}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Judul */}
                  <div className="space-y-1.5">
                    <Label htmlFor="form-title" className="font-semibold text-slate-800">Judul Kegiatan *</Label>
                    <Input
                      id="form-title"
                      placeholder="Masukkan nama/judul kegiatan..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Kategori */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-category" className="font-semibold text-slate-800">Kategori *</Label>
                      <Select 
                        value={formCategory} 
                        onValueChange={(val: any) => setFormCategory(val)}
                      >
                        <SelectTrigger id="form-category">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Meeting">Meeting (Biru)</SelectItem>
                          <SelectItem value="Project">Project (Hijau)</SelectItem>
                          <SelectItem value="Deadline">Deadline (Merah)</SelectItem>
                          <SelectItem value="Event">Event (Ungu)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-status" className="font-semibold text-slate-800">Status *</Label>
                      <Select 
                        value={formStatus} 
                        onValueChange={(val: any) => setFormStatus(val)}
                      >
                        <SelectTrigger id="form-status">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                          <SelectItem value="Sedang Berlangsung">Sedang Berlangsung</SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                          <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Tanggal */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-tanggal" className="font-semibold text-slate-800">Tanggal *</Label>
                      <Input
                        id="form-tanggal"
                        type="date"
                        value={formTanggal}
                        onChange={(e) => setFormTanggal(e.target.value)}
                        required
                      />
                    </div>

                    {/* Waktu */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-waktu" className="font-semibold text-slate-800">Waktu (HH:MM) *</Label>
                      <Input
                        id="form-waktu"
                        placeholder="Contoh: 14:00"
                        value={formWaktu}
                        onChange={(e) => setFormWaktu(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* PIC */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-pic" className="font-semibold text-slate-800">PIC (Penanggung Jawab)</Label>
                      <Input
                        id="form-pic"
                        placeholder="Contoh: Budi Santoso"
                        value={formPic}
                        onChange={(e) => setFormPic(e.target.value)}
                      />
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-lokasi" className="font-semibold text-slate-800">Lokasi / Tempat</Label>
                      <Input
                        id="form-lokasi"
                        placeholder="Contoh: Virtual Meeting"
                        value={formLokasi}
                        onChange={(e) => setFormLokasi(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <Label htmlFor="form-description" className="font-semibold text-slate-800">Deskripsi Kegiatan</Label>
                    <Textarea
                      id="form-description"
                      placeholder="Masukkan deskripsi detail atau agenda kegiatan..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Footer Modal Form */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                    className="rounded-lg border-slate-200 text-slate-700"
                    disabled={saving}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg px-5"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
