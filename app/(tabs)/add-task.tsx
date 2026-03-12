import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Category, Priority as PriorityType } from "../../constants/data";
import { fmt, TODAY } from "../../constants/data";
import { CATEGORY, FONTS, P, PRIORITY } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── ADD TASK SCREEN ──────────────────────────────────────────────────────────
// Form to create a new task. On submit, calls addTask() from TaskContext,
// which appends the task to the shared list immediately across all tabs.

export default function AddTaskScreen() {
  const { addTask } = useTasks();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<PriorityType>("medium");
  const [category, setCategory] = useState<Category>("Work");
  const [dueDate, setDueDate] = useState<Date>(new Date(TODAY));
  const [showPicker, setShowPicker] = useState(false);
  const [success, setSuccess] = useState(false);

  // Called by DateTimePicker when the user picks a date.
  // On Android the picker closes itself; on iOS we close it manually.
  function onDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) setDueDate(selected);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    addTask({ title: title.trim(), priority, category, date: fmt(dueDate) });
    setTitle("");
    setPriority("medium");
    setCategory("Work");
    setDueDate(new Date(TODAY));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2200);
  }

  const isReady = title.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>New Task</Text>
          <Text style={styles.subtitle}>What needs to get done?</Text>
        </View>

        {/* Success flash */}
        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Task added!</Text>
          </View>
        )}

        {/* Task name input */}
        <View style={styles.field}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Review project proposal…"
            placeholderTextColor={P.textSoft}
            style={styles.input}
            returnKeyType="done"
          />
        </View>

        {/* Priority toggle group */}
        <View style={styles.field}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.toggleRow}>
            {(["high", "medium", "low"] as PriorityType[]).map((p) => {
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
        </View>

        {/* Category toggle group */}
        <View style={styles.field}>
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
        </View>

        {/* Due date — tappable button that opens the native date picker */}
        <View style={styles.field}>
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
              minimumDate={new Date(TODAY)}
              accentColor={P.plum}
            />
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isReady}
          activeOpacity={isReady ? 0.8 : 1}
          style={[styles.submitBtn, !isReady && styles.submitBtnDisabled]}
        >
          <Text
            style={[styles.submitText, !isReady && styles.submitTextDisabled]}
          >
            ADD TASK
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.lilac },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  header: { paddingTop: 28, marginBottom: 28 },
  title: { fontSize: 30, fontFamily: FONTS.serif, color: P.textDark },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 4,
  },

  successBox: {
    backgroundColor: P.sageLight,
    borderWidth: 1.5,
    borderColor: P.sage + "90",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: "#4A7030",
  },

  field: { marginBottom: 22 },
  label: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: P.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: FONTS.serif,
    color: P.textDark,
  },
  dateBtn: {
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
  dateBtnIcon: { fontSize: 16 },
  dateBtnText: { fontSize: 15, fontFamily: FONTS.serif, color: P.textDark },

  toggleRow: { flexDirection: "row", gap: 8 },
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
  toggleText: { fontSize: 12, fontFamily: FONTS.sansBold, color: P.textSoft },

  submitBtn: {
    marginTop: 8,
    paddingVertical: 17,
    borderRadius: 18,
    backgroundColor: P.plum,
    alignItems: "center",
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: P.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: "white",
    letterSpacing: 1.2,
  },
  submitTextDisabled: { color: P.textSoft },
});
