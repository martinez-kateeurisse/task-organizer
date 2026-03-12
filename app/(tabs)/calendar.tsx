import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditTaskModal from "../../components/EditTaskModal";
import TaskRow from "../../components/TaskRow";
import { fmt, Task, TODAY } from "../../constants/data";
import { FONTS, P } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── CALENDAR SCREEN ──────────────────────────────────────────────────────────
// A full month grid. Days with tasks show a small lavender dot.
// Tapping a day selects it and shows that day's tasks below the grid.

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const { tasks, toggleTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(fmt(TODAY));
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = TODAY.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Build { 'YYYY-MM-DD': count } for dot rendering
  const taskCountByDate = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.date] = (acc[t.date] || 0) + 1;
    return acc;
  }, {});

  const selectedTasks = tasks.filter((t) => t.date === selectedDate);

  // Cells: leading nulls offset the first day to the right column; then day numbers
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Chunk cells into rows of 7 — CSS grid doesn't exist in RN, so we build rows manually
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>{monthName}</Text>
        </View>

        {/* Month grid card */}
        <View style={styles.gridCard}>
          {/* Day-of-week header */}
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map((d) => (
              <Text key={d} style={styles.dayLabel}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar rows — each is a flex row of 7 cells */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.calRow}>
              {row.map((day, ci) => {
                if (!day)
                  return <View key={`e${ci}`} style={styles.emptyCell} />;

                const dateStr = fmt(new Date(year, month, day));
                const isToday = dateStr === fmt(TODAY);
                const isSel = dateStr === selectedDate;
                const hasTasks = (taskCountByDate[dateStr] || 0) > 0;

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDate(dateStr)}
                    activeOpacity={0.7}
                    style={[
                      styles.dayCell,
                      isSel && { backgroundColor: P.plum },
                      isToday && !isSel && { backgroundColor: P.plumLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        isSel && { color: "white", fontFamily: FONTS.sansBold },
                        isToday &&
                          !isSel && {
                            color: P.plum,
                            fontFamily: FONTS.sansBold,
                          },
                      ]}
                    >
                      {day}
                    </Text>
                    {/* Task dot indicator */}
                    {hasTasks && (
                      <View
                        style={[
                          styles.taskDot,
                          {
                            backgroundColor: isSel
                              ? "rgba(255,255,255,0.7)"
                              : P.lavender,
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected day task list */}
        <View style={styles.dayHeader}>
          <View style={styles.dayAccent} />
          <Text style={styles.dayTitle}>
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedTasks.length}</Text>
          </View>
        </View>

        {selectedTasks.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyState}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/add-task")}
          >
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>No tasks for this day</Text>
            <Text style={styles.emptySubtitle}>Tap here to add one</Text>
          </TouchableOpacity>
        ) : (
          selectedTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={toggleTask}
              onEdit={setEditingTask}
            />
          ))
        )}

        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.lilac },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  header: { paddingTop: 28, marginBottom: 20 },
  title: { fontSize: 30, fontFamily: FONTS.serif, color: P.textDark },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 4,
  },

  gridCard: {
    backgroundColor: P.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: P.border,
    marginBottom: 20,
  },
  dayLabelsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  calRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  emptyCell: { flex: 1 },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
  },
  dayNum: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textDark,
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dayAccent: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: P.lavender,
  },
  dayTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: P.plumLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.plum,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: P.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    marginTop: 4,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginBottom: 4,
  },
  emptySubtitle: { fontSize: 13, fontFamily: FONTS.sans, color: P.textSoft },
});
