import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Remedi account to save remedies and get personalized recommendations.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-zinc-800 shadow-xl rounded-2xl",
            headerTitle: "text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            socialButtonsBlockButton:
              "border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700",
            formFieldLabel: "text-gray-700 dark:text-gray-300",
            formFieldInput:
              "border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white",
            footerActionLink: "text-green-600 hover:text-green-700",
          },
        }}
      />
    </div>
  );
}
