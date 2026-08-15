import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { NavigationMenu } from '@base-ui/react/navigation-menu';

import contactItems from '~/assets/data/contactItems.json';
import {
  ArrowSvg,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '~/components/ChevronIcons';
import {
  CompactLinkList,
  DesktopOnlyNavItem,
  DrawerBackBtn,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseBtn,
  DrawerDivider,
  DrawerDrillBtn,
  DrawerExternalLink,
  DrawerHeader,
  DrawerLink,
  DrawerPanel,
  DrawerTitle,
  MenuPanel,
  MenuSection,
  MobileNavButton,
  NestedMenuList,
  NestedMenuRoot,
  SectionPanel,
  SiteTitle,
  SiteTitleLink,
  StyledArrow,
  StyledCompactLink,
  StyledContactLink,
  StyledNav,
  StyledNavContent,
  StyledNavList,
  StyledNavTrigger,
  StyledNestedTrigger,
  StyledPopup,
  StyledPositioner,
  StyledSeparator,
  StyledViewport,
  SubmenuPanel,
} from './TopNav.styles';
import { paths } from '~/routes';
import {
  groupArticlesByCollection,
  publishedArticles,
} from '~/utils/vite/markdown';

const articleMenu = groupArticlesByCollection(publishedArticles);

type SectionTriggerProps = {
  children: string;
};

function SectionTrigger({ children }: SectionTriggerProps) {
  return (
    <StyledNavTrigger>
      {children}
      <NavigationMenu.Icon render={<ChevronDownIcon />} />
    </StyledNavTrigger>
  );
}

type CompactInternalLinkProps = {
  to: string;
  children: string;
};

function CompactInternalLink({ to, children }: CompactInternalLinkProps) {
  return (
    <StyledCompactLink closeOnClick render={<Link to={to} prefetch="render" />}>
      {children}
    </StyledCompactLink>
  );
}

type CollectionSubmenuLink = {
  key: string;
  to: string;
  label: string;
};

type CollectionSubmenuProps = {
  label: string;
  links: CollectionSubmenuLink[];
};

function CollectionSubmenu({ label, links }: CollectionSubmenuProps) {
  return (
    <NavigationMenu.Item>
      <StyledNestedTrigger>
        <NavigationMenu.Icon render={<ChevronLeftIcon />} />
        {label}
      </StyledNestedTrigger>

      <StyledNavContent>
        <SubmenuPanel>
          <CompactLinkList>
            {links.map((link) => (
              <li key={link.key}>
                <CompactInternalLink to={link.to}>
                  {link.label}
                </CompactInternalLink>
              </li>
            ))}
          </CompactLinkList>
        </SubmenuPanel>
      </StyledNavContent>
    </NavigationMenu.Item>
  );
}

type ContactNavLinkProps = {
  href: string;
  children: string;
};

function ContactNavLink({ href, children }: ContactNavLinkProps) {
  return (
    <StyledContactLink closeOnClick render={<a href={href}>{children}</a>}>
      {children}
    </StyledContactLink>
  );
}

// ---------------------------------------------------------------------------
// Mobile Drawer
// ---------------------------------------------------------------------------

type DrawerView =
  | { level: 'root' }
  | { level: 'articles' }
  | {
      level: 'collection';
      parent: 'articles';
      title: string;
      links: CollectionSubmenuLink[];
    };

function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<DrawerView>({ level: 'root' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay resetting the view so the slide-out animation shows the current content
    setTimeout(() => setView({ level: 'root' }), 300);
  }, []);

  // Close on Escape and trap focus
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    }

    // Prevent body scroll while drawer is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  // Focus the panel when it opens
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  const goBack = () => {
    if (view.level === 'collection') {
      setView({ level: view.parent });
    } else {
      setView({ level: 'root' });
    }
  };

  const title =
    view.level === 'root'
      ? 'Menu'
      : view.level === 'articles'
        ? 'Articles'
        : view.title;

  return (
    <>
      <MobileNavButton
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        Menu
        <ChevronDownIcon />
      </MobileNavButton>

      {/* Backdrop */}
      <DrawerBackdrop
        data-open={isOpen || undefined}
        onClick={close}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Drawer Panel */}
      <DrawerPanel
        ref={panelRef}
        data-open={isOpen || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
      >
        <DrawerHeader>
          {view.level !== 'root' && (
            <DrawerBackBtn onClick={goBack} aria-label="Go back">
              <ChevronLeftIcon />
              Back
            </DrawerBackBtn>
          )}
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerCloseBtn onClick={close} aria-label="Close menu">
            <CloseIcon />
          </DrawerCloseBtn>
        </DrawerHeader>

        <DrawerBody>
          {view.level === 'root' && (
            <>
              {contactItems.map((item) => (
                <DrawerExternalLink
                  key={item.label}
                  href={item.url}
                  onClick={close}
                >
                  {item.label}
                </DrawerExternalLink>
              ))}
              <DrawerDivider />
              <DrawerDrillBtn onClick={() => setView({ level: 'articles' })}>
                Articles
                <ChevronRightIcon />
              </DrawerDrillBtn>
            </>
          )}

          {view.level === 'articles' && (
            <>
              <DrawerLink to={paths.articles} onClick={close}>
                All Articles
              </DrawerLink>
              <DrawerDivider />
              {articleMenu.collections.map((group) => (
                <DrawerDrillBtn
                  key={group.slug}
                  onClick={() =>
                    setView({
                      level: 'collection',
                      parent: 'articles',
                      title: group.title,
                      links: group.articles.map((article) => ({
                        key: article.path,
                        to: article.path,
                        label: article.collection?.shortTitle ?? article.title,
                      })),
                    })
                  }
                >
                  {group.title}
                  <ChevronRightIcon />
                </DrawerDrillBtn>
              ))}
              {articleMenu.standalone.length > 0 && <DrawerDivider />}
              {articleMenu.standalone.map((article) => (
                <DrawerLink
                  key={article.path}
                  to={article.path}
                  onClick={close}
                >
                  {article.title}
                </DrawerLink>
              ))}
            </>
          )}

          {view.level === 'collection' && (
            <>
              {view.links.map((link) => (
                <DrawerLink key={link.key} to={link.to} onClick={close}>
                  {link.label}
                </DrawerLink>
              ))}
            </>
          )}
        </DrawerBody>
      </DrawerPanel>
    </>
  );
}

