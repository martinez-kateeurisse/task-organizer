import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import EditProfileModal from "../../components/EditProfileModal";
import { initials, streakLength } from "../../constants/data";
import { FONTS, onGradientAlpha, Palette } from "../../constants/theme";
import { usePreferences } from "../../context/PreferencesContext";
import { useStyles } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import { useTasks } from "../../context/TaskContext";
import { useToday } from "../../hooks/useToday";

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
// Three sections:
//   1. Profile header card
//   2. Reminders — each toggle is saved and schedules or cancels real
//      notifications (see PreferencesContext)
//   3. Settings list

// Each row maps to a screen in the app/settings stack
const SETTINGS = [
  { label: "Notifications", route: "/settings/notifications" },
  { label: "Appearance", route: "/settings/appearance" },
  { label: "Privacy", route: "/settings/privacy" },
  { label: "Help & Support", route: "/settings/help" },
  { label: "About Taskly", route: "/settings/about" },
] as const;

export default function ProfileScreen() {
  const { P, styles } = useStyles(makeStyles);
  const { profile } = useProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const { reminders, setReminderActive } = usePreferences();
  const { tasks } = useTasks();
  const today = useToday();
  const streak = streakLength(tasks, today);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile header card ─────────────────────────── */}
        <LinearGradient
          colors={[P.gradientFrom, P.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile.name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {profile.email || "No email set"}
            </Text>
            <View style={styles.badgeRow}>
              {streak > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🔥 {streak}-day streak</Text>
                </View>
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Pro</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setEditingProfile(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.editProfileBtn}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke={P.onGradient}
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Reminders section ───────────────────────────── */}
        <Text style={styles.sectionLabel}>Reminders</Text>

        {reminders.map((r) => (
          <View key={r.id} style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>{r.title}</Text>
              <Text style={styles.reminderMeta}>
                {r.time} · {r.days}
              </Text>
            </View>
            {/* Switch is RN's native toggle.
                onValueChange fires when the user flips it — setReminderActive
                saves the choice and schedules or cancels the OS notifications. */}
            <Switch
              value={r.active}
              onValueChange={(active) => setReminderActive(r.id, active)}
              trackColor={{ false: P.border, true: P.plum }}
              thumbColor={P.onGradient}
              ios_backgroundColor={P.border}
            />
          </View>
        ))}

        {/* ── Settings list ────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Settings</Text>

        {SETTINGS.map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
            style={styles.settingsRow}
          >
            <Text style={styles.settingsText}>{item.label}</Text>
            <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <Path
                d="M6 4l4 4-4 4"
                stroke={P.textSoft}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <EditProfileModal
        visible={editingProfile}
        onClose={() => setEditingProfile(false)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.lilac },
  content: { paddingHorizontal: 18, paddingBottom: 20 },

  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 28,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    shadowColor: P.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: P.sage + "CC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: onGradientAlpha(0.4),
    flexShrink: 0,
  },
  avatarText: { fontSize: 22, fontFamily: FONTS.serif, color: P.onGradient },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontFamily: FONTS.serif, color: P.onGradient },
  profileEmail: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: onGradientAlpha(0.7),
    marginTop: 2,
  },
  editProfileBtn: {
    alignSelf: "flex-start",
    backgroundColor: onGradientAlpha(0.18),
    borderRadius: 16,
    padding: 8,
    flexShrink: 0,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    backgroundColor: onGradientAlpha(0.18),
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.onGradient,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  reminderInfo: { flex: 1 },
  reminderTitle: {
    fontSize: 15,
    fontFamily: FONTS.serifSemi,
    color: P.textDark,
  },
  reminderMeta: {
    fontSize: 12,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 3,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansMed,
    color: P.textDark,
  },
});
