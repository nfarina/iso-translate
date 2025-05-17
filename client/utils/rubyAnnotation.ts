import { Language } from "./languages";

export interface AnnotatedText {
  base: string;
  reading: string;
}

/**
 * Parse text that contains annotation markers like 漢字[かんじ] or 汉字[hànzì]
 * into a structured format that can be used for rendering with ruby tags.
 *
 * @param text - The text to parse, potentially containing annotation markers
 * @param languageCode - The language code ('ja' for Japanese, 'zh' for Chinese)
 * @returns An array of strings (regular text) and AnnotatedText objects (for ruby rendering)
 */
export function parseAnnotatedText(
  text: string,
  language: Language,
): (string | AnnotatedText)[] {
  // if (language.annotationInstructions) return [text];

  const regex = /([^\[]+)\[([^\]]+)\]/g;
  const parts: (string | AnnotatedText)[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    parts.push({
      base: match[1],
      reading: match[2],
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
