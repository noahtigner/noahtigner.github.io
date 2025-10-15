import { Link as RouterLink } from 'react-router';
import { useTheme, Typography, Chip } from '@mui/material';
import { StyledCard, StyledCardContent, StyledCardActions } from '../Card';
import ContactIcon from '../ContactIcon';

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
  const theme = useTheme();

  return (
    <StyledCard variant="outlined">
      <StyledCardContent>
        <a aria-label={description} href={to}>
          <img
            src={image}
            alt={title}
            style={{
              borderRadius: theme.shape.borderRadius,
              width: '100%',
            }}
          />
        </a>
        <Typography
          sx={{
            fontSize: '1.25rem',
            marginBottom: theme.spacing(0.5),
          }}
          variant="h3"
        >
          {title}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1rem' }}>
          {description}
        </Typography>
      </StyledCardContent>
      <StyledCardActions disableSpacing>
        <Chip
          label="Read Article"
          size="small"
          color="primary"
          variant="outlined"
          component={RouterLink}
          to={to}
          clickable
          sx={{
            padding: theme.spacing(0.5),
            flexGrow: 1,
          }}
          icon={<ContactIcon label="Article" />}
        />
      </StyledCardActions>
    </StyledCard>
  );
}
