export interface Language {
  name: string; // e.g., "English", "Spanish"
  code: string; // e.g., "en", "es" (for API keys and internal use)
}

export const LANGUAGES: Language[] = [
  { name: "English", code: "en" },
  { name: "Spanish", code: "es" },
  { name: "Japanese", code: "ja" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Chinese (Simplified)", code: "zh" }, // Using "zh" for simplicity, ensure OpenAI compatibility
  { name: "Korean", code: "ko" },
  { name: "Italian", code: "it" },
  { name: "Portuguese", code: "pt" },
  { name: "Russian", code: "ru" },
];

export const DEFAULT_LANGUAGE_1 = LANGUAGES.find(lang => lang.code === "en") || LANGUAGES[0];
export const DEFAULT_LANGUAGE_2 = LANGUAGES.find(lang => lang.code === "es") || LANGUAGES[1];

export function findLanguageByCode(code: string | null): Language | undefined {
  if (!code) return undefined;
  return LANGUAGES.find(lang => lang.code === code);
}
