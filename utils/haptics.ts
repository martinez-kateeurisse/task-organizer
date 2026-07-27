import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// ─── HAPTICS ──────────────────────────────────────────────────────────────────
// Thin wrappers so call sites express intent ("a task was deleted") rather than
// a feedback style, and so the whole app shares one vocabulary of taps.
//
// Web has no haptics engine, and a failed pulse should never break a mutation,
// so every call is guarded and swallowed.

const enabled = Platform.OS === "ios" || Platform.OS === "android";

function run(fn: () => Promise<void>) {
  if (!enabled) return;
  fn().catch(() => {});
}

// Completing is the rewarding action, so it gets a real impact; un-completing
// is a correction and gets the lighter selection tick.
export function taskToggled(done: boolean) {
  run(() =>
    done
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.selectionAsync(),
  );
}

export function taskDeleted() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function taskRestored() {
  run(() => Haptics.selectionAsync());
}

export function allTasksDone() {
  run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}
