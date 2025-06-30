/// <reference types="vite/client" />

// Extend HTMLInputElement to include webkitdirectory
declare global {
  namespace JSX {
    interface IntrinsicElements {
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
        webkitdirectory?: string;
      };
    }
  }
}
