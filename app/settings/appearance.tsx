import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "../../components/SettingsScaffold";
import { FONTS, Palette } from "../../constants/theme";
import { ThemeMode, useStyles } from "../../context/ThemeContext";

// ─── APPEARANCE SETTINGS ──────────────────────────────────────────────────────
// Shows the palette and typography, and owns the light/dark control.

const SWATCHES: { key: keyof Palette; label: string }[] = [
  { key: "plum", label: "Plum" },
  { key: "lavender", label: "Lavender" },
  { key: "lilac", label: "Lilac" },
  { key: "sage", label: "Sage" },
];

const MODES: { key: ThemeMode; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

export default function AppearanceSettings() {
  const { P, CATEGORY_COLORS, styles, mode, setMode, scheme } =
    useStyles(makeStyles);

  return (
    <SettingsScaffold subtitle="Taskly uses the Lavender Fields theme.">
      <SettingsSection label="Theme">
        <SettingsRow label="Active theme" value="Lavender Fields" />
        <SettingsRow
          label="Mode"
          value={
            mode === "system"
              ? `System (${scheme === "dark" ? "Dark" : "Light"})`
              : scheme === "dark"
                ? "Dark"
                : "Light"
          }
          last
        />
      </SettingsSection>

      <SettingsSection label="Appearance">
        <View style={styles.segmented}>
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMode(m.key)}
                activeOpacity={0.8}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsSection>

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

const makeStyles = (P: Palette) => StyleSheet.create({
  segmented: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 14,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: P.border,
  },
  segmentActive: {
    backgroundColor: P.plum,
    borderColor: P.plum,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textMid,
    letterSpacing: 0.6,
  },
  segmentTextActive: { color: P.onAccent },
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
