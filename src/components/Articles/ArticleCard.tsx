import { Card } from '../Card';
import ContactIcon from '../ContactIcon';
import { ButtonLinkInternal, LinkInternal } from '../Button';
import articleAttributes from '../../assets/content/articles';

type ArticleAttributes = (typeof articleAttributes)[number];

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
              width: '100%',
            }}
          />
        </LinkInternal>
        <h3
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.25,
            margin: 0,
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
