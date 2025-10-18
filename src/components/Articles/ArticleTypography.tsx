import { type ReactNode } from 'react';
import { Divider, Link, Typography } from '@mui/material';

export function H2({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h2" fontSize="2.5rem">
      {children}
    </Typography>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h3" fontSize="2rem">
      {children}
    </Typography>
  );
}

export function H4({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography variant="h4" fontSize="1.375rem" className={className}>
      {children}
    </Typography>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" color="text.secondary">
      {children}
    </Typography>
  );
}

export function SectionDivider() {
  return <Divider style={{ marginTop: 16, marginBottom: 16 }} />;
}

export function TalkLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      sx={{ fontStyle: 'italic' }}
    >
      {children}
    </Link>
  );
}

export function YoutubeIframe({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={`YouTube video player - ${title}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      loading="lazy"
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
      }}
    />
  );
}
