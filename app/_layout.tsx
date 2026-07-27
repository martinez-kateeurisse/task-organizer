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
import { router, Stack, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  PreferencesProvider,
  usePreferences,
} from "../context/PreferencesContext";
import { ProfileProvider } from "../context/ProfileContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { requestPermission } from "../utils/notifications";

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────
// Outermost shell of the app. Responsible for:
//   1. Keeping the splash screen visible while fonts and stored settings load
//   2. Loading custom fonts
//   3. Requesting notification permission once the app is ready
//   4. Sending first-time users to the onboarding tour

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

  // Return null while fonts are loading — splash screen stays visible
  if (!loaded) return null;

  return (
    // Providers sit above the navigator so routes outside the tab group —
    // the settings stack — share the same state. Theme and preferences come
    // first: both hold rendering until their stored values are read, so the
    // shell below them can treat those as settled.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <PreferencesProvider>
          <TaskProvider>
            <ProfileProvider>
              <ToastProvider>
                <AppShell />
              </ToastProvider>
            </ProfileProvider>
          </TaskProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// Rendered only once every provider is ready, which makes it the right place to
// drop the splash screen.
function AppShell() {
  const { P, scheme } = useTheme();
  const { onboarded } = usePreferences();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    SplashScreen.hideAsync();
    // Request notification permission after the app is ready.
    // We don't block on the result — if denied, reminders simply won't fire.
    requestPermission();
  }, []);

  // Redirecting needs the navigator mounted, hence the key check. `replace`
  // keeps the tour off the back stack. Flipping `onboarded` back to false
  // (Help & Support → Replay intro) re-runs this.
  useEffect(() => {
    if (!navigationState?.key || onboarded) return;
    router.replace("/onboarding");
  }, [navigationState?.key, onboarded]);

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: P.lilac },
        }}
      />
    </>
  );
}
