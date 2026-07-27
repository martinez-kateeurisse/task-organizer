import { Stack } from "expo-router";
import { FONTS } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

// ─── SETTINGS STACK ───────────────────────────────────────────────────────────
// Pushed over the tabs from the Profile screen. Unlike the tab screens (which
// draw their own headers), these use the native stack header so the back
// gesture and title come for free — restyled to match Lavender Fields.

export default function SettingsLayout() {
  const { P } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: P.lilac },
        headerShadowVisible: false,
        headerTintColor: P.plum,
        headerTitleStyle: {
          fontFamily: FONTS.serif,
          fontSize: 20,
          color: P.textDark,
        },
        headerBackTitle: "Profile",
        contentStyle: { backgroundColor: P.lilac },
      }}
    >
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      <Stack.Screen name="about" options={{ title: "About Taskly" }} />
    </Stack>
  );
}
