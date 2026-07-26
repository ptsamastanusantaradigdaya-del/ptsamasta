import { useEffect, useState } from "react";
import { Eye, Shield, TrendingUp, CheckCircle, Award, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PartnersSection from "@/components/PartnersSection";

type Section = { section_key: string; title: string | null; body: string | null };

const renderMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );

const getPillarIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "award":
      return Award;
    case "shield":
      return Shield;
    case "trending":
      return TrendingUp;
    case "sparkles":
    default:
      return Sparkles;
  }
};

const TentangKami = () => {
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [cmsContent, setCmsContent] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("about_us")
      .select("section_key,title,body,sort_order")
      .order("sort_order")
      .then(({ data }) => {
        const map: Record<string, Section> = {};
        (data ?? []).forEach((s) => (map[s.section_key] = s));
        setSections(map);
      });

    supabase
      .from("cms_pages")
      .select("content")
      .eq("slug", "tentang-kami")
      .maybeSingle()
      .then(({ data }) => {
        console.log("[Vision Section] Database Value (raw data):", data);
        if (data && data.content) {
          setCmsContent(data.content);
        }
      });
  }, []);

  useEffect(() => {
    if (cmsContent && cmsContent.profil) {
      const p = cmsContent.profil;
      console.log("[Profile Section] Fetched Profile JSON:", JSON.stringify(p, null, 2));
      console.log("[Profile Section] Badge:", p.badge);
      console.log("[Profile Section] Title:", p.title);
      console.log("[Profile Section] Paragraph1:", p.p1);
      console.log("[Profile Section] Paragraph2:", p.p2);
      console.log("[Profile Section] Paragraph3:", p.p3);
      console.log("[Profile Section] Paragraph4:", p.p4);
      console.log("[Profile Section] Highlight Quote:", p.quote);
    }
    if (cmsContent && cmsContent.visiMisi) {
      const v = cmsContent.visiMisi;
      console.log("[Vision Section] Fetched Value - sectionTitle:", v.title);
      console.log("[Vision Section] Fetched Value - pillarTitle:", v.pilarTitle);
    }
  }, [cmsContent]);

  const profilObj = cmsContent?.profil;
  const badge = profilObj?.badge || "Profil Perusahaan";
  const title = profilObj?.title || sections["profil"]?.title || "Profil Perusahaan";
  const quote = profilObj?.quote || sections["highlight"]?.body || "";

  // Paragraphs
  const p1 = profilObj?.p1 || sections["profil"]?.body?.split("\n\n")[0] || "";
  const p2 = profilObj?.p2 || sections["profil"]?.body?.split("\n\n")[1] || "";
  const p3 = profilObj?.p3 || sections["profil"]?.body?.split("\n\n")[2] || "";
  const p4 = profilObj?.p4 || sections["profil"]?.body?.split("\n\n")[3] || "";

  console.log("[Profile Section] Rendered Badge:", badge);
  console.log("[Profile Section] Rendered Title:", title);
  console.log("[Profile Section] Rendered Paragraph1:", p1);
  console.log("[Profile Section] Rendered Paragraph2:", p2);
  console.log("[Profile Section] Rendered Paragraph3:", p3);
  console.log("[Profile Section] Rendered Paragraph4:", p4);
  console.log("[Profile Section] Rendered Highlight Quote:", quote);

  // Vision Mission dynamic variables
  const sectionTitle = cmsContent?.visiMisi?.title || "Visi & Misi Kami";
  const tagline = cmsContent?.visiMisi?.tagline || "Panduan strategis yang mengarahkan langkah kami dalam melayani mitra bisnis";
  const pillarTitle = cmsContent?.visiMisi?.pilarTitle || "Pilar Visi";
  const highlights = cmsContent?.visiMisi?.highlights || [
    { id: "a17ab56f-f5bf-4127-99bc-3b4791dc0a1a", label: "Unggul", icon: "award" },
    { id: "b37c951e-e4c3-4d43-9824-3486df81e2b2", label: "Terpercaya", icon: "shield" },
    { id: "c8e3cb65-e01d-4de6-91e8-6925de9c6c3c", label: "Berdaya Saing", icon: "trending" },
  ];

  console.log("[Vision Section] Rendered Value - sectionTitle:", sectionTitle);
  console.log("[Vision Section] Rendered Value - pillarTitle:", pillarTitle);

  const visi = sections["visi"];
  const misi = sections["misi"];

  const misiPoints = (misi?.body ?? "")
    .split("\n")
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  return (
    <div>
      <PartnersSection groupName="tentang-kami" showTitle={false} className="py-8 bg-muted" />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {badge}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            {p1 && <p>{renderMarkdown(p1)}</p>}
            {p2 && <p>{renderMarkdown(p2)}</p>}
            {p3 && <p>{renderMarkdown(p3)}</p>}
            {p4 && <p>{renderMarkdown(p4)}</p>}
          </div>

          {quote && (
            <div className="mt-8 bg-gradient-to-r from-[#1E3A8A] to-[#1D4ED8] rounded-xl p-6 text-primary-foreground">
              <p className="text-sm leading-relaxed italic">{quote}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{sectionTitle}</h2>
          <p className="text-sm text-muted-foreground mb-10">
            {tagline}
          </p>

          {visi && (
            <div className="bg-card border border-border rounded-xl p-8 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                  <Eye size={20} className="text-[#1E3A8A]" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{visi.title ?? "Visi"}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(visi.body ?? "")}</p>
              
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">
                  {pillarTitle}
                </div>
                {highlights && highlights.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-8">
                    {highlights.map((h: any, hi: number) => {
                      const IconComponent = getPillarIcon(h.icon);
                      return (
                        <div key={h.id || hi} className="flex flex-col items-center gap-1">
                          <IconComponent size={20} className="text-[#1E3A8A]" />
                          <span className="text-xs text-muted-foreground font-medium">{h.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {misi && (
            <div className="bg-card border border-border rounded-xl p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#1E3A8A]" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{misi.title ?? "Misi"}</h3>
              </div>
              {misiPoints.length > 1 ? (
                <ul className="space-y-3">
                  {misiPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle size={16} className="text-[#1E3A8A] flex-shrink-0 mt-0.5" />
                      <span>{renderMarkdown(p)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(misi.body ?? "")}</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TentangKami;
