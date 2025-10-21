import { Link } from 'react-router';
import { Menu } from '@base-ui-components/react/menu';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import contactItems from '../../assets/data/contactItems.json';
import articleAttributes from '../../assets/content/articles';
import paths from '../../paths';
import { Button, ButtonLink } from '../Button';
import { ArrowSvg, ChevronDownIcon, ChevronRightIcon } from '../ChevronIcons';

const StyledMenuPositioner = styled(Menu.Positioner)`
  outline: 0;
`;

export const StyledMenuPopup = styled(Menu.Popup)`
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
  filter: drop-shadow(0 0 0.25rem var(--color-paper));

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
                  <ButtonLink
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      border: 'none',
                      justifyContent: 'start',
                    }}
                  >
                    {item.label}
                  </ButtonLink>
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
