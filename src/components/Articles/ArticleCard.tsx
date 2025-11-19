import { Card } from '~/components/Card';
import ContactIcon from '~/components/ContactIcon';
import { ButtonLinkInternal, LinkInternal } from '~/components/Button';
import { type ArticleAttributes } from '~/utils/vite/markdown';

export default function ArticleCard({
  title,
  description,
  path,
  image,
  published,
  minutesToRead,
  // tags,
}: ArticleAttributes) {
  return (
    <Card>
      <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <LinkInternal aria-label={description} to={path} prefetch="viewport">
          <img
            src={image}
            alt={title}
            style={{
              borderRadius: 'var(--border-radius)',
              height: '150px',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </LinkInternal>
        <span
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ marginBottom: '8px' }}>
            <h3
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {title}
            </h3>
            <h4 style={{ color: 'var(--color-text-secondary)' }}>
              {minutesToRead} min • {published}
            </h4>
          </span>
          <p>{description}</p>
        </span>
      </span>
      <ButtonLinkInternal
        to={path}
        prefetch="viewport"
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <ContactIcon label="Article" /> Read Article
      </ButtonLinkInternal>
    </Card>
  );
}
