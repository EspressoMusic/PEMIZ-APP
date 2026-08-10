"use client";

import Link from "next/link";
import "@/styles/marketing-site.css";
import {
  MarketingPublicFooter,
  MarketingPublicHeader,
} from "@/components/marketing/marketing-public-chrome";
import { marketingPublicPageClassName } from "@/lib/fonts/marketing-fonts";
import { BlogPostBody } from "@/components/blog/blog-post-body";
import { blogPathFor, type BlogLocale, type BlogPostMeta } from "@/lib/blog/posts";

const COPY: Record<
  BlogLocale,
  { back: string; ctaTitle: string; ctaBody: string; ctaButton: string; related: string }
> = {
  he: {
    back: "← כל המדריכים",
    ctaTitle: "מוכנים להתחיל?",
    ctaBody:
      "פתחו את דף העסק שלכם ב-Peymiz תוך כמה דקות — קישור אחד לחנות, תורים והזמנות מסודרות. 30 יום ניסיון חינם.",
    ctaButton: "פתיחת עסק בחינם",
    related: "עוד מדריכים שיעניינו אתכם",
  },
  en: {
    back: "← All guides",
    ctaTitle: "Ready to get started?",
    ctaBody:
      "Set up your business page on Peymiz in minutes — one link for your store, bookings, and organized orders. 30-day free trial.",
    ctaButton: "Start free",
    related: "More guides you might like",
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

export function MarketingBlogPost({
  locale,
  post,
  markdown,
  related,
}: {
  locale: BlogLocale;
  post: BlogPostMeta;
  markdown: string;
  related: BlogPostMeta[];
}) {
  const copy = COPY[locale];
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <div
      className={marketingPublicPageClassName()}
      data-theme="light"
      lang={locale}
      dir={dir}
      style={{ cursor: "auto", minHeight: "100dvh" }}
    >
      <MarketingPublicHeader />
      <article
        className="container public-legal-article blog-article"
        style={{ padding: "120px 28px 40px", maxWidth: 760 }}
      >
        <Link href={blogPathFor(locale)} className="blog-back-link">
          {copy.back}
        </Link>
        <p className="blog-article-meta">
          <span>{post.category}</span>
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        </p>
        <BlogPostBody markdown={markdown} />
        <div className="blog-cta-box">
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaBody}</p>
          <Link href="/seller" prefetch={false} className="btn btn-primary btn-big blog-cta-btn">
            {copy.ctaButton}
          </Link>
        </div>
      </article>
      {related.length > 0 && (
        <section className="container blog-related" style={{ maxWidth: 960, padding: "0 28px 100px" }}>
          <h2 className="blog-related-title">{copy.related}</h2>
          <div className="blog-card-grid">
            {related.map((r) => (
              <Link key={r.slug} href={blogPathFor(locale, r.slug)} className="blog-card">
                <span className="blog-card-category">{r.category}</span>
                <h3 className="blog-card-title">{r.title}</h3>
                <p className="blog-card-desc">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <MarketingPublicFooter />
    </div>
  );
}
