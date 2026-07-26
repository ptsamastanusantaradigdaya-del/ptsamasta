import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Tag, X, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Article = {
  id: string;
  author: string | null;
  category: string | null;
  content: string | null;
  excerpt: string | null;
  published_at: string | null;
  slug: string;
  thumbnail_url: string | null;
  title: string;
};

const Berita = () => {
  const [hero, setHero] = useState({
    judul: "Berita & Artikel",
    subtitle: "Dapatkan informasi, kabar terbaru, dan insight bisnis menarik seputar layanan dan industri kami",
    gambar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Hero Page Config
        const { data: pageData } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "berita")
          .maybeSingle();

        if (pageData && pageData.content && typeof pageData.content === "object") {
          const content = pageData.content as any;
          if (content.hero) {
            setHero({
              judul: content.hero.judul || "Berita & Artikel",
              subtitle: content.hero.subtitle || "Dapatkan informasi, kabar terbaru, dan insight bisnis menarik seputar layanan dan industri kami",
              gambar: content.hero.gambar || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
            });
          }
        }

        // 2. Fetch Articles list
        const { data: articlesData, error } = await supabase
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (articlesData) {
          const formatted: Article[] = articlesData.map((a) => ({
            id: a.id,
            author: a.author,
            category: a.category,
            content: a.content,
            excerpt: a.excerpt,
            published_at: a.published_at,
            slug: a.slug,
            thumbnail_url: a.thumbnail_url,
            title: a.title
          }));
          setArticles(formatted);
        }
      } catch (e: any) {
        console.error("Gagal memuat data berita: ", e.message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#1E3A8A]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-start gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-gold transition-colors">Beranda</Link>
            <span>&gt;</span>
            <span className="text-white">Berita</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
            <div className="flex-1 text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                {hero.judul}
              </h1>
              <p className="text-white/80 text-sm max-w-xl">
                {hero.subtitle}
              </p>
            </div>
            {hero.gambar && (
              <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-64 rounded-2xl overflow-hidden shadow-2xl bg-white/10 p-2 backdrop-blur-sm">
                <img
                  src={hero.gambar}
                  alt={hero.judul}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,80 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12 container mx-auto px-4 max-w-4xl">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Memuat berita...</div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">Belum ada berita atau artikel yang dipublikasikan.</div>
        ) : (
          <div className="space-y-8">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 p-4 md:p-6"
              >
                {/* Thumbnail */}
                {art.thumbnail_url && (
                  <div className="flex-shrink-0 w-full md:w-64 h-48 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={art.thumbnail_url}
                      alt={art.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                {/* Info Text */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {art.category && (
                        <span className="font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center gap-1">
                          <Tag size={10} />
                          {art.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(art.published_at)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground hover:text-[#1E3A8A] transition-colors leading-tight">
                      <button
                        onClick={() => setSelectedArticle(art)}
                        className="text-left font-bold"
                      >
                        {art.title}
                      </button>
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => setSelectedArticle(art)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-blue-800 transition-colors uppercase tracking-wider"
                    >
                      Baca Selengkapnya <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Image Header */}
            {selectedArticle.thumbnail_url && (
              <div className="aspect-[21/9] w-full bg-muted relative flex-shrink-0">
                <img
                  src={selectedArticle.thumbnail_url}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white text-xs flex items-center gap-3">
                  {selectedArticle.category && (
                    <span className="font-semibold px-2.5 py-0.5 rounded bg-blue-600 text-white flex items-center gap-1">
                      <Tag size={10} />
                      {selectedArticle.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(selectedArticle.published_at)}
                  </span>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                {!selectedArticle.thumbnail_url && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {selectedArticle.category && (
                      <span className="font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A]">
                        {selectedArticle.category}
                      </span>
                    )}
                    <span>{formatDate(selectedArticle.published_at)}</span>
                  </div>
                )}
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">{selectedArticle.title}</h3>
                
                {selectedArticle.author && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                    <User size={12} /> Ditulis oleh: <span className="font-semibold text-foreground">{selectedArticle.author}</span>
                  </p>
                )}
              </div>

              {/* Excerpt */}
              {selectedArticle.excerpt && (
                <p className="text-sm font-medium text-foreground italic border-l-4 border-gold pl-4 py-1 bg-muted/30">
                  {selectedArticle.excerpt}
                </p>
              )}

              {/* Content */}
              {selectedArticle.content && (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap space-y-4">
                  {selectedArticle.content}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-border flex justify-end flex-shrink-0">
              <Button onClick={() => setSelectedArticle(null)} className="bg-navy-dark text-white hover:bg-navy-dark/95">
                Tutup Artikel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Berita;
