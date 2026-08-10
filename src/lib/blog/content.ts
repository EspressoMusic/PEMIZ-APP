import fs from "fs";
import path from "path";
import type { BlogLocale } from "@/lib/blog/posts";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/** Server-only: reads a post's markdown body. Never import this from a client component. */
export function loadBlogPostMarkdown(locale: BlogLocale, slug: string): string {
  return fs.readFileSync(path.join(BLOG_DIR, locale, `${slug}.md`), "utf8");
}
