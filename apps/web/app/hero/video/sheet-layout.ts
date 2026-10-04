// The JS fold, the shader and the slicer all read these, so none can disagree about a crease; world units, so never tokens.css
export const SHEET_WIDTH = 6;
export const BODY_HEIGHT = 4;
// Long enough that the closed flap's tip lands just past the middle of the body, as on a real envelope
export const FLAP_HEIGHT = 2.4;
// The paper of the recessed panels
export const SHEET_DEPTH = 0.12;
// The raised frame round the outline, a bezel like an app icon's, standing well proud of the panels on both faces
export const BORDER_DEPTH = 0.16;
// From the outline inward: a rounded outer edge, a wide flat crown, then a steep inner wall
export const BORDER_CROWN = 0.24;
export const BORDER_DROP = 0.06;
// The wall drops past the panel into this groove before the panel rises on its own lip, so the frame reads as a separate piece
export const GROOVE_WIDTH = 0.05;
export const GROOVE_DEPTH = 0.035;
export const GROOVE_LIP = 0.05;
// Small next to the border's depth, so the outer edge reads as a rounded frame with a wall rather than a tube
export const EDGE_RADIUS = 0.08;
// Large on the body and at the top, for the soft icon corners, smaller at the flap tip so the plane keeps a point
export const BODY_CORNER_RADIUS = 0.6;
export const HINGE_CORNER_RADIUS = 0.45;
export const FLAP_TIP_RADIUS = 0.3;

// Folded layers sit this far apart, so two surfaces never share a plane and z-fight
const FOLD_GAP = 0.04;
// Half the width a crease bends over; about one sheet depth gives a rounded paper fold rather than a hinge
export const CREASE_BAND = 0.18;
// Each wing crease runs from the flap tip to this far either side of centre at the tail, so the keel deepens toward the tail as a dart's does
const KEEL_TAIL_DEPTH = 1.5;

// Each hinge sits half a border's depth plus half a gap off the mid-plane, so folded borders rest on each other, never through
export const FLAP_HINGE_Z = (BORDER_DEPTH + FOLD_GAP) / 2;
export const KEEL_HINGE_Z = (BORDER_DEPTH + FOLD_GAP) / 2;
export const WING_HINGE_Z = -(BORDER_DEPTH + FOLD_GAP) / 2;

const wingCreaseLength = Math.hypot(KEEL_TAIL_DEPTH, FLAP_HEIGHT + BODY_HEIGHT);
// The right wing crease's direction, tail toward flap tip; the left one mirrors it in x
export const WING_CREASE_AXIS_X = -KEEL_TAIL_DEPTH / wingCreaseLength;
export const WING_CREASE_AXIS_Y = (FLAP_HEIGHT + BODY_HEIGHT) / wingCreaseLength;
export const WING_CREASE_TOP_Y = FLAP_HEIGHT;
