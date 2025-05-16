import { useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import { Language } from "../utils/languages";
import InstallDialog from "./InstallDialog";
import LanguageSelectionDialog from "./LanguageSelectionDialog";

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
  const [showLanguage1Dialog, setShowLanguage1Dialog] = useState(false);
  const [showLanguage2Dialog, setShowLanguage2Dialog] = useState(false);

  const handleSwapLanguages = () => {
    if (!isSessionActive) {
      onLanguage1Change(currentLanguage2);
      onLanguage2Change(currentLanguage1);
    }
  };

  return (
    <div className="flex-grow px-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div
            onClick={() => !isSessionActive && setShowLanguage1Dialog(true)}
            className={`flex items-center text-base rounded px-2 py-1 -mx-2 -my-1 ${
              isSessionActive
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40"
            }`}
          >
            <span className="text-gray-800 dark:text-white">
              {currentLanguage1.name}
            </span>
          </div>

          <button
            onClick={handleSwapLanguages}
            disabled={isSessionActive}
            className={`flex items-center text-gray-500 dark:text-gray-400 rounded p-1 ${
              isSessionActive
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40"
            }`}
            title="Swap languages"
          >
            <ArrowLeft size={14} className="stroke-current" />
            <ArrowRight size={14} className="stroke-current -ml-1.5" />
          </button>

          <div
            onClick={() => !isSessionActive && setShowLanguage2Dialog(true)}
            className={`flex items-center text-base rounded px-2 py-1 -mx-2 -my-1 ${
              isSessionActive
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40"
            }`}
          >
            <span className="text-gray-800 dark:text-white">
              {currentLanguage2.name}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {!isInstalled && (
          <button
            onClick={() => setShowInstallDialog(true)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full shadow-sm mb-1"
          >
            Install app
          </button>
        )}
      </div>

      <InstallDialog
        isOpen={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />

      <LanguageSelectionDialog
        isOpen={showLanguage1Dialog}
        onClose={() => setShowLanguage1Dialog(false)}
        selectedLanguage={currentLanguage1}
        onLanguageSelect={onLanguage1Change}
        title="Select top language"
      />

      <LanguageSelectionDialog
        isOpen={showLanguage2Dialog}
        onClose={() => setShowLanguage2Dialog(false)}
        selectedLanguage={currentLanguage2}
        onLanguageSelect={onLanguage2Change}
        title="Select bottom language"
      />
    </div>
  );
}
