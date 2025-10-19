import { Chip, Grid, Typography, useTheme } from '@mui/material';
import portfolioItems from '../../assets/data/portfolioItems.json';
import ContactIcon from '../ContactIcon';
import { StyledCard, StyledCardContent, StyledCardActions } from '../Card';

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

function ItemCard({ title, description, image, links, tools }: ItemCardProps) {
  const theme = useTheme();
  const primaryLink = links.find((link) => link.primary) ?? links[0];
  return (
    <StyledCard variant="outlined">
      <StyledCardContent>
        {image && (
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
                borderRadius: theme.shape.borderRadius,
              }}
              fetchPriority="high"
            />
          </a>
        )}
        <Typography
          sx={{
            fontSize: '1.25rem',
            marginBottom: theme.spacing(0.5),
          }}
          variant="h3"
        >
          {title}
        </Typography>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing(0.5),
            flexWrap: 'wrap',
            marginBottom: theme.spacing(1),
          }}
        >
          {tools.map((tool) => (
            <Chip
              key={`${title}-${tool}`}
              label={tool}
              size="small"
              variant="outlined"
              sx={{ color: theme.palette.text.secondary }}
            />
          ))}
        </div>

        <Typography variant="body1" sx={{ fontSize: '1rem' }}>
          {description}
        </Typography>
      </StyledCardContent>
      <StyledCardActions disableSpacing>
        {links.map(({ description: linkDescription, target }) => (
          <Chip
            key={target}
            label={linkDescription}
            size="small"
            color="primary"
            variant="outlined"
            component="a"
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            clickable
            sx={{
              padding: theme.spacing(0.5),
              minWidth: 'calc(100% / 2 - 2px)',
              flexGrow: 1,
            }}
            icon={<ContactIcon label={getIconType(target)} />}
          />
        ))}
      </StyledCardActions>
    </StyledCard>
  );
}

function Portfolio() {
  return (
    <Grid container spacing={2}>
      {portfolioItems.slice(0, 3).map(({ title, ...props }, i) => (
        <Grid
          key={title}
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{
            animation: `fadeIn 250ms ease-out`,
            animationDelay: `${i * 100}ms`,
          }}
        >
          <ItemCard title={title} {...props} />
        </Grid>
      ))}
    </Grid>
  );
}

export default Portfolio;
