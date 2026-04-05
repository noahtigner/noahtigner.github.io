import { Link } from 'react-router';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { buttonStyles } from '~/components/button.styles';

export const StyledNav = styled(NavigationMenu.Root)`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-black);
  border-bottom: 1px solid var(--color-divider);
  box-shadow: var(--shadow-1);
`;

export const SiteTitle = styled.h1`
  flex-shrink: 0;
`;

export const SiteTitleLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

export const StyledNavList = styled(NavigationMenu.List)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;

  & > li {
    position: relative;
    margin-left: -1px;
  }

  & > li:first-of-type {
    margin-left: 0;
  }

  & > li > a,
  & > li > button {
    position: relative;
    border-radius: 0;
  }

  & > li:first-of-type > a,
  & > li:first-of-type > button {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  & > li:last-of-type > a,
  & > li:last-of-type > button {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }

  & > li > a:hover,
  & > li > a:focus-visible,
  & > li > a[data-popup-open],
  & > li > button:hover,
  & > li > button:focus-visible,
  & > li > button[data-popup-open] {
    z-index: 1;
  }

  @media (max-width: 768px) {
    & > li {
      margin-left: 0;
    }

    & > li > a,
    & > li > button {
      border-radius: var(--border-radius);
    }
  }
`;

export const DesktopOnlyNavItem = styled(NavigationMenu.Item)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const triggerStyles = css`
  ${buttonStyles}
  cursor: pointer;

  &[data-popup-open] {
    border-color: var(--color-text-primary);
    background-color: var(--color-gray-100);
  }

  & > svg {
    transition: transform 0.2s ease;
  }

  &[data-popup-open] > svg {
    transform: rotate(180deg);
  }
`;

const popupStyles = css`
  position: relative;
  overflow: visible;
  box-sizing: border-box;
  width: var(--popup-width);
  height: var(--popup-height);
  border-radius: 0.375rem;
  background-color: var(--color-paper);
  color: var(--color-gray-900);
  outline: 1px solid var(--color-gray-300);
  outline-offset: -1px;
  filter: drop-shadow(0 0 0.25rem var(--color-paper));
  transform-origin: var(--transform-origin);
  transition-property: opacity, transform, width, height;
  transition-duration: var(--nav-menu-duration);
  transition-timing-function: var(--nav-menu-easing);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.95);
  }

  &[data-ending-style] {
    transition-duration: 150ms;
    transition-timing-function: ease;
  }
`;

const menuLinkStyles = css`
  position: relative;
  z-index: 0;
  display: flex;
  padding-block: 0.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  color: var(--color-gray-900);
  font-size: 0.875rem;
  line-height: 1rem;
  text-decoration: none;
  outline: 0;
  user-select: none;
  cursor: pointer !important;
  white-space: normal;
  word-wrap: break-word;
  hyphens: auto;

  @media (max-width: 768px) {
    line-height: 1.25rem;
  }

  &[data-highlighted] {
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

const compactLinkStyles = css`
  display: block;
  padding: 0.45rem 0.75rem;
  border-radius: 0.375rem;
  color: var(--color-gray-900);
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-decoration: none;
  outline: 0;
  user-select: none;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
    }
  }

  &[data-highlighted] {
    background-color: var(--color-gray-900);
    color: var(--color-gray-50);
  }

  &:focus-visible {
    position: relative;
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }
`;

const nestedTriggerStyles = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.45rem 0.75rem;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-gray-900);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: left;
  outline: 0;
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
    }
  }

  &[data-popup-open] {
    background-color: var(--color-gray-100);
  }

  &:focus-visible {
    position: relative;
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }

  & > svg {
    flex-shrink: 0;
  }
`;

export const StyledNavTrigger = styled(NavigationMenu.Trigger)(triggerStyles);
export const StyledContactLink = styled(NavigationMenu.Link)(menuLinkStyles);
export const StyledCompactLink = styled(NavigationMenu.Link)(compactLinkStyles);
export const StyledNestedTrigger = styled(NavigationMenu.Trigger)(
  nestedTriggerStyles
);

export const StyledNavContent = styled(NavigationMenu.Content)`
  box-sizing: border-box;
  height: 100%;
  transition:
    opacity calc(var(--nav-menu-duration) * 0.5) ease,
    transform var(--nav-menu-duration) var(--nav-menu-easing);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }

  &[data-starting-style][data-activation-direction='left'] {
    transform: translateX(-1rem);
  }

  &[data-starting-style][data-activation-direction='right'] {
    transform: translateX(1rem);
  }

  &[data-ending-style][data-activation-direction='left'] {
    transform: translateX(1rem);
  }

  &[data-ending-style][data-activation-direction='right'] {
    transform: translateX(-1rem);
  }
`;

export const StyledPositioner = styled(NavigationMenu.Positioner)`
  --nav-menu-easing: cubic-bezier(0.22, 1, 0.36, 1);
  --nav-menu-duration: 0.25s;

  position: relative;
  box-sizing: border-box;
  width: var(--positioner-width);
  height: var(--positioner-height);
  max-width: min(var(--available-width), calc(100vw - 2rem));
  outline: 0;
  transition-property: top, left, right, bottom;
  transition-duration: var(--nav-menu-duration);
  transition-timing-function: var(--nav-menu-easing);

  &::before {
    content: '';
    position: absolute;
  }

  &[data-side='top']::before {
    right: 0;
    bottom: -10px;
    left: 0;
    height: 10px;
  }

  &[data-side='bottom']::before {
    top: -10px;
    right: 0;
    left: 0;
    height: 10px;
  }

  &[data-side='left']::before {
    top: 0;
    right: -10px;
    bottom: 0;
    width: 10px;
  }

  &[data-side='right']::before {
    top: 0;
    bottom: 0;
    left: -10px;
    width: 10px;
  }

  &[data-instant] {
    transition: none;
  }
`;

export const StyledPopup = styled(NavigationMenu.Popup)`
  ${popupStyles}
`;

export const StyledViewport = styled(NavigationMenu.Viewport)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const StyledArrow = styled(NavigationMenu.Arrow)`
  display: flex;
  transition: left var(--nav-menu-duration) var(--nav-menu-easing);

  &[data-side='top'] {
    bottom: -8px;
    rotate: 180deg;
  }

  &[data-side='bottom'] {
    top: -8px;
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

export const MenuPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  padding-block: 0.25rem;
`;

export const SectionPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: min(18rem, calc(100vw - 2rem));
  padding: 0.75rem;
  overflow: visible;
`;

export const SubmenuPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: min(22rem, calc(100vw - 2rem));
  max-height: min(70vh, 32rem);
  padding: 0.75rem;
  overflow-y: auto;
`;

export const MenuSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const NestedMenuRoot = styled(NavigationMenu.Root)`
  overflow: visible;
`;

export const NestedMenuList = styled(NavigationMenu.List)`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const CompactLinkList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const DesktopTriggerLabel = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileTriggerLabel = styled.span`
  display: none;

  @media (max-width: 768px) {
    display: inline;
  }
`;

export const MobileOnlySection = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

export const StyledSeparator = styled.div`
  height: 1px;
  margin: 0.5rem 0.75rem;
  background-color: var(--color-gray-200);
`;
