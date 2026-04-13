import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Badge, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { waxBrand } from '@/config/brand';
import { waxMenuFooterLinks, waxMenuSections } from '@/config/menu';
import { useCurrentUser, useLogout } from '@/lib/hooks/useAccount';
import { MenuToggle } from '@/layouts/MenuToggle';
import { routePaths } from '@/routes/routePaths';

type FooterLink = (typeof waxMenuFooterLinks)[number];
type MenuSection = (typeof waxMenuSections)[number];
type MenuItem = MenuSection['items'][number];

const renderMenuItem = (item: MenuItem, closeMenu: () => void) => {
  const content = (
    <>
      <div style={{ fontSize: '1rem', color: waxBrand.color.ink }}>{item.label}</div>
      {item.description ? (
        <div style={{ fontSize: '0.82rem', color: waxBrand.color.smoke, marginTop: '0.15rem' }}>
          {item.description}
        </div>
      ) : null}
    </>
  );

  if ('to' in item) {
    return (
      <Link
        key={item.label}
        to={item.to}
        onClick={closeMenu}
        style={{
          display: 'block',
          padding: '0.6rem 0',
          borderBottom: `1px solid rgba(15, 15, 16, 0.06)`,
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      key={item.label}
      style={{
        display: 'block',
        padding: '0.6rem 0',
        borderBottom: `1px solid rgba(15, 15, 16, 0.06)`,
      }}
    >
      {content}
    </div>
  );
};

const renderMenuSection = (section: MenuSection, closeMenu: () => void) => (
  <section key={section.title} style={{ display: 'grid', gap: '0.5rem' }}>
    <div
      style={{
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: waxBrand.color.smoke,
        marginBottom: '0.2rem',
      }}
    >
      {section.title}
    </div>

    {section.items.map((item) => renderMenuItem(item, closeMenu))}
  </section>
);

const renderFooterLink = (item: FooterLink) => {
  if ('href' in item) {
    return (
      <a
        key={item.label}
        href={item.href}
        style={{ fontSize: '0.86rem', color: waxBrand.color.graphite }}
      >
        {item.label}
        {'value' in item && item.value ? ` · ${item.value}` : ''}
      </a>
    );
  }

  return (
    <div key={item.label} style={{ fontSize: '0.86rem', color: waxBrand.color.graphite }}>
      {item.label}
    </div>
  );
};

type MenuOverlayProps = {
  isMenuOpen: boolean;
  closeMenu: () => void;
  handleOverlayKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const MenuOverlay = ({ isMenuOpen, closeMenu, handleOverlayKeyDown }: MenuOverlayProps) => (
  <button
    type="button"
    aria-label="Cerrar menu"
    tabIndex={isMenuOpen ? 0 : -1}
    onClick={closeMenu}
    onKeyDown={handleOverlayKeyDown}
    disabled={!isMenuOpen}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 18,
      border: 0,
      padding: 0,
      margin: 0,
      background: 'rgba(15, 15, 16, 0.52)',
      opacity: isMenuOpen ? 1 : 0,
      pointerEvents: isMenuOpen ? 'auto' : 'none',
      transition: 'opacity 0.35s ease',
      cursor: 'pointer',
    }}
  />
);

type SideMenuProps = {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  currentUserEmail?: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

const SideMenu = ({ isMenuOpen, toggleMenu, closeMenu, currentUserEmail, onLogout, isLoggingOut }: SideMenuProps) => (
  <aside
    aria-hidden={!isMenuOpen}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 19,
      width: 'min(29rem, 100vw)',
      height: '100vh',
      background: waxBrand.color.porcelain,
      borderRight: `1px solid ${waxBrand.color.stone}`,
      boxShadow: waxBrand.shadow.elevated,
      transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.1rem 1.3rem',
        borderBottom: `1px solid ${waxBrand.color.stone}`,
      }}
    >
      <MenuToggle
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
        color={waxBrand.color.ink}
        size={20}
        gap="0.85rem"
        labelStyle={{
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
        }}
      />
    </div>

    <div style={{ overflowY: 'auto', padding: '1.5rem 1.3rem 1.75rem' }}>
      <div style={{ display: 'grid', gap: '1.75rem' }}>
        {waxMenuSections.map((section) => renderMenuSection(section, closeMenu))}
      </div>
    </div>

    <div
      style={{
        padding: '1rem 1.3rem 1.3rem',
        borderTop: `1px solid ${waxBrand.color.stone}`,
        display: 'grid',
        gap: '0.7rem',
      }}
    >
      {currentUserEmail ? (
        <div style={{ display: 'grid', gap: '0.55rem', paddingBottom: '0.45rem', borderBottom: `1px solid ${waxBrand.color.stone}` }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: waxBrand.color.smoke }}>
            Sesion activa
          </span>
          <strong style={{ fontSize: '0.95rem', color: waxBrand.color.ink, overflowWrap: 'anywhere' }}>{currentUserEmail}</strong>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            style={{
              width: 'fit-content',
              padding: 0,
              border: 0,
              background: 'transparent',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: waxBrand.color.ink,
              cursor: isLoggingOut ? 'wait' : 'pointer',
            }}
          >
            {isLoggingOut ? 'Saliendo...' : 'Cerrar sesion'}
          </button>
        </div>
      ) : null}
      {waxMenuFooterLinks.map((item) => renderFooterLink(item))}
    </div>
  </aside>
);

