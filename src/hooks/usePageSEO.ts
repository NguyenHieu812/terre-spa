import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  canonicalUrl?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = "Terre Spa - Gội Đầu Dưỡng Sinh, Massage Trị Liệu & Chăm Sóc Da Hà Nội";
const DEFAULT_DESCRIPTION =
  "Terre Spa - Không gian thư giãn đẳng cấp tại Hà Nội với các liệu pháp gội đầu dưỡng sinh Đông Y, massage trị liệu cổ vai gáy, chăm sóc & trẻ hóa da từ thảo dược thiên nhiên.";
const DEFAULT_IMAGE = "https://terre-spa.vercel.app/src/assets/images/spa_hero_bg_1781666735594.jpg";

export function usePageSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  canonicalUrl,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title
      ? title.includes("Terre Spa")
        ? title
        : `${title} | Terre Spa`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', "name", "description", description);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    }

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    if (canonicalUrl) {
      setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    }

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // 5. Canonical Link
    const currentUrl = canonicalUrl || window.location.href;
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", currentUrl);

    // 6. Dynamic JSON-LD Structured Data
    let scriptTag = document.getElementById("page-structured-data") as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "page-structured-data";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup on unmount (restore defaults)
    return () => {
      const dynamicScript = document.getElementById("page-structured-data");
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, structuredData]);
}
