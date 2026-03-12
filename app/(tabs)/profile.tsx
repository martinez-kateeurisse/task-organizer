import { LinearGradient } from "expo-linear-gradient";
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
import { INITIAL_REMINDERS, Reminder } from "../../constants/data";
import { FONTS, P } from "../../constants/theme";
import { cancelReminder, scheduleReminder } from "../../utils/notifications";

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
// Three sections:
//   1. Profile header card
//   2. Reminders — each toggle schedules or cancels real notifications
//   3. Settings list

// notifIds stores the scheduled notification identifiers for each reminder.
// Shape: { [reminderId]: ['notif-uuid-1', 'notif-uuid-2', ...] }
// We need these to cancel the right notifications when a toggle is turned off.
type NotifIds = Record<number, string[]>;

const SETTINGS = [
  "Notifications",
  "Appearance",
  "Privacy",
  "Help & Support",
  "About Taskly",
];

export default function ProfileScreen() {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [notifIds, setNotifIds] = useState<NotifIds>({});

  async function toggleReminder(id: number) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    if (reminder.active) {
      // Turning OFF — cancel all notifications tied to this reminder
      const ids = notifIds[id] ?? [];
      await cancelReminder(ids);
      // Remove this reminder's ids from state
      setNotifIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      // Turning ON — schedule notifications and store the returned identifiers
      const ids = await scheduleReminder(
        reminder.title,
        reminder.time,
        reminder.days,
      );
      setNotifIds((prev) => ({ ...prev, [id]: ids }));
    }

    // Flip the active boolean in the reminders list
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile header card ─────────────────────────── */}
        <LinearGradient
          colors={[P.plum, "#7B52AB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MK</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Master Keyt</Text>
            <Text style={styles.profileEmail}>master.keyt@email.com</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔥 7-day streak</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Pro</Text>
              </View>
            </View>
          </View>
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
                onValueChange fires when the user flips it — we call toggleReminder
                which schedules or cancels the actual OS notification. */}
            <Switch
              value={r.active}
              onValueChange={() => toggleReminder(r.id)}
              trackColor={{ false: P.border, true: P.plum }}
              thumbColor="white"
              ios_backgroundColor={P.border}
            />
          </View>
        ))}

        {/* ── Settings list ────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Settings</Text>

        {SETTINGS.map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.7}
            style={styles.settingsRow}
          >
            <Text style={styles.settingsText}>{item}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: P.plum,
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
    borderColor: "rgba(255,255,255,0.4)",
    flexShrink: 0,
  },
  avatarText: { fontSize: 22, fontFamily: FONTS.serif, color: "white" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontFamily: FONTS.serif, color: "white" },
  profileEmail: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontFamily: FONTS.sansBold, color: "white" },

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
