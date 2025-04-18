/**
 * Moderation Actions Component
 *
 * Approve/Reject buttons for moderation items.
 */

import { Check, X } from "lucide-react";

interface ModerationActionsProps {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  size?: "sm" | "md";
}

export function ModerationActions({
  onApprove,
  onReject,
  disabled = false,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  size = "md",
}: ModerationActionsProps) {
  const buttonClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";

  return (
    <div className="flex gap-3">
      <button
        onClick={onApprove}
        disabled={disabled}
        className={`flex items-center gap-2 ${buttonClasses} bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50`}
      >
        <Check className="w-4 h-4" />
        {approveLabel}
      </button>
      <button
        onClick={onReject}
        disabled={disabled}
        className={`flex items-center gap-2 ${buttonClasses} bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50`}
      >
        <X className="w-4 h-4" />
        {rejectLabel}
      </button>
    </div>
  );
}
