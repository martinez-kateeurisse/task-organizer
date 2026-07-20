import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
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
import ManageCategoriesModal from "../../components/ManageCategoriesModal";
import type { Priority as PriorityType, Subtask } from "../../constants/data";
import { fmt, TODAY } from "../../constants/data";
import { categoryStyle, FONTS, P, PRIORITY } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── ADD TASK SCREEN ──────────────────────────────────────────────────────────
// Form to create a new task. On submit, calls addTask() from TaskContext,
// which appends the task to the shared list immediately across all tabs.

export default function AddTaskScreen() {
  const { addTask, categories } = useTasks();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<PriorityType>("medium");
  const [category, setCategory] = useState<string>(categories[0]?.name ?? "");
  const [dueDate, setDueDate] = useState<Date>(new Date(TODAY));
  const [showPicker, setShowPicker] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showManage, setShowManage] = useState(false);

  // If the selected category was renamed or deleted in the manage modal,
  // fall back to the first category so the form never holds a stale name
  useEffect(() => {
    if (!categories.some((c) => c.name === category)) {
      setCategory(categories[0]?.name ?? "");
    }
  }, [categories, category]);
  const [notes, setNotes] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Called by DateTimePicker when the user picks a date.
  // On Android the picker closes itself; on iOS we close it manually.
  function onDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) setDueDate(selected);
  }

  function addSubtask() {
    const t = subtaskInput.trim();
    if (t) setSubtasks((prev) => [...prev, { id: Date.now(), title: t, done: false }]);
    setSubtaskInput("");
  }

  function commitTag(raw: string) {
    const t = raw.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  // Typing a comma commits the tag immediately, like most tag inputs
  function onTagChange(text: string) {
    if (text.endsWith(",")) commitTag(text.slice(0, -1));
    else setTagInput(text);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority,
      category,
      date: fmt(dueDate),
      notes: notes.trim(),
      subtasks,
      tags,
    });
    setTitle("");
    setPriority("medium");
    setCategory(categories[0]?.name ?? "");
    setDueDate(new Date(TODAY));
    setNotes("");
    setSubtasks([]);
    setSubtaskInput("");
    setTags([]);
    setTagInput("");
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

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any extra details… (optional)"
            placeholderTextColor={P.textSoft}
            style={[styles.input, styles.notesInput]}
            multiline
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

        {/* Category toggle group — dynamic, with a link to manage categories */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, styles.labelInline]}>Category</Text>
            <TouchableOpacity
              onPress={() => setShowManage(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.manageLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.toggleRow, styles.wrapRow]}>
            {categories.map((cat) => {
              const cc = categoryStyle(cat.color);
              const active = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  activeOpacity={0.7}
                  style={[
                    styles.toggleBtn,
                    styles.catToggleBtn,
                    { borderColor: active ? cc.text : P.border },
                    active && { backgroundColor: cc.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      { color: active ? cc.text : P.textSoft },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
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

        {/* Subtasks — list of added items plus an inline add row */}
        <View style={styles.field}>
          <Text style={styles.label}>Subtasks</Text>
          {subtasks.map((st) => (
            <View key={st.id} style={styles.subtaskRow}>
              <Ionicons name="ellipse-outline" size={14} color={P.lavender} />
              <Text style={styles.subtaskText}>{st.title}</Text>
              <TouchableOpacity
                onPress={() =>
                  setSubtasks((prev) => prev.filter((s) => s.id !== st.id))
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={P.textSoft} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.inlineAddRow}>
            <TextInput
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              placeholder="Add a subtask…"
              placeholderTextColor={P.textSoft}
              style={[styles.input, styles.inlineAddInput]}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
              submitBehavior="submit"
            />
            <TouchableOpacity
              onPress={addSubtask}
              activeOpacity={0.7}
              style={styles.inlineAddBtn}
            >
              <Ionicons name="add" size={22} color={P.plum} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags — comma or return commits a chip; tap a chip to remove it */}
        <View style={styles.field}>
          <Text style={styles.label}>Tags</Text>
          {tags.length > 0 && (
            <View style={styles.tagsWrap}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() =>
                    setTags((prev) => prev.filter((t) => t !== tag))
                  }
                  activeOpacity={0.7}
                  style={styles.tagChip}
                >
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <Ionicons name="close" size={12} color={P.lavender} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TextInput
            value={tagInput}
            onChangeText={onTagChange}
            onSubmitEditing={() => commitTag(tagInput)}
            placeholder="Type a tag, press comma or return…"
            placeholderTextColor={P.textSoft}
            style={styles.input}
            returnKeyType="done"
            submitBehavior="submit"
            autoCapitalize="none"
          />
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

      <ManageCategoriesModal
        visible={showManage}
        onClose={() => setShowManage(false)}
      />
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelInline: { marginBottom: 0 },
  manageLink: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.lavender,
    letterSpacing: 0.5,
    textTransform: "uppercase",
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

  notesInput: {
    minHeight: 80,
    textAlignVertical: "top", // Android centers multiline text without this
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: P.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.serif,
    color: P.textDark,
  },
  inlineAddRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  inlineAddInput: { flex: 1 },
  inlineAddBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: P.plumLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: P.lavenderLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.lavender,
  },

  toggleRow: { flexDirection: "row", gap: 8 },
  wrapRow: { flexWrap: "wrap" },
  // flexBasis (not flex: 1) so rows actually wrap at ~3 buttons per line
  catToggleBtn: { flexBasis: "30%", flexGrow: 1 },
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
