import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Category } from "../constants/data";
import { CATEGORY_COLORS, FONTS, P } from "../constants/theme";
import { useTasks } from "../context/TaskContext";

// ─── MANAGE CATEGORIES MODAL ──────────────────────────────────────────────────
// Bottom sheet for creating, renaming, recoloring, and deleting categories.
// Opened from the "Edit" link next to the Category label on the task forms.
//
// Props:
//   visible — whether the sheet is shown
//   onClose — called when the sheet should close

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ManageCategoriesModal({ visible, onClose }: Props) {
  const { categories, tasks, addCategory, updateCategory, deleteCategory } =
    useTasks();

  // editing = null means the form below the list adds a new category
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("plum");

  function resetForm() {
    setEditing(null);
    setName("");
    setColor("plum");
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const duplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editing?.id,
    );
    if (duplicate) {
      Alert.alert(
        "Duplicate name",
        `A category called "${trimmed}" already exists.`,
      );
      return;
    }
    if (editing) updateCategory(editing.id, { name: trimmed, color });
    else addCategory(trimmed, color);
    resetForm();
  }

  function handleDelete(cat: Category) {
    const fallback = categories.find((c) => c.id !== cat.id);
    if (!fallback) return;
    const count = tasks.filter((t) => t.category === cat.name).length;
    Alert.alert(
      "Delete Category",
      count > 0
        ? `${count} task${count === 1 ? "" : "s"} will move to "${fallback.name}".`
        : `Delete "${cat.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (editing?.id === cat.id) resetForm();
            deleteCategory(cat.id);
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={P.textSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Existing categories */}
          {categories.map((cat) => {
            const cc = CATEGORY_COLORS[cat.color] ?? CATEGORY_COLORS.plum;
            return (
              <View key={cat.id} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: cc.text }]} />
                <Text style={styles.catName}>{cat.name}</Text>
                <TouchableOpacity
                  onPress={() => startEdit(cat)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil" size={16} color={P.plum} />
                </TouchableOpacity>
                {/* The last remaining category can't be deleted */}
                {categories.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleDelete(cat)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={P.danger} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Add / edit form */}
          <Text style={styles.formLabel}>
            {editing ? `Edit "${editing.name}"` : "New Category"}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Category name…"
            placeholderTextColor={P.textSoft}
            style={styles.input}
            returnKeyType="done"
          />
          <View style={styles.swatchRow}>
            {Object.entries(CATEGORY_COLORS).map(([key, cc]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setColor(key)}
                activeOpacity={0.7}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: cc.bg,
                    borderColor: color === key ? cc.text : P.border,
                  },
                ]}
              >
                <View
                  style={[styles.swatchDot, { backgroundColor: cc.text }]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.btnRow}>
            {editing && (
              <TouchableOpacity
                onPress={resetForm}
                activeOpacity={0.7}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!name.trim()}
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            >
              <Text style={styles.saveBtnText}>
                {editing ? "Save" : "Add Category"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    maxHeight: "85%",
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

  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: P.lilac,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.serif,
    color: P.textDark,
  },

  formLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 14,
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
    marginBottom: 14,
  },
  swatchRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchDot: { width: 16, height: 16, borderRadius: 8 },

  btnRow: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: P.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: P.textMid,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: P.plum,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: P.border },
  saveBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: P.white,
    letterSpacing: 0.5,
  },
});
