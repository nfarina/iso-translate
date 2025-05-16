import { ReactNode, useEffect, useRef } from "react";

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
      className={`p-0 px-4 bg-transparent backdrop:bg-black backdrop:opacity-70 rounded-lg ${maxWidth} w-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        {children}
      </div>
    </dialog>
  );
}
