/**
 * Moderation Queue Types
 */

export interface User {
  name: string | null;
  email: string;
  image: string | null;
}

export interface Contribution {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: string;
  benefits: string;
  usage: string | null;
  dosage: string | null;
  precautions: string | null;
  createdAt: Date;
  user: User;
}

export interface Review {
  id: string;
  remedyId: string;
  remedyName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: Date;
  user: User;
}

export interface ModerationQueueProps {
  contributions: Contribution[];
  reviews: Review[];
}

export type ModerationItemType = "contribution" | "review";
