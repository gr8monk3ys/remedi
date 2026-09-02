import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Remedi account to access saved remedies and personalized recommendations.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border shadow-none rounded-lg",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-primary-foreground shadow-none",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-border hover:bg-muted",
            formFieldLabel: "text-foreground",
            formFieldInput: "border-border bg-card text-foreground",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}
