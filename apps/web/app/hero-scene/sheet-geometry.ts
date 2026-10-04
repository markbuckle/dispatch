import { BufferGeometry, Float32BufferAttribute, type Vector3Tuple } from 'three';
import {
  BODY_HEIGHT,
  CORNER_RADIUS,
  CREASE_BAND,
  EDGE_RADIUS,
  FLAP_HEIGHT,
  SHEET_DEPTH,
  SHEET_WIDTH,
  WING_CREASE_AXIS_X,
  WING_CREASE_AXIS_Y,
  WING_CREASE_TOP_Y,
} from './sheet-layout';

type Point = { x: number; y: number };
type Line = { through: Point; normal: Point };

// A 180 degree fold over twelve slices turns 15 degrees a slice, the most a bend takes before it shows facets
const SLICES_PER_BAND = 12;
const CORNER_SEGMENTS = 8;
const BEVEL_SEGMENTS = 4;
const OUTLINE_SAMPLE_SPACING = 0.1;
const EPSILON = 1e-9;

function at<T>(items: readonly T[], index: number): T {
  const item = items[((index % items.length) + items.length) % items.length];
  if (item === undefined) throw new Error('index into an empty list');
  return item;
}

function normalise({ x, y }: Point): Point {
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

function lineIntersection(a: Point, aDirection: Point, b: Point, bDirection: Point): Point {
  const denominator = aDirection.x * bDirection.y - aDirection.y * bDirection.x;
  const t = ((b.x - a.x) * bDirection.y - (b.y - a.y) * bDirection.x) / denominator;
  return { x: a.x + aDirection.x * t, y: a.y + aDirection.y * t };
}

// The caps are inset by the edge radius so the rounded rim, swept back out, finishes exactly on the outline
function insetCorners(corners: readonly Point[], distance: number): Point[] {
  return corners.map((_, index) => {
    const offsetEdge = (start: Point, end: Point) => {
      const direction = normalise({ x: end.x - start.x, y: end.y - start.y });
      return {
        through: { x: start.x - direction.y * distance, y: start.y + direction.x * distance },
        direction,
      };
    };
    const incoming = offsetEdge(at(corners, index - 1), at(corners, index));
    const outgoing = offsetEdge(at(corners, index), at(corners, index + 1));
    return lineIntersection(
      incoming.through,
      incoming.direction,
      outgoing.through,
      outgoing.direction,
    );
  });
}

function roundCorners(corners: readonly Point[], radii: readonly number[]): Point[] {
  return corners.flatMap((corner, index) => {
    const radius = at(radii, index);
    if (radius === 0) return [corner];

    const toward = (other: Point) => {
      const direction = normalise({ x: other.x - corner.x, y: other.y - corner.y });
      return { x: corner.x + direction.x * radius, y: corner.y + direction.y * radius };
    };
    const entry = toward(at(corners, index - 1));
    const exit = toward(at(corners, index + 1));

    return Array.from({ length: CORNER_SEGMENTS + 1 }, (_, step) => {
      const t = step / CORNER_SEGMENTS;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      return {
        x: a * entry.x + b * corner.x + c * exit.x,
        y: a * entry.y + b * corner.y + c * exit.y,
      };
    });
  });
}

// Counter-clockwise, flap tip at the top; the hinge corners stay sharp because rounding them notches the closed envelope
const outlineCorners: Point[] = [
  { x: -SHEET_WIDTH / 2, y: -BODY_HEIGHT },
  { x: SHEET_WIDTH / 2, y: -BODY_HEIGHT },
  { x: SHEET_WIDTH / 2, y: 0 },
  { x: 0, y: FLAP_HEIGHT },
  { x: -SHEET_WIDTH / 2, y: 0 },
];
const cornerRadii = [CORNER_RADIUS, CORNER_RADIUS, 0, CORNER_RADIUS, 0].map((radius) =>
  Math.max(radius - EDGE_RADIUS, 0),
);
const capOutline = roundCorners(insetCorners(outlineCorners, EDGE_RADIUS), cornerRadii);

function bandLines(through: Point, normal: Point): Line[] {
  return Array.from({ length: SLICES_PER_BAND + 1 }, (_, slice) => {
    const offset = -CREASE_BAND + (2 * CREASE_BAND * slice) / SLICES_PER_BAND;
    return {
      through: { x: through.x + normal.x * offset, y: through.y + normal.y * offset },
      normal,
    };
  });
}

// Lines parallel to each crease, packed only inside its band, so the flat panels between creases stay a handful of triangles
const sliceLines: Line[] = [
  ...bandLines({ x: 0, y: 0 }, { x: 0, y: 1 }),
  ...bandLines({ x: 0, y: 0 }, { x: 1, y: 0 }),
  ...[1, -1].flatMap((side) =>
    bandLines(
      { x: 0, y: WING_CREASE_TOP_Y },
      { x: side * WING_CREASE_AXIS_Y, y: -WING_CREASE_AXIS_X },
    ),
  ),
];

function signedDistance(point: Point, line: Line): number {
  return (point.x - line.through.x) * line.normal.x + (point.y - line.through.y) * line.normal.y;
}

function splitConvex(polygon: readonly Point[], line: Line): Point[][] {
  const ahead: Point[] = [];
  const behind: Point[] = [];

  polygon.forEach((current, index) => {
    const next = at(polygon, index + 1);
    const currentDistance = signedDistance(current, line);
    const nextDistance = signedDistance(next, line);

    if (currentDistance >= -EPSILON) ahead.push(current);
    if (currentDistance <= EPSILON) behind.push(current);

    const crosses =
      (currentDistance > EPSILON && nextDistance < -EPSILON) ||
      (currentDistance < -EPSILON && nextDistance > EPSILON);
    if (crosses) {
      const t = currentDistance / (currentDistance - nextDistance);
      const cut = {
        x: current.x + (next.x - current.x) * t,
        y: current.y + (next.y - current.y) * t,
      };
      ahead.push(cut);
      behind.push(cut);
    }
  });

  return ahead.length >= 3 && behind.length >= 3 ? [ahead, behind] : [polygon.slice()];
}

// Every line runs right across the sheet, so two pieces that share an edge are always cut at the same points and never crack apart
const capPieces = sliceLines.reduce<Point[][]>(
  (pieces, line) => pieces.flatMap((piece) => splitConvex(piece, line)),
  [capOutline],
);

function keyOf({ x, y }: Point): string {
  return `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
}

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// An edge used by only one piece is on the outline, and the pieces wind counter-clockwise, so following them walks the rim in order
function boundaryLoop(pieces: readonly Point[][]): Point[] {
  const edgeCounts = new Map<string, number>();
  for (const piece of pieces) {
    piece.forEach((start, index) => {
      const key = edgeKey(keyOf(start), keyOf(at(piece, index + 1)));
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    });
  }

  const nextAlongRim = new Map<string, Point>();
  let first: Point | undefined;
  for (const piece of pieces) {
    piece.forEach((start, index) => {
      const end = at(piece, index + 1);
      const [a, b] = [keyOf(start), keyOf(end)];
      if (a === b || edgeCounts.get(edgeKey(a, b)) !== 1) return;
      nextAlongRim.set(a, end);
      first ??= start;
    });
  }
  if (!first) throw new Error('the sheet has no outline');

  const loop: Point[] = [first];
  let current = nextAlongRim.get(keyOf(first));
  while (current && keyOf(current) !== keyOf(first) && loop.length < nextAlongRim.size) {
    loop.push(current);
    current = nextAlongRim.get(keyOf(current));
  }
  return loop;
}

function resample(loop: readonly Point[], spacing: number): Vector3Tuple[] {
  return loop.flatMap((start, index) => {
    const end = at(loop, index + 1);
    const steps = Math.max(1, Math.round(Math.hypot(end.x - start.x, end.y - start.y) / spacing));
    return Array.from({ length: steps }, (_, step): Vector3Tuple => {
      const t = step / steps;
      return [start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t, 0];
    });
  });
}

// Evenly spaced round the edge, so their average is the folded sheet's middle rather than wherever the slices bunch up
export const outlineSamples: readonly Vector3Tuple[] = resample(capOutline, OUTLINE_SAMPLE_SPACING);

// The open envelope laid flat, front face toward +z, flap hinge along y = 0, centred on the sheet's mid-plane
export function createSheetGeometry(): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const halfDepth = SHEET_DEPTH / 2;

  const addVertex = (
    x: number,
    y: number,
    z: number,
    normalX: number,
    normalY: number,
    normalZ: number,
  ) => {
    positions.push(x, y, z);
    normals.push(normalX, normalY, normalZ);
    // taken from the flat sheet and scaled the same both ways, so textures fold with the paper and never stretch
    uvs.push(x / SHEET_WIDTH, y / SHEET_WIDTH);
    return positions.length / 3 - 1;
  };

  for (const face of [1, -1]) {
    const shared = new Map<string, number>();
    const vertexFor = (point: Point) => {
      const key = keyOf(point);
      const existing = shared.get(key);
      if (existing !== undefined) return existing;
      const index = addVertex(point.x, point.y, face * halfDepth, 0, 0, face);
      shared.set(key, index);
      return index;
    };

    for (const piece of capPieces) {
      const corners = piece.map(vertexFor);
      const origin = at(corners, 0);
      for (let index = 1; index < corners.length - 1; index++) {
        const [b, c] = [at(corners, index), at(corners, index + 1)];
        if (b === c || b === origin || c === origin) continue;
        // the back face winds the other way so it faces -z
        if (face === 1) indices.push(origin, b, c);
        else indices.push(origin, c, b);
      }
    }
  }

  const loop = boundaryLoop(capPieces);
  const capHalfDepth = halfDepth - EDGE_RADIUS;
  // a quarter round off the front cap, a straight wall, a quarter round onto the back cap
  const profile = [0, 1].flatMap((half) =>
    Array.from({ length: BEVEL_SEGMENTS + 1 }, (_, step) => {
      const angle = (Math.PI / 2) * (half + step / BEVEL_SEGMENTS);
      return {
        angle,
        z: (half === 0 ? capHalfDepth : -capHalfDepth) + EDGE_RADIUS * Math.cos(angle),
      };
    }),
  );

  const rimStart = positions.length / 3;
  loop.forEach((point, index) => {
    const outward = (from: Point, to: Point) => normalise({ x: to.y - from.y, y: from.x - to.x });
    const before = outward(at(loop, index - 1), point);
    const after = outward(point, at(loop, index + 1));
    const bisector = normalise({ x: before.x + after.x, y: before.y + after.y });
    // a mitre keeps the rim's wall parallel to both edges at a sharp corner instead of pinching it
    const mitre = 1 / Math.max(bisector.x * before.x + bisector.y * before.y, 0.2);

    for (const { angle, z } of profile) {
      const reach = EDGE_RADIUS * Math.sin(angle) * mitre;
      addVertex(
        point.x + bisector.x * reach,
        point.y + bisector.y * reach,
        z,
        bisector.x * Math.sin(angle),
        bisector.y * Math.sin(angle),
        Math.cos(angle),
      );
    }
  });

  const rings = profile.length;
  for (let index = 0; index < loop.length; index++) {
    const following = (index + 1) % loop.length;
    for (let ring = 0; ring < rings - 1; ring++) {
      const a = rimStart + index * rings + ring;
      const b = rimStart + following * rings + ring;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}
