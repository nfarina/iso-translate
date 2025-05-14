import { useState } from "react";
import { Check, Copy, Mic, MicOff, Trash2 } from "react-feather";
import { TranslationSegment } from "../hooks/useOpenAISession";
import { useLocalStorage } from "../utils/useLocalStorage";
import Button from "./Button";

interface SessionControlActionProps {
  action: () => Promise<void> | void; // Can be async or sync
  textDefault: string;
  textPending: string;
  icon: React.ReactNode;
  successIcon?: React.ReactNode;
  showTextLabel?: boolean;
  className?: string;
  disabled?: boolean;
  title?: string;
}

function ActionButton({
  action,
  textDefault,
  textPending,
  icon,
  successIcon,
  showTextLabel = true,
  className,
  disabled,
  title,
}: SessionControlActionProps) {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [translationSegments, setTranslationSegments] = useLocalStorage<
    TranslationSegment[]
  >("useOpenAISession:translationSegments", []);

  const handleClick = async () => {
    if (isPending || disabled) return;
    setIsPending(true);
    try {
      await Promise.resolve(action()); // Handles both sync and async actions
      if (successIcon) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }
    } catch (error) {
      console.error(`Error during ${textDefault}:`, error);
      // Error handling can be enhanced here, e.g., show toast
    } finally {
      // The parent's isSessionActive state will ultimately control which view (Stopped/Active) is shown.
      // This local isPending is for immediate button feedback.
      // If the action results in a state change that unmounts this button,
      // setIsPending(false) might not run or be needed.
      // If the action fails and the button is still visible, resetting isPending is good.
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`${className} ${
        isPending || disabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
      disabled={isPending || disabled}
      icon={showSuccess ? successIcon : icon}
      title={title}
    >
      {showTextLabel ? (isPending ? textPending : textDefault) : ""}
    </Button>
  );
}

interface SessionControlsProps {
  startSession: () => Promise<void>;
  stopSession: () => void;
  isSessionActive: boolean;
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
}: SessionControlsProps) {
  const [translationSegments, setTranslationSegments] = useLocalStorage<
    TranslationSegment[]
  >("useOpenAISession:translationSegments", []);

  const clearTranslations = () => {
    if (window.confirm("Are you sure you want to clear all translations?")) {
      setTranslationSegments([]);
    }
  };

  const copyTranslations = async () => {
    const textToCopy = translationSegments
      .map(
        (segment) =>
          `${segment.translations[segment.language1.code]}\n${
            segment.translations[segment.language2.code]
          }`,
      )
      .join("\n\n");

    await navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex-none">
        <ActionButton
          action={copyTranslations}
          textDefault="Copy"
          textPending="Copying..."
          icon={<Copy size={20} />}
          successIcon={<Check size={20} />}
          showTextLabel={false}
          className="!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center !p-0"
          title="Copy translations to clipboard"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        {isSessionActive ? (
          <ActionButton
            action={stopSession}
            textDefault="Stop listening"
            textPending="Stopping..."
            icon={<MicOff height={16} />}
            className="text-white bg-gradient-to-r from-[#bf642b] to-[#c73232] hover:opacity-90"
          />
        ) : (
          <ActionButton
            action={startSession}
            textDefault="Start listening"
            textPending="Starting..."
            icon={<Mic height={16} />}
            className="text-white bg-gradient-to-r from-[#4392C6] to-[#4844B7] hover:opacity-90"
          />
        )}
      </div>

      <div className="flex-none">
        <ActionButton
          action={clearTranslations}
          textDefault="Clear"
          textPending="Clearing..."
          icon={<Trash2 size={20} />}
          showTextLabel={false}
          className="!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center !p-0"
          title="Clear all translations"
        />
      </div>
    </div>
  );
}
