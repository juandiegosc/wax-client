import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          poster?: string;
          'auto-rotate'?: boolean | string;
          'camera-controls'?: boolean | string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          loading?: string;
          reveal?: string;
          'environment-image'?: string;
          ar?: boolean | string;
        },
        HTMLElement
      >;
    }
  }
}
