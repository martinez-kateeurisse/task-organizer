import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";
import {
  SettingsNote,
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "../../components/SettingsScaffold";
import { FONTS, P } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── ABOUT TASKLY ─────────────────────────────────────────────────────────────
// Version is read from app.json via expo-constants rather than hardcoded, so it
// can't fall out of step with the manifest.

export default function AboutSettings() {
  const { tasks } = useTasks();
  const completed = tasks.filter((t) => t.done).length;

  return (
    <SettingsScaffold>
      <View style={styles.hero}>
        <Text style={styles.heroMark}>🌿</Text>
        <Text style={styles.heroTitle}>Taskly</Text>
        <Text style={styles.heroTagline}>
          A calm place to keep track of things.
        </Text>
      </View>

      <SettingsSection label="Version">
        <SettingsRow
          label="App version"
          value={Constants.expoConfig?.version ?? "—"}
        />
        <SettingsRow
          label="Expo SDK"
          value={Constants.expoConfig?.sdkVersion ?? "—"}
          last
        />
      </SettingsSection>

      <SettingsSection label="Your history">
        <SettingsRow label="Tasks created" value={`${tasks.length}`} />
        <SettingsRow label="Tasks completed" value={`${completed}`} last />
      </SettingsSection>

      <SettingsSection label="Design">
        <SettingsRow label="Theme" value="Lavender Fields" />
        <SettingsRow label="Headings" value="Cormorant Garamond" />
        <SettingsRow label="Interface" value="Jost" last />
      </SettingsSection>

      <SettingsNote>
        Built with Expo Router, React Native Reanimated, and Gesture Handler.
      </SettingsNote>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 18, marginBottom: 12 },
  heroMark: { fontSize: 44, marginBottom: 10 },
  heroTitle: { fontSize: 30, fontFamily: FONTS.serif, color: P.textDark },
  heroTagline: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 4,
  },
});
