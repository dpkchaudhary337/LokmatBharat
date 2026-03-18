"use client";

const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  // Remove span tags but keep their content
  let cleaned = html.replace(/<span[^>]*>/gi, "").replace(/<\/span>/gi, "");
  // Remove strong tags but keep their content
  cleaned = cleaned.replace(/<strong[^>]*>/gi, "").replace(/<\/strong>/gi, "");
  // Remove style attributes from all tags
  cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, "");
  // Remove inline style tags
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  return cleaned;
};

export default sanitizeHtml;

