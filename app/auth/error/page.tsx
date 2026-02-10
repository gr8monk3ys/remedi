import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication Error | Remedi",
  description: "An error occurred during authentication",
};

const errorDescriptions: Record<
  string,
  { title: string; description: string }
> = {
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description:
      "You do not have permission to sign in. This may be due to account restrictions.",
  },
  Verification: {
    title: "Verification Failed",
    description: "The verification link may have expired or already been used.",
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "Could not start the sign in process. Please try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "Could not complete the sign in process. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description:
      "Could not create your account. The email may already be in use with a different provider.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description:
      "This email is already associated with another sign in method. Please use your original sign in method.",
  },
  Default: {
    title: "Authentication Error",
    description:
      "An unexpected error occurred during authentication. Please try again.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorKey = params.error || "Default";
  const errorInfo = errorDescriptions[errorKey] || errorDescriptions.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-muted-foreground mb-8">{errorInfo.description}</p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-sm text-muted-foreground">
            If this problem persists, please{" "}
            <a
              href="mailto:support@remedi.app"
              className="text-primary hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