function ArticlesPanel() {
  return (
    <>
      <MenuSection>
        <CompactLinkList>
          <li>
            <CompactInternalLink to={paths.articles}>
              All Articles
            </CompactInternalLink>
          </li>
        </CompactLinkList>
      </MenuSection>

      <StyledSeparator />

      {articleMenu.collections.length > 0 ? (
        <>
          <MenuSection>
            <NestedMenuRoot orientation="vertical">
              <NestedMenuList>
                {articleMenu.collections.map((group) => (
                  <CollectionSubmenu
                    key={group.slug}
                    label={group.title}
                    links={group.articles.map((article) => ({
                      key: article.path,
                      to: article.path,
                      label: article.collection?.shortTitle ?? article.title,
                    }))}
                  />
                ))}
              </NestedMenuList>

              <NavigationMenu.Portal>
                <StyledPositioner
                  side="left"
                  align="start"
                  sideOffset={12}
                  collisionPadding={{
                    top: 5,
                    bottom: 5,
                    left: 16,
                    right: 16,
                  }}
                >
                  <StyledPopup>
                    <StyledViewport />
                  </StyledPopup>
                </StyledPositioner>
              </NavigationMenu.Portal>
            </NestedMenuRoot>
          </MenuSection>
        </>
      ) : null}

      {articleMenu.standalone.length > 0 ? (
        <MenuSection>
          <CompactLinkList>
            {articleMenu.standalone.map((article) => (
              <li key={article.path}>
                <CompactInternalLink to={article.path}>
                  {article.title}
                </CompactInternalLink>
              </li>
            ))}
          </CompactLinkList>
        </MenuSection>
      ) : null}
    </>
  );
}

export default function TopNav() {
  return (
    <StyledNav delay={75} closeDelay={100}>
      <SiteTitle>
        <SiteTitleLink to={paths.home}>Hey, I&apos;m Noah Tigner</SiteTitleLink>
      </SiteTitle>

      <StyledNavList>
        <DesktopOnlyNavItem>
          <SectionTrigger>Articles</SectionTrigger>

          <StyledNavContent>
            <SectionPanel>
              <ArticlesPanel />
            </SectionPanel>
          </StyledNavContent>
        </DesktopOnlyNavItem>

        <DesktopOnlyNavItem>
          <StyledNavTrigger>
            Get In Touch
            <NavigationMenu.Icon render={<ChevronDownIcon />} />
          </StyledNavTrigger>

          <StyledNavContent>
            <MenuPanel>
              {contactItems.map((item) => (
                <ContactNavLink key={item.label} href={item.url}>
                  {item.label}
                </ContactNavLink>
              ))}
            </MenuPanel>
          </StyledNavContent>
        </DesktopOnlyNavItem>

        <MobileDrawer />
      </StyledNavList>

      <NavigationMenu.Portal>
        <StyledPositioner
          sideOffset={10}
          collisionPadding={{ top: 5, bottom: 5, left: 16, right: 16 }}
          collisionAvoidance={{ side: 'none' }}
        >
          <StyledPopup>
            <StyledArrow>
              <ArrowSvg />
            </StyledArrow>
            <StyledViewport />
          </StyledPopup>
        </StyledPositioner>
      </NavigationMenu.Portal>
    </StyledNav>
  );
}
