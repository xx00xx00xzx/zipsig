interface ZipSigLogoProps {
  className?: string;
}

export const ZipSigLogo = ({ className }: ZipSigLogoProps) => (
  <svg width="40" height="40" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"/>
    <path d="M64 28c4.418 0 8 3.582 8 8v12h-16V36c0-4.418 3.582-8 8-8z" fill="currentColor"/>
    <rect x="60" y="52" width="8" height="8" rx="2" fill="currentColor"/>
    <rect x="60" y="64" width="8" height="8" rx="2" fill="currentColor"/>
    <rect x="60" y="76" width="8" height="8" rx="2" fill="currentColor"/>
  </svg>
);