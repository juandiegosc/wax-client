import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { usePwaInstall } from '@/lib/hooks/usePwaInstall';

export const PwaInstallButton = ({ onClick }: { onClick?: () => void } = {}) => {
  const { isInstalled, canInstall, isIOS, install } = usePwaInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showIosHelp && !dialog.open) dialog.showModal();
    if (!showIosHelp && dialog.open) dialog.close();
  }, [showIosHelp]);

  if (isInstalled) return null;
  if (!canInstall && !isIOS) return null;

  const handleClick = async () => {
    onClick?.();
    if (isIOS) {
      setShowIosHelp(true);
      return;
    }
    const accepted = await install();
    if (accepted) {
      toast.success('¡WAX se instaló en tu pantalla de inicio!');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.85rem',
          border: `1px solid ${'var(--wax-fg)'}`,
          borderRadius: '0.4rem',
          background: 'transparent',
          color: 'var(--wax-fg)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Instalar app
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setShowIosHelp(false)}
        style={{
          padding: 0,
          border: 'none',
          borderRadius: '0.75rem',
          background: 'transparent',
          maxWidth: '20rem',
        }}
      >
        <div
          style={{
            background: 'var(--wax-bg-elevated)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: 'var(--wax-shadow-elevated)',
            display: 'grid',
            gap: '0.85rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--wax-fg)', fontFamily: 'var(--wax-font-display)' }}>
            Instala WAX en tu iPhone
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--wax-fg-muted)', lineHeight: 1.5 }}>
            En Safari toca el botón de <strong>Compartir</strong> (⬆️ abajo) y luego selecciona <strong>"Agregar a pantalla de inicio"</strong>. Encontrarás el ícono WAX como cualquier otra app.
          </p>
          <button
            type="button"
            onClick={() => setShowIosHelp(false)}
            style={{
              padding: '0.5rem 0.85rem',
              border: `1px solid var(--wax-fg)`,
              borderRadius: '0.4rem',
              background: 'var(--wax-fg)',
              color: 'var(--wax-bg)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              justifySelf: 'end',
            }}
          >
            Entendido
          </button>
        </div>
      </dialog>
    </>
  );
};
