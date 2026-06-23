import type { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

type RevealProps = {
  children: ReactNode;
  /** retardo en ms para escalonar elementos contiguos */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'span' | 'article' | 'header';
};

// Aparición editorial estilo Gucci: el contenido sube desde abajo con
// desvanecido cuando entra al viewport. Respeta prefers-reduced-motion via CSS.
export const Reveal = ({ children, delay = 0, className, as = 'div' }: RevealProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '0px 0px -10% 0px' });
  const Tag = as;
  const classes = ['wax-reveal', inView ? 'is-visible' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};
