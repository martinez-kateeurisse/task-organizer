import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../constants/data";
import { CATEGORY, FONTS, P, PRIORITY } from "../constants/theme";

// ─── TASK ROW ─────────────────────────────────────────────────────────────────
// A tappable task card used on Dashboard and Calendar screens.
// TouchableOpacity replaces the web <div onClick> — it provides the press handler
// and a built-in opacity animation on tap (no extra Animated code needed).
//
// Props:
//   task     — the task object
//   onToggle — called with task.id when the user taps the card

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void; // called when the user taps ⋯ — passes the full task up
}

export default function TaskRow({ task, onToggle, onEdit }: Props) {
  const pr = PRIORITY[task.priority];
  const ca = CATEGORY[task.category] ?? { bg: P.plumLight, text: P.plum };

  return (
    <TouchableOpacity
      onPress={() => onToggle(task.id)}
      activeOpacity={0.75} // how faded the card looks while pressed
      style={[styles.row, task.done && styles.rowDone]}
    >
      {/* Circular checkbox — filled with plum when done */}
      <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
        {task.done && (
          // ✓ drawn as two lines via border trick — avoids needing an SVG icon
          <View style={styles.checkmark} />
        )}
      </View>

      {/* Small colored dot showing priority level */}
      <View style={[styles.priorityDot, { backgroundColor: pr.dot }]} />

      {/* Task title — line-through when done */}
      <Text
        style={[styles.title, task.done && styles.titleDone]}
        numberOfLines={1}
      >
        {task.title}
      </Text>

      {/* Category badge */}
      <View style={[styles.badge, { backgroundColor: ca.bg }]}>
        <Text style={[styles.badgeText, { color: ca.text }]}>
          {task.category}
        </Text>
      </View>

      {/* ⋯ menu button — tapping opens the EditTaskModal.
          stopPropagation is not needed here; onPress on a child doesn't bubble in RN */}
      <TouchableOpacity
        onPress={() => onEdit(task)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // expands the tap area without changing visual size
        style={styles.menuBtn}
      >
        <Text style={styles.menuDots}>⋯</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", // children sit side-by-side (RN defaults to column)
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: P.white,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1.5, // in RN, borders need width + color separately
    borderColor: P.border,
  },
  rowDone: {
    backgroundColor: P.lilac,
    opacity: 0.65,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11, // half of width/height = perfect circle
    borderWidth: 2,
    borderColor: P.lavender,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: P.plum,
    borderWidth: 0,
  },
  // Simple white checkmark using rotated borders
  checkmark: {
    width: 6,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "white",
    transform: [{ rotate: "45deg" }, { translateY: -1 }],
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  title: {
    flex: 1, // flex: 1 pushes the badge to the right edge
    fontSize: 15,
    fontFamily: FONTS.serif,
    color: P.textDark,
  },
  titleDone: {
    textDecorationLine: "line-through", // RN uses textDecorationLine, not textDecoration
    color: P.textSoft,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuBtn: {
    paddingLeft: 4,
  },
  menuDots: {
    fontSize: 18,
    color: P.textSoft,
    letterSpacing: -1,
  },
});
