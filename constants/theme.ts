// ─── LAVENDER FIELDS PALETTE ──────────────────────────────────────────────────
// Single source of truth for all colors in the app.
export const P = {
  plum: "#5C4A6B",
  lavender: "#A084C8",
  lilac: "#F4F0FA",
  sage: "#90AF6E",
  mossGrey: "#70786A",
  white: "#FFFFFF",
  plumLight: "#EDE6F6",
  sageLight: "#EBF3E3",
  textDark: "#2E1F3E",
  textMid: "#6B5F7A",
  textSoft: "#A89CB8",
  border: "#DDD5EA",
};

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
export const PRIORITY: Record<
  string,
  { dot: string; bg: string; text: string; label: string }
> = {
  high: { dot: P.plum, bg: P.plumLight, text: P.plum, label: "High" },
  medium: { dot: P.lavender, bg: "#EDE8F7", text: P.lavender, label: "Medium" },
  low: { dot: P.sage, bg: P.sageLight, text: "#5C8040", label: "Low" },
};

// ─── CATEGORY STYLES ──────────────────────────────────────────────────────────
export const CATEGORY: Record<string, { bg: string; text: string }> = {
  Work: { bg: P.plumLight, text: P.plum },
  Personal: { bg: "#EDE8F7", text: "#7B52AB" },
  Health: { bg: P.sageLight, text: "#5C8040" },
};
