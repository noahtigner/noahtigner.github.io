import { Tooltip } from '@base-ui/react/tooltip';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import contactItems from '~/assets/data/contactItems.json';
import { buttonStyles } from '~/components/button.styles';
import ContactIcon from '~/components/ContactIcon';
import { ArrowSvg } from '~/components/ChevronIcons';

const aStyles = css`
  text-decoration: none;
  padding: 2px;
  cursor: pointer !important;
`;

const StyledIconButton = styled.a(buttonStyles, aStyles);

const StyledTooltipPopup = styled(Tooltip.Popup)`
  box-sizing: border-box;
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: canvas;
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms,
    opacity 150ms;

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }

  &[data-instant] {
    transition-duration: 0ms;
  }

  @media (prefers-color-scheme: light) {
    outline: 1px solid var(--color-gray-200);
    box-shadow:
      0 10px 15px -3px var(--color-gray-200),
      0 4px 6px -4px var(--color-gray-200);
  }

  @media (prefers-color-scheme: dark) {
    outline: 1px solid var(--color-gray-300);
    outline-offset: -1px;
  }
`;

const StyledTooltipArrow = styled(Tooltip.Arrow)`
  display: flex;

  &[data-side='top'] {
    bottom: -8px;
    rotate: 180deg;
  }

  &[data-side='bottom'] {
    top: -8px;
    rotate: 0deg;
  }

  &[data-side='left'] {
    right: -13px;
    rotate: 90deg;
  }

  &[data-side='right'] {
    left: -13px;
    rotate: -90deg;
  }
`;

const StyledP = styled.p`
  color: var(--color-text-secondary);
  /* hide on small screens */
  @media (max-width: 600px) {
    display: none;
  }
`;

const StyledIconsContainer = styled.span`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  /* only flexGrow on small screens */
  flex-grow: 0;
  @media (max-width: 600px) {
    flex-grow: 1;
  }
`;

const StyledFooter = styled.footer`
  background-color: var(--color-black);
  border-top: 1px solid var(--color-divider);
  margin-top: 32px;
  margin-left: 32px;
  margin-right: 32px;
  padding-top: 16px;
  padding-bottom: 16px;
`;

function Footer() {
  return (
    <Tooltip.Provider>
      <StyledFooter>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <StyledP>Built with TypeScript & React</StyledP>
          <StyledIconsContainer>
            {contactItems.map(({ label, url }) => (
              <Tooltip.Root key={url}>
                <Tooltip.Trigger
                  aria-label={label}
                  render={
                    <StyledIconButton
                      aria-label={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ContactIcon label={label} />
                    </StyledIconButton>
                  }
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={10}>
                    <StyledTooltipPopup>
                      <StyledTooltipArrow>
                        <ArrowSvg />
                      </StyledTooltipArrow>
                      {label}
                    </StyledTooltipPopup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </StyledIconsContainer>
        </span>
      </StyledFooter>
    </Tooltip.Provider>
  );
}

export default Footer;
