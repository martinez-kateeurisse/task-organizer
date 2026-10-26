import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { initials } from "../constants/data";
import { FONTS, Palette } from "../constants/theme";
import { useStyles } from "../context/ThemeContext";
import { useProfile } from "../context/ProfileContext";

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
// Bottom sheet for editing the display name and email.
// Initials are derived from the name, so they are previewed here rather than
// being an editable field.
//
// Props:
//   visible — whether the sheet is shown
//   onClose — called when the sheet should close

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: Props) {
  const { P, styles } = useStyles(makeStyles);
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  // Re-seed the draft fields each time the sheet opens so a cancelled edit
  // doesn't leave stale text behind on the next open. Done during render, on
  // the closed → open transition, so the first frame shows the saved values.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  // A name is required; email is optional but must look like an address if given.
  const emailValid = trimmedEmail === "" || /^\S+@\S+\.\S+$/.test(trimmedEmail);
  const canSave = trimmedName.length > 0 && emailValid;

  function handleSave() {
    if (!canSave) return;
    updateProfile({ name: trimmedName, email: trimmedEmail });
    onClose();
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
          <Text style={styles.title}>Edit Profile</Text>
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
          {/* Live initials preview — shows what the avatar will become */}
          <View style={styles.previewRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {trimmedName || "Your name"}
              </Text>
              <Text style={styles.previewEmail} numberOfLines={1}>
                {trimmedEmail || "No email set"}
              </Text>
            </View>
          </View>

          <Text style={styles.formLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name…"
            placeholderTextColor={P.textSoft}
            style={styles.input}
            returnKeyType="next"
            autoCapitalize="words"
          />

          <Text style={styles.formLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={P.textSoft}
            style={[styles.input, !emailValid && styles.inputInvalid]}
            returnKeyType="done"
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={handleSave}
          />
          {!emailValid && (
            <Text style={styles.errorText}>
              That doesn&apos;t look like an email address.
            </Text>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!canSave}
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: P.overlay,
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

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: P.lilac,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: P.plum,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 18, fontFamily: FONTS.serif, color: P.white },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 17, fontFamily: FONTS.serif, color: P.textDark },
  previewEmail: {
    fontSize: 12,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 2,
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
  },
  inputInvalid: { borderColor: P.danger },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.sans,
    color: P.danger,
    marginTop: 6,
  },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 22 },
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