type SiteHeaderProps = {
  isHomePage: boolean;
  isFloatingHeader: boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  utilityButtonStyle: {
    color: string;
    borderRadius: string;
    border: string;
  };
  utilityLabelStyle: {
    fontSize: string;
    letterSpacing: string;
    textTransform: 'uppercase';
    color: string;
  };
  headerTextColor: string;
  headerMutedColor: string;
  headerBrandSize: string;
  headerBrandSpacing: string;
  headerKickerSize: string;
  headerBarPadding: string;
  currentUserEmail?: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

const SiteHeader = ({
  isHomePage,
  isFloatingHeader,
  isMenuOpen,
  toggleMenu,
  utilityButtonStyle,
  utilityLabelStyle,
  headerTextColor,
  headerMutedColor,
  headerBrandSize,
  headerBrandSpacing,
  headerKickerSize,
  headerBarPadding,
  currentUserEmail,
  onLogout,
  isLoggingOut,
}: SiteHeaderProps) => (
  <header
    className="site-header"
    style={{
      position: isHomePage ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 10,
      backdropFilter: isFloatingHeader ? 'none' : 'blur(18px)',
      background: isFloatingHeader ? 'rgba(250, 249, 246, 0)' : 'rgba(250, 249, 246, 0.92)',
      borderBottom: isFloatingHeader ? '1px solid rgba(15, 15, 16, 0)' : '1px solid rgba(15, 15, 16, 0.08)',
      boxShadow: isFloatingHeader ? 'none' : '0 10px 30px rgba(15, 15, 16, 0.06)',
      transition: 'background 240ms ease, border-color 240ms ease, box-shadow 240ms ease, backdrop-filter 240ms ease',
    }}
  >
    <div
      className="site-header-bar"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: headerBarPadding,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div className="site-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', minWidth: 0 }}>
        <MenuToggle
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          color={headerTextColor}
          size={18}
          labelStyle={utilityLabelStyle}
        />

        <IconButton className="site-search-button" aria-label="Buscar" sx={{ ...utilityButtonStyle, marginLeft: '0.5rem' }}>
          <SearchRoundedIcon fontSize="small" />
        </IconButton>
        <span className="site-search-label" style={utilityLabelStyle}>Buscar</span>
      </div>

      <div className="site-header-center" style={{ justifySelf: 'center', textAlign: 'center', minWidth: 0 }}>
        <Link to={routePaths.home} style={{ display: 'grid', gap: '0.08rem', minWidth: 0 }}>
          <span
            className="site-brand-kicker"
            style={{
              fontSize: headerKickerSize,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: headerMutedColor,
            }}
          >
            Maison 3D a medida
          </span>
          <strong
            style={{
              fontFamily: 'var(--wax-font-display)',
              fontSize: headerBrandSize,
              letterSpacing: headerBrandSpacing,
              fontWeight: 400,
              textTransform: 'uppercase',
              lineHeight: 1,
              color: headerTextColor,
              transition: 'font-size 240ms ease, letter-spacing 240ms ease, color 240ms ease',
            }}
          >
            {waxBrand.name}
          </strong>
        </Link>
      </div>

      <div
        className="site-header-right"
        style={{
          justifySelf: 'end',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.2rem',
          minWidth: 0,
          flexWrap: 'wrap',
        }}
      >
        {currentUserEmail ? (
          <div className="site-session-chip" style={{ display: 'grid', justifyItems: 'end', gap: '0.05rem', marginRight: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: headerMutedColor }}>
              Sesion activa
            </span>
            <strong style={{ fontSize: '0.82rem', fontWeight: 600, color: headerTextColor, maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUserEmail}
            </strong>
          </div>
        ) : null}

        <Link
          className="site-atelier-link"
          to={routePaths.atelier}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.55rem',
            borderRadius: waxBrand.radius.soft,
            fontSize: '0.76rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: headerTextColor,
          }}
        >
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
          <span className="site-atelier-text">Atelier AI</span>
        </Link>

        <IconButton className="site-utility-secondary" aria-label="Favoritos" sx={utilityButtonStyle}>
          <FavoriteBorderOutlinedIcon fontSize="small" />
        </IconButton>

        {currentUserEmail ? (
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="site-utility-secondary"
            style={{
              border: 0,
              background: 'transparent',
              padding: '0.35rem 0.45rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: headerTextColor,
              cursor: isLoggingOut ? 'wait' : 'pointer',
            }}
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        ) : (
          <IconButton
            className="site-utility-secondary site-account-button"
            aria-label="Cuenta"
            component={Link}
            to={routePaths.login}
            sx={utilityButtonStyle}
          >
            <PersonOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton aria-label="Carrito" sx={utilityButtonStyle}>
          <Badge
            badgeContent={0}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: waxBrand.color.ink,
                color: waxBrand.color.porcelain,
                fontSize: '0.65rem',
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <ShoppingBagOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </div>
    </div>
  </header>
);

export const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const isHomePage = location.pathname === routePaths.home;
  const isFloatingHeader = isHomePage && !hasScrolled && !isMenuOpen;
  const currentUserEmail = currentUser?.email;
  const headerTextColor = isFloatingHeader ? 'rgba(250, 249, 246, 0.96)' : waxBrand.color.ink;
  const headerMutedColor = isFloatingHeader ? 'rgba(250, 249, 246, 0.76)' : waxBrand.color.graphite;
  const headerBrandSize = isFloatingHeader ? '3.1rem' : '1.78rem';
  const headerBrandSpacing = isFloatingHeader ? '0.22em' : '0.16em';
  const headerKickerSize = isFloatingHeader ? '0.72rem' : '0.62rem';
  const headerBarPadding = isFloatingHeader ? '0.8rem 1.5rem 0.95rem' : '0.95rem 1.5rem';

  useEffect(() => {
    if (!isHomePage) {
      setHasScrolled(false);
      return;
    }

    const updateHeaderState = () => {
      setHasScrolled(window.scrollY > 24);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderState);
    };
  }, [isHomePage]);

  const utilityButtonStyle = {
    color: headerTextColor,
    borderRadius: waxBrand.radius.soft,
    border: `1px solid transparent`,
  };
  const utilityLabelStyle = {
    fontSize: '0.76rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: headerMutedColor,
  };

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logoutMutation.mutate();
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <div className="site-shell" style={{ minHeight: '100vh', position: 'relative', overflow: 'clip' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(15, 15, 16, 0.02), transparent 28%)',
        }}
      />

      <MenuOverlay isMenuOpen={isMenuOpen} closeMenu={closeMenu} handleOverlayKeyDown={handleOverlayKeyDown} />

      <SideMenu
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
        currentUserEmail={currentUserEmail}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <SiteHeader
        isHomePage={isHomePage}
        isFloatingHeader={isFloatingHeader}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        utilityButtonStyle={utilityButtonStyle}
        utilityLabelStyle={utilityLabelStyle}
        headerTextColor={headerTextColor}
        headerMutedColor={headerMutedColor}
        headerBrandSize={headerBrandSize}
        headerBrandSpacing={headerBrandSpacing}
        headerKickerSize={headerKickerSize}
        headerBarPadding={headerBarPadding}
        currentUserEmail={currentUserEmail}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <main
        className="site-main"
        style={{
          position: 'relative',
          maxWidth: isHomePage ? 'none' : '1280px',
          margin: '0 auto',
          padding: isHomePage ? '0 0 4rem' : '2.5rem 1.5rem 4rem',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};