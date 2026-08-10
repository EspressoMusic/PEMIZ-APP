import type { Metadata } from "next";
import { MarketingBlogIndex } from "@/components/marketing/marketing-blog-index";
import { getAppBaseUrl } from "@/lib/app-url";
import { getBlogPosts } from "@/lib/blog/posts";

const TITLE = "בלוג — מדריכים לעסקים קטנים | Peymiz";
const DESCRIPTION =
  "מדריכים פרקטיים לעסקים קטנים: ניהול הזמנות, מערכת תורים, חנות אונליין ושיווק — כדי לעבוד מסודר ולגדול.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    languages: { he: "/blog", en: "/en/blog" },
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const base = getAppBaseUrl() || "https://peymiz.com";
  const posts = getBlogPosts("he");

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Peymiz Blog",
    url: `${base}/blog`,
    inLanguage: "he",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${base}/blog/${post.slug}`,
      datePublished: post.date,
      inLanguage: "he",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingBlogIndex locale="he" posts={posts} />
    </>
  );
}
