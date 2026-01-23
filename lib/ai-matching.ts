/**
 * AI Matching Module (Re-export)
 *
 * This file re-exports from the modularized ai/ directory.
 * All imports like `import { enhanceRemedyMatching } from '@/lib/ai-matching'` continue to work.
 */

export {
  isAIEnabled,
  enhanceRemedyMatching,
  checkDrugInteractions,
  processNaturalLanguageQuery,
} from './ai';

export type {
  AIMatchingOptions,
  AIRemedyRecommendation,
} from './ai';
