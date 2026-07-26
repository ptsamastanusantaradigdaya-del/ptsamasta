import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
};

const ArticlesSection = ({ cmsData }: { cmsData?: any }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const limitCount = cmsData?.limitCount ?? 3;

  useEffect(() => {
    supabase
      .from("articles")
      .select("id,title,excerpt,category,thumbnail_url,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limitCount)
      .then(({ data }) => setArticles(data ?? []));
  }, [limitCount]);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "";
    }
  };

  const title = cmsData?.title ?? "Informasi Perusahaan";
  const description = cmsData?.description ?? "Ketahui lebih jauh tentang insight perusahaan kami dengan detail terkini mengenai layanan kami secara detail.";
  const viewAllText = cmsData?.viewAllText ?? "LIHAT SEMUA ARTIKEL";
  const viewAllLink = cmsData?.viewAllLink ?? "/berita";

  return (
    <section id="berita" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a) => (
            <article key={a.id} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                {a.thumbnail_url && (
                  <img src={a.thumbnail_url} alt={a.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {a.category && (
                  <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-gold text-accent-foreground">
                    {a.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{formatDate(a.published_at)}</p>
                <h3 className="font-bold text-foreground text-base mb-2 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{a.excerpt}</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-gold transition-colors">
                  Baca Selengkapnya <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to={viewAllLink} className="inline-block px-8 py-3 border-2 border-foreground text-foreground font-semibold text-sm rounded-lg hover:bg-foreground hover:text-background transition-all duration-300">
            {viewAllText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
