import { Link } from "react-router-dom";

const CTASection = ({ cmsData }: { cmsData?: any }) => {
  const title = cmsData?.title ?? "Ingin Tahu Lebih Lanjut tentang Kami?";
  const description = cmsData?.description ?? "Tim kami siap menjawab pertanyaan Anda dan membantu menemukan solusi terbaik untuk kebutuhan bisnis Anda.";
  const primaryText = cmsData?.primaryText ?? "Hubungi Tim Kami";
  const primaryLink = cmsData?.primaryLink ?? "#kontak";
  const secondaryText = cmsData?.secondaryText ?? "Lihat Layanan Kami";
  const secondaryLink = cmsData?.secondaryLink ?? "/layanan";

  const isExternalOrAnchor = (url: string) => url.startsWith("http") || url.startsWith("#");

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isExternalOrAnchor(primaryLink) ? (
            <a
              href={primaryLink}
              className="px-8 py-3 bg-navy text-primary-foreground font-semibold text-sm rounded-lg hover:bg-navy-light transition-colors duration-300"
            >
              {primaryText}
            </a>
          ) : (
            <Link
              to={primaryLink}
              className="px-8 py-3 bg-navy text-primary-foreground font-semibold text-sm rounded-lg hover:bg-navy-light transition-colors duration-300"
            >
              {primaryText}
            </Link>
          )}

          {isExternalOrAnchor(secondaryLink) ? (
            <a
              href={secondaryLink}
              className="px-8 py-3 border-2 border-navy text-navy font-semibold text-sm rounded-lg hover:bg-navy hover:text-primary-foreground transition-all duration-300"
            >
              {secondaryText}
            </a>
          ) : (
            <Link
              to={secondaryLink}
              className="px-8 py-3 border-2 border-navy text-navy font-semibold text-sm rounded-lg hover:bg-navy hover:text-primary-foreground transition-all duration-300"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
