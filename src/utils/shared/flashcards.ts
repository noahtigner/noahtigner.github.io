import { useSyncExternalStore } from 'react';
import { z } from 'zod';

const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.union([z.number().int().min(0), z.array(z.number().int().min(0))]),
  explanation: z.string(),
  multiSelect: z.boolean(),
});

const deckCollectionSchema = z.object({
  slug: z.string(),
  title: z.string(),
  order: z.number().int().min(0),
});

const deckSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  relatedArticles: z.array(z.string()),
  collection: deckCollectionSchema.optional(),
  questions: z.array(questionSchema).min(1),
});

const flashcardsSchema = z.array(deckSchema);

export type Question = z.infer<typeof questionSchema>;
export type DeckCollection = z.infer<typeof deckCollectionSchema>;
export type Deck = z.infer<typeof deckSchema>;

export const parseDecks = (raw: unknown): Deck[] => {
  const result = flashcardsSchema.safeParse(raw);
  if (!result.success) {
    console.error('Invalid flashcard data:', result.error);
    return [];
  }
  return result.data;
};

// --- localStorage helpers ---

const STORAGE_KEY_PREFIX = 'flashcards:';
const PROGRESS_EVENT_NAME = 'flashcards-progress-change';
let progressVersion = 0;

export interface DeckProgress {
  bestScore: number;
  lastScore: number;
  totalQuestions: number;
  lastAttempted: string;
}

const emitProgressChange = (): void => {
  progressVersion += 1;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PROGRESS_EVENT_NAME));
};

const subscribeToProgress = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key?.startsWith(STORAGE_KEY_PREFIX)) return;
    listener();
  };

  window.addEventListener(PROGRESS_EVENT_NAME, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(PROGRESS_EVENT_NAME, listener);
    window.removeEventListener('storage', handleStorage);
  };
};

export const getProgress = (deckSlug: string): DeckProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + deckSlug);
    if (!raw) return null;
    return JSON.parse(raw) as DeckProgress;
  } catch {
    return null;
  }
};

export const saveProgress = (
  deckSlug: string,
  score: number,
  totalQuestions: number
): void => {
  const existing = getProgress(deckSlug);
  const progress: DeckProgress = {
    bestScore: Math.max(score, existing?.bestScore ?? 0),
    lastScore: score,
    totalQuestions,
    lastAttempted: new Date().toISOString(),
  };
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + deckSlug,
      JSON.stringify(progress)
    );
    emitProgressChange();
  } catch {
    // localStorage may be unavailable (e.g. private browsing quota exceeded)
  }
};

export const clearProgress = (deckSlug: string): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + deckSlug);
    emitProgressChange();
  } catch {
    // localStorage may be unavailable
  }
};

export const clearAllProgress = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    emitProgressChange();
  } catch {
    // localStorage may be unavailable
  }
};

const useProgressVersion = (): number =>
  useSyncExternalStore(
    subscribeToProgress,
    () => progressVersion,
    () => 0
  );

export const useDeckProgress = (deckSlug: string): DeckProgress | null => {
  useProgressVersion();
  return getProgress(deckSlug);
};

export const useDeckProgressMap = (
  deckSlugs: readonly string[]
): Record<string, DeckProgress | null> => {
  useProgressVersion();

  return Object.fromEntries(
    deckSlugs.map((deckSlug) => [deckSlug, getProgress(deckSlug)])
  );
};

// Fisher-Yates shuffle
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
