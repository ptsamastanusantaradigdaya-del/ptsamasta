import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import ArticlesSection from "@/components/ArticlesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const [cmsData, setCmsData] = useState<any>(null);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const { data } = await supabase
          .from("cms_pages")
          .select("content")
          .eq("slug", "beranda")
          .maybeSingle();
        if (data && data.content) {
          setCmsData(data.content);
        }
      } catch (e) {
        console.error("Gagal memuat CMS Beranda:", e);
      }
    };
    void fetchCms();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection cmsData={cmsData?.hero} />
      <PartnersSection cmsData={cmsData?.mitra} />
      <ArticlesSection cmsData={cmsData?.informasi} />
      <WhyChooseUsSection cmsData={cmsData?.mengapa} />
      <CTASection cmsData={cmsData?.cta} />
      <Footer />
    </div>
  );
};

export default Index;
