import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, P } from "../constants/theme";

// ─── SETTINGS SCAFFOLD ────────────────────────────────────────────────────────
// Shared shell for the settings detail screens: safe area, scroll container,
// and the card/label styles they all reuse.

export function SettingsScaffold({
  subtitle,
  children,
}: {
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

// A titled group of rows
export function SettingsSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </>
  );
}

// A single label/value line inside a section
export function SettingsRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// Explanatory paragraph — used where a screen needs prose rather than rows
export function SettingsNote({ children }: { children: ReactNode }) {
  return <Text style={styles.note}>{children}</Text>;
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.lilac },
  content: { paddingHorizontal: 18, paddingBottom: 40, paddingTop: 20 },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.sans,
    color: P.textMid,
    lineHeight: 21,
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: P.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: P.border },
  rowLabel: {
    fontSize: 14,
    fontFamily: FONTS.sansMed,
    color: P.textDark,
    flexShrink: 1,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: FONTS.sans,
    color: P.textMid,
    textAlign: "right",
    flexShrink: 1,
  },
  note: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textMid,
    lineHeight: 20,
    marginBottom: 14,
  },
});
