import React, { useMemo, useState } from 'react';
import { getFaviconCandidates } from '../utils/favicon';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Props = {
  url: string;
  alt?: string;
  className?: string;
  title?: string;
};

export default function Favicon({ url, alt = '', className, title }: Props) {
  const candidates = useMemo(() => getFaviconCandidates(url), [url]);
  const [idx, setIdx] = useState(0);

  const src = candidates[idx] ?? '';

  if (!src) return <ImageWithFallback src="" alt={alt} className={className} title={title} />;

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      title={title}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIdx((v) => (v + 1 < candidates.length ? v + 1 : v))}
    />
  );
}

