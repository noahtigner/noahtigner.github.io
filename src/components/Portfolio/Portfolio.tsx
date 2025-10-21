import styled from '@emotion/styled';
import portfolioItems from '../../assets/data/portfolioItems.json';
import ContactIcon from '../ContactIcon';
import { Card } from '../Card';
import { ButtonLink } from '../Button';

type ItemCardProps = (typeof portfolioItems)[number];

const getIconType = (target: string) => {
  if (target.includes('github') || target.includes('bitbucket')) {
    return 'GitHub';
  }
  if (target.includes('npm')) {
    return 'JavaScript';
  }
  return 'YouTube';
};

const Chip = styled.span`
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--border-radius);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 7px;
`;

function ItemCard({ title, description, image, links, tools }: ItemCardProps) {
  const primaryLink = links.find((link) => link.primary) ?? links[0];
  return (
    <Card>
      <span>
        <a
          aria-label={primaryLink.description}
          href={primaryLink.target}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            // sizes are 640x360 and 351x198
            // use srcset for responsive images
            srcSet={`${image.sm} 351w, ${image.lg} 640w`}
            sizes="(max-width: 767px) 351px, 640px"
            src={image.lg}
            alt={image.alt}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 'var(--border-radius)',
            }}
            fetchPriority="high"
          />
        </a>
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
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            marginBottom: '8px',
          }}
        >
          {tools.map((tool) => (
            <Chip key={`${title}-${tool}`}>{tool}</Chip>
          ))}
        </div>
        <p>{description}</p>
      </span>
      <span
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '4px',
        }}
      >
        {links.map(({ description: linkDescription, target }) => (
          <ButtonLink
            key={target}
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: 'var(--color-paper)' }}
          >
            <ContactIcon label={getIconType(target)} /> {linkDescription}
          </ButtonLink>
        ))}
      </span>
    </Card>
  );
}

function Portfolio() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
      }}
    >
      {portfolioItems.slice(0, 3).map(({ title, ...props }) => (
        <ItemCard key={title} title={title} {...props} />
      ))}
    </div>
  );
}

export default Portfolio;
