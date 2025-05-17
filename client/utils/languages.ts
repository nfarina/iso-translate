export type LanguageCategory =
  | "popular"
  | "common"
  | "regional"
  | "fun"
  | "constructed"
  | "annotated";

export interface Language {
  id: string;
  name: string; // e.g., "English", "Spanish"
  code: string; // e.g., "en", "es" (for API keys and internal use)
  subtitle?: string; // e.g., "(Pinyin)", "(Furigana)", "(Romaji)"
  category: LanguageCategory; // Category of language (popular, common, regional, fun, etc.)
  annotationInstructions?: string; // Optional instructions for pronunciation annotations
}

export const LANGUAGES: Language[] = [
  // Popular languages
  { id: "en", name: "English", code: "en", category: "popular" },
  { id: "es", name: "Spanish", code: "es", category: "popular" },
  {
    id: "zh",
    name: "Chinese",
    code: "zh",
    category: "popular",
  },
  { id: "ar", name: "Arabic", code: "ar", category: "popular" },
  { id: "hi", name: "Hindi", code: "hi", category: "popular" },
  { id: "fr", name: "French", code: "fr", category: "popular" },
  { id: "ru", name: "Russian", code: "ru", category: "popular" },
  { id: "pt", name: "Portuguese", code: "pt", category: "popular" },
  {
    id: "ja",
    name: "Japanese",
    code: "ja",
    category: "popular",
  },
  { id: "de", name: "German", code: "de", category: "popular" },

  // Common languages
  { id: "it", name: "Italian", code: "it", category: "common" },
  { id: "ko", name: "Korean", code: "ko", category: "common" },
  { id: "tr", name: "Turkish", code: "tr", category: "common" },
  { id: "nl", name: "Dutch", code: "nl", category: "common" },
  { id: "pl", name: "Polish", code: "pl", category: "common" },
  { id: "vi", name: "Vietnamese", code: "vi", category: "common" },
  { id: "th", name: "Thai", code: "th", category: "common" },
  { id: "id", name: "Indonesian", code: "id", category: "common" },
  { id: "sv", name: "Swedish", code: "sv", category: "common" },
  { id: "uk", name: "Ukrainian", code: "uk", category: "common" },

  // Regional languages
  { id: "yue", name: "Cantonese", code: "yue", category: "regional" },
  { id: "bn", name: "Bengali", code: "bn", category: "regional" },
  { id: "el", name: "Greek", code: "el", category: "regional" },
  { id: "hu", name: "Hungarian", code: "hu", category: "regional" },
  { id: "ta", name: "Tamil", code: "ta", category: "regional" },
  { id: "pa", name: "Punjabi", code: "pa", category: "regional" },
  { id: "sw", name: "Swahili", code: "sw", category: "regional" },
  { id: "ur", name: "Urdu", code: "ur", category: "regional" },
  { id: "ms", name: "Malay", code: "ms", category: "regional" },
  { id: "te", name: "Telugu", code: "te", category: "regional" },

  // Constructed languages
  { id: "eo", name: "Esperanto", code: "eo", category: "constructed" },
  { id: "ia", name: "Interlingua", code: "ia", category: "constructed" },
  { id: "jbo", name: "Lojban", code: "jbo", category: "constructed" },
  { id: "tok", name: "Toki Pona", code: "tok", category: "constructed" },

  // Fun and fictional languages
  { id: "tlh", name: "Klingon", code: "tlh", category: "fun" },
  { id: "pig", name: "Pig Latin", code: "pig", category: "fun" },
  { id: "sjn", name: "Elvish (Sindarin)", code: "sjn", category: "fun" },
  { id: "qya", name: "Elvish (Quenya)", code: "qya", category: "fun" },
  { id: "dth", name: "Dothraki", code: "dth", category: "fun" },
  { id: "nav", name: "Na'vi", code: "nav", category: "fun" },
  { id: "la", name: "Latin", code: "la", category: "fun" },
  { id: "emoji", name: "Emoji", code: "emoji", category: "fun" },
  { id: "hvy", name: "High Valyrian", code: "hvy", category: "fun" },

  // Annotated languages
  {
    id: "zh-pinyin",
    name: "Chinese",
    subtitle: "Pinyin",
    code: "zh",
    category: "annotated",
    annotationInstructions:
      "Include pinyin readings for characters using the format: 汉字[hànzì].",
  },
  {
    id: "ja-furigana",
    name: "Japanese",
    subtitle: "Furigana",
    code: "ja",
    category: "annotated",
    annotationInstructions:
      "Include furigana readings for kanji using the format: 漢字[かんじ].",
  },
  {
    id: "ja-romaji",
    name: "Japanese",
    subtitle: "Romaji",
    code: "ja",
    category: "annotated",
    annotationInstructions:
      "Include romaji (Latin alphabet) readings for all Japanese words using the format: 日本語[nihongo].",
  },
  {
    id: "ko-romanization",
    name: "Korean",
    subtitle: "Romanization",
    code: "ko",
    category: "annotated",
    annotationInstructions:
      "Include romanized readings for Korean words using the format: 한국어[hangugeo].",
  },
  {
    id: "ru-transliteration",
    name: "Russian",
    subtitle: "Transliteration",
    code: "ru",
    category: "annotated",
    annotationInstructions:
      "Include Latin transliteration for Russian words using the format: русский[russkiy].",
  },
  {
    id: "ar-pronunciation",
    name: "Arabic",
    subtitle: "Pronunciation",
    code: "ar",
    category: "annotated",
    annotationInstructions:
      "Include Latin transliteration for Arabic words using the format: العربية[al-arabiya].",
  },
  {
    id: "th-pronunciation",
    name: "Thai",
    subtitle: "Pronunciation",
    code: "th",
    category: "annotated",
    annotationInstructions:
      "Include Latin transliteration for Thai words using the format: ภาษาไทย[phasa thai].",
  },
];

// Helper function to check if a language is "featured" (in popular category)
export const isFeaturedLanguage = (lang: Language) =>
  lang.category === "popular";

export const DEFAULT_LANGUAGE_1 =
  LANGUAGES.find((lang) => lang.code === "en") || LANGUAGES[0];
export const DEFAULT_LANGUAGE_2 =
  LANGUAGES.find((lang) => lang.code === "es") || LANGUAGES[1];
