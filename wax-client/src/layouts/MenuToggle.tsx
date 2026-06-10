import { Cross as Hamburger } from 'hamburger-react';
import type { CSSProperties } from 'react';

type MenuToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  gap?: CSSProperties['gap'];
  containerStyle?: CSSProperties;
  labelStyle?: CSSProperties;
};

const textTransition = 'opacity 0.24s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)';

export const MenuToggle = ({
  isOpen,
  onToggle,
  color = 'currentColor',
  size = 18,
  gap = '0.7rem',
  containerStyle,
  labelStyle,
}: MenuToggleProps) => {
  const closedLabel = 'Menu';
  const openLabel = 'Cerrar';

  return (
    <div
      className="menu-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        color,
        ...containerStyle,
      }}
    >
      <Hamburger
        toggled={isOpen}
        toggle={onToggle}
        size={size}
        color={color}
        duration={0.32}
        distance="sm"
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
        rounded={false}
        label={isOpen ? openLabel : closedLabel}
        hideOutline={false}
      />

      <div
        className="menu-toggle-labels"
        aria-hidden
        style={{
          display: 'grid',
          alignItems: 'center',
          minWidth: '4.8rem',
        }}
      >
        <span
          style={{
            gridArea: '1 / 1',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'translateY(-20%)' : 'translateY(0)',
            transition: textTransition,
            ...labelStyle,
          }}
        >
          {closedLabel}
        </span>

        <span
          style={{
            gridArea: '1 / 1',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(20%)',
            transition: textTransition,
            ...labelStyle,
          }}
        >
          {openLabel}
        </span>
      </div>
    </div>
  );
};
