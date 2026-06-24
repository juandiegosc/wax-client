import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useLocation } from 'react-router';
import { routePaths } from '@/routes/routePaths';

type TabBarProps = {
  basketCount: number;
  quotationsCount: number;
};

type TabItem = {
  to: string;
  label: string;
  Icon: typeof HomeOutlinedIcon;
  exact?: boolean;
  hero?: boolean;
  badge?: 'basket' | 'quotations';
};

const tabs: TabItem[] = [
  { to: routePaths.home, label: 'Inicio', Icon: HomeOutlinedIcon, exact: true },
  { to: routePaths.catalog, label: 'Catálogo', Icon: GridViewOutlinedIcon },
  { to: routePaths.atelier, label: 'Atelier', Icon: AutoAwesomeOutlinedIcon, hero: true },
  { to: routePaths.basket, label: 'Carrito', Icon: ShoppingBagOutlinedIcon, badge: 'basket' },
  { to: routePaths.profile, label: 'Cuenta', Icon: PersonOutlineOutlinedIcon, badge: 'quotations' },
];

export const TabBar = ({ basketCount, quotationsCount }: TabBarProps) => {
  const { pathname } = useLocation();
  const badgeCounts = { basket: basketCount, quotations: quotationsCount };

  return (
    <nav className="wax-tabbar" aria-label="Navegación inferior">
      {tabs.map(({ to, label, Icon, exact, hero, badge }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        const badgeCount = badge ? badgeCounts[badge] : 0;
        return (
          <Link
            key={to}
            to={to}
            className={hero ? 'wax-tab wax-tab-hero' : 'wax-tab'}
            data-active={active}
            aria-current={active ? 'page' : undefined}
          >
            <span className="wax-tab-mark" aria-hidden />
            {hero ? (
              <span className="wax-tab-orb">
                <Icon sx={{ fontSize: 18 }} />
              </span>
            ) : (
              <Icon sx={{ fontSize: 20 }} />
            )}
            <span className="wax-tab-label">{label}</span>
            {badgeCount > 0 ? (
              <span className="wax-tab-badge">{badgeCount}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
};
