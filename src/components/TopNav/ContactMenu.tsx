import { type ComponentProps } from 'react';
import { Link } from 'react-router';
import { Menu } from '@base-ui-components/react/menu';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import contactItems from '../../assets/data/contactItems.json';
import articleAttributes from '../../assets/content/articles';
import paths from '../../paths';
import Button from '../Button';
import { ChevronDownIcon, ChevronRightIcon } from '../ChevronIcons';

const StyledMenuPositioner = styled(Menu.Positioner)`
  outline: 0;
`;

const StyledMenuPopup = styled(Menu.Popup)`
  box-sizing: border-box;
  padding-block: 0.25rem;
  border-radius: 0.375rem;
  background-color: var(--color-paper);
  color: var(--color-gray-900);
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms,
    opacity 150ms;
  outline: 1px solid var(--color-gray-300);
  outline-offset: -1px;
  filter: drop-shadow(0 0 5rem var(--color-paper));

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }
`;

const StyledMenuArrow = styled(Menu.Arrow)`
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

const menuItemStyles = css`
  color: var(--color-gray-900);
  outline: 0;
  cursor: default;
  user-select: none;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  display: flex;
  font-size: 0.875rem;
  line-height: 1rem;

  &[data-popup-open] {
    z-index: 0;
    position: relative;
  }

  &[data-popup-open]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.25rem;
    border-radius: 0.25rem;
    background-color: var(--color-gray-100);
  }

  &[data-highlighted] {
    z-index: 0;
    position: relative;
    color: var(--color-gray-50);
  }

  &[data-highlighted]::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset-block: 0;
    inset-inline: 0.25rem;
    border-radius: 0.25rem;
    background-color: var(--color-gray-900);
  }
`;

const linkItemStyles = css`
  text-decoration: none;
  cursor: pointer !important;
`;

const submenuTriggerStyles = css`
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-right: 1rem;
`;

const StyledMenuItem = styled(Menu.Item)(menuItemStyles);
const StyledExternalLinkItem = styled('a')(menuItemStyles, linkItemStyles);
const StyledInternalLinkItem = styled(Link)(menuItemStyles, linkItemStyles);
const StyledSubmenuTrigger = styled(Menu.SubmenuTrigger)(
  menuItemStyles,
  submenuTriggerStyles
);

const StyledMenuSeparator = styled(Menu.Separator)`
  margin: 0.375rem 1rem;
  height: 1px;
  background-color: var(--color-gray-200);
`;

const StyledArrowOuterStroke = styled.path`
  @media (prefers-color-scheme: light) {
    stroke: var(--color-gray-200);
  }
`;

const StyledArrowInnerStroke = styled.path`
  @media (prefers-color-scheme: dark) {
    fill: var(--color-gray-300);
  }
`;

function ArrowSvg(props: ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        fill="var(--color-paper)"
      />
      <StyledArrowOuterStroke d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z" />
      <StyledArrowInnerStroke d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z" />
    </svg>
  );
}

export default function ContactMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button>
            Get In Touch <ChevronDownIcon />
          </Button>
        }
      />
      <Menu.Portal>
        <StyledMenuPositioner sideOffset={8}>
          <StyledMenuPopup>
            <StyledMenuArrow>
              <ArrowSvg />
            </StyledMenuArrow>

            {contactItems.map((item) => (
              <StyledMenuItem
                key={item.label}
                render={
                  <StyledExternalLinkItem
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </StyledExternalLinkItem>
                }
              />
            ))}
            <StyledMenuSeparator />
            <Menu.SubmenuRoot>
              <StyledSubmenuTrigger>
                <ChevronRightIcon style={{ rotate: '180deg' }} />
                Articles
              </StyledSubmenuTrigger>
              <Menu.Portal>
                <StyledMenuPositioner alignOffset={-4} sideOffset={-4}>
                  <StyledMenuPopup>
                    <StyledMenuItem
                      render={
                        <StyledInternalLinkItem to={paths.articles}>
                          All Articles
                        </StyledInternalLinkItem>
                      }
                    />
                    <StyledMenuSeparator />
                    {Object.entries(articleAttributes).map(([key, attrs]) => (
                      <StyledMenuItem
                        key={key}
                        render={
                          <StyledInternalLinkItem to={attrs.path}>
                            {attrs.title}
                          </StyledInternalLinkItem>
                        }
                      />
                    ))}
                  </StyledMenuPopup>
                </StyledMenuPositioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </StyledMenuPopup>
        </StyledMenuPositioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
