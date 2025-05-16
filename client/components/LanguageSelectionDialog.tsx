import { useState } from "react";
import { X } from "react-feather";
import {
  LANGUAGES,
  Language,
  LanguageCategory,
  isFeaturedLanguage,
} from "../utils/languages";
import Dialog from "./Dialog";

interface LanguageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  title: string;
}

// Category display names for UI
const CATEGORY_NAMES: Record<LanguageCategory, string> = {
  popular: "Popular Languages",
  common: "Common Languages",
  regional: "Regional Languages",
  constructed: "Constructed Languages",
  fun: "Fun & Fictional Languages",
};

// Order to display categories
const CATEGORY_ORDER: LanguageCategory[] = [
  "popular",
  "common",
  "regional",
  "constructed",
  "fun",
];

export default function LanguageSelectionDialog({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageSelect,
  title,
}: LanguageSelectionDialogProps) {
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // If showing all languages, we'll categorize them
  // Otherwise, just show the popular (featured) languages
  const displayLanguages = showAllLanguages
    ? LANGUAGES
    : LANGUAGES.filter((lang) => isFeaturedLanguage(lang));

  // Group languages by category when showing all
  const languagesByCategory = LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.category]) {
      acc[lang.category] = [];
    }
    acc[lang.category].push(lang);
    return acc;
  }, {} as Record<LanguageCategory, Language[]>);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium dark:text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[60vh]">
        {showAllLanguages ? (
          // Display with categories
          <div>
            {CATEGORY_ORDER.map((category) => (
              <div key={category} className="mb-4">
                <h4 className="text-base font-bold  text-gray-800 dark:text-gray-200 mb-3 pl-0 pr-3 tracking-wider uppercase text-sm py-1">
                  {CATEGORY_NAMES[category]}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languagesByCategory[category]?.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        onLanguageSelect(language);
                        onClose();
                      }}
                      className={`p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedLanguage.code === language.code
                          ? "bg-blue-100 dark:bg-blue-900"
                          : ""
                      }`}
                    >
                      <div className="font-medium dark:text-white">
                        {language.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language.code}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Display just popular languages without categories
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {displayLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageSelect(language);
                  onClose();
                }}
                className={`p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedLanguage.code === language.code
                    ? "bg-blue-100 dark:bg-blue-900"
                    : ""
                }`}
              >
                <div className="font-medium dark:text-white">
                  {language.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {language.code}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowAllLanguages(!showAllLanguages)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showAllLanguages ? "Show fewer" : "Show more"}
        </button>
      </div>
    </Dialog>
  );
}
