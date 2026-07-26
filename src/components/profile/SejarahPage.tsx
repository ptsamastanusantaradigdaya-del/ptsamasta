import { useEffect, useState } from "react";
import { BookOpen, Shield, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Item = { id: string; year: string; title: string; description: string | null };

const renderMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );

const SejarahPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("sejarah")
      .select("id,year,title,description,sort_order")
      .order("sort_order")
      .then(({ data }) => setItems(data ?? []));

    supabase
      .from("cms_pages")
      .select("content")
      .eq("slug", "sejarah")
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.content) {
          setCmsContent(data.content);
        }
      });
  }, []);

  const filosofiTitle = cmsContent?.filosofi?.title || "Filosofi Perusahaan";
  const filosofiBody = cmsContent?.filosofi?.body || "";

  return (
    <div>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Sejarah PT Samasta Nusantara Digdaya
            </h2>
          </div>

          <div className="space-y-6">
            {items.map((it) => (
              <div key={it.id} className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary mb-1">{it.year}</p>
                    <h3 className="text-lg font-bold text-foreground mb-2">{it.title}</h3>
                    {it.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{it.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1E3A8A]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {filosofiTitle}
          </h2>
          <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
            <p className="text-white/90 text-sm leading-relaxed">
              {filosofiBody ? renderMarkdown(filosofiBody) : (
                <>
                  Filosofi <strong className="text-white font-bold">PT Samasta Nusantara Digdaya</strong> menegaskan tekad Perseroan untuk menjadi perusahaan nasional yang memiliki kapasitas menyeluruh, berdaya saing tinggi, dan berlandaskan integritas, guna menghadirkan nilai tambah dan dampak positif yang berkelanjutan bagi seluruh pemangku kepentingan.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SejarahPage;
