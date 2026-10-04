// The JS fold, the shader and the slicer all read these, so none can disagree about a crease; world units, so never tokens.css
export const SHEET_WIDTH = 6;
export const BODY_HEIGHT = 4;
// Long enough that the closed flap's tip lands just past the middle of the body, as on a real envelope
export const FLAP_HEIGHT = 2.4;
export const SHEET_DEPTH = 0.12;
// Just under half the sheet's depth, so every edge is almost fully rounded and catches a soft highlight
export const EDGE_RADIUS = 0.05;
export const CORNER_RADIUS = 0.14;

// Folded layers sit this far apart, so two surfaces never share a plane and z-fight
export const FOLD_GAP = 0.04;
// Half the width a crease bends over; about one sheet depth gives a rounded paper fold rather than a hinge
export const CREASE_BAND = 0.18;
// Each wing crease runs from the flap tip to this far either side of centre at the tail, so the keel deepens toward the tail as a dart's does
export const KEEL_TAIL_DEPTH = 1.5;

// Each hinge sits on the inside face of its fold, half a gap clear, so the layers it brings together never meet
export const FLAP_HINGE_Z = (SHEET_DEPTH + FOLD_GAP) / 2;
export const KEEL_HINGE_Z = (SHEET_DEPTH + FOLD_GAP) / 2;
export const WING_HINGE_Z = -(SHEET_DEPTH + FOLD_GAP) / 2;

const wingCreaseLength = Math.hypot(KEEL_TAIL_DEPTH, FLAP_HEIGHT + BODY_HEIGHT);
// The right wing crease's direction, tail toward flap tip; the left one mirrors it in x
export const WING_CREASE_AXIS_X = -KEEL_TAIL_DEPTH / wingCreaseLength;
export const WING_CREASE_AXIS_Y = (FLAP_HEIGHT + BODY_HEIGHT) / wingCreaseLength;
export const WING_CREASE_TOP_Y = FLAP_HEIGHT;
