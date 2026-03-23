import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Task } from "../constants/data";
import { CATEGORY, FONTS, P, PRIORITY } from "../constants/theme";
import { useTasks } from "../context/TaskContext";

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
  onEdit: (task: Task) => void;
  onDetail: (task: Task) => void; // opens the read-only detail modal
}

export default function TaskRow({ task, onToggle, onEdit, onDetail }: Props) {
  const pr = PRIORITY[task.priority];
  const ca = CATEGORY[task.category] ?? { bg: P.plumLight, text: P.plum };
  const { deleteTask } = useTasks();

  // Two action buttons revealed when the user swipes left
  function renderRightActions() {
    return (
      <View style={styles.actionsContainer}>
        {/* Edit button — opens the EditTaskModal */}
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="pencil" size={18} color={P.plum} />
          <Text style={styles.editActionText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete button — shows confirmation before deleting */}
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            Alert.alert(
              "Delete Task",
              `Are you sure you want to delete "${task.title}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteTask(task.id),
                },
              ],
            );
          }}
        >
          <Ionicons name="trash" size={18} color="#E53935" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        activeOpacity={0.75}
        style={[styles.row, task.done && styles.rowDone]}
      >
        {/* Circular checkbox — filled with plum when done */}
        <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
          {task.done && <View style={styles.checkmark} />}
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

        {/* ⋯ button — opens read-only task details */}
        <TouchableOpacity
          onPress={() => onDetail(task)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.menuBtn}
        >
          <Text style={styles.menuDots}>⋯</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
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
  dateBadge: {
    backgroundColor: P.lilac,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dateBadgeOverdue: {
    backgroundColor: "#FDECEA", // light red background
  },
  dateBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
  },
  dateBadgeTextOverdue: {
    color: "#C0392B", // red text for overdue
  },
  menuBtn: {
    paddingLeft: 4,
  },
  menuDots: {
    fontSize: 18,
    color: P.textSoft,
    letterSpacing: -1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
    marginBottom: 8,
  },
  editAction: {
    backgroundColor: P.plumLight,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 16,
    gap: 4,
  },
  editActionText: {
    color: P.plum,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
  },
  deleteAction: {
    backgroundColor: "#FDECEA",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 16,
    gap: 4,
  },
  deleteActionText: {
    color: "#E53935",
    fontFamily: FONTS.sansBold,
    fontSize: 11,
  },
});
