import type { Metadata } from "next";
import { MarketingBlogIndex } from "@/components/marketing/marketing-blog-index";
import { getAppBaseUrl } from "@/lib/app-url";
import { getBlogPosts } from "@/lib/blog/posts";

const TITLE = "Blog — Guides for Small Businesses | Peymiz";
const DESCRIPTION =
  "Practical guides for small businesses: order management, appointment booking, online stores, and marketing — so you can work organized and grow.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/en/blog",
    languages: { he: "/blog", en: "/en/blog" },
  },
  openGraph: {
    type: "website",
    url: "/en/blog",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPageEn() {
  const base = getAppBaseUrl() || "https://peymiz.com";
  const posts = getBlogPosts("en");

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Peymiz Blog",
    url: `${base}/en/blog`,
    inLanguage: "en",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${base}/en/blog/${post.slug}`,
      datePublished: post.date,
      inLanguage: "en",
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
      <MarketingBlogIndex locale="en" posts={posts} />
    </>
  );
}
