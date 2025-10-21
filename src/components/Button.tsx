import type { ComponentProps } from 'react';
import styled from '@emotion/styled';
import { buttonStyles } from './button.styles';

const StyledButton = styled.button(buttonStyles);

export default function Button(props: ComponentProps<'button'>) {
  return <StyledButton {...props} />;
}
