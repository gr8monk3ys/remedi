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

  // Optional: OpenAI API (for AI features)
  OPENAI_API_KEY?: string;

  // Optional: OpenFDA API key (for higher rate limits)
  OPENFDA_API_KEY?: string;

  // Optional: Analytics
  NEXT_PUBLIC_GA_ID?: string;

  // Optional: Error tracking (e.g., Sentry)
  NEXT_PUBLIC_SENTRY_DSN?: string;

  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS: (keyof EnvSchema)[] = [
  'DATABASE_URL',
  'NODE_ENV',
];

/**
 * Optional environment variables with warnings
 */
const OPTIONAL_WITH_WARNINGS: Partial<Record<keyof EnvSchema, string>> = {
  OPENFDA_API_KEY: 'OpenFDA API key not set. Using default rate limits (240 req/min).',
  OPENAI_API_KEY: 'OpenAI API key not set. AI-enhanced features will be disabled.',
};

/**
 * Validation error class
 */
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
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
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please copy .env.example to .env and configure the required variables.'
    );
  }

  // Validate NODE_ENV
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(process.env.NODE_ENV || '')) {
    throw new EnvValidationError(
      `Invalid NODE_ENV: ${process.env.NODE_ENV}. ` +
      `Must be one of: ${validNodeEnvs.join(', ')}`
    );
  }

  // Warn about missing optional variables
  if (process.env.NODE_ENV === 'development') {
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
  defaultValue?: EnvSchema[K]
): EnvSchema[K] | undefined {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value as EnvSchema[K];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get database URL with validation
 */
export function getDatabaseUrl(): string {
  const url = getEnv('DATABASE_URL');
  if (!url) {
    throw new EnvValidationError('DATABASE_URL is required but not set');
  }
  return url;
}

/**
 * Check if OpenAI API is configured
 */
export function hasOpenAiKey(): boolean {
  return !!getEnv('OPENAI_API_KEY');
}

/**
 * Check if OpenFDA API key is configured
 */
export function hasFdaApiKey(): boolean {
  return !!getEnv('OPENFDA_API_KEY');
}

/**
 * Get OpenFDA API key if available
 */
export function getFdaApiKey(): string | undefined {
  return getEnv('OPENFDA_API_KEY');
}

/**
 * Get OpenAI API key if available
 */
export function getOpenAiKey(): string | undefined {
  return getEnv('OPENAI_API_KEY');
}

// Validate environment on module load in non-test environments
if (!isTest()) {
  try {
    validateEnv();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('❌ Environment validation failed:');
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
