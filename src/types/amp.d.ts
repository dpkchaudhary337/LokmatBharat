import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'amp-img': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          width?: string | number;
          height?: string | number;
          layout?: string;
        },
        HTMLElement
      >;
      'amp-carousel': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          width?: string | number;
          height?: string | number;
          layout?: string;
          type?: string;
          autoplay?: boolean;
          delay?: string | number;
        },
        HTMLElement
      >;
      'amp-sidebar': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          layout?: string;
          side?: string;
        },
        HTMLElement
      >;
      'amp-iframe': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          width?: string | number;
          height?: string | number;
          layout?: string;
          sandbox?: string;
          frameborder?: string;
        },
        HTMLElement
      >;
      'amp-social-share': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          'data-param-url'?: string;
          'data-param-text'?: string;
          width?: string | number;
          height?: string | number;
        },
        HTMLElement
      >;
      'amp-analytics': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          'data-credentials'?: string;
        },
        HTMLElement
      >;
    }
  }
}

