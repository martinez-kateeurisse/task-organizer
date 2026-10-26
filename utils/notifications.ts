import * as Notifications from "expo-notifications";
import { Reminder, Task } from "../constants/data";

// ─── NOTIFICATION BEHAVIOUR ───────────────────────────────────────────────────
// This tells the app how to display a notification when it arrives while the
// app is already open (foreground). Without this, foreground notifications are
// silently ignored by default.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
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

// ─── PROFILE REMINDERS ────────────────────────────────────────────────────────
// Each reminder schedules one weekly notification per weekday it runs on.
// A "weekly" trigger fires at the same time on the same weekday every week, so
// "Every day" is 7 weekly triggers (one per day of the week).
//
// As with task reminders, the notification ids are derived — from the reminder
// id and weekday — rather than stored. Ids kept only in memory were lost on
// restart, leaving notifications that could never be cancelled.
const reminderSlotId = (reminderId: number, weekday: number) =>
  `taskly-reminder-${reminderId}-${weekday}`;

// Cancels every weekday slot the reminder could occupy, then schedules the
// days it runs on if it's active. Safe to call repeatedly.
export async function syncReminder(reminder: Reminder): Promise<void> {
  await Promise.all(
    [1, 2, 3, 4, 5, 6, 7].map((weekday) =>
      Notifications.cancelScheduledNotificationAsync(
        reminderSlotId(reminder.id, weekday),
      ).catch(() => {
        // Nothing scheduled in that slot — nothing to cancel.
      }),
    ),
  );
  if (!reminder.active) return;

  const [timePart, meridiem] = reminder.time.split(" "); // format: "08:00 AM"
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Convert 12-hour time to 24-hour
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const weekdays = DAY_MAP[reminder.days] ?? [1, 2, 3, 4, 5, 6, 7];

  try {
    for (const weekday of weekdays) {
      await Notifications.scheduleNotificationAsync({
        identifier: reminderSlotId(reminder.id, weekday),
        content: {
          title: "🌿 Taskly Reminder",
          body: reminder.title,
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
    }
  } catch {
    // Permission denied or scheduling unavailable — the toggle still saves.
  }
}

// ─── PER-TASK REMINDERS ───────────────────────────────────────────────────────
// A task's reminder fires once, at `reminderTime` on its due `date`.
//
// The notification id is derived from the task id rather than stored on the
// task. That makes scheduling idempotent: rescheduling overwrites the previous
// notification for that task, and cancelling never needs a lookup.
const taskReminderId = (taskId: number) => `taskly-task-${taskId}`;

// Combines 'YYYY-MM-DD' and 'HH:MM' into a local Date.
// Built from numeric parts rather than parsing a string, because
// `new Date('2026-07-20T09:00')` is treated as UTC on some engines.
export function reminderDate(date: string, time: string): Date | null {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export async function cancelTaskReminder(taskId: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(taskReminderId(taskId));
  } catch {
    // No notification scheduled under that id — nothing to cancel.
  }
}

// Cancels any existing reminder for the task, then schedules a fresh one if the
// task still warrants it. Completed tasks and past instants are skipped, so a
// task whose date has slipped by never fires a notification retroactively.
export async function syncTaskReminder(task: Task): Promise<void> {
  await cancelTaskReminder(task.id);

  if (!task.reminderTime || task.done) return;
  const when = reminderDate(task.date, task.reminderTime);
  if (!when || when.getTime() <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: taskReminderId(task.id),
      content: {
        title: "🌿 Task Reminder",
        body: task.title,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  } catch {
    // Permission denied or scheduling unavailable — the task itself still saves.
  }
}
