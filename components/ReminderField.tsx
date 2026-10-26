import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONTS, Palette } from "../constants/theme";
import { useStyles } from "../context/ThemeContext";

// ─── REMINDER FIELD ───────────────────────────────────────────────────────────
// Picks the time of day a task's reminder fires. The date comes from the task's
// due date, so only a time is chosen here.
//
// value is 'HH:MM' 24-hour, or undefined for "no reminder".

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  // Shown alongside the time so it's clear which day the reminder lands on
  dueDate: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

// 'HH:MM' → a Date today at that time, for seeding the picker
function timeToDate(value?: string): Date {
  const d = new Date();
  if (value) {
    const [hh, mm] = value.split(":").map(Number);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) d.setHours(hh, mm, 0, 0);
  } else {
    d.setHours(9, 0, 0, 0); // sensible default for a fresh reminder
  }
  return d;
}

// 'HH:MM' → '9:00 AM' for display
export function formatReminder(value: string): string {
  const [hh, mm] = value.split(":").map(Number);
  const meridiem = hh < 12 ? "AM" : "PM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${pad(mm)} ${meridiem}`;
}

export default function ReminderField({ value, onChange, dueDate }: Props) {
  const { P, styles } = useStyles(makeStyles);
  const [showPicker, setShowPicker] = useState(false);

  // The clock is held in state rather than read during render, and ticks so
  // the "already passed" warning appears if the time slips by while the form
  // is open.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  function onTimeChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    // Android reports a dismissed picker rather than returning nothing
    if (event.type === "dismissed") return;
    if (selected) onChange(`${pad(selected.getHours())}:${pad(selected.getMinutes())}`);
  }

  const isPast =
    !!value &&
    (() => {
      const [hh, mm] = value.split(":").map(Number);
      const when = new Date(dueDate);
      when.setHours(hh, mm, 0, 0);
      return when.getTime() <= now;
    })();

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, styles.labelInline]}>Reminder</Text>
        {!!value && (
          <TouchableOpacity
            onPress={() => onChange(undefined)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearLink}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
        style={styles.btn}
      >
        <Ionicons
          name={value ? "notifications" : "notifications-outline"}
          size={16}
          color={value ? P.plum : P.textSoft}
        />
        <Text style={[styles.btnText, !value && styles.btnTextEmpty]}>
          {value ? formatReminder(value) : "No reminder"}
        </Text>
      </TouchableOpacity>

      {isPast && (
        <Text style={styles.warning}>
          This time has already passed — no notification will be scheduled.
        </Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={timeToDate(value)}
          mode="time"
          display={Platform.OS === "ios" ? "compact" : "default"}
          onChange={onTimeChange}
          accentColor={P.plum}
        />
      )}
    </View>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  field: { marginBottom: 22 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  labelInline: { marginBottom: 0 },
  clearLink: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.lavender,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: P.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  btnText: { fontSize: 15, fontFamily: FONTS.serif, color: P.textDark },
  btnTextEmpty: { color: P.textSoft },
  warning: {
    fontSize: 12,
    fontFamily: FONTS.sans,
    color: P.textMid,
    marginTop: 6,
  },
});
