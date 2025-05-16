import { ReactNode, useEffect, useRef, useState } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Dialog({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      // Start animation after dialog is shown
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before closing
      setTimeout(() => {
        dialogRef.current?.close();
      }, 200); // match transition duration
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
      className={`p-0 px-4 bg-transparent rounded-lg ${maxWidth} w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0
      backdrop:transition-opacity backdrop:duration-200 backdrop:ease-out 
      ${
        isAnimating ? "backdrop:opacity-70" : "backdrop:opacity-0"
      } backdrop:bg-black`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-200 ease-out ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {children}
      </div>
    </dialog>
  );
}
