"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { JournalEntryForm } from "./JournalEntryForm";

interface QuickLogButtonProps {
  remedyId: string;
  remedyName: string;
}

export function QuickLogButton({
  remedyId,
  remedyName,
}: QuickLogButtonProps): React.JSX.Element {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        Log in Journal
      </button>

      {showForm && (
        <JournalEntryForm
          defaultRemedyId={remedyId}
          defaultRemedyName={remedyName}
          onSubmit={() => setShowForm(false)}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
