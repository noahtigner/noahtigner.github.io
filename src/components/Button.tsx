import styled from '@emotion/styled';
import { buttonStyles, linkStyles } from './button.styles';
import { Link } from 'react-router';

export const Button = styled.button(buttonStyles);
export const ButtonLink = styled('a')(buttonStyles, linkStyles);
export const ButtonLinkInternal = styled(Link)(buttonStyles, linkStyles);
