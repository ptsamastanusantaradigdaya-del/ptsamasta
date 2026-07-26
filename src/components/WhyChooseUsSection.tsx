import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getIcon } from "@/lib/icons";

type WhyItem = { id: string; title: string; description: string | null; icon: string | null };

const WhyChooseUsSection = ({ cmsData }: { cmsData?: any }) => {
  const [items, setItems] = useState<WhyItem[]>([]);

  useEffect(() => {
    supabase
      .from("why_choose_us")
      .select("id,title,description,icon,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const title = cmsData?.title ?? "Mengapa Memilih Kami?";
  const subtitle = cmsData?.subtitle ?? "Spesialisasi Oleh PT Samasta Nusantara Digdaya";
  const description = cmsData?.description ?? "Kami hadir sebagai mitra strategis yang menyediakan solusi bisnis terintegrasi dengan pendekatan one-stop solution.";

  return (
    <section id="layanan" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-lg font-semibold text-navy mt-2">{subtitle}</p>
          <p className="text-muted-foreground mt-3 text-center text-base">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <div key={s.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center group-hover:bg-navy group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon size={22} className="text-navy group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-base mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{s.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
