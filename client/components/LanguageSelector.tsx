import { Language, LANGUAGES } from "../utils/languages";

interface LanguageSelectorProps {
  currentLanguage1: Language;
  onLanguage1Change: (language: Language) => void;
  currentLanguage2: Language;
  onLanguage2Change: (language: Language) => void;
  isSessionActive: boolean;
}

export default function LanguageSelector({
  currentLanguage1,
  onLanguage1Change,
  currentLanguage2,
  onLanguage2Change,
  isSessionActive,
}: LanguageSelectorProps) {
  const handleLang1Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    const selectedLang = LANGUAGES.find((lang) => lang.code === selectedCode);
    if (selectedLang) {
      onLanguage1Change(selectedLang);
    }
  };

  const handleLang2Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    const selectedLang = LANGUAGES.find((lang) => lang.code === selectedCode);
    if (selectedLang) {
      onLanguage2Change(selectedLang);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow mb-4">
      <h3 className="text-md font-semibold mb-3 dark:text-white">
        Select Translation Languages
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label
            htmlFor="language1"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Language 1
          </label>
          <select
            id="language1"
            value={currentLanguage1.code}
            onChange={handleLang1Change}
            disabled={isSessionActive}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label
            htmlFor="language2"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Language 2
          </label>
          <select
            id="language2"
            value={currentLanguage2.code}
            onChange={handleLang2Change}
            disabled={isSessionActive}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {currentLanguage1.code === currentLanguage2.code && (
         <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
           Selecting the same language for both outputs is usually not intended.
         </p>
      )}
    </div>
  );
}
