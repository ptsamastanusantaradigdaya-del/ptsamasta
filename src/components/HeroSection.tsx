import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-building.png";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = ({ cmsData }: { cmsData?: any }) => {
  const [data, setData] = useState<{
    title: string;
    subtitle?: string | null;
    cta_primary_label?: string | null;
    cta_primary_href?: string | null;
    image_url?: string | null;
  } | null>(null);

  useEffect(() => {
    if (cmsData) return;
    supabase
      .from("home_hero")
      .select("title,subtitle,cta_primary_label,cta_primary_href,image_url")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data && setData(data));
  }, [cmsData]);

  const title = cmsData ? cmsData.headline.split("\n")[0] : (data?.title ?? "Solusi Terpadu Dalam Pelayanan");
  const subtitle = cmsData ? cmsData.headline.split("\n").slice(1).join("\n") : (data?.subtitle ?? "One-Stop Solution\nUntuk Membangun Pertumbuhan Bisnis Secara Profesional Dan Berkelanjutan");
  const ctaLabel = cmsData ? cmsData.ctaText : (data?.cta_primary_label ?? "PELAJARI TENTANG KAMI");
  const ctaHref = cmsData ? cmsData.ctaLink : (data?.cta_primary_href ?? "/profil/tentang-kami");
  const img = (cmsData ? cmsData.backgroundUrl : data?.image_url) || heroBg;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A]/80 via-[#1D4ED8]/60 to-[#1E3A8A]/90" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl pt-16">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-primary-foreground leading-tight mb-6 md:text-3xl whitespace-pre-line">
          {title}{" "}
          <span className="text-gradient-gold italic">{subtitle.split("\n")[0]}</span>
          {subtitle.includes("\n") && (
            <>
              <br />
              {subtitle.split("\n").slice(1).join(" ")}
            </>
          )}
        </h1>
        <a
          href={ctaHref}
          className="inline-block mt-4 px-8 py-3 bg-[#2563EB] text-primary-foreground font-semibold text-sm rounded-lg hover:bg-[#1D4ED8] transition-all duration-300">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
