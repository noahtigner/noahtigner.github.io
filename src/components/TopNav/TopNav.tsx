import styled from '@emotion/styled';
import ContactMenu from '~/components/TopNav/ContactMenu';

const StyledNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-black);
  border-bottom: 1px solid var(--color-divider);
  box-shadow: var(--shadow-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
`;

export default function TopNav() {
  return (
    <StyledNav>
      <h1>Hey, I&apos;m Noah Tigner</h1>
      <ContactMenu />
    </StyledNav>
  );
}
