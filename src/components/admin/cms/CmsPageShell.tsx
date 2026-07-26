import { ReactNode } from "react";
import { Database, Loader2, RotateCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props<T> {
  title: string;
  description?: string;
  status: "idle" | "loading" | "ready" | "empty" | "error";
  error: string | null;
  updatedAt: string | null;
  saving: boolean;
  defaults: T;
  seed: (defaults: T) => Promise<void>;
  save: () => Promise<void>;
  reload: () => Promise<void>;
  children: ReactNode;
}

function fmt(ts: string | null) {
  if (!ts) return "Belum pernah disimpan";
  try {
    return new Date(ts).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function CmsPageShell<T>({
  title,
  description,
  status,
  error,
  updatedAt,
  saving,
  defaults,
  seed,
  save,
  reload,
  children,
}: Props<T>) {
  if (status === "loading") {
    return (
      <div className="space-y-6 pb-24">
        <div>
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-sm text-red-600 mb-3">Gagal memuat data: {error}</p>
          <Button onClick={() => void reload()} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" /> Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Database className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Belum ada data untuk halaman ini. Mulai dengan menambahkan data awal
            atau buat dari kosong.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => void seed(defaults)}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Seed Data
            </Button>
            <Button
              onClick={() => void seed({} as T)}
              disabled={saving}
              variant="outline"
            >
              Mulai dari Kosong
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
          Terakhir diperbarui: <span className="font-medium text-slate-700">{fmt(updatedAt)}</span>
        </div>
      </header>

      {children}

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t px-6 py-3 flex items-center justify-between gap-3 z-20">
        <span className="text-xs text-slate-500 hidden sm:inline">
          Perubahan akan tersimpan ke database setelah Anda klik Simpan.
        </span>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => void reload()} disabled={saving}>
            Batalkan
          </Button>
          <Button
            onClick={() => {
              console.log("[CmsPageShell] Clicked Simpan Perubahan button");
              void save();
            }}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}