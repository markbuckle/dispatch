'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export type FrameTimingSource = 'gpu' | 'frame interval';

// Averaged over this many frames, so the readout is steady enough to read
const FRAMES_PER_REPORT = 30;
// The composer renders at priority 1, so these bracket everything it draws
const BEFORE_RENDER = 0.5;
const AFTER_RENDER = 2;

type PendingQuery = { query: WebGLQuery };

// TypeScript's DOM library does not describe this extension, so only the two constants it is used for are declared
type TimerQueryExtension = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number };

// GPU time where the browser exposes its timer; otherwise the time between frames, which never reads below the refresh rate
export function FrameTimer({
  onTiming,
}: {
  onTiming: (milliseconds: number, source: FrameTimingSource) => void;
}) {
  const context = useThree((state) => state.gl.getContext());
  const timer = useRef<TimerQueryExtension | null>(null);
  const pending = useRef<PendingQuery[]>([]);
  const active = useRef<WebGLQuery | null>(null);
  const samples = useRef<number[]>([]);

  useEffect(() => {
    timer.current =
      context instanceof WebGL2RenderingContext
        ? context.getExtension('EXT_disjoint_timer_query_webgl2')
        : null;
    return () => {
      if (!(context instanceof WebGL2RenderingContext)) return;
      for (const { query } of pending.current) context.deleteQuery(query);
      pending.current = [];
    };
  }, [context]);

  const record = (milliseconds: number, source: FrameTimingSource) => {
    samples.current.push(milliseconds);
    if (samples.current.length < FRAMES_PER_REPORT) return;
    const average = samples.current.reduce((sum, value) => sum + value, 0) / samples.current.length;
    samples.current = [];
    onTiming(average, source);
  };

  useFrame((_, delta) => {
    const extension = timer.current;
    if (!extension || !(context instanceof WebGL2RenderingContext)) {
      record(delta * 1000, 'frame interval');
      return;
    }
    const query = context.createQuery();
    if (!query) return;
    context.beginQuery(extension.TIME_ELAPSED_EXT, query);
    active.current = query;
  }, BEFORE_RENDER);

  useFrame(() => {
    const extension = timer.current;
    if (!extension || !(context instanceof WebGL2RenderingContext)) return;
    if (active.current) {
      context.endQuery(extension.TIME_ELAPSED_EXT);
      pending.current.push({ query: active.current });
      active.current = null;
    }

    // results arrive a few frames late, and a disjoint event makes every outstanding one meaningless
    const disjoint = context.getParameter(extension.GPU_DISJOINT_EXT);
    while (pending.current[0]) {
      const { query } = pending.current[0];
      if (!context.getQueryParameter(query, context.QUERY_RESULT_AVAILABLE)) break;
      const nanoseconds: number = context.getQueryParameter(query, context.QUERY_RESULT);
      context.deleteQuery(query);
      pending.current.shift();
      if (!disjoint) record(nanoseconds / 1e6, 'gpu');
    }
  }, AFTER_RENDER);

  return null;
}
