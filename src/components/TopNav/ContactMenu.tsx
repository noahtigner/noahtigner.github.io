import { useMemo } from 'react';
import { Link } from 'react-router';
import { Menu } from '@base-ui/react/menu';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import contactItems from '~/assets/data/contactItems.json';
import {
  publishedArticles,
  groupArticlesByCollection,
} from '~/utils/vite/markdown';
import { paths } from '~/routes';
import { Button } from '~/components/Button';
import {
  ArrowSvg,
  ChevronDownIcon,
  ChevronRightIcon,
} from '~/components/ChevronIcons';

const StyledMenuPositioner = styled(Menu.Positioner)`
  outline: 0;
`;

const rotatingIconStyles = css`
  & > svg {
    transition: transform 0.2s ease;
  }
  &[data-popup-open] {
    & > svg {
      transform: rotate(180deg);
    }
  }
`;

const StyledMenuTrigger = styled(Menu.Trigger)(rotatingIconStyles);

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

  @media (max-width: 768px) {
    max-width: 60vw;
  }

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

  white-space: normal;
  word-wrap: break-word;
  hyphens: auto;

  @media (max-width: 768px) {
    line-height: 1.25rem;
  }

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
const StyledExternalLinkItem = styled('a')(menuItemStyles, linkItemStyles);
const StyledSubmenuTrigger = styled(Menu.SubmenuTrigger)(
  menuItemStyles,
  submenuTriggerStyles,
  rotatingIconStyles
);

const StyledMenuSeparator = styled(Menu.Separator)`
  margin: 0.375rem 1rem;
  height: 1px;
  background-color: var(--color-gray-200);
`;

export default function ContactMenu() {
  const { standalone, collections } = useMemo(
    () => groupArticlesByCollection(publishedArticles),
    []
  );
  return (
    <Menu.Root>
      <StyledMenuTrigger
        openOnHover
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
                        <StyledInternalLinkItem
                          to={paths.articles}
                          prefetch="render"
                        >
                          All Articles
                        </StyledInternalLinkItem>
                      }
                    />
                    <StyledMenuSeparator />
                    {standalone.map((attrs) => (
                      <StyledMenuItem
                        key={attrs.path}
                        render={
                          <StyledInternalLinkItem
                            to={attrs.path}
                            prefetch="render"
                          >
                            {attrs.title}
                          </StyledInternalLinkItem>
                        }
                      />
                    ))}
                    {collections.map((collection) => (
                      <Menu.SubmenuRoot key={collection.slug}>
                        <StyledSubmenuTrigger>
                          <ChevronRightIcon style={{ rotate: '180deg' }} />
                          {collection.title}
                        </StyledSubmenuTrigger>
                        <Menu.Portal>
                          <StyledMenuPositioner
                            alignOffset={-4}
                            sideOffset={-4}
                          >
                            <StyledMenuPopup>
                              {collection.articles.map((attrs) => (
                                <StyledMenuItem
                                  key={attrs.path}
                                  render={
                                    <StyledInternalLinkItem
                                      to={attrs.path}
                                      prefetch="render"
                                    >
                                      {attrs.title}
                                    </StyledInternalLinkItem>
                                  }
                                />
                              ))}
                            </StyledMenuPopup>
                          </StyledMenuPositioner>
                        </Menu.Portal>
                      </Menu.SubmenuRoot>
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
