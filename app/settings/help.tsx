import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SettingsScaffold } from "../../components/SettingsScaffold";
import { FONTS, Palette } from "../../constants/theme";
import { usePreferences } from "../../context/PreferencesContext";
import { useStyles } from "../../context/ThemeContext";

// ─── HELP & SUPPORT ───────────────────────────────────────────────────────────
// Expandable FAQ. Tapping a question reveals its answer; only one is open at a
// time so the list stays scannable.

const FAQS = [
  {
    q: "How do I set a reminder?",
    a: "Open a task in the edit sheet and pick a time under Reminder. The notification fires at that time on the task's due date. Completing the task cancels it.",
  },
  {
    q: "Why didn't my reminder arrive?",
    a: "Check Settings → Notifications. If the system permission is denied, reminders can't be delivered. Reminders set for a time that has already passed are never scheduled.",
  },
  {
    q: "Can I add my own categories?",
    a: "Yes. Tap Edit beside the Category label on any task form. Renaming a category updates every task using it, and deleting one moves its tasks to another category.",
  },
  {
    q: "What does swiping a task do?",
    a: "Swipe a task row left to reveal Edit and Delete. Tapping the row toggles it complete, and the ⋯ button opens the full detail view.",
  },
  {
    q: "How does search work?",
    a: "Search looks at task titles, tags, and notes across every date — not just the day you're viewing. Active priority and status filters still apply to the results.",
  },
  {
    q: "Where is my data kept?",
    a: "Entirely on this device. See Settings → Privacy for the details.",
  },
];

export default function HelpSettings() {
  const { P, styles } = useStyles(makeStyles);
  const { resetOnboarding } = usePreferences();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SettingsScaffold subtitle="Answers to the questions that come up most.">
      {FAQS.map((faq, i) => {
        const expanded = open === i;
        return (
          <View key={faq.q} style={styles.card}>
            <TouchableOpacity
              onPress={() => setOpen(expanded ? null : i)}
              activeOpacity={0.7}
              style={styles.questionRow}
            >
              <Text style={styles.question}>{faq.q}</Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={P.textSoft}
              />
            </TouchableOpacity>
            {expanded && <Text style={styles.answer}>{faq.a}</Text>}
          </View>
        );
      })}

      {/* Clearing the flag sends the root layout back to the tour. */}
      <TouchableOpacity
        onPress={resetOnboarding}
        activeOpacity={0.8}
        style={styles.replayBtn}
      >
        <Ionicons name="refresh-outline" size={16} color={P.plum} />
        <Text style={styles.replayText}>REPLAY INTRO</Text>
      </TouchableOpacity>
    </SettingsScaffold>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  replayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  replayText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: P.plum,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: P.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: P.border,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansMed,
    color: P.textDark,
  },
  answer: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textMid,
    lineHeight: 20,
    paddingBottom: 16,
  },
});
