import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Natural Remedy Details",
  description:
    "Detailed information about natural remedies, including usage, dosage, precautions, and scientific research.",
};

export default function RemedyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
