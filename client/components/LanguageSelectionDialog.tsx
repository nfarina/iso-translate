import { X } from "react-feather";
import { Language, LANGUAGES } from "../utils/languages";
import Dialog from "./Dialog";

interface LanguageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  title: string;
}

export default function LanguageSelectionDialog({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageSelect,
  title,
}: LanguageSelectionDialogProps) {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto">
        {LANGUAGES.map((language) => (
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
            <div className="font-medium dark:text-white">{language.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language.code}
            </div>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
