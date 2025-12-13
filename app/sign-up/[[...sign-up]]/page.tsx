import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Remedi account to save remedies and get personalized recommendations.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card shadow-xl rounded-2xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-border hover:bg-muted",
            formFieldLabel: "text-foreground",
            formFieldInput: "border-border bg-card text-foreground",
            footerActionLink: "text-green-600 hover:text-green-700",
          },
        }}
      />
    </div>
  );
}
