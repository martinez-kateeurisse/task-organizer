import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Category, fmt, Priority, Task } from "../constants/data";
import { CATEGORY, FONTS, P, PRIORITY } from "../constants/theme";
import { useTasks } from "../context/TaskContext";

// ─── EDIT TASK MODAL ──────────────────────────────────────────────────────────
// Slides up over the current screen when the user taps ⋯ on a task row.
// Pre-fills all fields with the task's current values.
// On save it calls updateTask(); on delete it shows a confirmation then calls deleteTask().
//
// Props:
//   task     — the task being edited (null = modal is hidden)
//   onClose  — called when the modal should close (save, delete, or cancel)

interface Props {
  task: Task | null;
  onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: Props) {
  const { updateTask, deleteTask } = useTasks();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("Work");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Pre-fill all fields when a task is passed in.
  // Adding T12:00:00 prevents timezone shift that can move the date back by one day.
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(new Date(task.date + "T12:00:00"));
      setShowPicker(false);
    }
  }, [task]);

  function onDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) setDueDate(selected);
  }

  function handleSave() {
    if (!title.trim() || !task) return;
    updateTask(task.id, {
      title: title.trim(),
      priority,
      category,
      date: fmt(dueDate),
    });
    onClose();
  }

  function handleDelete() {
    if (!task) return;
    // Alert.alert shows a native confirmation dialog before deleting
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTask(task.id);
            onClose();
          },
        },
      ],
    );
  }

  return (
    // visible controls whether it shows; animationType="slide" makes it rise from the bottom
    <Modal
      visible={task !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Semi-transparent backdrop — tapping it closes the modal */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        {/* Drag handle — visual hint that this is a bottom sheet */}
        <View style={styles.handle} />

        {/* Header row */}
        <View style={styles.header}>
          <Text style={styles.title}>Edit Task</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Task name */}
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor={P.textSoft}
          returnKeyType="done"
        />

        {/* Priority toggle */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.toggleRow}>
          {(["high", "medium", "low"] as Priority[]).map((p) => {
            const ps = PRIORITY[p];
            const active = priority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
                style={[
                  styles.toggleBtn,
                  { borderColor: active ? ps.dot : P.border },
                  active && { backgroundColor: ps.bg },
                ]}
              >
                <View
                  style={[
                    styles.toggleDot,
                    { backgroundColor: active ? ps.dot : P.border },
                  ]}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: active ? ps.text : P.textSoft },
                  ]}
                >
                  {ps.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category toggle */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.toggleRow}>
          {(["Work", "Personal", "Health"] as Category[]).map((cat) => {
            const cc = CATEGORY[cat];
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.toggleBtn,
                  { borderColor: active ? cc.text : P.border },
                  active && { backgroundColor: cc.bg },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: active ? cc.text : P.textSoft },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Due date — tappable button that opens the native picker */}
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
          style={styles.dateBtn}
        >
          <Text style={styles.dateBtnIcon}>📅</Text>
          <Text style={styles.dateBtnText}>
            {dueDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        {/* Only mount the picker when needed */}
        {showPicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onChange={onDateChange}
            accentColor={P.plum}
          />
        )}

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!title.trim()}
            style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
          >
            <Text style={styles.saveBtnText}>Save</Text>
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
    marginBottom: 20,
  },
  title: { fontSize: 24, fontFamily: FONTS.serif, color: P.textDark },
  cancelText: { fontSize: 14, fontFamily: FONTS.sansMed, color: P.textSoft },

  label: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: P.lilac,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginBottom: 18,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: P.lilac,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 18,
  },
  dateBtnIcon: { fontSize: 16 },
  dateBtnText: { fontSize: 15, fontFamily: FONTS.serif, color: P.textDark },

  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  toggleDot: { width: 7, height: 7, borderRadius: 4 },
  toggleText: { fontSize: 12, fontFamily: FONTS.sansBold },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  deleteBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E57373",
    alignItems: "center",
  },
  deleteBtnText: { fontSize: 14, fontFamily: FONTS.sansBold, color: "#E57373" },
  saveBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: P.plum,
    alignItems: "center",
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: {
    backgroundColor: P.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: "white",
    letterSpacing: 0.5,
  },
});
