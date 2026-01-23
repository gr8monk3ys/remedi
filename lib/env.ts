/**
 * Environment variable validation and configuration
 *
 * This module validates and provides type-safe access to environment variables.
 * It should be imported at the application entry point to validate configuration.
 */

/**
 * Environment variable schema
 */
interface EnvSchema {
  // Database
  DATABASE_URL: string;

  // Authentication (NextAuth.js)
  AUTH_SECRET?: string;
  NEXTAUTH_SECRET?: string;

  // OAuth Providers (optional - auth disabled if not set)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_ID?: string;
  GITHUB_SECRET?: string;

  // Optional: Rate limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Optional: OpenAI API (for AI features)
  OPENAI_API_KEY?: string;

  // Optional: OpenFDA API key (for higher rate limits)
  OPENFDA_API_KEY?: string;

  // Optional: Analytics
  NEXT_PUBLIC_GA_ID?: string;

  // Optional: Error tracking (e.g., Sentry)
  NEXT_PUBLIC_SENTRY_DSN?: string;

  // Node environment
  NODE_ENV: "development" | "production" | "test";
}

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS: (keyof EnvSchema)[] = ["DATABASE_URL", "NODE_ENV"];

/**
 * Optional environment variables with warnings
 */
const OPTIONAL_WITH_WARNINGS: Partial<Record<keyof EnvSchema, string>> = {
  OPENFDA_API_KEY:
    "OpenFDA API key not set. Using default rate limits (240 req/min).",
  OPENAI_API_KEY:
    "OpenAI API key not set. AI-enhanced features will be disabled.",
};

/**
 * Validation error class
 */
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

/**
 * Validate that all required environment variables are set
 * @throws {EnvValidationError} If required variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  // Check required variables
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please copy .env.example to .env and configure the required variables.",
    );
  }

  // Validate NODE_ENV
  const validNodeEnvs = ["development", "production", "test"];
  if (!validNodeEnvs.includes(process.env.NODE_ENV || "")) {
    throw new EnvValidationError(
      `Invalid NODE_ENV: ${process.env.NODE_ENV}. ` +
        `Must be one of: ${validNodeEnvs.join(", ")}`,
    );
  }

  // Warn about missing optional variables
  if (process.env.NODE_ENV === "development") {
    for (const [key, warning] of Object.entries(OPTIONAL_WITH_WARNINGS)) {
      if (!process.env[key]) {
        console.warn(`⚠️  ${warning}`);
      }
    }
  }
}

/**
 * Get a typed environment variable
 * @param key Environment variable key
 * @param defaultValue Default value if not set
 * @returns The environment variable value or default
 */
export function getEnv<K extends keyof EnvSchema>(
  key: K,
  defaultValue?: EnvSchema[K],
): EnvSchema[K] | undefined {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value as EnvSchema[K];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Get database URL with validation
 */
export function getDatabaseUrl(): string {
  const url = getEnv("DATABASE_URL");
  if (!url) {
    throw new EnvValidationError("DATABASE_URL is required but not set");
  }
  return url;
}

/**
 * Check if OpenAI API is configured
 */
export function hasOpenAiKey(): boolean {
  return !!getEnv("OPENAI_API_KEY");
}

/**
 * Check if OpenFDA API key is configured
 */
export function hasFdaApiKey(): boolean {
  return !!getEnv("OPENFDA_API_KEY");
}

/**
 * Get OpenFDA API key if available
 */
export function getFdaApiKey(): string | undefined {
  return getEnv("OPENFDA_API_KEY");
}

/**
 * Get OpenAI API key if available
 */
export function getOpenAiKey(): string | undefined {
  return getEnv("OPENAI_API_KEY");
}

/**
 * Get auth secret (AUTH_SECRET or NEXTAUTH_SECRET)
 */
export function getAuthSecret(): string | undefined {
  return getEnv("AUTH_SECRET") || getEnv("NEXTAUTH_SECRET");
}

/**
 * Check if Google OAuth is configured
 */
export function hasGoogleOAuth(): boolean {
  return !!(getEnv("GOOGLE_CLIENT_ID") && getEnv("GOOGLE_CLIENT_SECRET"));
}

/**
 * Get Google OAuth credentials (returns undefined values if not configured)
 */
export function getGoogleOAuthCredentials(): {
  clientId: string | undefined;
  clientSecret: string | undefined;
} {
  return {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
  };
}

/**
 * Check if GitHub OAuth is configured
 */
export function hasGitHubOAuth(): boolean {
  return !!(getEnv("GITHUB_ID") && getEnv("GITHUB_SECRET"));
}

/**
 * Get GitHub OAuth credentials (returns undefined values if not configured)
 */
export function getGitHubOAuthCredentials(): {
  clientId: string | undefined;
  clientSecret: string | undefined;
} {
  return {
    clientId: getEnv("GITHUB_ID"),
    clientSecret: getEnv("GITHUB_SECRET"),
  };
}

/**
 * Check if Upstash Redis is configured for rate limiting
 */
export function hasUpstashRedis(): boolean {
  return !!(
    getEnv("UPSTASH_REDIS_REST_URL") && getEnv("UPSTASH_REDIS_REST_TOKEN")
  );
}

/**
 * Get Upstash Redis credentials (returns undefined values if not configured)
 */
export function getUpstashRedisCredentials(): {
  url: string | undefined;
  token: string | undefined;
} {
  return {
    url: getEnv("UPSTASH_REDIS_REST_URL"),
    token: getEnv("UPSTASH_REDIS_REST_TOKEN"),
  };
}

// Validate environment on module load in non-test environments
if (!isTest()) {
  try {
    validateEnv();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error("❌ Environment validation failed:");
      console.error(error.message);
      // Don't exit in development, just warn
      if (isProduction()) {
        process.exit(1);
      }
    } else {
      throw error;
    }
  }
}
