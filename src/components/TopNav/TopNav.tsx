import styled from '@emotion/styled';
import { Link } from 'react-router';
import ContactMenu from '~/components/TopNav/ContactMenu';
import { paths } from '~/routes';

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

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export default function TopNav() {
  return (
    <StyledNav>
      <h1>
        <Link
          to={paths.home}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          Hey, I&apos;m Noah Tigner
        </Link>
      </h1>
      <NavLinks>
        <ContactMenu />
      </NavLinks>
    </StyledNav>
  );
}
