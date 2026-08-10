import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingBlogPost } from "@/components/marketing/marketing-blog-post";
import { getAppBaseUrl } from "@/lib/app-url";
import { getBlogPostMeta, getBlogPosts, getRelatedPosts } from "@/lib/blog/posts";
import { loadBlogPostMarkdown } from "@/lib/blog/content";

export function generateStaticParams() {
  return getBlogPosts("en").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostMeta("en", slug);
  if (!post) return { title: "Guide not found — Peymiz" };

  const path = `/en/blog/${slug}`;
  const title = `${post.title} — Peymiz`;

  return {
    title,
    description: post.description,
    alternates: {
      canonical: path,
      languages: { he: `/blog/${slug}`, en: path },
    },
    openGraph: {
      type: "article",
      url: path,
      title,
      description: post.description,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
    },
  };
}

export default async function BlogPostPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostMeta("en", slug);
  if (!post) notFound();

  const markdown = loadBlogPostMarkdown("en", slug);
  const related = getRelatedPosts("en", slug);
  const base = getAppBaseUrl() || "https://peymiz.com";
  const url = `${base}/en/blog/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    url,
    publisher: { "@type": "Organization", name: "Peymiz", url: base },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Peymiz", item: base },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/en/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingBlogPost locale="en" post={post} markdown={markdown} related={related} />
    </>
  );
}
