import { X } from "react-feather";
import { calculateTokenCosts, formatPrice, TokenUsage } from "../utils/models";
import Dialog from "./Dialog";

interface TokenUsageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tokenUsage: TokenUsage;
}

export default function TokenUsageDialog({
  isOpen,
  onClose,
  tokenUsage,
}: TokenUsageDialogProps) {
  const { model, total_tokens, input_token_details, output_token_details } =
    tokenUsage;

  const { totalCost } = calculateTokenCosts(tokenUsage);
  const formattedPrice = formatPrice(totalCost, 4); // 4 decimal places for the dialog

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium dark:text-white">
          Token Usage Details
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium dark:text-white">Model:</span>
          <span className="dark:text-gray-300">{model}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium dark:text-white">Total Tokens:</span>
          <span className="dark:text-gray-300">{total_tokens}</span>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="font-medium dark:text-white">Input Tokens:</span>
          <div className="ml-4 mt-1 space-y-1">
            <div className="flex justify-between">
              <span className="dark:text-gray-300">Text:</span>
              <span className="dark:text-gray-300">
                {input_token_details.text_tokens}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-gray-300">Audio:</span>
              <span className="dark:text-gray-300">
                {input_token_details.audio_tokens}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-gray-300">Cached:</span>
              <span className="dark:text-gray-300">
                {input_token_details.cached_tokens}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="font-medium dark:text-white">Output Tokens:</span>
          <div className="ml-4 mt-1 space-y-1">
            <div className="flex justify-between">
              <span className="dark:text-gray-300">Text:</span>
              <span className="dark:text-gray-300">
                {output_token_details.text_tokens}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-gray-300">Audio:</span>
              <span className="dark:text-gray-300">
                {output_token_details.audio_tokens}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between font-medium">
            <span className="dark:text-white">Total Cost:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
