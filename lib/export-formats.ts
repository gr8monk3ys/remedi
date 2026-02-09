import type { DetailedRemedy } from "@/lib/types";

/**
 * Helper to wrap text into lines that fit within a maximum pixel width
 * on a canvas context.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 5);
}

/**
 * Generate a plain-text comparison document for the given remedies.
 */
export function generateTextContent(remedies: DetailedRemedy[]): string {
  const lines: string[] = [
    "REMEDY COMPARISON",
    "=================",
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
    "REMEDIES COMPARED:",
    ...remedies.map((r, i) => `${i + 1}. ${r.name} (${r.category || "N/A"})`),
    "",
  ];

  remedies.forEach((remedy) => {
    lines.push(`--- ${remedy.name} ---`);
    lines.push("");
    lines.push(`Category: ${remedy.category || "N/A"}`);
    lines.push(`Description: ${remedy.description || "N/A"}`);
    lines.push(`Dosage: ${remedy.dosage || "N/A"}`);
    lines.push(`Usage: ${remedy.usage || "N/A"}`);
    lines.push(`Precautions: ${remedy.precautions || "N/A"}`);
    lines.push(`Scientific Info: ${remedy.scientificInfo || "N/A"}`);
    lines.push("");
  });

  lines.push("");
  lines.push("DISCLAIMER:");
  lines.push(
    "This comparison is for informational purposes only and should not be considered medical advice.",
  );
  lines.push(
    "Always consult with a qualified healthcare professional before making changes to your health regimen.",
  );
  lines.push("");
  lines.push(`Comparison URL: ${window.location.href}`);

  return lines.join("\n");
}

/**
 * Inject print-specific styles, trigger the browser print dialog,
 * and clean up afterwards.
 */
export function exportAsPdf(): void {
  const styleSheet = document.createElement("style");
  styleSheet.id = "print-styles";
  styleSheet.textContent = `
    @media print {
      body * {
        visibility: hidden;
      }
      #comparison-content, #comparison-content * {
        visibility: visible;
      }
      #comparison-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .print\\:hidden {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);

  window.print();

  setTimeout(() => {
    const printStyles = document.getElementById("print-styles");
    if (printStyles) {
      printStyles.remove();
    }
  }, 1000);
}

/**
 * Render the remedy comparison onto a canvas and trigger a PNG download.
 */
export function exportAsImage(remedies: DetailedRemedy[]): void {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const width = 1200;
  const height = 800 + remedies.length * 200;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 32px Inter, system-ui, sans-serif";
  ctx.fillText("Remedy Comparison", 40, 60);

  // Date
  ctx.fillStyle = "#666666";
  ctx.font = "14px Inter, system-ui, sans-serif";
  ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 40, 90);

  // Remedies in columns
  const yOffset = 140;
  const columnWidth = (width - 80) / remedies.length;

  remedies.forEach((remedy, index) => {
    const xOffset = 40 + index * columnWidth;

    // Name
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.fillText(remedy.name, xOffset, yOffset);

    // Category
    ctx.fillStyle = "#666666";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillText(remedy.category || "N/A", xOffset, yOffset + 25);

    // Dosage
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    ctx.fillText("Dosage:", xOffset, yOffset + 60);
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#333333";
    const dosageLines = wrapText(ctx, remedy.dosage || "N/A", columnWidth - 20);
    dosageLines.forEach((line, i) => {
      ctx.fillText(line, xOffset, yOffset + 80 + i * 18);
    });

    // Usage
    const usageStart = yOffset + 80 + dosageLines.length * 18 + 20;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    ctx.fillText("Usage:", xOffset, usageStart);
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#333333";
    const usageLines = wrapText(ctx, remedy.usage || "N/A", columnWidth - 20);
    usageLines.forEach((line, i) => {
      ctx.fillText(line, xOffset, usageStart + 20 + i * 18);
    });
  });

  // Disclaimer
  ctx.fillStyle = "#996600";
  ctx.font = "italic 12px Inter, system-ui, sans-serif";
  ctx.fillText(
    "Disclaimer: This comparison is for informational purposes only. Consult a healthcare professional.",
    40,
    height - 40,
  );

  // Download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `remedy-comparison-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, "image/png");
}

/**
 * Copy the current page URL to the clipboard, falling back to
 * execCommand for older browsers.
 */
export async function copyComparisonLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

/**
 * Open the user's email client with a pre-filled comparison message.
 */
export function emailComparison(remedies: DetailedRemedy[]): void {
  const subject = encodeURIComponent(
    `Remedy Comparison: ${remedies.map((r) => r.name).join(", ")}`,
  );
  const body = encodeURIComponent(generateTextContent(remedies));
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

  window.location.href = mailtoUrl;
}
