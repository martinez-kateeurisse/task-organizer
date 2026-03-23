import { Ionicons } from "@expo/vector-icons";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Task } from "../constants/data";
import { CATEGORY, FONTS, P, PRIORITY } from "../constants/theme";

// ─── TASK DETAIL MODAL ────────────────────────────────────────────────────────
// Read-only bottom sheet showing a task's full details.
// Opened when the user taps ⋯ on a task row.
//
// Props:
//   task    — the task to display (null = modal hidden)
//   onClose — called when the modal should close

interface Props {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void; // opens EditTaskModal for this task
  onDelete: (task: Task) => void; // shows delete confirmation
}

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!task) return null;

  const pr = PRIORITY[task.priority];
  const ca = CATEGORY[task.category];
  const dateLabel = new Date(task.date + "T12:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Modal
      visible={task !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Task Details</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={P.textSoft} />
          </TouchableOpacity>
        </View>

        {/* Task title */}
        <Text style={styles.taskTitle}>{task.title}</Text>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: task.done ? P.sageLight : P.plumLight },
          ]}
        >
          <Ionicons
            name={task.done ? "checkmark-circle" : "time-outline"}
            size={14}
            color={task.done ? "#5C8040" : P.plum}
          />
          <Text
            style={[
              styles.statusText,
              { color: task.done ? "#5C8040" : P.plum },
            ]}
          >
            {task.done ? "Completed" : "Pending"}
          </Text>
        </View>

        {/* Detail rows */}
        <View style={styles.detailsCard}>
          {/* Priority */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <View style={[styles.detailBadge, { backgroundColor: pr.bg }]}>
              <View style={[styles.detailDot, { backgroundColor: pr.dot }]} />
              <Text style={[styles.detailBadgeText, { color: pr.text }]}>
                {pr.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={[styles.detailBadge, { backgroundColor: ca.bg }]}>
              <Text style={[styles.detailBadgeText, { color: ca.text }]}>
                {task.category}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Due date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>📅 {dateLabel}</Text>
          </View>
        </View>

        {/* Hint */}
        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                "Delete Task",
                `Are you sure you want to delete "${task.title}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      onDelete(task);
                      onClose();
                    },
                  },
                ],
              );
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#E53935" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => {
              onEdit(task);
              onClose();
            }}
          >
            <Ionicons name="pencil-outline" size={16} color={P.white} />
            <Text style={styles.editBtnText}>Edit Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: P.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: P.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: 26,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginBottom: 12,
    lineHeight: 32,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
  },
  detailsCard: {
    backgroundColor: P.lilac,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: FONTS.sansMed,
    color: P.textMid,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: P.border,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E53935",
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: "#E53935",
  },
  editBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: P.plum,
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: P.white,
  },
});
