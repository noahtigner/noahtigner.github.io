import { Link } from 'react-router';
import { NavigationMenu } from '@base-ui/react/navigation-menu';

import contactItems from '~/assets/data/contactItems.json';
import {
  ArrowSvg,
  ChevronDownIcon,
  ChevronLeftIcon,
} from '~/components/ChevronIcons';
import {
  CompactLinkList,
  DesktopOnlyNavItem,
  DesktopTriggerLabel,
  MenuPanel,
  MenuSection,
  MobileOnlySection,
  MobileTriggerLabel,
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
import { groupDecksByCollection, allDecks } from '~/utils/vite/flashcards';
import {
  groupArticlesByCollection,
  publishedArticles,
} from '~/utils/vite/markdown';

const articleMenu = groupArticlesByCollection(publishedArticles);
const flashcardMenu = groupDecksByCollection(allDecks);

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

function getFlashcardPath(slug: string) {
  return paths.flashcardDeck.replace(':deck', slug);
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

function FlashcardsPanel() {
  return (
    <>
      <MenuSection>
        <CompactLinkList>
          <li>
            <CompactInternalLink to={paths.flashcards}>
              All Flashcards
            </CompactInternalLink>
          </li>
        </CompactLinkList>
      </MenuSection>

      <StyledSeparator />

      {flashcardMenu.collections.length > 0 ? (
        <>
          <MenuSection>
            <NestedMenuRoot orientation="vertical">
              <NestedMenuList>
                {flashcardMenu.collections.map((group) => (
                  <CollectionSubmenu
                    key={group.slug}
                    label={group.title}
                    links={group.decks.map((deck) => {
                      const deckPath = getFlashcardPath(deck.slug);

                      return {
                        key: deck.slug,
                        to: deckPath,
                        label: deck.title,
                      };
                    })}
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

      {flashcardMenu.standalone.length > 0 ? (
        <MenuSection>
          <CompactLinkList>
            {flashcardMenu.standalone.map((deck) => {
              const deckPath = getFlashcardPath(deck.slug);

              return (
                <li key={deck.slug}>
                  <CompactInternalLink to={deckPath}>
                    {deck.title}
                  </CompactInternalLink>
                </li>
              );
            })}
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
          <SectionTrigger>Flashcards</SectionTrigger>

          <StyledNavContent>
            <SectionPanel>
              <FlashcardsPanel />
            </SectionPanel>
          </StyledNavContent>
        </DesktopOnlyNavItem>

        <NavigationMenu.Item>
          <StyledNavTrigger>
            <DesktopTriggerLabel>Get In Touch</DesktopTriggerLabel>
            <MobileTriggerLabel>Menu</MobileTriggerLabel>
            <NavigationMenu.Icon render={<ChevronDownIcon />} />
          </StyledNavTrigger>

          <StyledNavContent>
            <MenuPanel>
              {contactItems.map((item) => (
                <ContactNavLink key={item.label} href={item.url}>
                  {item.label}
                </ContactNavLink>
              ))}

              <MobileOnlySection>
                <StyledSeparator />

                <NestedMenuRoot orientation="vertical">
                  <NestedMenuList>
                    <NavigationMenu.Item>
                      <StyledNestedTrigger>
                        <NavigationMenu.Icon render={<ChevronLeftIcon />} />
                        Articles
                      </StyledNestedTrigger>

                      <StyledNavContent>
                        <SectionPanel>
                          <ArticlesPanel />
                        </SectionPanel>
                      </StyledNavContent>
                    </NavigationMenu.Item>

                    <NavigationMenu.Item>
                      <StyledNestedTrigger>
                        <NavigationMenu.Icon render={<ChevronLeftIcon />} />
                        Flashcards
                      </StyledNestedTrigger>

                      <StyledNavContent>
                        <SectionPanel>
                          <FlashcardsPanel />
                        </SectionPanel>
                      </StyledNavContent>
                    </NavigationMenu.Item>
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
              </MobileOnlySection>
            </MenuPanel>
          </StyledNavContent>
        </NavigationMenu.Item>
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
