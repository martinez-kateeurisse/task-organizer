import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { FONTS, Palette } from "../constants/theme";
import { useStyles } from "../context/ThemeContext";

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
// Shared by Dashboard and Calendar so both screens search identically.

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search tasks...",
}: Props) {
  const { P, styles } = useStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={16}
        color={P.textSoft}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={P.textSoft}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing" // iOS only — shows an X to clear
      />
      {/* Clear button for Android */}
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Ionicons name="close-circle" size={16} color={P.textSoft} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  icon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sans,
    color: P.textDark,
    padding: 0, // removes default TextInput padding on Android
  },
});
