"use client";

import Link from "next/link";
import "@/styles/marketing-site.css";
import {
  MarketingPublicFooter,
  MarketingPublicHeader,
} from "@/components/marketing/marketing-public-chrome";
import { marketingPublicPageClassName } from "@/lib/fonts/marketing-fonts";
import { blogPathFor, type BlogLocale, type BlogPostMeta } from "@/lib/blog/posts";

const COPY: Record<BlogLocale, { title: string; lead: string }> = {
  he: {
    title: "מדריכים וטיפים לעסקים קטנים",
    lead: "כל מה שצריך לדעת על ניהול הזמנות, תורים וחנות אונליין לעסק הקטן שלכם — מדריכים פרקטיים מהצוות של Peymiz.",
  },
  en: {
    title: "Guides for Small Businesses",
    lead: "Everything you need to know about orders, appointments, and running an online store for your small business — practical guides from the Peymiz team.",
  },
};

function formatDate(iso: string, locale: BlogLocale) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function MarketingBlogIndex({
  locale,
  posts,
}: {
  locale: BlogLocale;
  posts: BlogPostMeta[];
}) {
  const copy = COPY[locale];
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <div
      className={marketingPublicPageClassName(locale)}
      data-theme="light"
      lang={locale}
      dir={dir}
      style={{ cursor: "auto", minHeight: "100dvh" }}
    >
      <MarketingPublicHeader />
      <article
        className="container public-legal-article blog-index"
        style={{ padding: "120px 28px 80px", maxWidth: 960 }}
      >
        <h1 className="blog-index-title">{copy.title}</h1>
        <p className="blog-index-lead">{copy.lead}</p>
        <div className="blog-card-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={blogPathFor(locale, post.slug)} className="blog-card">
              <span className="blog-card-category">{post.category}</span>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-desc">{post.description}</p>
              <time className="blog-card-date" dateTime={post.date}>
                {formatDate(post.date, locale)}
              </time>
            </Link>
          ))}
        </div>
      </article>
      <MarketingPublicFooter />
    </div>
  );
}
