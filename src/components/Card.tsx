import { styled, Card, CardContent, CardActions } from '@mui/material';

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

export { StyledCard, StyledCardContent, StyledCardActions };
