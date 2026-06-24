import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom no implementa IntersectionObserver (lo usa react-intersection-observer
// del componente Reveal). Mock minimo que reporta el elemento como visible.
class MockIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe = (target: Element) => {
    this.callback(
      [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  };
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = () => [];
  root = null;
  rootMargin = '';
  thresholds = [];
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
