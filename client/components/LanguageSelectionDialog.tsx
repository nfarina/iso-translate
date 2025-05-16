import { useEffect, useRef } from "react";
import { X } from "react-feather";
import { Language, LANGUAGES } from "../utils/languages";

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="p-0 px-4 bg-transparent backdrop:bg-black backdrop:opacity-70 rounded-lg max-w-md w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
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
      </div>
    </dialog>
  );
}
