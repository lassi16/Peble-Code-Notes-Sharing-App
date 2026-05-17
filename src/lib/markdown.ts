const codeBlockPattern = /```([a-zA-Z0-9+#-]*)\n([\s\S]*?)```/g;

const languageLabels: Record<string, string> = {
  python: "Python",
  cpp: "C++",
  "c++": "C++",
  java: "Java",
  html: "HTML",
};

export function renderMarkdown(text: string): string {
  const codeBlocks: string[] = [];
  const withoutCodeBlocks = text.replace(codeBlockPattern, (_match, rawLanguage, rawCode) => {
    const language = String(rawLanguage).trim().toLowerCase();
    const label = languageLabels[language] ?? language.toUpperCase();
    const header = label
      ? `<div class="code-block-header">${escapeHtml(label)}</div>`
      : "";

    codeBlocks.push(
      `<div class="code-block">${header}<pre><code>${escapeHtml(
        stripTrailingNewline(String(rawCode))
      )}</code></pre></div>`
    );

    return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;
  });

  const rendered = escapeHtml(withoutCodeBlocks)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n/g, "<br />");

  return codeBlocks.reduce(
    (html, codeBlock, index) => html.replace(`@@CODE_BLOCK_${index}@@`, codeBlock),
    rendered
  );
}

export function renderCodeBlock(code: string, language: string): string {
  const normalizedLanguage = language.trim().toLowerCase();
  const label = languageLabels[normalizedLanguage] ?? normalizedLanguage.toUpperCase();
  const header = label
    ? `<div class="code-block-header">${escapeHtml(label)}</div>`
    : "";

  return `<div class="code-block">${header}<pre><code>${escapeHtml(code)}</code></pre></div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripTrailingNewline(value: string): string {
  return value.replace(/\n$/, "");
}
