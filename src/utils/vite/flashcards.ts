import flashcardsData from '~/assets/data/flashcards.json';
import { parseDecks, type Deck } from '~/utils/shared/flashcards';

const allDecks: Deck[] = parseDecks(flashcardsData);

const getDeckBySlug = (slug: string): Deck | undefined =>
  allDecks.find((d) => d.slug === slug);

type DeckCollectionGroup = {
  slug: string;
  title: string;
  image: string;
  decks: Deck[];
};

type GroupedDecks = {
  standalone: Deck[];
  collections: DeckCollectionGroup[];
};

type InterleavedDeckItem =
  | { type: 'standalone'; deck: Deck }
  | { type: 'collection'; group: DeckCollectionGroup };

function groupDecksByCollection(decks: Deck[]): GroupedDecks {
  const standalone: Deck[] = [];
  const collectionMap = new Map<string, DeckCollectionGroup>();

  for (const deck of decks) {
    if (!deck.collection) {
      standalone.push(deck);
      continue;
    }

    const { slug, title } = deck.collection;
    if (!collectionMap.has(slug)) {
      collectionMap.set(slug, {
        slug,
        title,
        image: deck.image,
        decks: [],
      });
    }

    collectionMap.get(slug)!.decks.push(deck);
  }

  const collections = Array.from(collectionMap.values())
    .map((group) => ({
      ...group,
      decks: [...group.decks].sort(
        (a, b) => (a.collection?.order ?? 0) - (b.collection?.order ?? 0)
      ),
    }))
    .sort(
      (a, b) =>
        (a.decks[0]?.collection?.order ?? Number.MAX_SAFE_INTEGER) -
        (b.decks[0]?.collection?.order ?? Number.MAX_SAFE_INTEGER)
    );

  return {
    standalone,
    collections,
  };
}

function interleaveDecks(decks: Deck[]): InterleavedDeckItem[] {
  const { standalone, collections } = groupDecksByCollection(decks);

  const standaloneItems: InterleavedDeckItem[] = standalone.map((deck) => ({
    type: 'standalone',
    deck,
  }));
  const collectionItems: InterleavedDeckItem[] = collections.map((group) => ({
    type: 'collection',
    group,
  }));

  return [...collectionItems, ...standaloneItems];
}

export {
  allDecks,
  getDeckBySlug,
  groupDecksByCollection,
  interleaveDecks,
  type DeckCollectionGroup,
  type GroupedDecks,
  type InterleavedDeckItem,
};
