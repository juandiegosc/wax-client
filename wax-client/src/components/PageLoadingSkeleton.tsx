type Props = {
  label?: string;
  rows?: number;
};

export const PageLoadingSkeleton = ({ label, rows = 4 }: Props) => (
  <section className="page-skeleton" aria-busy="true" aria-live="polite">
    {label ? (
      <span
        className="page-skeleton-label"
        style={{
          display: 'block',
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--wax-fg-soft)',
          marginBottom: '1.25rem',
        }}
      >
        {label}…
      </span>
    ) : null}
    <div className="page-skeleton-grid" style={{ display: 'grid', gap: '0.75rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="catalog-skeleton"
          style={{ height: i === 0 ? '2.4rem' : '1.1rem', width: i === 0 ? '60%' : `${90 - i * 10}%` }}
        />
      ))}
    </div>
  </section>
);
