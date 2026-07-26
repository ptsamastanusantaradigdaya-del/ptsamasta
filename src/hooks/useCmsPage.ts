import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { showError, friendlyError } from "@/lib/errors";
import { getDefaults } from "@/lib/cms/defaults";

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep(target: any, source: any): any {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

type Status = "idle" | "loading" | "ready" | "empty" | "error";

export interface UseCmsPageResult<T> {
  status: Status;
  content: T | null;
  error: string | null;
  updatedAt: string | null;
  isEmpty: boolean;
  loading: boolean;
  saving: boolean;
  setContent: (next: T | ((prev: T) => T)) => void;
  save: () => Promise<void>;
  seed: (defaults: T) => Promise<void>;
  reload: () => Promise<void>;
}

export function useCmsPage<T>(slug: string): UseCmsPageResult<T> {
  const [status, setStatus] = useState<Status>("loading");
  const [content, setContentState] = useState<T | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cms_pages")
        .select("content, updated_at")
        .eq("slug", slug)
        .maybeSingle();
      if (err) throw err;
      if (!data) {
        setContentState(null);
        setUpdatedAt(null);
        setStatus("empty");
        return;
      }
      
      const defaultData = getDefaults(slug);
      let contentVal = data.content ?? null;
      if (contentVal && defaultData) {
        contentVal = mergeDeep(defaultData, contentVal);
      } else if (!contentVal && defaultData) {
        contentVal = defaultData;
      }
      
      setContentState(contentVal as T | null);
      setUpdatedAt(data.updated_at);
      setStatus("ready");
    } catch (e) {
      const msg = friendlyError(e, "Gagal memuat data");
      setError(msg);
      setStatus("error");
      setContentState(null);
      setUpdatedAt(null);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const setContent: UseCmsPageResult<T>["setContent"] = useCallback((next) => {
    setContentState((prev) => {
      const base = prev as T;
      const value = typeof next === "function" ? (next as (p: T) => T)(base) : next;
      return value;
    });
  }, []);

  const save = useCallback(async (newContent?: T) => {
    const contentToSave = newContent !== undefined ? newContent : content;
    if (contentToSave === null) {
      console.log("[useCmsPage:save] Content is null, skipping save.");
      toast.warning("Tidak ada perubahan untuk disimpan");
      return;
    }
    setSaving(true);
    console.log("[useCmsPage:save] === STARTING SAVE PROCESS ===");
    console.log("[useCmsPage:save] Target Slug:", slug);
    console.log("[useCmsPage:save] Payload Content:", JSON.parse(JSON.stringify(contentToSave)));
    
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData.user) {
        console.error("[useCmsPage:save] Authentication Error:", authErr);
        throw new Error("Sesi Anda telah berakhir. Silakan masuk kembali.");
      }
      
      console.log("[useCmsPage:save] Authenticated User ID:", userData.user.id);
      
      const upsertPayload = {
        slug,
        content: contentToSave as never,
        updated_by: userData.user.id,
      };
      
      const { error: err, data } = await supabase
        .from("cms_pages")
        .upsert(upsertPayload, { onConflict: "slug" })
        .select("updated_at")
        .single();
        
      console.log("[useCmsPage:save] Supabase Upsert Response:", { data, error: err });
      
      if (err) throw err;
      
      // Perform immediate SELECT to verify the value in database
      const { data: verifyData, error: verifyErr } = await supabase
        .from("cms_pages")
        .select("slug, content, updated_at")
        .eq("slug", slug)
        .maybeSingle();
        
      console.log("[useCmsPage:save] SELECT verification after UPDATE:", { data: verifyData, error: verifyErr });
      console.log("[CMS Hero Data]", {
        slug: verifyData?.slug,
        "content.hero.warna": verifyData?.content?.hero?.warna,
        "content.hero": verifyData?.content?.hero
      });

      setUpdatedAt(data?.updated_at ?? new Date().toISOString());
      setStatus("ready");
      toast.success("Perubahan tersimpan");
    } catch (e) {
      console.error("[useCmsPage:save] Exception during save:", e);
      showError(e, "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
      console.log("[useCmsPage:save] === SAVE PROCESS COMPLETED ===");
    }
  }, [content, slug]);

  const seed = useCallback(
    async (defaults: T) => {
      setSaving(true);
      try {
        const { data: userData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !userData.user) {
          throw new Error("Sesi Anda telah berakhir. Silakan masuk kembali.");
        }
        const { error: err, data } = await supabase
          .from("cms_pages")
          .upsert(
            {
              slug,
              content: defaults as never,
              updated_by: userData.user.id,
            },
            { onConflict: "slug" },
          )
          .select("content, updated_at")
          .single();
        if (err) throw err;
        
        const defaultData = getDefaults(slug);
        let contentVal = data.content ?? null;
        if (contentVal && defaultData) {
          contentVal = mergeDeep(defaultData, contentVal);
        } else if (!contentVal && defaultData) {
          contentVal = defaultData;
        }

        setContentState(contentVal as T);
        setUpdatedAt(data.updated_at);
        setStatus("ready");
        toast.success("Data awal berhasil dibuat");
      } catch (e) {
        showError(e, "Gagal membuat data awal");
      } finally {
        setSaving(false);
      }
    },
    [slug],
  );

  return {
    status,
    content,
    error,
    updatedAt,
    isEmpty: status === "empty",
    loading: status === "loading",
    saving,
    setContent,
    save,
    seed,
    reload: load,
  };
}