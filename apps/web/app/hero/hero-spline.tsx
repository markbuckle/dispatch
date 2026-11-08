'use client';

import type { Application } from '@splinetool/runtime';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

// Spline's runtime is large, so it is its own chunk that is only requested once the scene mounts, which only happens in the browser and never in the page's first load
// React.lazy rather than next/dynamic: the package exports only an "import" condition, which next/dynamic's require-style resolution cannot find
const Spline = lazy(() => import('@splinetool/react-spline'));

const SCENE = 'https://prod.spline.design/DrHMV5eGZf-ubC7X/scene.splinecode';
// Capped at 2: a phone at 3x would otherwise render nine pixels for every one a visitor can tell apart
const MAX_PIXEL_RATIO = 2;

// Decorative, so it waits until the page has loaded and is near the screen, and the headline never competes with the scene's download
export function HeroSpline({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const app = useRef<Application | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // with reduced motion there is nothing to animate, so the scene is never fetched at all
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = box.current;
    if (!element) return;

    let ready = document.readyState === 'complete';
    let near = false;
    const maybeMount = () => {
      if (ready && near) setMounted(true);
    };

    const onLoad = () => {
      ready = true;
      maybeMount();
    };
    if (!ready) window.addEventListener('load', onLoad, { once: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        near = near || entry.isIntersecting;
        maybeMount();
        // off screen it stops drawing, so a visitor reading the code cards is not paying for frames they cannot see
        if (entry.isIntersecting) app.current?.play();
        else app.current?.stop();
      },
      { rootMargin: '300px' },
    );
    observer.observe(element);

    return () => {
      window.removeEventListener('load', onLoad);
      observer.disconnect();
    };
  }, []);

  // The runtime sizes its canvas to the scene's authored 1080px; the stylesheet classes below hold it to the box and this matches the render buffer to it
  const fit = useCallback(() => {
    const element = box.current;
    if (!element || !app.current) return;
    const side = Math.round(element.clientWidth * Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    if (side > 0) app.current.setSize(side, side);
  }, []);

  useEffect(() => {
    const element = box.current;
    if (!element || !mounted) return;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted, fit]);

  return (
    <div
      ref={box}
      // decorative, so it ignores the pointer, and the feather fades its outer edge in case a frame ever shows the box
      className={`dispatch-video-feather pointer-events-none aspect-square h-auto w-full scale-90 mix-blend-screen [&_canvas]:block [&_canvas]:h-full! [&_canvas]:w-full! ${className}`}
      aria-hidden="true"
    >
      {mounted && (
        <Suspense fallback={null}>
          <Spline
            scene={SCENE}
            style={{ width: '100%', height: '100%' }}
            onLoad={(spline) => {
              app.current = spline;
              fit();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
