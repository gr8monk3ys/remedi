import { Plus } from "lucide-react";

interface AddRemedySlotProps {
  onClick: () => void;
}

/**
 * Empty slot for adding another remedy
 */
export function AddRemedySlot({
  onClick,
}: AddRemedySlotProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
      aria-label="Add another remedy to compare"
    >
      <Plus className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="mt-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
        Add Remedy
      </span>
    </button>
  );
}
