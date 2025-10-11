import {
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import portfolioItems from '../../assets/data/portfolioItems.json';
import ContactIcon from '../ContactIcon';

const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  // [theme.breakpoints.up('md')]: {
  //   transition: 'transform 0.2s ease-in-out',
  //   '&:hover': {
  //     // transform: 'scale(1.025)',
  //     transform: 'translateY(-8px)',
  //   },
  // },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
  paddingBottom: 0,
  '&:last-child': {
    padding: 0,
  },
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(1),
  paddingTop: theme.spacing(1.5),
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: theme.spacing(0.5),
}));

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
            style={{
              position: 'relative', // Container for absolute positioning
              display: 'block',
              width: '100%',
              aspectRatio: '16 / 9',
              overflow: 'hidden', // Prevent overflow
            }}
          >
            <img
              src={image.src.replace('.webp', '-xs.webp')}
              alt={image.alt}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                filter: 'blur(1rem)',
                zIndex: 0,
              }}
              fetchPriority="high"
            />
            <img
              src={image.src}
              alt={image.alt}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                filter: 'none',
                zIndex: 1,
              }}
              fetchPriority="low"
              loading="lazy"
            />
          </a>
        )}
        <Typography
          sx={{
            fontSize: '1.25rem',
            marginBottom: theme.spacing(0.5),
          }}
          variant="h2"
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
          sx={{ animation: `fadeIn ${(i + 1) * 750}ms` }}
        >
          <ItemCard title={title} {...props} />
        </Grid>
      ))}
    </Grid>
  );
}

export default Portfolio;
