import styled from '@emotion/styled';
import { redirect } from 'react-router';

import MetaTags from '~/components/MetaTags';
import Divider from '~/components/Divider';
import { LinkInternal } from '~/components/Button';
import QuizSession from '~/components/Flashcards/QuizSession';
import { allDecks } from '~/utils/vite/flashcards';
import { paths } from '~/routes';
import type { Route } from '~/router/routes/+types/Flashcards.$deck';

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--size-md);
  margin-left: auto;
  margin-right: auto;
`;

export async function loader({ params }: Route.LoaderArgs) {
  const deck = allDecks.find((d) => d.slug === params.deck);
  if (!deck) {
    return redirect(paths.error404, 404);
  }
  return { deck };
}

export default function FlashcardsDeck({ loaderData }: Route.ComponentProps) {
  const { deck } = loaderData;

  return (
    <PageContainer>
      <MetaTags
        title={`${deck.title} - Flashcards - Noah Tigner`}
        description={deck.description}
      />
      <Divider>{deck.title}</Divider>
      <QuizSession decks={[deck]} sessionKey={deck.slug} />
      <LinkInternal
        to="/flashcards/"
        prefetch="intent"
        style={{
          width: 'fit-content',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '32px',
        }}
      >
        &lt; All Decks
      </LinkInternal>
    </PageContainer>
  );
}
