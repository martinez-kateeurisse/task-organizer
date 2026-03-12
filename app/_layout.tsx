import {
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Jost_700Bold,
} from "@expo-google-fonts/jost";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────
// This is the outermost shell of the app.
// It does two things:
//   1. Loads custom fonts before the app renders
//   2. Sets up the root Stack navigator (which contains the (tabs) group)
//
// SplashScreen.preventAutoHideAsync keeps the splash visible while fonts load.
// Once loaded, we hide it and let the app render.

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_700Bold,
    CormorantGaramond_600SemiBold,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Jost_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Return null while fonts are loading — splash screen stays visible
  if (!loaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
