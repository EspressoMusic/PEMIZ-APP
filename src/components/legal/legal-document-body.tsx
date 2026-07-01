"use client";

/** Renders `**bold**` spans within a line of already-extracted text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{part}</strong> : part
  );
}

/** Lightweight markdown renderer for legal text (headers, bold, lists, paragraphs). */
export function LegalDocumentBody({
  markdown,
  variant = "bakery",
}: {
  markdown: string;
  variant?: "bakery" | "marketing";
}) {
  const textClass =
    variant === "marketing" ? "text-[var(--text)]" : "text-bakery-ink";
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
      <p
        key={key++}
        className={`whitespace-pre-wrap text-[14px] leading-[1.5] ${textClass}`}
      >
        {renderInline(text, `p${key}`)}
      </p>
    );
  }

  function flushList() {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    nodes.push(
      <ul
        key={key++}
        className={`list-disc space-y-1 ps-5 text-[14px] leading-[1.5] ${textClass}`}
      >
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
        <h1 key={key++} className={`text-[20px] font-extrabold ${textClass}`}>
          {renderInline(trimmed.slice(2), `h1-${key}`)}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h2 key={key++} className={`mt-3 text-[17px] font-bold ${textClass}`}>
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h3 key={key++} className={`mt-2 text-[15px] font-bold ${textClass}`}>
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>
      );
      continue;
    }
    if (trimmed === "---") {
      flushParagraph();
      flushList();
      nodes.push(
        <hr
          key={key++}
          className={variant === "marketing" ? "border-[var(--line)]" : "border-bakery-border/30"}
        />
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

  return <div className="space-y-3">{nodes}</div>;
}
