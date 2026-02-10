"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileImage,
  FileText,
  Link as LinkIcon,
  Mail,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import type { DetailedRemedy } from "@/lib/types";
import {
  exportAsPdf,
  exportAsImage,
  copyComparisonLink,
  emailComparison,
} from "@/lib/export-formats";

/**
 * Props for ExportComparison component
 */
interface ExportComparisonProps {
  /** Remedies being compared */
  remedies: DetailedRemedy[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Export format options
 */
type ExportFormat = "pdf" | "image" | "link" | "email";

/**
 * Export menu item configuration
 */
interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "pdf",
    label: "Export as PDF",
    description: "Download a printable PDF document",
    icon: FileText,
  },
  {
    id: "image",
    label: "Export as Image",
    description: "Save as PNG image",
    icon: FileImage,
  },
  {
    id: "link",
    label: "Copy Link",
    description: "Copy shareable link to clipboard",
    icon: LinkIcon,
  },
  {
    id: "email",
    label: "Email Comparison",
    description: "Open in email client",
    icon: Mail,
  },
];

/**
 * Component for exporting remedy comparisons in various formats.
 *
 * Supports:
 * - PDF export (uses browser print)
 * - Image export (canvas snapshot)
 * - Shareable link
 * - Email with comparison details
 */
export function ExportComparison({
  remedies,
  className = "",
}: ExportComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exportSuccess, setExportSuccess] = useState<ExportFormat | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  /**
   * Run an export action with loading and success state management.
   */
  async function runExport(
    format: ExportFormat,
    action: () => void | Promise<void>,
  ): Promise<void> {
    setIsExporting(format);
    try {
      await action();
      setExportSuccess(format);
    } finally {
      setIsExporting(null);
      setTimeout(() => setExportSuccess(null), 2000);
    }
  }

  /**
   * Handle export based on format
   */
  async function handleExport(format: ExportFormat): Promise<void> {
    switch (format) {
      case "pdf":
        await runExport("pdf", () => exportAsPdf());
        break;
      case "image":
        await runExport("image", () => exportAsImage(remedies));
        break;
      case "link":
        await runExport("link", () => copyComparisonLink());
        break;
      case "email":
        await runExport("email", () => emailComparison(remedies));
        break;
    }
    setIsOpen(false);
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            role="menu"
          >
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isLoading = isExporting === option.id;
              const isSuccess = exportSuccess === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  disabled={isLoading}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors disabled:opacity-50"
                  role="menuitem"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : isSuccess ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isSuccess ? "Done!" : option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExportComparison;
