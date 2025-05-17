import { useState } from "react";
import { Check, Copy, Mic, MicOff, Trash2, Zap } from "react-feather";
import { TranslationSegment } from "../hooks/useOpenAISession";
import { Language } from "../utils/languages";
import { ModelOption, TokenUsage } from "../utils/models";
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
  selectedLanguage?: Language;
  language1: Language;
  language2: Language;
  openSettings: () => void;
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
  selectedLanguage,
  language1,
  language2,
  openSettings,
}: SessionControlsProps) {
  const [apiKey, setApiKey] = useLocalStorage<string | null>(
    "App:apiKey",
    null,
  );
  const [model] = useLocalStorage<ModelOption>(
    "App:model",
    "gpt-4o-mini-realtime-preview",
  );
  const [translationSegments, setTranslationSegments] = useLocalStorage<
    TranslationSegment[]
  >("useOpenAISession:translationSegments", []);
  const [tokenUsage, setTokenUsage] = useLocalStorage<TokenUsage | null>(
    "useOpenAISession:tokenUsage",
    null,
  );

  const clearTranslations = () => {
    if (window.confirm("Clear all translations and reset token usage?")) {
      setTranslationSegments([]);
      setTokenUsage(null);
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

  // Get the appropriate button style based on model
  const getStartButtonStyle = () => {
    if (model === "gpt-4o-realtime-preview") {
      // More vibrant style for GPT-4o
      return "text-white vibe-gradient hover:opacity-90";
    }
    // Default style for GPT-4o mini
    return "text-white normal-gradient hover:opacity-90";
  };

  // Check if we should show the pronunciation notice
  const showPronunciationNotice =
    !isSessionActive &&
    model === "gpt-4o-mini-realtime-preview" &&
    (language1?.category === "annotated" ||
      language2?.category === "annotated");

  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex-none">
        <ActionButton
          action={copyTranslations}
          disabled={translationSegments.length === 0}
          textDefault="Copy"
          textPending="Copying..."
          icon={<Copy size={20} />}
          successIcon={<Check size={20} />}
          showTextLabel={false}
          className="!text-gray-500 hover:!text-gray-900 dark:hover:!text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center !p-0"
          title="Copy translations to clipboard"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        {isSessionActive ? (
          <ActionButton
            action={stopSession}
            textDefault="Stop listening"
            textPending="Stopping..."
            icon={<MicOff height={16} />}
            className="text-white bg-gradient-to-r from-[#bf642b] to-[#c73232] hover:opacity-90"
          />
        ) : (
          <>
            <ActionButton
              disabled={!apiKey}
              action={startSession}
              textDefault="Start listening"
              textPending="Starting..."
              icon={<Mic height={16} />}
              className={getStartButtonStyle()}
            />
            {showPronunciationNotice && !window && (
              <div
                onClick={openSettings}
                className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
              >
                Use a <Zap size={16} className="inline text-amber-500" />
                <Zap size={16} className="inline text-amber-500 -ml-1" />
                <Zap size={16} className="inline text-amber-500 -ml-1" />
                <Zap size={16} className="inline text-amber-500 -ml-1" /> model
                for pronunciations
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-none">
        <ActionButton
          action={clearTranslations}
          disabled={translationSegments.length === 0}
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
