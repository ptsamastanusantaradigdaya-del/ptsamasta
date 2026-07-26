import { Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uploadMedia, validateUploadFile, UploadValidationError } from "@/lib/cms/uploadMedia";
import { toast } from "sonner";
import { showError } from "@/lib/errors";

export function UploadBox({
  className,
  hint = "PNG, JPG (maks. 2MB)",
  label = "Klik untuk upload gambar",
  height = "h-32",
  value,
  onChange,
  folder = "general",
}: {
  className?: string;
  hint?: string;
  label?: string;
  height?: string;
  value?: string | null;
  onChange?: (url: string | null) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const preview = value ?? localPreview;

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      validateUploadFile(file);
    } catch (e) {
      if (e instanceof UploadValidationError) {
        toast.error("File tidak valid", { description: e.message });
      } else {
        showError(e, "File tidak valid");
      }
      return;
    }
    if (!onChange) {
      setLocalPreview(URL.createObjectURL(file));
      return;
    }
    setBusy(true);
    try {
      if (folder.startsWith("layanan")) {
        console.log(`[Detail Page] Storage Upload - file: ${file.name}, folder: ${folder}`);
      }
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Berhasil mengunggah");
    } catch (e) {
      showError(e, "Gagal mengunggah file");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    if (onChange) onChange(null);
    else setLocalPreview(null);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void onFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "relative group cursor-pointer rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-colors flex items-center justify-center",
        height,
        className,
      )}
    >
      {busy ? (
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mb-1.5" />
          <p className="text-xs">Mengunggah…</p>
        </div>
      ) : preview ? (
        <>
          <img src={preview} alt="" className="h-full w-full object-cover rounded-lg" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-slate-600 hover:text-red-600 shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center text-slate-400">
          <UploadCloud className="h-6 w-6 mb-1.5" />
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-xs mt-0.5">{hint}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0] ?? undefined)}
      />
    </div>
  );
}