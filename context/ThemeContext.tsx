import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import {
  CategoryColors,
  DARK,
  LIGHT,
  makeCategoryColors,
  makeCategoryStyle,
  makePriority,
  Palette,
  PriorityStyles,
} from "../constants/theme";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
// Owns the active palette. "system" follows the OS setting live; the explicit
// modes pin it. Everything colour-related in the app resolves through here.

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  scheme: "light" | "dark";
  loading: boolean;
  P: Palette;
  PRIORITY: PriorityStyles;
  CATEGORY_COLORS: CategoryColors;
  categoryStyle: (color?: string) => { bg: string; text: string };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = "taskly:theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMode() {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setModeState(stored);
        }
      } catch {
        // fall back to "system"
      } finally {
        setLoading(false);
      }
    }
    loadMode();
  }, []);

  // Written on change rather than in an effect so the initial "system" default
  // never races the read above.
  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }

  const scheme: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo(() => {
    const P = scheme === "dark" ? DARK : LIGHT;
    const CATEGORY_COLORS = makeCategoryColors(P);
    return {
      mode,
      setMode,
      scheme,
      loading,
      P,
      PRIORITY: makePriority(P),
      CATEGORY_COLORS,
      categoryStyle: makeCategoryStyle(CATEGORY_COLORS),
    };
  }, [scheme, mode, loading]);

  // Nothing renders until the stored mode is known, so a user in dark mode
  // never sees a frame of the light palette on launch.
  if (loading) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// Builds a component's StyleSheet against the active palette and caches it per
// scheme, so switching themes rebuilds styles but re-renders do not.
//
// Usage: const { P, styles } = useStyles(makeStyles)
const cache = new WeakMap<
  (P: Palette) => any,
  Partial<Record<"light" | "dark", any>>
>();

export function useStyles<T>(factory: (P: Palette) => T) {
  const theme = useTheme();
  const styles = useMemo(() => {
    let entry = cache.get(factory);
    if (!entry) {
      entry = {};
      cache.set(factory, entry);
    }
    if (!entry[theme.scheme]) entry[theme.scheme] = factory(theme.P);
    return entry[theme.scheme] as T;
  }, [factory, theme.scheme, theme.P]);

  return { ...theme, styles };
}
