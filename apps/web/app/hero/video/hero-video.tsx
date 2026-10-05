'use client';

import { useEffect, useRef, useState } from 'react';

// AV1 first for its size, H.264 for every browser without an AV1 decoder; the codec strings let a browser skip one it cannot play
const SOURCES = [
  { src: '/hero/hero-loop-60.av1.mp4', type: 'video/mp4; codecs="av01.0.09M.08"' },
  { src: '/hero/hero-loop-60.h264.mp4', type: 'video/mp4; codecs="avc1.64002A"' },
];
const POSTER = '/hero/hero-poster.webp';
// The render's pixel size, so the box is reserved before anything loads and nothing below it shifts
const VIDEO_SIZE = 1216;

// Decorative, so the sources wait until the page has loaded and the headline is never competing with a video download
export function HeroVideo({ className = '' }: { className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [hasSources, setHasSources] = useState(false);

  useEffect(() => {
    // with reduced motion the poster is the whole visual, so the loop never downloads at all
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.readyState === 'complete') {
      setHasSources(true);
      return;
    }
    const attach = () => setHasSources(true);
    window.addEventListener('load', attach, { once: true });
    return () => window.removeEventListener('load', attach);
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element || !hasSources) return;
    element.load();

    // off screen it pauses, so a visitor reading the code cards is not paying for frames they cannot see
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        // a low power mode or a strict autoplay policy can refuse, and then the poster simply stays
        element.play().catch(() => {});
      } else {
        element.pause();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasSources]);

  return (
    <video
      ref={video}
      // decorative, so it ignores the pointer: hovering would otherwise bring up the browser's own video toolbar
      className={`dispatch-video-feather pointer-events-none aspect-square h-auto w-full mix-blend-screen ${className}`}
      width={VIDEO_SIZE}
      height={VIDEO_SIZE}
      poster={POSTER}
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    >
      {hasSources &&
        SOURCES.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
    </video>
  );
}
