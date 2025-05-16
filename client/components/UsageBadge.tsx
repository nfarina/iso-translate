import { useState } from "react";
import { Zap } from "react-feather";
import { calculateTokenCosts, formatPrice, TokenUsage } from "../utils/models";
import TokenUsageDialog from "./TokenUsageDialog";

interface UsageBadgeProps {
  tokenUsage: TokenUsage;
  className?: string;
}

export default function UsageBadge({
  tokenUsage,
  className = "",
}: UsageBadgeProps) {
  const [showDialog, setShowDialog] = useState(false);

  // Early return if tokenUsage is not properly formed
  if (
    !tokenUsage ||
    !tokenUsage.input_token_details ||
    !tokenUsage.output_token_details
  ) {
    return (
      <div
        className={`flex items-center text-xs rounded-md py-1 px-3 text-blue-700 dark:text-blue-300 ${className}`}
      >
        <Zap size={12} className="mr-1" />
        <span>$0.00</span>
      </div>
    );
  }

  const { totalCost } = calculateTokenCosts(tokenUsage);
  const formattedPrice = formatPrice(totalCost);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className={`flex items-center text-xs rounded-md py-1 px-3 text-blue-700 dark:text-blue-300 ${className}`}
      >
        <Zap size={12} className="mr-1" />
        <span>{formattedPrice}</span>
      </button>

      <TokenUsageDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        tokenUsage={tokenUsage}
      />
    </>
  );
}
