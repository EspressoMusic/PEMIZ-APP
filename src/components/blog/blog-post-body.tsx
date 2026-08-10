"use client";

import Link from "next/link";

/** Renders `**bold**` spans and `[text](url)` links within a line of already-extracted text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      const label = match[1];
      const href = match[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={`${keyPrefix}-a${i}`} href={href} className="blog-inline-link">
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-a${i}`}
            href={href}
            className="blog-inline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        )
      );
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{match[3]}</strong>);
    }
    lastIndex = pattern.lastIndex;
    i++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Lightweight markdown renderer for blog articles (headers, bold, links, lists, paragraphs). */
export function BlogPostBody({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const nodes: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushParagraph() {
    const text = paragraph.join("\n").trim();
    paragraph = [];
    if (!text) return;
    nodes.push(
      <p key={key++} className="blog-p">
        {renderInline(text, `p${key}`)}
      </p>
    );
  }

  function flushList() {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    nodes.push(
      <ul key={key++} className="blog-ul">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `li${key}-${i}`)}</li>
        ))}
      </ul>
    );
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h1 key={key++} className="blog-h1">
          {renderInline(trimmed.slice(2), `h1-${key}`)}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h2 key={key++} className="blog-h2">
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h3 key={key++} className="blog-h3">
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>
      );
      continue;
    }
    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();

  return <div className="blog-body">{nodes}</div>;
}
