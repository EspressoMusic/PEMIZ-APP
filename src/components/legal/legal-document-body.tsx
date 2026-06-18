"use client";

/** Lightweight markdown renderer for legal text (headers + paragraphs). */
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
  let key = 0;

  function flushParagraph() {
    const text = paragraph.join("\n").trim();
    if (!text) return;
    nodes.push(
      <p
        key={key++}
        className={`whitespace-pre-wrap text-[14px] leading-[1.5] ${textClass}`}
      >
        {text}
      </p>
    );
    paragraph = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      nodes.push(
        <h1
          key={key++}
          className={`text-[20px] font-extrabold ${textClass}`}
        >
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      nodes.push(
        <h2
          key={key++}
          className={`mt-3 text-[17px] font-bold ${textClass}`}
        >
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      nodes.push(
        <h3
          key={key++}
          className={`mt-2 text-[15px] font-bold ${textClass}`}
        >
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }
    if (trimmed === "---") {
      flushParagraph();
      nodes.push(
        <hr key={key++} className={variant === "marketing" ? "border-[var(--line)]" : "border-bakery-border/30"} />
      );
      continue;
    }
    if (trimmed === "") {
      flushParagraph();
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();

  return <div className="space-y-3">{nodes}</div>;
}
