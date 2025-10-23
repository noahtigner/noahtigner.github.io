import { Card } from '~/components/Card';
import ContactIcon from '~/components/ContactIcon';
import { ButtonLinkInternal, LinkInternal } from '~/components/Button';
import { type ArticleAttributes } from '~/utils/markdown';

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
      <span>
        <LinkInternal aria-label={description} to={path}>
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
        <h3
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.25,
            margin: 0,
            marginTop: '8px',
          }}
        >
          {title}
        </h3>
        <h4
          style={{ marginBottom: '8px', color: 'var(--color-text-secondary)' }}
        >
          {minutesToRead} min • {published}
        </h4>
        <p>{description}</p>
      </span>
      <ButtonLinkInternal
        to={path}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <ContactIcon label="Article" /> Read Article
      </ButtonLinkInternal>
    </Card>
  );
}
