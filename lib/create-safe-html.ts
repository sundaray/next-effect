import DOMPurify from "isomorphic-dompurify";

export function createSafeHtml(html: string) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return { __html: sanitizedHtml };
}
