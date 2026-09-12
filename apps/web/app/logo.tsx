// The lockup scales as one drawing, so the stroke stays at the authored 2.25
export function Lockup() {
  return (
    <svg
      viewBox="0 0 196 32"
      className="h-auto w-33 text-text-primary"
      fill="none"
      role="img"
      aria-label="Dispatch"
    >
      <circle
        cx="6.5"
        cy="16"
        r="3.25"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path d="M11 16 H25.5" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M19.5 10.5 L25.5 16 L19.5 21.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="miter"
      />
      <text
        x="43"
        y="23"
        fill="currentColor"
        fontSize="26"
        fontWeight="500"
        letterSpacing="-0.78"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Dispatch
      </text>
    </svg>
  );
}

// The stroke thickens as the mark shrinks: 2.5 at 20px
export function Mark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-5 text-text-primary"
      fill="none"
      role="img"
      aria-label="Dispatch"
    >
      <circle
        cx="6.5"
        cy="16"
        r="3.25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M11 16 H25.5" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M19.5 10.5 L25.5 16 L19.5 21.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

// DECISIONS.md #8: the auth "Home" control is the mark run backwards - chevron, line, node -
// so returning home is stated in the brand's own vocabulary rather than a generic back arrow.
// Only the glyph mirrors; the wordmark stays readable.
export function AuthHome() {
  return (
    <svg
      viewBox="0 0 196 32"
      className="h-auto w-33 text-text-primary"
      fill="none"
      role="img"
      aria-label="Dispatch home"
    >
      <path
        d="M12.5 10.5 L6.5 16 L12.5 21.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="miter"
      />
      <path d="M6.5 16 H21" stroke="currentColor" strokeWidth="2.25" />
      <circle
        cx="25.5"
        cy="16"
        r="3.25"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <text
        x="43"
        y="23"
        fill="currentColor"
        fontSize="26"
        fontWeight="500"
        letterSpacing="-0.78"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Dispatch
      </text>
    </svg>
  );
}
