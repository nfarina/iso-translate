export type LanguageCategory =
  | "popular"
  | "common"
  | "regional"
  | "fun"
  | "constructed";

export interface Language {
  name: string; // e.g., "English", "Spanish"
  code: string; // e.g., "en", "es" (for API keys and internal use)
  category: LanguageCategory; // Category of language (popular, common, regional, fun, etc.)
}

export const LANGUAGES: Language[] = [
  // Popular languages
  { name: "English", code: "en", category: "popular" },
  { name: "Spanish", code: "es", category: "popular" },
  { name: "Chinese", code: "zh", category: "popular" }, // Using "zh" for simplicity, ensure OpenAI compatibility
  { name: "Arabic", code: "ar", category: "popular" },
  { name: "Hindi", code: "hi", category: "popular" },
  { name: "French", code: "fr", category: "popular" },
  { name: "Russian", code: "ru", category: "popular" },
  { name: "Portuguese", code: "pt", category: "popular" },
  { name: "Japanese", code: "ja", category: "popular" },
  { name: "German", code: "de", category: "popular" },

  // Common languages
  { name: "Italian", code: "it", category: "common" },
  { name: "Korean", code: "ko", category: "common" },
  { name: "Turkish", code: "tr", category: "common" },
  { name: "Dutch", code: "nl", category: "common" },
  { name: "Polish", code: "pl", category: "common" },
  { name: "Vietnamese", code: "vi", category: "common" },
  { name: "Thai", code: "th", category: "common" },
  { name: "Indonesian", code: "id", category: "common" },
  { name: "Swedish", code: "sv", category: "common" },
  { name: "Ukrainian", code: "uk", category: "common" },

  // Regional languages
  { name: "Cantonese", code: "yue", category: "regional" },
  { name: "Bengali", code: "bn", category: "regional" },
  { name: "Greek", code: "el", category: "regional" },
  { name: "Hungarian", code: "hu", category: "regional" },
  { name: "Tamil", code: "ta", category: "regional" },
  { name: "Punjabi", code: "pa", category: "regional" },
  { name: "Swahili", code: "sw", category: "regional" },
  { name: "Urdu", code: "ur", category: "regional" },
  { name: "Malay", code: "ms", category: "regional" },
  { name: "Telugu", code: "te", category: "regional" },

  // Constructed languages
  { name: "Esperanto", code: "eo", category: "constructed" },
  { name: "Interlingua", code: "ia", category: "constructed" },
  { name: "Lojban", code: "jbo", category: "constructed" },
  { name: "Toki Pona", code: "tok", category: "constructed" },

  // Fun and fictional languages
  { name: "Klingon", code: "tlh", category: "fun" },
  { name: "Pig Latin", code: "pig", category: "fun" },
  { name: "Elvish (Sindarin)", code: "sjn", category: "fun" },
  { name: "Elvish (Quenya)", code: "qya", category: "fun" },
  { name: "Dothraki", code: "dth", category: "fun" },
  { name: "Na'vi", code: "nav", category: "fun" },
  { name: "Latin", code: "la", category: "fun" },
  { name: "Emoji", code: "emoji", category: "fun" },
  { name: "High Valyrian", code: "hvy", category: "fun" },
];

// Helper function to check if a language is "featured" (in popular category)
export const isFeaturedLanguage = (lang: Language) =>
  lang.category === "popular";

export const DEFAULT_LANGUAGE_1 =
  LANGUAGES.find((lang) => lang.code === "en") || LANGUAGES[0];
export const DEFAULT_LANGUAGE_2 =
  LANGUAGES.find((lang) => lang.code === "es") || LANGUAGES[1];
