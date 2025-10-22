import { Card } from '../Card';
import ContactIcon from '../ContactIcon';
import { ButtonLinkInternal, LinkInternal } from '../Button';

export default function ArticleCard({
  title,
  description,
  to,
  image,
}: {
  title: string;
  description: string;
  to: string;
  image: string;
}) {
  return (
    <Card>
      <span>
        <LinkInternal aria-label={description} to={to}>
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
            margin: '0',
            marginBottom: '4px',
          }}
        >
          {title}
        </h3>
        <p>{description}</p>
      </span>
      <ButtonLinkInternal
        to={to}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <ContactIcon label="Article" /> Read Article
      </ButtonLinkInternal>
    </Card>
  );
}
