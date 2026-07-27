import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

const SITE_NAME = "ProdPartner";
const SITE_URL = "https://batchbuy-partner.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const Seo = ({ title, description, image, path }: SeoProps) => {
  const fullTitle = `${title} - ${SITE_NAME}`;
  const url = path ? `${SITE_URL}${path}` : undefined;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default Seo;
