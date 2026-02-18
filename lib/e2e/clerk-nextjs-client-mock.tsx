"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_COOKIE_NAMES = ["e2e_auth", "__session"] as const;
const DEFAULT_REDIRECT = "/";

type AuthContextValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
});

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  return SESSION_COOKIE_NAMES.some((name) =>
    cookies.some((cookie) => cookie.startsWith(`${name}=`)),
  );
}

function setSessionCookies(): void {
  if (typeof document === "undefined") return;

  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `e2e_auth=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = `__session=e2e-local-session; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookies(): void {
  if (typeof document === "undefined") return;

  for (const name of SESSION_COOKIE_NAMES) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

function getRedirectUrl(): string {
  if (typeof window === "undefined") return DEFAULT_REDIRECT;
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get("redirect_url");
  return redirectUrl || DEFAULT_REDIRECT;
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const sync = () => setIsSignedIn(hasSessionCookie());

    sync();
    const interval = window.setInterval(sync, 500);
    window.addEventListener("focus", sync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded: true,
      isSignedIn,
      userId: isSignedIn ? "e2e-local-user" : null,
    }),
    [isSignedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
} {
  const ctx = useContext(AuthContext);
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    userId: ctx.userId,
    getToken: async () => (ctx.isSignedIn ? "e2e-local-token" : null),
  };
}

export function useUser(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    fullName: string;
    primaryEmailAddress: { emailAddress: string };
  } | null;
} {
  const ctx = useContext(AuthContext);
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    user: ctx.isSignedIn
      ? {
          id: "e2e-local-user",
          fullName: "E2E Local User",
          primaryEmailAddress: { emailAddress: "e2e-user@remedi.local" },
        }
      : null,
  };
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? null : <>{children}</>;
}

type SignInButtonChildProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

type SignInButtonProps = {
  children: ReactElement<SignInButtonChildProps>;
};

export function SignInButton({ children }: SignInButtonProps) {
  if (!isValidElement(children)) return null;

  return cloneElement(children, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      if (event.defaultPrevented) return;
      window.location.assign(
        `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`,
      );
    },
  });
}

export function UserButton({
  afterSignOutUrl = "/",
}: {
  afterSignOutUrl?: string;
}) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return (
    <button
      type="button"
      className="inline-flex h-8 items-center rounded-md border px-3 text-sm"
      aria-label="User menu"
      onClick={() => {
        clearSessionCookies();
        window.location.assign(afterSignOutUrl);
      }}
    >
      E2E User
    </button>
  );
}

type AuthFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
};

function MockAuthForm({ title, subtitle, submitLabel }: AuthFormProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          Continue with Google
        </button>
        <button
          type="button"
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          Continue with GitHub
        </button>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        onClick={() => {
          setSessionCookies();
          window.location.assign(getRedirectUrl());
        }}
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function SignIn() {
  return (
    <MockAuthForm
      title="Sign in to Remedi"
      subtitle="Local E2E auth mode is enabled for deterministic tests."
      submitLabel="Sign In"
    />
  );
}

export function SignUp() {
  return (
    <MockAuthForm
      title="Create your Remedi account"
      subtitle="Local E2E auth mode is enabled for deterministic tests."
      submitLabel="Create Account"
    />
  );
}
