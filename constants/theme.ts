// ─── LAVENDER FIELDS PALETTE ──────────────────────────────────────────────────
// Single source of truth for all colors. Keys are roles, not literal colors:
// `white` is the card surface, `lilac` the screen background, `textDark` the
// primary text — so the dark palette is a value swap, not a rename.
export const LIGHT = {
  plum: "#5C4A6B",
  lavender: "#A084C8",
  lilac: "#F4F0FA",
  sage: "#90AF6E",
  mossGrey: "#70786A",
  white: "#FFFFFF",
  plumLight: "#EDE6F6",
  lavenderLight: "#EDE8F7",
  sageLight: "#EBF3E3",
  violet: "#7B52AB",
  sageDeep: "#5C8040",
  danger: "#E53935",
  textDark: "#2E1F3E",
  textMid: "#6B5F7A",
  textSoft: "#A89CB8",
  border: "#DDD5EA",
  // Content sitting on a plum/violet fill. Never `white` — that key is the
  // card surface and inverts in dark mode.
  onAccent: "#FFFFFF",
  onAccentMuted: "rgba(255,255,255,0.7)",
  dangerLight: "#FDECEA",
  dangerDeep: "#C0392B",
  shadow: "#5C4A6B",
  overlay: "rgba(46,31,62,0.45)",
  // Brand gradients stay dark in both modes, so content on them is always
  // light — see onGradientAlpha below.
  gradientFrom: "#5C4A6B",
  gradientTo: "#7B52AB",
  heroFrom: "#5C4A6B",
  heroTo: "#3D2855",
  onGradient: "#FFFFFF",
};

export type Palette = typeof LIGHT;

// Accents lighten and surfaces darken so contrast survives the inversion.
export const DARK: Palette = {
  plum: "#B79BDD",
  lavender: "#C9B4E8",
  lilac: "#16121D",
  sage: "#A8C98A",
  mossGrey: "#97A08F",
  white: "#211A2C",
  plumLight: "#322843",
  lavenderLight: "#2E2640",
  sageLight: "#26301F",
  violet: "#B79BDD",
  sageDeep: "#9CC47C",
  danger: "#FF6B66",
  textDark: "#F1EBF8",
  textMid: "#B6A9C6",
  textSoft: "#8A7E9C",
  border: "#352B48",
  onAccent: "#1B1526",
  onAccentMuted: "rgba(27,21,38,0.7)",
  dangerLight: "#3A2020",
  dangerDeep: "#FF8A85",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.6)",
  gradientFrom: "#4B3B63",
  gradientTo: "#6E4F9B",
  heroFrom: "#3A2E4D",
  heroTo: "#241B33",
  onGradient: "#F5EFFB",
};

// Translucent white for content layered on a brand gradient. Defined here so
// the alpha ramp lives in the design system rather than in each screen.
export const onGradientAlpha = (alpha: number) => `rgba(255,255,255,${alpha})`;

// Light palette for the few spots that render before the theme context exists
// (the splash gate). Components must use useStyles/useTheme instead.
export const P = LIGHT;

// ─── FONT NAMES ───────────────────────────────────────────────────────────────
// These match exactly what expo-google-fonts registers after loading.
// Use these constants in every StyleSheet instead of typing font strings manually.
export const FONTS = {
  serif: "CormorantGaramond_700Bold",
  serifSemi: "CormorantGaramond_600SemiBold",
  sans: "Jost_400Regular",
  sansMed: "Jost_500Medium",
  sansSemi: "Jost_600SemiBold",
  sansBold: "Jost_700Bold",
};

// ─── PRIORITY STYLES ──────────────────────────────────────────────────────────
export type PriorityStyles = Record<
  string,
  { dot: string; bg: string; text: string; label: string }
>;

export const makePriority = (P: Palette): PriorityStyles => ({
  high: { dot: P.plum, bg: P.plumLight, text: P.plum, label: "High" },
  medium: {
    dot: P.lavender,
    bg: P.lavenderLight,
    text: P.lavender,
    label: "Medium",
  },
  low: { dot: P.sage, bg: P.sageLight, text: P.sageDeep, label: "Low" },
});

// ─── CATEGORY COLORS ──────────────────────────────────────────────────────────
// Swatches a user can assign to a category. Category.color stores one of these
// keys, so user-created categories always resolve to palette colors.
export type CategoryColors = Record<string, { bg: string; text: string }>;

export const makeCategoryColors = (P: Palette): CategoryColors => ({
  plum: { bg: P.plumLight, text: P.plum },
  violet: { bg: P.lavenderLight, text: P.violet },
  lavender: { bg: P.lavenderLight, text: P.lavender },
  sage: { bg: P.sageLight, text: P.sageDeep },
  moss: { bg: P.sageLight, text: P.mossGrey },
});

// Safe lookup — falls back to plum for unknown/missing color keys
export const makeCategoryStyle =
  (colors: CategoryColors) => (color?: string) =>
    colors[color ?? ""] ?? colors.plum;
