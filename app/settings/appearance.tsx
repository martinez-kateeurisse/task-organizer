import { StyleSheet, Text, View } from "react-native";
import {
  SettingsNote,
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "../../components/SettingsScaffold";
import { CATEGORY_COLORS, FONTS, P } from "../../constants/theme";

// ─── APPEARANCE SETTINGS ──────────────────────────────────────────────────────
// Currently read-only: shows the active theme and typography.
// The dark mode toggle lands here once the theme context exists.

const SWATCHES: { key: keyof typeof P; label: string }[] = [
  { key: "plum", label: "Plum" },
  { key: "lavender", label: "Lavender" },
  { key: "lilac", label: "Lilac" },
  { key: "sage", label: "Sage" },
];

export default function AppearanceSettings() {
  return (
    <SettingsScaffold subtitle="Taskly uses the Lavender Fields theme.">
      <SettingsSection label="Theme">
        <SettingsRow label="Active theme" value="Lavender Fields" />
        <SettingsRow label="Mode" value="Light" last />
      </SettingsSection>

      <SettingsNote>
        A dark mode is on the way. Until then Taskly stays in light mode
        regardless of your system setting.
      </SettingsNote>

      <SettingsSection label="Palette">
        <View style={styles.swatchRow}>
          {SWATCHES.map((s) => (
            <View key={s.key} style={styles.swatchItem}>
              <View
                style={[styles.swatch, { backgroundColor: P[s.key] }]}
              />
              <Text style={styles.swatchLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </SettingsSection>

      <SettingsSection label="Category colors">
        <View style={styles.swatchRow}>
          {Object.entries(CATEGORY_COLORS).map(([key, cc]) => (
            <View key={key} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: cc.text }]} />
              <Text style={styles.swatchLabel}>{key}</Text>
            </View>
          ))}
        </View>
      </SettingsSection>

      <SettingsSection label="Typography">
        <SettingsRow label="Headings" value="Cormorant Garamond" />
        <SettingsRow label="Interface" value="Jost" last />
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    paddingVertical: 16,
  },
  swatchItem: { alignItems: "center", gap: 6 },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  swatchLabel: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    textTransform: "capitalize",
  },
});
