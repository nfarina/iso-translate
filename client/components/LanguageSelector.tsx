import { useState } from "react";
import { Language, LANGUAGES } from "../utils/languages";
import InstallDialog from "./InstallDialog";

const isInstalled =
  "standalone" in window.navigator && window.navigator.standalone;

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
  const [showInstallDialog, setShowInstallDialog] = useState(false);

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
    <div className="flex-grow px-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-2 flex-1">
          <select
            value={currentLanguage1.code}
            onChange={handleLang1Change}
            disabled={isSessionActive}
            className="flex-1 px-1 py-1 text-sm rounded-md focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <select
            value={currentLanguage2.code}
            onChange={handleLang2Change}
            disabled={isSessionActive}
            className="flex-1 px-1 py-1 text-sm rounded-md focus:outline-hidden focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {!isInstalled && (
          <button
            onClick={() => setShowInstallDialog(true)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full shadow-sm ml-2"
          >
            Install app
          </button>
        )}
      </div>

      <InstallDialog
        isOpen={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />
    </div>
  );
}
