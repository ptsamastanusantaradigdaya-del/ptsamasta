import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Partner = { name: string; logo_url: string };

const PartnersSection = ({ 
  cmsData, 
  groupName = "home",
  showTitle = true,
  className = "py-16 bg-background"
}: { 
  cmsData?: any; 
  groupName?: string;
  showTitle?: boolean;
  className?: string;
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    console.log("[Partner Carousel] Shared Component Loaded - groupName:", groupName);
    console.log("[Partner Carousel] Component Used: PartnersSection");

    // Fetch global partners first for fallback mapping
    supabase
      .from("partners")
      .select("name,logo_url,sort_order,is_active,group_name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const globalPartners = data ?? [];

        if (cmsData?.partners && cmsData.partners.length > 0) {
          const mapped = cmsData.partners.map((p: any) => {
            const name = p.name || p.nama || "";
            let finalLogo = p.logoUrl || p.logo || p.logo_url || "";

            if (!finalLogo && globalPartners.length > 0) {
              const match = globalPartners.find(gp => gp.name.toLowerCase() === name.toLowerCase());
              if (match) {
                finalLogo = match.logo_url;
              }
            }

            if (!finalLogo) {
              finalLogo = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">${encodeURIComponent(name)}</text></svg>`;
            }

            return { name, logo_url: finalLogo };
          });

          console.log("[Partner Carousel] Source Data: cmsData props");
          console.log("[Partner Carousel] Render Count:", mapped.length);
          setPartners(mapped);
        } else {
          const filtered = globalPartners.filter(gp => gp.group_name === groupName);
          const finalFiltered = filtered.length > 0 ? filtered : globalPartners.filter(gp => gp.group_name === "home");
          console.log("[Partner Carousel] Source Data: database table");
          console.log("[Partner Carousel] Render Count:", finalFiltered.length);
          setPartners(finalFiltered);
        }
      });
  }, [cmsData, groupName]);

  const doubled = [...partners, ...partners];
  const title = cmsData?.title ?? "Mitra Perusahaan";
  const subtitle = cmsData?.subtitle ?? "Dipercaya oleh berbagai platform pengadaan dan institusi terkemuka di Indonesia";

  return (
    <section className={className}>
      {showTitle && (
        <div className="container mx-auto px-4 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            {subtitle}
          </p>
        </div>
      )}

      <div className="overflow-hidden">
        <div className="flex items-center animate-marquee w-max gap-16 px-8">
          {doubled.map((p, i) => (
            <div key={i} className="flex-shrink-0 flex items-center justify-center h-20 w-40">
              <img
                src={p.logo_url}
                alt={p.name}
                onLoad={() => console.log("[Partner Carousel] Image Load Success - name:", p.name, "url:", p.logo_url)}
                onError={(e) => {
                  console.log("[Partner Carousel] Image Load Failed - name:", p.name, "url:", p.logo_url);
                  e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">${encodeURIComponent(p.name)}</text></svg>`;
                }}
                className="max-h-16 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
