/**
 * A deliberately tiny inline-markdown renderer for lesson copy.
 *
 * Content is authored by us, but everything is HTML-escaped before any markup
 * is applied, so a stray angle bracket in a code sample can never become live
 * markup. Only the four inline constructs the lessons actually use are
 * supported: `code`, **bold**, *italic*, and [links](url).
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => ESCAPES[c]!);
}

/** Only http(s), site-relative and in-page links may become anchors. */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return null;
}

export function inlineMarkdown(input: string): string {
  let out = escapeHtml(input);

  // Pull `code` spans out first so markup inside them is left alone.
  const codeSpans: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_match, code: string) => {
    codeSpans.push(code);
    return `@@CODE${codeSpans.length - 1}@@`;
  });

  // [text](href)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, text: string, href: string) => {
    const safe = safeHref(href);
    if (!safe) return text;
    const external = /^https?:\/\//i.test(safe);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${safe}"${attrs}>${text}</a>`;
  });

  // **bold** then *italic*
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  // Restore code spans.
  out = out.replace(/@@CODE(\d+)@@/g, (_match, i: string) => `<code>${codeSpans[Number(i)]}</code>`);

  return out;
}
