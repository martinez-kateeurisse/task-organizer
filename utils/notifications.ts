import * as Notifications from "expo-notifications";

// ─── NOTIFICATION BEHAVIOUR ───────────────────────────────────────────────────
// This tells the app how to display a notification when it arrives while the
// app is already open (foreground). Without this, foreground notifications are
// silently ignored by default.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── PERMISSION ───────────────────────────────────────────────────────────────
// Asks the OS for permission to send notifications.
// Returns true if granted, false if denied.
// On iOS this shows a system dialog; on Android 13+ it does too.
export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── DAY MAPPING ──────────────────────────────────────────────────────────────
// Expo Notifications uses 1=Sunday, 2=Monday … 7=Saturday for weekly triggers.
// Each reminder's `days` string maps to an array of these numbers.
export const DAY_MAP: Record<string, number[]> = {
  "Every day": [1, 2, 3, 4, 5, 6, 7],
  "Mon – Fri": [2, 3, 4, 5, 6],
  "Sat & Sun": [7, 1],
};

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
// Schedules one weekly notification per day for a reminder.
// Returns an array of notification identifiers — we store these so we can
// cancel the exact notifications later when the toggle is turned off.
//
// A "weekly" trigger fires at the same time on the same weekday every week.
// For "Every day" we create 7 weekly triggers (one per day of the week).
export async function scheduleReminder(
  title: string,
  time: string, // format: "08:00 AM"
  days: string,
): Promise<string[]> {
  const [timePart, meridiem] = time.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Convert 12-hour time to 24-hour
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const weekdays = DAY_MAP[days] ?? [1, 2, 3, 4, 5, 6, 7];
  const identifiers: string[] = [];

  for (const weekday of weekdays) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌿 Taskly Reminder",
        body: title,
        sound: true,
      },
      // WeeklyTrigger fires at the specified hour/minute on the specified weekday every week
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
    identifiers.push(id);
  }

  return identifiers;
}

// ─── CANCEL ───────────────────────────────────────────────────────────────────
// Cancels all notifications for a reminder using the identifiers returned by scheduleReminder.
export async function cancelReminder(identifiers: string[]): Promise<void> {
  for (const id of identifiers) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
