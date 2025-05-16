import { X } from "react-feather";
import Dialog from "./Dialog";

interface InstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallDialog({ isOpen, onClose }: InstallDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Install app</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2 dark:text-white">iOS</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Tap the Share button in Safari</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" in the top right corner</li>
        </ol>
      </div>

      <div>
        <h3 className="font-semibold mb-2 dark:text-white">macOS</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Click on the share button in Safari</li>
          <li>Select "Add to Dock"</li>
          <li>Click "Add" in the dialog that appears</li>
        </ol>
      </div>
    </Dialog>
  );
}
