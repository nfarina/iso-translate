import { useState } from "react";
import { CloudLightning, CloudOff } from "react-feather";
import Button from "./Button";

interface SessionControlActionProps {
  action: () => Promise<void> | void; // Can be async or sync
  textDefault: string;
  textPending: string;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function ActionButton({ action, textDefault, textPending, icon, className, disabled }: SessionControlActionProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending || disabled) return;
    setIsPending(true);
    try {
      await Promise.resolve(action()); // Handles both sync and async actions
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
      className={`${className} ${isPending || disabled ? "opacity-70 cursor-not-allowed" : ""}`}
      disabled={isPending || disabled}
      icon={icon}
    >
      {isPending ? textPending : textDefault}
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
  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      {isSessionActive ? (
        <ActionButton
          action={stopSession}
          textDefault="Disconnect"
          textPending="Disconnecting..."
          icon={<CloudOff height={16} />}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
        />
      ) : (
        <ActionButton
          action={startSession}
          textDefault="Start Session"
          textPending="Starting..."
          icon={<CloudLightning height={16} />}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
        />
      )}
    </div>
  );
}
