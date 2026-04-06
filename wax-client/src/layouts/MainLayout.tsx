import { Outlet, NavLink } from 'react-router';
import { navigationLinks } from '@/config/navigation';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '0.75rem 1rem',
  borderRadius: '999px',
  backgroundColor: isActive ? '#1c1917' : 'transparent',
  color: isActive ? '#fdf8f3' : '#1c1917',
  transition: 'all 0.2s ease',
});

export const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(18px)',
          background: 'rgba(255, 250, 245, 0.82)',
          borderBottom: '1px solid rgba(28, 25, 23, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.25rem', letterSpacing: '0.08em' }}>WAX</strong>
            <div style={{ fontSize: '0.85rem', color: '#57534e' }}>Storefront architecture starter</div>
          </div>

          <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {navigationLinks.map((link) => (
              <NavLink key={link.to} to={link.to} style={navLinkStyle}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};