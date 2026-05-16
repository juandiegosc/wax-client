import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Badge, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { waxBrand } from '@/config/brand';
import { waxMenuFooterLinks, waxMenuSections } from '@/config/menu';
import { useCurrentUser, useLogout, useUserAddress } from '@/lib/hooks/useAccount';
import { useBasket } from '@/features/basket/hooks/useBasket';
import { useMyCustomProducts } from '@/features/customProducts/hooks/useMyCustomProducts';
import { MenuToggle } from '@/layouts/MenuToggle';
import { PROFILE_PROMPT_PENDING_KEY, PROFILE_WARNING_KEY } from '@/routes/RequiredAuth';
import { routePaths } from '@/routes/routePaths';

type FooterLink = (typeof waxMenuFooterLinks)[number];
type MenuSection = (typeof waxMenuSections)[number];
type MenuItem = MenuSection['items'][number];

const renderMenuItem = (item: MenuItem, closeMenu: () => void) => {
  const content = (
    <>
      <span style={{
        display: 'block',
        fontFamily: 'var(--wax-font-display)',
        fontSize: '1.22rem',
        fontWeight: 400,
        color: waxBrand.color.ink,
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
      }}>
        {item.label}
      </span>
      {item.description ? (
        <span style={{
          display: 'block',
          fontSize: '0.78rem',
          color: waxBrand.color.smoke,
          marginTop: '0.22rem',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}>
          {item.description}
        </span>
      ) : null}
    </>
  );

  const itemStyle = { display: 'block', padding: '0.75rem 0' };

  if ('to' in item) {
    return (
      <Link key={item.label} to={item.to} onClick={closeMenu} style={itemStyle}>
        {content}
      </Link>
    );
  }

  return <div key={item.label} style={itemStyle}>{content}</div>;
};

const renderMenuSection = (section: MenuSection, closeMenu: () => void) => (
  <section key={section.title}>
    <div style={{
      fontSize: '0.62rem',
      textTransform: 'uppercase',
      letterSpacing: '0.22em',
      color: waxBrand.color.smoke,
      marginBottom: '0.75rem',
      fontWeight: 600,
    }}>
      {section.title}
    </div>
    <div style={{ display: 'grid' }}>
      {section.items.map((item) => renderMenuItem(item, closeMenu))}
    </div>
  </section>
);

const renderFooterLink = (item: FooterLink) => {
  const style = {
    fontSize: '0.75rem',
    letterSpacing: '0.06em',
    color: waxBrand.color.smoke,
    textDecoration: 'none' as const,
  };

  if ('href' in item) {
    return (
      <a key={item.label} href={item.href} style={style}>
        {item.label}
      </a>
    );
  }

  return <span key={item.label} style={style}>{item.label}</span>;
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
      width: 'min(27rem, 100vw)',
      height: '100vh',
      background: waxBrand.color.porcelain,
      borderRight: `1px solid rgba(15, 15, 16, 0.08)`,
      boxShadow: waxBrand.shadow.elevated,
      transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      overflow: 'hidden',
    }}
  >
    {/* Cabecera: wordmark + cerrar */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.4rem 1.75rem',
      borderBottom: `1px solid rgba(15, 15, 16, 0.07)`,
    }}>
      <Link
        to={routePaths.home}
        onClick={closeMenu}
        style={{
          fontFamily: 'var(--wax-font-display)',
          fontSize: '1.55rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: waxBrand.color.ink,
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        WAX
      </Link>
      <MenuToggle
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
        color={waxBrand.color.ink}
        size={18}
      />
    </div>

    {/* Navegación */}
    <nav style={{ overflowY: 'auto', padding: '2.25rem 1.75rem 2rem' }}>
      <div style={{ display: 'grid', gap: '2.75rem' }}>
        {waxMenuSections.map((section) => renderMenuSection(section, closeMenu))}
      </div>
    </nav>

    {/* Pie: sesión + links */}
    <div style={{
      padding: '1.25rem 1.75rem 1.75rem',
      borderTop: `1px solid rgba(15, 15, 16, 0.07)`,
      display: 'grid',
      gap: '1.1rem',
    }}>
      {currentUserEmail ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{
            fontSize: '0.82rem',
            color: waxBrand.color.graphite,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {currentUserEmail}
          </span>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            style={{
              flexShrink: 0,
              padding: 0,
              border: 0,
              background: 'transparent',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: waxBrand.color.smoke,
              cursor: isLoggingOut ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      ) : (
        <Link
          to={routePaths.login}
          onClick={closeMenu}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: waxBrand.color.ink,
          }}
        >
          Iniciar sesión
        </Link>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {waxMenuFooterLinks.map((item) => renderFooterLink(item))}
      </div>
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
  isAuthenticated: boolean;
  basketCount: number;
  pendingQuotationsCount: number;
  onLogout: () => void;
  isLoggingOut: boolean;
  onSearchOpen: () => void;
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
  isAuthenticated,
  basketCount,
  pendingQuotationsCount,
  onLogout,
  isLoggingOut,
  onSearchOpen,
}: SiteHeaderProps) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return <header
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
      {/* LEFT: menu + search + coleccion */}
      <div className="site-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', minWidth: 0 }}>
        <MenuToggle
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          color={headerTextColor}
          size={18}
          labelStyle={utilityLabelStyle}
        />

        <IconButton className="site-search-button" aria-label="Buscar" onClick={onSearchOpen} sx={{ ...utilityButtonStyle, marginLeft: '0.5rem' }}>
          <SearchRoundedIcon fontSize="small" />
        </IconButton>
        <span className="site-search-label" style={utilityLabelStyle} onClick={onSearchOpen} role="button" tabIndex={0}>Buscar</span>

        <Link
          to={routePaths.catalog}
          className="site-catalog-nav-link"
          style={{
            ...utilityLabelStyle,
            marginLeft: '0.75rem',
            padding: '0.3rem 0',
            borderBottom: '1px solid transparent',
            transition: 'border-color 180ms ease, opacity 180ms ease',
          }}
        >
          Colección
        </Link>
      </div>

      {/* CENTER: brand */}
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

      {/* RIGHT: atelier + perfil + carrito */}
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

        {isAuthenticated ? (
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <IconButton
              className="site-utility-secondary site-account-button"
              aria-label="Mi perfil"
              sx={utilityButtonStyle}
            >
              <Badge
                badgeContent={pendingQuotationsCount || null}
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
                <PersonOutlineOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>

            {profileMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 20, paddingTop: '0.35rem' }}>
              <div style={{
                background: waxBrand.color.porcelain,
                border: `1px solid rgba(15, 15, 16, 0.1)`,
                borderRadius: waxBrand.radius.soft,
                boxShadow: waxBrand.shadow.elevated,
                overflow: 'hidden',
                minWidth: '10rem',
              }}>
                <Link
                  to={routePaths.profile}
                  style={{
                    display: 'block',
                    padding: '0.72rem 1.1rem',
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    color: waxBrand.color.ink,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver perfil
                </Link>
                <Link
                  to={routePaths.myCustomProducts}
                  style={{
                    display: 'block',
                    padding: '0.72rem 1.1rem',
                    borderTop: `1px solid rgba(15, 15, 16, 0.06)`,
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    color: waxBrand.color.ink,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Mis cotizaciones
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.72rem 1.1rem',
                    border: 0,
                    borderTop: `1px solid rgba(15, 15, 16, 0.06)`,
                    background: 'transparent',
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    color: waxBrand.color.smoke,
                    cursor: isLoggingOut ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isLoggingOut ? 'Saliendo...' : 'Salir'}
                </button>
              </div>
              </div>
            )}
          </div>
        ) : (
          <IconButton
            className="site-utility-secondary site-account-button"
            aria-label="Iniciar sesion"
            component={Link}
            to={routePaths.login}
            sx={utilityButtonStyle}
          >
            <PersonOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          aria-label="Carrito"
          component={Link}
          to={routePaths.basket}
          sx={utilityButtonStyle}
        >
          <Badge
            badgeContent={basketCount || null}
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
  </header>;
};

export const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data: billingAddress, isLoading: isLoadingAddress } = useUserAddress(Boolean(currentUser));
  const logoutMutation = useLogout();
  const isAuthenticated = Boolean(currentUser);

  const { data: basket } = useBasket(isAuthenticated);
  const basketCount = basket?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const { data: myQuotations } = useMyCustomProducts(isAuthenticated);
  const pendingQuotationsCount = myQuotations?.filter(q => q.status === 'AwaitingCustomerReview').length ?? 0;

  const isHomePage = location.pathname === routePaths.home;
  const isFloatingHeader = isHomePage && !hasScrolled && !isMenuOpen;

  useEffect(() => {
    const promptSource = sessionStorage.getItem(PROFILE_PROMPT_PENDING_KEY);
    if (!promptSource || !currentUser) return;

    const isEnrolledUser = currentUser.roles?.includes('Enrolled') ?? false;
    if (isLoadingAddress) return;

    const needsProfileCompletion = isEnrolledUser || !billingAddress;
    if (needsProfileCompletion && !sessionStorage.getItem(PROFILE_WARNING_KEY)) {
      toast.warn('Completa tu perfil para desbloquear funciones privadas de WAX.', {
        toastId: PROFILE_WARNING_KEY,
      });
      sessionStorage.setItem(PROFILE_WARNING_KEY, 'true');
    }

    sessionStorage.removeItem(PROFILE_PROMPT_PENDING_KEY);
  }, [billingAddress, currentUser, isLoadingAddress]);

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

  const toggleMenu = () => setIsMenuOpen((current) => !current);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logoutMutation.mutate();
  };

  const openSearch = () => { setSearchInput(''); setIsSearchOpen(true); };
  const closeSearch = () => setIsSearchOpen(false);
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchInput.trim();
    navigate(q ? `${routePaths.catalog}?q=${encodeURIComponent(q)}` : routePaths.catalog);
    closeSearch();
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
          background: 'linear-gradient(180deg, rgba(15, 15, 16, 0.02), transparent 28%)',
        }}
      />

      <MenuOverlay isMenuOpen={isMenuOpen} closeMenu={closeMenu} handleOverlayKeyDown={handleOverlayKeyDown} />

      <SideMenu
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
        currentUserEmail={currentUser?.email}
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
        isAuthenticated={isAuthenticated}
        basketCount={basketCount}
        pendingQuotationsCount={pendingQuotationsCount}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
        onSearchOpen={openSearch}
      />

      {isSearchOpen && (
        <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
          <form className="search-overlay-form" onSubmit={handleSearchSubmit}>
            <button type="button" className="search-overlay-close" onClick={closeSearch} aria-label="Cerrar búsqueda">×</button>
            <span className="search-overlay-label">¿Qué buscas?</span>
            <input
              autoFocus
              className="search-overlay-input"
              type="search"
              placeholder="Nombre, tipo, marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
            />
          </form>
        </div>
      )}

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
