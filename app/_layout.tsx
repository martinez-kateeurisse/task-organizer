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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { requestPermission } from "../utils/notifications";

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────
// Outermost shell of the app. Responsible for:
//   1. Keeping the splash screen visible while fonts load
//   2. Loading custom fonts
//   3. Requesting notification permission once fonts are ready

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
    if (!loaded) return;
    SplashScreen.hideAsync();
    // Request notification permission after the app is ready.
    // We don't block on the result — if denied, toggles on Profile simply won't fire.
    requestPermission();
  }, [loaded]);

  // Return null while fonts are loading — splash screen stays visible
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
