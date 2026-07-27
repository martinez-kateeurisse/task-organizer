import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatReminder } from "../../components/ReminderField";
import {
  SettingsNote,
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "../../components/SettingsScaffold";
import { FONTS, Palette } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";
import { useStyles } from "../../context/ThemeContext";
import { requestPermission } from "../../utils/notifications";

// ─── NOTIFICATIONS SETTINGS ───────────────────────────────────────────────────
// Shows the real OS permission state and every task reminder currently set,
// so a user who isn't getting notifications can see why.

export default function NotificationsSettings() {
  const { styles } = useStyles(makeStyles);
  const { tasks } = useTasks();
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { status: s } = await Notifications.getPermissionsAsync();
    setStatus(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleEnable() {
    const granted = await requestPermission();
    // Once permission is denied the OS stops showing the dialog, so the only
    // way back is the system settings app.
    if (!granted) Linking.openSettings();
    refresh();
  }

  const withReminders = tasks
    .filter((t) => t.reminderTime && !t.done)
    .sort((a, b) => (a.date + a.reminderTime!).localeCompare(b.date + b.reminderTime!));

  const granted = status === "granted";

  return (
    <SettingsScaffold subtitle="Taskly sends a notification at the time you set on a task's due date.">
      <SettingsSection label="Permission">
        <SettingsRow
          label="System permission"
          value={
            status === null
              ? "Checking…"
              : granted
                ? "Granted"
                : status === "denied"
                  ? "Denied"
                  : "Not asked yet"
          }
          last
        />
      </SettingsSection>

      {status !== null && !granted && (
        <>
          <SettingsNote>
            Reminders can&apos;t be delivered until notifications are allowed
            for Taskly.
          </SettingsNote>
          <TouchableOpacity
            onPress={handleEnable}
            activeOpacity={0.8}
            style={styles.enableBtn}
          >
            <Text style={styles.enableBtnText}>ENABLE NOTIFICATIONS</Text>
          </TouchableOpacity>
        </>
      )}

      <SettingsSection label={`Upcoming reminders (${withReminders.length})`}>
        {withReminders.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>
              No reminders set. Add one when creating or editing a task.
            </Text>
          </View>
        ) : (
          withReminders.map((t, i) => (
            <SettingsRow
              key={t.id}
              label={t.title}
              value={`${new Date(t.date + "T12:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )} · ${formatReminder(t.reminderTime!)}`}
              last={i === withReminders.length - 1}
            />
          ))
        )}
      </SettingsSection>
    </SettingsScaffold>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  enableBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: P.plum,
    alignItems: "center",
    marginBottom: 22,
  },
  enableBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: P.onAccent,
    letterSpacing: 1,
  },
  emptyRow: { paddingVertical: 16 },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    lineHeight: 19,
  },
});
